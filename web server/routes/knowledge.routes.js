const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access botId from parent
const knowledgeController = require("../controllers/knowledge.controller");

// All routes are scoped under /api/bots/:botId/knowledge

// GET    /api/bots/:botId/knowledge          → get all sources for a bot
router.get("/", knowledgeController.getAllSources);

// POST   /api/bots/:botId/knowledge/pdf      → upload a PDF file
router.post("/pdf", knowledgeController.uploadPDF);

// POST   /api/bots/:botId/knowledge/text     → paste raw text
router.post("/text", knowledgeController.uploadText);

// PATCH  /api/bots/:botId/knowledge/:id/status  → pause or activate a source
router.patch("/:id/status", knowledgeController.updateStatus);

// DELETE /api/bots/:botId/knowledge/:id      → soft delete a source
router.delete("/:id", knowledgeController.deleteSource);

module.exports = router;
