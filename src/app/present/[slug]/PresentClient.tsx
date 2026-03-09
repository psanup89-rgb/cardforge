"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { BusinessCard } from "@/components/card-designs/types";
import CardWithQR from "@/components/card-designs/CardWithQR";

interface Props {
  card: BusinessCard;
  clientUrl: string;
}

const THEME: Record<string, { bg: string; accent: string }> = {
  "black-elegance":   { bg: "#080808",  accent: "#D4AF37" },
  "vibrant-gradient": { bg: "#100828",  accent: "#c084fc" },
  "corporate-clean":  { bg: "#0b1221",  accent: "#3b82f6" },
};

export default function PresentClient({ card, clientUrl }: Props) {
  const largeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);

  const theme = THEME[card.template_id] ?? THEME["black-elegance"];
  const accent = card.accent_color || theme.accent;

  // Large QR for easy scanning
  useEffect(() => {
    if (!largeCanvasRef.current) return;
    QRCode.toCanvas(largeCanvasRef.current, clientUrl, {
      width: 220,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(() => setQrReady(true));
  }, [clientUrl]);

  return (
    <div
      className="fixed inset-0 overflow-y-auto select-none"
      style={{ background: theme.bg }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 20%, ${accent}18 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-7 px-5 py-10 text-center min-h-screen justify-center">

        {/* Header */}
        <div>
          <p
            className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-2.5"
            style={{ color: `${accent}70` }}
          >
            Digital Business Card
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
            {card.full_name}
          </h1>
          {(card.designation || card.company_name) && (
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              {[card.designation, card.company_name].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Card with embedded QR stamp */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 24px 60px rgba(0,0,0,0.6), 0 0 80px ${accent}18`,
          }}
        >
          <CardWithQR card={card} scale={1} qrUrl={clientUrl} qrSize={52} />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <p className="text-[11px] tracking-widest uppercase" style={{ color: `${accent}60` }}>
            Scan to connect
          </p>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Large QR for scanning */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "#ffffff",
            boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 0 50px ${accent}28, 0 16px 48px rgba(0,0,0,0.5)`,
            opacity: qrReady ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        >
          <canvas ref={largeCanvasRef} className="rounded-lg block" />
        </div>

        {/* Instruction */}
        <p className="text-sm text-white/40">
          Point camera at QR · Clients save your contact instantly
        </p>
      </div>

      {/* URL footer */}
      <p className="fixed bottom-4 left-0 right-0 text-center text-[10px] text-white/12 tracking-wide">
        {clientUrl.replace(/^https?:\/\//, "")}
      </p>
    </div>
  );
}
