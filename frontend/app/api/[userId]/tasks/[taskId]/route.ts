import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  const { userId, taskId } = await context.params;
  const body = await req.json();

  const res = await fetch(
    `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  const { userId, taskId } = await context.params;

  const res = await fetch(
    `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`,
    { method: "DELETE", cache: "no-store" }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
