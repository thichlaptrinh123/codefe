import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Dữ liệu gửi lên không hợp lệ" },
        { status: 400 }
      );
    }

    const { username, password, confirmPassword, phone } = body;

    // 1. Kiểm tra dữ liệu rỗng
    if (!username || !password || !confirmPassword || !phone) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra định dạng username
    if (!/^[a-zA-Z0-9_ ]+$/.test(username)) {
      return NextResponse.json(
        { message: "Tên người dùng chỉ được chứa chữ, số và dấu gạch dưới" },
        { status: 400 }
      );
    }

    // 3. Kiểm tra độ dài password
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu phải ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // 4. Password phải có cả chữ và số
    if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
      return NextResponse.json(
        { message: "Mật khẩu phải bao gồm cả chữ và số" },
        { status: 400 }
      );
    }

    // 5. Kiểm tra confirm password
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Mật khẩu nhập lại không khớp" },
        { status: 400 }
      );
    }

    // 6. Kiểm tra định dạng phone (10 số, bắt đầu bằng 0)
    if (!/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        { message: "Số điện thoại không hợp lệ" },
        { status: 400 }
      );
    }

    const formattedPhone = phone.startsWith("+")
      ? phone
      : `+84${phone.slice(1)}`;

    // 7. Kiểm tra OTP
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

    // 8. Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      console.error("Lỗi mã hóa mật khẩu:", error);
      return NextResponse.json(
        { message: "Lỗi xử lý mật khẩu" },
        { status: 500 }
      );
    }

    // 9. Lưu user
    existingUser.username = username;
    existingUser.password = hashedPassword;
    await existingUser.save();

    const { password: _, otp, otpExpires, otpVerified, ...userInfo } =
      existingUser.toObject();

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
