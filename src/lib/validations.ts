import { z } from "zod";

export const cardSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  designation: z.string().max(100).optional().or(z.literal("")),
  company_name: z.string().max(100).optional().or(z.literal("")),
  company_logo_url: z.string().url().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  social_links: z
    .object({
      linkedin: z.string().url().optional().or(z.literal("")),
      twitter: z.string().url().optional().or(z.literal("")),
      github: z.string().url().optional().or(z.literal("")),
      instagram: z.string().url().optional().or(z.literal("")),
      youtube: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  template_id: z.string().min(1),
  accent_color: z.string().optional(),
});

export type CardFormData = z.infer<typeof cardSchema>;
