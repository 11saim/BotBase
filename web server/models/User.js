const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: false,
      default: null,
    },

    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    provider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
      index: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    plan: {
      type: String,
      enum: ["free", "starter", "pro", "agency"],
      default: "free",
    },

    planExpiresAt: {
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

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash") || !this.passwordHash) return;

  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Compare password helper
userSchema.methods.comparePassword = async function (plainText) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainText, this.passwordHash);
};

// Never expose sensitive info in JSON responses
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.googleId;
    delete ret.provider;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
