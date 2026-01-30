"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import ChatbotWidget from "@/components/ChatbotWidget";

import {
  apiAddTask,
  apiDeleteTask,
  apiListTasks,
  apiToggleComplete,
  type Task as ApiTask,
} from "../../lib/api";

const AUTH_KEY = "todo_user_id";

type Task = ApiTask;
type Tab = "all" | "pending" | "completed";

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);

  // ✅ keep userId in state so Chatbot + Dashboard always aligned
  const [userId, setUserId] = useState<string>("");

  const readUserId = useCallback(() => {
    return typeof window !== "undefined" ? localStorage.getItem(AUTH_KEY) : null;
  }, []);

  const refreshTasks = useCallback(async () => {
    const uid = readUserId();
    if (!uid) {
      router.push("/signin");
      return;
    }

    try {
      setLoading(true);
      const data = await apiListTasks(uid);
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [readUserId, router]);

  // ✅ on mount: set userId + load tasks
  useEffect(() => {
    const uid = readUserId();
    if (!uid) {
      router.push("/signin");
      return;
    }
    setUserId(uid);
    void refreshTasks();
  }, [readUserId, router, refreshTasks]);

  // ✅ optional global refresh hook (if you dispatch events)
  useEffect(() => {
    const handler = () => void refreshTasks();
    window.addEventListener("tasks:refresh", handler as EventListener);
    return () =>
      window.removeEventListener("tasks:refresh", handler as EventListener);
  }, [refreshTasks]);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    router.push("/signin");
  }, [router]);

  const addTask = useCallback(async () => {
    const uid = readUserId();
    const t = title.trim();

    if (!uid) {
      router.push("/signin");
      return;
    }
    if (!t) return;

    try {
      const created = await apiAddTask(uid, t);
      setTasks((prev) => [created, ...prev]);
      setTitle("");
      toast.success("Task added");
    } catch {
      toast.error("Add failed");
    }
  }, [title, readUserId, router]);

  // ✅ FIXED: pass completed boolean as 3rd arg (NO UI change)
  const toggleTask = useCallback(
    async (id: number) => {
      const uid = readUserId();
      if (!uid) {
        router.push("/signin");
        return;
      }

      // find current task state
      const current = tasks.find((t) => t.id === id);
      const nextCompleted = !(current?.completed ?? false);

      try {
        const updated = await apiToggleComplete(uid, id, nextCompleted);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        toast.success(updated.completed ? "Task completed" : "Marked as pending");
      } catch {
        toast.error("Update failed");
      }
    },
    [readUserId, router, tasks]
  );

  const deleteTask = useCallback(
    async (id: number) => {
      const uid = readUserId();
      if (!uid) {
        router.push("/signin");
        return;
      }

      try {
        await apiDeleteTask(uid, id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
        toast("Task deleted", { icon: "🗑️" });
      } catch {
        toast.error("Delete failed");
      }
    },
    [readUserId, router]
  );

  const clearCompleted = useCallback(async () => {
    const uid = readUserId();
    if (!uid) {
      router.push("/signin");
      return;
    }

    const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
    if (completedIds.length === 0) return;

    try {
      await Promise.all(completedIds.map((id) => apiDeleteTask(uid, id)));
      setTasks((prev) => prev.filter((t) => !t.completed));
      toast("Completed tasks cleared", { icon: "🧹" });
    } catch {
      toast.error("Clear completed failed");
    }
  }, [tasks, readUserId, router]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById(
          "task-search"
        ) as HTMLInputElement | null;
        el?.focus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void addTask();
        return;
      }

      if (e.key === "1") setTab("all");
      if (e.key === "2") setTab("pending");
      if (e.key === "3") setTab("completed");
    },
    [addTask]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const pending = total - done;
    return { total, done, pending };
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchQuery = q ? t.title.toLowerCase().includes(q) : true;
      const matchTab =
        tab === "all" ? true : tab === "pending" ? !t.completed : t.completed;
      return matchQuery && matchTab;
    });
  }, [tasks, query, tab]);

  const emptyMessage = useMemo(() => {
    if (loading) return "Loading…";
    if (tasks.length === 0) return "No tasks yet";
    return "No tasks match your view";
  }, [tasks.length, loading]);

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-20 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-10 top-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              Premium Dashboard
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              My Tasks
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Search, filter, and manage your work smoothly
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void clearCompleted()}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10"
            >
              Clear completed
            </button>
            <button
              onClick={signOut}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Pending" value={stats.pending} />
          <Stat label="Completed" value={stats.done} />
        </section>

        {/* Controls */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Add */}
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void addTask()}
                type="text"
                placeholder="Add a new task..."
                className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
              />
              <button
                onClick={() => void addTask()}
                disabled={!title.trim()}
                className="rounded-2xl bg-gradient-to-r from-fuchsia-500/90 via-violet-500/90 to-cyan-500/90 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {/* Search */}
            <div className="lg:w-[320px]">
              <input
                id="task-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search tasks... (Ctrl+K)"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <TabButton active={tab === "all"} onClick={() => setTab("all")}>
              All ({stats.total})
            </TabButton>
            <TabButton
              active={tab === "pending"}
              onClick={() => setTab("pending")}
            >
              Pending ({stats.pending})
            </TabButton>
            <TabButton
              active={tab === "completed"}
              onClick={() => setTab("completed")}
            >
              Completed ({stats.done})
            </TabButton>
          </div>

          <p className="mt-3 text-xs text-white/45">
            Shortcuts: Ctrl/Cmd+K search • Ctrl/Cmd+Enter add • 1/2/3 tabs
          </p>
        </section>

        {/* List */}
        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60 backdrop-blur">
              {emptyMessage}
            </div>
          )}

          {filtered.map((t) => (
            <div
              key={t.id}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/7"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => void toggleTask(t.id)}
                  className="h-4 w-4 accent-cyan-400"
                />

                <div className="space-y-1">
                  <div
                    className={
                      t.completed
                        ? "text-sm line-through text-white/40"
                        : "text-sm text-white/90"
                    }
                  >
                    {t.title}
                  </div>

                  {t.completed ? (
                    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => void deleteTask(t.id)}
                aria-label="Delete task"
                title="Delete"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/0 px-3 py-2 text-white/55 transition hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
              >
                <TrashIcon />
                <span className="hidden text-sm sm:inline">Delete</span>
              </button>
            </div>
          ))}
        </section>
      </div>

      {/* ✅ Chatbot Widget (render only when userId exists) */}
      {userId ? <ChatbotWidget userId={userId} onMutate={refreshTasks} /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white"
          : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
      }
    >
      {children}
    </button>
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="opacity-95"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 3h6m-8 4h10m-9 0 1 14h6l1-14M10 11v7m4-7v7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
