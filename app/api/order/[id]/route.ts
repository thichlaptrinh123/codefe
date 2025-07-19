// app/api/order/[id]/route.ts
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const order = await Order.findById(params.id)
      .populate("id_user")
      .populate("id_voucher");

    if (!order) {
      return NextResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    const products = await OrderDetail.find({ id_order: params.id }).populate({
      path: "id_product_variant",
      populate: { path: "id_product" },
    });

    return NextResponse.json({ ...order.toObject(), products });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
