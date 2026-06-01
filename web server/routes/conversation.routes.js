const express = require("express");
const router = express.Router({ mergeParams: true });
const conversationController = require("../controllers/conversation.controller");

// All routes scoped under /api/bots/:botId/conversations

// GET /api/bots/:botId/conversations → get all conversations for a bot
router.get("/", conversationController.getAllConversations);

// GET /api/bots/:botId/conversations/:id → get a single conversation with its messages
router.get("/:id", conversationController.getConversation);

// DELETE /api/bots/:botId/conversations/:id → delete a conversation
router.delete("/:id", conversationController.deleteConversation);

module.exports = router;
