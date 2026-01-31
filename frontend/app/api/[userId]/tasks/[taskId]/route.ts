import { NextResponse } from "next/server";

const BACKEND =
  process.env.HF_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "https://ismat110-todo-backend-phase5.hf.space";

function join(base: string, path: string) {
  return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await context.params;
    const safeUserId = encodeURIComponent(userId);
    const safeTaskId = encodeURIComponent(taskId);

    const url = join(BACKEND, `api/${safeUserId}/tasks/${safeTaskId}/complete`);
    const r = await fetch(url, { method: "PATCH" });

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

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await context.params;
    const safeUserId = encodeURIComponent(userId);
    const safeTaskId = encodeURIComponent(taskId);

    const url = join(BACKEND, `api/${safeUserId}/tasks/${safeTaskId}`);
    const r = await fetch(url, { method: "DELETE" });

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
