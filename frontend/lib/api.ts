// frontend/lib/api.ts
export type Task = {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  due_date?: string | null;
};

const API_BASE = ""; // we call Next route handlers: /api/...

async function readTextSafe(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

function niceMessageFromText(text: string) {
  const t = (text || "").trim();
  if (!t) return "";
  // try JSON {detail:"..."} or {message:"..."}
  try {
    const j = JSON.parse(t);
    const msg =
      j?.detail ||
      j?.message ||
      j?.error ||
      (Array.isArray(j) ? j.join(", ") : "");
    if (msg && typeof msg === "string") return msg;
  } catch {
    // ignore
  }
  return t;
}

async function assertOk(res: Response) {
  if (res.ok) return;

  const text = await readTextSafe(res);
  const msg = niceMessageFromText(text);

  // IMPORTANT: always throw Error(string) so toast doesn't show [object Object]
  throw new Error(msg || `HTTP ${res.status}`);
}

function apiTasksUrl(userId: string) {
  return `${API_BASE}/api/${encodeURIComponent(userId)}/tasks`;
}

function apiTaskUrl(userId: string, taskId: number) {
  return `${API_BASE}/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(String(taskId))}`;
}

export async function apiListTasks(userId: string): Promise<Task[]> {
  const res = await fetch(apiTasksUrl(userId), { method: "GET", cache: "no-store" });
  await assertOk(res);
  const data = (await res.json()) as Task[];
  return Array.isArray(data) ? data : [];
}

export async function apiAddTask(args: {
  userId: string;
  title: string;
  description?: string;
  due_date?: string;
}): Promise<Task> {
  const res = await fetch(apiTasksUrl(args.userId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      title: args.title,
      description: args.description ?? null,
      due_date: args.due_date ?? null,
    }),
  });
  await assertOk(res);
  return (await res.json()) as Task;
}

export async function apiDeleteTask(userId: string, taskId: number): Promise<{ ok: true }> {
  const res = await fetch(apiTaskUrl(userId, taskId), { method: "DELETE", cache: "no-store" });
  await assertOk(res);
  return { ok: true };
}

export async function apiToggleComplete(
  userId: string,
  taskId: number,
  completed: boolean
): Promise<Task> {
  // PATCH route handler
  const res = await fetch(apiTaskUrl(userId, taskId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ completed }),
  });
  await assertOk(res);
  return (await res.json()) as Task;
}
