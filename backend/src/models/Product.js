import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    shopId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    barcode: { type: String, trim: true, default: "" },
    size: { type: String, trim: true, default: "" },
    editingPermission: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
