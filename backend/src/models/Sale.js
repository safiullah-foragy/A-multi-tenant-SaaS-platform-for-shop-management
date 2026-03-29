import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    billNumber: { type: Number, required: true, index: true },
    shopId: { type: String, required: true, index: true },
    productBarcode: { type: String, required: true, trim: true, index: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    mrp: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    discount: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    seller: { type: String, required: true, trim: true },
    sellingDate: { type: Date, default: Date.now },
    batchCreatedAt: { type: Date },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "Cashier", required: true }
  },
  { timestamps: true, collection: "sales" }
);

export const Sale = mongoose.model("Sale", saleSchema);
