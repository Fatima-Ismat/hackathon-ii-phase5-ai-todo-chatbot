// frontend/lib/api.ts
export type Task = {
  id: number;
  user_id: string;
  title: string;
  completed: boolean;
};

function safeUserId(userId: string) {
  return encodeURIComponent(userId);
}

/**
 * IMPORTANT:
 * - Browser/client requests MUST go to same-origin Next.js routes (/api/...)
 *   to avoid CORS + mixed content.
 * - Those Next routes will talk to HuggingFace backend using server-side fetch.
 */
export const api = {
  async listTasks(userId: string): Promise<Task[]> {
    const res = await fetch(`/api/${safeUserId(userId)}/tasks`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to list tasks (${res.status})`);
    return res.json();
  },

  async addTask(userId: string, title: string): Promise<Task> {
    const res = await fetch(`/api/${safeUserId(userId)}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error(`Failed to add task (${res.status})`);
    return res.json();
  },

  async toggleComplete(userId: string, taskId: number): Promise<Task> {
    const res = await fetch(`/api/${safeUserId(userId)}/tasks/${taskId}`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error(`Failed to toggle (${res.status})`);
    return res.json();
  },

  async deleteTask(userId: string, taskId: number): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/${safeUserId(userId)}/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Failed to delete (${res.status})`);
    return res.json();
  },
};
