import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from '../../../../../lib/mongodb'
import Product from '../../../../../model/products'

//Method: GET
//http://localhost:3000/api/product/category/id danh muc muon show
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  const products = await Product.find({ id_category: id }).populate("id_category");

  return products.length > 0
    ? NextResponse.json(products)
    : NextResponse.json({ message: "Không tìm thấy sản phẩm nào trong danh mục này" }, { status: 404 });
}