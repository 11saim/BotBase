const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth");
const { validateRegister, validateLogin } = require("../validators/auth.validator");

// POST /api/auth/register
router.post("/register", validateRegister, authController.register);

// POST /api/auth/login
router.post("/login", validateLogin, authController.login);

// POST /api/auth/logout
router.post("/logout", authController.logout);

// GET /api/auth/me
router.get("/me", protect, authController.me);

module.exports = router;