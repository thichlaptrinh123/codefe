// app/api/order/[id]/route.ts
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";
import { NextResponse } from "next/server";
import "@/model/user";
import "@/model/voucher";

export async function GET(_: Request, { params }: { params: any }) {
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

    // Có thể format thêm dữ liệu nếu cần, ví dụ convert _id thành string, hoặc lọc trường không cần thiết

    return NextResponse.json({ ...order.toObject(), products });
  } catch (error: any) {a
    console.error("Lỗi GET đơn hàng theo id:", error);
    return NextResponse.json({ message: error.message || "Lỗi server" }, { status: 500 });
  }
}
