import mongoose from "mongoose";

const otpTokenSchema = new mongoose.Schema(
  {
    purpose: {
      type: String,
      enum: ["signup", "reset-password", "create-admin", "create-cashier", "create-stockManager", "admin-reset-password", "staff-reset-password"],
      required: true
    },
    gmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ""
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    collection: "otp_token"
  }
);

otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpToken = mongoose.model("OtpToken", otpTokenSchema);
