import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import { NextRequest, NextResponse } from "next/server";

// GET: Lấy danh sách địa chỉ
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Thiếu userId" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Chuyển đổi địa chỉ cho frontend
    const addresses = (user.address || []).map((addr: any) => ({
      _id: addr._id.toString(),
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      province: addr.province || '',
      district: addr.district || '',
      ward: addr.ward || '',
      street: addr.street || '',
      fullAddress: `${addr.street ? addr.street + ', ' : ''}${addr.ward ? addr.ward + ', ' : ''}${addr.district ? addr.district + ', ' : ''}${addr.province || ''}`.replace(/^,\s*|,\s*$/g, ''),
      isDefault: addr.isDefault || false
    }));

    return NextResponse.json({ success: true, addresses }, { status: 200 });
  } catch (error: any) {
    console.error("GET Address Error:", error);
    return NextResponse.json({ success: false, message: `Lỗi: ${error.message}` }, { status: 500 });
  }
}

// POST: Thêm địa chỉ mới
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Thiếu userId" }, { status: 400 });
    }

    const body = await request.json();
    const { fullName, phone, province, district, ward, street, isDefault } = body;

    console.log("Received data:", { fullName, phone, province, district, ward, street, isDefault });

    // Kiểm tra thông tin bắt buộc - district có thể optional vì có thể từ ward name extract được
    if (!fullName?.trim() || !phone?.trim() || !province?.trim() || !ward?.trim() || !street?.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "Vui lòng điền đầy đủ thông tin địa chỉ (thiếu: " + 
        [
          !fullName?.trim() && "họ tên",
          !phone?.trim() && "điện thoại", 
          !province?.trim() && "tỉnh/thành",
          !ward?.trim() && "phường/xã",
          !street?.trim() && "địa chỉ cụ thể"
        ].filter(Boolean).join(", ") + ")"
      }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Khởi tạo mảng address nếu chưa có
    if (!user.address) {
      user.address = [];
    }

    // Nếu đặt làm mặc định hoặc là địa chỉ đầu tiên, bỏ mặc định của các địa chỉ khác
    if (isDefault || user.address.length === 0) {
      user.address.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // Tạo địa chỉ mới - district có thể empty hoặc extract từ ward name
    const newAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      province: province.trim(),
      district: district?.trim() || '', // Optional field
      ward: ward.trim(),
      street: street.trim(),
      isDefault: isDefault || user.address.length === 0
    };

    user.address.push(newAddress);
    const savedUser = await user.save();
    
    // Lấy địa chỉ vừa tạo
    const createdAddress = savedUser.address[savedUser.address.length - 1];

    return NextResponse.json({ 
      success: true, 
      message: "Thêm địa chỉ thành công", 
      address: {
        _id: createdAddress._id.toString(),
        fullName: createdAddress.fullName,
        phone: createdAddress.phone,
        province: createdAddress.province,
        district: createdAddress.district,
        ward: createdAddress.ward,
        street: createdAddress.street,
        fullAddress: `${createdAddress.street}, ${createdAddress.ward}${createdAddress.district ? ', ' + createdAddress.district : ''}, ${createdAddress.province}`,
        isDefault: createdAddress.isDefault
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST Address Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Lỗi server: ${error.message}` 
    }, { status: 500 });
  }
}

// PUT: Cập nhật địa chỉ
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Thiếu userId" }, { status: 400 });
    }

    const body = await request.json();
    const { addressId, fullName, phone, province, district, ward, street, isDefault } = body;

    // Kiểm tra thông tin bắt buộc
    if (!addressId || !fullName?.trim() || !phone?.trim() || !province?.trim() || !ward?.trim() || !street?.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "Vui lòng điền đầy đủ thông tin địa chỉ" 
      }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    const addressIndex = user.address.findIndex((addr: any) => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return NextResponse.json({ success: false, message: "Không tìm thấy địa chỉ" }, { status: 404 });
    }

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (isDefault) {
      user.address.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // Cập nhật địa chỉ
    user.address[addressIndex].fullName = fullName.trim();
    user.address[addressIndex].phone = phone.trim();
    user.address[addressIndex].province = province.trim();
    user.address[addressIndex].district = district?.trim() || '';
    user.address[addressIndex].ward = ward.trim();
    user.address[addressIndex].street = street.trim();
    user.address[addressIndex].isDefault = isDefault;

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Cập nhật địa chỉ thành công",
      address: {
        _id: user.address[addressIndex]._id.toString(),
        fullName: user.address[addressIndex].fullName,
        phone: user.address[addressIndex].phone,
        province: user.address[addressIndex].province,
        district: user.address[addressIndex].district,
        ward: user.address[addressIndex].ward,
        street: user.address[addressIndex].street,
        fullAddress: `${user.address[addressIndex].street}, ${user.address[addressIndex].ward}${user.address[addressIndex].district ? ', ' + user.address[addressIndex].district : ''}, ${user.address[addressIndex].province}`,
        isDefault: user.address[addressIndex].isDefault
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("PUT Address Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Lỗi server: ${error.message}` 
    }, { status: 500 });
  }
}

// DELETE: Xóa địa chỉ
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Thiếu userId" }, { status: 400 });
    }

    const body = await request.json();
    const { addressId } = body;

    if (!addressId) {
      return NextResponse.json({ success: false, message: "Thiếu addressId" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    const addressIndex = user.address.findIndex((addr: any) => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return NextResponse.json({ success: false, message: "Không tìm thấy địa chỉ" }, { status: 404 });
    }

    const wasDefault = user.address[addressIndex].isDefault;
    
    // Xóa địa chỉ
    user.address.splice(addressIndex, 1);

    // Nếu địa chỉ vừa xóa là mặc định và còn địa chỉ khác, đặt cái đầu tiên làm mặc định
    if (wasDefault && user.address.length > 0) {
      user.address[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Xóa địa chỉ thành công" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("DELETE Address Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Lỗi server: ${error.message}` 
    }, { status: 500 });
  }
}