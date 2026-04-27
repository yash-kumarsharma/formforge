const prisma = require("../../config/db");

const createForm = async (userId, data) => {
  const { title, description, questions } = data;
  return prisma.form.create({
    data: {
      title: title || "Untitled form",
      description,
      ownerId: userId,
      questions: {
        create: questions?.map((q, index) => ({
          type: q.type,
          label: q.label,
          required: q.required || false,
          options: q.options || [],
          order: index
        }))
      }
    },
    include: { questions: true }
  });
};

const getUserForms = async (userId, { page = 1, limit = 10, search, sort = 'newest', status = 'all' }) => {
  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  // Sorting logic
  let orderBy = { createdAt: 'desc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  if (sort === 'az' || sort === 'a-z') orderBy = { title: 'asc' };
  if (sort === 'za' || sort === 'z-a') orderBy = { title: 'desc' };

  // Filtering logic
  const where = {
    ownerId: userId,
    deletedAt: null,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(status !== 'all' && {
      isPublic: status === 'live'
    })
  };

  const [forms, total] = await prisma.$transaction([
    prisma.form.findMany({
      where,
      include: {
        _count: {
          select: { responses: true }
        }
      },
      orderBy,
      skip,
      take
    }),
    prisma.form.count({ where })
  ]);

  return {
    forms,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const deleteForm = async (id, userId) => {
  // Verify ownership
  const existing = await prisma.form.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== userId) {
    throw new Error("Form not found or unauthorized");
  }

  // Soft delete
  return prisma.form.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};

const getPublicForm = async (id) => {
  return prisma.form.findFirst({
    where: { id, isPublic: true },
    include: { questions: true }
  });
};

const getFormById = async (id, userId) => {
  const form = await prisma.form.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: 'asc' } } }
  });
  if (!form || form.ownerId !== userId) {
    throw new Error("Form not found or unauthorized");
  }
  return form;
};

const updateForm = async (id, userId, data) => {
  const { title, description, questions, isPublic } = data;
  console.log("SERVICE UPDATE DATA:", { title, description, isPublic, questionsCount: questions?.length }); // Log data

  // Verify ownership
  const existing = await prisma.form.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== userId) {
    throw new Error("Form not found or unauthorized");
  }

  return prisma.$transaction(async (tx) => {
    // Update form basic info
    const updatedForm = await tx.form.update({
      where: { id },
      data: { title, description, isPublic }
    });

    if (questions) {
      // For simplicity in this implementation, we'll replace existing questions
      // A more robust approach would be to diff them, but for FormBuilder's 'Save' flow, replacement is often cleaner
      await tx.question.deleteMany({ where: { formId: id } });

      for (const [index, q] of questions.entries()) {
        await tx.question.create({
          data: {
            formId: id,
            type: q.type,
            label: q.label,
            required: q.required || false,
            options: q.options || [],
            order: index
          }
        });
      }
    }

    return tx.form.findUnique({
      where: { id },
      include: { questions: true }
    });
  });
};

module.exports = { createForm, getUserForms, getPublicForm, updateForm, deleteForm, getFormById };
