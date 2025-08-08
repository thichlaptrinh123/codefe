// POST /api/voucher/apply/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Voucher from "../../../../model/voucher";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { code, total } = await req.json();
    const now = new Date();

    if (!code || !total) {
      return NextResponse.json({ error: "Thiếu mã hoặc tổng đơn hàng" }, { status: 400 });
    }

    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      status: "active",
      start_day: { $lte: now },
      end_day: { $gte: now },
      quantity: { $gt: 0 },
    });

    if (!voucher) {
      return NextResponse.json({ error: "Mã không hợp lệ hoặc đã hết hiệu lực" }, { status: 400 });
    }

    if (total < 30000) {
      return NextResponse.json({ error: "Đơn hàng phải tối thiểu 30.000đ" }, { status: 400 });
    }

    const rawDiscount = Math.floor((voucher.discount_percent / 100) * total);
    const maxDiscount = voucher.max_discount || rawDiscount;
    const finalDiscount = Math.min(rawDiscount, maxDiscount);
    const finalPrice = total - finalDiscount;

    voucher.used_count += 1;
    voucher.quantity -= 1;
    await voucher.save();

    return NextResponse.json({
      message: "Áp dụng mã thành công",
      discount: finalDiscount,
      finalPrice,
      voucher,
    });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống", details: String(error) }, { status: 500 });
  }
}