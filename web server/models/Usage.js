const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // First and last day of the billing month
    periodStart: { type: Date, required: true },
    periodEnd:   { type: Date, required: true },

    // Counters — incremented as actions happen
    messagesUsed:    { type: Number, default: 0 },
    botsCreated:     { type: Number, default: 0 },
    sourcesUploaded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ensure one Usage doc per user per month
usageSchema.index({ userId: 1, periodStart: 1 }, { unique: true });

// Static: get or create the current month's usage doc for a user
usageSchema.statics.getCurrentPeriod = async function (userId) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);       // 1st of month
  const periodEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);  // last day of month

  return this.findOneAndUpdate(
    { userId, periodStart },
    { $setOnInsert: { userId, periodStart, periodEnd } },
    { upsert: true, new: true }
  );
};

// Static: increment a counter field safely
usageSchema.statics.increment = async function (userId, field, amount = 1) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return this.findOneAndUpdate(
    { userId, periodStart },
    { $inc: { [field]: amount } },
    { new: true }
  );
};

module.exports = mongoose.model("Usage", usageSchema);
