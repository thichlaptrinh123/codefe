// File: app/api/dashboard/low-stock-products/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import ProductVariant from "@/model/variants";
import "@/model/products";

export async function GET() {
  await dbConnect();

  try {
    const variants = await ProductVariant.find({ stock_quantity: { $lt: 20 } })
    .sort({ stock_quantity: 1 })
    .limit(50)
    .populate("id_product", "name");
  
    const products = variants.map((variant: any) => {
        const productName = variant.id_product?.name || "Không rõ tên";
      
        return {
          id: variant._id.toString(),
          name: productName,
          stock: variant.stock_quantity,
          size: variant.size,
          color: variant.color,
        };
      
    });
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Lỗi lấy sản phẩm gần hết hàng:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
