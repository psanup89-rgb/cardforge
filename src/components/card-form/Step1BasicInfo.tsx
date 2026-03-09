"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CardFormData } from "@/lib/validations";

interface Props {
  form: UseFormReturn<CardFormData>;
}

export default function Step1BasicInfo({ form }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Basic Information</h2>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          placeholder="Jane Smith"
          {...register("full_name")}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="designation">Designation / Title</Label>
        <Input
          id="designation"
          placeholder="Senior Product Designer"
          {...register("designation")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          placeholder="Acme Corporation"
          {...register("company_name")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="jane@acme.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          {...register("phone")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          placeholder="https://jane.design"
          {...register("website")}
        />
        {errors.website && (
          <p className="text-sm text-destructive">{errors.website.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="San Francisco, CA"
          {...register("location")}
        />
      </div>
    </div>
  );
}
