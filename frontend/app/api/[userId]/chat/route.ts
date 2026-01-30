import { NextRequest, NextResponse } from "next/server";

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_BASE || "";
  const base = raw.trim().replace(/\/+$/, ""); // remove trailing slash
  return base;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const API_BASE = getApiBase();
  if (!API_BASE || !API_BASE.startsWith("http")) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_BASE missing/invalid on Vercel env vars", value: API_BASE || null },
      { status: 500 }
    );
  }

  const { userId } = await context.params;
  const body = await request.json();

  const url = `${API_BASE}/api/${encodeURIComponent(userId)}/chat`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
