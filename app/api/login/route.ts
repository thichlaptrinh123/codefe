import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";               //  so sánh mật khẩu đã mã hoá
const jwt = require("jsonwebtoken");
import { dbConnect } from "../../../lib/mongodb";  
import User from "../../../model/user";  


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

//Method: POST
//http://localhost:3000/api/login 
export async function POST(request: NextRequest) {
  try {
    await dbConnect(); 

    const { username, phone, password } = await request.json();

   //ko mk
    if (!password) {
      return NextResponse.json({ message: "Vui lòng nhập mật khẩu" }, { status: 400 });
    }

    // // ko usernam và ko gmail
    // if (!username && !email && !phone) {
    //   return NextResponse.json({ message: "Vui lòng nhập tên đăng nhập, email hoặc số điện thoại" }, { status: 400 });
    // }

    // //  định dạng email 
    // if (email && !/^[^\s@]+@gmail\.com$/.test(email)) {
    //   return NextResponse.json({ message: "Email phải đúng định dạng @gmail.com" }, { status: 400 });
    // }

    // sđt 10 so
    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ message: "Số điện thoại phải gồm 10 chữ số" }, { status: 400 });
    }

    // Tìm user theo username, nếu không có thì tìm theo email, sau đó đến phone
    const user =
      (username && await User.findOne({ username })) ||
      // (email && await User.findOne({ email })) ||
      (phone && await User.findOne({ phone }));

  
    if (!user) {
      return NextResponse.json({ message: "Thông tin đăng nhập không đúng" }, { status: 401 });
    }

    // Nếu user bị khoá -> báo lỗi
    if (user.isBlocked) {
      return NextResponse.json({ message: "Tài khoản đã bị khóa" }, { status: 403 });
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã mã hoá trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Thông tin đăng nhập không đúng" }, { status: 401 });
    }

    // Tạo token JWT 7day
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        // email: user.email,
        phone: user.phone,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Loại bỏ mật khẩu khỏi thông tin trả về
    const { password: _, ...userInfo } = user.toObject();

    // Trả kết quả về client
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