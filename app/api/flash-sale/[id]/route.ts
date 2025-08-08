// api/flash-sale/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import FlashSale from "@/model/flash-sale";

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   await dbConnect();
//   const { id } = params;
//   const body = await req.json();

//   try {
//     const now = new Date();
//     const start = new Date(body.start_date);
//     const end = new Date(body.end_date);

//     let status: "scheduled" | "active" | "inactive" = "inactive";
//     if (start > now) {
//       status = "scheduled";
//     } else if (start <= now && end >= now) {
//       status = "active";
//     }

//     const updated = await FlashSale.findByIdAndUpdate(
//       id,
//       { ...body, status },
//       { new: true }
//     );

//     return NextResponse.json({ message: "Cập nhật thành công", flashSale: updated });
//   } catch (error: any) {
//     return NextResponse.json(
//       { message: "Lỗi cập nhật flash sale", error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(req: Request, { params }: { params: any }) {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
  
    try {
        const start = new Date(body.start_datetime);
        const end = new Date(body.end_datetime);
        
        const updated = await FlashSale.findByIdAndUpdate(
          id,
          {
            ...body,
            start_date: start,
            end_date: end,
            status: body.status ?? "active",
          },
          { new: true }
        );
  
      return NextResponse.json({ message: "Cập nhật thành công", flashSale: updated });
    } catch (error: any) {
      return NextResponse.json(
        { message: "Lỗi cập nhật flash sale", error: error.message },
        { status: 500 }
      );
    }
  }
  