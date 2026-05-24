const mongoose = require("mongoose");

const knowledgeSourceSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
      index: true,
    },
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
    type: {
      type: String,
      enum: ["pdf", "text"],
      required: true,
    },

    // Type-specific fields
    filePath: { type: String, default: null }, // disk path for pdf uploads
    rawText: { type: String, default: null }, // for plain text type

    // FAISS index file for this bot (shared across all sources of the bot)
    // Path format: /storage/faiss/{botId}.index
    faissPath: { type: String, default: null },

    status: {
      type: String,
      enum: ["active", "paused", "deleted"],
      default: "active"
    },
    errorMsg: {
      type: String,
      default: null,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KnowledgeSource", knowledgeSourceSchema);
