import { NextResponse } from "next/server";

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.HF_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://127.0.0.1:8000";

function joinUrl(base: string, path: string) {
  return ${base.replace(/\/+$/, "")}/;
}

export async function PATCH(
  _req: Request,
  { params }: { params: { userId: string; taskId: string } }
) {
  try {
    const userId = encodeURIComponent(params.userId);
    const taskId = encodeURIComponent(params.taskId);
    const url = joinUrl(BACKEND, /api//tasks//complete);

    const r = await fetch(url, { method: "PATCH" });
    const t = await r.text();
    return new NextResponse(t, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string; taskId: string } }
) {
  try {
    const userId = encodeURIComponent(params.userId);
    const taskId = encodeURIComponent(params.taskId);
    const url = joinUrl(BACKEND, /api//tasks/);

    const r = await fetch(url, { method: "DELETE" });
    const t = await r.text();
    return new NextResponse(t, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
