// /api/variant/sold/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Variant from "@/model/variants";

export async function POST(
  _: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const updated = await Variant.findByIdAndUpdate(
      params.id,
      { $inc: { sold_quantity: 1 } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Không tìm thấy variant" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tăng sold thành công", variant: updated });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi server", error }, { status: 500 });
  }
}
