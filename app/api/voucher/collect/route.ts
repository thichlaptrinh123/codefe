// POST /api/voucher/collect/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import UserVoucher from "../../../../model/user-voucher";

export async function POST(req: Request) {
  await dbConnect();
  const { user_id, voucher_id } = await req.json();

  if (!user_id || !voucher_id) {
    return NextResponse.json({ error: "Thiếu user_id hoặc voucher_id" }, { status: 400 });
  }

  const already = await UserVoucher.findOne({ user_id, voucher_id });
  if (already) {
    return NextResponse.json({ message: "Đã lưu mã này rồi" });
  }

  const saved = new UserVoucher({ user_id, voucher_id });
  await saved.save();

  return NextResponse.json({ message: "Lưu mã thành công", saved });
}