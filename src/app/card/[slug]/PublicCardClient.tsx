"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import CardWithQR from "@/components/card-designs/CardWithQR";
import type { BusinessCard } from "@/components/card-designs/types";

interface Props {
  card: BusinessCard;
  publicUrl: string;
}

const SOCIAL_META: Record<string, { label: string; icon: string; color: string }> = {
  linkedin:  { label: "LinkedIn",   icon: "in",  color: "#0A66C2" },
  twitter:   { label: "Twitter / X", icon: "𝕏",  color: "#000000" },
  github:    { label: "GitHub",     icon: "gh",  color: "#24292e" },
  instagram: { label: "Instagram",  icon: "ig",  color: "#E1306C" },
  youtube:   { label: "YouTube",    icon: "▶",   color: "#FF0000" },
};

export default function PublicCardClient({ card, publicUrl }: Props) {
  const cardRef = useRef<HTMLDivElement>(null!);
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);

  const socialLinks = card.social_links as Record<string, string> | undefined;
  const activeSocials = Object.entries(SOCIAL_META).filter(
    ([key]) => socialLinks?.[key]
  );

  async function handleDownloadImage() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${card.full_name.replace(/\s+/g, "_")}_card.png`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }

  function handleSaveContact() {
    window.location.href = `/api/cards/${card.id}/vcf`;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f13] px-4 py-12">

      {/* Name header */}
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
          Digital Business Card
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">{card.full_name}</h1>
        {(card.designation || card.company_name) && (
          <p className="mt-1 text-sm text-white/50">
            {[card.designation, card.company_name].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* ── Main showcase panel ── */}
      <div className="w-full max-w-[520px]">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #1c1c24 0%, #16161d 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          {/* Card with embedded QR (download target) */}
          <div className="p-6 pb-5">
            <div
              ref={cardRef}
              className="overflow-hidden rounded-xl"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            >
              <CardWithQR card={card} scale={1} qrUrl={publicUrl} qrSize={52} />
            </div>
          </div>

          {/* Social links (if any) */}
          {activeSocials.length > 0 && (
            <div className="px-6 pb-5 flex flex-wrap gap-2">
              {activeSocials.map(([key, meta]) => (
                <a
                  key={key}
                  href={socialLinks![key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{
                    background: `${meta.color}22`,
                    border: `1px solid ${meta.color}44`,
                    color: "#fff",
                  }}
                >
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: meta.color }}
                  >
                    {meta.icon}
                  </span>
                  {meta.label}
                </a>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="mx-6 h-px bg-white/[0.06]" />

          {/* Action buttons */}
          <div className="flex items-center gap-2 p-4">
            <ActionButton
              onClick={handleDownloadImage}
              disabled={downloading}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              }
              label={downloading ? "Saving…" : "Save Image"}
            />
            <ActionButton
              onClick={handleSaveContact}
              icon={
                saved ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                )
              }
              label={saved ? "Saved!" : "Save Contact"}
            />
            <ActionButton
              disabled
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              }
              label="Add to Wallet"
              badge="Soon"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <p className="mt-10 text-[11px] text-white/20">
        Powered by{" "}
        <a href="/" className="hover:text-white/40 transition-colors">
          CardForge
        </a>
      </p>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  badge,
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-center transition-colors disabled:opacity-40"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
      }}
    >
      <span className="text-white/70">{icon}</span>
      <span className="text-[11px] text-white/50 leading-tight">
        {label}
        {badge && (
          <span className="ml-1 rounded-sm bg-white/10 px-1 py-0.5 text-[9px] text-white/30">
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}
