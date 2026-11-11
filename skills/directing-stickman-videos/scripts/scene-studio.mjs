#!/usr/bin/env node
/**
 * Antigravity Scene Studio for directing-stickman-videos
 * 
 * Features:
 * 1. Style Anchor & Prompt Generation for Antigravity's image-generator subagent.
 * 2. Background Transparency & Zero-Edge-Cut Normalization:
 *    - Automatically removes white/off-white background.
 *    - Trims transparent borders and resizes to 85% safe canvas.
 *    - Guarantees 100% self-contained standalone figures with safety margins (zero cut edges).
 * 3. Hero-Centric Layout Builder:
 *    - Spacious, uncluttered, super-sized centered illustrations (w: 640).
 *    - ZERO redundant topic badges or underlined clutter (pure cinematic focus).
 * 4. Zero-Duplicate Shot Validator:
 *    - Checks sha256 hashes of all shot images to ensure 100% unique artwork across scenes.
 * 5. Audio Muxer: easily attaches real narration voiceover to the rendered MP4.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const B1_STYLE_ANCHOR = `Minimalist 2D hand-drawn stick figure, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, isolated on solid pure white background (#FFFFFF), strictly 2D flat, no 3D shading, no gradients, no shadows, consistent line weight, cozy hand-drawn illustration style, completely standalone figure not touching image boundaries.`;

/**
 * Convert a white/off-white background into transparent square PNG with guaranteed safety margin
 * @param {string|Buffer} input 
 * @param {string} [outputPath] 
 * @param {number} [targetSize=900]
 * @param {number} [threshold=215] 
 */
export async function toTransparentSquare(input, outputPath = null, targetSize = 900, threshold = 215) {
  const buf = typeof input === 'string' ? fs.readFileSync(input) : input;
  const raw = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < raw.data.length; i += 4) {
    if (raw.data[i] >= threshold && raw.data[i + 1] >= (threshold - 5) && raw.data[i + 2] >= (threshold - 10)) {
      raw.data[i + 3] = 0;
    }
  }

  // Trim whitespace
  const trimmed = await sharp(raw.data, { raw: raw.info }).trim().png().toBuffer();

  // Normalize size to 85% of target canvas to prevent any border clipping
  const contentSize = Math.round(targetSize * 0.85);
  const resized = await sharp(trimmed)
    .resize({ width: contentSize, height: contentSize, fit: 'inside' })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const left = Math.round((targetSize - meta.width) / 2);
  const top = Math.round((targetSize - meta.height) / 2);

  const finalBuf = await sharp(resized)
    .extend({
      top: top,
      bottom: targetSize - meta.height - top,
      left: left,
      right: targetSize - meta.width - left,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, finalBuf);
  }
  return finalBuf;
}

/**
 * Validate that all shots in a project directory have 100% unique artwork
 * @param {string} scenesDir 
 * @param {number} totalShots 
 */
export function validateUniqueness(scenesDir, totalShots) {
  const hashes = new Map();
  const duplicates = [];

  for (let i = 1; i <= totalShots; i++) {
    const pad = String(i).padStart(2, '0');
    const f = path.join(scenesDir, `shot_${pad}.png`);
    if (!fs.existsSync(f)) {
      throw new Error(`[Uniqueness Gate] Missing shot file: ${f}`);
    }
    const buf = fs.readFileSync(f);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    if (hashes.has(hash)) {
      duplicates.push({ shot: pad, original: hashes.get(hash) });
    } else {
      hashes.set(hash, pad);
    }
  }

  if (duplicates.length > 0) {
    throw new Error(`[Uniqueness Gate Failed] Found ${duplicates.length} duplicate shots: ` +
      duplicates.map(d => `Shot ${d.shot} duplicates Shot ${d.original}`).join(', '));
  }

  return { uniqueCount: hashes.size, total: totalShots, status: 'pass' };
}

/**
 * Build a pure cinematic project.json layout:
 * - Centered, prominent hero illustrations (w: 640).
 * - ZERO Topic Badges, ZERO underlined clutter.
 * - Perfectly aligned with subtitles.
 * @param {string} projectPath 
 */
export function buildPureCinematicLayout(projectPath) {
  const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

  project.shots = project.shots.map((shot, index) => {
    const pad = String(index + 1).padStart(2, '0');
    const heroPath = `scenes/shot_${pad}.png`;

    return {
      start: shot.start,
      end: shot.end,
      layers: [
        {
          type: 'image',
          path: heroPath,
          x: 320,
          y: 35,
          w: 640,
          keys: [
            { t: 0, y: 50, alpha: 0.85 },
            { t: 0.5, y: 35, alpha: 1.0 },
          ],
        }
      ],
    };
  });

  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), 'utf8');
  return project;
}

/**
 * Mux real voice audio into rendered MP4 video
 */
export function muxAudio(videoPath, audioPath, outputPath) {
  if (!outputPath) {
    outputPath = videoPath.replace(/\.mp4$/i, '_with_audio.mp4');
  }
  console.log(`Muxing audio from ${audioPath} into ${videoPath} -> ${outputPath}...`);
  const cmd = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest "${outputPath}"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log(`Audio successfully muxed into ${outputPath}`);
  return outputPath;
}

// CLI usage
async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  if (cmd === 'transparent') {
    const target = args[0];
    if (!target) throw new Error('Specify file or directory');
    const out = args[1] || target.replace(/\.[^.]+$/, '.png');
    await toTransparentSquare(target, out);
    console.log(JSON.stringify({ input: target, output: out, status: 'normalized_transparent' }));
  } else if (cmd === 'validate-unique') {
    const [scenesDir, count] = args;
    if (!scenesDir || !count) throw new Error('Usage: scene-studio.mjs validate-unique <scenes_dir> <total_count>');
    const res = validateUniqueness(scenesDir, parseInt(count, 10));
    console.log(JSON.stringify(res));
  } else if (cmd === 'mux-audio') {
    const [video, audio, out] = args;
    if (!video || !audio) throw new Error('Usage: scene-studio.mjs mux-audio <film.mp4> <voice.m4a|mp3> [output.mp4]');
    muxAudio(video, audio, out);
  } else {
    console.log(`Usage:`);
    console.log(`  node scene-studio.mjs transparent <file> [output_file]`);
    console.log(`  node scene-studio.mjs validate-unique <scenes_dir> <count>`);
    console.log(`  node scene-studio.mjs mux-audio <film.mp4> <voice.m4a|mp3> [output.mp4]`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
