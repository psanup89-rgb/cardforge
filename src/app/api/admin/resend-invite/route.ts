import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  // Verify caller is the admin
  const serverClient = createServerClient();
  const { data: { session } } = await serverClient.auth.getSession();

  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabaseAdmin = createServiceClient();

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${appUrl}/api/auth/callback` },
  });

  if (error || !data?.properties?.action_link) {
    return NextResponse.json({ error: error?.message ?? "Failed to generate link" }, { status: 500 });
  }

  const { error: emailError } = await resend.emails.send({
    from: "CardForge <ps.anup.89@gmail.com>",
    to: email,
    subject: "Your CardForge login link",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="font-size: 20px; color: #111827; margin-bottom: 8px;">Sign in to CardForge</h2>
        <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
          Click the button below to sign in. This link expires in 24 hours and can only be used once.
        </p>
        <a href="${data.properties.action_link}" style="display: inline-block; background: #111827; color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px;">
          Sign in to CardForge →
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (emailError) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
