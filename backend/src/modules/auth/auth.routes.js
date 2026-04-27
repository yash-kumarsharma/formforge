const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");
const auth = require("../../middlewares/auth.middleware");
const { authValidation } = require("../../middlewares/validation.middleware");

router.post("/register", authValidation.register, controller.register);
router.post("/login", authValidation.login, controller.login);
router.get("/me", auth, controller.getMe);
router.put("/profile", auth, authValidation.updateProfile, controller.updateProfile);
router.put("/password", auth, authValidation.updatePassword, controller.updatePassword);

module.exports = router;
