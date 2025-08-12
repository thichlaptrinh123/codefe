import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CategoryType from "@/model/category-type";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  params: any
) {
  try {
    await dbConnect();

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "ID không hợp lệ!" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const name = data.name?.trim();

    if (!name) {
      return NextResponse.json(
        { message: "Tên loại danh mục không được để trống." },
        { status: 400 }
      );
    }

    const value = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    // Kiểm tra trùng `name` với ID khác
    const nameExists = await CategoryType.findOne({ name, _id: { $ne: id } });
    if (nameExists) {
      return NextResponse.json(
        { message: "Tên loại danh mục đã tồn tại!" },
        { status: 400 }
      );
    }

    // Kiểm tra trùng `value` với ID khác
    const valueExists = await CategoryType.findOne({ value, _id: { $ne: id } });
    if (valueExists) {
      return NextResponse.json(
        { message: "Giá trị loại danh mục đã tồn tại!" },
        { status: 400 }
      );
    }

    const updated = await CategoryType.findByIdAndUpdate(
      id,
      { name, value, isActive: data.isActive !== false },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Không tìm thấy loại danh mục để cập nhật!" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("❌ Lỗi cập nhật loại danh mục:", err);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi cập nhật loại danh mục." },
      { status: 500 }
    );
  }
}
