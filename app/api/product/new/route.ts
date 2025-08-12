// import { NextResponse } from "next/server";
// import { dbConnect } from '../../../../lib/mongodb'
// import Product from '../../../../model/products'

// //Method: GET
// //http://localhost:3000/api/product/new
// export async function GET() {
//   try {
//     await dbConnect();

//     const hotProducts = await Product.find({ product_new: { $ne: 0 } });

//     return NextResponse.json(hotProducts);
//   } catch (error) {
//     console.error("Lỗi khi lấy sản phẩm new:", error);
//     return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
//   }
// }
// File : app/api/product/new/route.ts
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