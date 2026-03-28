import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    gmail: {
      type: String,
      required: true,
      unique: true, // Assuming one admin per email system-wide
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    homeAddress: {
      type: String,
      default: "",
      trim: true
    },
    shopId: {
      type: String,
      required: true,
      index: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // Adds createdAt (date & time) and updatedAt
    collection: "admin"
  }
);

export const Admin = mongoose.model("Admin", adminSchema);
