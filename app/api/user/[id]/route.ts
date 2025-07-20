import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import { convertRoleToDb } from "@/app/admin/components/user/role-utils";

// Lấy thông tin user theo ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const user = await User.findById(params.id).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy user" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Lỗi GET user:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy user" },
      { status: 500 }
    );
  }
}

// Cập nhật thông tin user theo ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
      role: role ? convertRoleToDb(role) : undefined,
      status: status === "active" ? 1 : 0,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (email) updateData.email = email;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Lỗi PUT user:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi cập nhật user" },
      { status: 500 }
    );
  }
}
