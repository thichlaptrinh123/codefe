// app/api/location/route.ts
import { NextRequest, NextResponse } from "next/server";

// API để lấy danh sách tỉnh/thành phố và phường/xã (bỏ quận/huyện)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // provinces, wards
    const provinceCode = searchParams.get("province");

    let apiUrl = "";

    switch (type) {
      case "provinces":
        apiUrl = "https://provinces.open-api.vn/api/p/";
        break;
      case "wards":
        if (!provinceCode) {
          return NextResponse.json({ error: "Thiếu mã tỉnh/thành phố" }, { status: 400 });
        }
        apiUrl = `https://provinces.open-api.vn/api/p/${provinceCode}?depth=3`;
        break;
      default:
        return NextResponse.json({ error: "Loại API không hợp lệ" }, { status: 400 });
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    let result;
    switch (type) {
      case "provinces":
        result = data.map((item: any) => ({
          code: item.code,
          name: item.name,
          codename: item.codename,
        }));
        break;
      case "wards":
        // Gom tất cả phường/xã từ tất cả quận/huyện trong tỉnh
        result = [];
        if (data.districts) {
          data.districts.forEach((district: any) => {
            if (district.wards) {
              district.wards.forEach((ward: any) => {
                result.push({
                  code: ward.code,
                  name: `${ward.name} (${district.name})`, // Thêm tên quận/huyện để phân biệt
                  codename: ward.codename,
                  districtName: district.name,
                });
              });
            }
          });
        }
        break;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Location API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}