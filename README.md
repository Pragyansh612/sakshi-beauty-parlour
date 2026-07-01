# Sakshi Beauty Parlour

A salon & bridal studio website built with Next.js and Supabase — public marketing pages, a booking wizard (quick appointments + bridal/event bookings), a customer dashboard, and a full admin panel.

See `FINAL_REVIEW.md` for what's implemented, what's deviated from the original plan, and known limitations. See `PROGRESS.md` for the step-by-step build log.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **Supabase** — Postgres, Auth (email + password), Storage
- **Tailwind CSS 4**
- **Zod** + **react-hook-form** for form validation
- **sonner** for toast notifications

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (any region; the docs assume `ap-south-1`/Mumbai for latency reasons, but it isn't required for local dev).

3. **Copy the environment file** and fill in your project's values:

   ```bash
   cp .env.local.example .env.local
   ```

4. **Set up the database schema** — see [Supabase schema setup](#supabase-schema-setup) below.

5. **Run the seed scripts** — see [Seed scripts](#seed-scripts) below.

6. **Create your first admin user** — see [Creating the first admin user](#creating-the-first-admin-user) below.

7. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3000`.

8. **Build for production** (also the correctness gate used throughout development — must pass with zero TypeScript errors)

   ```bash
   npm run build
   npm start
   ```

> **Note:** `next lint` does not currently run in this environment due to an `eslint`/`eslint-config-next` version-compatibility issue unrelated to the application code (see `FINAL_REVIEW.md`). `npm run build`'s TypeScript check was used as the correctness gate instead.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. Find it in **Supabase Dashboard → Settings → API**. Public — safe to expose to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase project's anon/public API key, from the same **Settings → API** page. Public — safe to expose to the browser (Row Level Security policies in `supabase/schema.sql` are what actually protect the data). |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase project's **service role** key — from the same page. **Secret.** Only used by the one-off scripts in `scripts/` (run from your machine, never bundled into the app or exposed to the browser). Never commit this or use it in `app/`/`components/`/`actions/` code. |
| `NEXT_PUBLIC_SITE_URL` | The site's base URL — `http://localhost:3000` locally, your production domain when deployed. Used to build the Supabase Auth password-reset redirect link. |

`.env.local` is gitignored — never commit it.

## Supabase schema setup

1. Open your Supabase project's **SQL Editor**.
2. Paste the entire contents of `supabase/schema.sql` and run it. This creates all 9 tables (`profiles`, `service_categories`, `services`, `combo_offers`, `combo_offer_items`, `time_slots`, `appointments`, `bookings`, `gallery_images`, `contact_messages`), the `is_admin()` helper function, every Row Level Security policy, the auto-reference triggers (`AP-2000...`, `BK-1000...`), and seeds the initial `service_categories`/`services`/`combo_offers` rows.
3. Confirm **Authentication → Providers → Email** is enabled (it is by default). Decide whether to require email confirmation before login (Authentication → Settings) — the register flow in `components/auth/RegisterForm.tsx` handles both cases (auto-login if confirmation is off, "check your email" message if it's on).
4. Create two **Storage buckets**:
   - `gallery` — **public** (serves salon photos/achievements to the public Gallery page and the admin Gallery manager)
   - `avatars` — **private** (reserved for future profile photo use; not currently used by any page)
5. Apply the Storage RLS policies from the bottom of `supabase/schema.sql` (the `-- STORAGE RLS POLICIES` section — they're commented out there since `storage.objects` policies must be created after the buckets exist; uncomment and run them, or paste them directly into the SQL Editor).
6. Add your local and production URLs to **Authentication → URL Configuration → Redirect URLs** (needed for the forgot-password reset link to work).

## Seed scripts

Both scripts live in `scripts/` and are run with `tsx` (no install needed — `npx` fetches it on demand). Both require `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

**Seed gallery images** — uploads every image in `./work/` (portfolio) and `./acheivement/` (achievements) to the `gallery` Storage bucket and inserts a matching `gallery_images` row for each:

```bash
npx tsx scripts/seed-images.ts
```

HEIC files are skipped with a warning (convert to JPEG first — the script prints the exact `convert` command for each one).

**Seed time slots** — generates open `time_slots` rows for the next N days (default 60), 11:00 AM–8:30 PM in 30-minute increments. Without this, the booking wizard's date/time pickers and the admin Slots grid will show no availability, since slots are date-based and can't be part of the static schema seed:

```bash
npx tsx scripts/seed-slots.ts        # next 60 days
npx tsx scripts/seed-slots.ts 90     # next 90 days
```

Safe to re-run — both scripts upsert and won't duplicate or clobber existing rows (gallery images key on `storage_path`; slots key on `(slot_date, slot_time)` and leave already-blocked slots untouched).

## Creating the first admin user

There's no bootstrap flow for this — every account registers as a `customer` (see the `handle_new_user()` trigger in `supabase/schema.sql`). To promote one to `admin`:

1. Register a normal account through `/login` → Register tab.
2. In the Supabase SQL Editor, run:

   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
   ```

3. Sign out and back in (or just navigate to `/admin`) — `proxy.ts` middleware checks `profiles.role` on every `/admin/*` request, so the new role takes effect immediately without needing a fresh session.

Repeat for any other staff accounts that need admin access.
