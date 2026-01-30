import { NextRequest, NextResponse } from "next/server";

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_BASE || "";
  const base = raw.trim().replace(/\/+$/, "");
  return base;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  const API_BASE = getApiBase();
  if (!API_BASE || !API_BASE.startsWith("http")) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_BASE missing/invalid on Vercel env vars", value: API_BASE || null },
      { status: 500 }
    );
  }

  const { userId, taskId } = await context.params;
  const body = await req.json();

  const url = `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  const API_BASE = getApiBase();
  if (!API_BASE || !API_BASE.startsWith("http")) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_BASE missing/invalid on Vercel env vars", value: API_BASE || null },
      { status: 500 }
    );
  }

  const { userId, taskId } = await context.params;
  const url = `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`;

  const res = await fetch(url, { method: "DELETE", cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
