import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    id_voucher: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },

    // Tổng tiền sản phẩm (chưa gồm phí ship & giảm giá)
    sub_total: { type: Number, required: true },

    // Phí vận chuyển
    shipping_fee: { type: Number, required: true },

    // Tổng giảm giá (voucher, khuyến mãi,...)
    discount: { type: Number, default: 0 },

    // Tổng tiền phải thanh toán
    total: { type: Number, required: true },

    // Thông tin người nhận
    receiver_name: { type: String, required: true },
    receiver_phone: { type: String, required: true },
    address: { type: String, required: true },

    // Ghi chú đơn hàng
    note: { type: String, default: "" },

    // Phương thức vận chuyển
    shipping_type: {
      type: String,
      enum: ["road", "fly"],
      default: "road",
    },

    // Phương thức thanh toán
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK", "EWALLET"],
      default: "COD",
    },

    // Trạng thái thanh toán
    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "failed"],
      default: "unpaid",
    },

    // Trạng thái đơn hàng
    status: {
      type: String,
      enum: [
        "pending", "confirmed", "processing", "shipping", "delivered",
        "completed", "cancelled", "failed", "return_requested", "returned", "refunded"
      ],
      default: "pending",
    },

    // Mã đơn hàng GHTK nếu có
    ghtk_order_code: { type: String },

    // Trạng thái đồng bộ với GHTK
    ghtk_status: { type: String, default: "Chưa tạo đơn" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
