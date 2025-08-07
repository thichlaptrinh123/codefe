import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";

// ✅ GET: /api/user?phone=...
export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Thiếu số điện thoại" },
        { status: 400 }
      );
    }

    const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;
    const user = await User.findOne({ phone: formattedPhone }).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.username,
        email: user.email || "",
        phone: user.phone,
        address: user.address || [],
      },
    });
  } catch (error) {
    console.error("Lỗi GET user:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    );
  }
}

// ✅ PUT: Cập nhật thông tin người dùng
export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const { name, email, phone, address } = await req.json();

    if (!phone || !name || !email) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu cần thiết" },
        { status: 400 }
      );
    }

    const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;

    const user = await User.findOneAndUpdate(
      { phone: formattedPhone },
      {
        username: name,
        email,
        address,
        phone: formattedPhone, // đảm bảo đồng nhất
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thành công",
      user: {
        name: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Lỗi PUT user:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    );
  }
}