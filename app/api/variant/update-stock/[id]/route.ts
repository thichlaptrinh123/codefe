// app/api/variant/update-stock/[id]/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import "@/model/variants";
import ProductVariant from "@/model/variants";

export async function PUT(
  req: NextRequest,
  { params }: { params: any }
) {
  await dbConnect();

  try {
    const { stock_quantity } = await req.json();

    if (stock_quantity === undefined || isNaN(Number(stock_quantity))) {
      return NextResponse.json(
        { message: "Giá trị stock_quantity không hợp lệ" },
        { status: 400 }
      );
    }

    const updated = await ProductVariant.findByIdAndUpdate(
      params.id,
      { stock_quantity: Number(stock_quantity) },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Không tìm thấy biến thể" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updated._id.toString(),
      stock_quantity: updated.stock_quantity,
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Lỗi khi cập nhật tồn kho",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}