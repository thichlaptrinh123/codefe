import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongodb";
import Banner from "../../../model/banner";

// GET: Lấy danh sách banner (có thể lọc isActive)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get("onlyActive") === "true";

    const filter = onlyActive ? { isActive: true } : {};
    const banners = await Banner.find(filter).sort({ created_at: -1 });

    return NextResponse.json(banners, { status: 200 });
  } catch (error) {
    console.error("Lỗi server API banner:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// POST: Tạo mới banner
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const data = await req.json();

    if (!data.image) {
      return NextResponse.json(
        { message: "Thiếu trường bắt buộc: image" },
        { status: 400 }
      );
    }
    console.log("📦 Payload nhận từ FE:", data);

    const newBanner = await Banner.create({
      title: data.title,
      subtitle: data.subtitle || "",
      image: data.image,
      buttonText: data.buttonText || "",
      buttonLink: data.buttonLink || "",
      features: data.features || [],
      position: data.position || "left",
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo banner:", error);
    return NextResponse.json({ message: "Lỗi server khi tạo banner" }, { status: 500 });
  }
}
