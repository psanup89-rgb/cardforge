"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CardFormData } from "@/lib/validations";

interface Props {
  form: UseFormReturn<CardFormData>;
}

const socialFields = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/username" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
] as const;

export default function Step2Links({ form }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Social Links</h2>
      <p className="text-sm text-muted-foreground">
        Add your social profiles. All fields are optional.
      </p>

      {socialFields.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={`social_links.${key}`}>{label}</Label>
          <Input
            id={`social_links.${key}`}
            placeholder={placeholder}
            {...register(`social_links.${key}` as `social_links.${typeof key}`)}
          />
          {errors.social_links?.[key] && (
            <p className="text-sm text-destructive">
              {errors.social_links[key]?.message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
