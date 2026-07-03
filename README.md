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
3. Confirm **Authentication → Providers → Email** is enabled (it is by default) and **Confirm email** is **OFF** — login is phone + password only (no OTP, no real email involved); see `lib/phone-auth.ts` and `BLOCKERS.md` (BLOCKER-001) for why the app uses Supabase's email provider under the hood with a synthetic `p<phone>@<host>` address. `app/api/auth/register/route.ts` also passes `email_confirm: true` on every signup, so this works even if Confirm email is left on, but turning it off avoids Supabase attempting to send mail to an address that doesn't exist.
4. Create two **Storage buckets**:
   - `gallery` — **public** (serves salon photos/achievements to the public Gallery page and the admin Gallery manager)
   - `avatars` — **private** (reserved for future profile photo use; not currently used by any page)
5. Run `supabase/storage-policies.sql` in the SQL Editor (`storage.objects` policies must be created after the buckets exist, so this is a separate file rather than part of `schema.sql`). Without this, the admin Gallery manager's in-browser upload fails with a row-level-security error even for a genuine admin — confirmed as a real bug on this project before the file existed.
6. Add your local and production URLs to **Authentication → URL Configuration → Redirect URLs** (needed for the forgot-password reset link to work).

## Seed scripts

All three scripts live in `scripts/` as `.mts` files (not `.ts` — they use top-level `await`, which needs to be unambiguously ESM regardless of whether `package.json` has `"type": "module"`) and are run with `tsx` (no install needed — `npx` fetches it on demand). They read `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` if it exists, falling back to `.env` otherwise.

**Convert HEIC photos** — iPhones export photos as `.HEIC`, which browsers can't render in an `<img>` tag. Converts every `.HEIC` file in `./work/` and `./acheivement/` to a sibling `.jpg` (originals untouched, safe to re-run — skips files already converted):

```bash
npx tsx scripts/convert-heic.mts
```

**Seed gallery images** — uploads every image in `./work/` (portfolio) and `./acheivement/` (achievements) to the `gallery` Storage bucket and inserts a matching `gallery_images` row for each. Run `convert-heic.mts` first, or HEIC files will be skipped with a warning:

```bash
npx tsx scripts/seed-images.mts
```

**Seed time slots** — generates open `time_slots` rows for the next N days (default 60), 11:00 AM–8:30 PM in 30-minute increments. Without this, the booking wizard's date/time pickers and the admin Slots grid will show no availability, since slots are date-based and can't be part of the static schema seed:

```bash
npx tsx scripts/seed-slots.mts        # next 60 days
npx tsx scripts/seed-slots.mts 90     # next 90 days
```

Safe to re-run — both scripts upsert and won't duplicate or clobber existing rows (gallery images key on `storage_path`; slots key on `(slot_date, slot_time)` and leave already-blocked slots untouched). **The `storage_path` unique constraint the gallery upsert depends on must exist** — `supabase/schema.sql` declares it, but if your project's `gallery_images` table was created before this was added, run once:

```sql
ALTER TABLE gallery_images ADD CONSTRAINT gallery_images_storage_path_key UNIQUE (storage_path);
```

## Creating the first admin user

Every account registers as a `customer` by default (see the `handle_new_user()` trigger in `supabase/schema.sql`). Two ways to create/promote an admin — both are idempotent (safe to re-run) and set phone + password directly, no OTP:

- **From your machine** (needs `SUPABASE_SERVICE_ROLE_KEY` in `.env`/`.env.local`):
  ```bash
  npx tsx scripts/seed-admin.mts
  ```
  Edit the `ADMIN_PHONE` / `ADMIN_PASSWORD` / `ADMIN_NAME` constants at the top of the script first.

- **From the Supabase SQL Editor**: run `supabase/seed-admin.sql`. Edit the `admin_phone` / `admin_password` / `admin_name` / `auth_email_domain` variables in the `DO $$ ... $$` block first — `auth_email_domain` must match what `lib/phone-auth.ts#getAuthEmailDomain()` resolves to at runtime (`NEXT_PUBLIC_AUTH_EMAIL_DOMAIN`, else your `NEXT_PUBLIC_SITE_URL` host, else your Supabase project host) or login will fail with "Invalid login credentials" even though the account exists — this exact mismatch (a literal unsubstituted placeholder domain) broke the admin login on this project until it was found and fixed on 2026-07-03.

To promote an *existing* customer account to admin instead, just run:
```sql
UPDATE profiles SET role = 'admin' WHERE phone = '9876543210';
```
Sign out and back in (or just navigate to `/admin`) — `proxy.ts` middleware checks `profiles.role` on every `/admin/*` request, so the new role takes effect immediately without needing a fresh session.

## Placeholder stock photography

`public/stock/` contains three free-license Unsplash photos (Unsplash License — free for commercial use, no attribution required) used as temporary imagery until real salon photography is available:

| File | Used on | Source |
|---|---|---|
| `hero-bridal-portrait.jpg` | Home hero | [Rohit Dey — Unsplash](https://unsplash.com/photos/vtn_xOMgWjc) |
| `salon-interior.jpg` | Home bridal banner | [Guilherme Petri — Unsplash](https://unsplash.com/photos/PtOfbGkU3uI) |
| `spa-treatment-candid.jpg` | About page commitment section | [Unsplash](https://unsplash.com/photos/Pe9IXUuC6QU) |

Replace these with real photos of the actual salon/team as soon as they're available — swap the file in place (same filename) or update the `src` in `app/page.tsx` / `app/about/page.tsx`.
