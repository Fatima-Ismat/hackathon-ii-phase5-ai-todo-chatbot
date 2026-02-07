// frontend/app/api/[userId]/tasks/route.ts
import { NextResponse } from "next/server";

function getBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.BACKEND_URL ||
    "http://127.0.0.1:8000";

  return raw.replace(/\/+$/, "");
}

// If base already ends with /api, don't add /api again
function apiUrl(path: string) {
  const base = getBase();
  if (base.endsWith("/api")) return `${base}${path}`;
  return `${base}/api${path}`;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await ctx.params;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const upstream = await fetch(apiUrl(`/${encodeURIComponent(userId)}/tasks`), {
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Proxy GET failed" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await ctx.params;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const body = await req.text();

    const upstream = await fetch(apiUrl(`/${encodeURIComponent(userId)}/tasks`), {
      method: "POST",
      headers: {
        "Content-Type": req.headers.get("content-type") || "application/json",
      },
      body,
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Proxy POST failed" },
      { status: 500 }
    );
  }
}
