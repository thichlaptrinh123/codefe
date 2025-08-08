import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: any }) {
  await dbConnect();

  try {
    const orders = await Order.find({ id_user: params.id }).sort({ createdAt: -1 });

    const formatted = orders.map((order) => {
        const productTotal = (order.products || []).reduce((total: number, item: any) => {
            return total + item.quantity * item.price;
          }, 0);
          

      let discountAmount = 0;

      if (order.discount && typeof order.discount === "object") {
        if (order.discount.type === "fixed") {
          discountAmount = order.discount.discount_amount || 0;
        } else if (order.discount.type === "percentage") {
          discountAmount = productTotal * ((order.discount.percentage || 0) / 100);
        }
      }

      const total = productTotal + (order.shipping_fee || 0) - discountAmount;

      return {
        _id: order._id,
        customerName: order.customerName,
        address: order.address,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        products: order.products,
        shippingFee: order.shipping_fee || 0,
        discount: discountAmount,
        total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        note: order.note,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
