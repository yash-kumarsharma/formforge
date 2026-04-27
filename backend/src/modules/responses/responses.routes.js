const express = require("express");
const router = express.Router();
const controller = require("./responses.controller");
const auth = require("../../middlewares/auth.middleware");
const { responseValidation } = require("../../middlewares/validation.middleware");

// Public submission (NO AUTH)
router.post("/:formId", responseValidation.submit, controller.submit);

// Admin-only view
router.get("/:formId", auth, responseValidation.list, controller.list);

// Delete response
router.delete("/:id", auth, responseValidation.delete, controller.remove);

module.exports = router;
