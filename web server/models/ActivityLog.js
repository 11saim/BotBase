const mongoose = require("mongoose");

// ─── Event Type Constants ──────────────────────────────────────────────────────
const ACTIVITY_EVENTS = {
  // Bot lifecycle
  BOT_CREATED: "bot_created",             // New bot 'HR Helper' created
  BOT_UPDATED: "bot_updated",             // Bot 'Support Bot' settings updated
  BOT_DELETED: "bot_deleted",             // Bot 'Sales Bot' deleted

  // Knowledge base
  SOURCE_UPLOADED: "source_uploaded",         // PDF 'handbook.pdf' added to HR Helper
  SOURCE_READY: "source_ready",            // HR Helper knowledge base is ready
  SOURCE_FAILED: "source_failed",           // Failed to process 'handbook.pdf'
  SOURCE_DELETED: "source_deleted",          // 'handbook.pdf' removed from HR Helper

  // Conversations
  QUERY_ANSWERED: "query_answered",          // Support Bot answered a query
  CONVERSATION_RESOLVED: "conversation_resolved",   // Conversation marked as resolved
  CONVERSATION_UNRESOLVED: "conversation_unresolved", // Conversation could not be resolved

  // Milestones
  BOT_MESSAGES_100: "bot_messages_100",        // Support Bot hit 100 messages
  BOT_MESSAGES_1000: "bot_messages_1000",       // Support Bot hit 1,000 messages
  BOT_CONVERSATIONS_50: "bot_conversations_50",    // HR Helper reached 50 conversations

  // Account & billing
  PLAN_UPGRADED: "plan_upgraded",           // Account upgraded to Pro
  PLAN_LIMIT_NEAR: "plan_limit_near",         // 80% of message limit reached
  PLAN_LIMIT_REACHED: "plan_limit_reached",      // Monthly message limit reached
};

// ─── Schema ───────────────────────────────────────────────────────────────────
const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // null for account-level events (plan upgrade, limit reached, etc.)
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      default: null,
    },

    eventType: {
      type: String,
      enum: Object.values(ACTIVITY_EVENTS),
      required: true,
      index: true,
    },

    // Pre-rendered human-readable text shown in the dashboard
    // e.g. "Support Bot hit 1,000 messages"
    title: {
      type: String,
      required: true,
    },

    // Extra context per event type — frontend can use for icons, links, etc.
    // Examples:
    //   source_failed:      { error: "PDF is password protected" }
    //   plan_limit_near:    { used: 160, limit: 200, percent: 80 }
    //   conversation_resolved: { conversationId: "...", label: "Refund query" }
    //   bot_messages_1000:  { totalMessages: 1000 }
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    // Only createdAt matters — we never update activity logs
    // updatedAt is kept for schema consistency but unused
  }
);

// Index for dashboard query: get latest N events for a user
activityLogSchema.index({ userId: 1, createdAt: -1 });

// ─── Static: log a new event ─────────────────────────────────────────────────
activityLogSchema.statics.log = async function ({ userId, botId = null, eventType, title, metadata = {} }) {
  return this.create({ userId, botId, eventType, title, metadata });
};

// ─── Static: get recent activity for dashboard ────────────────────────────────
activityLogSchema.statics.getRecent = async function (userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("botId", "name")
    .lean();
};

// Export both model and event constants
module.exports = mongoose.model("ActivityLog", activityLogSchema);
module.exports.ACTIVITY_EVENTS = ACTIVITY_EVENTS;