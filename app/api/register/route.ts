import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";

// POST: http://localhost:3000/api/register
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username, password, confirmPassword, phone } = await request.json();

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password || !confirmPassword || !phone) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Mật khẩu nhập lại không khớp" },
        { status: 400 }
      );
    }

    // Format số điện thoại
    const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;

    // Kiểm tra user đã xác minh OTP
    const existingUser = await User.findOne({ phone: formattedPhone });
    if (!existingUser) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng, vui lòng xác minh OTP trước" },
        { status: 404 }
      );
    }

    if (!existingUser.otpVerified) {
      return NextResponse.json(
        { message: "Vui lòng xác minh OTP trước khi đăng ký" },
        { status: 403 }
      );
    }

    if (existingUser.password) {
      return NextResponse.json(
        { message: "Số điện thoại này đã được sử dụng" },
        { status: 409 }
      );
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu thông tin user
    existingUser.username = username;
    existingUser.password = hashedPassword;
    await existingUser.save();

    const { password: _, otp, otpExpires, otpVerified, ...userInfo } = existingUser.toObject();

    return NextResponse.json({
      message: "Đăng ký thành công",
      user: userInfo,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
