import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  if (!API_BASE) return NextResponse.json({ error: "NEXT_PUBLIC_API_BASE missing" }, { status: 500 });

  const { userId } = await context.params;

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks/`, {
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  if (!API_BASE) return NextResponse.json({ error: "NEXT_PUBLIC_API_BASE missing" }, { status: 500 });

  const { userId } = await context.params;
  const body = await req.json();

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return NextResponse.json(data, { status: res.status });
}
