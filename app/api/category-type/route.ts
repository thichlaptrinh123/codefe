import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CategoryType from "@/model/category-type";

// GET: Lấy tất cả loại danh mục
export async function GET() {
  await dbConnect();
  const data = await CategoryType.find().sort({ createdAt: -1 });
  return NextResponse.json(data);
}

// POST: Tạo mới loại danh mục
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { message: "Tên loại danh mục không được để trống." },
        { status: 400 }
      );
    }

    // Tạo giá trị `value` tự động (ví dụ: "Áo thun" => "ao-thun")
    const value = name
      .toLowerCase()
      .normalize("NFD") // loại dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-") // khoảng trắng => "-"
      .replace(/[^a-z0-9\-]/g, ""); // bỏ ký tự lạ

    // Check trùng name
    const existsByName = await CategoryType.findOne({ name });
    if (existsByName) {
      return NextResponse.json(
        { message: "Tên loại danh mục đã tồn tại!" },
        { status: 400 }
      );
    }

    // Check trùng value
    const existsByValue = await CategoryType.findOne({ value });
    if (existsByValue) {
      return NextResponse.json(
        { message: "Giá trị loại danh mục đã tồn tại!" },
        { status: 400 }
      );
    }

    const created = await CategoryType.create({
      name,
      value,
      isActive: body.isActive !== false, // mặc định true
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("❌ Lỗi khi tạo loại danh mục:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra khi tạo loại danh mục." },
      { status: 500 }
    );
  }
}
