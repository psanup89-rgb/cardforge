import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import type { BusinessCard } from "@/components/card-designs/types";
import { Button } from "@/components/ui/button";
import PublishButton from "./PublishButton";
import ClientCardView from "@/app/card/[slug]/view/ClientCardView";

interface Props {
  params: { id: string };
}

export default async function PreviewPage({ params }: Props) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: card } = await supabase
    .from("business_cards")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single();

  if (!card) notFound();

  const clientUrl = `${process.env.NEXT_PUBLIC_APP_URL}/card/${card.slug}/view`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Preview</h1>
          <p className="text-sm text-muted-foreground">{card.full_name}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/cards/${card.id}`}>Edit</Link>
          </Button>
          {card.status === "published" ? (
            <Button asChild variant="outline">
              <Link href={`/present/${card.slug}`} target="_blank">
                Share QR ↗
              </Link>
            </Button>
          ) : (
            <PublishButton cardId={card.id} />
          )}
        </div>
      </div>

      {/* Client preview — exactly what the client sees */}
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div className="overflow-y-auto" style={{ maxHeight: "80vh" }}>
          <ClientCardView card={card as BusinessCard} clientUrl={clientUrl} />
        </div>
      </div>
    </div>
  );
}
