# Database Design — Sakshi Beauty Parlour (Supabase / PostgreSQL)

---

## Design Principles
- Every table has RLS enabled. No table is left open.
- The `profiles` table is the source of truth for roles. No environment variable admin secrets.
- Prices are stored in integer paise (₹1 = 100 paise) to avoid floating-point issues. Display layer divides by 100.
- Timestamps are `timestamptz` (timezone-aware). The app operates in IST (UTC+5:30).
- Soft-delete is not used for most tables — real delete with cascade. Exception: `appointments` and `bookings` keep a `cancelled_at` timestamp for history.

---

## Table Overview

```
profiles
services
  └── service_categories (FK)
combo_offers
  └── combo_offer_items (FK → services)
time_slots
appointments
  └── profiles (FK: customer)
  └── services (FK)
  └── time_slots (FK)
bookings
  └── profiles (FK: customer)
  └── services (FK)
gallery_images
contact_messages
```

---

## Tables

### `profiles`
Extends Supabase's `auth.users`. One row per user. Created automatically via trigger on `auth.users` insert.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, references `auth.users(id)` |
| `full_name` | `text` | Not null |
| `phone` | `text` | Not null, unique. Primary login identifier. |
| `email` | `text` | Nullable. Supplementary. |
| `role` | `text` | Not null, default `'customer'`. Check: `('customer', 'admin')` |
| `avatar_url` | `text` | Nullable. Supabase Storage URL. |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

**Why**: Supabase Auth stores login credentials in `auth.users`. We extend it with the `profiles` table for app-level data. The `role` column here (not an env variable) is the single source of truth for access control across all RLS policies and middleware checks.

---

### `service_categories`
Organizes services into the 6 categories shown in the design.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | Not null, unique. E.g. "Hair Care", "Bridal & Event Makeup" |
| `slug` | `text` | Not null, unique. E.g. "hair", "bridal". Used for anchor links. |
| `description` | `text` | Short descriptor |
| `icon_shape` | `text` | CSS border-radius descriptor for the decorative shape. Nullable. |
| `display_order` | `integer` | Not null, default 0. Controls render order. |
| `created_at` | `timestamptz` | Default `now()` |

**Why**: The Services page renders 6 distinct category blocks with distinct icons and layouts. A `service_categories` table means admin can reorder them without a deployment.

---

### `services`
Individual treatments and services. Each belongs to one category and has a price range.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `category_id` | `uuid` | FK → `service_categories(id)`, not null |
| `sub_category` | `text` | E.g. "Hair Treatment", "Facials", "Threading". Groups items within a category card. |
| `name` | `text` | Not null. E.g. "Hydra Facial" |
| `description` | `text` | Short description shown in booking flow |
| `duration_minutes` | `integer` | Null for bookings (full-day/multi-session). Present for appointments. |
| `duration_label` | `text` | Display string: "45 min", "Full day", "Multi-session" |
| `price_from` | `integer` | Not null. Minimum price in paise. |
| `price_to` | `integer` | Nullable. Maximum price in paise. Null = fixed price. |
| `is_appointment_eligible` | `boolean` | Not null, default `false`. True = shows in appointment booking flow. |
| `is_booking_eligible` | `boolean` | Not null, default `false`. True = shows in bridal/event booking flow. |
| `status` | `text` | Not null, default `'active'`. Check: `('active', 'draft', 'archived')` |
| `display_order` | `integer` | Not null, default 0. Order within sub-category. |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

**Why**: The `is_appointment_eligible` / `is_booking_eligible` flags solve the design's two-mode booking flow cleanly — the 5 appointment services and 3 booking services are not separate tables, just filtered views of this one. Admin can change which services appear in which flow without code changes.

---

### `combo_offers`
The 4 combo packages shown on the Services page.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | Not null. E.g. "Bridal Bliss" |
| `tag_line` | `text` | E.g. "Bridal favourite", "Most popular" |
| `price` | `integer` | Not null. Package price in paise. |
| `price_original` | `integer` | Not null. Crossed-out original price in paise. |
| `save_percent` | `integer` | Not null. E.g. 25, 27. Shown in the "Save X%" badge. |
| `is_featured` | `boolean` | Not null, default `false`. True = dark card variant (Bridal Bliss). |
| `status` | `text` | Not null, default `'active'`. Check: `('active', 'draft')` |
| `display_order` | `integer` | Not null, default 0 |
| `created_at` | `timestamptz` | Default `now()` |

**Why**: The 4 combo packages each have their own price, items, and styling. A separate table lets admin add/edit/remove packages without touching code.

---

### `combo_offer_items`
Junction table linking combos to their constituent services.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `combo_id` | `uuid` | FK → `combo_offers(id)`, not null |
| `description` | `text` | Not null. Display label. E.g. "Full-body Massage" |
| `display_order` | `integer` | Not null, default 0 |

**Why**: Each combo lists its included items as bullet points. Storing them here allows flexible editing. We store `description` as text (not a FK to `services`) because the display label often differs from the service name (e.g. "4 Skin Sessions" is not a single service).

---

### `time_slots`
Each row represents a specific date + time slot that the admin has made available. This is the availability calendar.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `slot_date` | `date` | Not null. The calendar day. |
| `slot_time` | `time` | Not null. The start time. E.g. `11:00:00` |
| `status` | `text` | Not null, default `'open'`. Check: `('open', 'blocked')` |
| `created_at` | `timestamptz` | Default `now()` |

**Unique constraint**: `(slot_date, slot_time)` — one slot per date/time combination.

**Why**: Admin creates slots weekly in advance. The booking flow queries this table to show available times for a chosen date. Slots do not exist for unavailable days (e.g. if the salon is closed for a special reason, admin simply does not create slots for that day, or blocks existing ones).

**Note on capacity**: A slot is considered "fully booked" when it has at least one confirmed appointment against it. For simplicity (single-chair salon or the system doesn't track chairs), a slot becomes unavailable once booked. If the salon has multiple artists and can take concurrent bookings in the same slot, a `capacity` column can be added in P1.

---

### `appointments`
An appointment is a customer booking against a specific time slot.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `reference` | `text` | Not null, unique. Generated: "AP-" + sequential number. E.g. "AP-2041" |
| `customer_id` | `uuid` | FK → `profiles(id)`, not null |
| `service_id` | `uuid` | FK → `services(id)`, not null |
| `slot_id` | `uuid` | FK → `time_slots(id)`, not null |
| `artist` | `text` | Nullable. Assigned by admin. Default "Any available". |
| `status` | `text` | Not null, default `'pending'`. Check: `('pending', 'confirmed', 'checked_in', 'in_chair', 'completed', 'cancelled', 'no_show')` |
| `notes` | `text` | Nullable. Customer notes or admin notes. |
| `confirmed_at` | `timestamptz` | Nullable. When admin confirmed. |
| `cancelled_at` | `timestamptz` | Nullable. If cancelled. |
| `cancellation_reason` | `text` | Nullable. |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

**Why**: A full status lifecycle matches the admin dashboard design (Confirmed, Checked in, In chair, Upcoming). The `cancelled_at` approach preserves history without soft-delete complexity.

---

### `bookings`
A booking is a customer request for a bridal/event service. No specific time slot — just a date and detailed requirements.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `reference` | `text` | Not null, unique. Generated: "BK-" + sequential number. E.g. "BK-1180" |
| `customer_id` | `uuid` | FK → `profiles(id)`, not null |
| `service_id` | `uuid` | FK → `services(id)`, not null |
| `event_date` | `date` | Not null. The date of the event/wedding. |
| `event_type` | `text` | Nullable. E.g. "Wedding", "Reception", "Sangeet" |
| `guests_count` | `text` | Nullable. E.g. "Bride + 3 guests" |
| `venue` | `text` | Nullable. Venue name/location |
| `style_notes` | `text` | Nullable. Preferred style, references, timings |
| `wants_trial` | `boolean` | Not null, default `false` |
| `artist` | `text` | Nullable. Assigned by admin. |
| `agreed_price` | `integer` | Nullable. Price agreed after consultation, in paise. |
| `status` | `text` | Not null, default `'pending_approval'`. Check: `('pending_approval', 'confirmed', 'in_progress', 'completed', 'cancelled')` |
| `sessions_total` | `integer` | Nullable. For multi-session packages like Pre-Bridal. |
| `sessions_completed` | `integer` | Not null, default `0`. |
| `admin_notes` | `text` | Nullable. Internal notes, not visible to customer. |
| `confirmed_at` | `timestamptz` | Nullable. |
| `cancelled_at` | `timestamptz` | Nullable. |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

**Why**: The design distinguishes bookings from appointments clearly. The `sessions_total`/`sessions_completed` columns support the "Pre-Bridal Package" (5 sessions, 2 of 5 done) shown in the dashboard. `agreed_price` is separate from the service's price range because bridal pricing is negotiated.

---

### `gallery_images`
Images in both the "Our Work" and "Achievements" sections.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `title` | `text` | Not null. E.g. "Royal bridal look" |
| `category` | `text` | Not null. E.g. "Bridal transformations", "Hair coloring results" |
| `tag` | `text` | Not null. Short label shown as overlay. E.g. "Bridal", "Hair colour" |
| `section` | `text` | Not null. Check: `('work', 'achievement')` |
| `storage_path` | `storage_path` | Not null. Path in Supabase Storage bucket. |
| `alt_text` | `text` | Nullable. For accessibility. |
| `display_order` | `integer` | Not null, default 0. Controls masonry order. |
| `created_at` | `timestamptz` | Default `now()` |

**Note**: `storage_path` is `text` type. The full public URL is derived at runtime using the Supabase Storage SDK.

**Gallery filter categories** (from design):
- Bridal transformations
- Party makeup
- Hair coloring results
- Hair styling
- Hair spa treatments
- Skin treatment results

**Why**: The `section` column splits "Our Work" (customer portfolio) from "Achievements" (certificates, events, workshops). These map to the `work/` and `acheivement/` image folders.

---

### `contact_messages`
Submissions from the Contact page form.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | Not null |
| `phone` | `text` | Not null |
| `service_interest` | `text` | Nullable. E.g. "Bridal makeup, facial, hair…" |
| `message` | `text` | Not null |
| `is_read` | `boolean` | Not null, default `false` |
| `created_at` | `timestamptz` | Default `now()` |

---

## Indexes

```sql
-- profiles
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_role ON profiles(role);

-- services
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_appointment_eligible ON services(is_appointment_eligible) WHERE is_appointment_eligible = true;
CREATE INDEX idx_services_booking_eligible ON services(is_booking_eligible) WHERE is_booking_eligible = true;

-- time_slots
CREATE INDEX idx_time_slots_date ON time_slots(slot_date);
CREATE INDEX idx_time_slots_date_status ON time_slots(slot_date, status);

-- appointments
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_slot_id ON appointments(slot_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);
CREATE UNIQUE INDEX idx_appointments_reference ON appointments(reference);

-- bookings
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE UNIQUE INDEX idx_bookings_reference ON bookings(reference);

-- gallery_images
CREATE INDEX idx_gallery_images_section ON gallery_images(section);
CREATE INDEX idx_gallery_images_category ON gallery_images(category);
```

---

## Row Level Security (RLS)

Every table has RLS enabled (`ALTER TABLE t ENABLE ROW LEVEL SECURITY`). Policies follow.

### Helper functions

```sql
-- Returns true if the calling user has role = 'admin'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

### `profiles`

**Who can read**: A customer can read only their own profile. Admin can read all profiles.
**Who can insert**: Only the Supabase trigger (via `SECURITY DEFINER` function) can insert on registration. Users cannot self-insert.
**Who can update**: A customer can update their own non-role fields. Admin can update any profile including `role`.
**Who can delete**: Admin only.

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Customer reads own profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admin reads all profiles
CREATE POLICY "profiles_select_admin"
ON profiles FOR SELECT
USING (is_admin());

-- Customer updates own profile (cannot change role)
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admin updates any profile (including role)
CREATE POLICY "profiles_update_admin"
ON profiles FOR UPDATE
USING (is_admin());

-- Admin deletes profiles
CREATE POLICY "profiles_delete_admin"
ON profiles FOR DELETE
USING (is_admin());
```

Note: INSERT is handled by a `SECURITY DEFINER` trigger function that runs as a privileged role, bypassing RLS. This is the standard Supabase pattern for syncing `auth.users` to `profiles`.

---

### `service_categories`

**Who can read**: Everyone (public, no auth needed) — these are the service category labels on the Services page.
**Who can insert/update/delete**: Admin only.

```sql
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_categories_select_all"
ON service_categories FOR SELECT
USING (true);

CREATE POLICY "service_categories_insert_admin"
ON service_categories FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "service_categories_update_admin"
ON service_categories FOR UPDATE
USING (is_admin());

CREATE POLICY "service_categories_delete_admin"
ON service_categories FOR DELETE
USING (is_admin());
```

---

### `services`

**Who can read**: Everyone can read active services. Admin can read all (including drafts/archived).
**Who can insert/update/delete**: Admin only.

```sql
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public reads active services only
CREATE POLICY "services_select_active"
ON services FOR SELECT
USING (status = 'active');

-- Admin reads all services (overrides above for admins)
CREATE POLICY "services_select_admin"
ON services FOR SELECT
USING (is_admin());

CREATE POLICY "services_insert_admin"
ON services FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "services_update_admin"
ON services FOR UPDATE
USING (is_admin());

CREATE POLICY "services_delete_admin"
ON services FOR DELETE
USING (is_admin());
```

---

### `combo_offers` and `combo_offer_items`

**Who can read**: Everyone (public — shown on the Services page).
**Who can insert/update/delete**: Admin only.

```sql
ALTER TABLE combo_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_offer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "combo_offers_select_all" ON combo_offers FOR SELECT USING (true);
CREATE POLICY "combo_offers_insert_admin" ON combo_offers FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "combo_offers_update_admin" ON combo_offers FOR UPDATE USING (is_admin());
CREATE POLICY "combo_offers_delete_admin" ON combo_offers FOR DELETE USING (is_admin());

CREATE POLICY "combo_offer_items_select_all" ON combo_offer_items FOR SELECT USING (true);
CREATE POLICY "combo_offer_items_insert_admin" ON combo_offer_items FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "combo_offer_items_update_admin" ON combo_offer_items FOR UPDATE USING (is_admin());
CREATE POLICY "combo_offer_items_delete_admin" ON combo_offer_items FOR DELETE USING (is_admin());
```

---

### `time_slots`

**Who can read**: Anyone authenticated can read open slots (to check availability for booking). Anon users can also read open slots (for the public booking form which may be used before login). Admin can read all slots including blocked ones.
**Who can insert/update/delete**: Admin only.

```sql
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Public (including anon) reads open slots only
CREATE POLICY "time_slots_select_open"
ON time_slots FOR SELECT
USING (status = 'open');

-- Admin reads all slots
CREATE POLICY "time_slots_select_admin"
ON time_slots FOR SELECT
USING (is_admin());

CREATE POLICY "time_slots_insert_admin"
ON time_slots FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "time_slots_update_admin"
ON time_slots FOR UPDATE
USING (is_admin());

CREATE POLICY "time_slots_delete_admin"
ON time_slots FOR DELETE
USING (is_admin());
```

---

### `appointments`

**Who can read**: A customer reads only their own appointments. Admin reads all.
**Who can insert**: An authenticated customer can insert their own appointment (customer_id must equal auth.uid()). Admin can also insert (for manual bookings).
**Who can update**: A customer can update their own appointment's `status` only (e.g. to cancel, set `cancelled_at`). Admin can update all fields.
**Who can delete**: Admin only.

```sql
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Customer reads own appointments
CREATE POLICY "appointments_select_own"
ON appointments FOR SELECT
USING (auth.uid() = customer_id);

-- Admin reads all appointments
CREATE POLICY "appointments_select_admin"
ON appointments FOR SELECT
USING (is_admin());

-- Customer inserts own appointment
CREATE POLICY "appointments_insert_own"
ON appointments FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Admin inserts any appointment
CREATE POLICY "appointments_insert_admin"
ON appointments FOR INSERT
WITH CHECK (is_admin());

-- Customer can cancel own appointment (only update cancelled_at and status)
-- Note: more granular column-level restriction is handled in the Server Action
CREATE POLICY "appointments_update_own"
ON appointments FOR UPDATE
USING (auth.uid() = customer_id AND status NOT IN ('completed', 'no_show'));

-- Admin updates any appointment
CREATE POLICY "appointments_update_admin"
ON appointments FOR UPDATE
USING (is_admin());

-- Admin deletes appointments
CREATE POLICY "appointments_delete_admin"
ON appointments FOR DELETE
USING (is_admin());
```

---

### `bookings`

**Who can read**: A customer reads only their own bookings. Admin reads all.
**Who can insert**: An authenticated customer can insert their own booking. Admin can insert.
**Who can update**: A customer can cancel (update status/cancelled_at). Admin can update all fields.
**Who can delete**: Admin only.

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_own"
ON bookings FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "bookings_select_admin"
ON bookings FOR SELECT
USING (is_admin());

CREATE POLICY "bookings_insert_own"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "bookings_insert_admin"
ON bookings FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "bookings_update_own"
ON bookings FOR UPDATE
USING (auth.uid() = customer_id AND status NOT IN ('completed'));

CREATE POLICY "bookings_update_admin"
ON bookings FOR UPDATE
USING (is_admin());

CREATE POLICY "bookings_delete_admin"
ON bookings FOR DELETE
USING (is_admin());
```

---

### `gallery_images`

**Who can read**: Everyone (public) — the Gallery page is fully public.
**Who can insert/update/delete**: Admin only.

```sql
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_images_select_all"
ON gallery_images FOR SELECT
USING (true);

CREATE POLICY "gallery_images_insert_admin"
ON gallery_images FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "gallery_images_update_admin"
ON gallery_images FOR UPDATE
USING (is_admin());

CREATE POLICY "gallery_images_delete_admin"
ON gallery_images FOR DELETE
USING (is_admin());
```

---

### `contact_messages`

**Who can read**: Admin only.
**Who can insert**: Anyone (anon or authenticated) can submit a contact form.
**Who can update**: Admin only (to mark as read).
**Who can delete**: Admin only.

```sql
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_insert_all"
ON contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "contact_messages_select_admin"
ON contact_messages FOR SELECT
USING (is_admin());

CREATE POLICY "contact_messages_update_admin"
ON contact_messages FOR UPDATE
USING (is_admin());

CREATE POLICY "contact_messages_delete_admin"
ON contact_messages FOR DELETE
USING (is_admin());
```

---

## Supabase Storage Buckets

Two public buckets:

| Bucket | Purpose | Contents |
|---|---|---|
| `gallery` | Gallery images | Seeded from `./work/` and `./acheivement/` |
| `avatars` | Customer profile photos | Optional, future use |

Gallery bucket folder structure:
```
gallery/
  work/
    IMG_20260119_133106.jpg
    IMG_20260119_133218.jpg
    IMG_20260119_133251.jpg
    IMG_20260119_133440.jpg
    IMG_20260119_134338.jpg
    IMG_20260119_134354.jpg
    IMG-20260607-WA0001.jpg
    IMG-20260607-WA0004.jpg
  achievement/
    FB_IMG_1782645430924.jpg
    IMG_1233.jpg   (converted from HEIC)
    ... (19 HEIC → JPG conversions)
```

Storage RLS policies:
- `gallery` bucket: Public read (anonymous). Admin write/delete.
- `avatars` bucket: Owner read+write their own file. Admin read all.

---

## Schema SQL

```sql
-- =========================================================
-- EXTENSIONS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- HELPER
-- =========================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text        NOT NULL,
  phone       text        NOT NULL UNIQUE,
  email       text,
  role        text        NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_role  ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin"  ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "profiles_update_own"    ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "profiles_update_admin"  ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "profiles_delete_admin"  ON profiles FOR DELETE USING (is_admin());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =========================================================
-- SERVICE CATEGORIES
-- =========================================================
CREATE TABLE service_categories (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL UNIQUE,
  slug          text        NOT NULL UNIQUE,
  description   text,
  icon_shape    text,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_categories_select_all"   ON service_categories FOR SELECT USING (true);
CREATE POLICY "service_categories_insert_admin" ON service_categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "service_categories_update_admin" ON service_categories FOR UPDATE USING (is_admin());
CREATE POLICY "service_categories_delete_admin" ON service_categories FOR DELETE USING (is_admin());

-- =========================================================
-- SERVICES
-- =========================================================
CREATE TABLE services (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id             uuid        NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
  sub_category            text,
  name                    text        NOT NULL,
  description             text,
  duration_minutes        integer,
  duration_label          text,
  price_from              integer     NOT NULL,
  price_to                integer,
  is_appointment_eligible boolean     NOT NULL DEFAULT false,
  is_booking_eligible     boolean     NOT NULL DEFAULT false,
  status                  text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  display_order           integer     NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_category_id          ON services(category_id);
CREATE INDEX idx_services_status               ON services(status);
CREATE INDEX idx_services_appointment_eligible ON services(is_appointment_eligible) WHERE is_appointment_eligible = true;
CREATE INDEX idx_services_booking_eligible     ON services(is_booking_eligible) WHERE is_booking_eligible = true;

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_select_active" ON services FOR SELECT USING (status = 'active');
CREATE POLICY "services_select_admin"  ON services FOR SELECT USING (is_admin());
CREATE POLICY "services_insert_admin"  ON services FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "services_update_admin"  ON services FOR UPDATE USING (is_admin());
CREATE POLICY "services_delete_admin"  ON services FOR DELETE USING (is_admin());

-- =========================================================
-- COMBO OFFERS
-- =========================================================
CREATE TABLE combo_offers (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  tag_line        text,
  price           integer     NOT NULL,
  price_original  integer     NOT NULL,
  save_percent    integer     NOT NULL,
  is_featured     boolean     NOT NULL DEFAULT false,
  status          text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  display_order   integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE combo_offer_items (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id      uuid    NOT NULL REFERENCES combo_offers(id) ON DELETE CASCADE,
  description   text    NOT NULL,
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE combo_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "combo_offers_select_all"   ON combo_offers FOR SELECT USING (true);
CREATE POLICY "combo_offers_insert_admin" ON combo_offers FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "combo_offers_update_admin" ON combo_offers FOR UPDATE USING (is_admin());
CREATE POLICY "combo_offers_delete_admin" ON combo_offers FOR DELETE USING (is_admin());

ALTER TABLE combo_offer_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "combo_offer_items_select_all"   ON combo_offer_items FOR SELECT USING (true);
CREATE POLICY "combo_offer_items_insert_admin" ON combo_offer_items FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "combo_offer_items_update_admin" ON combo_offer_items FOR UPDATE USING (is_admin());
CREATE POLICY "combo_offer_items_delete_admin" ON combo_offer_items FOR DELETE USING (is_admin());

-- =========================================================
-- TIME SLOTS
-- =========================================================
CREATE TABLE time_slots (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date   date        NOT NULL,
  slot_time   time        NOT NULL,
  status      text        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'blocked')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slot_date, slot_time)
);

CREATE INDEX idx_time_slots_date        ON time_slots(slot_date);
CREATE INDEX idx_time_slots_date_status ON time_slots(slot_date, status);

ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "time_slots_select_open"  ON time_slots FOR SELECT USING (status = 'open');
CREATE POLICY "time_slots_select_admin" ON time_slots FOR SELECT USING (is_admin());
CREATE POLICY "time_slots_insert_admin" ON time_slots FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "time_slots_update_admin" ON time_slots FOR UPDATE USING (is_admin());
CREATE POLICY "time_slots_delete_admin" ON time_slots FOR DELETE USING (is_admin());

-- =========================================================
-- APPOINTMENTS
-- =========================================================
CREATE TABLE appointments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           text        NOT NULL UNIQUE,
  customer_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  service_id          uuid        NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  slot_id             uuid        NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
  artist              text,
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','confirmed','checked_in','in_chair','completed','cancelled','no_show')),
  notes               text,
  confirmed_at        timestamptz,
  cancelled_at        timestamptz,
  cancellation_reason text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_slot_id     ON appointments(slot_id);
CREATE INDEX idx_appointments_status      ON appointments(status);
CREATE INDEX idx_appointments_created_at  ON appointments(created_at DESC);
CREATE UNIQUE INDEX idx_appointments_reference ON appointments(reference);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_select_own"   ON appointments FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "appointments_select_admin" ON appointments FOR SELECT USING (is_admin());
CREATE POLICY "appointments_insert_own"   ON appointments FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "appointments_insert_admin" ON appointments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "appointments_update_own"   ON appointments FOR UPDATE
  USING (auth.uid() = customer_id AND status NOT IN ('completed','no_show'));
CREATE POLICY "appointments_update_admin" ON appointments FOR UPDATE USING (is_admin());
CREATE POLICY "appointments_delete_admin" ON appointments FOR DELETE USING (is_admin());

-- Auto-generate reference number
CREATE OR REPLACE FUNCTION generate_appointment_reference()
RETURNS trigger AS $$
BEGIN
  NEW.reference := 'AP-' || lpad(nextval('appointment_ref_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE appointment_ref_seq START 2000;
CREATE TRIGGER set_appointment_reference
  BEFORE INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION generate_appointment_reference();

-- =========================================================
-- BOOKINGS
-- =========================================================
CREATE TABLE bookings (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           text        NOT NULL UNIQUE,
  customer_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  service_id          uuid        NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  event_date          date        NOT NULL,
  event_type          text,
  guests_count        text,
  venue               text,
  style_notes         text,
  wants_trial         boolean     NOT NULL DEFAULT false,
  artist              text,
  agreed_price        integer,
  status              text        NOT NULL DEFAULT 'pending_approval'
                                  CHECK (status IN ('pending_approval','confirmed','in_progress','completed','cancelled')),
  sessions_total      integer,
  sessions_completed  integer     NOT NULL DEFAULT 0,
  admin_notes         text,
  confirmed_at        timestamptz,
  cancelled_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_event_date  ON bookings(event_date);
CREATE INDEX idx_bookings_status      ON bookings(status);
CREATE INDEX idx_bookings_created_at  ON bookings(created_at DESC);
CREATE UNIQUE INDEX idx_bookings_reference ON bookings(reference);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_own"   ON bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "bookings_select_admin" ON bookings FOR SELECT USING (is_admin());
CREATE POLICY "bookings_insert_own"   ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "bookings_insert_admin" ON bookings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "bookings_update_own"   ON bookings FOR UPDATE
  USING (auth.uid() = customer_id AND status NOT IN ('completed'));
CREATE POLICY "bookings_update_admin" ON bookings FOR UPDATE USING (is_admin());
CREATE POLICY "bookings_delete_admin" ON bookings FOR DELETE USING (is_admin());

CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS trigger AS $$
BEGIN
  NEW.reference := 'BK-' || lpad(nextval('booking_ref_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE booking_ref_seq START 1000;
CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- =========================================================
-- GALLERY IMAGES
-- =========================================================
CREATE TABLE gallery_images (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  category      text        NOT NULL,
  tag           text        NOT NULL,
  section       text        NOT NULL CHECK (section IN ('work', 'achievement')),
  storage_path  text        NOT NULL,
  alt_text      text,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_images_section  ON gallery_images(section);
CREATE INDEX idx_gallery_images_category ON gallery_images(category);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_images_select_all"   ON gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery_images_insert_admin" ON gallery_images FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "gallery_images_update_admin" ON gallery_images FOR UPDATE USING (is_admin());
CREATE POLICY "gallery_images_delete_admin" ON gallery_images FOR DELETE USING (is_admin());

-- =========================================================
-- CONTACT MESSAGES
-- =========================================================
CREATE TABLE contact_messages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  phone            text        NOT NULL,
  service_interest text,
  message          text        NOT NULL,
  is_read          boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages_insert_all"   ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_select_admin" ON contact_messages FOR SELECT USING (is_admin());
CREATE POLICY "contact_messages_update_admin" ON contact_messages FOR UPDATE USING (is_admin());
CREATE POLICY "contact_messages_delete_admin" ON contact_messages FOR DELETE USING (is_admin());
```
