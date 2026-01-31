import { NextResponse } from "next/server";

const BACKEND =
  process.env.HF_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "https://ismat110-todo-backend-phase5.hf.space";

function join(base: string, path: string) {
  return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const safeUserId = encodeURIComponent(userId);

    const url = join(BACKEND, `api/${safeUserId}/tasks/`);
    const r = await fetch(url, { cache: "no-store" });

    return new NextResponse(await r.text(), {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const safeUserId = encodeURIComponent(userId);

    const url = join(BACKEND, `api/${safeUserId}/tasks/`);

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });

    return new NextResponse(await r.text(), {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
