// frontend/app/api/[userId]/tasks/[taskId]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getBase() {
  const raw =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.BACKEND_URL ||
    process.env.BACKEND_API_URL ||
    "http://127.0.0.1:8000";

  return String(raw).replace(/\/+$/, "");
}

function apiUrl(path: string) {
  const base = getBase();
  if (base.endsWith("/api")) return `${base}${path}`;
  return `${base}/api${path}`;
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: { userId: string; taskId: string } }
) {
  try {
    const { userId, taskId } = ctx.params;

    if (!userId || !taskId) {
      return NextResponse.json(
        { error: "Missing userId or taskId" },
        { status: 400 }
      );
    }

    const url = apiUrl(
      `/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`
    );

    const upstream = await fetch(url, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Proxy DELETE failed",
        detail: e?.message || String(e),
        base: getBase(),
      },
      { status: 502 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: { userId: string; taskId: string } }
) {
  try {
    const { userId, taskId } = ctx.params;

    if (!userId || !taskId) {
      return NextResponse.json(
        { error: "Missing userId or taskId" },
        { status: 400 }
      );
    }

    const url = apiUrl(
      `/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`
    );

    const body = await req.text();

    const upstream = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": req.headers.get("content-type") || "application/json",
        Accept: "application/json",
      },
      body,
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Proxy PATCH failed",
        detail: e?.message || String(e),
        base: getBase(),
      },
      { status: 502 }
    );
  }
}
