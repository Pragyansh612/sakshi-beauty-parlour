/**
 * Replaces service_categories, services, and combo_offers/combo_offer_items
 * with the full salon menu. Safe to re-run — it wipes and reinserts these
 * tables (confirmed no appointments/bookings reference them yet).
 *
 * Usage: npx tsx scripts/seed-services.mts
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

const CATEGORIES = [
  { slug: 'hair', name: 'Hair Care', description: 'From spa treatments to bold transformations — expert care for every hair type.', icon_shape: '50%', display_order: 1 },
  { slug: 'skin', name: 'Skin & Face Care', description: 'Targeted facials and treatments for radiant, healthy skin.', icon_shape: '50% 50% 50% 0', display_order: 2 },
  { slug: 'body', name: 'Body Care', description: 'Head-to-toe pampering — massages, polishing, and cleansing rituals.', icon_shape: '14px', display_order: 3 },
  { slug: 'threading', name: 'Threading', description: 'Precise, gentle threading for brows, lips, chin and full face.', icon_shape: '50% 0', display_order: 4 },
  { slug: 'waxing', name: 'Waxing', description: 'Smooth, long-lasting hair removal for every part of the body.', icon_shape: '0 50% 0 50%', display_order: 5 },
  { slug: 'grooming', name: 'Grooming & Wellness', description: 'Nails, manicures, and pedicures for complete hand & foot care.', icon_shape: '50% 50% 0 50%', display_order: 6 },
  { slug: 'bridal', name: 'Bridal Makeup', description: 'Your most important day deserves our most expert artists.', icon_shape: '50%', display_order: 7 },
] as const;

// price_from / price_to in paise. price_to = null means "starting from" (X+).
interface SeedService {
  cat: (typeof CATEGORIES)[number]['slug'];
  sub: string | null;
  name: string;
  description: string;
  price_from: number;
  price_to: number | null;
  appt: boolean;
  booking: boolean;
  order: number;
}

const SERVICES: SeedService[] = [
  // Hair Care
  { cat: 'hair', sub: 'Hair Spa', name: 'Hair Spa', description: 'Deep conditioning treatment that nourishes hair, reduces dryness, and improves hair texture.', price_from: 100000, price_to: null, appt: true, booking: false, order: 10 },
  { cat: 'hair', sub: 'Hair Treatments', name: 'Nanoplastia', description: 'Advanced smoothing and hair repair treatment for frizz-free, manageable hair.', price_from: 800000, price_to: null, appt: false, booking: true, order: 20 },
  { cat: 'hair', sub: 'Hair Treatments', name: 'Chemical Treatment', description: 'Professional chemical treatment for hair transformation and texture improvement.', price_from: 1000000, price_to: null, appt: false, booking: true, order: 21 },
  { cat: 'hair', sub: 'Hair Treatments', name: 'Vegan Treatment', description: 'Plant-based hair care treatment using vegan-friendly products.', price_from: 300000, price_to: null, appt: true, booking: false, order: 22 },
  { cat: 'hair', sub: 'Hair Treatments', name: 'Hair Straightening', description: 'Permanent or semi-permanent hair straightening for sleek and smooth hair.', price_from: 600000, price_to: 1500000, appt: false, booking: true, order: 23 },
  { cat: 'hair', sub: 'Hair Smoothing', name: 'Keratin Treatment', description: 'Reduces frizz and improves hair manageability while maintaining natural movement.', price_from: 600000, price_to: null, appt: false, booking: true, order: 30 },
  { cat: 'hair', sub: 'Hair Smoothing', name: 'Hair Smoothing Treatment', description: 'Reduces frizz and improves hair manageability while maintaining natural movement.', price_from: 600000, price_to: null, appt: false, booking: true, order: 31 },
  { cat: 'hair', sub: 'Hair Styling', name: 'Hair Cut', description: 'Expert haircut styled to your face shape.', price_from: 39900, price_to: null, appt: true, booking: false, order: 40 },
  { cat: 'hair', sub: 'Hair Styling', name: 'Blow Dry', description: 'Professional wash and styled blow dry for a polished daily look.', price_from: 30000, price_to: 60000, appt: true, booking: false, order: 41 },
  { cat: 'hair', sub: 'Hair Styling', name: 'Hair Styling', description: 'Professional styling for daily looks, parties, and special occasions.', price_from: 30000, price_to: 100000, appt: true, booking: false, order: 42 },
  { cat: 'hair', sub: 'Hair Coloring', name: 'Hair Coloring', description: 'Hair coloring services including highlights, global color, and fashion shades.', price_from: 170000, price_to: 380000, appt: false, booking: true, order: 50 },

  // Skin & Face Care
  { cat: 'skin', sub: 'Facials', name: 'Hydrating Facial', description: 'Moisturizing facial designed to improve skin hydration.', price_from: 30000, price_to: 80000, appt: true, booking: false, order: 10 },
  { cat: 'skin', sub: 'Facials', name: 'Brightening Facial', description: 'Facial treatment that enhances glow and skin brightness.', price_from: 150000, price_to: 300000, appt: true, booking: false, order: 20 },
  { cat: 'skin', sub: 'Facials', name: 'Anti-Aging Facial', description: 'Treatment focused on reducing signs of aging and improving skin firmness.', price_from: 500000, price_to: 850000, appt: false, booking: true, order: 30 },
  { cat: 'skin', sub: 'Facials', name: 'Clean-Up', description: 'Basic facial clean-up for refreshed and healthy-looking skin.', price_from: 30000, price_to: 80000, appt: true, booking: false, order: 40 },
  { cat: 'skin', sub: 'Facials', name: 'Hydra Facial', description: 'Advanced facial treatment for deep cleansing, hydration, and rejuvenation.', price_from: 200000, price_to: 500000, appt: true, booking: false, order: 50 },
  { cat: 'skin', sub: 'Facials', name: 'Deep Pore Cleansing', description: 'Deep cleansing treatment to remove impurities and improve skin health.', price_from: 30000, price_to: 80000, appt: true, booking: false, order: 60 },

  // Body Care
  { cat: 'body', sub: null, name: 'Body Massage', description: 'Relaxing full-body massage for stress relief and wellness.', price_from: 300000, price_to: null, appt: false, booking: true, order: 10 },
  { cat: 'body', sub: null, name: 'Body Polishing', description: 'Exfoliation and polishing treatment for smooth and glowing skin.', price_from: 600000, price_to: null, appt: false, booking: true, order: 20 },
  { cat: 'body', sub: null, name: 'Body Bleach', description: 'Body brightening treatment for even-toned skin appearance.', price_from: 100000, price_to: 200000, appt: true, booking: false, order: 30 },
  { cat: 'body', sub: null, name: 'D-Tan Treatment', description: 'Treatment designed to reduce tanning and restore natural skin tone.', price_from: 120000, price_to: 250000, appt: true, booking: false, order: 40 },
  { cat: 'body', sub: null, name: 'Body Scrubbing', description: 'Deep exfoliation treatment that removes dead skin cells.', price_from: 80000, price_to: 200000, appt: true, booking: false, order: 50 },
  { cat: 'body', sub: null, name: 'Body Cleansing', description: 'Complete body cleansing treatment for refreshed skin.', price_from: 70000, price_to: 150000, appt: true, booking: false, order: 60 },
  { cat: 'body', sub: null, name: 'Gel Pack', description: 'Nourishing gel-based body treatment.', price_from: 50000, price_to: null, appt: true, booking: false, order: 70 },
  { cat: 'body', sub: null, name: 'Serum Treatment', description: 'Body treatment using skin-nourishing serums.', price_from: 80000, price_to: null, appt: true, booking: false, order: 80 },

  // Threading
  { cat: 'threading', sub: null, name: 'Eyebrows', description: 'Precise eyebrow shaping threading.', price_from: 1000, price_to: 3000, appt: true, booking: false, order: 10 },
  { cat: 'threading', sub: null, name: 'Upper Lip', description: 'Quick, precise upper lip threading.', price_from: 1000, price_to: 3000, appt: true, booking: false, order: 20 },
  { cat: 'threading', sub: null, name: 'Chin', description: 'Gentle chin threading.', price_from: 1000, price_to: 3000, appt: true, booking: false, order: 30 },
  { cat: 'threading', sub: null, name: 'Full Face Threading', description: 'Complete face threading for a clean, polished finish.', price_from: 1000, price_to: 3000, appt: true, booking: false, order: 40 },

  // Waxing
  { cat: 'waxing', sub: null, name: 'Full Body Waxing', description: 'Complete full-body waxing for smooth, long-lasting results.', price_from: 240000, price_to: null, appt: true, booking: false, order: 10 },
  { cat: 'waxing', sub: null, name: 'Arms Waxing', description: 'Smooth, long-lasting waxing for arms.', price_from: 60000, price_to: null, appt: true, booking: false, order: 20 },
  { cat: 'waxing', sub: null, name: 'Legs Waxing', description: 'Smooth, long-lasting waxing for legs.', price_from: 100000, price_to: null, appt: true, booking: false, order: 30 },
  { cat: 'waxing', sub: null, name: 'Face Waxing', description: 'Gentle waxing for facial hair removal.', price_from: 30000, price_to: null, appt: true, booking: false, order: 40 },
  { cat: 'waxing', sub: null, name: 'Underarm Waxing', description: 'Quick, gentle underarm waxing.', price_from: 10000, price_to: null, appt: true, booking: false, order: 50 },

  // Grooming & Wellness
  { cat: 'grooming', sub: null, name: 'Manicure', description: 'Complete hand and nail care treatment.', price_from: 60000, price_to: 120000, appt: true, booking: false, order: 10 },
  { cat: 'grooming', sub: null, name: 'Pedicure', description: 'Complete foot and nail care treatment.', price_from: 110000, price_to: 230000, appt: true, booking: false, order: 20 },

  // Bridal Makeup
  { cat: 'bridal', sub: 'Bridal Packages', name: 'Bridal Makeup', description: 'Complete bridal makeover package for wedding ceremonies and events.', price_from: 500000, price_to: 2000000, appt: false, booking: true, order: 10 },
  { cat: 'bridal', sub: 'Bridal Packages', name: 'Pre-Bridal Package', description: 'Multi-session prep package covering skin, hair, and body treatments before the big day.', price_from: 300000, price_to: 600000, appt: false, booking: true, order: 20 },
  { cat: 'bridal', sub: 'Bridal Packages', name: 'Party Makeup', description: 'Glamorous makeup for parties, receptions, and special celebrations.', price_from: 80000, price_to: 300000, appt: false, booking: true, order: 30 },
  { cat: 'bridal', sub: 'Bridal Packages', name: 'Guest Styling', description: 'Special event makeup and styling for guests.', price_from: 80000, price_to: null, appt: false, booking: true, order: 40 },
  { cat: 'bridal', sub: 'Bridal Packages', name: 'Saree Draping', description: 'Professional saree draping service.', price_from: 50000, price_to: 150000, appt: false, booking: true, order: 50 },
  { cat: 'bridal', sub: 'Makeup Types', name: 'HD Makeup', description: 'High-definition makeup for a flawless, camera-ready finish.', price_from: 500000, price_to: null, appt: false, booking: true, order: 60 },
  { cat: 'bridal', sub: 'Makeup Types', name: '3D Makeup', description: 'Dimensional makeup technique for a sculpted, radiant look.', price_from: 700000, price_to: null, appt: false, booking: true, order: 70 },
  { cat: 'bridal', sub: 'Makeup Types', name: 'Airbrush Makeup', description: 'Lightweight, long-lasting airbrush makeup application.', price_from: 800000, price_to: 1800000, appt: false, booking: true, order: 80 },
  { cat: 'bridal', sub: 'Makeup Types', name: 'Signature Makeup', description: 'Our signature full-glam makeup experience.', price_from: 1000000, price_to: 2000000, appt: false, booking: true, order: 90 },
];

const COMBOS = [
  {
    name: 'Body Care Combo',
    tag_line: 'Body care favourite',
    price: 600000,
    price_original: 750000,
    save_percent: 20,
    is_featured: true,
    order: 1,
    items: ['Body Bleach', 'Scrubbing', 'Gel Pack'],
  },
  {
    name: 'Massage Combo',
    tag_line: 'Relax & unwind',
    price: 300000,
    price_original: 375000,
    save_percent: 20,
    is_featured: false,
    order: 2,
    items: ['Body Cleansing', 'Oil Massage'],
  },
  {
    name: 'Hair Spa + Hair Cut',
    tag_line: 'Promotional combo',
    price: 120000,
    price_original: 150000,
    save_percent: 20,
    is_featured: true,
    order: 3,
    items: ['Hair Spa', 'Hair Cut', 'Bonus: Free Hair Wash', 'Bonus: Advanced Hair Cut Included'],
  },
];

async function seedServices() {
  console.log('Wiping existing services, categories, and combo data...');

  const { error: delServicesErr } = await supabase.from('services').delete().not('id', 'is', null);
  if (delServicesErr) throw new Error(`Failed to delete services: ${delServicesErr.message}`);

  const { error: delCatsErr } = await supabase.from('service_categories').delete().not('id', 'is', null);
  if (delCatsErr) throw new Error(`Failed to delete service_categories: ${delCatsErr.message}`);

  const { error: delCombosErr } = await supabase.from('combo_offers').delete().not('id', 'is', null);
  if (delCombosErr) throw new Error(`Failed to delete combo_offers: ${delCombosErr.message}`);

  console.log('Inserting categories...');
  const { data: insertedCats, error: catErr } = await supabase
    .from('service_categories')
    .insert(CATEGORIES.map(({ slug, name, description, icon_shape, display_order }) => ({
      slug, name, description, icon_shape, display_order,
    })))
    .select('id, slug');
  if (catErr || !insertedCats) throw new Error(`Failed to insert categories: ${catErr?.message}`);

  const catIdBySlug = new Map(insertedCats.map((c) => [c.slug, c.id]));

  console.log('Inserting services...');
  const servicesToInsert = SERVICES.map((s) => ({
    category_id: catIdBySlug.get(s.cat),
    sub_category: s.sub,
    name: s.name,
    description: s.description,
    price_from: s.price_from,
    price_to: s.price_to,
    is_appointment_eligible: s.appt,
    is_booking_eligible: s.booking,
    status: 'active' as const,
    display_order: s.order,
  }));
  const { error: svcErr } = await supabase.from('services').insert(servicesToInsert);
  if (svcErr) throw new Error(`Failed to insert services: ${svcErr.message}`);

  console.log('Inserting combo offers...');
  for (const combo of COMBOS) {
    const { data: insertedCombo, error: comboErr } = await supabase
      .from('combo_offers')
      .insert({
        name: combo.name,
        tag_line: combo.tag_line,
        price: combo.price,
        price_original: combo.price_original,
        save_percent: combo.save_percent,
        is_featured: combo.is_featured,
        status: 'active',
        display_order: combo.order,
      })
      .select('id')
      .single();
    if (comboErr || !insertedCombo) throw new Error(`Failed to insert combo ${combo.name}: ${comboErr?.message}`);

    const { error: itemsErr } = await supabase.from('combo_offer_items').insert(
      combo.items.map((description, i) => ({
        combo_id: insertedCombo.id,
        description,
        display_order: i + 1,
      }))
    );
    if (itemsErr) throw new Error(`Failed to insert items for ${combo.name}: ${itemsErr.message}`);
    console.log(`  ✓ ${combo.name}`);
  }

  console.log(`\nDone. ${insertedCats.length} categories, ${servicesToInsert.length} services, ${COMBOS.length} combos.`);
}

seedServices().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
