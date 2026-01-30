// frontend/lib/api.ts
"use client";

export type Task = {
  id: number;
  user_id: string;
  title: string;
  completed: boolean;
};

async function readJsonSafe(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

/**
 * Make userId URL-safe and stable.
 * - trims spaces
 * - collapses internal spaces
 * - falls back to "demo"
 * - encodeURIComponent for safe URL segment
 */
function safeUserId(userId: string) {
  const cleaned = (userId || "").trim().replace(/\s+/g, " ");
  const finalId = cleaned.length ? cleaned : "demo";
  return encodeURIComponent(finalId);
}

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
    cache: "no-store",
  });

  const data = await readJsonSafe(res);

  if (!res.ok) {
    const msg =
      typeof (data as any)?.detail === "string"
        ? (data as any).detail
        : typeof (data as any)?.error === "string"
        ? (data as any).error
        : typeof (data as any)?.message === "string"
        ? (data as any).message
        : `Request failed (${res.status})`;

    // include URL in error for easier debugging
    throw new Error(`${msg} | ${url}`);
  }

  return data as T;
}

/**
 * IMPORTANT:
 * We use Next.js API routes as a proxy to backend to avoid CORS.
 * Frontend calls:
 *  /api/:userId/tasks
 *  /api/:userId/tasks/:taskId
 *  /api/:userId/chat
 */

export async function apiListTasks(userId: string): Promise<Task[]> {
  const uid = safeUserId(userId);
  const data = await request<{ tasks?: Task[] }>(`/api/${uid}/tasks`, {
    method: "GET",
  });
  return Array.isArray(data.tasks) ? data.tasks : [];
}

export async function apiAddTask(userId: string, title: string): Promise<Task> {
  const uid = safeUserId(userId);
  const data = await request<{ task: Task }>(`/api/${uid}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return data.task;
}

export async function apiDeleteTask(
  userId: string,
  taskId: number
): Promise<{ ok: true }> {
  const uid = safeUserId(userId);
  return await request<{ ok: true }>(`/api/${uid}/tasks/${encodeURIComponent(String(taskId))}`, {
    method: "DELETE",
  });
}

export async function apiToggleComplete(
  userId: string,
  taskId: number,
  completed: boolean
): Promise<Task> {
  const uid = safeUserId(userId);
  const data = await request<{ task: Task }>(
    `/api/${uid}/tasks/${encodeURIComponent(String(taskId))}`,
    {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    }
  );
  return data.task;
}

/** Backward-compatible aliases */
export const listTasks = apiListTasks;
export const addTask = apiAddTask;
export const deleteTask = apiDeleteTask;
export const toggleComplete = apiToggleComplete;
