import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import SizeOption from "@/model/size-option";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await req.json();

  const updated = await SizeOption.findByIdAndUpdate(
    params.id,
    {
      categoryType: body.categoryType,
      sizes: body.values, // 💡 FE gửi lên là 'values' → map sang 'sizes'
      isActive: body.isActive,
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ message: "Không tìm thấy bản ghi" }, { status: 404 });
  }

  // Map lại từ 'sizes' → 'values' để trả về FE đúng định dạng
  return NextResponse.json({
    _id: updated._id,
    categoryType: updated.categoryType,
    values: updated.sizes,
    isActive: updated.isActive,
  });
}
