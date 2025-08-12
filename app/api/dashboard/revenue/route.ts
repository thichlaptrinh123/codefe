// File: app/api/revenue/route.ts // biểu đồ doanh thu 
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(`${from}T00:00:00+07:00`) : null;
  const toDate = to ? new Date(`${to}T23:59:59+07:00`) : null;

  try {
    const match: any = {
        status: "completed",
      };
      if (fromDate && toDate) {
        match.createdAt = {
          $gte: fromDate,
          $lte: toDate,
        };
      }      

    const orders = await Order.find(match);

    const revenueByDate: Record<string, number> = {};
    let totalRevenue = 0;

    for (const order of orders) {
      const orderDetails = await OrderDetail.find({ id_order: order._id });

      const subtotal = orderDetails.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const total = subtotal + order.shipping_fee - (order.discount || 0);
      const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);

      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + total;
      totalRevenue += total;
    }

    return NextResponse.json({ revenueByDate, totalRevenue });
  } catch (error) {
    console.error("Lỗi khi lấy revenue:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
