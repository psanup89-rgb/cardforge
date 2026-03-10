import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { BusinessCard } from "@/components/card-designs/types";
import ClientCardView from "./ClientCardView";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getBaseUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
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
  return {
    title: `${card.full_name} — Digital Card`,
    description: [card.designation, card.company_name].filter(Boolean).join(" at "),
  };
}

export default async function ClientCardPage({ params }: Props) {
  const { data: card } = await getSupabase()
    .from("business_cards")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!card) notFound();

  const clientUrl = `${getBaseUrl()}/card/${card.slug}/view`;

  return <ClientCardView card={card as BusinessCard} clientUrl={clientUrl} />;
}
