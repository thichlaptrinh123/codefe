// import { NextResponse } from "next/server";
// import cloudinary from "../../../lib/cloudinary";

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json({ error: "Không có file" }, { status: 400 });
//     }

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

//     const upload = await cloudinary.uploader.upload(base64Image, {
//       folder: "aura_shop",
//     });

//     return NextResponse.json({ url: upload.secure_url });
//   } catch (err) {
//     console.error("❌ Lỗi upload:", err);
//     return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
//   }
// }
