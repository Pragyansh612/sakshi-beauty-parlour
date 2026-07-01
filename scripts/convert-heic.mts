/**
 * Converts every .HEIC file in ./work/ and ./acheivement/ to a sibling .jpg file.
 * Originals are left untouched. Safe to re-run (skips files that already have
 * a converted .jpg counterpart).
 *
 * Usage: npx tsx scripts/convert-heic.ts
 * Requires: heic-convert (installed on demand via npx, no project dependency needed)
 */

import { readdir, readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';
// @ts-expect-error — no bundled types for heic-convert
import convert from 'heic-convert';

const DIRS = ['./work', './acheivement'];

async function convertDir(dir: string) {
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    console.warn(`Directory ${dir} not found — skipping.`);
    return;
  }

  for (const filename of files) {
    if (!/\.heic$/i.test(filename)) continue;

    const inputPath = join(dir, filename);
    const outputName = filename.replace(/\.heic$/i, '.jpg');
    const outputPath = join(dir, outputName);

    try {
      await access(outputPath);
      console.log(`  - Skipping ${filename} (already converted)`);
      continue;
    } catch {
      // doesn't exist yet — proceed
    }

    console.log(`  Converting ${filename} -> ${outputName}`);
    const inputBuffer = await readFile(inputPath);
    const outputBuffer = (await convert({ buffer: inputBuffer, format: 'JPEG', quality: 0.9 })) as Buffer;
    await writeFile(outputPath, outputBuffer);
  }
}

async function main() {
  for (const dir of DIRS) {
    console.log(`Converting HEIC files in ${dir}...`);
    await convertDir(dir);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
