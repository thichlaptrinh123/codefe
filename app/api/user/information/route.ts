// app/api/user/information/route.ts

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";


export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          fullName: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID người dùng" }, { status: 400 });
    }

    const body = await request.json();

    const updatedUser = await User.findByIdAndUpdate(id, body, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "Không thể cập nhật" }, { status: 400 });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin user:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}