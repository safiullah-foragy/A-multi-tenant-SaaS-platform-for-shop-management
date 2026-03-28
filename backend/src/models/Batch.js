import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    shopId: { type: String, required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    creatorName: { type: String },
    creatorRole: { type: String },
    editingPermission: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Batch = mongoose.model("Batch", batchSchema);
