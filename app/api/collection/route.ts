import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import Collection from "../../../model/collection";

export async function GET() {
  await dbConnect();
  return NextResponse.json(await Collection.find());
}

export async function POST(req: Request) {
    await dbConnect();
    return NextResponse.json(await Collection.create(await req.json()), { status: 201 });
  }