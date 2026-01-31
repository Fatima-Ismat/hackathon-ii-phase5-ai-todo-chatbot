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
 * - Browser se direct HuggingFace backend call NAHI hogi
 * - Sab calls same-origin Next.js API routes (/api/...) pe jayengi
 * - CORS / Mixed content ka masla khatam
 */
export const api = {
  async listTasks(userId: string): Promise<Task[]> {
    const res = await fetch(`/api/${safeUserId(userId)}/tasks`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to list tasks (${res.status})`);
    }

    return res.json();
  },

  async addTask(userId: string, title: string): Promise<Task> {
    const res = await fetch(`/api/${safeUserId(userId)}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      throw new Error(`Failed to add task (${res.status})`);
    }

    return res.json();
  },

  async toggleComplete(
    userId: string,
    taskId: number
  ): Promise<Task> {
    const res = await fetch(
      `/api/${safeUserId(userId)}/tasks/${taskId}`,
      {
        method: "PATCH",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to toggle task (${res.status})`);
    }

    return res.json();
  },

  async deleteTask(
    userId: string,
    taskId: number
  ): Promise<{ ok: boolean }> {
    const res = await fetch(
      `/api/${safeUserId(userId)}/tasks/${taskId}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to delete task (${res.status})`);
    }

    return res.json();
  },
};

/**
 * Dashboard compatibility wrappers
 * (dashboard 3 args pass karta hai – hum 3rd ignore kar dete hain)
 */

export async function apiListTasks(userId: string) {
  return api.listTasks(userId);
}

export async function apiAddTask(userId: string, title: string) {
  return api.addTask(userId, title);
}

export async function apiToggleComplete(
  userId: string,
  taskId: number,
  _nextCompleted?: boolean
) {
  // _nextCompleted dashboard se aata hai — backend ko zarurat nahi
  return api.toggleComplete(userId, taskId);
}

export async function apiDeleteTask(userId: string, taskId: number) {
  return api.deleteTask(userId, taskId);
}
