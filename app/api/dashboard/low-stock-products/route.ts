// File: app/api/dashboard/low-stock-products/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import ProductVariant from "@/model/variants";
import "../../../../model/products";

export async function GET() {
  await dbConnect();

  try {
    const variants = await ProductVariant.find({
      stock_quantity: { $lt: 20 }
    })
      .populate("id_product", "name isActive") // Lấy tên sản phẩm + trạng thái
      .sort({ stock_quantity: 1 })
      .limit(50);

    // Lọc chỉ lấy biến thể thuộc sản phẩm đang bán
    const products = variants
      .filter(v => v.id_product?.isActive)
      .map(v => ({
        id: v._id.toString(), // ID biến thể
        name: `${v.id_product.name}${v.name ? ` - ${v.name}` : ""}`,
        stock: v.stock_quantity
      }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Lỗi lấy sản phẩm gần hết hàng:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}