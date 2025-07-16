import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Voucher from "@/model/voucher";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const body = await req.json();

  try {
    const updateData = { ...body };

    // Cập nhật lại status theo thời gian nếu cần
    const now = new Date();
    const start = new Date(updateData.start_day);
    const end = new Date(updateData.end_day);

    if (start > now) updateData.status = "scheduled";
    else if (start <= now && end >= now) updateData.status = "active";
    else updateData.status = "inactive";

    const updatedVoucher = await Voucher.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi cập nhật voucher", error }, { status: 500 });
  }
}
