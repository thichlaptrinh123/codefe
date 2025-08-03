import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";

// Kết nối database
await dbConnect();

// GET - Lấy danh sách địa chỉ
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, addresses: user.address || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET address error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

// POST - Thêm địa chỉ mới
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { fullName, phone, province, ward, street, isDefault } = body;

    // Validation
    if (!fullName?.trim() || !phone?.trim() || !province || !ward || !street?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Nếu là địa chỉ mặc định, bỏ mặc định các địa chỉ khác
    if (isDefault && Array.isArray(user.address)) {
      user.address.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      province,
      district: '', // Keep empty for compatibility with schema
      ward,
      street: street.trim(),
      isDefault: isDefault || false,
    };

    user.address = user.address || [];
    user.address.push(newAddress);
    await user.save();

    return NextResponse.json(
      { success: true, message: 'Thêm địa chỉ thành công' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST address error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}