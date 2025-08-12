import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, email, oldPassword, newPassword, isGoogleAccount } = body;

    // Validate input
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự"
      }, { status: 400 });
    }

    // Validate password strength
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      return NextResponse.json({
        success: false,
        message: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số"
      }, { status: 400 });
    }

    let user;

    if (isGoogleAccount) {
      // Tài khoản Google - tìm theo email
      if (!email) {
        return NextResponse.json({
          success: false,
          message: "Thiếu email cho tài khoản Google"
        }, { status: 400 });
      }

      user = await User.findOne({ email: email });
      if (!user) {
        return NextResponse.json({
          success: false,
          message: "Không tìm thấy tài khoản"
        }, { status: 404 });
      }

      // Tài khoản Google - chỉ cần tạo mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;

    } else {
      // Tài khoản thủ công - tìm theo userId
      if (!userId) {
        return NextResponse.json({
          success: false,
          message: "Thiếu userId cho tài khoản thủ công"
        }, { status: 400 });
      }

      if (!oldPassword) {
        return NextResponse.json({
          success: false,
          message: "Vui lòng nhập mật khẩu cũ"
        }, { status: 400 });
      }

      user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({
          success: false,
          message: "Không tìm thấy tài khoản"
        }, { status: 404 });
      }

      // Kiểm tra mật khẩu cũ
      if (!user.password) {
        return NextResponse.json({
          success: false,
          message: "Tài khoản chưa có mật khẩu"
        }, { status: 400 });
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return NextResponse.json({
          success: false,
          message: "Mật khẩu cũ không chính xác"
        }, { status: 400 });
      }

      // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return NextResponse.json({
          success: false,
          message: "Mật khẩu mới phải khác mật khẩu cũ"
        }, { status: 400 });
      }

      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
    }

    // Lưu user với mật khẩu mới
    await user.save();

    return NextResponse.json({
      success: true,
      message: isGoogleAccount 
        ? "Tạo mật khẩu thành công! Bạn có thể đăng nhập bằng email/password."
        : "Đổi mật khẩu thành công!"
    }, { status: 200 });

  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({
      success: false,
      message: `Lỗi server: ${error.message}`
    }, { status: 500 });
  }
}

// Không cho phép các method khác
export async function GET() {
  return NextResponse.json({
    success: false,
    message: "Method GET không được phép"
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    message: "Method PUT không được phép"
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    message: "Method DELETE không được phép"
  }, { status: 405 });
}