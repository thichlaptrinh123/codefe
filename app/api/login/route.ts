// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập số điện thoại và mật khẩu" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { message: "Thông tin đăng nhập không đúng" },
        { status: 401 }
      );
    }

    if (user.status === 0) {
      return NextResponse.json(
        { message: "Tài khoản đã bị khóa" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Thông tin đăng nhập không đúng" },
        { status: 401 }
      );
    }

    // Tạo JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, phone: user.phone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userInfo } = user.toObject();

    return NextResponse.json({
      message: "Đăng nhập thành công",
      user: userInfo,
      token,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
