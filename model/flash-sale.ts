// model/flash-sale.ts
import mongoose from "mongoose";

const FlashSaleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id_product: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }],
    quantity: { type: Number, required: true },
    discount_percent: { type: Number, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    start_time: { type: String }, // vd: "08:00"
    end_time: { type: String },   // vd: "12:00"
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active" // Mặc định là hoạt động
      },
      
  },
  { timestamps: true }
);

export default mongoose.models.FlashSale || mongoose.model("FlashSale", FlashSaleSchema);
