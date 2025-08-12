// /api/variant/sold/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Variant from "@/model/variants";

// PUT: Cập nhật sold_quantity cho nhiều biến thể
export async function PUT(req: NextRequest) {
  await dbConnect();

  try {
    const updates = await req.json(); // Mảng [{ id: 'id_bien_the', quantity: số_lượng }]

    if (!Array.isArray(updates)) {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    for (const { id, quantity } of updates) {
      if (!id || typeof quantity !== "number") continue;

      await Variant.findByIdAndUpdate(id, {
        $inc: { sold_quantity: quantity }
      });
    }

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (err) {
    return NextResponse.json(
      { message: "Lỗi cập nhật", error: (err as Error).message },
      { status: 500 }
    );
  }
}
