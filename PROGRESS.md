# Implementation Progress

## Steps

| Step | Description | Status | Commit |
|---|---|---|---|
| 0 | `.gitignore` | ✅ Done | b656a7c |
| 1 | Project scaffold | ✅ Done | — |
| 2 | Database (schema.sql + seed script) | ✅ Done | — |
| 3 | Shared components | ✅ Done | 5d5f6d9 |
| 4 | Public pages | 🔄 In progress (Home done) | — |
| 5 | Auth | ⬜ Pending | — |
| 6 | Booking flows | ⬜ Pending | — |
| 7 | Customer dashboard | ⬜ Pending | — |
| 8 | Admin panel | ⬜ Pending | — |
| 9 | Final validation | ⬜ Pending | — |

## Notes

### Step 1 — Scaffold
- `create-next-app` does not work in a non-empty directory with `--yes`. Scaffolded manually.
- Next.js 16.2.9, React 19.2.7, Tailwind CSS 4.3.2
- `middleware.ts` renamed to `proxy.ts` per Next.js 16 convention.

### Step 2 — Database
- `supabase/schema.sql` — full schema with RLS for all tables, auto-ref triggers, initial seed data
- `scripts/seed-images.ts` — uploads ./work/ and ./acheivement/ to Supabase Storage; HEIC files flagged for manual conversion
- `types/database.ts` — full TypeScript types for all 8 tables

### Auth Blocker
See `BLOCKERS.md` for the phone+password limitation. Proceeding with email+password for Supabase Auth. Email is required in the register form. Phone stored in profiles for display/contact throughout the app.

### Step 4 — Public pages
- `/` (Home) — done: hero, trust strip, why-choose-us, featured services (hover/accordion price cards via `components/home/ServiceHoverCard.tsx`), bridal banner, gallery preview strip, testimonial, contact CTA. Matches `design/Sakshi Beauty Parlour.dc.html`.
- `/services` — done: header, filter pills (anchor links), 6 category blocks (`components/services/ServiceCategoryBlock.tsx`), combo offers (`components/services/ComboCard.tsx`), CTA strip. Matches `design/Services.dc.html`.
- Note: pages use static hardcoded content matching the design files rather than DB fetches — no live Supabase project is connected yet (`.env.local` not created). DB wiring for services/gallery can be swapped in once a real Supabase project + seed data exists.
- Remaining: `/gallery`, `/about`, `/contact`, `/book`, `/login`.
