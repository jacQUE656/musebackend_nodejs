import songs from "../db_services/songs.js";
import cloudinaryStorage from "../utils/cloudinaryStorage.js";
import rbac from "../config/roles.js";
import emailService from "../mailing/emailService.js";
import notificationService from "../db_services/notificationService.js";
import users from "../db_services/userService.js";

const { ROLES } = rbac;

async function createSong(req, res) {
  try {
    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const audioUploadResult = await cloudinaryStorage.uploadBuffer(audioFile.buffer, {
      folder: "muse/songs/audio",
      resourceType: "video",
    });

    let imageUploadResult = null;

    if (imageFile) {
      imageUploadResult = await cloudinaryStorage.uploadBuffer(imageFile.buffer, {
        folder: "muse/songs/images",
        resourceType: "image",
      });
    }

    const durationSec = req.body.durationSec ? parseInt(req.body.durationSec, 10) : null;

    const song = await songs.create({
      title: req.body.title,
      artist: req.body.artist,
      description: req.body.description,
      durationSec,
      isPublic: req.user.userRole === ROLES.ADMIN, // admins publish immediately; everyone else starts private
      albumId: req.body.albumId || null,
      audioUrl: audioUploadResult.secure_url,
      audioPublicId: audioUploadResult.public_id,
      imageUrl: imageUploadResult?.secure_url,
      imagePublicId: imageUploadResult?.public_id,
      uploaderId: req.user.userId,
    });

    res.status(201).json(song);

    // Run background notifications safely
    queueMicrotask(async () => {
      try {
        if (req.user.userRole === ROLES.ADMIN) {
          const allUsers = await users.getAllUsers();
          const userIds = allUsers.map((u) => u.id);
          const recipientEmails = allUsers.map((u) => u.email).filter(Boolean);

          await Promise.allSettled([
            notificationService.createNotificationForMany(userIds, {
              type: "new_song",
              title: "New Song",
              message: `${song.artist} just released the song "${song.title}"`,
              songId: song.id,
            }),
            recipientEmails.length > 0
              ? emailService.sendNewSongNotification(recipientEmails, song)
              : Promise.resolve(),
          ]);
        } else if (req.user.userRole === ROLES.USER) {
          await notificationService.createNotification({
            userId: song.uploaderId,
            type: "new_song",
            title: "New Song",
            message: `You just uploaded the song "${song.title}"`,
            songId: song.id,
          });
        }
      } catch (err) {
        console.error("Failed executing post-creation background tasks:", err);
      }
    });
  } catch (err) {
    console.error("Create song error:", err);
    res.status(500).json({ error: "Failed to create song" });
  }
}

async function getSong(req, res) {
  try {
    const song = await songs.getById(req.params.id);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const isOwner = song.uploaderId === req.user?.userId;
    if (!song.isPublic && !isOwner) {
      return res.status(404).json({ error: "Song not found" });
    }

    res.json(song);
  } catch (err) {
    console.error("Get song error:", err);
    res.status(500).json({ error: "Failed to fetch song" });
  }
}

async function listPublicSongs(req, res) {
  try {
    const skip = Math.max(0, Number(req.query.skip) || 0);
    const take = Math.min(100, Math.max(1, Number(req.query.take) || 50));

    const result = await songs.getPublic({ skip, take });
    res.json(result);
  } catch (err) {
    console.error("List public songs error:", err);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
}

async function listMySongs(req, res) {
  try {
    const result = await songs.getByUploader(req.user.userId);
    res.json(result);
  } catch (err) {
    console.error("List my songs error:", err);
    res.status(500).json({ error: "Failed to fetch your songs" });
  }
}

// req.song is pre-fetched and ownership/permission-checked by authorizeSongAccess("update")
async function updateSong(req, res) {
  try {
    const { title, artist, description, durationSec, albumId } = req.body;
    const updateData = { title, artist, description, albumId };

    if (durationSec !== undefined) {
      updateData.durationSec = parseInt(durationSec, 10);
    }

    const updated = await songs.update(req.song.id, updateData);
    res.json(updated);
  } catch (err) {
    console.error("Update song error:", err);
    res.status(500).json({ error: "Failed to update song" });
  }
}

// req.song is pre-fetched and ownership/permission-checked by authorizeSongAccess("delete")
async function deleteSong(req, res) {
  try {
    await cloudinaryStorage.destroyAudio(req.song.audioPublicId);
    if (req.song.imagePublicId) {
      await cloudinaryStorage.destroyImage(req.song.imagePublicId);
    }
    await songs.remove(req.song.id);
    res.status(204).send();
  } catch (err) {
    console.error("Delete song error:", err);
    res.status(500).json({ error: "Failed to delete song" });
  }
}

// req.song is pre-fetched and permission-checked by authorizeSongAccess("publish")
async function setSongPublic(req, res) {
  try {
    const isPublic = req.body.isPublic === true || req.body.isPublic === "true";
    const updated = await songs.setPublic(req.song.id, isPublic);
    res.json(updated);
  } catch (err) {
    console.error("Set song public error:", err);
    res.status(500).json({ error: "Failed to update song visibility" });
  }
}

export default {
  createSong,
  getSong,
  listPublicSongs,
  listMySongs,
  updateSong,
  deleteSong,
  setSongPublic,
};