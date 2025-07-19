// File: app/api/blog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Blog from "../../../../model/blogs";

// GET: Lấy 1 blog theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

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
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const data = await request.json();

    const updatedBlog = await Blog.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updatedBlog) {
      return NextResponse.json({ message: "Không tìm thấy blog" }, { status: 404 });
    }

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    console.error("Lỗi cập nhật blog:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// // DELETE: Xoá blog
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   await dbConnect();
//   const { id } = params;

//   try {
//     const deletedBlog = await Blog.findByIdAndDelete(id);

//     return deletedBlog
//       ? NextResponse.json({ message: "Đã xoá blog" }, { status: 200 })
//       : NextResponse.json({ message: "Không tìm thấy blog" }, { status: 404 });
//   } catch (error) {
//     console.error("Lỗi xoá blog:", error);
//     return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
//   }
// }
