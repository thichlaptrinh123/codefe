// POST /api/voucher/create/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Voucher from "../../../../model/voucher";
import "@/model/user"

// POST http://localhost:3000/api/voucher/create
export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { code, start_day, end_day, quantity, ...rest } = body;

    // ✅ Kiểm tra trùng mã
    const existed = await Voucher.findOne({ code });
    if (existed) {
      return NextResponse.json({ error: "Mã đã tồn tại" }, { status: 400 });
    }

    const now = new Date();
    const start = new Date(start_day);
    const end = new Date(end_day);

    let status: "scheduled" | "active" | "inactive" = "inactive";

    if (start > now) {
      status = "scheduled";
    } else if (start <= now && end >= now) {
      status = "active";
    }
    
    const voucher = new Voucher({
      code,
      start_day: start,
      end_day: end,
      quantity: quantity || 1,
      ...rest,
      status, 
    });
    

    await voucher.save();

    return NextResponse.json({ message: "Tạo mã thành công", voucher });
  }  catch (error: any) {
    console.error("Voucher Creation Error:", error); // ✅ Log lỗi chi tiết
    return NextResponse.json(
      { error: "Lỗi khi tạo mã", details: error.message || String(error) },
      { status: 500 }
    );
  }
}