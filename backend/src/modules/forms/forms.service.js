const prisma = require("../../config/db");

const createForm = async (title, userId) => {
  return prisma.form.create({
    data: {
      title,
      ownerId: userId
    }
  });
};

const getUserForms = async (userId) => {
  return prisma.form.findMany({
    where: { ownerId: userId }
  });
};

module.exports = { createForm, getUserForms };
