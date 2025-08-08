// api/voucher/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Voucher from "@/model/voucher";

export async function PUT(req: Request, { params }: { params: any }) {
  await dbConnect();
  const { id } = params;
  const body = await req.json();

  try {
    const updateData = { ...body };

    // ⏰ Lấy thời gian Việt Nam
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const start = new Date(updateData.start_day);
    const end = new Date(updateData.end_day);

    // 🔁 Nếu trong hiệu lực → giữ trạng thái user chọn (nếu có)
    // 🔁 Nếu ngoài hiệu lực → buộc là "inactive"
    if (now < start || now > end) {
      updateData.status = "inactive";
    }

    const updatedVoucher = await Voucher.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi cập nhật voucher", error }, { status: 500 });
  }
}
