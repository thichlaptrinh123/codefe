import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import ColorOption from "@/model/color-option";

export async function GET() {
  await dbConnect();
  const colors = await ColorOption.find();

  return NextResponse.json(
    colors.map((item) => ({
      _id: item._id,
      categoryType: item.categoryType,
      values: item.colors,
      isActive: item.isActive,
    }))
  );
}

export async function POST(req: Request) {
  await dbConnect();
  const { categoryType, values, isActive } = await req.json();

  const existing = await ColorOption.findOne({ categoryType });
  let updatedDoc;

  if (existing) {
    const existingNames = new Set(
      existing.colors.map((c: { name: string }) => c.name.toLowerCase())
    );    

    const newColors = values.filter(
      (c: { name: string }) => !existingNames.has(c.name.toLowerCase())
    );

    existing.colors.push(...newColors);
    existing.isActive = isActive;
    await existing.save();
    updatedDoc = existing;
  } else {
    updatedDoc = await ColorOption.create({
      categoryType,
      colors: values,
      isActive,
    });
  }

  return NextResponse.json({
    _id: updatedDoc._id,
    categoryType: updatedDoc.categoryType,
    values: updatedDoc.colors,
    isActive: updatedDoc.isActive,
  });
}
