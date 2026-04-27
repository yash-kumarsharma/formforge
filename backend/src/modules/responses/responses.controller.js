const service = require("./responses.service");

const submit = async (req, res, next) => {
  try {
    const response = await service.submitResponse(
      req.params.formId,
      req.body.answers
    );
    res.status(201).json({ message: "Response submitted", response });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const responses = await service.getFormResponses(req.params.formId);
    res.json(responses);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.deleteResponse(req.params.id, req.user.userId);
    res.json({ message: "Response deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { submit, list, remove };
