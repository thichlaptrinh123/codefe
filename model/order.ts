// File: model/order.ts
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    id_voucher: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
    shipping_fee: { type: Number, required: true },
    discount: { type: Number, default: 0 },        
    address: { type: String, default: "" },       
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK", "EWALLET"],
      default: "COD"
    },    
    status: {
      type: String,
      enum: [
        "pending", "confirmed", "processing", "shipping", "delivered",
        "completed", "cancelled", "failed", "return_requested", "returned", "refunded"
      ],
      default: "pending"
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
