import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    gmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    shopId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    shopName: {
      type: String,
      default: "My Shop",
      trim: true
    },
    shopLogoPath: {
      type: String,
      default: ""
    },
    shopLocation: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true,
    collection: "owner"
  }
);

export const Owner = mongoose.model("Owner", ownerSchema);
