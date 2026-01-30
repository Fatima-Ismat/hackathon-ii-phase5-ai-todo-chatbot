Set-Content -Path "frontend/app/api/[userId]/tasks/route.ts" -Encoding utf8 -Value @'
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const safeUserId = encodeURIComponent(userId);

  try {
    const res = await fetch(`${API_BASE}/api/${safeUserId}/tasks`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: data ?? { detail: "Backend error" } },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message ?? err ?? "Proxy error") },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const safeUserId = encodeURIComponent(userId);

  const body = await request.json().catch(() => ({}));

  try {
    const res = await fetch(`${API_BASE}/api/${safeUserId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: data ?? { detail: "Backend error" } },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message ?? err ?? "Proxy error") },
      { status: 502 }
    );
  }
}
'@
