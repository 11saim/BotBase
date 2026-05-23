const mongoose = require("mongoose");
const crypto = require("crypto");

const apiKeySchema = new mongoose.Schema(
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
    },

    // Store SHA-256 hash only — never store plaintext key
    keyHash: {
      type: String,
      required: true,
    },

    // Human label so users can identify keys in dashboard
    // e.g. "Production", "Dev", "Website embed"
    label: {
      type: String,
      default: "Default",
      trim: true,
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Static: generate a new key and return both plaintext (shown once) and hash (stored)
apiKeySchema.statics.generateKey = function () {
  const plainText = `bb_${crypto.randomBytes(32).toString("hex")}`; // e.g. bb_abc123...
  const keyHash = crypto.createHash("sha256").update(plainText).digest("hex");
  return { plainText, keyHash };
};

// Static: verify an incoming key against stored hash
apiKeySchema.statics.verifyKey = function (plainText, storedHash) {
  const hash = crypto.createHash("sha256").update(plainText).digest("hex");
  return hash === storedHash;
};

module.exports = mongoose.model("ApiKey", apiKeySchema);
