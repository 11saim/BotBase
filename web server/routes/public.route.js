const express = require("express");
const router = express.Router();
const botController = require("../controllers/public.controller");

router.get("/config/:id", botController.getPublicBotConfig);

module.exports = router;