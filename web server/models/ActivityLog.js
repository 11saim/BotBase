const mongoose = require("mongoose");

// ─── Event Type Constants ──────────────────────────────────────────────────────
const ACTIVITY_EVENTS = {
  // Bot lifecycle
  BOT_CREATED: "bot_created",
  BOT_UPDATED: "bot_updated",
  BOT_DELETED: "bot_deleted",

  // Knowledge base
  SOURCE_UPLOADED: "source_uploaded",
  SOURCE_READY: "source_ready",
  SOURCE_FAILED: "source_failed",

  // Conversations
  QUERY_ANSWERED: "query_answered",
  CONVERSATION_RESOLVED: "conversation_resolved",
  CONVERSATION_UNRESOLVED: "conversation_unresolved",

  // Milestones
  BOT_MESSAGES_100: "bot_messages_100",
  BOT_MESSAGES_1000: "bot_messages_1000",
  BOT_CONVERSATIONS_50: "bot_conversations_50",

  // Account & billing
  PLAN_UPGRADED: "plan_upgraded",
  PLAN_LIMIT_NEAR: "plan_limit_near",
  PLAN_LIMIT_REACHED: "plan_limit_reached",
  PLAN_DOWNGRADED: "plan_downgraded",
  PLAN_EXPIRED: "plan_expired",
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

    title: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

// ─── Static: log a new event ─────────────────────────────────────────────────
activityLogSchema.statics.log = async function ({ userId, botId = null, eventType, title }) {
  return this.create({ userId, botId, eventType, title });
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
