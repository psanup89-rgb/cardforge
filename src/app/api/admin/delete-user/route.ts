import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Verify caller is the admin
  const serverClient = createServerClient();
  const { data: { session } } = await serverClient.auth.getSession();

  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // 1. Delete all logo files for this user from storage
  const { data: files } = await supabase.storage.from("logos").list(userId);
  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from("logos").remove(paths);
  }

  // 2. Delete the auth user — cascades to profiles → business_cards via FK
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
