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
      trim: true, // e.g. "handbook.pdf" or "https://docs.example.com"
    },
    type: {
      type: String,
      enum: ["pdf", "url", "text"],
      required: true,
    },

    // Type-specific fields
    filePath:  { type: String, default: null }, // disk path for pdf uploads
    sourceUrl: { type: String, default: null }, // for url type
    rawText:   { type: String, default: null }, // for plain text type

    // FAISS index file for this bot (shared across all sources of the bot)
    // Path format: /storage/faiss/{botId}.index
    faissPath: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
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
