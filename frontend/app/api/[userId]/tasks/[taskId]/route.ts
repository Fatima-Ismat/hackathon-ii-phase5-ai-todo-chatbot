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
  { params }: { params: { userId: string; taskId: string } }
) {
  const url = join(
    BACKEND,
    `api/${encodeURIComponent(params.userId)}/tasks/${encodeURIComponent(
      params.taskId
    )}/complete`
  );
  const r = await fetch(url, { method: "PATCH" });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string; taskId: string } }
) {
  const url = join(
    BACKEND,
    `api/${encodeURIComponent(params.userId)}/tasks/${encodeURIComponent(
      params.taskId
    )}`
  );
  const r = await fetch(url, { method: "DELETE" });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
