import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const ghtkRes = await fetch('https://services.giaohangtietkiem.vn/services/shipment/fee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Token: process.env.GHTK_TOKEN || '2H7ObiqJEC36wTmOFkmmbz8e20HjBH3FFc7oaQX',
      },
      body: JSON.stringify(body),
    });

    const data = await ghtkRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
