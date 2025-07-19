// app/api/user/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import { convertRoleToDb } from "@/app/admin/components/user/role-utils";


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const body = await req.json();

  try {
    const { name, password, phone, email, role, status, address } = body;

    // Kiểm tra trùng tên hoặc số điện thoại (trừ chính user đó)
    const existing = await User.findOne({
      $or: [{ username: name }, { phone }],
      _id: { $ne: id },
    });

    if (existing) {
      const field = existing.username === name ? "Tên người dùng" : "Số điện thoại";
      return NextResponse.json(
        { success: false, message: `${field} đã được sử dụng` },
        { status: 409 }
      );
    }

    const updateData: any = {
      username: name,
      phone,
      role: convertRoleToDb(role), 
      status: status === "active" ? 1 : 0,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (email) updateData.email = email;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi cập nhật user", error },
      { status: 500 }
    );
  }
}
