// app/api/variant/update-stock/[id]/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Variant from "@/model/variants";

export async function PUT(
  req: NextRequest,
  { params }: { params: any }
) {
  await dbConnect();

  try {
    const { stock_quantity } = await req.json();

    if (stock_quantity === undefined) {
      return NextResponse.json(
        { message: "Thiếu trường stock_quantity" },
        { status: 400 }
      );
    }

    const updated = await Variant.findByIdAndUpdate(
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

    return NextResponse.json(updated);
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
