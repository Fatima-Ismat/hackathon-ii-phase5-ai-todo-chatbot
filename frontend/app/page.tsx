"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AUTH_KEY = "todo_user_id";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userId = localStorage.getItem(AUTH_KEY);

    if (userId) {
      router.replace("/dashboard");
    } else {
      router.replace("/signin");
    }
  }, [router]);

  // 👇 intentionally blank (no UI)
  return null;
}
