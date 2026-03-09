"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  cardId: string;
}

export default function PublishButton({ cardId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<{ publicUrl: string; presentUrl: string } | null>(null);

  async function handlePublish() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setUrls({ publicUrl: data.publicUrl, presentUrl: data.presentUrl });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  if (urls) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-600 font-medium">Published!</span>
        <Button asChild size="sm" variant="outline">
          <a href={urls.presentUrl} target="_blank" rel="noopener noreferrer">
            📲 Present Mode
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={urls.publicUrl} target="_blank" rel="noopener noreferrer">
            Client View ↗
          </a>
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handlePublish} disabled={loading}>
      {loading ? "Publishing…" : "Publish Card"}
    </Button>
  );
}
