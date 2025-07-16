// model/user-voucher.ts
import mongoose from "mongoose";

const userVoucherSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher", required: true },
  collected_at: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.UserVoucher || mongoose.model("UserVoucher", userVoucherSchema);