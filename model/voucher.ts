// models/voucher.ts
import mongoose from "mongoose";

const VoucherSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    start_day: {
      type: Date,
      required: true,
    },
    end_day: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      default: true, 
    },
    discount_percent: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Voucher ||
  mongoose.model("Voucher", VoucherSchema);
