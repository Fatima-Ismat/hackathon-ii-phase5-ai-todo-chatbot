// frontend/app/api/[userId]/tasks/[taskId]/route.ts
import { NextResponse } from "next/server";

function getBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.BACKEND_URL ||
    "http://127.0.0.1:8000";

  return raw.replace(/\/+$/, "");
}

function apiUrl(path: string) {
  const base = getBase();
  if (base.endsWith("/api")) return `${base}${path}`;
  return `${base}/api${path}`;
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await ctx.params;

    if (!userId || !taskId) {
      return NextResponse.json(
        { error: "Missing userId or taskId" },
        { status: 400 }
      );
    }

    const upstream = await fetch(
      apiUrl(`/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`),
      { method: "DELETE" }
    );

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Proxy DELETE failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await ctx.params;

    if (!userId || !taskId) {
      return NextResponse.json(
        { error: "Missing userId or taskId" },
        { status: 400 }
      );
    }

    const body = await req.text();

    const upstream = await fetch(
      apiUrl(`/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}`),
      {
        method: "PATCH",
        headers: {
          "Content-Type": req.headers.get("content-type") || "application/json",
        },
        body,
      }
    );

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Proxy PATCH failed" },
      { status: 500 }
    );
  }
}
