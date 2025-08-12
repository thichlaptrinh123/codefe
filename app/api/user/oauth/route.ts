// app/api/user/oauth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose'; // ✅ Thêm dòng này
import { dbConnect } from '@/lib/mongodb';
import User from '@/model/user';
import jwt from 'jsonwebtoken';
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, username, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username,
        email,
        avatar,
        provider: 'google',
      });
    } else {
      user.username = username;
      user.avatar = avatar;
      user.provider = 'google';
      await user.save({ validateBeforeSave: false });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone || '',
        provider: 'google',
      },
    });
  } catch (error: any) {
    console.error('OAuth POST Error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong',
      message: error.message 
    }, { status: 500 });
  }
}
// ✅ CẬP NHẬT USER QUA GOOGLE OAUTH
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, email, username, phone, avatar } = await req.json();

    if (!id && !email) {
      return NextResponse.json(
        { message: "Cần ID hoặc email để cập nhật" },
        { status: 400 }
      );
    }

    let user = null;
    const updateData: any = {};

    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    // Nếu có id hợp lệ thì update theo id
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
    }

    // Nếu chưa tìm thấy thì thử update theo email
    if (!user && email) {
      user = await User.findOneAndUpdate(
        { email },
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
    }

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy user để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thành công",
      user,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật OAuth user:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    );
  }
}


export async function GET() {
  return NextResponse.json({ 
    message: 'OAuth API endpoint',
    methods: ['POST', 'PUT']
  }, { status: 200 });
}