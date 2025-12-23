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

module.exports = { registerUser, loginUser };
