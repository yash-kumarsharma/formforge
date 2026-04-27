const ExcelJS = require("exceljs");
const prisma = require("../../config/db");

const exportResponsesToExcel = async (formId) => {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: true
    }
  });


  if (!form) throw new Error("Form not found");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Responses");

  // Header row
  const headers = [
    "Submitted At",
    ...form.questions.map(q => q.label)
  ];
  sheet.addRow(headers);

  // Data rows
  form.responses.forEach(response => {
    const row = [
      response.createdAt.toISOString(),
      ...form.questions.map(q => {
        const value = response.answers[q.id];
        return Array.isArray(value) ? value.join(", ") : value ?? "";
      })
    ];
    sheet.addRow(row);
  });

  return workbook;
};

module.exports = { exportResponsesToExcel };
