-- =========================================================
-- PHONE AUTH MIGRATION (superseded)
-- Use supabase/phone-password-auth-fix.sql instead.
-- Phone provider is NOT required — auth uses synthetic emails.
-- =========================================================

-- ---------------------------------------------------------
-- 1. Profile auto-create trigger (phone-native, email = NULL)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'phone', ''),
      NULLIF(REGEXP_REPLACE(COALESCE(NEW.phone, ''), '^\+91', ''), ''),
      ''
    ),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------
-- 2. is_admin() — idempotent; ensures search_path is pinned
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ---------------------------------------------------------
-- 3. Clean up profiles created with synthetic auth emails
-- ---------------------------------------------------------
UPDATE profiles
SET email = NULL
WHERE email IS NOT NULL
  AND email LIKE '%@phone.sakshibeautyparlour.internal';

-- Normalize any profile phones stored with a +91 prefix
UPDATE profiles
SET phone = REGEXP_REPLACE(phone, '^\+91', '')
WHERE phone LIKE '+91%';

-- ---------------------------------------------------------
-- 4. Migrate auth.users from synthetic email → phone
--    Pattern: p7999610227@phone.sakshibeautyparlour.internal → +917999610227
--    Skips rows that already have a phone set.
-- ---------------------------------------------------------
UPDATE auth.users
SET
  phone = '+91' || SUBSTRING(email FROM '^p([0-9]{10})@'),
  email = NULL,
  phone_confirmed_at = COALESCE(phone_confirmed_at, now())
WHERE email ~ '^p[0-9]{10}@phone\.sakshibeautyparlour\.internal$'
  AND (phone IS NULL OR phone = '');
