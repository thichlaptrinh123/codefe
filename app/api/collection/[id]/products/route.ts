// app/api/collections/[id]/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CollectionProduct from "@/model/collection_product";
import "../../../model/products";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } } // id = id_collection
) {
  await dbConnect();
  const { id } = params;

  try {
    const productsInCollection = await CollectionProduct.find({
      id_collection: id,
      isActive: true,
    }).populate("id_product");

    return NextResponse.json(productsInCollection, { status: 200 });
  } catch (error) {
    console.error("Lỗi lấy sản phẩm trong bộ sưu tập:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    await dbConnect();
    const { id } = params;
    const data = await req.json();
  
    try {
      if (!data.id_product) {
        return NextResponse.json({ message: "Thiếu id_product" }, { status: 400 });
      }
  
      const newItem = await CollectionProduct.create({
        id_product: data.id_product,
        id_collection: id,
      });
  
      return NextResponse.json(newItem, { status: 201 });
    } catch (error: any) {
      if (error.code === 11000) {
        return NextResponse.json(
          { message: "Sản phẩm đã có trong bộ sưu tập" },
          { status: 409 }
        );
      }
      console.error("Lỗi tạo:", error);
      return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
    }
  }
  