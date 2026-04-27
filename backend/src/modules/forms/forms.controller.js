const formService = require("./forms.service");

const create = async (req, res, next) => {
  try {
    const form = await formService.createForm(
      req.user.userId,
      req.body
    );
    res.status(201).json(form);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { page, limit, search, sort, status } = req.query;
    const result = await formService.getUserForms(req.user.userId, { page, limit, search, sort, status });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const form = await formService.getFormById(req.params.id, req.user.userId);
    res.json(form);
  } catch (err) {
    next(err);
  }
};

const getPublic = async (req, res, next) => {
  try {
    const form = await formService.getPublicForm(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json(form);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    console.log("UPDATE FORM REQUEST:", req.params.id);
    console.log("UPDATE BODY:", JSON.stringify(req.body, null, 2)); // Log the body
    const form = await formService.updateForm(
      req.params.id,
      req.user.userId,
      req.body
    );
    res.json(form);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await formService.deleteForm(req.params.id, req.user.userId);
    res.json({ message: "Vellum deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getPublic, update, remove, getOne };
