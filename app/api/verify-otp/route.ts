import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";

// POST: http://localhost:3000/api/verify-otp
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Vui lòng nhập số điện thoại và OTP" },
        { status: 400 }
      );
    }

    const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;
    const user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng cho số điện thoại này" },
        { status: 404 }
      );
    }

    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return NextResponse.json(
        { error: "OTP không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json(
        { error: "Sai mã OTP" },
        { status: 400 }
      );
    }

    // Xác minh OTP thành công
    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Xác minh OTP thành công" });
  } catch (error) {
    console.error("Lỗi verify-otp:", error);
    return NextResponse.json({ error: "Lỗi server khi xác minh OTP" }, { status: 500 });
  }
}
