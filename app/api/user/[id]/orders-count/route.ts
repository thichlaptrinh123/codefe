// File: app/api/user/[id]/orders-count/route.ts
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: any }) {
  await dbConnect();

  try {
    const orderCount = await Order.countDocuments({
      id_user: params.id,
      status: { $in: ["cancelled", "failed"] }, // Các đơn được tính là "bơm"
    });

    return NextResponse.json({ count: orderCount });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
