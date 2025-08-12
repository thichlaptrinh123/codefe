import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Comment from "@/model/comments";
import "@/model/user";
import "@/model/products";

// GET tất cả bình luận
export async function GET() {
  await dbConnect();
  try {
    const comments = await Comment.find()
      .populate("id_product")
      .populate("id_user");

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách bình luận", error },
      { status: 500 }
    );
  }
}

// POST thêm bình luận
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const newComment = await Comment.create(body);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi khi thêm bình luận", error },
      { status: 500 }
    );
  }
}
