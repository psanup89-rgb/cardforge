"use client";

import { UseFormReturn } from "react-hook-form";
import { templates } from "@/components/card-designs";
import { cn } from "@/lib/utils";
import type { CardFormData } from "@/lib/validations";
import type { BusinessCard } from "@/components/card-designs/types";

interface Props {
  form: UseFormReturn<CardFormData>;
}

export default function Step3Design({ form }: Props) {
  const { watch, setValue } = form;
  const selectedTemplate = watch("template_id");
  const formValues = watch();

  const previewCard: BusinessCard = {
    full_name: formValues.full_name || "Jane Smith",
    designation: formValues.designation || "Product Designer",
    company_name: formValues.company_name || "Acme Corp",
    email: formValues.email || "jane@example.com",
    phone: formValues.phone,
    website: formValues.website,
    location: formValues.location,
    company_logo_url: formValues.company_logo_url,
    social_links: formValues.social_links as Record<string, string>,
    template_id: selectedTemplate,
    accent_color: formValues.accent_color,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Choose a Design</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {templates.map((tpl) => {
          const Component = tpl.component;
          const isSelected = selectedTemplate === tpl.id;

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setValue("template_id", tpl.id)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border-2 p-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              {/* Thumbnail: card at scale 0.4 inside a fixed container */}
              <div
                className="overflow-hidden rounded"
                style={{ width: 326 * 0.4, height: 206 * 0.4 }}
              >
                <Component card={previewCard} scale={0.4} />
              </div>
              <div>
                <p className="text-sm font-medium">{tpl.name}</p>
                <p className="text-xs text-muted-foreground">{tpl.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Accent color (only relevant for Black Elegance and Corporate Clean) */}
      {(selectedTemplate === "black-elegance" ||
        selectedTemplate === "corporate-clean") && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              defaultValue={
                selectedTemplate === "black-elegance" ? "#D4AF37" : "#2563EB"
              }
              onChange={(e) => setValue("accent_color", e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-input"
            />
            <span className="text-sm text-muted-foreground">
              {selectedTemplate === "black-elegance"
                ? "Gold works well for dark cards"
                : "Choose a brand color"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
