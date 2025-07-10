// File: app/api/order/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";
import User from "@/model/user";
import "@/model/user";
import "@/model/variants";
import "@/model/products";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  try {
    const {
      id_user,
      id_voucher,
      shipping_fee,
      products, // [{ id_variant, quantity, price }]
      paymentMethod = "COD", // ✅ default
      address = "",
    } = body;

    // Tính tổng tiền
    let total = 0;
    for (const item of products) {
      total += item.price * item.quantity;
    }

    // Tính giảm giá nếu có
    let discount = 0;
    if (id_voucher) {
      const Voucher = (await import("@/model/voucher")).default;
      const voucher = await Voucher.findById(id_voucher);
      if (voucher) {
        discount = Math.floor((voucher.discount_percent / 100) * total);
      }
    }

    const finalTotal = total + shipping_fee - discount;

    // Tạo đơn hàng
    const order = await Order.create({
      id_user,
      id_voucher,
      shipping_fee,
      paymentMethod,
      address,
      discount,
      status: "pending",
    });

    // Tạo các sản phẩm trong đơn hàng
    const orderDetails = await Promise.all(
      products.map((item: any) =>
        OrderDetail.create({
          id_order: order._id,
          id_product_variant: item.id_variant,
          quantity: item.quantity,
          price: item.price,
        })
      )
    );

    return NextResponse.json({
      success: true,
      order,
      orderDetails,
      total,
      discount,
      finalTotal,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const result = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findById(order.id_user);

        const productsRaw = await OrderDetail.find({ id_order: order._id }).populate({
          path: "id_product_variant",
          populate: { path: "id_product" },
        });

        const products = productsRaw.map((item: any) => ({
          name: item.id_product_variant?.id_product?.name || "Sản phẩm không xác định",
          color: item.id_product_variant?.color || "N/A",
          size: item.id_product_variant?.size || "N/A",
          quantity: item.quantity,
          price: item.price,
        }));

        const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const discount = order.discount || 0;

        return {
          id: order._id.toString().slice(-6).toUpperCase(),
          _id: order._id,
          customerName: user?.username || "Ẩn danh",
          phone: user?.phone || "Không có",
          createdAt: order.createdAt,
          status: order.status,
          paymentMethod: order.paymentMethod || "COD",
          shippingFee: order.shipping_fee,
          discount,
          total: total + order.shipping_fee - discount,
          address: order.address || "Chưa có địa chỉ",
          products,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lỗi GET đơn hàng:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
