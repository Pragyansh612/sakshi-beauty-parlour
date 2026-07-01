/**
 * One-time (or re-runnable) time-slot seeding script.
 * Generates open time_slots for the next N days, 11:00 AM – 8:30 PM
 * in 30-minute increments, matching salon hours (Mon–Sun).
 *
 * Usage: npx tsx scripts/seed-slots.mts [days]
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

const DAYS_AHEAD = parseInt(process.argv[2] ?? '60', 10);
const OPEN_HOUR = 11;
const CLOSE_HOUR = 20.5; // 8:30 PM last slot

function buildSlotTimes(): string[] {
  const times: string[] = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h += 0.5) {
    const hour = Math.floor(h);
    const minute = h % 1 === 0 ? '00' : '30';
    times.push(`${String(hour).padStart(2, '0')}:${minute}:00`);
  }
  return times;
}

async function seedSlots() {
  console.log(`Seeding time slots for the next ${DAYS_AHEAD} days...\n`);
  const slotTimes = buildSlotTimes();
  const today = new Date();
  const rows: { slot_date: string; slot_time: string }[] = [];

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    for (const time of slotTimes) {
      rows.push({ slot_date: iso, slot_time: time });
    }
  }

  const { error, count } = await supabase
    .from('time_slots')
    .upsert(rows, { onConflict: 'slot_date,slot_time', ignoreDuplicates: true, count: 'exact' });

  if (error) {
    console.error('Failed to seed slots:', error.message);
    process.exit(1);
  }

  console.log(`Done. ${count ?? rows.length} slot rows ensured (existing slots left untouched).`);
}

seedSlots();
