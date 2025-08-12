// app/api/user/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import { convertRoleToDb } from "@/app/admin/components/user/role-utils";
import "@/model/order";

export async function GET() {
  await dbConnect();
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "orders", // tên collection (đúng với MongoDB, thường là "orders")
          localField: "_id",
          foreignField: "id_user", // hoặc "customerId" tuỳ DB bạn
          as: "orders",
        },
      },
      {
        $addFields: {
          orderCount: { $size: "$orders" },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          phone: 1,
          address: 1,
          role: 1,
          status: 1,
          orderCount: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const formatted = users.map((u) => ({
      _id: u._id,
      name: u.username,
      email: u.email || "",
      phone: u.phone,
      address: u.address || "",
      role: u.role,
      status: u.status === 1 ? "active" : "inactive",
      orderCount: u.orderCount || 0,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Lỗi khi lấy user:", error);
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách user", error },
      { status: 500 }
    );
  }
}




export async function POST(req: Request) {
  await dbConnect();
  try {
    const { name, password, phone, email, role, status, address } = await req.json();

    if (!name || !password || !phone || !email) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu bắt buộc" },
        { status: 400 }
      );
    }

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+84" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("+84")) {
      formattedPhone = "+84" + formattedPhone;
    }
    

    // Check trùng username hoặc phone đã tồn tại
    const existing = await User.findOne({
      $or: [{ username: name }, { phone: formattedPhone }],
    });
    if (existing) {
      const field = existing.username === name ? "Tên người dùng" : "Số điện thoại";
      return NextResponse.json(
        { success: false, message: `${field} đã được sử dụng` },
        { status: 409 }
      );
    }

    if (!password.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mật khẩu" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Chuẩn hóa role và status
    const dbRole = convertRoleToDb(role);
    const dbStatus = status === "active" ? 1 : 0;
    const dbAddress = Array.isArray(address) ? address : [];
    
    const newUser = await User.create({
      username: name,
      password: hashedPassword,
      phone: formattedPhone,
      email,
      address: dbAddress,
      role: dbRole,
      status: dbStatus,
    });
    
    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("Lỗi POST tạo user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi tạo user" },
      { status: 500 }
    );
  }
}
