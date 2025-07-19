import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Voucher from "@/model/voucher";
import UserVoucher from "@/model/user-voucher";

export async function GET() {
  await dbConnect();
  try {
    // Lấy toàn bộ voucher
    const vouchers = await Voucher.find().sort({ createdAt: -1 });

    // Lấy số người đã lưu mỗi voucher
    const userVouchers = await UserVoucher.aggregate([
      {
        $group: {
          _id: "$voucher_id",
          userCount: { $sum: 1 },
        },
      },
    ]);

    const userVoucherMap = Object.fromEntries(
      userVouchers.map((uv) => [uv._id.toString(), uv.userCount])
    );

    const formatted = vouchers.map((v) => ({
      _id: v._id,
      code: v.code,
      description: v.description,
      type: v.type || "percent",
      discount_percent: v.discount_percent,
      discount_amount: v.discount_amount,
      quantity: v.quantity,
      used_count: v.used_count || 0,
      start_day: v.start_day,
      end_day: v.end_day,
      min_order_value: v.min_order_value,
      max_discount_value: v.max_discount_value,
      status: v.status,
      createdAt: v.createdAt,
      user_collect_count: userVoucherMap[v._id.toString()] || 0,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách voucher", error },
      { status: 500 }
    );
  }
}
