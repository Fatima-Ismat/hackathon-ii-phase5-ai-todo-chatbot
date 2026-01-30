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

async function request<T>(
  url: string,
  opts?: RequestInit
): Promise<T> {
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
    throw new Error(msg);
  }

  return data as T;
}

/**
 * IMPORTANT:
 * We use Next.js API routes as a proxy to backend to avoid CORS.
 * So frontend will call:
 *  /api/:userId/tasks
 *  /api/:userId/tasks/:taskId
 *  /api/:userId/chat
 *
 * These routes will forward to backend internally.
 */

export async function apiListTasks(userId: string): Promise<Task[]> {
  const data = await request<{ tasks?: Task[] }>(`/api/${encodeURIComponent(userId)}/tasks`, {
    method: "GET",
  });
  return Array.isArray(data.tasks) ? data.tasks : [];
}

export async function apiAddTask(userId: string, title: string): Promise<Task> {
  const data = await request<{ task: Task }>(`/api/${encodeURIComponent(userId)}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return data.task;
}

export async function apiDeleteTask(userId: string, taskId: number): Promise<{ ok: true }> {
  return await request<{ ok: true }>(
    `/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(String(taskId))}`,
    { method: "DELETE" }
  );
}

export async function apiToggleComplete(
  userId: string,
  taskId: number,
  completed: boolean
): Promise<Task> {
  const data = await request<{ task: Task }>(
    `/api/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(String(taskId))}`,
    {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    }
  );
  return data.task;
}

/** Backward-compatible aliases (agar kahin purana naam use ho raha ho) */
export const listTasks = apiListTasks;
export const addTask = apiAddTask;
export const deleteTask = apiDeleteTask;
export const toggleComplete = apiToggleComplete;
