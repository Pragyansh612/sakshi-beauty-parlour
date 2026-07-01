/**
 * One-time image seeding script.
 * Uploads ./work/ and ./acheivement/ images to Supabase Storage
 * and inserts metadata rows into gallery_images.
 *
 * Usage: npx tsx scripts/seed-images.mts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or .env
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
// Load env vars from .env.local (or .env as a fallback) when running via tsx outside Next.js
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

const WORK_DIR = './work';
const ACHIEVEMENT_DIR = './acheivement';

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const HEIC_EXTENSIONS = ['.heic', '.HEIC'];

async function seedImages() {
  console.log('Starting image seed...\n');
  await seedDirectory(WORK_DIR, 'work');
  await seedDirectory(ACHIEVEMENT_DIR, 'achievement');
  console.log('\nSeed complete.');
}

async function seedDirectory(dir: string, section: 'work' | 'achievement') {
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    console.warn(`Directory ${dir} not found — skipping.`);
    return;
  }

  console.log(`Seeding ${section} (${files.length} files from ${dir})...`);

  for (const filename of files) {
    const ext = extname(filename).toLowerCase();

    if (HEIC_EXTENSIONS.includes(extname(filename))) {
      console.warn(`  ⚠ HEIC file skipped: ${filename}`);
      console.warn(`    Convert to JPEG first: convert "${join(dir, filename)}" "${join(dir, filename.replace(/\.heic$/i, '.jpg'))}"`);
      continue;
    }

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      console.log(`  - Skipping unsupported file: ${filename}`);
      continue;
    }

    // Strip double extensions like .jpg.jpeg → keep as .jpg
    const cleanName = filename.replace(/\.(jpg|jpeg|png|webp)\.(jpg|jpeg|png|webp)$/i, '.$2');
    const storagePath = `${section}/${cleanName}`;

    const buffer = await readFile(join(dir, filename));

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(storagePath, buffer, {
        contentType: mimeType(ext),
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ✗ Upload failed: ${filename} — ${uploadError.message}`);
      continue;
    }

    const title = filenameToTitle(cleanName);
    const { error: dbError } = await supabase.from('gallery_images').upsert(
      {
        title,
        category: section === 'work' ? 'Bridal transformations' : 'Achievements',
        tag: section === 'work' ? 'Work' : 'Achievement',
        section,
        storage_path: storagePath,
        alt_text: title,
      },
      { onConflict: 'storage_path' }
    );

    if (dbError) {
      console.error(`  ✗ DB insert failed: ${filename} — ${dbError.message}`);
    } else {
      console.log(`  ✓ ${storagePath}`);
    }
  }
}

function mimeType(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return map[ext] ?? 'image/jpeg';
}

function filenameToTitle(filename: string): string {
  return filename
    .replace(/\.(jpg|jpeg|heic|png|webp)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

seedImages().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
