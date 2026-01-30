import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function GET(
  _req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const body = await req.json();

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
