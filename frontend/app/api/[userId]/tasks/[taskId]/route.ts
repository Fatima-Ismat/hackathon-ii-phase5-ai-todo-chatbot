import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string; taskId: string } }
) {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        { error: "Missing API base. Set NEXT_PUBLIC_API_BASE in Vercel." },
        { status: 500 }
      );
    }

    const { userId, taskId } = params;
    const body = await req.json();

    const target = new URL(
      `/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`,
      API_BASE
    ).toString();

    const r = await fetch(target, {
      method: "PATCH",
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

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string; taskId: string } }
) {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        { error: "Missing API base. Set NEXT_PUBLIC_API_BASE in Vercel." },
        { status: 500 }
      );
    }

    const { userId, taskId } = params;

    const target = new URL(
      `/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`,
      API_BASE
    ).toString();

    const r = await fetch(target, { method: "DELETE", cache: "no-store" });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Proxy error", details: String(e?.message || e) },
      { status: 502 }
    );
  }
}
