// // api/flash-sale/route.ts
// import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/mongodb";
// import FlashSale from "@/model/flash-sale";
// import "../../../model/products";

// export async function GET() {
//   await dbConnect();

//   const now = new Date().getTime();

//   // Lấy tất cả flash sale
//   const sales = await FlashSale.find().sort({ created_at: -1 });

//   // Kiểm tra và cập nhật trạng thái nếu cần
//   const updatePromises = sales.map(async (sale: any) => {
//     const end = new Date(sale.end_date).getTime();

//     if (sale.status === "active" && end < now) {
//       sale.status = "inactive";
//       await sale.save(); // cập nhật trong DB
//     }

//     return sale;
//   });

//   const updatedSales = await Promise.all(updatePromises);

//   return NextResponse.json(updatedSales);
// }


// export async function POST(req: Request) {
//     await dbConnect();
//     try {
//       const body = await req.json();
  
//       const start = new Date(body.start_datetime);
//       const end = new Date(body.end_datetime);
      
//       const flashSale = new FlashSale({
//         ...body,
//         start_date: start,
//         end_date: end,
//         status: body.status ?? "active",
//       });
      
  
//       await flashSale.save();
//       return NextResponse.json({ message: "Tạo flash sale thành công", flashSale });
//     } catch (error: any) {
//       return NextResponse.json(
//         { message: "Lỗi tạo flash sale", error: error.message },
//         { status: 500 }
//       );
//     }
//   }
  
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import FlashSale from "@/model/flash-sale";
import "@/model/products";
import Variant from "@/model/variants";

export async function GET() {
  await dbConnect();
  const now = Date.now();

  const flashSales = await FlashSale.find()
    .populate({
      path: "id_product",
      select: "name images price sale",
    })
    .sort({ createdAt: -1 });

  const updated = await Promise.all(
    flashSales.map(async (sale: any) => {
      // Cập nhật status nếu đã hết hạn
      if (sale.status === "active" && new Date(sale.end_date).getTime() < now) {
        sale.status = "inactive";
        await sale.save();
      }

      const productIds = sale.id_product.map((p: any) => p._id);
      const variants = await Variant.find({ id_product: { $in: productIds } });

      // Tính tồn kho và số lượng đã bán cho từng sản phẩm
      const productStockMap: Record<string, { stock: number; sold: number }> = {};
      variants.forEach((variant) => {
        const productId = variant.id_product.toString();
        if (!productStockMap[productId]) {
          productStockMap[productId] = { stock: 0, sold: 0 };
        }
        productStockMap[productId].stock += variant.stock_quantity;
        productStockMap[productId].sold += variant.sold_quantity;
      });

      // Chuẩn bị mảng products enriched
      const enrichedProducts = sale.id_product
        .filter((p: any) => p && p._id)
        .map((p: any) => {
          const stockData = productStockMap[p._id.toString()] ?? { stock: 0, sold: 0 };
          return {
            _id: p._id.toString(),
            ...p._doc,
            stock: stockData.stock,
            totalStock: stockData.stock + stockData.sold,
            flashSaleQuantity: sale.quantity,
            flashSaleId: sale._id,
          };
        });

      return {
        _id: sale._id,
        name: sale.name,
        status: sale.status,
        start_date: sale.start_date,
        end_date: sale.end_date,
        discount_percent: sale.discount_percent ?? 0,
        quantity: sale.quantity,
        id_product: sale.id_product,       // ✅ giữ nguyên cho admin
        products: enrichedProducts,        // ✅ thêm cho client
      };
    })
  );

  return NextResponse.json(updated);
}

export async function POST(req: Request) {
    await dbConnect();
    try {
      const body = await req.json();
  
      const start = new Date(body.start_datetime);
      const end = new Date(body.end_datetime);
      
      const flashSale = new FlashSale({
        ...body,
        start_date: start,
        end_date: end,
        status: body.status ?? "active",
      });
      
  
      await flashSale.save();
      return NextResponse.json({ message: "Tạo flash sale thành công", flashSale });
    } catch (error: any) {
      return NextResponse.json(
        { message: "Lỗi tạo flash sale", error: error.message },
        { status: 500 }
      );
    }
  }