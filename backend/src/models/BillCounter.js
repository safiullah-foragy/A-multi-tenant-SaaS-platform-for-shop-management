import mongoose from "mongoose";

const billCounterSchema = new mongoose.Schema(
  {
    value: { type: Number, required: true, default: 0 }
  },
  { timestamps: true, collection: "billcounters" }
);

export const BillCounter = mongoose.model("BillCounter", billCounterSchema);
