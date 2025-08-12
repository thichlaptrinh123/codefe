// File: app/api/blog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Blog from "../../../../model/blogs";
import mongoose from "mongoose";

// // GET: Lấy 1 blog theo ID
// export async function GET(
//   request: NextRequest,
//   params: any
// ) {
//   await dbConnect();
//   const { id } = params;

//   try {
//     const blog = await Blog.findById(id).populate("id_user", "name email _id");

//     return blog
//       ? NextResponse.json(blog)
//       : NextResponse.json({ message: "Không tìm thấy blog" }, { status: 404 });
//   } catch (error) {
//     console.error("Lỗi khi lấy blog:", error);
//     return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
//   }
// }

export async function GET(req: NextRequest, context: any) {
  await dbConnect();
  const { id } = context.params;

  try {
    const blog = await Blog.findById(id).populate("id_user", "name email _id");

    return blog
      ? NextResponse.json(blog)
      : NextResponse.json({ message: "Không tìm thấy blog" }, { status: 404 });
  } catch (error) {
    console.error("Lỗi khi lấy blog:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}


// PUT: Cập nhật blog
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   await dbConnect();
//   const { id } = await params;

export async function PUT(req: NextRequest, context: any) {
  await dbConnect();
  const { id } = context.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "ID không hợp lệ" }, { status: 400 });
  }

  try {
    const data = await req.json();
    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
      return NextResponse.json(
        { message: "Không tìm thấy blog" },
        { status: 404 }
      );
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title: data.title ?? existingBlog.title,
        subcontent: data.subcontent ?? existingBlog.subcontent,
        content: data.content ?? existingBlog.content,
        images: Array.isArray(data.images) ? data.images : existingBlog.images,
        id_user: data.id_user ?? existingBlog.id_user,
        isHidden:
          typeof data.isHidden === "boolean"
            ? data.isHidden
            : existingBlog.isHidden,
        isScheduled:
          typeof data.isScheduled === "boolean"
            ? data.isScheduled
            : existingBlog.isScheduled,
        scheduled_at: data.scheduled_at ?? existingBlog.scheduled_at,
      },
      { new: true }
    );

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    console.error("Lỗi cập nhật blog:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
