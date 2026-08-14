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
    ...publicUserSelect 
  });
}

async function getAllUsers() {
  return prisma.user.findMany({ 
    ...publicUserSelect 
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

export { findUserByEmail, getUserById, getAllUsers, createUser, updateLastLogin };