const express = require("express");
const router = express.Router();
const controller = require("./forms.controller");
const auth = require("../../middlewares/auth.middleware");
const { formValidation } = require("../../middlewares/validation.middleware");

router.post("/", auth, formValidation.create, controller.create);
router.get("/", auth, controller.list);
router.get("/public/:id", formValidation.getOne, controller.getPublic);
router.get("/:id", auth, formValidation.getOne, controller.getOne);
router.put("/:id", auth, formValidation.update, controller.update);
router.delete("/:id", auth, formValidation.delete, controller.remove);

module.exports = router;

