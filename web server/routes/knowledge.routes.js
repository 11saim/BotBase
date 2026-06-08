const express = require("express");
const router = express.Router({ mergeParams: true });
const upload = require("../middlewares/upload");
const controller = require("../controllers/knowledge.controller");

// GET /api/bots/:botId/knowledge
router.get("/", controller.getAllSources);

// POST /api/bots/:botId/knowledge/pdf
router.post("/pdf", upload.single("file"), controller.uploadPDF);

// POST /api/bots/:botId/knowledge/text
router.post("/text", controller.uploadText);

// PATCH /api/bots/:botId/knowledge/:id/status
router.patch("/:id/status", controller.updateStatus);

// DELETE /api/bots/:botId/knowledge/:id
router.delete("/:id", controller.deleteSource);

module.exports = router;