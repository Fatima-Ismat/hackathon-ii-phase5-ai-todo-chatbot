import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        { error: "Missing API base. Set NEXT_PUBLIC_API_BASE in Vercel." },
        { status: 500 }
      );
    }

    const userId = params.userId;
    const body = await req.json();

    const target = new URL(
      `/api/${encodeURIComponent(userId)}/chat`,
      API_BASE
    ).toString();

    const r = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Proxy error", details: String(e?.message || e) },
      { status: 502 }
    );
  }
}
