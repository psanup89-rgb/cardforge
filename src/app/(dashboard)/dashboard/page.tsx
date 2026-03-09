import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTemplate } from "@/components/card-designs";
import type { BusinessCard } from "@/components/card-designs/types";
import DeleteCardButton from "./DeleteCardButton";

export default async function DashboardPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: cards } = await supabase
    .from("business_cards")
    .select("*")
    .eq("user_id", session!.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Cards</h1>
          <p className="text-sm text-muted-foreground">
            {cards?.length ?? 0} card{cards?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/cards/new">+ New Card</Link>
        </Button>
      </div>

      {!cards?.length ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20">
          <p className="text-muted-foreground">No cards yet</p>
          <Button asChild>
            <Link href="/cards/new">Create your first card</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const template = getTemplate(card.template_id);
            const Component = template.component;

            return (
              <div key={card.id} className="group rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                {/* Thumbnail */}
                <div
                  className="mb-3 overflow-hidden rounded-lg"
                  style={{ width: 326 * 0.56, height: 206 * 0.56 }}
                >
                  <Component card={card as BusinessCard} scale={0.56} />
                </div>

                {/* Card info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{card.full_name}</p>
                    <Badge variant={card.status === "published" ? "default" : "secondary"}>
                      {card.status}
                    </Badge>
                  </div>
                  {card.designation && (
                    <p className="text-xs text-muted-foreground">{card.designation}</p>
                  )}
                  {card.company_name && (
                    <p className="text-xs text-muted-foreground">{card.company_name}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/cards/${card.id}`}>Edit</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/cards/${card.id}/preview`}>Preview</Link>
                    </Button>
                  </div>
                  {card.status === "published" && (
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/present/${card.slug}`} target="_blank">
                          Share QR
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/card/${card.slug}/view`} target="_blank">
                          Client Preview ↗
                        </Link>
                      </Button>
                    </div>
                  )}
                  <div>
                    <DeleteCardButton cardId={card.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
