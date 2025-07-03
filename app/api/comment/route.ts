import { NextResponse } from "next/server";
import { dbConnect } from '../../../lib/mongodb'
import Comment from '../../../model/comments'


export async function GET() {
  await dbConnect();

  const comments = await Comment.find()
    .populate("id_product")
    // .populate("id_user");

  return NextResponse.json(comments);
}



export async function POST(req: Request) {
    await dbConnect();

    return NextResponse.json(await Comment.create(await req.json()), { status: 201 });
  }
  