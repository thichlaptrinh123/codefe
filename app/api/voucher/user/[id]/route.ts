//api/voucher/user/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/mongodb";
import UserVoucher from "../../../../../model/user-voucher";
import mongoose from "mongoose";

// Method: GET
// URL: http://localhost:3000/api/voucher/user/[id]
export async function GET(req: Request) {
  await dbConnect();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID người dùng không hợp lệ" }, { status: 400 });
    }

    const vouchers = await UserVoucher.find({ user_id: id }).populate("voucher_id");

    return NextResponse.json({
      vouchers: vouchers.map(v => v.voucher_id),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: String(error) },
      { status: 500 }
    );
  }
}