import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: any }) {
  await dbConnect();
  try {
    const orders = await Order.find({ id_user: params.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
