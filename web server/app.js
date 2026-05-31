const express = require("express");
const app = express();

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const botRoutes = require("./routes/bot.routes");
const knowledgeRoutes = require("./routes/knowledge.routes");
const conversationRoutes = require("./routes/conversation.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const chatRoutes = require("./routes/chat.routes");

// Public routes — no auth needed
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Protected routes — auth middleware will go here later
app.use("/api/user", userRoutes);
app.use("/api/bots", botRoutes);
app.use("/api/bots/:botId/knowledge", knowledgeRoutes);
app.use("/api/bots/:botId/conversations", conversationRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
