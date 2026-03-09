import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import CardFormWizard from "@/components/card-form/CardFormWizard";

interface Props {
  params: { id: string };
}

export default async function EditCardPage({ params }: Props) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Card</h1>
        <p className="text-sm text-muted-foreground">{card.full_name}</p>
      </div>
      <CardFormWizard
        mode="edit"
        cardId={card.id}
        initialData={{
          full_name: card.full_name,
          designation: card.designation ?? "",
          company_name: card.company_name ?? "",
          company_logo_url: card.company_logo_url ?? "",
          email: card.email ?? "",
          phone: card.phone ?? "",
          website: card.website ?? "",
          location: card.location ?? "",
          social_links: card.social_links ?? {},
          template_id: card.template_id,
          accent_color: card.accent_color ?? "",
        }}
      />
    </div>
  );
}
