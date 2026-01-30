import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type Ctx = { params: Promise<{ userId: string; taskId: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const { userId, taskId } = await context.params;
  const body = await request.json();

  const res = await fetch(
    `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const text = await res.text();
  let data: any = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const { userId, taskId } = await context.params;

  const res = await fetch(
    `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`,
    { method: "DELETE" }
  );

  const text = await res.text();
  let data: any = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  return NextResponse.json(data, { status: res.status });
}
