/**
 * Creates (or promotes) the salon's admin account.
 * Phone + password in the UI; auth uses a synthetic email — see lib/phone-auth.ts.
 *
 * Usage: npx tsx scripts/seed-admin.mts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or .env
 */

import { createClient } from '@supabase/supabase-js';

for (const envFile of ['../.env.local', '../.env']) {
  try {
    const { readFileSync } = await import('fs');
    const envPath = new URL(envFile, import.meta.url).pathname;
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key && !key.startsWith('#') && rest.length) {
        process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
    break;
  } catch {
    // this file not found — try the next one
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const ADMIN_PHONE = '9685024405';
const ADMIN_PASSWORD = 'sakshibeauty@2000';
const ADMIN_NAME = 'Sakshi';

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '');
}

function getAuthEmailDomain(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AUTH_EMAIL_DOMAIN?.trim();
  if (fromEnv) return fromEnv;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const host = new URL(siteUrl).hostname;
      if (host !== 'localhost' && !host.startsWith('127.')) return host;
    } catch {
      // fall through
    }
  }

  if (SUPABASE_URL) {
    try {
      return new URL(SUPABASE_URL).hostname;
    } catch {
      // fall through
    }
  }

  return 'sakshibeautyparlour.in';
}

function phoneToAuthEmail(phone: string): string {
  return `p${normalizePhone(phone)}@${getAuthEmailDomain()}`;
}

async function seedAdmin() {
  const email = phoneToAuthEmail(ADMIN_PHONE);

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('phone', ADMIN_PHONE)
    .maybeSingle();

  let userId: string;

  if (existingProfile) {
    userId = existingProfile.id;
    console.log(`Found existing profile for ${ADMIN_PHONE} (${userId}) — updating email, password & role.`);
    const { error: updateAuthErr } = await supabase.auth.admin.updateUserById(userId, {
      email,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updateAuthErr) throw new Error(`Failed to update auth user: ${updateAuthErr.message}`);
  } else {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME, phone: ADMIN_PHONE },
    });
    if (createErr || !created.user) throw new Error(`Failed to create auth user: ${createErr?.message}`);
    userId = created.user.id;
    console.log(`Created auth user ${userId} for ${ADMIN_PHONE}.`);
  }

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ role: 'admin', full_name: ADMIN_NAME })
    .eq('id', userId);
  if (profileErr) throw new Error(`Failed to set admin role: ${profileErr.message}`);

  console.log(`\nDone. Admin login: phone ${ADMIN_PHONE}, password as provided.`);
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
