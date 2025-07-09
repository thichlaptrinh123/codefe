import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import Collection_product from "../../../../model/collection_product";

// GET: Lấy danh sách sản phẩm theo id_collection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const items = await Collection_product.find({ id_collection: id })
      .populate("id_product")
      .populate("id_collection");

    return items.length > 0
      ? NextResponse.json(items)
      : NextResponse.json({ message: "Không tìm thấy sản phẩm nào trong bộ sưu tập này" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi lấy dữ liệu", error }, { status: 500 });
  }
}

// PUT: Cập nhật một bản ghi collection_product theo id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const updateData = await request.json();

    const updatedItem = await Collection_product.findByIdAndUpdate(id, updateData, { new: true });

    return updatedItem
      ? NextResponse.json(updatedItem)
      : NextResponse.json({ message: "Không tìm thấy để cập nhật" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi cập nhật", error }, { status: 500 });
  }
}
