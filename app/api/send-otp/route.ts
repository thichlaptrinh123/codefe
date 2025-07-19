import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";
import { twilio } from "../../../lib/twilio";

export async function POST(req: Request) {
  await dbConnect();

  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "Thiếu số điện thoại" }, { status: 400 });
  }

  const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await twilio.messages.create({
      body: `Mã xác thực OTP của bạn là: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formattedPhone,
    });

    let user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      user = new User({
        phone: formattedPhone,
        role: "customer",        // Đảm bảo hợp lệ
        provider: "credentials",
        email: "",               // Đặt email rỗng để tránh lỗi
      });
    }

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.otpVerified = false;
    await user.save();

    return NextResponse.json({
      message: "Gửi OTP thành công",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Không gửi được OTP" }, { status: 500 });
  }
}
