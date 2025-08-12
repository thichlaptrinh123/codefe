// /api/product/view/[id]
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/model/products";

export async function POST(
  _: Request,
  { params }: { params: any }
) {
  await dbConnect();

  try {
    const updated = await Product.findByIdAndUpdate(
      params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tăng view thành công", product: updated });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi server", error }, { status: 500 });
  }
}
