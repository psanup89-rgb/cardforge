"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { getTemplate } from "./index";
import type { BusinessCard } from "./types";

interface Props {
  card: BusinessCard;
  scale?: number;
  qrUrl: string;
  /** QR pixel size at scale=1. Defaults to 54. */
  qrSize?: number;
}

export default function CardWithQR({ card, scale = 1, qrUrl, qrSize = 54 }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(qrUrl, {
      width: qrSize * 3, // 3× for crisp rendering
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [qrUrl, qrSize]);

  const template = getTemplate(card.template_id);
  const Component = template.component;

  const scaledQR = qrSize * scale;
  const pad = 3 * scale;
  const radius = 5 * scale;
  const offset = 9 * scale;

  return (
    <div style={{ position: "relative", width: 326 * scale, height: 206 * scale }}>
      <Component card={card} scale={scale} />

      {/* QR stamp — bottom-right corner */}
      {qrDataUrl && (
        <div
          style={{
            position: "absolute",
            bottom: offset,
            right: offset,
            background: "#ffffff",
            padding: pad,
            borderRadius: radius,
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
            lineHeight: 0,
          }}
        >
          <img
            src={qrDataUrl}
            width={scaledQR}
            height={scaledQR}
            alt="QR"
            style={{ display: "block", borderRadius: radius - pad }}
          />
        </div>
      )}
    </div>
  );
}
