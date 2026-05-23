const mongoose = require("mongoose");

const widgetConfigSchema = new mongoose.Schema(
  {
    primaryColor:  { type: String, default: "#4F46E5" },
    position:      { type: String, enum: ["bottom-right", "bottom-left"], default: "bottom-right" },
    botAvatarUrl:  { type: String, default: null },
    launcherText:  { type: String, default: "Chat with us" },
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
    systemPrompt: {
      type: String,
      default: "You are a helpful assistant. Answer questions based on the provided knowledge base.",
    },
    welcomeMessage: {
      type: String,
      default: "Hi! How can I help you today?",
    },
    widgetConfig: {
      type: widgetConfigSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bot", botSchema);
