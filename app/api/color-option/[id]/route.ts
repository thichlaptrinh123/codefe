import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import ColorOption from "@/model/color-option";

export async function PUT(req: Request, context: any) {
  const { params } = context;
  await dbConnect();
  const body = await req.json();

  const updated = await ColorOption.findByIdAndUpdate(
    params.id,
    {
      categoryType: body.categoryType,
      colors: body.values, // 👈 nhận từ FE là 'values'
      isActive: body.isActive,
    },
    { new: true }
  );

  return NextResponse.json({
    _id: updated._id,
    categoryType: updated.categoryType,
    values: updated.colors, // 👈 trả lại là 'values'
    isActive: updated.isActive,
  });
}
