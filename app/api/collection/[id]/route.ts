import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Collection from "../../../../model/collection";

// Lấy chi tiết 1 collection theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const collection = await Collection.findById(id);

    return collection
      ? NextResponse.json(collection)
      : NextResponse.json({ message: "Không tìm thấy bộ sưu tập" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi lấy dữ liệu", error }, { status: 500 });
  }
}

// Cập nhật 1 collection theo ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const updateData = await request.json();

    const updatedCollection = await Collection.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return updatedCollection
      ? NextResponse.json(updatedCollection)
      : NextResponse.json({ message: "Không tìm thấy để cập nhật" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi cập nhật", error }, { status: 500 });
  }
}
