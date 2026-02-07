// frontend/components/ChatbotWidget.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiAddTask, apiDeleteTask, apiListTasks, apiToggleComplete, Task } from "@/lib/api";

const AUTH_KEY = "todo_user_id";
const TOAST_EVENT = "todo:toast";

// persist keys
const CHAT_OPEN_KEY = "todo_chat_open";
const CHAT_MIN_KEY = "todo_chat_min";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function emitDashboardToast(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message } }));
}

function normalizeSpaces(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function parseDueDate(text: string): string | null {
  const t = text.trim();

  const iso = t.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmY = t.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})\b/);
  if (dmY) {
    const dd = String(dmY[1]).padStart(2, "0");
    const mm = String(dmY[2]).padStart(2, "0");
    const yy = dmY[3];
    return `${yy}-${mm}-${dd}`;
  }
  return null;
}

function parseAddPayload(raw: string): { title: string; description?: string; due_date?: string } | null {
  let text = normalizeSpaces(raw);
  text = text.replace(/^\s*add\s+/i, "");

  let due: string | null = null;

  const dueMatch =
    text.match(/\b(due|date)\s*[:\-]?\s*(20\d{2}-\d{2}-\d{2})\b/i) ||
    text.match(/\b(due|date)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2})\b/i);

  if (dueMatch) {
    due = parseDueDate(dueMatch[2]) || null;
    text = normalizeSpaces(text.replace(dueMatch[0], ""));
  } else {
    const anyDate =
      text.match(/\b20\d{2}-\d{2}-\d{2}\b/) ||
      text.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2}\b/);
    if (anyDate) {
      due = parseDueDate(anyDate[0]) || null;
      text = normalizeSpaces(text.replace(anyDate[0], ""));
    }
  }

  let desc: string | undefined;

  const descMatch =
    text.match(/\b(desc|description)\s*[:\-]\s*(.+)$/i) ||
    text.match(/\b(desc|description)\s+(.+)$/i);

  if (descMatch) {
    desc = normalizeSpaces(descMatch[2]);
    text = normalizeSpaces(text.slice(0, descMatch.index || 0));
  } else {
    const forMatch = text.match(/\bfor\s+(.+)$/i);
    if (forMatch) {
      desc = normalizeSpaces(forMatch[1]);
      text = normalizeSpaces(text.slice(0, forMatch.index || 0));
    }
  }

  const title = normalizeSpaces(text);
  if (!title) return null;

  const payload: { title: string; description?: string; due_date?: string } = { title };
  if (desc) payload.description = desc;
  if (due) payload.due_date = due;
  return payload;
}

function readBool(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "1";
  } catch {
    return fallback;
  }
}
function writeBool(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {}
}

function niceErr(e: any) {
  return (e?.message && typeof e.message === "string") ? e.message : String(e);
}

export default function ChatbotWidget() {
  // ✅ default CLOSED (pehle true tha)
  const [open, setOpen] = useState<boolean>(false);
  const [minimized, setMinimized] = useState<boolean>(false);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: uid(),
      role: "assistant",
      text:
        "Assalam o Alaikum 👋  Main tumhara Todo Assistant hoon.\n" +
        "Try: add milk desc: for health due: 2026-02-04\n" +
        "Or: list | pending | completed | stats | delete milk | complete milk",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const userId = useMemo(() => {
    try {
      return localStorage.getItem(AUTH_KEY) || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    // ✅ default CLOSED fallback (pehle true tha)
    const o = readBool(CHAT_OPEN_KEY, false);
    const m = readBool(CHAT_MIN_KEY, false);
    setOpen(o);
    setMinimized(m);
  }, []);

  useEffect(() => writeBool(CHAT_OPEN_KEY, open), [open]);
  useEffect(() => writeBool(CHAT_MIN_KEY, minimized), [minimized]);

  useEffect(() => {
    if (!open || minimized) return;
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, minimized]);

  function push(role: Msg["role"], text: string) {
    setMessages((m) => [...m, { id: uid(), role, text }]);
  }
  function reply(text: string) {
    push("assistant", text);
  }

  async function findTaskByTitleSmart(all: Task[], query: string): Promise<Task | null> {
    const q = normalizeSpaces(query).toLowerCase();
    if (!q) return null;

    // exact matches -> take newest
    const exact = all
      .filter((t) => normalizeSpaces(t.title).toLowerCase() === q)
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    if (exact.length) return exact[0];

    // contains matches -> take newest
    const partial = all
      .filter((t) => normalizeSpaces(t.title).toLowerCase().includes(q))
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    if (partial.length) return partial[0];

    return null;
  }

  async function handleCommand(raw: string) {
    const text = normalizeSpaces(raw);
    if (!text) return;

    if (!userId) {
      reply("Pehlay Sign in karo. (user id missing)");
      return;
    }

    const lower = text.toLowerCase();

    // ADD
    if (lower.startsWith("add ")) {
      const payload = parseAddPayload(text);
      if (!payload) {
        reply("Format: add milk desc: for health due: 2026-02-04");
        return;
      }

      setBusy(true);
      try {
        const created = await apiAddTask({
          userId,
          title: payload.title,
          description: payload.description,
          due_date: payload.due_date,
        });

        const duePart = created?.due_date ? ` • due ${created.due_date}` : "";
        const descPart = created?.description ? ` • ${created.description}` : "";
        reply(`✅ Added: ${created.title}${descPart}${duePart}`);

        toast.success("Task added");
        emitDashboardToast("Task added");
      } catch (e: any) {
        reply(`❌ Add failed: ${niceErr(e)}`);
      } finally {
        setBusy(false);
      }
      return;
    }

    // LIST / PENDING / COMPLETED
    if (lower === "list" || lower === "pending" || lower === "completed") {
      setBusy(true);
      try {
        const list = await apiListTasks(userId);
        const arr = Array.isArray(list) ? list : [];

        const filtered =
          lower === "pending"
            ? arr.filter((t) => !t.completed)
            : lower === "completed"
              ? arr.filter((t) => t.completed)
              : arr;

        if (!filtered.length) {
          reply(lower === "list" ? "No tasks." : `No ${lower} tasks.`);
        } else {
          const lines = filtered
            .slice()
            .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
            .slice(0, 10)
            .map((t) => {
              const mark = t.completed ? "✅" : "🟡";
              const due = t.due_date ? ` • due ${t.due_date}` : "";
              const desc = t.description ? ` • ${String(t.description).slice(0, 32)}` : "";
              return `${mark} ${t.title}${desc}${due}`;
            });
          reply(lines.join("\n"));
        }
      } catch (e: any) {
        reply(`❌ Failed: ${niceErr(e)}`);
      } finally {
        setBusy(false);
      }
      return;
    }

    // STATS
    if (lower === "stats") {
      setBusy(true);
      try {
        const list = await apiListTasks(userId);
        const total = list.length;
        const completed = list.filter((t) => t.completed).length;
        const pending = total - completed;
        reply(`📊 Stats: total ${total}, pending ${pending}, completed ${completed}`);
      } catch (e: any) {
        reply(`❌ Failed: ${niceErr(e)}`);
      } finally {
        setBusy(false);
      }
      return;
    }

    // DELETE (title-first smart)
    if (lower.startsWith("delete ")) {
      const arg = normalizeSpaces(text.replace(/^delete\s+/i, ""));
      if (!arg) {
        reply('Example: delete milk');
        return;
      }

      setBusy(true);
      try {
        // if user typed number explicitly, allow
        const asNum = Number(arg);
        if (Number.isFinite(asNum) && String(asNum) === arg) {
          await apiDeleteTask(userId, asNum);
          reply(`🗑️ Deleted: ${asNum}`);
          toast.success("Task deleted");
          emitDashboardToast("Task deleted");
          return;
        }

        const all = await apiListTasks(userId);
        const picked = await findTaskByTitleSmart(all, arg);

        if (!picked) {
          reply(`❌ "${arg}" task nahi mila. (Try: list)`);
          return;
        }

        await apiDeleteTask(userId, picked.id);
        reply(`🗑️ Deleted: ${picked.title}`);
        toast.success("Task deleted");
        emitDashboardToast("Task deleted");
      } catch (e: any) {
        reply(`❌ Delete failed: ${niceErr(e)}`);
      } finally {
        setBusy(false);
      }
      return;
    }

    // COMPLETE / UNCOMPLETE (title-first)
    if (lower.startsWith("complete ") || lower.startsWith("uncomplete ")) {
      const isComplete = lower.startsWith("complete ");
      const arg = normalizeSpaces(text.replace(/^(complete|uncomplete)\s+/i, ""));
      if (!arg) {
        reply(isComplete ? "Example: complete milk" : "Example: uncomplete milk");
        return;
      }

      setBusy(true);
      try {
        const asNum = Number(arg);
        if (Number.isFinite(asNum) && String(asNum) === arg) {
          await apiToggleComplete(userId, asNum, isComplete);
          reply(isComplete ? `✅ Completed: ${asNum}` : `↩️ Uncompleted: ${asNum}`);
          toast.success("Task updated");
          emitDashboardToast("Task updated");
          return;
        }

        const all = await apiListTasks(userId);
        const picked = await findTaskByTitleSmart(all, arg);
        if (!picked) {
          reply(`❌ "${arg}" task nahi mila. (Try: list)`);
          return;
        }

        await apiToggleComplete(userId, picked.id, isComplete);
        reply(isComplete ? `✅ Completed: ${picked.title}` : `↩️ Uncompleted: ${picked.title}`);
        toast.success("Task updated");
        emitDashboardToast("Task updated");
      } catch (e: any) {
        reply(`❌ Update failed: ${niceErr(e)}`);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (lower === "help") {
      reply("Commands: add <task> (desc:/for + due/date), list, pending, completed, stats, delete <title>, complete <title>");
      return;
    }

    reply("❓ Command samajh nahi aaya. Type: help");
  }

  async function onSend() {
    const t = input.trim();
    if (!t || busy) return;
    push("user", t);
    setInput("");
    await handleCommand(t);
  }

  // closed state => AI circle button
  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
        className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold shadow-2xl border border-white/10 hover:opacity-95 active:scale-95 transition"
        aria-label="Open Todo Assistant"
        title="Todo Assistant"
      >
        AI
      </button>
    );
  }

  return (
    <>
      <style jsx global>{`
        .chat-scroll::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
        .chat-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      <div className="fixed right-6 bottom-6 z-50" style={{ width: minimized ? 300 : 380 }}>
        <div className="rounded-3xl border border-white/10 bg-[#0b0d14]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <div className="min-w-0">
                <div className="text-white font-semibold leading-5 truncate">Todo Assistant</div>
                <div className="text-xs text-emerald-300/90 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                  Online
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinimized((s) => !s)}
                className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
              >
                {minimized ? "Open" : "Min"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
              >
                X
              </button>
            </div>
          </div>

          {!minimized ? (
            <div className="px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto chat-scroll">
                {["add", "list", "pending", "completed", "stats"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setInput(c === "add" ? "add " : c)}
                    className="shrink-0 text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-white/45">ChatKit UI • MCP tools enabled</div>
            </div>
          ) : null}

          {!minimized ? (
            <div ref={listRef} className="chat-scroll px-3 py-3 space-y-2 overflow-y-auto" style={{ height: 270 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[90%] whitespace-pre-wrap text-sm px-4 py-3 rounded-2xl border ${
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 border-white/10 text-white"
                      : "mr-auto bg-white/5 border-white/10 text-white/90"
                  }`}
                >
                  {m.text}
                </div>
              ))}

              {busy ? (
                <div className="mr-auto max-w-[90%] text-sm px-4 py-3 rounded-2xl border bg-white/5 border-white/10 text-white/70">
                  Thinking...
                </div>
              ) : null}
            </div>
          ) : null}

          {!minimized ? (
            <div className="p-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSend();
                  }}
                  placeholder="Type..."
                  className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-white/40"
                />
                <button
                  onClick={onSend}
                  disabled={busy}
                  className="rounded-2xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-95 disabled:opacity-50"
                >
                  Send
                </button>
              </div>

              <div className="mt-2 text-[11px] text-white/45">
                Example: <span className="text-white/70">delete milk</span> •{" "}
                <span className="text-white/70">complete bread</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
