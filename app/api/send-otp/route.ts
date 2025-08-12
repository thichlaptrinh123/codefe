// /api/send-otp.ts
import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";
import { twilio } from "../../../lib/twilio";

const IS_TWILIO_TRIAL = true; // đổi thành false khi nâng cấp
const VERIFIED_NUMBER = "+84866537992"; // số đã verify trên Twilio

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Thiếu số điện thoại" }, { status: 400 });
    }

    // Chuẩn hóa số điện thoại
    let formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;

    // Nếu là trial → chỉ gửi tới số đã verify
    if (IS_TWILIO_TRIAL && formattedPhone !== VERIFIED_NUMBER) {
      return NextResponse.json({
        error: `Chỉ gửi OTP tới số đã xác minh: ${VERIFIED_NUMBER}`,
      }, { status: 400 });
    }

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Gửi OTP qua Twilio
    await twilio.messages.create({
      body: `Mã xác thực OTP của bạn là: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formattedPhone,
    });

    // Lưu vào DB
    await User.findOneAndUpdate(
      { phone: formattedPhone },
      {
        $set: {
          phone: formattedPhone,
          role: "customer",
          provider: "credentials",
          email: "",
          otp: otp,
          otpExpires: new Date(Date.now() + 5 * 60 * 1000),
          otpVerified: false,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "Gửi OTP thành công",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Không gửi được OTP" }, { status: 500 });
  }
}
