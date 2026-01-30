"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};

type Props = {
  userId: string;
  onMutate?: () => void | Promise<void>;
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function fireTasksRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("tasks:refresh"));
}

export default function ChatbotWidget({ userId, onMutate }: Props) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [conversationId, setConversationId] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  useEffect(() => {
    if (!open || minimized) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open, minimized]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // ✅ IMPORTANT: same-origin proxy route (no CORS)
      const res = await fetch(`/api/${encodeURIComponent(userId)}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof data?.detail === "string"
            ? data.detail
            : typeof data?.error === "string"
            ? data.error
            : typeof data?.message === "string"
            ? data.message
            : `Request failed (${res.status})`;
        throw new Error(msg);
      }

      if (typeof data?.conversation_id === "number") {
        setConversationId(data.conversation_id);
      }

      const reply =
        typeof data?.response === "string"
          ? data.response
          : typeof data?.reply === "string"
          ? data.reply
          : "No response";

      const botMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply,
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);

      const didMutate =
        data?.did_mutate === true ||
        data?.mutated === true ||
        ["add", "delete", "remove", "complete", "done", "toggle", "clear"].some(
          (k) => String(data?.action || "").toLowerCase().includes(k)
        ) ||
        /(^|\s)(add|delete|remove|complete|done|toggle|clear)\b/i.test(text);

      if (didMutate) {
        fireTasksRefresh();
        if (onMutate) await onMutate();
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error: backend connect nahi hua.";

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: msg,
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
          aria-label="Open AI chat"
          title="Open AI chat"
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full border border-white/15 bg-gradient-to-r from-fuchsia-500/60 via-violet-500/60 to-cyan-500/60 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur hover:opacity-95"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/30 border border-white/10">
            <span className="text-white font-bold">AI</span>
          </div>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[360px] max-w-[92vw]">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]/80 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-fuchsia-500/20 via-violet-500/10 to-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-2">
                    <div className="text-white font-semibold text-sm">
                      Todo Assistant
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-white/70">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized((v) => !v)}
                  className="rounded-lg px-2 py-1 text-white/80 hover:bg-white/10 border border-transparent hover:border-white/10 text-xs"
                  aria-label="Minimize"
                  title="Minimize"
                >
                  {minimized ? "Expand" : "Min"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1 text-white/80 hover:bg-white/10 border border-transparent hover:border-white/10 text-xs"
                  aria-label="Close"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div
                  ref={listRef}
                  className="h-[340px] overflow-y-auto px-3 py-3 space-y-2"
                >
                  {messages.length === 0 && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90">
                        Hi, I’m your AI assistant. Tell me what to do:
                        <div className="mt-2 text-white/75">
                          • add milk
                          <br />
                          • list
                          <br />
                          • complete 1
                          <br />
                          • delete 1
                          <br />
                          • stats
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.role === "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >
                      <div
                        className={
                          m.role === "user"
                            ? "max-w-[85%] rounded-2xl rounded-tr-md bg-white/10 border border-white/10 px-3 py-2 text-sm text-white"
                            : "max-w-[85%] rounded-2xl rounded-tl-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90"
                        }
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/70">
                        Typing…
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-white/10 p-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void send();
                      }}
                      placeholder="Type a message…"
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                    />
                    <button
                      onClick={() => void send()}
                      disabled={!canSend}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-500/80 via-violet-500/80 to-cyan-500/80 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>

                  {/* Bottom labels */}
                  <div className="mt-2 text-[11px] text-white/45">
                    Todo Agent + MCP Tools
                  </div>
                  <div className="text-[11px] text-white/35">
                    ChatKit-style UI (custom). Official ChatKit not used due to
                    App Router incompatibility.
                  </div>
                </div>
              </>
            )}

            {minimized && (
              <div className="px-4 py-3 text-sm text-white/75">
                Minimized. Click “Expand” to continue.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
