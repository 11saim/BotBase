const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

// These routes are PUBLIC — no auth middleware
// Called by the embedded widget on any website

// POST /api/chat/start              → start or resume a conversation
// Body: { botId, sessionId }
router.post("/start", chatController.startConversation);

// POST /api/chat/message            → send a message and get a response (SSE streaming)
// Body: { sessionId, message }
router.post("/message", chatController.sendMessage);

// POST /api/chat/end                → end a conversation (widget closed)
// Body: { sessionId }
router.post("/end", chatController.endConversation);

module.exports = router;
