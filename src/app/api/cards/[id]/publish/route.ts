import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase/server";
import CardPublishedEmail from "@/emails/CardPublishedEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Params {
  params: { id: string };
}

export async function POST(_req: Request, { params }: Params) {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: card, error: fetchError } = await supabase
    .from("business_cards")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single();

  if (fetchError || !card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("business_cards")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // presentUrl = what user shows at events (QR screen)
  // publicUrl = what clients see after scanning (shared in email)
  const presentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/present/${card.slug}`;
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/card/${card.slug}/view`;

  // Send email notification
  try {
    await resend.emails.send({
      from: "CardForge <ps.anup.89@gmail.com>",
      to: session.user.email!,
      subject: "Your digital business card is live!",
      react: CardPublishedEmail({
        recipientName: card.full_name,
        cardHolderName: card.full_name,
        presentUrl,
        publicUrl,
      }),
    });
  } catch (emailError) {
    // Don't fail publish if email fails
    console.error("Email send failed:", emailError);
  }

  return NextResponse.json({ publicUrl, presentUrl });
}
