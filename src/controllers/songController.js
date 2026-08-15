import songs from "../db_services/songs.js";
import cloudinaryStorage from "../utils/cloudinaryStorage.js";
import rbac from "../config/roles.js";

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

    const song = await songs.create({
      title: req.body.title,
      artist: req.body.artist,
      description: req.body.description,
      durationSec: req.body.durationSec,
      isPublic: req.user.userRole === ROLES.ADMIN, // admins publish immediately; everyone else starts private
      albumId: req.body.albumId,
      audioUrl: audioUploadResult.secure_url,
      audioPublicId: audioUploadResult.public_id,
      imageUrl: imageUploadResult?.secure_url,
      imagePublicId: imageUploadResult?.public_id,
      uploaderId: req.user.userId,
    });

    res.status(201).json(song);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch song" });
  }
}

async function listPublicSongs(req, res) {
  try {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 50;
    const result = await songs.getPublic({ skip, take });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
}

async function listMySongs(req, res) {
  try {
    const result = await songs.getByUploader(req.user.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your songs" });
  }
}

// req.song is pre-fetched and ownership/permission-checked by authorizeSongAccess("update")
async function updateSong(req, res) {
  try {
    const updated = await songs.update(req.song.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: "Failed to delete song" });
  }
}

// req.song is pre-fetched and permission-checked by authorizeSongAccess("publish")
async function setSongPublic(req, res) {
  try {
    const updated = await songs.setPublic(req.song.id, req.body.isPublic);
    res.json(updated);
  } catch (err) {
    console.error(err);
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