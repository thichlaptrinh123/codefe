import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    const {
      username,
      password,
      confirmPassword,
      phone,
      provider = "credentials", // Mặc định là credentials (đăng ký thủ công)
    } = body;

    // Kiểm tra chung bắt buộc username
    if (!username) {
      return NextResponse.json(
        { message: "Vui lòng nhập tên người dùng" },
        { status: 400 }
      );
    }

    // Nếu provider là credentials (đăng ký thủ công), bắt buộc password, confirmPassword, phone
    if (provider === "credentials") {
      if (!password || !confirmPassword || !phone) {
        return NextResponse.json(
          { message: "Vui lòng nhập đầy đủ mật khẩu, xác nhận mật khẩu và số điện thoại" },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { message: "Mật khẩu phải ít nhất 6 ký tự" },
          { status: 400 }
        );
      }

      if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
        return NextResponse.json(
          { message: "Mật khẩu phải bao gồm cả chữ và số" },
          { status: 400 }
        );
      }

      if (password !== confirmPassword) {
        return NextResponse.json(
          { message: "Mật khẩu nhập lại không khớp" },
          { status: 400 }
        );
      }

      // Validate số điện thoại VN (ví dụ)
      if (!/^0\d{9}$/.test(phone)) {
        return NextResponse.json(
          { message: "Số điện thoại không hợp lệ" },
          { status: 400 }
        );
      }
    }

    // Format phone (nếu có)
    const formattedPhone = phone
      ? phone.startsWith("+")
        ? phone
        : `+84${phone.slice(1)}`
      : null;

    // Nếu đăng ký thủ công, kiểm tra user theo phone và OTP verified
    let existingUser = null;
    if (provider === "credentials") {
      existingUser = await User.findOne({ phone: formattedPhone });

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
    } else {
      // Với provider khác, tìm user theo username hoặc email nếu muốn tránh trùng
      existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { message: "Tên người dùng đã tồn tại" },
          { status: 409 }
        );
      }
    }

    // Hash password nếu có
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (provider === "credentials") {
      // Cập nhật user tồn tại (đã tạo khi gửi OTP)
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.provider = provider;
      existingUser.phone = formattedPhone;

      await existingUser.save();
    } else {
      // Tạo user mới với provider khác (Google,...)
      const newUser = new User({
        username,
        provider,
        password: hashedPassword,
        phone: formattedPhone,
        otpVerified: true, // Bỏ qua OTP với provider khác
      });
      await newUser.save();
      existingUser = newUser;
    }

    const { password: _, otp, otpExpires, otpVerified, ...userInfo } =
      existingUser.toObject();

    // Tạo JWT token
    const token = jwt.sign(
      { id: existingUser._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: "365d" }
    );

    return NextResponse.json({
      message: "Đăng ký thành công",
      token,
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
