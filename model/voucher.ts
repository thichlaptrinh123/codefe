// model/voucher.ts
import mongoose from "mongoose";

const VoucherSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    description: String,
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    quantity: { type: Number, required: true },
    start_day: { type: Date, required: true },
    end_day: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "active", "inactive"],
      default: "inactive",
    },
    

    type: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    discount_percent: Number,
    discount_amount: Number,
    min_order_value: Number,
    max_discount_value: Number,
    used_count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Voucher || mongoose.model("Voucher", VoucherSchema);
