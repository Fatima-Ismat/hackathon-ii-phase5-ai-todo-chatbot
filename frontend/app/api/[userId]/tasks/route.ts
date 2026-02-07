// frontend/app/api/[userId]/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ force Node runtime

function getBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.BACKEND_URL ||
    process.env.BACKEND_API_URL ||
    "http://127.0.0.1:8000";

  return raw.replace(/\/+$/, "");
}

function apiUrl(path: string) {
  const base = getBase();
  if (base.endsWith("/api")) return `${base}${path}`;
  return `${base}/api${path}`;
}

function passThrough(upstream: Response, text: string) {
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ userId: string }> }
) {
  const { userId } = await ctx.params;
  const url = apiUrl(`/${encodeURIComponent(userId)}/tasks`);

  try {
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const upstream = await fetch(url, { cache: "no-store" });
    const text = await upstream.text();
    return passThrough(upstream, text);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Upstream fetch failed",
        message: e?.message || String(e),
        base: getBase(),
        url,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ userId: string }> }
) {
  const { userId } = await ctx.params;
  const url = apiUrl(`/${encodeURIComponent(userId)}/tasks`);

  try {
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const contentType = req.headers.get("content-type") || "application/json";
    const body = await req.text();

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });

    const text = await upstream.text();
    return passThrough(upstream, text);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Upstream fetch failed",
        message: e?.message || String(e),
        base: getBase(),
        url,
      },
      { status: 500 }
    );
  }
}
