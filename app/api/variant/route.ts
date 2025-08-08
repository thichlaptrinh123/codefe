// app/api/variant/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Variant from "@/model/variants";
import "@/model/products";
// GET: Lấy toàn bộ biến thể hoặc theo productId hoặc categoryId
export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");

    const filter: any = {};
    if (productId) filter.id_product = productId;
    if (categoryId) filter.id_category = categoryId;

    const variants = await Variant.find(filter)
    .populate("id_product", "name")
    .sort({ createdAt: -1 })
    .lean();

    const normalized = variants.map((v) => ({
      ...v,
      productName: v.id_product?.name || "Không rõ", 
      stock_quantity: Number(v.stock_quantity) || 0,
      sold_quantity: Number(v.sold_quantity) || 0,
      price: Number(v.price) || 0,
    }));
    
    console.log(" Kết quả trả về từ MongoDB:", normalized);

    return NextResponse.json(normalized);
    
  } catch (err) {
    console.error("❌ Lỗi khi xử lý GET /api/variant:", err); // <--- thêm dòng này
  
    return NextResponse.json(
      {
        message: "Lỗi khi lấy biến thể",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
  
}

// POST: Tạo biến thể mới
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const data = await req.json();
    const {
      id_product,
      id_category,
      price,
      size,
      color,
      stock_quantity,
      isActive,
    } = data;

    if (!id_product || !id_category || price === undefined) {
      return NextResponse.json(
        { message: "Thiếu dữ liệu: id_product, price, id_category" },
        { status: 400 }
      );
    }

    const generatedName = `${size || ""}${color ? " - " + color : ""}`.trim();

    const newVariant = await Variant.create({
      name: generatedName,
      id_product,
      id_category,
      size: size || "",
      color: color || "",
      stock_quantity: Number(stock_quantity || 0),
      price: Number(price),
      isActive: isActive !== false,
    });

    return NextResponse.json(newVariant, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Lỗi khi tạo biến thể",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
