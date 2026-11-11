#!/usr/bin/env node
/**
 * Antigravity Scene Studio for directing-stickman-videos
 * 
 * Features:
 * 1. Style Anchor & Prompt Generation for Antigravity's image-generator subagent.
 * 2. Background Transparency Processing (via sharp) for clean 2D stickman overlays.
 * 3. Hero-Centric Layout Builder: spacious, uncluttered, super-sized illustrations (w: 640-660),
 *    zero redundant subtitle text, and dynamic micro-animations.
 * 4. Audio Muxer: easily attaches real narration voiceover to the rendered MP4.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

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
export async function makeTransparent(inputPath, outputPath, threshold = 238) {
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
    if (/\.(jpe?g|png)$/i.test(f) && !f.endsWith('_transparent.png') && !f.startsWith('_temp_')) {
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

/**
 * Build an upgraded project.json layout with enlarged hero illustrations
 * and zero redundant text clutter.
 */
export function buildHeroLayout(projectPath, shotTitles = [], shotConfigs = []) {
  const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

  project.shots = project.shots.map((shot, index) => {
    const pad = String(index + 1).padStart(2, '0');
    const title = shotTitles[index] || `PHÂN CẢNH ${pad}`;
    const config = shotConfigs[index] || { layout: 'center' };
    const heroPath = `scenes/shot_${pad}.png`;

    const layers = [];
    const isCenter = config.layout === 'center';
    const headerX = 80;
    const headerY = 50;
    const titleWidth = Math.min(title.length * 28 + 20, 520);

    // 1. Topic Badge
    layers.push({
      type: 'text',
      text: title,
      x: headerX,
      y: headerY,
      size: 42,
      bold: true,
      color: '#191916',
    });

    // 2. Animated underline
    layers.push({
      type: 'underline',
      x: headerX,
      y: headerY + 58,
      w: Math.max(260, titleWidth),
      color: '#191916',
      lineWidth: 4,
      keys: [
        { t: 0, progress: 0 },
        { t: 0.45, progress: 1 },
      ],
    });

    // 3. Hero Stickman Illustration (Super-sized: w: 640 - 660)
    if (isCenter) {
      layers.push({
        type: 'image',
        path: heroPath,
        x: 320,
        y: 25,
        w: 650,
        keys: [
          { t: 0, y: 40, alpha: 0.85 },
          { t: 0.5, y: 25, alpha: 1.0 },
        ],
      });
    } else {
      // Two-column split layout: Left prop + Right hero
      if (config.prop) {
        layers.push({
          type: 'image',
          path: config.prop,
          x: 120,
          y: 190,
          w: 300,
          keys: [
            { t: 0, angle: -0.05 },
            { t: 1.0, angle: 0.04 },
            { t: 2.0, angle: 0 },
          ],
        });
      } else if (config.arrow) {
        layers.push({
          type: 'arrow',
          x: config.arrow.x,
          y: config.arrow.y,
          w: config.arrow.w,
          color: '#191916',
          lineWidth: 4,
          keys: [
            { t: 0, progress: 0 },
            { t: 0.6, progress: 1 },
          ],
        });
      }

      layers.push({
        type: 'image',
        path: heroPath,
        x: 580,
        y: 20,
        w: 640,
        keys: [
          { t: 0, y: 38, alpha: 0.85 },
          { t: 0.45, y: 20, alpha: 1.0 },
        ],
      });
    }

    return {
      start: shot.start,
      end: shot.end,
      layers,
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
    if (fs.statSync(target).isDirectory()) {
      const n = await processDirectory(target);
      console.log(JSON.stringify({ processed: n, directory: target }));
    } else {
      const out = args[1] || target.replace(/\.[^.]+$/, '.png');
      await makeTransparent(target, out);
      console.log(JSON.stringify({ input: target, output: out }));
    }
  } else if (cmd === 'mux-audio') {
    const [video, audio, out] = args;
    if (!video || !audio) throw new Error('Usage: scene-studio.mjs mux-audio <film.mp4> <narration.m4a|mp3> [output.mp4]');
    muxAudio(video, audio, out);
  } else {
    console.log(`Usage:`);
    console.log(`  node scene-studio.mjs transparent <file_or_dir> [output_file]`);
    console.log(`  node scene-studio.mjs mux-audio <film.mp4> <voice.m4a|mp3> [output.mp4]`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
