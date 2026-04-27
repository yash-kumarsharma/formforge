const prisma = require("../../config/db");
const { getIO } = require("../../config/socket");

const submitResponse = async (formId, answers) => {
  // Check if form exists and is public
  const form = await prisma.form.findUnique({
    where: { id: formId }
  });

  if (!form) {
    throw new Error("Form not found");
  }

  console.log(`Checking Form ${formId}: isPublic=${form.isPublic}`); // Debug log

  if (!form.isPublic) {
    throw new Error("This form is currently not accepting responses.");
  }

  const response = await prisma.response.create({
    data: { formId, answers }
  });

  // 🔥 Emit realtime update
  try {
    getIO().to(`form:${formId}`).emit("response:new", {
      formId,
      responseId: response.id
    });
  } catch (err) {
    console.error("Realtime update failed:", err.message);
  }

  return response;
};

const getFormResponses = async (formId) => {
  return prisma.response.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" }
  });
};

const deleteResponse = async (responseId, userId) => {
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: { form: true }
  });

  if (!response) {
    throw new Error("Response not found");
  }

  if (response.form.ownerId !== userId) {
    throw new Error("You are not authorized to delete this response");
  }

  return prisma.response.delete({
    where: { id: responseId }
  });
};

module.exports = { submitResponse, getFormResponses, deleteResponse };
