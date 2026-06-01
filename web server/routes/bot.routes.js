const express = require("express");
const router = express.Router();
const botController = require("../controllers/bot.controller");

// GET /api/bots → get all bots for logged in user
router.get("/", botController.getAllBots);

// POST /api/bots → create a new bot
router.post("/", botController.createBot);

// GET /api/bots/:id → get a single bot
router.get("/:id", botController.getBot);

// PATCH /api/bots/:id → update bot name, description
router.patch("/:id", botController.updateBot);

// PATCH /api/bots/:id/appearance → update widget config / appearance
router.patch("/:id/appearance", botController.updateAppearance);

// PATCH /api/bots/:id/status → pause or activate bot
router.patch("/:id/status", botController.updateStatus);

// DELETE /api/bots/:id → soft delete bot
router.delete("/:id", botController.deleteBot);

module.exports = router;
