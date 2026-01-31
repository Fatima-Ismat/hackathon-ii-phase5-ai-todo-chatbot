import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // ✅ FIX: params async hain
    const { userId } = await context.params;

    const body = await request.json();

    const res = await fetch(
      `${API_BASE}/api/${encodeURIComponent(userId)}/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
