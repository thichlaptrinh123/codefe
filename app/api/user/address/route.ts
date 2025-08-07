import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import { NextRequest, NextResponse } from "next/server";

// GET: Lấy danh sách địa chỉ
export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Thiếu userId" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, addresses: user.address || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Thêm địa chỉ
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Thiếu userId" }, { status: 400 });
    }

    const { fullName, phone, address, isDefault } = await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    if (!user.address) user.address = [];

    if (isDefault) {
      user.address = user.address.map((addr: any) => ({ ...addr.toObject(), isDefault: false }));
    }

    const newAddress = {
      _id: new Date().getTime().toString(),
      fullName,
      phone,
      address, // <-- Chỉ 1 dòng địa chỉ
      isDefault: isDefault || user.address.length === 0
    };

    user.address.push(newAddress);
    await user.save();

    return NextResponse.json({ success: true, message: "Thêm địa chỉ thành công", address: newAddress }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật địa chỉ
export async function PUT(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Thiếu userId" }, { status: 400 });
    }

    const { addressId, fullName, phone, address, isDefault } = await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    const index = user.address.findIndex((addr: any) => addr._id === addressId);
    if (index === -1) {
      return NextResponse.json({ success: false, message: "Không tìm thấy địa chỉ" }, { status: 404 });
    }

    if (isDefault) {
      user.address = user.address.map((addr: any) => ({ ...addr.toObject(), isDefault: false }));
    }

    user.address[index] = {
      ...user.address[index].toObject(),
      fullName,
      phone,
      address,
      isDefault
    };

    await user.save();

    return NextResponse.json({ success: true, message: "Cập nhật địa chỉ thành công", address: user.address[index] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Xóa địa chỉ
export async function DELETE(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const { addressId } = await request.json();

    if (!userId || !addressId) {
      return NextResponse.json({ success: false, message: "Thiếu userId hoặc addressId" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    const index = user.address.findIndex((addr: any) => addr._id === addressId);
    if (index === -1) {
      return NextResponse.json({ success: false, message: "Không tìm thấy địa chỉ" }, { status: 404 });
    }

    const wasDefault = user.address[index].isDefault;
    user.address.splice(index, 1);

    if (wasDefault && user.address.length > 0) {
      user.address[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({ success: true, message: "Xóa địa chỉ thành công" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}