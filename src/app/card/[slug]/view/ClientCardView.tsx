"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toPng } from "html-to-image";
import CardWithQR from "@/components/card-designs/CardWithQR";
import type { BusinessCard } from "@/components/card-designs/types";

const TEMPLATE_THEME: Record<string, { bg: string; bgBase: string; surface: string; accent: string; text: string; sub: string }> = {
  "black-elegance": {
    bg: "linear-gradient(160deg, #080808 0%, #111118 100%)",
    bgBase: "#080808",
    surface: "rgba(255,255,255,0.04)",
    accent: "#D4AF37",
    text: "#ffffff",
    sub: "rgba(255,255,255,0.45)",
  },
  "vibrant-gradient": {
    bg: "linear-gradient(160deg, #1e1040 0%, #3b1d7a 40%, #6b2a8a 100%)",
    bgBase: "#1e1040",
    surface: "rgba(255,255,255,0.07)",
    accent: "#f093fb",
    text: "#ffffff",
    sub: "rgba(255,255,255,0.5)",
  },
  "corporate-clean": {
    bg: "linear-gradient(160deg, #0b1221 0%, #0f1e38 100%)",
    bgBase: "#0b1221",
    surface: "rgba(255,255,255,0.05)",
    accent: "#2563EB",
    text: "#ffffff",
    sub: "rgba(255,255,255,0.45)",
  },
};

const SOCIAL_META: Record<string, { label: string; color: string; short: string }> = {
  linkedin:  { label: "LinkedIn",    color: "#0A66C2", short: "in" },
  twitter:   { label: "Twitter / X", color: "#e7e7e7", short: "𝕏"  },
  github:    { label: "GitHub",      color: "#a0a0a0", short: "gh" },
  instagram: { label: "Instagram",   color: "#E1306C", short: "ig" },
  youtube:   { label: "YouTube",     color: "#FF0000", short: "▶"  },
};

export default function ClientCardView({ card, clientUrl }: { card: BusinessCard; clientUrl: string }) {
  const cardRef = useRef<HTMLDivElement>(null!);
  const [imgSaving, setImgSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  const theme = TEMPLATE_THEME[card.template_id] ?? TEMPLATE_THEME["black-elegance"];

  // Set body background to match theme — prevents white overscroll flash on iOS/Android
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = theme.bgBase;
    return () => { document.body.style.backgroundColor = prev; };
  }, [theme.bgBase]);
  const accent = card.accent_color || theme.accent;
  const social = card.social_links as Record<string, string> | undefined;
  const activeSocials = Object.entries(SOCIAL_META).filter(([k]) => social?.[k]);

  async function saveImage() {
    if (!cardRef.current) return;
    setImgSaving(true);
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${card.full_name.replace(/\s+/g, "_")}.png`;
      a.click();
    } finally {
      setImgSaving(false);
    }
  }

  function saveContact() {
    window.location.href = `/api/cards/${card.id}/vcf`;
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2500);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: theme.bg, fontFamily: "system-ui, sans-serif" }}
    >
      {/* Hero strip */}
      <div className="w-full flex flex-col items-center pt-14 pb-10 px-6 text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ width: 500, height: 300, background: accent, top: -80 }}
        />

        {/* Logo if present */}
        {card.company_logo_url && (
          <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10">
            <Image src={card.company_logo_url} alt={card.company_name || ""} fill className="object-contain p-1" />
          </div>
        )}

        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: theme.text }}
        >
          {card.full_name}
        </h1>

        {card.designation && (
          <p className="mt-2 text-base font-medium" style={{ color: accent }}>
            {card.designation}
          </p>
        )}
        {card.company_name && (
          <p className="mt-0.5 text-sm" style={{ color: theme.sub }}>
            {card.company_name}
          </p>
        )}

        {/* Location */}
        {card.location && (
          <p className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: theme.sub }}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
            </svg>
            {card.location}
          </p>
        )}
      </div>

      {/* Card visual with embedded QR */}
      <div className="px-6 w-full flex justify-center">
        <div
          ref={cardRef}
          className="overflow-hidden rounded-2xl"
          style={{
            boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${accent}18`,
          }}
        >
          <CardWithQR card={card} scale={1} qrUrl={clientUrl} qrSize={52} qrTop={96} />
        </div>
      </div>

      {/* Contact action pills */}
      <div className="mt-8 px-6 w-full max-w-sm flex flex-col gap-3">
        {card.email && (
          <a
            href={`mailto:${card.email}`}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-opacity hover:opacity-80"
            style={{ background: theme.surface, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs" style={{ background: `${accent}22`, color: accent }}>
              ✉
            </span>
            <span style={{ color: theme.text }}>{card.email}</span>
          </a>
        )}
        {card.phone && (
          <a
            href={`tel:${card.phone}`}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-opacity hover:opacity-80"
            style={{ background: theme.surface, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs" style={{ background: `${accent}22`, color: accent }}>
              ☎
            </span>
            <span style={{ color: theme.text }}>{card.phone}</span>
          </a>
        )}
        {card.website && (
          <a
            href={card.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-opacity hover:opacity-80"
            style={{ background: theme.surface, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs" style={{ background: `${accent}22`, color: accent }}>
              ⬡
            </span>
            <span style={{ color: theme.text }}>{card.website.replace(/^https?:\/\//, "")}</span>
          </a>
        )}
      </div>

      {/* Social links */}
      {activeSocials.length > 0 && (
        <div className="mt-5 px-6 w-full max-w-sm flex flex-wrap gap-2">
          {activeSocials.map(([key, meta]) => (
            <a
              key={key}
              href={social![key]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-opacity hover:opacity-75"
              style={{
                background: `${meta.color}1a`,
                border: `1px solid ${meta.color}40`,
                color: "#fff",
              }}
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: meta.color, color: "#fff" }}
              >
                {meta.short}
              </span>
              {meta.label}
            </a>
          ))}
        </div>
      )}

      {/* ── Primary CTA ── */}
      <div className="mt-8 px-6 w-full max-w-sm flex flex-col gap-3">
        {/* Save Contact — primary */}
        <button
          onClick={saveContact}
          className="w-full rounded-2xl py-4 text-sm font-semibold tracking-wide transition-all active:scale-95"
          style={{
            background: contactSaved
              ? "rgba(34,197,94,0.15)"
              : accent,
            color: contactSaved ? "#4ade80" : "#000",
            border: contactSaved ? "1px solid rgba(74,222,128,0.3)" : "none",
            boxShadow: contactSaved ? "none" : `0 8px 24px ${accent}50`,
          }}
        >
          {contactSaved ? "✓ Contact Saved!" : "Save Contact"}
        </button>

        {/* Save Image — secondary */}
        <button
          onClick={saveImage}
          disabled={imgSaving}
          className="w-full rounded-2xl py-3.5 text-sm font-medium tracking-wide transition-all active:scale-95"
          style={{
            background: theme.surface,
            border: "1px solid rgba(255,255,255,0.1)",
            color: theme.sub,
          }}
        >
          {imgSaving ? "Saving…" : "Download Card Image"}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 mb-8 flex flex-col items-center gap-1">
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
          Powered by{" "}
          <a href="/" className="hover:opacity-60 transition-opacity" style={{ color: "rgba(255,255,255,0.3)" }}>
            CardForge
          </a>
        </p>
      </div>
    </div>
  );
}
