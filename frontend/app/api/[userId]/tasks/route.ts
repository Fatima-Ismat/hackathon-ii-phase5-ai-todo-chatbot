import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const { userId } = context.params;

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks`);
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const { userId } = context.params;
  const body = await request.json();

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
