# CardForge — Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your **Project URL** and **anon public** key from Settings → API
3. Also copy the **service_role** key (keep secret)

## 2. Configure Environment Variables

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Run Database Migrations

In **Supabase → SQL Editor**, run the contents of `supabase/migrations.sql`.

Then create the Storage bucket manually:
1. Go to **Storage → New Bucket**
2. Name: `logos`, set to **Public**
3. Add Storage Policies:
   - **SELECT** for everyone: `bucket_id = 'logos'`
   - **INSERT** for authenticated users: `bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]`
   - **DELETE** for own files: same condition as INSERT

## 4. Configure Resend (for email)

1. Sign up at https://resend.com
2. Verify a domain or use the sandbox email
3. Add your `RESEND_API_KEY` to `.env.local`
4. Update the `from` address in `src/app/api/cards/[id]/publish/route.ts`

## 5. Run the App

```bash
npm run dev
```

Open http://localhost:3000

## Flow

1. Sign up → confirm email → dashboard
2. **New Card** → fill 4-step wizard → Save
3. **Preview** → Publish → receive email with link
4. Share `/card/[slug]` — anyone can view, download image, save contact, scan QR
