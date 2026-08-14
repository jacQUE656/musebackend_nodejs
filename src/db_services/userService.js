import prisma from "../config/dbConnect.js";

const publicUserSelect = {
  omit: { passwordHash: true },
};

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, ...publicUserSelect });
}

async function getAllUsers() {
  return prisma.user.findMany({ ...publicUserSelect });
}

async function createUser(userData) {
  const { firstname, lastname, email, phone, password } = userData;

  return prisma.user.create({
    data: {
      firstname,
      lastname,
      email,
      phone,
      passwordHash: password,
    },
    ...publicUserSelect,
  });
}

export { findUserByEmail, getUserById, getAllUsers, createUser };