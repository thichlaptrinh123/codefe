import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";

// PUT - Cập nhật địa chỉ
export async function PUT(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string; addressId: string }> }
  ) {
    await dbConnect();
    
    try {
      const { id, addressId } = await params;
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
  
      const address = user.address.id(addressId);
      if (!address) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy địa chỉ' }, 
          { status: 404 }
        );
      }
  
      // Nếu đánh dấu địa chỉ này là mặc định => bỏ mặc định các địa chỉ khác
      if (isDefault) {
        user.address.forEach((addr: any) => {
          if (addr._id.toString() !== addressId) {
            addr.isDefault = false;
          }
        });
      }
  
      // Cập nhật thông tin địa chỉ
      address.fullName = fullName.trim();
      address.phone = phone.trim();
      address.province = province;
      address.district = ''; // Keep empty for compatibility with schema
      address.ward = ward;
      address.street = street.trim();
      address.isDefault = isDefault || false;
  
      await user.save();
  
      return NextResponse.json(
        { success: true, message: 'Cập nhật địa chỉ thành công' }, 
        { status: 200 }
      );
    } catch (error) {
      console.error('PUT address error:', error);
      return NextResponse.json(
        { success: false, message: 'Lỗi server' }, 
        { status: 500 }
      );
    }
  }
  
  // DELETE - Xóa địa chỉ
  export async function DELETE(
    _: NextRequest, 
    { params }: { params: Promise<{ id: string; addressId: string }> }
  ) {
    await dbConnect();
    
    try {
      const { id, addressId } = await params;
      
      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy người dùng' }, 
          { status: 404 }
        );
      }
  
      const address = user.address.id(addressId);
      if (!address) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy địa chỉ' }, 
          { status: 404 }
        );
      }
  
      // Xóa địa chỉ
      user.address.pull(addressId);
      await user.save();
  
      return NextResponse.json(
        { success: true, message: 'Xóa địa chỉ thành công' }, 
        { status: 200 }
      );
    } catch (error) {
      console.error('DELETE address error:', error);
      return NextResponse.json(
        { success: false, message: 'Lỗi server' }, 
        { status: 500 }
      );
    }
  }
