// File: app/api/doashboard/best-selling-products/route.ts
import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";
import "@/model/products";

export async function GET() {
  await dbConnect();

  try {
    // Lấy các đơn đã hoàn tất
    const completedOrders = await Order.find({ status: "completed" }).select("_id");
    const orderIds = completedOrders.map((o) => o._id);

    const result = await OrderDetail.aggregate([
        { $match: { id_order: { $in: orderIds } } },
        {
          $lookup: {
            from: "variants",
            localField: "id_product_variant",
            foreignField: "_id",
            as: "variant",
          },
        },
        { $unwind: "$variant" },
        {
          $group: {
            _id: "$variant.id_product",
            sold: { $sum: "$quantity" },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 20 }, // hiển thị nhiều hơn 1 nếu muốn
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            id: "$product._id",
            name: "$product.name",
            image: { $arrayElemAt: ["$product.images", 0] },
            sold: 1,
          },
        },
      ]);
      
      

    return NextResponse.json({ products: result });
  } catch (error) {
    console.error("Lỗi khi thống kê sản phẩm bán chạy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
