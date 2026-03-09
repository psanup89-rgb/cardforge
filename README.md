# CardForge — Digital Business Card Platform

A full-stack web app that lets professionals create beautiful digital business cards, share them via QR code, and let clients save their contact in one tap.

---

## What It Does

1. **Owner logs in** → creates a card through a 4-step wizard (info → links → design → logo)
2. **Owner publishes** → gets two URLs: a present-mode link and a client-facing link
3. **At events** → owner opens Present Mode on their phone and shows the QR code
4. **Client scans QR** → lands on an immersive card page, taps "Save Contact" → iOS/Android opens native Contacts app instantly
5. **Client can also** download the card as a PNG image

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + Shadcn/ui |
| Auth + Database | Supabase (PostgreSQL + RLS) |
| File Storage | Supabase Storage |
| Email | Resend + React Email |
| QR Code | `qrcode` |
| Card Image Download | `html-to-image` |
| Contact Export | Server-side VCF endpoint (iOS-compatible) |
| Forms | React Hook Form + Zod |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Email/password login
│   │   └── signup/page.tsx              # Registration
│   ├── (dashboard)/
│   │   ├── layout.tsx                   # Auth-protected shell
│   │   ├── dashboard/page.tsx           # Card grid + manage cards
│   │   └── cards/
│   │       ├── new/page.tsx             # Create card wizard
│   │       └── [id]/
│   │           ├── page.tsx             # Edit card
│   │           └── preview/page.tsx     # Full preview + Publish button
│   ├── card/[slug]/
│   │   ├── page.tsx                     # Owner's management view
│   │   ├── PublicCardClient.tsx
│   │   └── view/
│   │       ├── page.tsx                 # Client-facing card page (after QR scan)
│   │       └── ClientCardView.tsx
│   ├── present/[slug]/
│   │   ├── page.tsx                     # Present Mode page
│   │   └── PresentClient.tsx
│   └── api/
│       ├── auth/callback/route.ts       # Supabase OAuth callback
│       ├── cards/route.ts               # POST create card
│       ├── cards/[id]/route.ts          # GET / PUT / DELETE
│       ├── cards/[id]/publish/route.ts  # Publish card + send email
│       ├── cards/[id]/vcf/route.ts      # Serve .vcf contact file (iOS-safe)
│       └── upload/route.ts              # Logo upload to Supabase Storage
├── components/
│   ├── card-designs/
│   │   ├── types.ts                     # BusinessCard + DesignTemplate interfaces
│   │   ├── index.ts                     # Template registry (id → component)
│   │   ├── BlackElegance.tsx            # Dark + gold design
│   │   ├── VibrantGradient.tsx          # Purple-to-pink gradient design
│   │   ├── CorporateClean.tsx           # Minimal white design
│   │   └── CardWithQR.tsx               # Wraps any card with a QR stamp overlay
│   ├── card-form/
│   │   ├── CardFormWizard.tsx           # 4-step wizard shell
│   │   ├── Step1BasicInfo.tsx           # Name, email, phone, website, location
│   │   ├── Step2Links.tsx               # LinkedIn, Twitter, GitHub, Instagram, YouTube
│   │   ├── Step3Design.tsx              # Template picker with live scaled previews
│   │   └── Step4LogoUpload.tsx          # Company logo upload
│   └── ui/                              # Shadcn/ui components (button, input, etc.)
├── lib/
│   ├── generate-vcf.ts                  # VCF file generator (vCard 3.0, iOS-compatible)
│   ├── generate-slug.ts                 # name → "john-doe-x7k2" URL slug
│   ├── validations.ts                   # Zod schemas
│   └── supabase/
│       ├── client.ts                    # Browser Supabase client
│       └── server.ts                    # Server Supabase client (@supabase/ssr)
├── emails/
│   └── CardPublishedEmail.tsx           # "Your card is live!" email template
└── middleware.ts                        # Auth protection for dashboard routes
```

---

## Three-URL Architecture

Each published card has three distinct URLs, each serving a different purpose:

| URL | Who Uses It | Purpose |
|---|---|---|
| `/card/[slug]` | Owner | Management view with publish button and actions |
| `/present/[slug]` | Owner (at events) | Full-screen dark page with card + large QR for clients to scan |
| `/card/[slug]/view` | Client (after scanning) | Immersive card page with Save Contact, Download Image |

---

## Card Design System

Each design is a React component accepting a `scale` prop. Base size is always **326 × 206 px** (standard business card ratio).

```tsx
<BlackElegance card={card} scale={1} />      // full size
<BlackElegance card={card} scale={0.4} />    // thumbnail for design picker
```

`CardWithQR` wraps any design and overlays a QR stamp at the bottom-right corner — used across Present Mode, owner view, and client view so the downloadable PNG always includes the QR.

**Available templates:**
- **Black Elegance** — `black-elegance` — dark black background, gold accent bar + gold text
- **Vibrant Gradient** — `vibrant-gradient` — purple-to-pink gradient, contact strip at bottom
- **Corporate Clean** — `corporate-clean` — white card, coloured left bar, professional

Custom `accent_color` can be set per card to override the template's default accent.

---

## Database Schema (Supabase)

### `profiles`
```sql
id          uuid  PK → auth.users(id)
email       text
full_name   text
created_at  timestamptz
```
Auto-created via trigger on new user signup.

### `business_cards`
```sql
id                uuid  PK
user_id           uuid  → profiles(id)
slug              text  UNIQUE           -- URL identifier e.g. "john-doe-x7k2"
status            text                   -- 'draft' | 'published'
full_name         text
designation       text
company_name      text
company_logo_url  text                   -- Supabase Storage public URL
email             text
phone             text
website           text
location          text
social_links      jsonb                  -- { linkedin, twitter, github, instagram, youtube }
template_id       text                   -- 'black-elegance' | 'vibrant-gradient' | 'corporate-clean'
accent_color      text
published_at      timestamptz
created_at        timestamptz
updated_at        timestamptz
```

### RLS Policies
- Authenticated users: full CRUD on their own cards (`auth.uid() = user_id`)
- Public: SELECT on published cards only (`status = 'published'`) — enables public card pages without auth
- Storage bucket `logos`: users can only upload to their own folder (`logos/{user_id}/...`)

---

## Key Implementation Notes

### iOS Contact Save
The "Save Contact" button navigates to `/api/cards/[id]/vcf` (a server endpoint) rather than using a client-side Blob download. This is required because iOS Safari ignores the `download` attribute and does not trigger the native Contacts app from blob URLs. Serving `Content-Type: text/x-vcard` from a real URL causes iOS to intercept and open the Contacts sheet.

The VCF includes the `N:` field (structured name: `Last;First;;;`) which is required by iOS to correctly parse the contact — without it, fields may appear blank.

### QR Code in Card Image
`CardWithQR` uses absolute positioning to overlay the QR as a white-padded stamp on the bottom-right of any card template. The QR is generated at 3× resolution (`toDataURL` with `width: qrSize * 3`) for crisp rendering at all scales. When a client downloads the card PNG via `html-to-image`, the QR is baked into the image.

### Wizard Step Skip Bug (fixed)
The 4-step card form uses a `<div>` wrapper (not `<form>`) with an explicit `type="button"` Save button. Using `<form>` caused step 3's color picker to trigger implicit form submission via keyboard events, skipping step 4. Removing the form element entirely prevents this.

### SSR-safe Supabase Client
`createClient()` is never called at module level or in `useState()` initializers in client components. Both run on the server during Next.js static pre-rendering and crash when env vars aren't available. It's called only inside async event handlers (login/signup functions).

### Tailwind CSS Config
Must use `postcss.config.js` (CommonJS `module.exports`) and `tailwind.config.js` (not `.ts` or `.mjs`). The project has no `"type": "module"` in `package.json`, so ESM config files cause PostCSS to silently skip Tailwind, resulting in completely unstyled output.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL (Settings → API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key (server-only, keep secret)
RESEND_API_KEY=                    # Resend API key for sending emails
NEXT_PUBLIC_APP_URL=               # Full base URL e.g. https://your-domain.com
```

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in the values above

# Run Supabase migrations
# Paste contents of supabase/migrations.sql into Supabase SQL Editor and run

# Start dev server
npm run dev
```

App runs at `http://localhost:3000`.

---

## Deployment (Vercel)

This app is designed for Vercel deployment.

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo in the Vercel dashboard. Set all environment variables in **Vercel → Project → Settings → Environment Variables**, and update `NEXT_PUBLIC_APP_URL` to your production domain.

After deploying, update Supabase:
- **Authentication → URL Configuration → Site URL** → set to your Vercel domain
- **Authentication → URL Configuration → Redirect URLs** → add `https://your-domain.vercel.app/api/auth/callback`

---

## Email Flow

On publish, `POST /api/cards/[id]/publish`:
1. Sets `status = 'published'`, records `published_at`
2. Sends a "Your card is live!" email via Resend with two CTAs:
   - **Present Mode** link — for the owner to use at events
   - **Client Card** link — for sharing online (LinkedIn, WhatsApp, etc.)

Email template: `src/emails/CardPublishedEmail.tsx`

---

## Phase 2 (Not Built)

- **Apple Wallet** — requires Apple Developer Program membership + `passkit-generator`, signing certificates
- **Google Wallet** — requires Google Cloud service account + signed JWT
- **Analytics** — scan count, view count per card
- **Custom domains** — per-user vanity URLs
- **Multiple cards** — currently supports multiple cards per account already via dashboard
