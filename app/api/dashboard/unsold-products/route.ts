// app/api/dashboard/unsold-products/route.ts
import { dbConnect } from "@/lib/mongodb";
import "@/model/products";
import Variant from "@/model/variants";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const unsold = await Variant.aggregate([
      { $match: { sold_quantity: 0 } },
      {
        $lookup: {
          from: "products",
          localField: "id_product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          id: "$product._id",
          name: "$product.name",
          stock: "$stock_quantity",
          sold: "$sold_quantity",
        },
      },
      { $group: {
          _id: "$id",
          name: { $first: "$name" },
          stock: { $sum: "$stock" },
          sold: { $sum: "$sold" },
        }
      },
      { $sort: { stock: -1 } },
    ]);

    return NextResponse.json({ products: unsold });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm bán chậm:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
