-- Fixes "Database error creating new user" on registration/admin user creation.
-- Root cause: handle_new_user() and is_admin() are SECURITY DEFINER functions
-- without a pinned search_path, so Postgres/Supabase can fail to resolve the
-- unqualified `profiles` table reference inside them. Run this once in the
-- Supabase SQL Editor, then retry registration / `npx tsx scripts/seed-admin.mts`.

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;
