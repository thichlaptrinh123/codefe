// GET /api/voucher/list-all/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Voucher from "../../../../model/voucher";
//lấy tất cả voucher admin
export async function GET() {
  await dbConnect();

  const vouchers = await Voucher.find().sort({ createdAt: -1 });
  return NextResponse.json({ vouchers });
}