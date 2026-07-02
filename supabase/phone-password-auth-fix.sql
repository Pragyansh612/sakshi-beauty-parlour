-- =========================================================
-- PHONE + PASSWORD AUTH FIX (no SMS, no phone provider)
-- Run once in the Supabase SQL Editor.
--
-- The app collects phone + password only. Supabase uses the
-- built-in EMAIL provider with synthetic addresses like:
--   p7999610227@your-project-ref.supabase.co
-- No SMS or real email inbox is involved.
--
-- REQUIRED in Supabase Dashboard → Authentication → Providers:
--   • Email — ON
--   • Confirm email — OFF  (recommended; registration also uses admin API)
--   • Phone — OFF
--
-- REQUIRED in .env.local:
--   • SUPABASE_SERVICE_ROLE_KEY — used by /api/auth/register to create
--     accounts without sending confirmation emails
-- =========================================================

-- ---------------------------------------------------------
-- 1. Profile trigger — store phone in profiles, not email
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
      NULLIF(SUBSTRING(NEW.email FROM '^p([0-9]{10})@'), ''),
      NULLIF(REGEXP_REPLACE(COALESCE(NEW.phone, ''), '^\+91', ''), ''),
      ''
    ),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ---------------------------------------------------------
-- 2. Clear synthetic emails from profiles (never shown in app)
-- ---------------------------------------------------------
UPDATE profiles SET email = NULL WHERE email IS NOT NULL;

UPDATE profiles
SET phone = REGEXP_REPLACE(phone, '^\+91', '')
WHERE phone LIKE '+91%';

-- ---------------------------------------------------------
-- 3. Fix auth.users — replace invalid .internal addresses
--    Replace YOUR_PROJECT_REF with your Supabase project ref
--    (same host as NEXT_PUBLIC_SUPABASE_URL), e.g. abcdefghijklmnop
-- ---------------------------------------------------------
-- Old invalid format → valid synthetic email on your Supabase host
UPDATE auth.users
SET
  email = 'p' || SUBSTRING(email FROM '^p([0-9]{10})@') || '@YOUR_PROJECT_REF.supabase.co',
  email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email ~ '^p[0-9]{10}@phone\.sakshibeautyparlour\.internal$';

-- If you ran phone-auth-migration.sql, move phone-only users back to email auth
UPDATE auth.users
SET
  email = 'p' || REGEXP_REPLACE(phone, '^\+91', '') || '@YOUR_PROJECT_REF.supabase.co',
  phone = NULL,
  email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE phone ~ '^\+91[0-9]{10}$'
  AND (email IS NULL OR email = '');
