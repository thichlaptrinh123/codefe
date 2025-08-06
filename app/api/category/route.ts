import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from '../../../lib/mongodb';
import Category from '../../../model/categories';
import CategoryType from '../../../model/category-type';

// GET: Lấy danh sách danh mục (tùy chọn lọc theo trạng thái)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get("onlyActive") === "true";

    const filter = onlyActive ? { isActive: true } : {};

    const categories = await Category.find(filter)
      .populate("typeId", "name _id isActive")
      .sort({ createdAt: -1 });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Lỗi server API category:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();

  const data = await req.json();

  // Kiểm tra tên đã tồn tại
  const existingCategory = await Category.findOne({ name: data.name });
  if (existingCategory) {
    return NextResponse.json(
      { message: "Tên danh mục đã tồn tại!" },
      { status: 400 }
    );
  }

  // ✅ Kiểm tra typeId hợp lệ
  const categoryType = await CategoryType.findById(data.typeId);
  if (!categoryType) {
    return NextResponse.json(
      { message: "Loại danh mục không hợp lệ!" },
      { status: 400 }
    );
  }

  const newCategory = await Category.create({
    name: data.name,
    typeId: data.typeId,
    isActive: data.isActive ?? true, // ✅ Nếu không truyền thì mặc định true
  });

  return NextResponse.json(newCategory, { status: 201 });
}