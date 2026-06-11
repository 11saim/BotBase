const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// GET /api/dashboard/stats → total bots, messages, conversations counts
router.get("/stats", dashboardController.getStats);

// GET /api/dashboard/recent-activity → latest 20 activity log entries
router.get("/recent-activity", dashboardController.getRecentActivity);

// GET /api/dashboard/usage → current period usage + plan limits
router.get("/usage", dashboardController.getUsage);

// GET /api/dashboard/top-bots → get top performing bots
router.get("/top-bots", dashboardController.getTopBots);

module.exports = router;
