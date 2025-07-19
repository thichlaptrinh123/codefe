import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import Collection_product from "../../../model/collection_product";

export async function GET() {
  await dbConnect();
  return NextResponse.json(await Collection_product.find());
}

export async function POST(req: Request) {
    await dbConnect();
    return NextResponse.json(await Collection_product.create(await req.json()), { status: 201 });
  }