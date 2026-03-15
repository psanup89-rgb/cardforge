"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    const supabase = createClient();

    async function handleAuth() {
      // 1. Handle ?code= (PKCE flow — signup confirmation from same browser)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace("/dashboard");
          return;
        }
        setStatus("Session expired. Redirecting to login…");
        setTimeout(() => router.replace("/login"), 1500);
        return;
      }

      // 2. Handle #access_token= (implicit flow — magic links, admin invites)
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            // Magic link logins → prompt to set a password
            if (type === "magiclink") {
              router.replace("/set-password");
            } else {
              router.replace("/dashboard");
            }
            return;
          }
        }
        setStatus("Session expired. Redirecting to login…");
        setTimeout(() => router.replace("/login"), 1500);
        return;
      }

      // 3. Nothing to process — redirect to login
      router.replace("/login");
    }

    handleAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">{status}</p>
    </div>
  );
}
