// File: app/api/user/[id]/orders-count/route.ts
// import { dbConnect } from "@/lib/mongodb";
// import Order from "@/model/order";
// import { NextResponse } from "next/server";

// export async function GET(_: Request, { params }: { params: any }) {
//   await dbConnect();

//   try {
//     const orderCount = await Order.countDocuments({
//       id_user: params.id,
//       status: { $in: ["cancelled", "failed"] }, // Các đơn được tính là "bơm"
//     });

//     return NextResponse.json({ count: orderCount });
//   } catch (error) {
//     return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/model/order";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/")[3]; // Vì path là /api/user/[id]/orders-count

  await dbConnect();

  try {
    const orderCount = await Order.countDocuments({
      id_user: id,
      status: { $in: ["cancelled", "failed"] },
    });

    return NextResponse.json({ count: orderCount });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
