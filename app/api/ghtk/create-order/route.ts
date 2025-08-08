import { NextResponse } from "next/server";
import OrderDetail from "@/model/order-detail";
import "@/model/variants";
import "@/model/products";

export async function POST(req: Request) {
  const { order } = await req.json();
  const ghtkToken = process.env.GHTK_TOKEN || "your_token_here";

  // Lấy chi tiết đơn hàng và populate variant + product
  const orderDetails = await OrderDetail.find({ id_order: order._id })
    .populate({
      path: "id_product_variant",
      populate: { path: "product" },
    });

  const response = await fetch("https://services.giaohangtietkiem.vn/services/shipment/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Token: ghtkToken,
    },
    body: JSON.stringify({
      order: {
        id: order._id,
        pick_name: "Kho Aura",
        pick_address: "Quận 1",
        pick_province: "TP. Hồ Chí Minh",
        pick_district: "Quận 1",
        pick_tel: "0900000000",

        name: order.receiver_name,
        address: order.address,
        province: order.province, // ✅ cần truyền đúng từ FE
        district: order.district, // ✅ cần truyền đúng từ FE
        tel: order.receiver_phone,

        is_freeship: false,
        pick_money: order.paymentMethod === "COD" ? order.total : 0,
        note: order.note,
        value: order.total,
        transport: order.shipping_type || "road",

        products: orderDetails.map((item: any) => ({
          name: item.id_product_variant?.product?.name || "Sản phẩm",
          weight: 1000,
          quantity: item.quantity,
        })),
      },
    }),
  });

  const data = await response.json();
console.log("GHTK response:", data); // 👈 Thêm dòng này

console.log("✅ GHTK payload preview:", {
  province: order.province,
  district: order.district,
  address: order.address,
  name: order.receiver_name,
  phone: order.receiver_phone,
});

  if (data.success) {
    return NextResponse.json({ success: true, ghtk_order: data });
  } else {
    return NextResponse.json({ success: false, error: data.message || "GHTK thất bại" });
  }
}
