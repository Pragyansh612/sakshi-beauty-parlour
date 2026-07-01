-- =========================================================
-- SAKSHI BEAUTY PARLOUR — SUPABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- =========================================================

-- =========================================================
-- EXTENSIONS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- PROFILES
-- Extends auth.users — one row per user, auto-created by trigger
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

-- =========================================================
-- HELPER: is_admin()
-- Returns true if the calling user has role = 'admin'
-- SECURITY DEFINER so it runs with elevated privileges
-- Defined here (after `profiles` exists) because PostgreSQL resolves
-- table references in LANGUAGE sql function bodies at creation time.
-- =========================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  USING (is_admin());

-- Auto-create profile row on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', COALESCE(NEW.phone, '')),
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
-- 6 categories: Hair Care, Skin & Face, Body Care,
-- Threading & Waxing, Grooming & Wellness, Bridal & Event
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

CREATE POLICY "service_categories_select_all"
  ON service_categories FOR SELECT USING (true);

CREATE POLICY "service_categories_insert_admin"
  ON service_categories FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "service_categories_update_admin"
  ON service_categories FOR UPDATE USING (is_admin());

CREATE POLICY "service_categories_delete_admin"
  ON service_categories FOR DELETE USING (is_admin());

-- =========================================================
-- SERVICES
-- All treatments; price in paise (₹1 = 100 paise)
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
  status                  text        NOT NULL DEFAULT 'active'
                                      CHECK (status IN ('active', 'draft', 'archived')),
  display_order           integer     NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_category_id          ON services(category_id);
CREATE INDEX idx_services_status               ON services(status);
CREATE INDEX idx_services_appointment_eligible ON services(is_appointment_eligible)
  WHERE is_appointment_eligible = true;
CREATE INDEX idx_services_booking_eligible     ON services(is_booking_eligible)
  WHERE is_booking_eligible = true;

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_active"
  ON services FOR SELECT USING (status = 'active');

CREATE POLICY "services_select_admin"
  ON services FOR SELECT USING (is_admin());

CREATE POLICY "services_insert_admin"
  ON services FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "services_update_admin"
  ON services FOR UPDATE USING (is_admin());

CREATE POLICY "services_delete_admin"
  ON services FOR DELETE USING (is_admin());

-- =========================================================
-- COMBO OFFERS
-- 4 packages: Bridal Bliss, Glow Package, etc.
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

CREATE POLICY "combo_offers_select_all"
  ON combo_offers FOR SELECT USING (true);

CREATE POLICY "combo_offers_insert_admin"
  ON combo_offers FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "combo_offers_update_admin"
  ON combo_offers FOR UPDATE USING (is_admin());

CREATE POLICY "combo_offers_delete_admin"
  ON combo_offers FOR DELETE USING (is_admin());

ALTER TABLE combo_offer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "combo_offer_items_select_all"
  ON combo_offer_items FOR SELECT USING (true);

CREATE POLICY "combo_offer_items_insert_admin"
  ON combo_offer_items FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "combo_offer_items_update_admin"
  ON combo_offer_items FOR UPDATE USING (is_admin());

CREATE POLICY "combo_offer_items_delete_admin"
  ON combo_offer_items FOR DELETE USING (is_admin());

-- =========================================================
-- TIME SLOTS
-- Admin creates slots in advance; one row = one 30-min window
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

CREATE POLICY "time_slots_select_open"
  ON time_slots FOR SELECT USING (status = 'open');

CREATE POLICY "time_slots_select_admin"
  ON time_slots FOR SELECT USING (is_admin());

CREATE POLICY "time_slots_insert_admin"
  ON time_slots FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "time_slots_update_admin"
  ON time_slots FOR UPDATE USING (is_admin());

CREATE POLICY "time_slots_delete_admin"
  ON time_slots FOR DELETE USING (is_admin());

-- =========================================================
-- APPOINTMENTS
-- Short-duration services tied to a specific time slot
-- Reference: AP-2000, AP-2001, ...
-- =========================================================
CREATE SEQUENCE appointment_ref_seq START 2000;

CREATE TABLE appointments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           text        NOT NULL UNIQUE,
  customer_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  service_id          uuid        NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  slot_id             uuid        NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
  artist              text,
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN (
                                    'pending','confirmed','checked_in',
                                    'in_chair','completed','cancelled','no_show'
                                  )),
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

CREATE POLICY "appointments_select_own"
  ON appointments FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "appointments_select_admin"
  ON appointments FOR SELECT USING (is_admin());

CREATE POLICY "appointments_insert_own"
  ON appointments FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "appointments_insert_admin"
  ON appointments FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "appointments_update_own"
  ON appointments FOR UPDATE
  USING (auth.uid() = customer_id AND status NOT IN ('completed', 'no_show'));

CREATE POLICY "appointments_update_admin"
  ON appointments FOR UPDATE USING (is_admin());

CREATE POLICY "appointments_delete_admin"
  ON appointments FOR DELETE USING (is_admin());

CREATE OR REPLACE FUNCTION generate_appointment_reference()
RETURNS trigger AS $$
BEGIN
  NEW.reference := 'AP-' || lpad(nextval('appointment_ref_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_appointment_reference
  BEFORE INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION generate_appointment_reference();

-- =========================================================
-- BOOKINGS
-- Long-duration/bridal/event services tied to a date + requirements
-- Reference: BK-1000, BK-1001, ...
-- =========================================================
CREATE SEQUENCE booking_ref_seq START 1000;

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
                                  CHECK (status IN (
                                    'pending_approval','confirmed',
                                    'in_progress','completed','cancelled'
                                  )),
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

CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "bookings_select_admin"
  ON bookings FOR SELECT USING (is_admin());

CREATE POLICY "bookings_insert_own"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "bookings_insert_admin"
  ON bookings FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "bookings_update_own"
  ON bookings FOR UPDATE
  USING (auth.uid() = customer_id AND status NOT IN ('completed'));

CREATE POLICY "bookings_update_admin"
  ON bookings FOR UPDATE USING (is_admin());

CREATE POLICY "bookings_delete_admin"
  ON bookings FOR DELETE USING (is_admin());

CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS trigger AS $$
BEGIN
  NEW.reference := 'BK-' || lpad(nextval('booking_ref_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- =========================================================
-- GALLERY IMAGES
-- Portfolio images (work/) and achievement images (achievement/)
-- =========================================================
CREATE TABLE gallery_images (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  category      text        NOT NULL,
  tag           text        NOT NULL,
  section       text        NOT NULL CHECK (section IN ('work', 'achievement')),
  storage_path  text        NOT NULL UNIQUE,
  alt_text      text,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_images_section  ON gallery_images(section);
CREATE INDEX idx_gallery_images_category ON gallery_images(category);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_images_select_all"
  ON gallery_images FOR SELECT USING (true);

CREATE POLICY "gallery_images_insert_admin"
  ON gallery_images FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "gallery_images_update_admin"
  ON gallery_images FOR UPDATE USING (is_admin());

CREATE POLICY "gallery_images_delete_admin"
  ON gallery_images FOR DELETE USING (is_admin());

-- =========================================================
-- CONTACT MESSAGES
-- Submissions from the Contact page form
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

CREATE POLICY "contact_messages_insert_all"
  ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_select_admin"
  ON contact_messages FOR SELECT USING (is_admin());

CREATE POLICY "contact_messages_update_admin"
  ON contact_messages FOR UPDATE USING (is_admin());

CREATE POLICY "contact_messages_delete_admin"
  ON contact_messages FOR DELETE USING (is_admin());

-- =========================================================
-- STORAGE RLS POLICIES
-- Run these after creating the 'gallery' and 'avatars' buckets
-- =========================================================

-- gallery bucket: anyone can read (public portfolio)
-- CREATE POLICY "gallery_public_read"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'gallery');

-- gallery bucket: only admin can upload
-- CREATE POLICY "gallery_admin_write"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'gallery' AND is_admin());

-- gallery bucket: only admin can delete
-- CREATE POLICY "gallery_admin_delete"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'gallery' AND is_admin());

-- avatars: owner reads own file
-- CREATE POLICY "avatars_owner_read"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- avatars: admin reads all avatars
-- CREATE POLICY "avatars_admin_read"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'avatars' AND is_admin());

-- avatars: owner uploads own avatar
-- CREATE POLICY "avatars_owner_write"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =========================================================
-- INITIAL SEED: Service categories
-- =========================================================
INSERT INTO service_categories (name, slug, description, display_order) VALUES
  ('Hair Care',           'hair',      'From trims to full transformations — expert care for every hair type.', 1),
  ('Skin & Face',         'skin',      'Targeted facials and treatments for radiant, healthy skin.',            2),
  ('Body Care',           'body',      'Head-to-toe pampering — massages, polishing, and cleansing.',          3),
  ('Threading & Waxing',  'threading', 'Precise hair removal — gentle, fast, and long-lasting.',               4),
  ('Grooming & Wellness', 'grooming',  'Nails, manicures, pedicures, and wellness treatments.',                5),
  ('Bridal & Event',      'bridal',    'Your most important day deserves our most expert artists.',            6);

-- =========================================================
-- INITIAL SEED: Appointment-eligible services
-- These appear in the Quick Appointment booking flow
-- Prices in paise
-- =========================================================
INSERT INTO services (category_id, name, description, duration_minutes, duration_label,
                      price_from, price_to, is_appointment_eligible, status, display_order)
SELECT
  sc.id,
  s.name,
  s.description,
  s.duration_minutes,
  s.duration_label,
  s.price_from,
  s.price_to,
  true,
  'active',
  s.ord
FROM (VALUES
  ('hair',      'Hair Wash & Blow Dry', 'Professional wash with premium products and styled blow dry.',   45, '45 min',    49900,   49900,  1),
  ('skin',      'Facial',              'Classic deep-cleansing facial for glowing skin.',                 60, '60 min',    69900,   69900,  2),
  ('threading', 'Threading',           'Precise eyebrow, upper lip, and chin threading.',                 15, '15 min',    4000,    4000,   3),
  ('hair',      'Hair Cut',            'Expert haircut styled to your face shape.',                       45, '45 min',    39900,   39900,  4),
  ('threading', 'Waxing',              'Smooth, long-lasting waxing for arms, legs, or underarms.',       45, '30–60 min', 15000,   15000,  5)
) AS s(cat_slug, name, description, duration_minutes, duration_label, price_from, price_to, ord)
JOIN service_categories sc ON sc.slug = s.cat_slug;

-- =========================================================
-- INITIAL SEED: Booking-eligible services
-- These appear in the Bridal & Event booking flow
-- =========================================================
INSERT INTO services (category_id, name, description, duration_minutes, duration_label,
                      price_from, price_to, is_booking_eligible, status, display_order)
SELECT
  sc.id,
  s.name,
  s.description,
  NULL,
  s.duration_label,
  s.price_from,
  s.price_to,
  true,
  'active',
  s.ord
FROM (VALUES
  ('bridal', 'Bridal Makeup',         'Full bridal look — HD or airbrush, hair styling, and saree draping included.', 'Full day',     800000,  800000,  1),
  ('bridal', 'Pre-Bridal Package',    'Multi-session prep package covering skin, hair, and body treatments.',          'Multi-session', 1200000, 1200000, 2),
  ('bridal', 'Event / Party Makeup',  'Glamorous look for receptions, sangeet, engagements, or parties.',             '2–3 hrs',      350000,  350000,  3)
) AS s(cat_slug, name, description, duration_label, price_from, price_to, ord)
JOIN service_categories sc ON sc.slug = s.cat_slug;

-- =========================================================
-- INITIAL SEED: Full service menu (non-booking-eligible)
-- All services shown on the Services page
-- =========================================================
INSERT INTO services (category_id, sub_category, name, price_from, price_to, status, display_order)
SELECT sc.id, s.sub_cat, s.name, s.price_from, s.price_to, 'active', s.ord
FROM (VALUES
  -- Hair Care
  ('hair', 'Hair Treatments',  'Hair Spa',               100000, 300000,  10),
  ('hair', 'Hair Treatments',  'Nanoplastia',            800000, 3000000, 11),
  ('hair', 'Hair Treatments',  'Vegan Hair Treatment',   1000000, NULL,   12),
  ('hair', 'Hair Colour',      'Global Colour',          250000, 600000,  20),
  ('hair', 'Hair Colour',      'Highlights / Balayage',  400000, 1200000, 21),
  ('hair', 'Hair Colour',      'Root Touch-Up',          80000,  150000,  22),
  ('hair', 'Styling',          'Blow Dry',               30000,  60000,   30),
  ('hair', 'Styling',          'Hair Styling',           30000,  100000,  31),
  -- Skin & Face
  ('skin', 'Facials',          'Cleanup',                60000,  120000,  10),
  ('skin', 'Facials',          'Fruit / Hydrating Facial',100000, 250000, 11),
  ('skin', 'Facials',          'Anti-Aging Facial',      180000, 350000,  12),
  ('skin', 'Facials',          'Hydra Facial',           200000, 400000,  13),
  ('skin', 'Facials',          'Korean Glass Facial',    250000, 500000,  14),
  ('skin', 'Bleach & D-Tan',   'Face Bleach',            30000,  70000,   20),
  ('skin', 'Bleach & D-Tan',   'Face D-Tan',             40000,  90000,   21),
  -- Body Care
  ('body', 'Massage',          'Body Massage',           150000, 350000,  10),
  ('body', 'Massage',          'Head Massage',           30000,  80000,   11),
  ('body', 'Polishing & Scrub','Body Polishing',         200000, 500000,  20),
  ('body', 'Polishing & Scrub','Body Scrub',             80000,  200000,  21),
  ('body', 'Bleach & D-Tan',   'Body D-Tan',             120000, 250000,  30),
  ('body', 'Bleach & D-Tan',   'Body Bleach',            100000, 200000,  31),
  ('body', 'Cleansing',        'Body Cleansing',         70000,  150000,  40),
  -- Threading & Waxing
  ('threading', 'Threading',   'Eyebrows',               4000,   NULL,    10),
  ('threading', 'Threading',   'Upper Lip',              3000,   NULL,    11),
  ('threading', 'Threading',   'Chin',                   4000,   NULL,    12),
  ('threading', 'Threading',   'Full Face Threading',    15000,  25000,   13),
  ('threading', 'Waxing',      'Half Arms',              15000,  30000,   20),
  ('threading', 'Waxing',      'Half Legs',              20000,  35000,   21),
  ('threading', 'Waxing',      'Underarms',              10000,  20000,   22),
  ('threading', 'Waxing',      'Full Arms / Legs',       30000,  60000,   23),
  ('threading', 'Waxing',      'Full Body Wax',          150000, 300000,  24),
  ('threading', 'Waxing',      'Rica / Brazilian',       50000,  150000,  25),
  -- Grooming & Wellness
  ('grooming', 'Nail Care',    'Manicure',               50000,  120000,  10),
  ('grooming', 'Nail Care',    'Pedicure',               60000,  150000,  11),
  ('grooming', 'Nail Care',    'Nail Extensions',        150000, 300000,  12),
  ('grooming', 'Nail Care',    'Nail Art',               30000,  120000,  13),
  ('grooming', 'Nail Care',    'Gel Polish',             50000,  100000,  14),
  -- Bridal & Event (Services page display items)
  ('bridal', 'Makeup',         'HD Bridal Makeup',       800000, 1500000, 10),
  ('bridal', 'Makeup',         'Airbrush Bridal Makeup', 1200000,3000000, 11),
  ('bridal', 'Makeup',         'Engagement / Reception', 600000, 1200000, 12),
  ('bridal', 'Makeup',         'Party / Guest Makeup',   300000, 600000,  13),
  ('bridal', 'Hair & Draping', 'Saree Draping',          50000,  150000,  20),
  ('bridal', 'Hair & Draping', 'Bridal Hair Styling',    80000,  200000,  21)
) AS s(cat_slug, sub_cat, name, price_from, price_to, ord)
JOIN service_categories sc ON sc.slug = s.cat_slug
ON CONFLICT DO NOTHING;

-- =========================================================
-- INITIAL SEED: Combo offers
-- =========================================================
INSERT INTO combo_offers (name, tag_line, price, price_original, save_percent, is_featured, display_order)
VALUES
  ('Bridal Bliss',       'Bridal favourite',  1800000, 2400000, 25, true,  1),
  ('Glow Package',       'Most popular',       350000,  480000, 27, false, 2),
  ('Pre-Wedding Prep',   'Complete prep',      900000, 1200000, 25, false, 3),
  ('Relax & Renew',      'Wellness favourite', 450000,  600000, 25, false, 4);

-- Bridal Bliss items
INSERT INTO combo_offer_items (combo_id, description, display_order)
SELECT co.id, item.description, item.ord
FROM combo_offers co
CROSS JOIN (VALUES
  ('HD Bridal Makeup',       1),
  ('Bridal Hair Styling',    2),
  ('Saree Draping',          3),
  ('Pre-Bridal Skin Session',4),
  ('Manicure & Pedicure',    5)
) AS item(description, ord)
WHERE co.name = 'Bridal Bliss';

-- Glow Package items
INSERT INTO combo_offer_items (combo_id, description, display_order)
SELECT co.id, item.description, item.ord
FROM combo_offers co
CROSS JOIN (VALUES
  ('Korean Glass Facial',    1),
  ('Body Polishing',         2),
  ('Threading (Full Face)',  3),
  ('Gel Polish',             4)
) AS item(description, ord)
WHERE co.name = 'Glow Package';

-- Pre-Wedding Prep items
INSERT INTO combo_offer_items (combo_id, description, display_order)
SELECT co.id, item.description, item.ord
FROM combo_offers co
CROSS JOIN (VALUES
  ('4 Skin Sessions',        1),
  ('2 Hair Spa Treatments',  2),
  ('Full Body D-Tan',        3),
  ('Manicure & Pedicure',    4)
) AS item(description, ord)
WHERE co.name = 'Pre-Wedding Prep';

-- Relax & Renew items
INSERT INTO combo_offer_items (combo_id, description, display_order)
SELECT co.id, item.description, item.ord
FROM combo_offers co
CROSS JOIN (VALUES
  ('Body Massage',           1),
  ('Hair Spa',               2),
  ('Hydrating Facial',       3),
  ('Pedicure',               4)
) AS item(description, ord)
WHERE co.name = 'Relax & Renew';
