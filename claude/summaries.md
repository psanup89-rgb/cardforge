# Session Summaries
<!-- Newest entries first — format: ## YYYY-MM-DD HH:MM — Title -->

---

## 2026-03-15 01:43 — Timestamp Fix for Summaries + Ask-Before-Write Rule

- Skill updated to always run `date '+%Y-%m-%d %H:%M'` via Bash before writing — never guess or use context date
- Corrected all existing summary timestamps using actual file modification times
- Ask-before-write rule added: draft → show → confirm → write

---

## 2026-03-15 01:40 — Admin: No Self-Delete for Logged-in Admin

- `src/app/admin/page.tsx` — fetches current session user ID via `createServerClient()`, hides `DeleteButton` for that row

---

## 2026-03-15 01:38 — Admin: Delete User

- New API route: `src/app/api/admin/delete-user/route.ts`
- New client component: `src/app/admin/DeleteButton.tsx` — inline confirm/cancel before deleting
- Delete flow: (1) remove all files from `logos/{userId}/` in Storage, (2) `auth.admin.deleteUser(userId)` which cascades → `profiles` → `business_cards`
- On success: `router.refresh()` removes the row without a full page reload

---

## 2026-03-15 01:34 — Admin: Correct Verification Status + Resend Invite

**Problem:** Both users showed as "Verified" even though Ashwin had never logged in.

**Root cause:** `email_confirmed_at` alone is unreliable — Supabase auto-confirms on signup or on link click before redirect, so it gets set without the user ever reaching the app.

**Fix:** Status now uses `last_sign_in_at` as the definitive signal:
- **Active** (green) — `last_sign_in_at` set
- **Pending login** (orange) — confirmed but `last_sign_in_at` null
- **Unverified** (red) — `email_confirmed_at` null

**Resend invite:**
- New API route: `src/app/api/admin/resend-invite/route.ts`
- New client component: `src/app/admin/ResendButton.tsx`
- Generates magic link via `supabase.auth.admin.generateLink({ type: 'magiclink' })` + sends via Resend

---

## 2026-03-15 01:29 — Fix: Admin Panel Showing Only 1 User (RLS Bypass Bug)

**Root cause:** `createServiceClient()` was using `createServerClient` from `@supabase/ssr`, which reads the cookie-based user session. Even with the service role key, RLS was applied as the logged-in user — so `profiles` query returned only that user's own row.

**Fix:** `src/lib/supabase/server.ts` — `createServiceClient()` now uses `createClient` from `@supabase/supabase-js` with `{ auth: { autoRefreshToken: false, persistSession: false } }`.

**Gotcha:** Never use `@supabase/ssr`'s `createServerClient` for admin/service-role operations.

---

## 2026-03-15 01:10 — Summaries Format Fix + write-summary Skill

- Fixed `claude/summaries.md` to be a single file (not per-session files), newest entries first
- Created `write-summary` skill in three locations:
  - `~/.claude/skills/write-summary/SKILL.md` — active Claude skill
  - `claude/skills/write-summary.md` — project reference copy
  - `/Users/anup/AI Workspace/support/skills/write-summary.md` — shared workspace copy

---

## 2026-03-15 01:04 — Admin Panel + Signup Email Fix

### 1. Admin Panel — `/admin`

**New files:**
- `src/app/admin/layout.tsx` — auth check + admin email guard; amber "Admin" nav button shown when logged-in user matches `ADMIN_EMAIL`
- `src/app/admin/page.tsx` — users table + summary stats

**Modified:**
- `src/middleware.ts` — added `/admin` to protected routes

**Required setup:**
- Add `ADMIN_EMAIL=your@email.com` to `.env.local` and Vercel environment variables

### 2. Signup Email Redirect URL Fix

**Modified:** `src/app/(auth)/signup/page.tsx`

**Change:** `emailRedirectTo` now uses `process.env.NEXT_PUBLIC_APP_URL ?? location.origin`

**Also required in Supabase Dashboard:**
- Authentication → URL Configuration → Site URL → Vercel URL
- Authentication → URL Configuration → Redirect URLs → add `https://your-domain/**`

---

## 2026-03-15 00:54 — Workspace Setup

- Created `claude/` folder convention for multi-agent git-synced learnings
- Created `claude/README.md`, `claude/project-context.md`, `claude/summaries.md`
- Saved common prompt to `/Users/anup/AI Workspace/support/prompts/multi-agent-workspace-setup.md`
