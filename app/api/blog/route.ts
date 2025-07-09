// File: app/api/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import Blog from "../../../model/blogs";
import "../../../model/user";

// GET: Lấy danh sách blog (có thể lọc ẩn/hiện)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const onlyVisible = searchParams.get("onlyVisible") === "true";

    const filter = onlyVisible ? { isHidden: false } : {};

    const blogs = await Blog.find(filter)
      .populate("id_user", "name email _id")
      .sort({ created_at: -1 });

    const now = new Date();

    const blogsWithStatus = blogs.map((item) => {
      let status: "published" | "draft" | "scheduled" = "published";

      if (item.isHidden) {
        status = "draft";
      } else if (item.isScheduled && item.scheduled_at && new Date(item.scheduled_at) > now) {
        status = "scheduled";
      }

      return {
        ...item.toObject(), // chuyển về object thuần
        status, // 👈 Gắn thêm trường status
      };
    });

    return NextResponse.json(blogsWithStatus, { status: 200 });
  } catch (error) {
    console.error("Lỗi server API blog:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}


// POST: Tạo mới blog
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const data = await req.json();

    // Kiểm tra bắt buộc
    if (!data.title || !data.content || !data.id_user) {
      return NextResponse.json(
        { message: "Thiếu trường bắt buộc: title, content, id_user" },
        { status: 400 }
      );
    }

    const newBlog = await Blog.create({
      title: data.title,
      subcontent: data.subcontent || "",
      content: data.content,
      image: data.image || "",
      id_user: data.id_user,
      isHidden: data.isHidden ?? false,
      isScheduled: data.isScheduled ?? false,
      scheduled_at: data.scheduled_at || null,
    });
 
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo blog:", error);
    return NextResponse.json({ message: "Lỗi server khi tạo blog" }, { status: 500 });
  }
}
