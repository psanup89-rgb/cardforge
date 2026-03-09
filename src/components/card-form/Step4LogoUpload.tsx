"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { CardFormData } from "@/lib/validations";

interface Props {
  form: UseFormReturn<CardFormData>;
  cardId?: string;
}

export default function Step4LogoUpload({ form, cardId }: Props) {
  const { setValue, watch } = form;
  const logoUrl = watch("company_logo_url");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (cardId) formData.append("cardId", cardId);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");
      setValue("company_logo_url", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeLogo() {
    setValue("company_logo_url", "");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Company Logo</h2>
      <p className="text-sm text-muted-foreground">
        Upload your company logo (optional). PNG or SVG with transparent background works best.
        Max 5 MB.
      </p>

      {logoUrl ? (
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-lg border bg-muted">
            <Image
              src={logoUrl}
              alt="Company logo"
              fill
              className="rounded-lg object-contain p-2"
            />
          </div>
          <Button variant="outline" size="sm" onClick={removeLogo} type="button">
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 py-10">
          <p className="text-sm text-muted-foreground">
            {uploading ? "Uploading…" : "PNG, JPG, SVG up to 5 MB"}
          </p>
          <label htmlFor="logo-upload">
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <span className="cursor-pointer">
                {uploading ? "Uploading…" : "Choose File"}
              </span>
            </Button>
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
