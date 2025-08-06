import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";
import "@/model/user";
import "@/model/voucher";
import "@/model/variants";
import "@/model/products";


export async function GET(
  req: Request,
  context: { params: { id: string } } // ✅ Phải là "context"
) {
  await dbConnect();

  const { id } = context.params; // ✅ Truy cập từ context.params

  try {
    const order = await Order.findById(id)
      .populate("id_user")
      .populate("id_voucher");

    if (!order) {
      return NextResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    const products = await OrderDetail.find({ id_order: id }).populate({
      path: "id_product_variant",
      populate: { path: "id_product" },
    });

    return NextResponse.json({ ...order.toObject(), products });
  } catch (error) {
    console.error("❌ Lỗi lấy đơn hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
