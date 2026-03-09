"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface Props {
  url: string;
  size?: number;
}

export default function QRCodeDisplay({ url, size = 180 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [url, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-lg" />
      <p className="text-xs text-muted-foreground">Scan to open this card</p>
    </div>
  );
}
