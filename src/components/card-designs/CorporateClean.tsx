"use client";

import Image from "next/image";
import type { CardDesignProps } from "./types";

export default function CorporateClean({ card, scale = 1 }: CardDesignProps) {
  const accent = card.accent_color || "#2563EB";

  return (
    <div
      style={{
        width: 326,
        height: 206,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        background: "#ffffff",
        borderRadius: 8,
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        border: "1px solid #e5e7eb",
        boxSizing: "border-box",
      }}
    >
      {/* Left color bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 6,
          height: "100%",
          background: accent,
        }}
      />

      {/* Logo */}
      {card.company_logo_url && (
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <Image
            src={card.company_logo_url}
            alt={card.company_name || "Logo"}
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}

      {/* Name block */}
      <div style={{ position: "absolute", top: 18, left: 24, right: 66 }}>
        <p
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1.2,
          }}
        >
          {card.full_name}
        </p>
        {card.designation && (
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 10,
              color: accent,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {card.designation}
          </p>
        )}
        {card.company_name && (
          <p style={{ margin: "2px 0 0", fontSize: 10, color: "#6b7280" }}>
            {card.company_name}
          </p>
        )}
      </div>

      {/* Horizontal rule */}
      <div
        style={{
          position: "absolute",
          top: 92,
          left: 24,
          right: 24,
          height: 1,
          background: "#e5e7eb",
        }}
      />

      {/* Contact info */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {card.email && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 10, width: 12, textAlign: "center" }}>✉</span>
            <span style={{ fontSize: 10, color: "#374151" }}>{card.email}</span>
          </div>
        )}
        {card.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 10, width: 12, textAlign: "center" }}>☎</span>
            <span style={{ fontSize: 10, color: "#374151" }}>{card.phone}</span>
          </div>
        )}
        {card.website && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 10, width: 12, textAlign: "center" }}>⬡</span>
            <span style={{ fontSize: 10, color: "#374151" }}>{card.website.replace(/^https?:\/\//, "")}</span>
          </div>
        )}
        {card.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 10, width: 12, textAlign: "center" }}>◎</span>
            <span style={{ fontSize: 10, color: "#374151" }}>{card.location}</span>
          </div>
        )}
      </div>

    </div>
  );
}
