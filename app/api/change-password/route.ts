import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
const jwt = require("jsonwebtoken");
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// Method: POST
// Endpoint: http://localhost:3000/api/change-password
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Lấy token từ header Authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Thiếu token xác thực" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]; // Lấy phần token sau "Bearer "

    // Lấy dữ liệu từ body
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "Mật khẩu mới không khớp" }, { status: 400 });
    }

    // Giải mã token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 });
    }

    const userId = (decoded as any).id;

    // Tìm user theo id
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "Người dùng không tồn tại" }, { status: 404 });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Mật khẩu hiện tại không đúng" }, { status: 400 });
    }

    // Mã hóa và cập nhật mật khẩu mới
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
