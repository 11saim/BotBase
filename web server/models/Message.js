const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    // Which knowledge chunks were used to generate this response
    // Stored as snippet text so it's readable without a separate lookup
    // Only populated on assistant messages
    sourceChunks: [
      {
        text:       { type: String },
        sourceId:   { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeSource" },
        sourceName: { type: String },
      },
    ],

    tokensUsed: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
