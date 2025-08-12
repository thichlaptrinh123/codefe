// app/api/order/[id]/cancel/route.ts
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import { NextResponse } from "next/server";

export async function PUT(_: Request, { params }: { params: any }) {
  await dbConnect();

  try {
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ success: false, message: "Chỉ có thể hủy đơn hàng ở trạng thái 'pending'" }, { status: 400 });
    }

    order.status = 'cancelled';
    await order.save();

    return NextResponse.json({ success: true, message: "Đã hủy đơn hàng" });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
