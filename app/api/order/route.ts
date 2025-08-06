// File: app/api/order/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";
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
      products, // [{ id_variant, quantity, price }]
      shipping_fee,
      paymentMethod = "COD",
      shipping_type = "road",
      address,
      receiver_name,
      receiver_phone,
      note = "",
    } = body;

    // ✅ Kiểm tra các trường bắt buộc
    if (!id_user || !products?.length || !shipping_fee || !receiver_name || !receiver_phone || !address) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin đơn hàng!" },
        { status: 400 }
      );
    }

    // ✅ Chuyển id_user về ObjectId nếu hợp lệ
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(id_user);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    // ✅ Tính tổng tiền sản phẩm
    let sub_total = 0;
    for (const item of products) {
      sub_total += item.price * item.quantity;
    }

    // ✅ Tính giảm giá từ voucher (nếu có)
    let discount = 0;
    if (id_voucher) {
      const Voucher = (await import("@/model/voucher")).default;
      const voucher = await Voucher.findById(id_voucher);
      if (voucher) {
        discount = Math.floor((voucher.discount_percent / 100) * sub_total);
      }
    }

    const total = sub_total + shipping_fee - discount;

    // ✅ Tạo đơn hàng
    const order = await Order.create({
      id_user: userObjectId,
      id_voucher,
      sub_total,
      shipping_fee,
      discount,
      total,
      paymentMethod,
      shipping_type,
      payment_status: paymentMethod === "COD" ? "unpaid" : "paid",
      status: "pending",
      receiver_name,
      receiver_phone,
      address,
      note,
    });

    // ✅ Tạo chi tiết đơn hàng
   const orderDetails = await Promise.all(
  products.map((item: any) =>
    OrderDetail.create({
      id_order: order._id,
      id_product_variant: item.id_product_variant, 
      quantity: item.quantity,
      price: item.price,
    })
  )
);


    return NextResponse.json({
      success: true,
      message: "Tạo đơn hàng thành công",
      order,
      orderDetails,
    });
  } catch (error: any) {
    console.error("Lỗi tạo đơn hàng:", {
      message: error.message,
      errors: error.errors,
    });

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Lỗi tạo đơn hàng",
        errors: error.errors || null,
      },
      { status: 500 }
    );
  }
}
