// app/api/variant/[id]/route.ts
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
    const updateData = await req.json();
    const {
      id_product,
      id_category,
      price,
      size,
      color,
      stock_quantity,
      isActive,
    } = updateData;

    if (!id_product || !id_category || price === undefined) {
      return NextResponse.json(
        {
          message: "Thiếu dữ liệu bắt buộc: id_product, id_category, price",
        },
        { status: 400 }
      );
    }

    const generatedName = `${size || ""}${color ? " - " + color : ""}`.trim();

    const updated = await Variant.findByIdAndUpdate(
      params.id,
      {
        name: generatedName,
        id_product,
        id_category,
        size: size || "",
        color: color || "",
        stock_quantity: Number(stock_quantity || 0),
        price: Number(price),
        isActive: isActive !== false,
      },
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
        message: "Lỗi khi cập nhật biến thể",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: any }
) {
  await dbConnect();

  try {
    const deleted = await Variant.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Không tìm thấy biến thể cần xoá" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Xoá biến thể thành công" });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Lỗi khi xoá biến thể",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}

