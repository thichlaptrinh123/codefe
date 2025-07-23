import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export async function POST(request: NextRequest) {
  try {
    // Kết nối DB
    try {
      await dbConnect();
    } catch (dbError) {
      console.error("Lỗi kết nối DB:", dbError);
      return NextResponse.json(
        { message: "Không thể kết nối cơ sở dữ liệu" },
        { status: 500 }
      );
    }

    // Lấy token từ header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Thiếu token xác thực" },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];

    // Lấy dữ liệu từ body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { message: "Dữ liệu gửi lên không hợp lệ" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu mới phải ít nhất 6 ký tự" },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Mật khẩu mới không khớp" },
        { status: 400 }
      );
    }

    // Giải mã token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error("Lỗi verify token:", jwtError);
      return NextResponse.json(
        { message: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    // Kiểm tra người dùng
    const userId = (decoded as any).id;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }
    if (!user.password) {
      return NextResponse.json(
        { message: "Tài khoản Google không có mật khẩu để đổi" },
        { status: 400 }
      );
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Mật khẩu hiện tại không đúng" },
        { status: 400 }
      );
    }

    // Cập nhật mật khẩu mới
    try {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
    } catch (saveError) {
      console.error("Lỗi lưu mật khẩu:", saveError);
      return NextResponse.json(
        { message: "Không thể cập nhật mật khẩu" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
