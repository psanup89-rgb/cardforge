"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ userId, name }: { userId: string; name: string }) {
  const [state, setState] = useState<"idle" | "confirm" | "loading" | "error">("idle");
  const router = useRouter();

  async function handleDelete() {
    setState("loading");
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setState("error");
    }
  }

  if (state === "confirm") {
    return (
      <span className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          className="text-xs font-medium text-red-600 hover:text-red-800"
        >
          Confirm
        </button>
        <button
          onClick={() => setState("idle")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </span>
    );
  }

  if (state === "error") {
    return <span className="text-xs text-red-500">Failed</span>;
  }

  return (
    <button
      onClick={() => setState("confirm")}
      disabled={state === "loading"}
      className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
    >
      {state === "loading" ? "Deleting…" : "Delete"}
    </button>
  );
}
