import albums from "../db_services/albums.js";
import cloudinaryStorage from "../utils/cloudinaryStorage.js";
import songs from "../db_services/songs.js"; 
import rbac from "../config/roles.js";

const { ROLES } = rbac; 

async function createAlbum(req, res) {
  try {
    const imageFile = req.file; // single cover image upload

    let imageUpload = null;
    if (imageFile) {
      imageUpload = await cloudinaryStorage.uploadBuffer(imageFile.buffer, {
        folder: "muse/albums/covers",
        resourceType: "image",
      });
    }

    const album = await albums.create({
      title: req.body.title,
      artist: req.body.artist,
      description: req.body.description,
      bgColor: req.body.bgColor,
      isPublic: req.body.isPublic,
      imageUrl: imageUpload?.secure_url,
      imagePublicId: imageUpload?.public_id,
      uploaderId: req.user.userId,
    });

    res.status(201).json(album);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch album" });
  }
}

async function listPublicAlbums(req, res) {
  try {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 50;
    const result = await albums.getPublic({ skip, take });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch albums" });
  }
}

async function listMyAlbums(req, res) {
  try {
    const result = await albums.getByUploader(req.user.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your albums" });
  }
}

async function updateAlbum(req, res) {
  try {
    const updated = await albums.update(req.album.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update album" });
  }
}

async function deleteAlbum(req, res) {
  try {
    if (req.album.imagePublicId) {
      await cloudinaryStorage.destroyImage(req.album.imagePublicId);
    }
    // Songs in this album have albumId set to null automatically via
    // the schema's onDelete: SetNull — they are not deleted.
    await albums.remove(req.album.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete album" });
  }
}

async function setAlbumPublic(req, res) {
  try {
    const updated = await albums.setPublic(req.album.id, req.body.isPublic);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update album visibility" });
  }
}

// req.album is pre-fetched and ownership-checked by authorizeAlbumAccess("update")
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
    console.error(err);
    res.status(500).json({ error: "Failed to add song to album" });
  }
}

// req.album is pre-fetched and ownership-checked by authorizeAlbumAccess("update")
async function removeSongFromAlbum(req, res) {
  try {
    const song = await songs.getById(req.params.songId);

    if (!song || song.albumId !== req.album.id) {
      return res.status(404).json({ error: "Song not found in this album" });
    }

    const updated = await songs.update(song.id, { albumId: null });
    res.json(updated);
  } catch (err) {
    console.error(err);
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