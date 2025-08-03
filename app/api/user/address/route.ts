import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// GET - Lấy danh sách địa chỉ
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token không hợp lệ' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const user = await User.findById(userId).select('address');
    if (!user) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lấy danh sách địa chỉ thành công',
      data: user.address || []
    });

  } catch (error: any) {
    console.error('GET /api/user/address error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Lỗi server nội bộ' }, { status: 500 });
  }
}

// POST - Thêm địa chỉ mới
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token không hợp lệ' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { fullName, phone, province, street, isDefault } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ success: false, message: 'Họ tên và số điện thoại là bắt buộc' }, { status: 400 });
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      fullName,
      phone,
      province: province || '',
      street: street || '',
      isDefault: Boolean(isDefault)
    };

    if (newAddress.isDefault) {
      await User.findByIdAndUpdate(userId, {
        $set: { "address.$[].isDefault": false }
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { address: newAddress } },
      { new: true, runValidators: true }
    ).select('address');

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Thêm địa chỉ thành công',
      data: updatedUser.address
    });

  } catch (error: any) {
    console.error('POST /api/user/address error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Lỗi server nội bộ' }, { status: 500 });
  }
}

// PUT - Cập nhật địa chỉ
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token không hợp lệ' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { addressId, fullName, phone, province, street, isDefault } = body;

    if (!addressId) {
      return NextResponse.json({ success: false, message: 'ID địa chỉ là bắt buộc' }, { status: 400 });
    }

    if (isDefault) {
      await User.findByIdAndUpdate(userId, {
        $set: { "address.$[].isDefault": false }
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.fullName": fullName || '',
          "address.$.phone": phone || '',
          "address.$.province": province || '',
          "address.$.street": street || '',
          "address.$.isDefault": Boolean(isDefault)
        }
      },
      { new: true, runValidators: true }
    ).select('address');

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy địa chỉ' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      data: updatedUser.address
    });

  } catch (error: any) {
    console.error('PUT /api/user/address error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Lỗi server nội bộ' }, { status: 500 });
  }
}

// DELETE - Xóa địa chỉ
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token không hợp lệ' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');

    if (!addressId) {
      return NextResponse.json({ success: false, message: 'ID địa chỉ là bắt buộc' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { address: { _id: addressId } } },
      { new: true }
    ).select('address');

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa địa chỉ thành công',
      data: updatedUser.address
    });

  } catch (error: any) {
    console.error('DELETE /api/user/address error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Lỗi server nội bộ' }, { status: 500 });
  }
}
