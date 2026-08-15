import prisma from "../config/dbConnect.js";

async function getById(id) {
  return prisma.playlist.findUnique({ where: { id } });
}

async function getByIdWithSongs(id) {
  return prisma.playlist.findUnique({
    where: { id },
    include: { songEntries: { include: { song: true }, orderBy: { addedAt: "asc" } } },
  });
}

async function getAll({ skip = 0, take = 50 } = {}) {
  return prisma.playlist.findMany({ skip, take, orderBy: { createdAt: "desc" } });
}

async function getPublic({ skip = 0, take = 50 } = {}) {
  return prisma.playlist.findMany({
    where: { isPublic: true },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
}

async function getByOwner(ownerId, { skip = 0, take = 50 } = {}) {
  return prisma.playlist.findMany({
    where: { ownerId },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
}

async function create(data) {
  return prisma.playlist.create({ data });
}

async function update(id, data) {
  return prisma.playlist.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.playlist.delete({ where: { id } });
}

async function addSong(playlistId, songId) {
  return prisma.playlistSong.create({ data: { playlistId, songId } });
}

async function removeSong(playlistId, songId) {
  return prisma.playlistSong.delete({
    where: { playlistId_songId: { playlistId, songId } },
  });
}

async function setPublic(id, isPublic) {
  return prisma.playlist.update({ where: { id }, data: { isPublic } });
}

export default {
  getById, getByIdWithSongs, getAll, getPublic, getByOwner,
  create, update, remove, addSong, removeSong, setPublic,
};