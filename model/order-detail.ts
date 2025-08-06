import mongoose from "mongoose";

const OrderDetailSchema = new mongoose.Schema(
  {
    id_order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    id_product_variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, 
  },
  { timestamps: true }
);

export default mongoose.models.OrderDetail || mongoose.model("OrderDetail", OrderDetailSchema);
