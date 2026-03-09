import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { cardSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/generate-slug";

export async function POST(request: Request) {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = cardSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Generate unique slug
  let slug = generateSlug(data.full_name);
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from("business_cards")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = generateSlug(data.full_name);
    attempts++;
  }

  const { data: card, error } = await supabase
    .from("business_cards")
    .insert({
      user_id: session.user.id,
      slug,
      status: "draft",
      full_name: data.full_name,
      designation: data.designation || null,
      company_name: data.company_name || null,
      company_logo_url: data.company_logo_url || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      location: data.location || null,
      social_links: data.social_links || {},
      template_id: data.template_id,
      accent_color: data.accent_color || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(card, { status: 201 });
}

export async function GET() {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("business_cards")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
