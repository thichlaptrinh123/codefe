import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/model/products";
import Order from "@/model/order";
import User from "@/model/user";
import Blog from "@/model/blogs";
import Voucher from "@/model/voucher";
import Comment from "@/model/comments";

export async function GET() {
  try {
    await dbConnect();

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalBlogs,
      activeVouchers,
      totalComment,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Blog.countDocuments(),
      Voucher.countDocuments({ isActive: true }),
      Comment.countDocuments(),
    ]);

    // Gần hết hàng
    const almostOutOfStock = await Product.countDocuments({ stock: { $lte: 20 } });

    // Tổng doanh thu từ đơn đã giao
    const totalRevenueData = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalRevenue = totalRevenueData[0]?.total || 0;

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      almostOutOfStock,
      totalBlogs,
      activeVouchers,
      totalComment,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy thống kê:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
