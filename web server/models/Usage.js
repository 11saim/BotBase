const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one doc per user always
      index: true,
    },

    periodStart: { type: Date, required: true }, // subscription or registration date
    periodEnd: { type: Date, default: null },  // null = free forever

    // Counters — incremented as actions happen
    messagesUsed: { type: Number, default: 0 },
    botsCreated: { type: Number, default: 0 },
    sourcesUploaded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Static: get usage doc for a user ────────────────────────────────────────
usageSchema.statics.getUsage = async function (userId) {
  return this.findOne({ userId });
};

// ─── Static: increment a counter field ───────────────────────────────────────
usageSchema.statics.increment = async function (userId, field, amount = 1) {
  return this.findOneAndUpdate(
    { userId },
    { $inc: { [field]: amount } },
    { new: true }
  );
};

// ─── Static: start a new period (only resets messages) ───────────────────────
usageSchema.statics.startNewPeriod = async function (userId, periodStart, periodEnd = null) {
  return this.findOneAndUpdate(
    { userId },
    {
      periodStart,
      periodEnd,
      messagesUsed: 0,
    },
    { new: true }
  );
};

module.exports = mongoose.model("Usage", usageSchema);