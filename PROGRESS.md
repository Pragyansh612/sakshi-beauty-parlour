# Implementation Progress

## Steps

| Step | Description | Status | Commit |
|---|---|---|---|
| 0 | `.gitignore` | ✅ Done | b656a7c |
| 1 | Project scaffold | ✅ Done | — |
| 2 | Database (schema.sql + seed script) | ✅ Done | — |
| 3 | Shared components | 🔄 In progress | — |
| 4 | Public pages | ⬜ Pending | — |
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
