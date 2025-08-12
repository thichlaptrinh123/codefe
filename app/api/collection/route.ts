// app/api/collection/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Collection from "@/model/collection";


// GET: Lấy tất cả bộ sưu tập, có thể lọc chỉ lấy active
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get("onlyActive") === "true";

    const filter = onlyActive ? { isActive: true } : {};
    const collections = await Collection.find(filter).sort({ created_at: -1 });

    return NextResponse.json(collections, { status: 200 });
  } catch (error) {
    console.error("Lỗi lấy collections:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// POST: Tạo mới bộ sưu tập
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ message: "Thiếu tên bộ sưu tập" }, { status: 400 });
    }

    const newCollection = await Collection.create({
      name: data.name,
      description: data.description || "",
      thumbnail_url: data.thumbnail_url || "",
    });

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo collection:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
