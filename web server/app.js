const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const app = express();

const startCleanupJob = require("./jobs/M   arkEnd");

// Starts cron job to auto-end conversations, that haven't had activity for 35+ mins
startCleanupJob();

app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const botRoutes = require("./routes/bot.routes");
const knowledgeRoutes = require("./routes/knowledge.routes");
const conversationRoutes = require("./routes/conversation.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const chatRoutes = require("./routes/chat.routes");

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Protected routes — auth middleware goes here later
app.use("/api/user", userRoutes);
app.use("/api/bots", botRoutes);
app.use("/api/bots/:botId/knowledge", knowledgeRoutes);
app.use("/api/bots/:botId/conversations", conversationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─── Global error handler — must be last ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;