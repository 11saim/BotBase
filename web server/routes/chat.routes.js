const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

// Public routes — no auth middleware

// POST /api/chat/start → start or resume a conversation
router.post("/start", chatController.startConversation);

// POST /api/chat/message → send a message, stream response via SSE
router.post("/message", chatController.sendMessage);

// POST /api/chat/ping → heartbeat every 5 mins while widget is open
router.post("/ping", chatController.ping);

module.exports = router;