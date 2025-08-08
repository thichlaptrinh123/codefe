// File: app/api/ghtk/cod-hold/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch("https://services.giaohangtietkiem.vn/services/shipment/v2", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Token: "2H7ObiqJEC36wTmOFkmmbz8e20HjBH3FFc7oaQX",
      },
    });

    const data = await response.json();

    if (!data.success || !Array.isArray(data.orders)) {
      return NextResponse.json({ cod_hold: 0 });
    }

    const codHold = data.orders
      .filter((order: any) => order.status === "delivered" && order.is_cod_transferred === false)
      .reduce((sum: number, order: any) => sum + (order.cod_amount || 0), 0);

    return NextResponse.json({ cod_hold: codHold });
  } catch (err) {
    console.error("Lỗi lấy COD GHTK:", err);
    return NextResponse.json({ cod_hold: 0 });
  }
}
