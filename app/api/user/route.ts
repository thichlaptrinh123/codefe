import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";

// Lấy thông tin user theo phone (demo)
export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    // Lấy query ?phone=...
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { message: "Thiếu số điện thoại" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone });
    if (!user) return NextResponse.json({ message: "User không tồn tại" }, { status: 404 });

    return NextResponse.json({
      name: user.username,
      email: user.email || "",
      phone: user.phone,
      address: user.address || "",
    });
  } catch (error) {
    console.error("Lỗi GET user:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// Cập nhật thông tin user
export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const { name, email, phone, address } = await req.json();

    const user = await User.findOneAndUpdate(
      { phone },
      { username: name, email, address },
      { new: true }
    );

    if (!user) return NextResponse.json({ message: "User không tồn tại" }, { status: 404 });

    return NextResponse.json({
      message: "Cập nhật thành công",
      user,
    });
  } catch (error) {
    console.error("Lỗi PUT user:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
