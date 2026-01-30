import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const text = await res.text();
  let data: any = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const body = await request.json();

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  return NextResponse.json(data, { status: res.status });
}
