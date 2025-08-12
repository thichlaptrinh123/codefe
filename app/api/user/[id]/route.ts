// // app/api/user/[id]/route.ts
// import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/mongodb";
// import User from "@/model/user";
// import bcrypt from "bcryptjs";
// import { convertRoleToDb } from "@/app/admin/components/user/role-utils";


// export async function PUT(req: Request, { params }: { params: any }) {
//   await dbConnect();
//   const { id } = params;
//   const body = await req.json();

//   try {
//     const { name, password, phone, email, role, status, address } = body;

//     // Kiểm tra trùng tên hoặc số điện thoại (trừ chính user đó)
//     const existing = await User.findOne({
//       $or: [{ username: name }, { phone }],
//       _id: { $ne: id },
//     });

//     if (existing) {
//       const field = existing.username === name ? "Tên người dùng" : "Số điện thoại";
//       return NextResponse.json(
//         { success: false, message: `${field} đã được sử dụng` },
//         { status: 409 }
//       );
//     }

//     const updateData: any = {
//       username: name,
//       phone,
//       role: convertRoleToDb(role), 
//       status: status === "active" ? 1 : 0,
//     };

//     if (password) {
//       updateData.password = await bcrypt.hash(password, 10);
//     }

//     if (email) updateData.email = email;
//     if (address) updateData.address = address;

//     const updatedUser = await User.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     return NextResponse.json({ success: true, user: updatedUser });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: "Lỗi cập nhật user", error },
//       { status: 500 }
//     );
//   }
// }


// app/api/user/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import { convertRoleToDb } from "@/app/admin/components/user/role-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth"; 
export async function PUT(req: Request, { params }: { params: any }) {
  await dbConnect();
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const { name, password, phone, email, role, status, address } = body;

  try {
    if (!session.user) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    
    if (session.user.role !== "admin" && session.user.id !== id) {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
    }
    

    // Format số điện thoại trước khi kiểm tra trùng
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+84" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("+84")) {
      formattedPhone = "+84" + formattedPhone;
    }

    // Kiểm tra trùng username/phone
    const existing = await User.findOne({
      $or: [{ username: name }, { phone: formattedPhone }],
      _id: { $ne: id },
    });
    if (existing) {
      const field = existing.username === name ? "Tên người dùng" : "Số điện thoại";
      return NextResponse.json({ success: false, message: `${field} đã được sử dụng` }, { status: 409 });
    }

    const updateData: any = {
      username: name,
      phone: formattedPhone, // lưu dạng +84
      email,
      address
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Chỉ admin mới có thể update role và status
    if (session.user.role === "admin") {
      if (role) updateData.role = convertRoleToDb(role);
      if (status) updateData.status = status === "active" ? 1 : 0;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi cập nhật user", error }, { status: 500 });
  }
}
