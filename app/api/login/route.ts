import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function normalizePhone(phone: string) {
  if (phone.startsWith("+84")) {
    return "0" + phone.slice(3);
  }
  return phone;
}

export async function POST(req: Request) {
  await dbConnect();
  const { phone, password } = await req.json();

  try {
    const normalizedPhone = normalizePhone(phone);

    // Tìm theo cả 2 dạng
    const user = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { phone: "+84" + normalizedPhone.slice(1) }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { message: "Số điện thoại không tồn tại" },
        { status: 400 }
      );
    }

    // Nếu tài khoản không có password (login bằng Google) thì báo lỗi
    if (!user.password) {
      return NextResponse.json(
        { message: "Tài khoản này không hỗ trợ đăng nhập bằng mật khẩu" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Mật khẩu không đúng" },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Trả về JSON + set cookie
    const res = NextResponse.json({ success: true, user }, { status: 200 });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
