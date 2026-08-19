import albums from "../db_services/albums.js";
import cloudinaryStorage from "../utils/cloudinaryStorage.js";
import songs from "../db_services/songs.js";
import rbac from "../config/roles.js";
import emailService from "../mailing/emailService.js";
import notificationService from "../db_services/notificationService.js";
import {getAllUsers} from "../db_services/userService.js";

const { ROLES } = rbac;


async function createAlbum(req, res) {
  try {
    const imageFile = req.file;
    let imageUpload = null;

    if (imageFile) {
      imageUpload = await cloudinaryStorage.uploadBuffer(imageFile.buffer, {
        folder: "muse/albums/covers",
        resourceType: "image",
      });
    }

    const isPublic = req.user.userRole === ROLES.ADMIN; // admins publish immediately; everyone else starts private

    const album = await albums.create({
      title: req.body.title,
      artist: req.body.artist,
      description: req.body.description,
      bgColor: req.body.bgColor,
      isPublic,
      imageUrl: imageUpload?.secure_url,
      imagePublicId: imageUpload?.public_id,
      uploaderId: req.user.userId,
    });

    res.status(201).json(album);

    queueMicrotask(async () => {
      try {
        if (req.user.userRole === ROLES.ADMIN) {
          const allUsers = await getAllUsers();
          const userIds = allUsers.map((u) => u.id);
          const recipientEmails = allUsers.map((u) => u.email).filter(Boolean);

          await Promise.allSettled([
            notificationService.createNotificationForMany(userIds, {
              type: "new_album",
              title: "New Album",
              message: `${album.artist} just released the album "${album.title}"`,
              albumId: album.id,
            }),
            recipientEmails.length > 0
              ? emailService.sendNewAlbumNotification(recipientEmails, album)
              : Promise.resolve(),
          ]);
        } else if (req.user.userRole === ROLES.USER) {
          await notificationService.createNotification({
            userId: album.uploaderId,
            type: "new_album",
            title: "New Album",
            message: `You just uploaded the album "${album.title}"`,
            albumId: album.id,
          });
        }
      } catch (err) {
        console.error("Failed executing post-creation background tasks:", err);
      }
    });
  } catch (err) {
    console.error("Create album error:", err);
    res.status(500).json({ error: "Failed to create album" });
  }
}

async function getAlbum(req, res) {
  try {
    const album = await albums.getByIdWithSongs(req.params.id);
    if (!album) return res.status(404).json({ error: "Album not found" });

    const isOwner = album.uploaderId === req.user?.userId;
    if (!album.isPublic && !isOwner) {
      return res.status(404).json({ error: "Album not found" });
    }

    res.json(album);
  } catch (err) {
    console.error("Get album error:", err);
    res.status(500).json({ error: "Failed to fetch album" });
  }
}

async function listPublicAlbums(req, res) {
  try {
    const skip = Math.max(0, Number(req.query.skip) || 0);
    const take = Math.min(100, Math.max(1, Number(req.query.take) || 50));

    const result = await albums.getPublic({ skip, take });
    res.json(result);
  } catch (err) {
    console.error("List public albums error:", err);
    res.status(500).json({ error: "Failed to fetch albums" });
  }
}

async function listMyAlbums(req, res) {
  try {
    const result = await albums.getByUploader(req.user.userId);
    res.json(result);
  } catch (err) {
    console.error("List user albums error:", err);
    res.status(500).json({ error: "Failed to fetch your albums" });
  }
}

async function updateAlbum(req, res) {
  try {
    const { title, artist, description, bgColor } = req.body;
    const updated = await albums.update(req.album.id, {
      title,
      artist,
      description,
      bgColor,
    });

    res.json(updated);
  } catch (err) {
    console.error("Update album error:", err);
    res.status(500).json({ error: "Failed to update album" });
  }
}

async function deleteAlbum(req, res) {
  try {
    if (req.album.imagePublicId) {
      await cloudinaryStorage.destroyImage(req.album.imagePublicId);
    }
    await albums.remove(req.album.id);
    res.status(204).send();
  } catch (err) {
    console.error("Delete album error:", err);
    res.status(500).json({ error: "Failed to delete album" });
  }
}

async function setAlbumPublic(req, res) {
  try {
    const isPublic = req.body.isPublic === true || req.body.isPublic === "true";
    const updated = await albums.setPublic(req.album.id, isPublic);
    res.json(updated);
  } catch (err) {
    console.error("Set public error:", err);
    res.status(500).json({ error: "Failed to update album visibility" });
  }
}

async function addSongToAlbum(req, res) {
  try {
    const song = await songs.getById(req.body.songId);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const isSongOwner = song.uploaderId === req.user.userId;
    const isAdmin = req.user.userRole === ROLES.ADMIN;

    if (!isSongOwner && !isAdmin) {
      return res.status(403).json({ error: "You can only add songs you own to this album" });
    }

    const updated = await songs.update(song.id, { albumId: req.album.id });
    res.json(updated);
  } catch (err) {
    console.error("Add song to album error:", err);
    res.status(500).json({ error: "Failed to add song to album" });
  }
}

async function removeSongFromAlbum(req, res) {
  try {
    const song = await songs.getById(req.params.songId);

    if (!song || song.albumId !== req.album.id) {
      return res.status(404).json({ error: "Song not found in this album" });
    }

    const updated = await songs.update(song.id, { albumId: null });
    res.json(updated);
  } catch (err) {
    console.error("Remove song from album error:", err);
    res.status(500).json({ error: "Failed to remove song from album" });
  }
}

export default {
  createAlbum,
  getAlbum,
  listPublicAlbums,
  listMyAlbums,
  updateAlbum,
  deleteAlbum,
  setAlbumPublic,
  addSongToAlbum,
  removeSongFromAlbum,
};