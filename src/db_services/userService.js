import prisma from "../config/dbConnect.js";
import { Role } from "@prisma/client";

const publicUserSelect = {
  select: {
    id: true,
    firstname: true,
    lastname: true,
    email: true,
    phone: true,
    role: true,
    imageUrl: true,
    lastLogin: true,
    createdAt: true,
  },
};

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    ...publicUserSelect,
  });
}

async function getAllUsers() {
  return prisma.user.findMany({
    ...publicUserSelect,
  });
}

async function createUser(userData) {
  const { firstname, lastname, email, phone, passwordHash, role } = userData;

  return prisma.user.create({
    data: {
      firstname,
      lastname,
      email,
      phone,
      passwordHash,
      role: role || Role.user,
      lastLogin: new Date(), // Set on initial registration
    },
    ...publicUserSelect,
  });
}

// Helper to update last_login timestamp
async function updateLastLogin(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
    ...publicUserSelect,
  });
}

// Partial profile update — only defined fields are written
async function updateUser(userId, fields) {
  const { firstname, lastname, phone } = fields;

  const data = {};
  if (firstname !== undefined) data.firstname = firstname;
  if (lastname !== undefined) data.lastname = lastname;
  if (phone !== undefined) data.phone = phone;

  return prisma.user.update({
    where: { id: userId },
    data,
    ...publicUserSelect,
  });
}

async function updateUserAvatar(userId, { imageUrl, imagePublicId }) {
  return prisma.user.update({
    where: { id: userId },
    data: { imageUrl, imagePublicId },
    ...publicUserSelect,
  });
}

// Needed before overwriting an avatar, to clean up the old Cloudinary asset
async function getUserImagePublicId(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { imagePublicId: true },
  });
}

export {
  findUserByEmail,
  getUserById,
  getAllUsers,
  createUser,
  updateLastLogin,
  updateUser,
  updateUserAvatar,
  getUserImagePublicId,
};