"use client";

import Image from "next/image";
import type { CardDesignProps } from "./types";

export default function VibrantGradient({ card, scale = 1 }: CardDesignProps) {

  return (
    <div
      style={{
        width: 326,
        height: 206,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 100%)",
        borderRadius: 8,
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }}
      />

      {/* Logo */}
      {card.company_logo_url && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: 4,
          }}
        >
          <Image
            src={card.company_logo_url}
            alt={card.company_name || "Logo"}
            width={32}
            height={32}
            style={{ objectFit: "contain", borderRadius: 3 }}
          />
        </div>
      )}

      {/* Name & title */}
      <div style={{ position: "absolute", top: 20, left: 20, right: 60 }}>
        <p
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          {card.full_name}
        </p>
        {card.designation && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 10,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {card.designation}
          </p>
        )}
        {card.company_name && (
          <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
            {card.company_name}
          </p>
        )}
      </div>

      {/* Bottom contact strip */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.28)",
          padding: "8px 20px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
          {card.email && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>✉</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.92)" }}>{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>☎</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.92)" }}>{card.phone}</span>
            </div>
          )}
          {card.website && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>⬡</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.92)" }}>{card.website.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
          {card.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>◎</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.92)" }}>{card.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
