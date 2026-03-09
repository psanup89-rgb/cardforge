import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { BusinessCard } from "@/components/card-designs/types";
import { generateVCF } from "@/lib/generate-vcf";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { data: card } = await getSupabase()
    .from("business_cards")
    .select("*")
    .or(`id.eq.${params.id},slug.eq.${params.id}`)
    .eq("status", "published")
    .single();

  if (!card) {
    return new NextResponse("Not found", { status: 404 });
  }

  const vcf = generateVCF(card as BusinessCard);
  const filename = `${card.full_name.replace(/\s+/g, "_")}.vcf`;

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/x-vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
