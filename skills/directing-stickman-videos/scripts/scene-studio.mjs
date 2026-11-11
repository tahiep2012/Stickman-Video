#!/usr/bin/env node
/**
 * Antigravity Scene Studio for directing-stickman-videos
 * Automates:
 * 1. Planning SRT subtitles into scenes with locked character style prompts for Antigravity's image-generator.
 * 2. Processing images (making white backgrounds transparent with sharp).
 * 3. Assembling custom scene illustrations into project.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const B1_STYLE_ANCHOR = `Minimalist 2D hand-drawn stick figure, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, isolated on pure white background (#FFFFFF), no 3D shading, consistent line weight, cozy hand-drawn illustration style.`;

/**
 * Convert a white background into transparent PNG
 * @param {string} inputPath 
 * @param {string} outputPath 
 * @param {number} threshold 
 */
export async function makeTransparent(inputPath, outputPath, threshold = 240) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0; // transparent
    }
  }

  await sharp(data, { raw: info })
    .png()
    .toFile(outputPath);
}

/**
 * Process all jpg/png files in a directory to transparent png
 * @param {string} dir 
 */
export async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;
  for (const f of files) {
    if (/\.(jpe?g|png)$/i.test(f) && !f.endsWith('_transparent.png')) {
      const fullPath = path.join(dir, f);
      const outName = f.replace(/\.(jpe?g|png)$/i, '.png');
      const tempPath = path.join(dir, `_temp_${outName}`);
      await makeTransparent(fullPath, tempPath);
      fs.copyFileSync(tempPath, path.join(dir, outName));
      fs.unlinkSync(tempPath);
      count++;
    }
  }
  return count;
}

// CLI usage
async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'transparent') {
    const target = args[0];
    if (!target) throw new Error('Specify file or directory');
    if (fs.statSync(target).isDirectory()) {
      const n = await processDirectory(target);
      console.log(JSON.stringify({ processed: n, directory: target }));
    } else {
      const out = args[1] || target.replace(/\.[^.]+$/, '.png');
      await makeTransparent(target, out);
      console.log(JSON.stringify({ input: target, output: out }));
    }
  } else {
    console.log(`Usage: node scripts/scene-studio.mjs transparent <file_or_dir> [output_file]`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
