import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../../lib/mongodb";
import User from "../../../../model/user";
//Method: POST
//http://localhost:3000/api/reset-password
export async function POST(req: Request) {
  await dbConnect();
  const { phone, newPassword } = await req.json();

  const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;
  const user = await User.findOne({ phone: formattedPhone });

  if (!user) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
  if (!user.otpVerified) return NextResponse.json({ error: "Chưa xác minh OTP" }, { status: 403 });

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpires = null;
  user.otpVerified = false;
  await user.save();

  return NextResponse.json({ message: "Đổi mật khẩu thành công" });
}
