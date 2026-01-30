import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  const { userId, taskId } = await context.params;
  const body = await req.json();

  const res = await fetch(
    `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  const { userId, taskId } = await context.params;

  const res = await fetch(
    `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${taskId}`,
    { method: "DELETE" }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
