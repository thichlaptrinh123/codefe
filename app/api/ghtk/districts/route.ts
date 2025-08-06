// app/api/ghtk/districts/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get('province');

  if (!province) {
    return NextResponse.json({ success: false, message: 'Thiếu tên tỉnh/thành phố' }, { status: 400 });
  }

  try {
    const ghtkRes = await fetch(
      `https://services.giaohangtietkiem.vn/services/shipment/listdistrict?province=${encodeURIComponent(
        province
      )}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Token: process.env.GHTK_TOKEN || '2H7ObiqJEC36wTmOFkmmbz8e20HjBH3FFc7oaQX', 
        },
      }
    );

    const data = await ghtkRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Lỗi khi gọi GHTK:', error);
    return NextResponse.json({ success: false, message: 'Lỗi khi gọi GHTK' }, { status: 500 });
  }
}
