import prisma from "../config/dbConnect.js";

async function getById(id) {
  return prisma.song.findUnique({ where: { id } });
}

async function getAll({ skip = 0, take = 50 } = {}) {
  return prisma.song.findMany({ skip, take, orderBy: { createdAt: "desc" } });
}

async function getPublic({ skip = 0, take = 50 } = {}) {
  return prisma.song.findMany({
    where: { isPublic: true },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
}

async function getByUploader(uploaderId, { skip = 0, take = 50 } = {}) {
  return prisma.song.findMany({
    where: { uploaderId },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
}

async function create(data) {
  return prisma.song.create({ data });
}

async function update(id, data) {
  return prisma.song.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.song.delete({ where: { id } });
}
// db/songs.js — add this function, keep everything else the same
async function setPublic(id, isPublic) {
  return prisma.song.update({ where: { id }, data: { isPublic } });
}

export default { getById, getAll, getPublic, getByUploader, create, update, remove, setPublic };