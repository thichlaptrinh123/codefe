// File: app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";
//Method: POST
//http://localhost:3000/api/register
export async function POST(request: NextRequest) {
  await dbConnect();

  const {
    username,
    password,
    confirmPassword,
    phone,
  } = await request.json();

  if (!username || !password || !confirmPassword || !phone) {
    return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ message: "Mật khẩu nhập lại không khớp" }, { status: 400 });
  }

  const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;
  const existingUser = await User.findOne({ phone: formattedPhone });

  if (!existingUser || !existingUser.otpVerified) {
    return NextResponse.json({ message: "Vui lòng xác minh OTP trước khi đăng ký" }, { status: 403 });
  }

  if (existingUser.password) {
    return NextResponse.json({ message: "Số điện thoại này đã được sử dụng" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  existingUser.username = username;
  existingUser.password = hashedPassword;
  await existingUser.save();

  const { password: _, otp, otpExpires, otpVerified, ...userInfo } = existingUser.toObject();

  return NextResponse.json({
    message: "Đăng ký thành công",
    user: userInfo,
  });
}
