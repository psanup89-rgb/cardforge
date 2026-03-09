import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { getTemplate } from "@/components/card-designs";
import type { BusinessCard } from "@/components/card-designs/types";
import PublicCardClient from "./PublicCardClient";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: card } = await getSupabase()
    .from("business_cards")
    .select("full_name, designation, company_name")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!card) return { title: "Card not found" };

  const title = [card.full_name, card.designation, card.company_name]
    .filter(Boolean)
    .join(" — ");

  return {
    title,
    description: `Digital business card for ${card.full_name}`,
    openGraph: { title, type: "profile" },
  };
}

export default async function PublicCardPage({ params }: Props) {
  const { data: card } = await getSupabase()
    .from("business_cards")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!card) notFound();

  // QR points to /view — the client-facing landing page
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/card/${card.slug}/view`;
  const template = getTemplate(card.template_id);

  return (
    <PublicCardClient
      card={card as BusinessCard}
      publicUrl={publicUrl}
      templateName={template.name}
    />
  );
}
