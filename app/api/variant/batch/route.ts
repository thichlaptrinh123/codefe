// app/api/variant/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Variant from "@/model/variants";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const variants = await req.json();

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { message: "Không có biến thể nào được gửi lên" },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      variants.map(async (v: any) => {
        const {
          id,
          id_product,
          id_category,
          price,
          size,
          color,
          stock_quantity,
          isActive,
        } = v;

        if (!id_product || !id_category || price === undefined) {
          throw new Error("Thiếu dữ liệu bắt buộc trong 1 biến thể");
        }

        const name = `${size || ""}${color ? " - " + color : ""}`.trim();

        if (id) {
          return await Variant.findByIdAndUpdate(
            id,
            {
              name,
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
        } else {
          return await Variant.create({
            name,
            id_product,
            id_category,
            size: size || "",
            color: color || "",
            stock_quantity: Number(stock_quantity || 0),
            price: Number(price),
            isActive: isActive !== false,
          });
        }
      })
    );

    // Thống kê kết quả
    const success = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - success;

    return NextResponse.json({
      message: `✅ Xử lý ${success} biến thể thành công, ${failed} thất bại`,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: "❌ Lỗi khi xử lý batch variant",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
