// frontend/app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import ChatbotWidget from "@/components/ChatbotWidget";
import {
  apiAddTask,
  apiDeleteTask,
  apiListTasks,
  apiToggleComplete,
  type Task,
} from "@/lib/api";

const AUTH_KEY = "todo_user_id";
const TOAST_EVENT = "todo:toast";

type Tab = "all" | "pending" | "completed";

function normalizeSpaces(s: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function toNiceError(e: any) {
  try {
    if (!e) return "Unknown error";
    if (typeof e === "string") return e;
    if (e?.message && typeof e.message === "string") return e.message;
    return JSON.stringify(e); // avoid [object Object]
  } catch {
    return "Unknown error";
  }
}

function fmtDue(d?: string | null) {
  if (!d) return "";
  const m = String(d).match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : String(d);
}

export default function DashboardPage() {
  const userId = useMemo(() => {
    try {
      return localStorage.getItem(AUTH_KEY) || "";
    } catch {
      return "";
    }
  }, []);

  const [loading, setLoading] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<Tab>("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // YYYY-MM-DD

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = normalizeSpaces(search).toLowerCase();
    const base =
      tab === "pending"
        ? tasks.filter((t) => !t.completed)
        : tab === "completed"
        ? tasks.filter((t) => t.completed)
        : tasks;

    if (!q) return base;

    return base.filter((t) => {
      const hay = `${t.title ?? ""} ${t.description ?? ""} ${fmtDue(
        (t as any).due_date
      )}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tasks, tab, search]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, pending, completed };
  }, [tasks]);

  const refreshTasks = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const list = await apiListTasks(userId);
      setTasks(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast.error(toNiceError(e));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // ✅ Debounced refresh on chatbot event (no flicker)
  const refreshTimer = useRef<number | null>(null);
  useEffect(() => {
    const handler = () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(() => {
        void refreshTasks();
      }, 700);
    };

    window.addEventListener(TOAST_EVENT, handler as any);
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      window.removeEventListener(TOAST_EVENT, handler as any);
    };
  }, [refreshTasks]);

  const addTask = useCallback(async () => {
    const t = normalizeSpaces(title);
    if (!t) {
      toast.error("Task title required");
      return;
    }
    if (!userId) {
      toast.error("Please sign in first");
      return;
    }

    try {
      setLoading(true);
      await apiAddTask({
        userId,
        title: t,
        description: normalizeSpaces(description) || undefined,
        due_date: dueDate || undefined,
      });
      toast.success("Task added");
      setTitle("");
      setDescription("");
      setDueDate("");
      await refreshTasks(); // ✅ OK for ADD
    } catch (e: any) {
      toast.error(toNiceError(e));
    } finally {
      setLoading(false);
    }
  }, [title, description, dueDate, userId, refreshTasks]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!userId) {
        toast.error("Please sign in first");
        return;
      }
      try {
        setLoading(true);
        await apiDeleteTask(userId, id);
        toast.success("Task deleted");
        await refreshTasks(); // ✅ OK for DELETE
      } catch (e: any) {
        toast.error(toNiceError(e));
      } finally {
        setLoading(false);
      }
    },
    [userId, refreshTasks]
  );

  // ✅ FIXED: complete flicker/revert removed
  // - optimistic UI
  // - apply backend returned updated task
  // - NO refreshTasks here (that's what caused revert)
  const handleToggleComplete = useCallback(
    async (id: number, completed: boolean) => {
      if (!userId) {
        toast.error("Please sign in first");
        return;
      }

      // optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed } : t))
      );

      try {
        const updated = await apiToggleComplete(userId, id, completed);

        // apply backend response on same task
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? ({ ...t, ...updated } as Task) : t
          )
        );

        toast.success(completed ? "Task completed" : "Task updated");
      } catch (e: any) {
        // rollback
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: !completed } : t
          )
        );
        toast.error(toNiceError(e));
      }
    },
    [userId]
  );

  const clearCompleted = useCallback(async () => {
    if (!userId) return;

    const done = tasks.filter((t) => t.completed);
    if (!done.length) {
      toast("No completed tasks");
      return;
    }

    try {
      setLoading(true);
      for (const t of done) {
        await apiDeleteTask(userId, t.id);
      }
      toast.success("Completed cleared");
      await refreshTasks();
    } catch (e: any) {
      toast.error(toNiceError(e));
    } finally {
      setLoading(false);
    }
  }, [tasks, userId, refreshTasks]);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {}
    toast.success("Signed out");
    window.location.href = "/";
  }, []);

  return (
    <div className="min-h-screen bg-[#06070b] text-white">
      {/* ✅ SAME old vibe background: center pink + right cyan */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(168,85,247,0.45),transparent_55%),radial-gradient(circle_at_82%_42%,rgba(34,211,238,0.25),transparent_50%),radial-gradient(circle_at_18%_86%,rgba(59,130,246,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        {/* top bar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              Premium Dashboard
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">My Tasks</h1>
            <p className="mt-1 text-white/60">
              Search, filter, and manage your work smoothly
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearCompleted}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
            >
              Clear completed
            </button>
            <button
              onClick={signOut}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* stats cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-sm text-white/60">Total</div>
            <div className="mt-2 text-3xl font-semibold">{stats.total}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-sm text-white/60">Pending</div>
            <div className="mt-2 text-3xl font-semibold">{stats.pending}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-sm text-white/60">Completed</div>
            <div className="mt-2 text-3xl font-semibold">{stats.completed}</div>
          </div>
        </div>

        {/* add form */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              className="md:col-span-6 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/35 focus:border-white/20"
            />
            <button
              onClick={addTask}
              disabled={loading}
              className="md:col-span-2 w-full rounded-2xl px-4 py-3 font-semibold text-white shadow-2xl disabled:opacity-50 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-95"
            >
              Add
            </button>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks... (Ctrl+K)"
              className="md:col-span-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/35 focus:border-white/20"
            />

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="md:col-span-7 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/35 focus:border-white/20"
            />
            <div className="md:col-span-3">
              <input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                type="date"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/35 focus:border-white/20"
              />
            </div>
            <div className="md:col-span-2" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTab("all")}
              className={`rounded-full px-4 py-2 text-sm border ${
                tab === "all"
                  ? "border-white/20 bg-white/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setTab("pending")}
              className={`rounded-full px-4 py-2 text-sm border ${
                tab === "pending"
                  ? "border-white/20 bg-white/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setTab("completed")}
              className={`rounded-full px-4 py-2 text-sm border ${
                tab === "completed"
                  ? "border-white/20 bg-white/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              Completed ({stats.completed})
            </button>

            <div className="ml-2 text-xs text-white/45">
              Tip: Chatbot add kare to 1–2 sec me dashboard auto refresh ho jayega.
            </div>
          </div>
        </div>

        {/* list */}
        <div className="mt-6 space-y-4">
          {loading && tasks.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70 backdrop-blur-xl">
              Loading...
            </div>
          ) : null}

          {!filtered.length ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/60 backdrop-blur-xl">
              No tasks found.
            </div>
          ) : (
            filtered
              .slice()
              .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
              .map((task) => {
                const due = fmtDue((task as any).due_date);

                return (
                  <div
                    key={task.id}
                    className={`rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${
                      task.completed ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() =>
                            handleToggleComplete(task.id, !task.completed)
                          }
                          className="mt-1 h-5 w-5 accent-emerald-500"
                        />

                        <div>
                          <div
                            className={`text-lg font-semibold ${
                              task.completed ? "line-through text-white/60" : ""
                            }`}
                          >
                            {task.title}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {!task.completed ? (
                              <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-200">
                                Pending
                              </span>
                            ) : (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75 backdrop-blur-md">
                                ✅ Completed
                              </span>
                            )}

                            {due ? (
                              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-200">
                                Due: {due}
                              </span>
                            ) : null}
                          </div>

                          {(task as any).description ? (
                            <div
                              className={`mt-2 text-sm ${
                                task.completed ? "text-white/45" : "text-white/60"
                              }`}
                            >
                              {(task as any).description}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleToggleComplete(task.id, !task.completed)
                          }
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
                        >
                          {task.completed ? "Undo" : "Complete"}
                        </button>

                        <button
                          onClick={() => handleDelete(task.id)}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      <ChatbotWidget />
    </div>
  );
}
