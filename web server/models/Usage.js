const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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

// Usage.js - add this static method
usageSchema.statics.incrementIfAllowed = async function (userId, field, limit) {
  if (limit === -1) {
    // unlimited — just increment
    const result = await this.findOneAndUpdate(
      { userId },
      { $inc: { [field]: 1 } },
      { new: true }
    );
    return result !== null;
  }

  const result = await this.findOneAndUpdate(
    { userId, [field]: { $lt: limit } },
    { $inc: { [field]: 1 } },
    { new: true }
  );
  return result !== null;
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

// get current usage doc
usageSchema.statics.getUsage = async function (userId) {
  return this.findOne({ userId });
};

// simple increment/decrement — use only where race conditions don't matter
usageSchema.statics.increment = async function (userId, field, amount = 1) {
  return this.findOneAndUpdate(
    { userId },
    { $inc: { [field]: amount } },
    { new: true }
  );
};

module.exports = mongoose.model("Usage", usageSchema);