import { NextResponse } from "next/server";

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.HF_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://127.0.0.1:8000";

function joinUrl(base: string, path: string) {
  return ${base.replace(/\/+$/, "")}/;
}

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = encodeURIComponent(params.userId);
    const url = joinUrl(BACKEND, /api//chat);
    const body = await req.text();

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const t = await r.text(); // JSON.parse nahi karna
    return new NextResponse(t, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
