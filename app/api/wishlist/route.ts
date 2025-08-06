import { NextResponse } from "next/server";
import { dbConnect } from '../../../../lib/mongodb'
import Wishlist from '../../../../model/wishlist'

//Method: GET
//http://localhost:3000/api/wishlist
export async function GET() {
  await dbConnect();
  return NextResponse.json(await Wishlist.find());
}

//Method: POST
//http://localhost:3000/api/wishlist
export async function POST(req: Request) {
    await dbConnect();
    return NextResponse.json(await Wishlist.create(await req.json()), { status: 201 });
  }
  