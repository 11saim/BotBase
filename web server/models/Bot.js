const mongoose = require("mongoose");

const widgetConfigSchema = new mongoose.Schema(
  {
    // ─── Appearance ───────────────────────────
    themeColor: { type: String, default: "#4F46E5" },
    panelTheme: { type: String, enum: ["light", "dark"], default: "light" },
    chatFont: {
      type: String,
      enum: ["dm-sans", "inter", "nunito-sans", "source-serif", "georgia", "system-ui", "monospace"],
      default: "dm-sans"
    },

    // ─── Bot Avatar ───────────────────────────
    botAvatar: { type: String, default: "🤖" },

    // ─── Launcher ─────────────────────────────
    position: { type: String, enum: ["bottom-right", "bottom-left"], default: "bottom-right" },
    launcherSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    launcherShape: { type: String, enum: ["circle", "rounded", "square"], default: "circle" },
    tooltipText: { type: String, default: "Need help? Ask me!" },

    // ─── Chat Panel ───────────────────────────
    welcomeMessage: { type: String, default: "Hi! How can I help you today?" },
    inputPlaceholder: { type: String, default: "Type a message..." },
    responseStyle: {
      type: String,
      enum: ["formal", "friendly", "concise"],
      default: "friendly"
    },
    language: {
      type: String,
      enum: ["en", "es", "fr", "de"],
      default: "en"
    },

    // ─── Bot State Messages ───────────────────
    fallbackReply: { type: String, default: "I'm not sure about that. Please contact support." },
    pausedMessage: { type: String, default: "Bot is currently unavailable. Please try later." },
  },
  { _id: false }
);

const botSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    widgetConfig: {
      type: widgetConfigSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ["active", "paused", "locked", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bot", botSchema);