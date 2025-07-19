import { NextResponse } from "next/server";
import { dbConnect } from '../../../../lib/mongodb';
import Product from '../../../../model/products';

export async function GET() {
  try {
    await dbConnect();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

    const newProducts = await Product.find({
      createdAt: { $gte: sevenDaysAgo },
      isActive: true,
    }).sort({ createdAt: -1 }); 

    return NextResponse.json(newProducts);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm mới:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}