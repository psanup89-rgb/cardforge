"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { downloadVCF } from "@/lib/generate-vcf";
import type { BusinessCard } from "@/components/card-designs/types";

interface Props {
  card: BusinessCard;
  cardRef: React.RefObject<HTMLDivElement>;
}

export default function CardActions({ card, cardRef }: Props) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadImage() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${card.full_name.replace(/\s+/g, "_")}_card.png`;
      a.click();
    } catch (e) {
      console.error("Image download failed", e);
    } finally {
      setDownloading(false);
    }
  }

  function handleDownloadVCF() {
    downloadVCF(card);
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        onClick={handleDownloadImage}
        disabled={downloading}
        variant="outline"
        className="gap-2"
      >
        <span>⬇</span>
        {downloading ? "Saving…" : "Save as Image"}
      </Button>

      <Button onClick={handleDownloadVCF} variant="outline" className="gap-2">
        <span>👤</span>
        Save Contact
      </Button>

      <Button disabled variant="outline" className="gap-2 opacity-60">
        <span>💳</span>
        Add to Wallet
        <span className="ml-1 rounded bg-muted px-1 py-0.5 text-xs">Soon</span>
      </Button>
    </div>
  );
}
