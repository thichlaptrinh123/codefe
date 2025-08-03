import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb'; // ✅ sửa lại tên hàm đúng với import
import User from '@/model/user';
import jwt from 'jsonwebtoken';

// ✅ HÀM GET - LẤY THÔNG TIN NGƯỜI DÙNG
export async function GET(request: NextRequest) {
  try {
    await dbConnect(); // ✅ đúng tên hàm

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const user = await User.findById(userId).select('-password -otp -otpExpires');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // ✅ Nếu bạn muốn bỏ district/ward khỏi address ở response:
    const cleanAddress = (user.address || []).map((addr: any) => ({
      _id: addr._id,
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      street: addr.street,
      isDefault: addr.isDefault,
    }));

    return NextResponse.json({
      success: true,
      message: 'Lấy thông tin thành công',
      data: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        address: cleanAddress,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/user/information:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// ✅ HÀM PUT - CẬP NHẬT THÔNG TIN NGƯỜI DÙNG
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { username, phone, email } = body;

    if (!username || !phone) {
      return NextResponse.json(
        { success: false, message: 'Tên và số điện thoại là bắt buộc' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      phone,
      _id: { $ne: userId }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Số điện thoại đã được sử dụng' },
        { status: 400 }
      );
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        phone,
        email: email || '',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser
    });

  } catch (error: any) {
    console.error('Error in PUT /api/user/information:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
