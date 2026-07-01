# Final Review — Sakshi Beauty Parlour

Status at handoff: all 9 implementation steps complete, `npm run build` passes clean (zero TypeScript errors). No live Supabase project has been connected in this environment at any point during the build (see "What has not been verified" below) — this review is written from static analysis of the codebase, not from clicking through a running app against real data.

## 1. Features implemented

**Public site** (`/`, `/services`, `/gallery`, `/about`, `/contact`) — fully built, responsive, matching the Phase 0 design files. Content on `/services`, `/gallery`, `/about`, `/contact` is static/hardcoded, not read from the database (see Limitations).

**Auth** (`/login`) — Login, Register, Forgot Password as tab-switching panels. Email + password via Supabase Auth (see Deviation #1). Phone collected and stored on the profile but not used for authentication.

**Booking** (`/book`) — 4-step wizard for both Quick Appointment and Bridal & Event Booking modes, backed by live `services` and `time_slots` queries. Reschedule entry point from the dashboard pre-fills the service and mode via `?reschedule=[ref]`.

**Customer dashboard** (`/dashboard`) — protected route, Appointments/Bookings tabs with real data, stat strip, inline-confirm cancel, reschedule redirect. All actions have loading/success/error states with toast notifications.

**Admin panel** (`/admin/*`) — protected, role-gated (both by middleware and defensively by each Server Action):
- `/admin/dashboard` — stats, today's schedule, recent activity feed (computed at read time, no dedicated activity-log table)
- `/admin/appointments` — search/filter, table, view/edit drawer, cancel (soft, via `DeleteConfirmModal`)
- `/admin/bookings` — card list, search, approve/manage/update flow via the edit drawer, delete (hard, via `DeleteConfirmModal`)
- `/admin/services` — table, add/edit/delete, category + status as validated dropdowns
- `/admin/gallery` — Our Work/Achievements tabs, drag-and-drop upload directly to Supabase Storage, edit/delete
- `/admin/slots` — weekly grid (11 AM–9 PM, 30-min increments), block/unblock, week navigation, day-generation

Every destructive action in the admin panel routes through the shared `DeleteConfirmModal`. Every async action across the app (forms, bookings, dashboard, every admin manager) has an explicit loading state, a success toast, and an error toast.

## 2. Deviations from Phase 0 documents (and why)

1. **Auth is email + password, not phone + password / SMS OTP.** Documented in full in `BLOCKERS.md` (BLOCKER-001), decided and implemented in Step 5. Supabase Auth has no native "phone + password without OTP" flow; forcing phone into a synthetic email is a brittle hack. Email is required at registration; phone is still the primary contact field shown everywhere else in the app. `DEPLOYMENT_PLAN.md`'s Twilio/SMS-OTP setup steps are not needed at launch as a result.

2. **Booking stepper on mobile is a horizontally-scrollable row of all 4 steps, not the "active step label + progress bar" pattern** `IMPLEMENTATION_PLAN.md` §7 describes. Built this way in Step 6; it doesn't break on narrow screens (it scrolls), but it isn't the exact simplified pattern the plan called for. Low-risk cosmetic deviation, not revisited in this pass since Step 6 was already signed off.

3. **Footer mobile treatment stacks all four columns instead of using collapsible accordion sections** as `IMPLEMENTATION_PLAN.md` §7 suggests. A plain stack is simpler and doesn't break the layout; accordion behavior was judged not worth the extra interactivity for a rarely-scrolled footer. Built in Step 4.

4. **Reschedule does not auto-cancel the original slot/booking.** The dashboard's Reschedule button redirects to `/book?reschedule=[ref]` with the service pre-selected, per the Step 7 spec exactly as worded. `IMPLEMENTATION_PLAN.md`'s fuller flow ("old slot freed, new slot held, status back to Pending") was not implemented — the customer places a new booking and separately cancels the old one from the dashboard if desired. Simplest option that satisfies the literal Step 7 requirement; the fuller flow would need slot-transfer logic that touches booking status transitions not specified anywhere else.

5. **Admin "+ New booking" (create a booking on a customer's behalf) was not built.** The design shows a button for it, and `IMPLEMENTATION_PLAN.md`'s Bookings-management flow mentions it, but it isn't in the P0 feature list, and it needs a customer picker that no document specifies (search by name? phone? create a new profile inline?). Omitted rather than half-built; the button was removed from the UI rather than left as a dead click.

6. **`RecordDrawer`'s `select` field type was implemented for the first time in Step 8.** The component's TypeScript interface already declared `type: 'select'` with an `options` array (presumably anticipating this need), but the actual rendering only ever produced a text/date `<input>`. This was completed now because Status/Category fields across every admin manager need a constrained dropdown, not free text that could violate a `CHECK` constraint.

## 3. Known limitations

- **Public marketing pages don't read from the database.** `/services`, `/gallery`, `/about`, `/contact` render static, hardcoded content (decided in Step 4, before Supabase was wired up for anything beyond auth). `/book` *does* read live `services` and `time_slots`, and the admin panel's Services/Gallery managers *do* write to the real tables — but changes made in `/admin/services` or `/admin/gallery` will not appear on `/services` or `/gallery` until those pages are switched to fetch from Supabase. This is the single biggest gap between "admin panel works" and "admin panel actually controls the live site."
- **No admin view for `contact_messages`.** The Contact page writes submissions to the database (Step 4), but nothing in the admin panel reads them back — they're only visible via Supabase Studio directly. Not requested in any Step 8 spec, but likely wanted soon.
- **`combo_offers` / `combo_offer_items` have no admin UI.** They exist in the schema and are shown (statically) on the public Services page, but aren't manageable anywhere.
- **Dashboard detail pages** (`/dashboard/appointments/[id]`, `/dashboard/bookings/[id]`) were never built — explicitly P1 in `IMPLEMENTATION_PLAN.md`. "View details" on the dashboard is an inline expand/collapse on the existing card instead of a separate route.
- **No email/SMS notifications** on booking submission, approval, or cancellation (P1/P2). Admin and customer both rely on the in-app state; nothing pings anyone externally.
- **Admin "revenue" figures are a naive sum**, not a real payments ledger — `services.price_from` for appointments, `bookings.agreed_price` (falling back to `services.price_from` when not yet negotiated) for bookings, filtered to the current calendar month. No online payment integration exists (by design — the site explicitly states "no payment taken online").
- **Loyalty tier ("Gold") on the customer dashboard is a static display value**, not backed by any points/tier system — explicitly called out as P2 in `IMPLEMENTATION_PLAN.md` assumption #6.
- **`next lint` does not run in this environment** — it fails with a pre-existing `eslint`/`eslint-config-next` version-compatibility error (`Converting circular structure to JSON` inside `@eslint/eslintrc`) unrelated to any application code. `npm run build`'s own TypeScript check is clean and was used as the correctness gate throughout instead.
- **No automated test suite** (unit or e2e) exists. Correctness was validated via `npm run build` (TypeScript + build-time checks) and manual code review against the Phase 0 documents, not via a running app.

## 4. What has not been verified

No `.env.local` / live Supabase project has existed in this environment at any point across all 9 steps (per `PROGRESS.md`'s Step 4 note). Consequently, the following have **not** been exercised against a real backend and are verified only by code review:
- Supabase Auth flows (register/login/forgot-password, session cookies, middleware redirects) actually round-tripping
- RLS policies behaving as written under real `auth.uid()` values
- The booking wizard actually reserving a slot / preventing double-booking under concurrent requests
- Storage uploads to the `gallery` bucket, and the resulting public URLs resolving
- Any hydration behavior in the browser (React DevTools / console warnings) — static review found no obvious causes (no `Date.now()`/`Math.random()`/unguarded `window` access inside a render path that would produce mismatched server/client output), but this is not a substitute for an actual browser render.

Before going live, run through `README.md`'s setup once against a real Supabase project and manually verify: registration → login → book an appointment → see it on `/dashboard` → cancel it; then, as an admin, approve a booking, upload a gallery image, and block/unblock a slot.

## 5. Recommended future improvements

In rough priority order:
1. Wire `/services` and `/gallery` to read from Supabase so the admin panel actually controls the live site (closes the biggest gap above).
2. Add an admin view for `contact_messages` (mark read/unread, at minimum).
3. Build the reschedule flow's slot-transfer logic (auto-free the old slot on confirm) instead of relying on a separate manual cancel.
4. Add email or WhatsApp notifications for booking submission/approval/cancellation.
5. Admin-side "create booking for a customer" with a proper customer search/picker.
6. Dashboard detail pages for a shareable/bookmarkable single appointment or booking view.
7. Replace the naive revenue sum with a real ledger once (if) online payments are introduced.
8. Fix the `eslint`/`next lint` toolchain incompatibility so linting can run in CI.
