# CardForge — Project Context for AI Agents

> Maintained by Claude. Last updated: 2026-03-15.
> Update this file when you learn something significant that would save a future agent time.

---

## What Is CardForge?

A full-stack web app for creating and sharing digital business cards. Owners create a card via a 4-step wizard, publish it, and share it via QR code at events. Clients scan the QR, land on a card page, and can save the contact or download the card as an image.

**Core user flow:**
1. Owner signs up → creates card (wizard: info → links → design → logo)
2. Owner publishes → gets 3 URLs + a "card is live" email
3. At event: owner shows Present Mode (full-screen QR) on their phone
4. Client scans → lands on `/card/[slug]/view` → taps "Save Contact"

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + Shadcn/ui |
| Auth + DB | Supabase (PostgreSQL + RLS) |
| File Storage | Supabase Storage (`logos` bucket) |
| Email | Resend + React Email |
| QR Code | `qrcode` npm package |
| Card Image Download | `html-to-image` |
| Contact Export | Server-side VCF endpoint |
| Forms | React Hook Form + Zod |

---

## Three-URL Architecture

Every published card has 3 distinct URLs:

| URL | Audience | Purpose |
|---|---|---|
| `/card/[slug]` | Owner | Management view (publish button, actions) |
| `/present/[slug]` | Owner at events | Full-screen dark page, large QR for clients to scan |
| `/card/[slug]/view` | Client (post-scan) | Immersive card, Save Contact, Download Image |

---

## Key Source Locations

```
src/
├── app/
│   ├── (auth)/login, signup
│   ├── (dashboard)/dashboard, cards/new, cards/[id], cards/[id]/preview
│   ├── card/[slug]/          ← owner management view
│   ├── card/[slug]/view/     ← ClientCardView.tsx (client-facing)
│   ├── present/[slug]/       ← PresentClient.tsx (present mode)
│   └── api/
│       ├── cards/route.ts              ← POST create
│       ├── cards/[id]/route.ts         ← GET/PUT/DELETE
│       ├── cards/[id]/publish/route.ts ← publish + email
│       ├── cards/[id]/vcf/route.ts     ← .vcf contact file (iOS)
│       └── upload/route.ts             ← logo upload
├── components/
│   ├── card-designs/         ← BlackElegance, VibrantGradient, CorporateClean, CardWithQR
│   ├── card-form/            ← CardFormWizard + Step1-4
│   └── ui/                   ← Shadcn/ui components
├── lib/
│   ├── generate-vcf.ts
│   ├── generate-slug.ts
│   ├── validations.ts        ← Zod schemas
│   └── supabase/client.ts, server.ts
└── emails/CardPublishedEmail.tsx
```

---

## Database Schema (Supabase)

### `profiles`
- `id` (uuid, PK → auth.users), `email`, `full_name`, `created_at`
- Auto-created by trigger on signup

### `business_cards`
- `id`, `user_id`, `slug` (unique), `status` (draft|published)
- `full_name`, `designation`, `company_name`, `company_logo_url`
- `email`, `phone`, `website`, `location`
- `social_links` (jsonb: linkedin, twitter, github, instagram, youtube)
- `template_id` (black-elegance | vibrant-gradient | corporate-clean)
- `accent_color`, `published_at`, `created_at`, `updated_at`

### RLS
- Authenticated users: full CRUD on their own cards
- Public: SELECT only on published cards — allows unauthenticated card views

---

## Card Design System

- Each design is a React component accepting `card` and `scale` props
- Base size: **326 × 206 px** (standard business card ratio)
- `CardWithQR` wraps any template and overlays a QR stamp (bottom-right)
- QR generated at 3× resolution for crisp rendering
- Templates: `black-elegance`, `vibrant-gradient`, `corporate-clean`
- `accent_color` on a card overrides the template's default accent

---

## Known Gotchas & Important Decisions

### iOS Contact Save
- "Save Contact" must link to `/api/cards/[id]/vcf` (a real server URL), NOT a client-side blob
- iOS Safari ignores the `download` attribute and won't trigger native Contacts from blob URLs
- Server must respond with `Content-Type: text/x-vcard`
- VCF must include `N:Last;First;;;` (structured name) — without it, iOS shows blank fields

### Wizard Form Submission Bug (fixed)
- The 4-step wizard uses a `<div>` wrapper, NOT a `<form>` element
- Using `<form>` caused the color picker in Step 3 to trigger implicit form submission via keyboard, skipping Step 4
- Explicit `type="button"` on Save button and no `<form>` wrapper prevents this

### SSR-safe Supabase Client
- Never call `createClient()` at module level or in `useState()` initializers in client components
- Both run during Next.js static pre-rendering and crash without env vars
- Only call inside async event handlers (login/signup functions)

### Service Role Client Must Use @supabase/supabase-js Directly
`createServiceClient()` uses `createClient` from `@supabase/supabase-js` with `{ auth: { autoRefreshToken: false, persistSession: false } }` — NOT `createServerClient` from `@supabase/ssr`. The SSR client always reads cookie-based user session, so even with a service role key it applies RLS as the logged-in user. Only the plain `createClient` with no session context truly bypasses RLS.

### Signup Email Redirect URL
- `signup/page.tsx` passes `emailRedirectTo` to `supabase.auth.signUp()`
- Uses `process.env.NEXT_PUBLIC_APP_URL ?? location.origin` — explicit env var takes priority over browser origin
- **Also required:** Update Supabase Dashboard → Authentication → URL Configuration → Site URL to the Vercel URL, and add the Vercel domain to Redirect URLs — otherwise Supabase's own email template may embed the Site URL (localhost) in the confirmation link

### Tailwind Config File Format
- Use `postcss.config.js` (CommonJS `module.exports`) and `tailwind.config.js`
- Do NOT use `.ts` or `.mjs` config extensions — no `"type": "module"` in `package.json`
- ESM config files cause PostCSS to silently skip Tailwind → completely unstyled output

### Base URL for Share Links
- Use request headers (`x-forwarded-host`, `host`) to determine the base URL server-side
- Avoids hardcoding `NEXT_PUBLIC_APP_URL` which can be wrong in preview deployments

### Mobile White Overscroll Flash
- Fixed with `overscroll-behavior: none` and background color on `html`/`body` for dark pages

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never expose client-side
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=             # e.g. https://your-domain.com
```

---

## Admin Panel

- Route: `/admin` — server-rendered, protected in middleware + layout
- Access: log in with the regular login page using the admin account, then navigate to `/admin`
- Auth check: `src/app/admin/layout.tsx` validates `session.user.email === process.env.ADMIN_EMAIL`
- Non-admin users are redirected to `/dashboard`; unauthenticated users to `/login`
- Data: uses `createServiceClient()` (service role key) to bypass RLS and query all `profiles` + `business_cards`
- Shows: total users, users with cards, total cards, published cards — plus a per-user table with card counts
- **Env var required:** `ADMIN_EMAIL` must be set in `.env.local` and Vercel environment variables
- User status uses `last_sign_in_at` (not `email_confirmed_at`) — Supabase auto-confirms or confirms on link click before redirect, so `email_confirmed_at` is unreliable as a "has the user actually accessed the app" signal
- Status: Active (`last_sign_in_at` set) / Pending login (confirmed, never logged in) / Unverified (`email_confirmed_at` null)
- Resend invite: `POST /api/admin/resend-invite` — generates magic link via `auth.admin.generateLink` + sends via Resend

---

## What's NOT Built Yet (Phase 2)

- Apple Wallet / Google Wallet passes
- Analytics (scan/view counts)
- Custom domains
- (Multiple cards per account IS supported already)

---

## Multi-Agent Workspace Notes

- Owner: Anup — works from personal and work laptops, plus multiple AI agents
- Single source of truth: this GitHub repo (`main` branch)
- Each AI tool maintains its own folder: `claude/`, `codex/`, etc.
- All agent folders are committed to git for cross-device sync
