import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  if (!API_BASE) return NextResponse.json({ error: "NEXT_PUBLIC_API_BASE missing" }, { status: 500 });

  const { userId, taskId } = await context.params;

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: "DELETE",
  });

  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  if (!API_BASE) return NextResponse.json({ error: "NEXT_PUBLIC_API_BASE missing" }, { status: 500 });

  const { userId, taskId } = await context.params;

  const res = await fetch(`${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}/complete`, {
    method: "PATCH",
  });

  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return NextResponse.json(data, { status: res.status });
}
