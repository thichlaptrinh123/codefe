import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";
import { twilio } from "../../../lib/twilio";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Thiếu số điện thoại" }, { status: 400 });
    }

    // Chuẩn hóa số điện thoại
    const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Gửi OTP qua Twilio
    await twilio.messages.create({
      body: `Mã xác thực OTP của bạn là: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formattedPhone,
    });

    // Cập nhật hoặc tạo user (upsert)
    await User.findOneAndUpdate(
      { phone: formattedPhone },
      {
        $set: {
          phone: formattedPhone,
          role: "customer", // hợp lệ với schema
          provider: "credentials",
          email: "",
          otp: otp,
          otpExpires: new Date(Date.now() + 5 * 60 * 1000),
          otpVerified: false,
        },
      },
      { upsert: true, new: true } // Tự động tạo nếu chưa tồn tại
    );

    return NextResponse.json({
      message: "Gửi OTP thành công",
      otp: process.env.NODE_ENV === "development" ? otp : undefined, // chỉ trả OTP khi dev
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Không gửi được OTP" }, { status: 500 });
  }
}
