import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import ColorOption from "@/model/color-option";

export async function GET(
  _req: NextRequest,
  context: { params: { typeName: string } }
) {
  await dbConnect();

  const typeName = context.params.typeName?.toLowerCase();

  if (!typeName) {
    return NextResponse.json({ message: "Missing typeName" }, { status: 400 });
  }

  // Lấy toàn bộ color option
  const allOptions = await ColorOption.find();

  // Lọc theo categoryType khớp với typeName (không phân biệt hoa/thường)
  const matched = allOptions.filter(
    (opt) => opt.categoryType?.toLowerCase() === typeName
  );

  return NextResponse.json(
    matched.map((item) => ({
      _id: item._id,
      categoryType: item.categoryType,
      values: item.values,
      isActive: item.isActive,
    }))
  );
}
