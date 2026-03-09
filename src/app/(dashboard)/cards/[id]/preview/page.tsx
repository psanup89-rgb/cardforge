import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getTemplate } from "@/components/card-designs";
import type { BusinessCard } from "@/components/card-designs/types";
import { Button } from "@/components/ui/button";
import PublishButton from "./PublishButton";

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

  const template = getTemplate(card.template_id);
  const Component = template.component;

  return (
    <div className="space-y-8">
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
              <Link href={`/card/${card.slug}`} target="_blank">
                View public card ↗
              </Link>
            </Button>
          ) : (
            <PublishButton cardId={card.id} />
          )}
        </div>
      </div>

      {/* Full-size card preview */}
      <div className="flex justify-center">
        <div className="overflow-hidden rounded-2xl shadow-2xl">
          <Component card={card as BusinessCard} scale={1.5} />
        </div>
      </div>

      {/* Details summary */}
      <div className="mx-auto max-w-lg rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Card Details</h2>
        <dl className="space-y-2 text-sm">
          {[
            ["Name", card.full_name],
            ["Title", card.designation],
            ["Company", card.company_name],
            ["Email", card.email],
            ["Phone", card.phone],
            ["Website", card.website],
            ["Location", card.location],
            ["Design", template.name],
            ["Status", card.status],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-muted-foreground">
                  {label}
                </dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}
