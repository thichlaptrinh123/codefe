// app/api/dashboard/top-categories/route.ts

import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Order from "@/model/order";
import OrderDetail from "@/model/order-detail";
import "@/model/products";
import "@/model/categories";

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
        $lookup: {
          from: "products",
          localField: "variant.id_product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
            _id: "$product.id_category",
            sold: { $sum: "$quantity" },
          }   
      },
      { $sort: { sold: -1 } },
      {
        $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id", // vì nhóm theo _id của id_category
            as: "category",
          },
      },
      { $unwind: "$category" },
      {
        $project: {
          id: "$category._id",
          name: "$category.name",
          sold: 1,
        },
      },
    ]);

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("Lỗi khi thống kê danh mục bán chạy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}