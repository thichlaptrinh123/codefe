import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
const jwt = require("jsonwebtoken");
import { dbConnect } from "../../../lib/mongodb";
import User from "../../../model/user";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { phone, password } = await request.json();

    // Kiểm tra dữ liệu
    if (!phone || !password) {
      return NextResponse.json({ message: "Vui lòng nhập số điện thoại và mật khẩu" }, { status: 400 });
    }

    // Định dạng số điện thoại
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ message: "Số điện thoại phải gồm 10 chữ số" }, { status: 400 });
    }

    // Tìm user theo số điện thoại
    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ message: "Thông tin đăng nhập không đúng" }, { status: 401 });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === 0) {
      return NextResponse.json({ message: "Tài khoản đã bị khóa" }, { status: 403 });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Thông tin đăng nhập không đúng" }, { status: 401 });
    }

    // Tạo token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, phone: user.phone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Xóa password khỏi kết quả trả về
    const { password: _, ...userInfo } = user.toObject();

    return NextResponse.json({
      message: "Đăng nhập thành công",
      user: userInfo,
      token,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
