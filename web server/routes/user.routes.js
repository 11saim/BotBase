const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// PATCH /api/user/profile    → update name
router.patch("/profile", userController.updateProfile);

// PATCH /api/user/password   → change password
router.patch("/password", userController.changePassword);

// DELETE /api/user           → delete account
router.delete("/", userController.deleteAccount);

module.exports = router;
