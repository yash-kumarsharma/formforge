const prisma = require("../../config/db");
const { hashPassword, comparePassword } = require("../../utils/password");
const { generateToken } = require("../../utils/jwt");

const registerUser = async ({ email, password, name }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User already exists");

  const hashed = await hashPassword(password);

  return prisma.user.create({
    data: { email, password: hashed, name }
  });
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = generateToken({ userId: user.id });

  return { token, user };
};

const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true }
  });
};

const updateProfile = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true }
  });
};

const updatePassword = async (id, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  const match = await comparePassword(currentPassword, user.password);
  if (!match) throw new Error("Current password incorrect");

  const hashed = await hashPassword(newPassword);

  return prisma.user.update({
    where: { id },
    data: { password: hashed }
  });
};

module.exports = { registerUser, loginUser, getUserById, updateProfile, updatePassword };
