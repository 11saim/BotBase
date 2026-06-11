const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const { protect } = require("./middlewares/auth");
const app = express();

const startCleanupJob = require("./jobs/MarkEnd");

// Starts cron job to auto-end conversations, that haven't had activity for 35+ mins
startCleanupJob();

// Enable CORS for our client port (and support credentials/cookies)
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));

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

// Protected routes
app.use("/api/user", protect, userRoutes);
app.use("/api/bots", protect, botRoutes);
app.use("/api/bots/:botId/knowledge", protect, knowledgeRoutes);
app.use("/api/conversations", protect, conversationRoutes);
app.use("/api/bots/:botId/conversations", protect, conversationRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);

// ─── Global error handler — must be last ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;