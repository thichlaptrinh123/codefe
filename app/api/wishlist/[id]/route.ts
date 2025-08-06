import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from '../../../../../lib/mongodb'
import Wishlist from '../../../../../model/wishlist'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params; 

  try {
    const wishlist = await Wishlist.find({ id_user: id }).populate("id_product");

    return wishlist.length > 0
      ? NextResponse.json(wishlist)
      : NextResponse.json({ message: "Không tìm thấy sản phẩm nào trong wishlist của người dùng này" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi lấy dữ liệu", error }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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