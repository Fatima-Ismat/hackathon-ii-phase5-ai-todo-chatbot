import { NextResponse } from "next/server";

const BACKEND =
  process.env.HF_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "https://ismat110-todo-backend-phase5.hf.space";

function join(base: string, path: string) {
  return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const url = join(BACKEND, `api/${encodeURIComponent(params.userId)}/chat`);
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
