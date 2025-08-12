// GET /api/voucher/list/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Voucher from "../../../../model/voucher";
//lấy voucher con hiệu lực 
export async function GET() {
  await dbConnect();
  const now = new Date();

  const vouchers = await Voucher.find({
    status: "active",
    start_day: { $lte: now },
    end_day: { $gte: now },
    quantity: { $gt: 0 },
  });

  return NextResponse.json({ vouchers });
}