import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const provinceCode = searchParams.get("province"); // API mới dùng code thay vì tên

    if (!type || !["provinces", "wards"].includes(type)) {
      return NextResponse.json({ error: "Loại API không hợp lệ" }, { status: 400 });
    }

    // Fetch toàn bộ dữ liệu 1 lần từ API vietnamlabs
    const response = await fetch("https://vietnamlabs.com/api/vietnamprovince", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const jsonData = await response.json();

    if (!jsonData.success || !Array.isArray(jsonData.data)) {
      throw new Error("Dữ liệu không hợp lệ từ API ngoài");
    }

    if (type === "provinces") {
      // Trả về danh sách tỉnh (province)
      const provinces = jsonData.data.map((item: any) => ({
        code: item.id.toString(), // dùng id làm code
        name: item.province,
      }));

      return NextResponse.json({
        success: true,
        type,
        total: provinces.length,
        data: provinces,
      });
    } else {
      // type === "wards"
      if (!provinceCode) {
        return NextResponse.json({ error: "Thiếu tham số province" }, { status: 400 });
      }

      // Tìm tỉnh theo code (id)
      const province = jsonData.data.find(
        (p: any) => p.id.toString() === provinceCode
      );

      if (!province) {
        return NextResponse.json({ error: "Không tìm thấy tỉnh" }, { status: 404 });
      }

      // Lấy danh sách wards
      const wards = (province.wards || []).map((ward: any, index: number) => ({
        code: `${province.id}-${index + 1}`, // tạo code tạm theo id tỉnh + số thứ tự
        name: ward.name,
        mergedFrom: ward.mergedFrom || [],
      }));

      return NextResponse.json({
        success: true,
        type,
        total: wards.length,
        data: wards,
      });
    }
  } catch (error: any) {
    console.error(`Location API Error [${error.message}]`);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi không xác định",
        type: "unknown",
      },
      { status: 500 }
    );
  }
}
