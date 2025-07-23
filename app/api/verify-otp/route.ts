import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";

// POST: http://localhost:3000/api/verify-otp
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { phone, otp } = await req.json();

    // 1. Kiểm tra dữ liệu đầu vào
    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập số điện thoại và OTP" },
        { status: 400 }
      );
    }

    // 2. Validate số điện thoại
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)" },
        { status: 400 }
      );
    }

    // 3. Validate OTP (6 số)
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return NextResponse.json(
        { success: false, message: "Mã OTP phải gồm 6 chữ số" },
        { status: 400 }
      );
    }

    const formattedPhone = phone.startsWith("+") ? phone : `+84${phone.slice(1)}`;
    const user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng cho số điện thoại này" },
        { status: 404 }
      );
    }

    // 4. Kiểm tra OTP còn hiệu lực
    if (!user.otp || !user.otpExpires || new Date(user.otpExpires) < new Date()) {
      return NextResponse.json(
        { success: false, message: "OTP không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Sai mã OTP" },
        { status: 400 }
      );
    }

    // 5. Xác minh OTP thành công
    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Xác minh OTP thành công" });
  } catch (error: any) {
    console.error("Lỗi verify-otp:", error.message || error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi xác minh OTP" },
      { status: 500 }
    );
  }
}
