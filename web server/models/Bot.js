const mongoose = require("mongoose");

const widgetConfigSchema = new mongoose.Schema(
  {
    // Launcher
    position: { type: String, enum: ["bottom-right", "bottom-left"], default: "bottom-right" },
    launcherSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    launcherShape: { type: String, enum: ["circle", "rounded", "square"], default: "circle" },
    launcherColor: { type: String, default: "#4F46E5" },
    tooltipText: { type: String, default: "Need help? Ask me!" },

    // Panel
    panelTheme: { type: String, enum: ["light", "dark"], default: "light" },
    chatFont: { type: String, enum: ["dm-sans", "inter", "nunito-sans", "source-serif", "georgia", "system-ui", "monospace"], default: "dm-sans" },
    accentColor: { type: String, default: "#4F46E5" }, // header & buttons

    // Chat
    welcomeMessage: { type: String, default: "Hi! How can I help you today?" },
    inputPlaceholder: { type: String, default: "Type a message..." },
    showPoweredBy: { type: Boolean, default: true },

    // Bot state
    pausedMessage: { type: String, default: "Bot is currently unavailable. Please try later." },
    fallbackReply: { type: String, default: "I'm not sure about that. Please contact support." },

    // Behavior
    responseStyle: { type: String, enum: ["formal", "friendly", "concise"], default: "friendly" },
    language: { type: String, enum: ["en", "es", "fr", "de"], default: "en" },
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
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    botAvatar: { type: String, default: "🤖" },
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