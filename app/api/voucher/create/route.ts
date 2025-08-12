// api/voucher/create/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Voucher from "../../../../model/voucher";
import "@/model/user";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { code, start_day, end_day, quantity, status, ...rest } = body;

    // ✅ Kiểm tra trùng mã
    const existed = await Voucher.findOne({ code });
    if (existed) {
      return NextResponse.json({ error: "Mã đã tồn tại" }, { status: 400 });
    }

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );

    const start = new Date(start_day);
    const end = new Date(end_day);

    let finalStatus: "active" | "inactive" = "inactive";

    if (now >= start && now <= end) {
      // Nếu trong hiệu lực: lấy status user truyền (nếu hợp lệ)
      finalStatus = status === "inactive" ? "inactive" : "active";
    }

    const voucher = new Voucher({
      code,
      start_day: start,
      end_day: end,
      quantity: quantity || 1,
      ...rest,
      status: finalStatus,
    });

    await voucher.save();

    return NextResponse.json({ message: "Tạo mã thành công", voucher });
  } catch (error: any) {
    console.error("Voucher Creation Error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo mã", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
