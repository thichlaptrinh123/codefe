
// /app/api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from '../../../../lib/mongodb'
import Wishlist from '../../../../model/wishlist'
import "../../../../model/products"

export async function GET(request: NextRequest, { params }: { params: any }) {
  await dbConnect();

  try {
    const wishlist = await Wishlist.find({ id_user: params.id })
      .populate("id_product"); // Lấy đầy đủ thông tin sản phẩm

    if (wishlist.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm nào trong wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi lấy dữ liệu", error }, { status: 500 });
  }
}


export async function PUT(request: NextRequest, { params }: { params: any }) {
  await dbConnect();
  const { id } = params; 

  try {
    const updateData = await request.json();

    const updatedWishlist = await Wishlist.findByIdAndUpdate(id, updateData, { new: true });

    return updatedWishlist
      ? NextResponse.json(updatedWishlist)
      : NextResponse.json({ message: "Không tìm thấy wishlist để cập nhật" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi cập nhật", error }, { status: 500 });
  }
}