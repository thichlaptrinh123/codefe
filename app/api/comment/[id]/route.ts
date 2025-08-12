import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Comment from "@/model/comments";
import "@/model/user";
import "@/model/products";

// GET 1 bình luận theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  await dbConnect();
  try {
    const comment = await Comment.findById(params.id)
      .populate("id_product")
      .populate("id_user");

    if (!comment) {
      return NextResponse.json(
        { message: "Không tìm thấy bình luận" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi khi lấy bình luận", error },
      { status: 500 }
    );
  }
}

// PUT cập nhật bình luận
export async function PUT(
  request: NextRequest,
  { params }: { params: any }
) {
  await dbConnect();
  try {
    const updateData = await request.json();
    const updated = await Comment.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Không tìm thấy bình luận để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi khi cập nhật bình luận", error },
      { status: 500 }
    );
  }
}

// // DELETE xoá bình luận
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   await dbConnect();
//   try {
//     const deleted = await Comment.findByIdAndDelete(params.id);

//     if (!deleted) {
//       return NextResponse.json(
//         { message: "Không tìm thấy bình luận để xoá" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ message: "Xoá bình luận thành công" });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Lỗi khi xoá bình luận", error },
//       { status: 500 }
//     );
//   }
// }
