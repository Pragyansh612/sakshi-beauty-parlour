# Implementation Progress

## Steps

| Step | Description | Status | Commit |
|---|---|---|---|
| 0 | `.gitignore` | ✅ Done | b656a7c |
| 1 | Project scaffold | ✅ Done | — |
| 2 | Database (schema.sql + seed script) | ✅ Done | — |
| 3 | Shared components | ✅ Done | 5d5f6d9 |
| 4 | Public pages (Home, Services, Gallery, About, Contact) | ✅ Done | — |
| 5 | Auth (`/login` — Login/Register/Forgot password) | ✅ Done | — |
| 6 | Booking flows (`/book` wizard) | 🔄 In progress | — |
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
- `/gallery` — done: header, filter pills + masonry grid + lightbox (`components/gallery/GalleryMasonry.tsx`, client), achievements/credentials grid, CTA strip. Matches `design/Gallery.dc.html`. Uses static placeholder tiles (gradients), not real photos yet — real gallery photo integration awaits Supabase Storage wiring (`scripts/seed-images.ts` already exists for that from Step 2).
- `/about` — done: hero, stats band, mission/vision, standards, commitment section, founder quote. Fully static/server-rendered. Matches `design/About.dc.html`.
- `/contact` — done: header, quick contact cards (call/WhatsApp/social), studio details + map placeholder + `ContactForm` (existing from Step 3), CTA strip. Matches `design/Contact.dc.html`.
- Step 4 complete: all 5 marketing pages built. `/book` and `/login` moved to Steps 6 and 5 respectively (they need real backend wiring — Supabase Auth, slot/booking DB logic — not just static UI).

### Step 5 — Auth
- `/login` — tab-switching split-screen page (`app/login/page.tsx` + `components/auth/AuthPanel.tsx`). Login/Register/ForgotPassword as separate client form components (`components/auth/LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`).
- Per BLOCKER-001: login uses email+password (`signInWithPassword`); register collects full name + phone + email + password, calls `signUp` with `options.data = { full_name, phone }` which the `handle_new_user()` trigger (schema.sql) reads to populate `profiles`.
- Register: if Supabase returns a session immediately (email confirmation disabled), redirect to `/dashboard`; otherwise show "check your email" and switch to login tab.
- Forgot password uses `resetPasswordForEmail`.
- Middleware (`lib/supabase/middleware.ts`) already protects `/dashboard` and `/admin` and redirects logged-in users away from `/login` — this existed from Step 1/2 scaffold, unchanged.
