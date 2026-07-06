import { NextResponse } from 'next/server';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_DEMO_WEBHOOK_URL || 'https://n8n.myceliumagency.cloud/webhook/demo-request';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Webhook responded with status: ${res.status}`);
    }

    const data = await res.text();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error forwarding to webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
