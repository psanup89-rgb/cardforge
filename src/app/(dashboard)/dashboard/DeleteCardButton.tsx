"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  cardId: string;
}

export default function DeleteCardButton({ cardId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this card? This cannot be undone.")) return;
    setLoading(true);

    const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete card");
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "…" : "Delete"}
    </Button>
  );
}
