import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, password, confirmPassword, phone } = body;

    if (!username || !password || !confirmPassword || !phone) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin." },
        { status: 400 }
      );
    }

    const phoneRegex = /^(0[2|3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: "Số điện thoại không hợp lệ" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Mật khẩu không khớp" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ phone });
    if (!existingUser) {
      return NextResponse.json(
        { message: "Không tìm thấy số điện thoại này" },
        { status: 404 }
      );
    }

    if (!existingUser.otp?.verified) {
      return NextResponse.json(
        { message: "Số điện thoại chưa được xác minh" },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.username = username;
    existingUser.password = hashedPassword;
    existingUser.phone = phone;

    await existingUser.save();

    const userInfo = {
      _id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      phone: existingUser.phone,
    };

    // ✅ Tạo token với user._id
    const token = jwt.sign(
      { id: existingUser._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: '365d' }
    );

    return NextResponse.json({
      message: "Đăng ký thành công",
      token,
      user: userInfo,
    });
  } catch (error) {
    console.error("POST ERROR", error);
    return NextResponse.json(
      { message: "Lỗi đăng ký tài khoản" },
      { status: 500 }
    );
  }
}