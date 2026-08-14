import prisma from "../config/dbConnect.js";

const publicUserSelect = {
  omit: { passwordHash: true },
};

async function findUserByEmail(email) {
  // Note: keep this one WITHOUT the omit — you need passwordHash here to verify login
  return prisma.user.findUnique({ where: { email } });
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, ...publicUserSelect });
}

async function getAllUsers() {
  return prisma.user.findMany({ ...publicUserSelect });
}

export { findUserByEmail, getUserById, getAllUsers };