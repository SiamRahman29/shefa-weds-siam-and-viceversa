#!/usr/bin/env node
/**
 * optimize-images.mjs
 *
 * Batch-resize and compress raw wedding photos into web-ready JPEG + WebP pairs.
 *
 *   Usage:
 *     npm run optimize                            # raw-photos/  →  images/
 *     node scripts/optimize-images.mjs ./pics     # ./pics/      →  images/
 *     node scripts/optimize-images.mjs ./pics ./out
 *
 *   Naming convention in the *input* folder:
 *     - Any file whose name starts with "hero" → resized to HERO_WIDTH px wide.
 *     - Everything else                       → resized to PHOTO_WIDTH px wide.
 *     - The base filename (minus extension) is preserved on output.
 *
 *   So "hero.HEIC" becomes images/hero.jpg + images/hero.webp.
 *   And "photo-01.jpg" becomes images/photo-01.jpg + images/photo-01.webp.
 */

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const HERO_PATTERN = /^hero\b/i;
const HERO_WIDTH = 1800;
const PHOTO_WIDTH = 800;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;

const INPUT_DIR = process.argv[2] || './raw-photos';
const OUTPUT_DIR = process.argv[3] || './images';

async function main() {
  try {
    await stat(INPUT_DIR);
  } catch {
    console.error(`Input folder not found: ${INPUT_DIR}`);
    console.error(`Create it and drop your raw photos in, then re-run.`);
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = (await readdir(INPUT_DIR))
    .filter((f) => /\.(jpe?g|png|tiff?|heic|heif|webp)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error(`No images found in ${INPUT_DIR}.`);
    process.exit(1);
  }

  console.log(`Optimizing ${files.length} image(s): ${INPUT_DIR} → ${OUTPUT_DIR}\n`);

  let totalIn = 0;
  let totalOut = 0;

  for (const file of files) {
    const isHero = HERO_PATTERN.test(file);
    const targetWidth = isHero ? HERO_WIDTH : PHOTO_WIDTH;
    const stem = basename(file, extname(file));
    const inputPath = join(INPUT_DIR, file);
    const inputBytes = (await stat(inputPath)).size;
    totalIn += inputBytes;

    const pipeline = sharp(inputPath)
      .rotate() // honor EXIF orientation so portrait phone shots come out upright
      .resize(targetWidth, null, { withoutEnlargement: true });

    const jpegPath = join(OUTPUT_DIR, `${stem}.jpg`);
    const webpPath = join(OUTPUT_DIR, `${stem}.webp`);

    await pipeline.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(jpegPath);
    await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath);

    const jpegBytes = (await stat(jpegPath)).size;
    const webpBytes = (await stat(webpPath)).size;
    totalOut += jpegBytes + webpBytes;

    const tag = isHero ? '[hero]' : '      ';
    console.log(
      `  ${tag} ${file.padEnd(28)} ${kb(inputBytes).padStart(8)}  →  ` +
      `${stem}.jpg ${kb(jpegBytes).padStart(7)}   ${stem}.webp ${kb(webpBytes).padStart(7)}`
    );
  }

  console.log(
    `\nDone. ${files.length} photo(s) processed.\n` +
    `  Input total:  ${kb(totalIn)}\n` +
    `  Output total: ${kb(totalOut)} (jpg + webp)\n` +
    `  Page weight:  ~${kb(totalOut / 2)} typical (browsers fetch one format)\n`
  );

  if (totalOut / 2 > 1500 * 1024) {
    console.warn(
      'Heads up: typical page weight is over 1.5 MB. Consider lowering JPEG_QUALITY ' +
      'or WEBP_QUALITY in this script if guests are on slow connections.\n'
    );
  }
}

function kb(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

main().catch((err) => {
  console.error('\nOptimization failed:', err.message);
  process.exit(1);
});
