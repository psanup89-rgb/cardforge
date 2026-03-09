"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cardSchema, type CardFormData } from "@/lib/validations";
import { getTemplate } from "@/components/card-designs";
import type { BusinessCard } from "@/components/card-designs/types";
import Step1BasicInfo from "./Step1BasicInfo";
import Step2Links from "./Step2Links";
import Step3Design from "./Step3Design";
import Step4LogoUpload from "./Step4LogoUpload";

const STEPS = ["Basic Info", "Social Links", "Design", "Logo"];
const LAST_STEP = STEPS.length - 1;

interface Props {
  initialData?: Partial<CardFormData>;
  cardId?: string;
  mode: "create" | "edit";
}

export default function CardFormWizard({ initialData, cardId, mode }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      full_name: "",
      designation: "",
      company_name: "",
      company_logo_url: "",
      email: "",
      phone: "",
      website: "",
      location: "",
      social_links: {
        linkedin: "",
        twitter: "",
        github: "",
        instagram: "",
        youtube: "",
      },
      template_id: "black-elegance",
      accent_color: "",
      ...initialData,
    },
    mode: "onChange",
  });

  const formValues = form.watch();

  const previewCard: BusinessCard = {
    full_name: formValues.full_name || "Your Name",
    designation: formValues.designation,
    company_name: formValues.company_name,
    company_logo_url: formValues.company_logo_url,
    email: formValues.email,
    phone: formValues.phone,
    website: formValues.website,
    location: formValues.location,
    social_links: formValues.social_links as Record<string, string>,
    template_id: formValues.template_id || "black-elegance",
    accent_color: formValues.accent_color,
  };

  const Template = getTemplate(previewCard.template_id).component;

  async function saveCard() {
    // Only ever called explicitly from the Save button on the last step
    const valid = await form.trigger();
    if (!valid) return;

    const data = form.getValues();
    setSaving(true);
    setError(null);

    try {
      const url = mode === "create" ? "/api/cards" : `/api/cards/${cardId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Save failed");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    if (step === 0) {
      const valid = await form.trigger(["full_name", "email", "website"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, LAST_STEP));
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Form panel */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-6 ${i < step ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {STEPS[step]}
          </span>
        </div>

        {/* No <form> submit — navigation is fully manual */}
        <div>
          {step === 0 && <Step1BasicInfo form={form} />}
          {step === 1 && <Step2Links form={form} />}
          {step === 2 && <Step3Design form={form} />}
          {step === 3 && <Step4LogoUpload form={form} cardId={cardId} />}

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              Back
            </Button>

            {step < LAST_STEP ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={saveCard} disabled={saving}>
                {saving ? "Saving…" : mode === "create" ? "Save Card" : "Update Card"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Live preview panel */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">Live Preview</h3>
        <div
          className="overflow-hidden rounded-xl shadow-2xl"
          style={{ width: 326, height: 206 }}
        >
          <Template card={previewCard} scale={1} />
        </div>
        <p className="text-xs text-muted-foreground">
          Standard business card size (3.5 × 2 in)
        </p>
      </div>
    </div>
  );
}
