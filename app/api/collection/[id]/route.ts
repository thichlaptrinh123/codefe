// app/api/collections/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Collection from "@/model/collection";

// GET: Lấy 1 bộ sưu tập theo ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const collection = await Collection.findById(id);
    return collection
      ? NextResponse.json(collection)
      : NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// PUT: Cập nhật bộ sưu tập
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const data = await req.json();

    const updated = await Collection.findByIdAndUpdate(id, data, { new: true });
    return updated
      ? NextResponse.json(updated)
      : NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
