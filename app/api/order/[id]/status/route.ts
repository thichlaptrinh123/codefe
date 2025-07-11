// app/api/order/[id]/status/route.ts
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { status } = await req.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      {
        status,
        updatedAt: new Date(), 
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedOrder });

  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
