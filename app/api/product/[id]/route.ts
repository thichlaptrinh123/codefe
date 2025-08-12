// app/api/product/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/model/products";
import Variant from "../../../../model/variants"; 
import "@/model/categories";
import "@/model/category-type";


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate({
      path: "id_category",
      populate: { path: "typeId" }
    });

    if (!updatedProduct) {
      return NextResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const variants = await Variant.find({ id_product: id }).lean();

    return NextResponse.json({
      ...updatedProduct.toObject(),
      variants
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Lỗi khi lấy sản phẩm", error: (err as Error).message },
      { status: 500 }
    );
  }
}




// PUT: Cập nhật sản phẩm
export async function PUT(req: NextRequest) {
  await dbConnect();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // Lấy ID từ URL cuối cùng

  try {
    const update = await req.json();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (err) {
    return NextResponse.json(
      { message: "Lỗi khi cập nhật", error: (err as Error).message },
      { status: 500 }
    );
  }
}

