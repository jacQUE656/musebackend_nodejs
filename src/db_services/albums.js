import prisma from "../config/dbConnect.js";

async function getById(id) {
  return prisma.album.findUnique({ where: { id } });
}

async function getByIdWithSongs(id) {
  return prisma.album.findUnique({ where: { id }, include: { songs: true } });
}

async function getAll({ skip = 0, take = 50 } = {}) {
  return prisma.album.findMany({ skip, take, orderBy: { createdAt: "desc" } });
}

async function getPublic({ skip = 0, take = 50 } = {}) {
  return prisma.album.findMany({
    where: { isPublic: true },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
}

async function getByUploader(uploaderId, { skip = 0, take = 50 } = {}) {
  return prisma.album.findMany({
    where: { uploaderId },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
}

async function create(data) {
  return prisma.album.create({ data });
}

async function update(id, data) {
  return prisma.album.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.album.delete({ where: { id } });
}
// db/albums.js — add this function
async function setPublic(id, isPublic) {
  return prisma.album.update({ where: { id }, data: { isPublic } });
}

export default { getById, getByIdWithSongs, getAll, getPublic, getByUploader, create, update, remove, setPublic };