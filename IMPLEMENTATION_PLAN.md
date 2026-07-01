# Implementation Plan — Sakshi Beauty Parlour

## Definitions (applied throughout this project)
- **Appointment** = short-duration service tied to a specific time slot (e.g. haircut, facial, threading). 4-step wizard: Service → Date → Time Slot → Review/Confirm.
- **Booking** = long-duration or special-occasion service tied to a date and requirements, no specific slot (e.g. bridal makeup, pre-bridal package, event makeup). 4-step wizard: Service → Date → Requirements Form → Review/Confirm.

---

## 1. Pages and Routes

### Public routes
| Route | Page | Design file |
|---|---|---|
| `/` | Home | `Sakshi Beauty Parlour.dc.html` |
| `/services` | Services & Treatments | `Services.dc.html` |
| `/gallery` | Gallery | `Gallery.dc.html` |
| `/about` | About | `About.dc.html` |
| `/contact` | Contact | `Contact.dc.html` |
| `/book` | Book (Appointment or Booking wizard) | `Booking.dc.html` |
| `/login` | Login / Register / Forgot Password | `Login.dc.html` |

### Authenticated customer routes
| Route | Page | Design file |
|---|---|---|
| `/dashboard` | Customer Dashboard | `Dashboard.dc.html` |
| `/dashboard/appointments/[id]` | Appointment detail | (derived from design) |
| `/dashboard/bookings/[id]` | Booking detail | (derived from design) |

### Admin routes (role=admin only)
| Route | Page | Design file |
|---|---|---|
| `/admin` | Admin Dashboard | `Admin.dc.html` |
| `/admin/appointments` | Appointments management | `Admin.dc.html` |
| `/admin/bookings` | Bookings management | `Admin.dc.html` |
| `/admin/services` | Services management | `Admin.dc.html` |
| `/admin/gallery` | Gallery management | `Admin.dc.html` |
| `/admin/slots` | Slot management | `Admin.dc.html` |

Note: The admin panel is a single-page SPA-style interface in the design, but will be implemented as a multi-route Next.js app with shared layout (sidebar). All admin sub-sections will be separate `/admin/[section]` routes, not client-side tab switching, to enable direct linking, bookmarking, and browser back navigation.

---

## 2. User Flows

### Auth flows

#### Login
1. User lands on `/login` (default tab: Login)
2. Enters phone number or email + password
3. On success → redirect to `/dashboard`
4. On error → inline error message beneath the form field

#### Register
1. User clicks "Register" tab (or "Create an account" link)
2. Fills: Full name (required), Phone number (required), Email (optional), Password
3. On success → auto-login → redirect to `/dashboard`
4. Phone is the primary identifier; email is supplementary

#### Forgot Password
1. User clicks "Forgot password?" link on Login form
2. Tabs disappear, Forgot form appears
3. User enters phone or email
4. System sends OTP to phone (see Deployment Plan for reasoning)
5. User enters OTP → sets new password
6. Back to Login

### Appointment booking flow
1. User arrives at `/book` (default mode: Quick Appointment)
2. **Step 1 — Service**: Select one service from the appointment list
3. **Step 2 — Date**: Pick a date from the next 14 days (some days may be unavailable)
4. **Step 3 — Time**: Pick an available 30-minute slot (greyed = booked)
5. **Step 4 — Review**: Confirm service, date, time, price; click "Confirm Appointment"
6. **Success state**: Confirmation screen with reference number; links to Dashboard and "Book another"
7. If not logged in: prompt login/register before allowing confirm step (or store selection in session and redirect back after auth)

### Booking (Bridal/Event) flow
1. User clicks "Bridal & Event Booking" toggle at `/book`
2. **Step 1 — Service**: Select Bridal Makeup, Pre-Bridal Package, or Event/Party Makeup
3. **Step 2 — Date**: Pick an event date (broader range than appointments, no slot constraint)
4. **Step 3 — Requirements**: Event type, number needing makeup, venue/location, preferred style/notes, optional trial checkbox
5. **Step 4 — Review**: Confirm all details; click "Confirm Booking"
6. **Success state**: "You're all but booked" — team will confirm by call/WhatsApp. No payment taken online.
7. Booking status starts as "Pending approval" until admin approves.

### Reschedule flow (from Dashboard)
1. Customer sees appointment/booking in Dashboard list
2. Clicks "Reschedule" → navigates to `/book?reschedule=[ref]`
3. Booking form pre-fills with existing service; user picks new date/time
4. On confirm → old slot freed, new slot held, status back to "Pending" until admin confirms
5. Admin sees reschedule request in activity feed and can approve/reject

### Cancel flow (from Dashboard)
1. Customer clicks "Cancel" on an appointment or booking card
2. A confirmation prompt appears inline (not a modal at customer level — just a simple "Are you sure?" below the button, per design; the design shows this as a red-bordered ghost button suggesting light-weight confirmation)
3. On confirm → status set to "Cancelled"; slot freed
4. Past bookings remain visible in history with "Cancelled" badge

### Admin approval flow (Bookings)
1. New booking arrives with status "Pending approval"
2. Admin sees it in `/admin/bookings` with amber badge and "Approve" CTA
3. Admin clicks "Approve" → opens edit drawer → reviews details → saves → status becomes "Confirmed"
4. Assumption: admin will contact customer by phone/WhatsApp outside the system to confirm pricing (stated explicitly in design: "No payment taken online")

---

## 3. Admin Flows

### Dashboard
- Overview stats: today's appointments count, upcoming bookings count, revenue (current month), pending approvals count
- Today's schedule: table of all today's appointments with time, client, service, artist, status
- Recent activity feed: new bookings, reschedule requests, payments, cancellations

### Appointments management (`/admin/appointments`)
- Table: Ref, Client, Service, Date & Time, Artist, Status, Actions
- Search by client name or reference
- Filter: All / Today / Upcoming (segment control)
- Actions per row: View (opens read-only drawer), Edit (opens editable drawer), Cancel (opens delete confirm modal)
- Drawer fields: Client, Service, Date & Time, Artist, Status, Reference

### Bookings management (`/admin/bookings`)
- Card layout (not table) — each booking shows status badge, ref, title, client, detail, event date, value
- Search by client or booking ref
- Add new booking manually (admin-side)
- Actions per card: Manage/Approve/Update (opens edit drawer), View details (opens read-only drawer), Delete (opens confirm modal)
- Drawer fields: Booking title, Client, Details, Event date, Value, Status, Reference
- Status progression: Pending approval → Confirmed → In progress → Completed

### Services management (`/admin/services`)
- Table: Service name, Category, Duration, Price, Status (Active/Draft), Actions
- Search by service name
- Add new service (opens form)
- Actions: View, Edit, Delete
- Edit drawer fields: Service name, Category, Duration, Price, Status

### Gallery management (`/admin/gallery`)
- Grid layout with "Our Work" / "Achievements" tab toggle
- Upload card (drag-and-drop or browse)
- Each image card: thumbnail, title, category; actions: View, Edit, Delete
- Edit drawer fields: Title, Category, Tag
- Images stored in Supabase Storage

### Slots management (`/admin/slots`)
- Weekly calendar view: 7 columns (days) × 20 rows (time slots, 11:00 AM – 8:30 PM, 30-min increments)
- Slot states: Open (white), Fully booked (red), Blocked by admin (grey strikethrough)
- Admin can manually block/open slots
- Week navigation: Prev / Next
- Add slot button: create new availability

---

## 4. Key UI Interactions

### Hover flip cards (Home page — Featured Services)
- `.fcard` cards with `.fdetail` overlay that appears on hover
- Overlay slides up from bottom with pricing breakdown grouped by sub-category
- CSS-only on desktop; on mobile, replace with expandable accordion (tap to expand pricing)

### Lightbox (Gallery page)
- Click any gallery tile → full-screen overlay with blurred backdrop
- Lightbox card shows full image, category eyebrow, title
- Close on overlay click or ✕ button
- Keyboard: Escape to close
- On mobile: same behaviour (tap to open, tap outside to close)

### Booking stepper
- Step indicator at top: 4 numbered dots with labels, connected by lines
- Completed steps filled gold, active step filled gold, future steps outlined
- "Continue" button disabled if required selection not made (`.btn-block` class)
- "Back" button hidden on Step 1 (visibility:hidden so layout doesn't shift)

### Segment toggle (Appointment vs Booking mode)
- Pill-style toggle with two options; selected option has dark background
- Switching mode resets all wizard state to Step 1

### Admin drawer
- Slides in from the right (452px wide)
- Backdrop overlay (`ov`) behind it; click overlay to close
- Two modes: View (read-only field list) and Edit (input fields, Save/Cancel buttons)

### Admin delete confirmation modal
- Centred modal over backdrop
- Trash icon, item name in bold, "This can't be undone" warning
- Cancel and Delete buttons side by side

### Masonry gallery
- CSS `column-count: 3` with variable-height tiles
- Each tile: hover reveals title/category caption (fades in from bottom)
- Hover also slightly scales the image

### Scroll-linked reveal animations
- Uses `animation-timeline: view()` (CSS scroll-driven animations) with `@supports` guard
- Falls back to `opacity:1` on browsers that don't support it — no JS required

### Sticky navigation
- `position: sticky; top: 0` with backdrop-filter blur and semi-transparent background
- On mobile: collapses to hamburger menu (this is not shown in desktop design — see mobile section)

### Sticky booking summary (Book page)
- Right sidebar at `/book` sticks at `top: 96px` as the user scrolls the left panel

---

## 5. Assumptions Made

1. **Phone number format**: The design shows "+91 98765 43210" (placeholder). The real number will be provided before launch. The placeholder is used throughout.

2. **Pricing shown is "from" pricing**: The design explicitly states "Final pricing is confirmed after your consultation. No payment is taken online." Services have range prices (e.g. ₹1,000–3,000). The database stores min and max price; the booking flow shows the starting price.

3. **Appointment service list vs Services page**: The appointment booking flow shows 5 simplified service options (Hair Wash, Facial, Threading, Haircut, Waxing) which are entry points into the full services catalogue. The admin can manage the full services list from `/admin/services`. The booking flow service picker should pull from the database (appointment-eligible services), not a hardcoded list.

4. **Artist assignment**: The design shows artist assignment in admin views but the customer booking flow does not let customers select an artist. Assignment is done by admin after booking. "Any available" is the default.

5. **No online payment**: The design explicitly states this multiple times. Payment handling is out of scope. Status flows handle the confirmation lifecycle.

6. **Loyalty program**: The dashboard shows a "Loyalty: Gold" stat card. This is display-only for now — no points system is being implemented (P2).

7. **Contact form**: The design shows a contact form. This will submit to Supabase (insert into a `contact_messages` table) and optionally trigger an email notification to the admin.

8. **Map embed**: The Contact page has a placeholder map. A real Google Maps embed will be dropped in at launch.

9. **WhatsApp integration**: The design shows "Continue with WhatsApp" and "Book over WhatsApp" as alternatives. These are external links to `wa.me/91XXXXXXXXXX`; they do not integrate with the app's booking system.

10. **"Revenue" in admin dashboard**: The design shows ₹2.4L revenue for June. This is a display stat — it assumes a `payments` or `total_value` field on bookings. For launch, this can be a simple sum of confirmed booking/appointment values (not a real payment gateway integration).

11. **HEIC image format**: The 19 HEIC files in `acheivement/` are Apple iPhone format and cannot be served directly on the web. They must be converted to JPEG or WebP before seeding into Supabase Storage.

12. **Gallery "work" vs "acheivement" split in admin**: The admin gallery has "Our Work" and "Achievements" as two separate sections. The database `gallery_images` table will have a `section` column (`work` | `achievement`).

13. **Admin access**: No separate admin login page. Admin logs in at the same `/login` route with the same auth system. The `profiles.role` column (`customer` | `admin`) determines access. Admin routes are protected by middleware.

---

## 6. Risks

### Technical risks
- **HEIC conversion**: 19 achievement images are in HEIC format. They cannot be served on the web without conversion. Need to convert to JPEG/WebP before seeding. Risk: image quality loss or conversion toolchain setup required.
- **CSS `animation-timeline: view()`**: This is a newer CSS feature with `@supports` fallback designed in. The fallback is clean (`opacity:1`, no animation). Low risk.
- **CSS `backdrop-filter`**: Used for the sticky nav. Not supported in some older Android browsers. Low risk given modern phone usage in the target demographic.
- **Masonry layout with `column-count`**: Pure CSS masonry does not allow for JavaScript-based reordering on filter. When a filter removes items mid-column, gaps can appear. Solution: use JavaScript-driven filtering with Framer Motion layout animations, or accept the gap behaviour.
- **Slot management at scale**: A 7-day weekly grid of 20 slots is fine. If the business ever wants to manage per-artist slots or multi-artist concurrent bookings, the current slot model would need a major revision. For now, slots are per-day/time, not per-artist.

### UX/product risks
- **No WhatsApp confirmation fallback in app**: The business currently confirms bookings by phone/WhatsApp outside the system. If a customer books online but staff don't see the admin panel notification, the booking is missed. Mitigation: email notification to admin on new booking (Server Action + Supabase email trigger).
- **Bridal booking "Pending approval" state**: The customer submits a bridal booking and sees a success screen, but it's actually "Pending". If the admin takes days to respond, the customer may be confused. Should show "We'll confirm within 24 hours" messaging clearly.
- **No cancellation policy shown**: The design doesn't define cancellation rules. The system allows cancellations freely. This may need a policy displayed before cancelling.

---

## 7. Mobile UX — Problem Areas and Alternatives

The design was built for desktop (1240px max-width). The following elements do not translate well to mobile and require specific mobile adaptations.

### Navigation
- **Problem**: The full horizontal nav with phone number + CTA button is too wide for mobile.
- **Solution**: Hamburger menu (☰) on mobile that opens a full-screen drawer. Phone number and "Book Appointment" CTA move to the bottom of the drawer. A persistent floating "Book" button at bottom-right of screen on all pages.

### Home hero — two-column grid
- **Problem**: `grid-template-columns: 1.05fr 1fr` with a large portrait image is unusable on mobile.
- **Solution**: Single column. Text first (heading, CTA buttons, stat strip), then the hero image below. Drop the absolute-positioned floating cards (rating badge, "Bridal Specialists" badge) as they overflow on small screens.

### Home — Featured service hover cards
- **Problem**: Hover interaction with the `.fdetail` price overlay does not work on touch screens (no hover state).
- **Solution**: On mobile, replace with a tap-to-expand accordion below each service card. The card taps open a panel showing the price breakdown. Same data, touch-native pattern. Preserve the visual style (dark background, gold text).

### Services page — Category layout
- **Problem**: `grid-template-columns: 288px minmax(0, 1fr)` puts a wide intro panel side-by-side with a 3-column service grid. On mobile this is completely unusable.
- **Solution**: Stack vertically: intro block full-width on top (collapsed to 1-2 lines with the CTA button), then the subcards in a 1-column list (or 2-column on larger phones). Filter pills become a horizontal scroll strip.

### Booking stepper
- **Problem**: The step indicators with labels and connecting bars take 400px+ horizontal space.
- **Solution**: On mobile, show only the active step label and "Step 2 of 4" text. Use a progress bar instead of dots+bars.

### Booking — Date grid
- **Problem**: `grid-template-columns: repeat(7, 1fr)` with 14 day tiles may be very cramped on narrow screens.
- **Solution**: Horizontally scrollable date strip (same 7-wide grid, but container scrolls horizontally). Each day tile is a fixed ~70px wide.

### Booking — Time slot grid
- **Problem**: `grid-template-columns: repeat(5, 1fr)` with 20 slots. Fine on tablet but tight on phone.
- **Solution**: `repeat(3, 1fr)` on mobile.

### Dashboard
- **Problem**: The booking card layout is a horizontal flex row (image + details + action buttons) — too wide for mobile.
- **Solution**: Stack vertically within each card: image row → title + badges → meta fields in a 2-column mini-grid → action buttons in a row at bottom.

### Admin panel
- **Problem**: The admin sidebar takes 236px permanently. Not suitable for mobile.
- **Solution**: Admin panel is intended for use on a desktop/tablet by the salon owner. A collapsible sidebar (hamburger toggle) on mobile is sufficient. The admin is not a mobile-first experience, but must not break completely.

### Gallery — Masonry 3-column
- **Problem**: 3 columns is fine on desktop but cramped on mobile.
- **Solution**: 2 columns on tablet, 1 column on mobile (single column masonry/simple stack). Lightbox remains the same.

### Login — Two-column split
- **Problem**: The brand panel on the left takes half the screen. On mobile there's no room.
- **Solution**: On mobile, hide the brand left panel entirely. Show only the form panel, with the logo at top and a compact brand tagline below it. The brand colours and fonts still identify it clearly.

### Footer — 4-column grid
- **Problem**: `grid-template-columns: 1.4fr 1fr 1fr 1.2fr` footer is too wide for mobile.
- **Solution**: 2-column grid on tablet, 1-column stacked on mobile with collapsible sections (accordion) for Explore, Account, Visit us.

---

## 8. Feature Prioritization

### P0 — Must-have for launch
- All 9 pages implemented and responsive (mobile + desktop)
- Supabase Auth (phone + password login, register, forgot password via OTP)
- Role-based access: `customer` and `admin` roles via `profiles.role`
- Booking wizard (both Appointment and Bridal/Event modes) — fully functional
- Customer dashboard: list appointments and bookings, reschedule (redirects to booking with pre-fill), cancel
- Admin panel: Dashboard overview, Appointments table (view/edit/cancel), Bookings list (view/approve/manage), Services table (view/edit/add/delete)
- Gallery page with filter pills and lightbox (images from Supabase Storage)
- Admin gallery upload (Our Work and Achievements tabs)
- Admin slot management (create slots, block/unblock time)
- Contact form (submits to database)
- Real salon images seeded from `./work/` and `./acheivement/` folders
- Fully mobile responsive
- Toast notifications for all async actions

### P1 — Important but not blocking launch
- Admin slots: Per-slot booking count display (how many appointments in that slot vs capacity)
- Email/SMS notification to admin on new booking submission
- "Pending approval" to "Confirmed" email/SMS notification back to customer
- Gallery admin: drag-and-drop upload with image preview before saving
- Dashboard detail pages (`/dashboard/appointments/[id]` and `/dashboard/bookings/[id]`)
- SEO metadata on all public pages (Open Graph, structured data)
- Google Maps real embed on Contact page
- WhatsApp floating button (visible on all pages on mobile)

### P2 — Future improvements
- Loyalty points / tier system (Gold tier is already shown in design)
- Online payment integration (Razorpay for advance deposits)
- SMS booking confirmation via Twilio or MSG91
- Admin revenue analytics (chart view, not just the single number)
- Multi-artist management (assign specific artists per appointment)
- Instagram feed embed (auto-pull from @sakshibeautyparlour)
- Customer reviews/ratings system
- Waitlist for fully-booked slots
- Multi-language support (Marathi/Hindi)
