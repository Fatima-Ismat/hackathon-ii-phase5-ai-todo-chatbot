import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "");
}

function backendBase(): string {
  const b = (process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "").trim();
  if (!b) throw new Error("API base missing. Set NEXT_PUBLIC_API_BASE or API_BASE in frontend container env.");
  return normalizeBase(b);
}

async function safeJson(res: Response) {
  const txt = await res.text().catch(() => "");
  if (!txt) return {};
  try {
    return JSON.parse(txt);
  } catch {
    return {};
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await ctx.params;
    const base = backendBase();
    const body = await req.json().catch(() => ({}));

    const upstream = await fetch(`${base}/api/${encodeURIComponent(userId)}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await safeJson(upstream);

    return NextResponse.json(data, {
      status: upstream.status,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Proxy error" },
      { status: 500 }
    );
  }
}
