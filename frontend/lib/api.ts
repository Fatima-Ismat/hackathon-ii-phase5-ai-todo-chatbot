const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export async function apiListTasks(userId: string): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/${userId}/tasks`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("list failed");
  return res.json();
}

export async function apiAddTask(userId: string, title: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/${userId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("add failed");
  return res.json();
}

export async function apiToggleComplete(
  userId: string,
  taskId: number,
  completed: boolean
): Promise<Task> {
  const res = await fetch(
    `${API_BASE}/api/${userId}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    }
  );
  if (!res.ok) throw new Error("update failed");
  return res.json();
}

export async function apiDeleteTask(
  userId: string,
  taskId: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/${userId}/tasks/${taskId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("delete failed");
}
