// app/api/size-option/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import SizeOption from "@/model/size-option";

export async function GET() {
  await dbConnect();
  const sizes = await SizeOption.find();

  const result = sizes.map((item) => ({
    _id: item._id,
    categoryType: item.categoryType,
    values: item.sizes,
    isActive: item.isActive,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const categoryType = body.categoryType?.trim().toLowerCase(); // ✅ Chuẩn hoá

  const existing = await SizeOption.findOne({ categoryType });

  let updated;

  if (existing) {
    const newSizes = Array.from(new Set([...existing.sizes, ...body.values]));
    existing.sizes = newSizes;
    existing.isActive = body.isActive;
    await existing.save();
    updated = existing;
  } else {
    updated = await SizeOption.create({
      categoryType,
      sizes: body.values,
      isActive: body.isActive,
    });
  }

  return NextResponse.json({
    _id: updated._id,
    categoryType: updated.categoryType,
    values: updated.sizes,
    isActive: updated.isActive,
  });
}
