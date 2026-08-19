import songs from "../db_services/songs.js";
import cloudinaryStorage from "../utils/cloudinaryStorage.js";
import playlists from "../db_services/playlists.js";
import rbac from "../config/roles.js";
import emailService from "../mailing/emailService.js";
import notificationService from "../db_services/notificationService.js";
import {getAllUsers} from "../db_services/userService.js";

const { ROLES } = rbac;

async function createPlaylist(req, res) {
  try {
    const imageFile = req.file;

    let imageUpload = null;
    if (imageFile) {
      imageUpload = await cloudinaryStorage.uploadBuffer(imageFile.buffer, {
        folder: "muse/playlists/covers",
        resourceType: "image",
      });
    }

    const isPublic = req.body.isPublic === "true" || req.body.isPublic === true;

    const playlist = await playlists.create({
      name: req.body.name,
      description: req.body.description,
      isPublic,
      imageUrl: imageUpload?.secure_url,
      imagePublicId: imageUpload?.public_id,
      ownerId: req.user.userId,
    });

    res.status(201).json(playlist);

    // Run background notifications safely
    queueMicrotask(async () => {
      try {
        if (req.user.userRole === ROLES.ADMIN) {
          const allUsers = await getAllUsers();
          const userIds = allUsers.map((u) => u.id);
          const recipientEmails = allUsers.map((u) => u.email).filter(Boolean);

          await Promise.allSettled([
            notificationService.createNotificationForMany(userIds, {
              type: "new_playlist",
              title: "New Playlist",
              message: `Muse just released the latest playlist "${playlist.name}"`,
              playlistId: playlist.id,
            }),
            recipientEmails.length > 0
              ? emailService.sendNewPlaylistNotification(recipientEmails, playlist)
              : Promise.resolve(),
          ]);
        } else if (req.user.userRole === ROLES.USER) {
          await notificationService.createNotification({
            userId: playlist.ownerId, // Fixed uploaderId -> ownerId
            type: "new_playlist",
            title: "New Playlist",
            message: `You just created the playlist "${playlist.name}"`,
            playlistId: playlist.id,
          });
        }
      } catch (err) {
        console.error("Failed executing post-creation background tasks:", err);
      }
    });
  } catch (err) {
    console.error("Create playlist error:", err);
    res.status(500).json({ error: "Failed to create playlist" });
  }
}

async function getPlaylist(req, res) {
  try {
    const playlist = await playlists.getByIdWithSongs(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const isOwner = playlist.ownerId === req.user?.userId;
    if (!playlist.isPublic && !isOwner) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.json(playlist);
  } catch (err) {
    console.error("Get playlist error:", err);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
}

async function listPublicPlaylists(req, res) {
  try {
    const skip = Math.max(0, Number(req.query.skip) || 0);
    const take = Math.min(100, Math.max(1, Number(req.query.take) || 50));

    const result = await playlists.getPublic({ skip, take });
    res.json(result);
  } catch (err) {
    console.error("List public playlists error:", err);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
}

async function listMyPlaylists(req, res) {
  try {
    const result = await playlists.getByOwner(req.user.userId);
    res.json(result);
  } catch (err) {
    console.error("List my playlists error:", err);
    res.status(500).json({ error: "Failed to fetch your playlists" });
  }
}

async function updatePlaylist(req, res) {
  try {
    const { name, description } = req.body;
    const updated = await playlists.update(req.playlist.id, { name, description });
    res.json(updated);
  } catch (err) {
    console.error("Update playlist error:", err);
    res.status(500).json({ error: "Failed to update playlist" });
  }
}

async function deletePlaylist(req, res) {
  try {
    if (req.playlist.imagePublicId) {
      await cloudinaryStorage.destroyImage(req.playlist.imagePublicId);
    }
    await playlists.remove(req.playlist.id);
    res.status(204).send();
  } catch (err) {
    console.error("Delete playlist error:", err);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
}

async function setPlaylistPublic(req, res) {
  try {
    const isPublic = req.body.isPublic === true || req.body.isPublic === "true";
    const updated = await playlists.setPublic(req.playlist.id, isPublic);
    res.json(updated);
  } catch (err) {
    console.error("Set playlist public error:", err);
    res.status(500).json({ error: "Failed to update playlist visibility" });
  }
}

async function addSongToPlaylist(req, res) {
  try {
    const song = await songs.getById(req.body.songId);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const isSongOwner = song.uploaderId === req.user.userId;
    if (!song.isPublic && !isSongOwner) {
      return res.status(403).json({ error: "Cannot add a private song you don't own" });
    }

    const entry = await playlists.addSong(req.playlist.id, req.body.songId);
    res.status(201).json(entry);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Song is already in this playlist" });
    }
    console.error("Add song to playlist error:", err);
    res.status(500).json({ error: "Failed to add song to playlist" });
  }
}

async function removeSongFromPlaylist(req, res) {
  try {
    await playlists.removeSong(req.playlist.id, req.params.songId);
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Song not found in this playlist" });
    }
    console.error("Remove song from playlist error:", err);
    res.status(500).json({ error: "Failed to remove song from playlist" });
  }
}

export default {
  createPlaylist,
  getPlaylist,
  listPublicPlaylists,
  listMyPlaylists,
  updatePlaylist,
  deletePlaylist,
  setPlaylistPublic,
  addSongToPlaylist,
  removeSongFromPlaylist,
};