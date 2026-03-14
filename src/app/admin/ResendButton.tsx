"use client";

import { useState } from "react";

export default function ResendButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleResend() {
    setState("loading");
    const res = await fetch("/api/admin/resend-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setState(res.ok ? "sent" : "error");
  }

  if (state === "sent") {
    return <span className="text-xs text-green-600 font-medium">Sent ✓</span>;
  }

  if (state === "error") {
    return <span className="text-xs text-red-500">Failed — retry?</span>;
  }

  return (
    <button
      onClick={handleResend}
      disabled={state === "loading"}
      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 whitespace-nowrap"
    >
      {state === "loading" ? "Sending…" : "Resend invite"}
    </button>
  );
}
