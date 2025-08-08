import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Banner from "../../../../model/banner";

// GET: Lấy 1 banner theo ID
export async function GET(
  req: NextRequest,
  context: any
) {
  await dbConnect();
  const { id } = context.params;

  try {
    const banner = await Banner.findById(id);

    return banner
      ? NextResponse.json(banner)
      : NextResponse.json({ message: "Không tìm thấy banner" }, { status: 404 });
  } catch (error) {
    console.error("Lỗi khi lấy banner:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// PUT: Cập nhật banner
export async function PUT(
  request: NextRequest,
  context: any
) {
  await dbConnect();
  const { id } = context.params;

  try {
    const data = await request.json();

    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return NextResponse.json({ message: "Không tìm thấy banner" }, { status: 404 });
    }

    const updatedFields = {
      title: data.title ?? existingBanner.title,
      subtitle: data.subtitle ?? existingBanner.subtitle,
      image: data.image ?? existingBanner.image,
      buttonText: data.buttonText ?? existingBanner.buttonText,
      buttonLink: data.buttonLink ?? existingBanner.buttonLink,
      features: Array.isArray(data.features) ? data.features : existingBanner.features,
      position: data.position ?? existingBanner.position,
      isActive: typeof data.isActive === "boolean" ? data.isActive : existingBanner.isActive,
      updated_at: new Date(),
    };

    const updatedBanner = await Banner.findByIdAndUpdate(id, updatedFields, { new: true });

    return NextResponse.json(updatedBanner, { status: 200 });
  } catch (error) {
    console.error("Lỗi cập nhật banner:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
