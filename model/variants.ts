// File: model/variants.ts
import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    id_product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    id_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },    
    size: { type: String },
    color: { type: String },
    stock_quantity: { type: Number, default: 0 },
    sold_quantity: { type: Number, default: 0 },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Variant || mongoose.model("Variant", VariantSchema);
