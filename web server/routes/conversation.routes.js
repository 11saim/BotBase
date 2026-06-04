const express = require("express");
const router = express.Router({ mergeParams: true });
const conversationController = require("../controllers/conversation.controller");

// GET /api/conversations?botId=all&status=all&period=7d
router.get("/", conversationController.getAllConversations);

// GET /api/conversations/:id
router.get("/:id", conversationController.getConversation);

// DELETE /api/conversations/:id
router.delete("/:id", conversationController.deleteConversation);

module.exports = router;