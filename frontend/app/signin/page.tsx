"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const AUTH_KEY = "todo_user_id";

export default function SignInPage() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onContinue() {
    const v = value.trim();
    if (!v) return;
    localStorage.setItem(AUTH_KEY, v);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#070A12] text-white">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-20 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-10 top-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-2">
        {/* Left: Branding + value props */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            TodoApp • Premium UI
          </div>

          <div className="space-y-3">
            <div className="text-xl font-semibold tracking-tight">TodoApp</div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-white/60">
              Plan, track, and finish work faster with a clean dashboard experience.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm font-semibold">Stay organized</div>
              <p className="mt-1 text-sm text-white/60">
                Keep tasks in one place with quick add, complete, and delete.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm font-semibold">Move faster</div>
              <p className="mt-1 text-sm text-white/60">
                Minimal friction sign-in so you can start immediately.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm font-semibold">Clean workflow</div>
              <p className="mt-1 text-sm text-white/60">
                Premium dark UI that feels like a real SaaS product.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm font-semibold">Always in sync</div>
              <p className="mt-1 text-sm text-white/60">
                Your tasks stay saved, even after refresh.
              </p>
            </div>
          </div>
        </section>

        {/* Right: Sign in card */}
        <section className="md:flex md:justify-end">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Continue</h2>
              <p className="text-sm text-white/60">
                Enter your name or email to proceed.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Name or Email
                </label>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onContinue();
                  }}
                  type="text"
                  placeholder="e.g. Ismat Fatima"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                />
              </div>

              <button
                type="button"
                onClick={onContinue}
                disabled={!value.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500/90 via-violet-500/90 to-cyan-500/90 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>

              <p className="text-center text-xs text-white/50">
                No password required for this demo sign-in.
              </p>

              <div className="mt-2 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold">New here?</div>
                <p className="mt-1 text-sm text-white/60">
                  Type your name or email and continue. Your session will start instantly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
