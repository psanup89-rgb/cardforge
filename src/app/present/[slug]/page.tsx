import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { BusinessCard } from "@/components/card-designs/types";
import PresentClient from "./PresentClient";

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

export default async function PresentPage({ params }: Props) {
  const { data: card } = await getSupabase()
    .from("business_cards")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!card) notFound();

  const clientUrl = `${getBaseUrl()}/card/${card.slug}/view`;

  return <PresentClient card={card as BusinessCard} clientUrl={clientUrl} />;
}
