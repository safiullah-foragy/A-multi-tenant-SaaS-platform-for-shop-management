import mongoose from "mongoose";

const stockManagerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true },
    time: { type: String, default: "" },
    gender: { type: String, default: "Prefer not to say" },
    age: { type: Number },
    passwordHash: { type: String, required: true },
    shopId: { type: String, required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, collection: "stockmanager" }
);

export const StockManager = mongoose.model("StockManager", stockManagerSchema);
