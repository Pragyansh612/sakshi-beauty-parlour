-- =========================================================
-- SEED ADMIN ACCOUNT — Sakshi Beauty Parlour
-- Run once in the Supabase SQL Editor (safe to re-run — idempotent).
--
-- Creates (or promotes + resets the password of) the salon's admin
-- account directly in `auth.users` + `profiles`, with no OTP/SMS
-- and no real email involved.
--
-- Login: phone 9685024405, password sakshibeauty@2000
--
-- HOW THE "PHONE + PASSWORD, NO OTP" LOGIN WORKS
-- Supabase Auth has no native phone+password flow without SMS OTP,
-- so the app (lib/phone-auth.ts) signs in with Supabase's ordinary
-- EMAIL provider under a synthetic address derived from the phone
-- number: `p<10-digit-phone>@<auth-email-domain>`. No email is ever
-- sent — "Confirm email" must be OFF in Supabase Dashboard →
-- Authentication → Providers, and this script sets
-- email_confirmed_at directly so login isn't blocked on that.
--
-- IMPORTANT — the domain below must exactly match what
-- lib/phone-auth.ts#getAuthEmailDomain() resolves to at runtime
-- (NEXT_PUBLIC_AUTH_EMAIL_DOMAIN, else NEXT_PUBLIC_SITE_URL's host,
-- else your Supabase project host). For this project's current
-- .env that resolves to the Supabase project host below. If you
-- change NEXT_PUBLIC_AUTH_EMAIL_DOMAIN or the site URL later,
-- update auth_email_domain here and re-run.
-- =========================================================

DO $$
DECLARE
  admin_phone         text := '9685024405';
  admin_password      text := 'sakshibeauty@2000';
  admin_name          text := 'Sakshi';
  auth_email_domain   text := 'qssbqtxdvztohcmgwxxp.supabase.co';
  admin_email         text;
  target_user_id      uuid;
BEGIN
  admin_email := 'p' || admin_phone || '@' || auth_email_domain;

  SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;

  IF target_user_id IS NULL THEN
    -- Only reuse an existing profile when it already belongs to this admin email.
    SELECT p.id INTO target_user_id
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.phone = admin_phone
      AND u.email = admin_email;
  END IF;

  IF target_user_id IS NULL THEN
    target_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      target_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', admin_name, 'phone', admin_phone),
      now(),
      now(),
      '', '', '', '',
      false
    );
    -- handle_new_user() trigger fires on this insert and creates the
    -- matching `profiles` row automatically.
  ELSE
    -- Account already exists (e.g. created earlier via scripts/seed-admin.mts) —
    -- reset password + email to the canonical values, idempotently.
    UPDATE auth.users
    SET
      email = admin_email,
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = target_user_id;
  END IF;

  -- Ensure the profile exists, has the right name, and is promoted to admin.
  INSERT INTO profiles (id, full_name, phone, email, role)
  VALUES (target_user_id, admin_name, admin_phone, NULL, 'admin')
  ON CONFLICT (id) DO UPDATE
    SET full_name = admin_name,
        phone = admin_phone,
        role = 'admin';
END $$;
