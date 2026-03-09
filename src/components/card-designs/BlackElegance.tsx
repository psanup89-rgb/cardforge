"use client";

import Image from "next/image";
import type { CardDesignProps } from "./types";

export default function BlackElegance({ card, scale = 1 }: CardDesignProps) {
  const accent = card.accent_color || "#D4AF37";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 326,
        height: 206,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        background: "#0a0a0a",
        borderRadius: 8,
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Gold accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 3,
          background: accent,
        }}
      />
      {/* Subtle gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 120,
          height: "100%",
          background: `linear-gradient(135deg, transparent 60%, ${accent}15)`,
        }}
      />

      {/* Logo */}
      {card.company_logo_url && (
        <div style={{ position: "absolute", top: 14, right: 14 }}>
          <Image
            src={card.company_logo_url}
            alt={card.company_name || "Logo"}
            width={36}
            height={36}
            style={{ objectFit: "contain", borderRadius: 4 }}
          />
        </div>
      )}

      {/* Name / title / company */}
      <div style={{ position: "absolute", top: 18, left: 20, right: 60 }}>
        <p
          style={{
            margin: 0,
            fontSize: 19,
            fontWeight: "bold",
            color: "#ffffff",
            letterSpacing: "0.02em",
            lineHeight: 1.2,
          }}
        >
          {card.full_name}
        </p>
        {card.designation && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 10,
              color: accent,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {card.designation}
          </p>
        )}
        {card.company_name && (
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 10,
              color: "#888",
              letterSpacing: "0.04em",
            }}
          >
            {card.company_name}
          </p>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          top: 88,
          left: 20,
          right: 20,
          height: 1,
          background: `linear-gradient(to right, ${accent}80, transparent)`,
        }}
      />

      {/* Contact info */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {card.email && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 10, width: 12, textAlign: "center" }}>✉</span>
            <span style={{ fontSize: 10, color: "#bbb" }}>{card.email}</span>
          </div>
        )}
        {card.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 10, width: 12, textAlign: "center" }}>☎</span>
            <span style={{ fontSize: 10, color: "#bbb" }}>{card.phone}</span>
          </div>
        )}
        {card.website && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 10, width: 12, textAlign: "center" }}>⬡</span>
            <span style={{ fontSize: 10, color: "#bbb" }}>{card.website.replace(/^https?:\/\//, "")}</span>
          </div>
        )}
        {card.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 10, width: 12, textAlign: "center" }}>◎</span>
            <span style={{ fontSize: 10, color: "#bbb" }}>{card.location}</span>
          </div>
        )}
      </div>

    </div>
  );
}
