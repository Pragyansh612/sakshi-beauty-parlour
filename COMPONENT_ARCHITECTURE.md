# Component Architecture — Sakshi Beauty Parlour

---

## Route Hierarchy

```
app/
├── layout.tsx                     # Root layout: fonts, metadata, Toaster
├── page.tsx                       # / (Home)
├── services/
│   └── page.tsx                   # /services
├── gallery/
│   └── page.tsx                   # /gallery
├── about/
│   └── page.tsx                   # /about
├── contact/
│   └── page.tsx                   # /contact
├── book/
│   └── page.tsx                   # /book (booking wizard)
├── login/
│   └── page.tsx                   # /login
├── dashboard/
│   ├── layout.tsx                 # Protected: redirect if not customer
│   ├── page.tsx                   # /dashboard
│   ├── appointments/
│   │   └── [id]/
│   │       └── page.tsx           # /dashboard/appointments/[id]
│   └── bookings/
│       └── [id]/
│           └── page.tsx           # /dashboard/bookings/[id]
└── admin/
    ├── layout.tsx                 # Protected: redirect if not admin. Sidebar layout.
    ├── page.tsx                   # /admin (redirect to /admin/dashboard)
    ├── dashboard/
    │   └── page.tsx               # /admin/dashboard
    ├── appointments/
    │   └── page.tsx               # /admin/appointments
    ├── bookings/
    │   └── page.tsx               # /admin/bookings
    ├── services/
    │   └── page.tsx               # /admin/services
    ├── gallery/
    │   └── page.tsx               # /admin/gallery
    └── slots/
        └── page.tsx               # /admin/slots
```

---

## Component Hierarchy

### Shared/Reusable Components (`components/`)

```
components/
├── ui/                            # shadcn/ui primitives (Button, Input, etc.)
├── layout/
│   ├── Navbar.tsx                 # [CLIENT] Sticky nav, active link detection, mobile hamburger
│   ├── Footer.tsx                 # [SERVER] Footer with 4-column grid
│   ├── MobileNav.tsx              # [CLIENT] Full-screen mobile nav drawer
│   └── FloatingBookCTA.tsx        # [CLIENT] Fixed bottom-right "Book" button (mobile)
├── shared/
│   ├── EyebrowLabel.tsx           # [SERVER] Monospace uppercase label (reused everywhere)
│   ├── ScriptHeading.tsx          # [SERVER] Heading with Dancing Script accent word
│   ├── SectionReveal.tsx          # [CLIENT] Wraps children in scroll-triggered fade-in
│   ├── StatusBadge.tsx            # [SERVER] Colored badge: Confirmed, Pending, etc.
│   ├── PriceBadge.tsx             # [SERVER] "Up to 20% off" green pill
│   └── Toaster.tsx                # [CLIENT] Toast notification provider (sonner or react-hot-toast)
└── forms/
    ├── ContactForm.tsx            # [CLIENT] Contact page form with Zod validation
    └── FormField.tsx              # [CLIENT] Label + Input/Textarea wrapper with error display
```

---

### Home Page (`/`)

```
HomePage                           [SERVER]
├── Navbar                         [CLIENT]
├── HeroSection                    [SERVER]
│   ├── HeroText
│   ├── HeroImage (Next/Image)
│   ├── HeroRatingCard             # "Rated 4.9★" floating card
│   └── HeroBridalBadge            # "Bridal Specialists" floating badge
├── TrustStrip                     [SERVER] # 4 trust markers between two <hr> rules
├── WhyChooseSection               [CLIENT] # SectionReveal wrapper + 6 feature cards
│   └── FeatureCard (×6)           [SERVER]
├── FeaturedServicesSection        [CLIENT] # SectionReveal + hover cards
│   └── ServiceHoverCard (×4)      [CLIENT] # Hover triggers price detail panel
├── BridalBannerSection            [CLIENT] # SectionReveal
├── GalleryPreviewSection          [CLIENT] # SectionReveal + horizontal scroll strip
│   └── GalleryPreviewTile (×4)    [SERVER] # Static placeholder or first 4 gallery images
├── TestimonialSection             [CLIENT] # SectionReveal
├── ContactCTASection              [CLIENT] # SectionReveal + 3 CTA buttons
└── Footer                         [SERVER]
```

**ServiceHoverCard** — client component because:
- On desktop: CSS hover triggers the `.fdetail` overlay (could be CSS-only)
- On mobile: tap toggles an accordion open/closed, requiring state
- Decision: make it client to handle both cases cleanly with a single component

---

### Services Page (`/services`)

```
ServicesPage                       [SERVER] # Fetches all categories + services from DB
├── Navbar                         [CLIENT]
├── ServicesHeader                 [SERVER]
├── FilterPills                    [CLIENT] # Scroll to section anchor; active state on scroll
├── ServiceCategoryBlock (×6)      [SERVER] # Each category: intro panel + subcards grid
│   ├── CategoryIntro
│   └── ServiceSubcardGrid
│       └── ServiceSubcard (×N)    [SERVER]
├── ComboOffersSection             [SERVER]
│   └── ComboCard (×4)             [SERVER]
├── ServicesCTAStrip               [SERVER]
└── Footer                         [SERVER]
```

Note: The Services page is entirely server-rendered (data from DB, no interactivity beyond anchor scrolling). `FilterPills` is the only client component — it manages active state and smooth-scrolls to sections.

---

### Gallery Page (`/gallery`)

```
GalleryPage                        [SERVER] # Fetches all gallery_images
├── Navbar                         [CLIENT]
├── GalleryHeader                  [SERVER]
├── GalleryFilterPills             [CLIENT] # Manages active filter, controls which tiles show
├── GalleryMasonry                 [CLIENT] # Filtered tile grid + lightbox state
│   ├── GalleryTile (×N)           [CLIENT] # Hover reveal caption; click opens lightbox
│   └── GalleryLightbox            [CLIENT] # Fixed overlay; focus trap; Escape to close
├── AchievementsSection            [SERVER] # 6 achievement cards (static content)
│   └── AchievementCard (×6)       [SERVER]
├── GalleryCTAStrip                [SERVER]
└── Footer                         [SERVER]
```

`GalleryPage` fetches all images server-side and passes them as props to `GalleryMasonry`. The client component handles filtering and lightbox state without additional fetches.

---

### About Page (`/about`)

```
AboutPage                          [SERVER]
├── Navbar                         [CLIENT]
├── AboutHero                      [SERVER] # Story text + founder portrait
├── StatsBand                      [SERVER] # 4 stats: 12+, 600+, 8k+, 4.9★
├── MissionVisionSection           [SERVER] # Two cards side by side
├── StandardsSection               [SERVER] # 3 numbered cards (Hygiene, Certified, Pricing)
├── CommitmentSection              [SERVER] # Image + text + CTAs
├── FounderQuote                   [SERVER]
└── Footer                         [SERVER]
```

Fully server-rendered. No interactivity.

---

### Contact Page (`/contact`)

```
ContactPage                        [SERVER]
├── Navbar                         [CLIENT]
├── ContactHeader                  [SERVER]
├── ContactCardsRow                [SERVER] # Call, WhatsApp, Social cards
├── ContactDetailsAndForm          [SERVER] # Grid: details + map + form
│   ├── StudioDetails              [SERVER] # Address, phone, email, hours
│   ├── MapPlaceholder             [SERVER] # Google Maps iframe embed
│   └── ContactForm                [CLIENT] # Form with Zod validation + Server Action
└── Footer                         [SERVER]
```

---

### Book Page (`/book`)

```
BookPage                           [SERVER] # Fetches: services (appointment + booking eligible),
│                                           # time slots for next 14 days (date + availability)
└── BookingWizard                  [CLIENT] # All wizard state lives here
    ├── ModeToggle                 [CLIENT] # Appointment vs Booking segment control
    ├── WizardStepper              [CLIENT] # Step indicator (active/done/future)
    ├── WizardPanel                [CLIENT] # Left panel: switches on step
    │   ├── Step1ServicePicker     [CLIENT] # Service list with selection state
    │   │   └── ServiceOption (×N)
    │   ├── Step2DatePicker        [CLIENT] # 14-day grid with selection state
    │   │   └── DayCard (×14)
    │   ├── Step3TimePicker        [CLIENT] # For Appointment mode: slot grid
    │   │   └── SlotButton (×20)
    │   ├── Step3Requirements      [CLIENT] # For Booking mode: form fields
    │   ├── Step4Review            [CLIENT] # Review table + confirm button
    │   │   └── ReviewRow (×5)
    │   └── WizardNav              [CLIENT] # Back / Continue buttons
    ├── BookingSummaryAside        [CLIENT] # Sticky right sidebar
    └── BookingSuccessScreen       [CLIENT] # Shown after confirm
```

**State management for BookingWizard**: All state is `useReducer` within the `BookingWizard` component. No Zustand or Context needed — the wizard is self-contained. State shape:
```typescript
type WizardState = {
  mode: 'appt' | 'book';
  step: 1 | 2 | 3 | 4;
  confirmed: boolean;
  selectedServiceId: string | null;
  selectedDateSlotDate: string | null; // ISO date string
  selectedTimeSlotId: string | null;   // For appointments
  requirements: {
    eventType: string;
    guestsCount: string;
    venue: string;
    styleNotes: string;
    wantsTrial: boolean;
  };
};
```

Confirm action calls a **Server Action** that inserts into `appointments` or `bookings` table.

---

### Login Page (`/login`)

```
LoginPage                          [SERVER] # Redirects to /dashboard if already logged in
└── AuthCard                       [CLIENT] # Manages Login/Register/Forgot tab state
    ├── AuthTabToggle              [CLIENT] # Login | Register pills
    ├── LoginForm                  [CLIENT] # Phone/email + password, Zod validation
    ├── RegisterForm               [CLIENT] # Full name, phone, email (opt), password
    └── ForgotPasswordForm         [CLIENT] # Phone/email → OTP flow
```

Left brand panel (`AuthBrandPanel`) is server-rendered (pure HTML/CSS, no interactivity).

---

### Customer Dashboard (`/dashboard`)

```
DashboardLayout                    [SERVER] # Auth guard: redirects non-customers to /login
DashboardPage                      [SERVER] # Fetches: appointments, bookings for auth user
├── Navbar                         [CLIENT] # Shows user avatar + sign out
├── DashboardGreeting              [SERVER] # "Hello, [name]"
├── DashboardStatStrip             [SERVER] # 4 stat cards
├── DashboardTabToggle             [CLIENT] # Appointments | Bookings
├── AppointmentsList               [CLIENT] # Shows when Appointments tab active
│   └── DashboardItemCard (×N)     [CLIENT] # View/Reschedule/Cancel actions
└── BookingsList                   [CLIENT] # Shows when Bookings tab active
    └── DashboardItemCard (×N)     [CLIENT]
```

`DashboardItemCard` — "Cancel" triggers a confirm prompt inline (small text below button that says "Are you sure?" with a Yes/No). Confirm calls a Server Action to set `cancelled_at`. "Reschedule" navigates to `/book?reschedule=[ref]`.

---

### Admin Layout (`/admin/*`)

```
AdminLayout                        [SERVER] # Auth guard: redirects non-admins
├── AdminSidebar                   [CLIENT] # Sticky; nav items with active state
└── [page content]
```

---

### Admin Dashboard (`/admin/dashboard`)

```
AdminDashboardPage                 [SERVER] # Fetches: today's appointments, recent activity, stats
├── AdminStatsGrid                 [SERVER] # 4 stat cards
├── TodayScheduleTable             [SERVER] # Today's appointments table
└── RecentActivityFeed             [SERVER] # List of recent events
```

---

### Admin Appointments (`/admin/appointments`)

```
AdminAppointmentsPage              [SERVER] # Initial data fetch
└── AppointmentsManager            [CLIENT] # Search, filter, table + drawer
    ├── AppointmentsToolbar        [CLIENT] # Search input + All/Today/Upcoming filter
    ├── AppointmentsTable          [CLIENT] # Sortable table with rows
    │   └── AppointmentRow (×N)    [CLIENT] # View/Edit/Cancel actions
    ├── RecordDrawer               [CLIENT] # Slide-in drawer (view or edit mode)
    └── DeleteConfirmModal         [CLIENT] # Centred modal for delete
```

---

### Admin Bookings (`/admin/bookings`)

```
AdminBookingsPage                  [SERVER] # Initial data fetch
└── BookingsManager                [CLIENT] # Search + card list + drawer
    ├── BookingsToolbar            [CLIENT] # Search + "New booking" button
    ├── BookingCardList            [CLIENT]
    │   └── AdminBookingCard (×N)  [CLIENT] # Approve/Manage/Delete actions
    ├── RecordDrawer               [CLIENT] # Shared with Appointments
    └── DeleteConfirmModal         [CLIENT] # Shared component
```

---

### Admin Services (`/admin/services`)

```
AdminServicesPage                  [SERVER] # Initial data fetch
└── ServicesManager                [CLIENT]
    ├── ServicesToolbar            [CLIENT] # Search + "Add service"
    ├── ServicesTable              [CLIENT]
    │   └── ServiceRow (×N)        [CLIENT]
    ├── RecordDrawer               [CLIENT]
    └── DeleteConfirmModal         [CLIENT]
```

---

### Admin Gallery (`/admin/gallery`)

```
AdminGalleryPage                   [SERVER] # Initial data fetch
└── GalleryManager                 [CLIENT]
    ├── GalleryTabToggle           [CLIENT] # Our Work | Achievements
    ├── GalleryUploadCard          [CLIENT] # Drag-and-drop uploader
    ├── GalleryGrid                [CLIENT]
    │   └── AdminGalleryCard (×N)  [CLIENT] # View/Edit/Delete per image
    ├── RecordDrawer               [CLIENT]
    └── DeleteConfirmModal         [CLIENT]
```

`GalleryUploadCard` uses the Supabase Storage JS SDK to upload directly from the browser to the `gallery` bucket, then calls a Server Action to create the `gallery_images` row.

---

### Admin Slots (`/admin/slots`)

```
AdminSlotsPage                     [SERVER] # Fetches week of slots
└── SlotsManager                   [CLIENT]
    ├── WeekNavigator              [CLIENT] # Prev/Next week controls
    ├── SlotGrid                   [CLIENT] # 7 columns × 20 rows
    │   └── SlotCell               [CLIENT] # Open/Full/Blocked; click to toggle block
    └── AddSlotModal               [CLIENT] # Create new slot(s)
```

---

## Shared Components Detail

### `RecordDrawer` (admin shared)
Used across Appointments, Bookings, Services, Gallery management. Props:
- `isOpen: boolean`
- `mode: 'view' | 'edit'`
- `title: string`
- `kind: string` (e.g. "Appointment", "Service")
- `fields: { label: string; value: string; key: string }[]`
- `onClose: () => void`
- `onSave: (draft: Record<string, string>) => void`

### `DeleteConfirmModal` (admin shared)
- `isOpen: boolean`
- `itemName: string`
- `itemKind: string`
- `onConfirm: () => void`
- `onCancel: () => void`

### `StatusBadge`
Maps status strings to Tailwind color classes:
- `confirmed` → green background
- `pending` / `pending_approval` → amber background
- `in_progress` / `in_chair` / `checked_in` → blue background
- `cancelled` / `no_show` → red background
- `draft` → grey background
- `completed` → dark background

---

## State Management Approach

**No global state library needed.** This is a modest application.

| Layer | Tool |
|---|---|
| Server data (public pages) | Next.js `fetch` with `cache` options |
| Server data (protected pages) | Supabase JS SDK in Server Components |
| Wizard/booking state | `useReducer` inside `BookingWizard` |
| Auth state | Supabase Auth `onAuthStateChange` + `useContext` via a thin `AuthProvider` |
| Admin panel panel state | `useState` within each Manager component |
| Filter/tab state | `useState` in the specific component that owns it |
| Toasts | Global `Toaster` in root layout; called via `toast()` from `sonner` |

**`AuthProvider`** (thin wrapper):
```typescript
// Reads from Supabase session; provides { user, profile, isAdmin }
// Wrapped around the root layout; updates on auth state changes
```

---

## Form Handling

All forms use **Zod** for validation. Pattern:

1. Define a Zod schema (e.g. `ContactFormSchema`)
2. Use `react-hook-form` + `@hookform/resolvers/zod`
3. On submit: call a **Server Action** (not a Route Handler) for mutations
4. Server Action validates again server-side with the same Zod schema
5. Return `{ success: boolean; error?: string }` to the client
6. Client shows toast on success, inline error on failure

### Form schemas

```typescript
// Login
const LoginSchema = z.object({
  identifier: z.string().min(1, 'Enter phone or email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Register
const RegisterSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  phone: z.string().regex(/^\+?[6-9]\d{9}$/, 'Enter a valid Indian phone number'),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Contact form
const ContactFormSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\+?[6-9]\d{9}$/),
  service_interest: z.string().optional(),
  message: z.string().min(10, 'Please write a brief message'),
});

// Booking requirements (Step 3 of Booking mode)
const BookingRequirementsSchema = z.object({
  event_type: z.string().min(1, 'Enter event type'),
  guests_count: z.string().min(1),
  venue: z.string().min(1),
  style_notes: z.string().optional(),
  wants_trial: z.boolean(),
});
```

---

## Animation Components

### SectionReveal
Wraps a section in a Framer Motion `motion.div` that fades + slides up when the element enters the viewport. Uses `whileInView` + `viewport={{ once: true }}`.

```typescript
// Mirrors the design's @supports animation-timeline:view() behaviour
// but uses Framer Motion for broader browser support
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-10% 0px' }}
  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
>
  {children}
</motion.div>
```

### GalleryMasonry (filter animation)
When filter changes, Framer Motion `AnimatePresence` + `layout` on each tile handles the enter/exit/reflow gracefully.

```typescript
<AnimatePresence mode="popLayout">
  {filteredTiles.map(tile => (
    <motion.div key={tile.id} layout exit={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <GalleryTile {...tile} />
    </motion.div>
  ))}
</AnimatePresence>
```

### GalleryLightbox
Framer Motion `AnimatePresence` for the overlay:
- Backdrop fades in
- Card scales from 0.92 to 1 with fade
- Exit: reverse

### ServiceHoverCard (desktop price panel)
On desktop: CSS `opacity/visibility/transform` transition (no JS, better performance).
On mobile: Framer Motion `AnimatePresence` for the accordion expand/collapse.

### RecordDrawer (admin)
Framer Motion `AnimatePresence` + slide from right:
```typescript
initial={{ x: '100%' }}
animate={{ x: 0 }}
exit={{ x: '100%' }}
transition={{ type: 'spring', damping: 30, stiffness: 300 }}
```

### DeleteConfirmModal
Framer Motion scale + fade:
```typescript
initial={{ scale: 0.92, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.92, opacity: 0 }}
```

### WizardStepper
Step transitions use Framer Motion `AnimatePresence` to cross-fade between step panels:
```typescript
<AnimatePresence mode="wait">
  <motion.div key={step}
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.2 }}
  >
    {stepContent}
  </motion.div>
</AnimatePresence>
```

---

## Loading, Success, and Error States

| Scenario | Loading | Success | Error |
|---|---|---|---|
| Page data fetch (Server Component) | Next.js `loading.tsx` skeleton | Page renders | `error.tsx` boundary |
| Contact form submit | Button spinner, disabled | Toast "Message sent! We'll be in touch." | Inline error under field or toast |
| Booking confirm | Button spinner, disabled | Navigate to success screen within wizard | Toast "Something went wrong. Please try again." |
| Login | Button spinner | Redirect to /dashboard | Error message under form |
| Register | Button spinner | Redirect to /dashboard | Error under relevant field |
| Admin: save changes (drawer) | Button spinner | Toast "Changes saved." + drawer closes | Toast "Failed to save. Check your input." |
| Admin: delete | Button spinner | Toast "[Item] deleted." + row removed | Toast "Failed to delete. Try again." |
| Admin: upload image | Progress bar in upload card | Card appears in grid | Toast "Upload failed. Try a different file." |
| Cancel appointment/booking (dashboard) | Inline spinner next to cancel button | Status badge updates to "Cancelled" in place | Toast "Couldn't cancel. Please contact us." |
| Admin slot toggle (open/block) | Cell shows brief spinner | Cell updates color immediately (optimistic) | Revert + toast |

### Skeleton loading states
Each page with a `loading.tsx` shows a skeleton that mirrors the page's layout:
- Home: Hero skeleton + 6 card skeletons
- Services: Category block skeletons
- Gallery: Masonry skeleton tiles (fixed heights, matching design tile heights)
- Dashboard: 4 stat card skeletons + 3 item card skeletons

---

## Toast Notification Strategy

Using **Sonner** (clean, minimal toasts — matches the design's premium aesthetic).

Configured in root `layout.tsx`:
```tsx
<Toaster position="bottom-right" richColors />
```

Toast categories and styling:
- `toast.success()` — green, for confirms/saves
- `toast.error()` — red, for failures
- `toast.info()` — for neutral info (e.g. "Reschedule request sent")
- Duration: 4 seconds default

Toast is never used as a replacement for inline form validation — errors at the field level remain inline. Toast is only for async action results.

---

## Data Flow Diagram

```
                          ┌─────────────────────────────┐
                          │   Supabase (Postgres + Auth) │
                          └──────────────┬───────────────┘
                                         │ SDK
                    ┌────────────────────┼─────────────────────────┐
                    │                    │                          │
          ┌─────────▼──────────┐  ┌──────▼────────────┐  ┌────────▼────────┐
          │  Server Components │  │  Server Actions   │  │  Route Handlers │
          │  (data fetching)   │  │  (mutations)      │  │  (webhooks/API) │
          └─────────┬──────────┘  └──────┬────────────┘  └─────────────────┘
                    │                    │
          ┌─────────▼────────────────────▼──────┐
          │          Client Components            │
          │  (interactivity, forms, animations)   │
          └──────────────────────────────────────┘
                    │
          ┌─────────▼──────────┐
          │   User (Browser)   │
          └────────────────────┘

Data fetch path (read):
  User visits /gallery
  → Server Component fetches gallery_images via Supabase SDK (server-side)
  → HTML rendered with images on server
  → GalleryMasonry (client) receives images as props
  → Filter state lives in client; no additional fetches on filter change

Mutation path (write):
  User submits Contact Form
  → react-hook-form validates with Zod (client)
  → Server Action called
  → Server Action validates again with Zod (server)
  → Supabase insert into contact_messages
  → Returns { success: true }
  → toast.success() shown

Auth path:
  User logs in on /login
  → LoginForm calls Supabase signInWithPassword (client SDK)
  → Supabase sets session cookie (managed by @supabase/ssr)
  → Next.js middleware reads session cookie on subsequent requests
  → Middleware checks profile.role for protected routes
  → Server Components access session via createServerClient()
```

---

## Server Components vs Client Components — Decision per Feature

| Component/Feature | Server or Client | Reason |
|---|---|---|
| Home page, About, Services (static content) | Server | No interactivity; benefits from RSC streaming |
| Gallery page (image list) | Server (fetch) → Client (filter + lightbox) | Initial data is server-fetched; filter/lightbox need client state |
| Navbar | Client | Active link detection (`usePathname`), mobile drawer toggle |
| Footer | Server | Pure static HTML |
| Service hover cards | Client | Mobile accordion toggle requires state |
| Booking wizard | Client | Complex multi-step state; progressive form |
| Login/Register forms | Client | Form state, validation, auth SDK calls |
| Customer Dashboard tabs | Client | Tab state and item list derived from props |
| Admin sidebar | Client | Active nav item (`usePathname`) |
| Admin tables/lists | Client | Search/filter state, drawer/modal state |
| Admin slot grid | Client | Optimistic toggle, week navigation |
| ContactForm | Client | Form state + Server Action call |
| SectionReveal | Client | Framer Motion `whileInView` requires browser |
| Status badges | Server | Pure rendering, no interactivity |
