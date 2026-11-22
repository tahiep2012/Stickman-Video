#!/usr/bin/env node
/**
 * Antigravity Scene Studio for directing-stickman-videos
 * 
 * Features:
 * 1. AI-Only Image Generation: EXCLUSIVELY uses AI Image APIs (Gemini Imagen, Agnes AI, or image-generator subagent).
 *    Internal procedural SVG vector generation is STRICTLY FORBIDDEN.
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

import { generateAgnesImage } from './agnes-media.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const B1_STYLE_ANCHOR = `Minimalist 2D hand-drawn stick figure animation style, 16:9 widescreen cinematic full-frame composition, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, full-frame illustrated background spreading across the entire 16:9 canvas, strictly 2D flat, no 3D shading, consistent line weight, cozy hand-drawn illustration style, no text, no typography.`;

export const B1_STYLE_ANCHOR_9x16 = `Minimalist 2D hand-drawn stick figure animation style, 9:16 vertical cinematic full-frame composition, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, full-frame illustrated background filling the entire vertical 9:16 canvas with foreground and background depth, strictly 2D flat, no 3D shading, consistent line weight, cozy hand-drawn illustration style, no text, no typography.`;

const B6_DNA_FALLBACK = {
  style_id: 'B6',
  name: 'Ink Traveler (Người Lữ Hành Khăn Choàng)',
  base_style: 'Minimalist 2D hand-drawn editorial line art illustration, clean uniform black ink linework on warm off-white sketchbook paper background, strictly flat 2D minimal shading, no gradients, no 3D rendering, no text, no letters, no words, no numbers.',
  protagonist_dna: 'Protagonist Character DNA (LOCKED): minimalist slender hand-drawn figure with a clean smooth round white bald head (no hair, no nose, no ears), simple expressive small black-ink dot eyes and subtle curved eyebrows, wearing thin round black wire glasses, a crisp white minimalist knee-length tailored overcoat drawn in clean black ink outlines with simple slim white trousers and dark ink shoes, and ONE signature flowing muted terracotta-amber knitted scarf wrapped neatly around the neck with two short tails hanging down the front.',
  color_lock: 'Color Lock: ONLY the protagonist wears the warm muted terracotta-amber scarf and thin round wire glasses; whenever secondary people appear in the scene, draw them strictly as faint monochrome black-and-white ink outlines without color, scarves, or glasses (do not add extra people unless described in the scene).',
  aspect_anchors: {
    '16:9': '16:9 widescreen cinematic full-frame composition, wide illustrated editorial background spreading edge-to-edge across the entire frame.',
    '9:16': '9:16 vertical cinematic full-frame composition, rich vertical editorial background with foreground and background depth filling the entire frame.'
  }
};

function loadB6Dna() {
  const p = path.join(ROOT, 'assets', 'b6', 'character-dna.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return B6_DNA_FALLBACK;
  }
}

export const B6_TRAVELER_DNA = loadB6Dna();

export function getStyleAnchor(aspect = '16:9', style = 'B6') {
  const normalizedStyle = String(style || 'B6').toUpperCase();
  if (normalizedStyle === 'B6' || normalizedStyle === 'TRAVELER') {
    const aspectAnchor = B6_TRAVELER_DNA.aspect_anchors?.[aspect] || B6_TRAVELER_DNA.aspect_anchors['16:9'];
    return `${B6_TRAVELER_DNA.base_style} ${aspectAnchor} ${B6_TRAVELER_DNA.protagonist_dna} ${B6_TRAVELER_DNA.color_lock}`;
  }
  return aspect === '9:16' ? B1_STYLE_ANCHOR_9x16 : B1_STYLE_ANCHOR;
}

/**
 * Convert a white/off-white background into transparent 16:9 PNG canvas
 * @param {string|Buffer} input
 * @param {string} [outputPath]
 * @param {number} [targetWidth=1920]
 * @param {number} [targetHeight=1080]
 * @param {number} [threshold=215]
 */
export async function toTransparent16x9(input, outputPath = null, targetWidth = 1920, targetHeight = 1080, threshold = 215) {
  const buf = typeof input === 'string' ? fs.readFileSync(input) : input;
  const raw = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < raw.data.length; i += 4) {
    if (raw.data[i] >= threshold && raw.data[i + 1] >= (threshold - 5) && raw.data[i + 2] >= (threshold - 10)) {
      raw.data[i + 3] = 0;
    }
  }

  const trimmed = await sharp(raw.data, { raw: raw.info }).trim().png().toBuffer();

  const contentW = Math.round(targetWidth * 0.92);
  const contentH = Math.round(targetHeight * 0.92);
  const resized = await sharp(trimmed)
    .resize({ width: contentW, height: contentH, fit: 'inside' })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const left = Math.round((targetWidth - meta.width) / 2);
  const top = Math.round((targetHeight - meta.height) / 2);

  const finalBuf = await sharp(resized)
    .extend({
      top,
      bottom: targetHeight - meta.height - top,
      left,
      right: targetWidth - meta.width - left,
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
 * Normalize an image to exact 16:9 full-frame dimensions (cover crop, zero black/white borders)
 * @param {string|Buffer} input
 * @param {string} [outputPath]
 * @param {number} [targetWidth=1920]
 * @param {number} [targetHeight=1080]
 */
export async function normalizeFullFrame16x9(input, outputPath = null, targetWidth = 1920, targetHeight = 1080) {
  const buf = typeof input === 'string' ? fs.readFileSync(input) : input;
  const finalBuf = await sharp(buf)
    .resize({ width: targetWidth, height: targetHeight, fit: 'cover', position: 'center' })
    .png()
    .toBuffer();

  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, finalBuf);
  }
  return finalBuf;
}

/**
 * Legacy helper: Convert a white/off-white background into transparent square PNG
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
 * Build a pure cinematic 16:9 full-frame project.json layout:
 * - Full-bleed edge-to-edge 16:9 illustration covering the entire video frame (1280x720 design plane, scales cleanly to 1080p/4K).
 * - ZERO Topic Badges, ZERO underlined clutter.
 * - Perfectly aligned with subtitles.
 * @param {string} projectPath 
 */
export function buildPureCinematicLayout(projectPath) {
  const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
  const planeW = 1280;
  const planeH = Math.round(1280 * (project.height || 720) / (project.width || 1280));

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
          x: 0,
          y: 0,
          w: planeW,
          h: planeH,
          fit: 'cover',
          keys: [
            { t: 0, alpha: 0.9 },
            { t: 0.4, alpha: 1.0 },
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

/**
 * Check if local CIT Voice Studio (127.0.0.1:8001) is online and ready
 */
export async function checkCitHealth(baseUrl = process.env.CIT_BASE_URL || 'http://127.0.0.1:8001') {
  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, data };
    }
  } catch (e) {
    return { online: false, error: e.message };
  }
  return { online: false, error: 'Unhealthy response' };
}

/**
 * Generate studio-grade Vietnamese voiceover & synced SRT via CIT Voice Studio (VieNeu-TTS-v3 Turbo 48kHz)
 */
export async function generateVoiceCit(options = {}) {
  const {
    text,
    scriptFile,
    outputAudio = 'narration.mp3',
    outputSrt = 'input.srt',
    voice = process.env.CIT_VOICE || 'Văn Hải',
    speed = parseFloat(process.env.CIT_SPEED || '1.0'),
    baseUrl = process.env.CIT_BASE_URL || 'http://127.0.0.1:8001'
  } = options;

  let content = text || '';
  if (scriptFile && !content) {
    content = fs.readFileSync(path.resolve(scriptFile), 'utf8');
  }
  content = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/^[-*]\s+\*\*.*?\*\*:.*$/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[—–]/g, ', ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();

  if (!content) throw new Error('Empty script text for CIT Voice Studio');

  const health = await checkCitHealth(baseUrl);
  if (!health.online) {
    throw new Error(`CIT Voice Studio is NOT running at ${baseUrl}. Please launch CIT-Voice-Studio.exe on your machine.`);
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/api/tts/generate-with-subtitles`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: content,
      voice_id: voice,
      speed,
      format: 'wav'
    }),
    signal: AbortSignal.timeout(300000)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`CIT Voice Studio HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const audioBytes = Buffer.from(data.audio_base64, 'base64');
  const resolvedAudio = path.resolve(outputAudio);
  const resolvedSrt = path.resolve(outputSrt);
  fs.mkdirSync(path.dirname(resolvedAudio), { recursive: true });
  fs.mkdirSync(path.dirname(resolvedSrt), { recursive: true });

  const tempWav = resolvedAudio.replace(/\.[^.]+$/, '.temp.wav');
  fs.writeFileSync(tempWav, audioBytes);

  if (resolvedAudio.toLowerCase().endsWith('.mp3')) {
    execSync(`ffmpeg -y -i "${tempWav}" -c:a libmp3lame -b:a 192k -ar 48000 "${resolvedAudio}"`, { stdio: 'ignore' });
    if (fs.existsSync(tempWav)) fs.unlinkSync(tempWav);
  } else {
    fs.renameSync(tempWav, resolvedAudio);
  }

  fs.writeFileSync(resolvedSrt, data.srt || '', 'utf8');

  return {
    status: 'success',
    audio_path: resolvedAudio,
    srt_path: resolvedSrt,
    duration_seconds: data.duration_seconds,
    voice_id: voice,
    speed,
    sample_rate: 48000
  };
}

/**
 * Build a visual contact sheet grid of all shot_XX.png images for Semi-Auto review
 * @param {string} scenesDir
 * @param {string} [outputPath]
 * @param {number} [cols=4]
 */
export async function buildContactSheet(scenesDir, outputPath = null, cols = 4) {
  const dir = path.resolve(scenesDir);
  const files = fs.readdirSync(dir)
    .filter(f => /^shot_\d+\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (!files.length) throw new Error(`No shot_XX images found in ${dir}`);

  const firstMeta = await sharp(path.join(dir, files[0])).metadata();
  const isPortrait = (firstMeta.height || 1080) > (firstMeta.width || 1920);
  const thumbW = isPortrait ? 270 : 480;
  const thumbH = isPortrait ? 480 : 270;
  const gap = 16;
  const rows = Math.ceil(files.length / cols);
  const sheetW = cols * thumbW + (cols + 1) * gap;
  const sheetH = rows * thumbH + (rows + 1) * gap;

  const composites = [];
  for (let i = 0; i < files.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = gap + col * (thumbW + gap);
    const top = gap + row * (thumbH + gap);
    const label = files[i].replace(/\.[^.]+$/, '').toUpperCase();
    const badgeSvg = Buffer.from(
      `<svg width="${thumbW}" height="${thumbH}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect x="8" y="8" width="110" height="32" rx="6" fill="rgba(17,19,22,0.82)"/>` +
      `<text x="63" y="29" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#ffffff">${label}</text>` +
      `</svg>`
    );
    const resized = await sharp(path.join(dir, files[i]))
      .resize({ width: thumbW, height: thumbH, fit: 'cover', position: 'center' })
      .composite([{ input: badgeSvg, top: 0, left: 0 }])
      .png()
      .toBuffer();
    composites.push({ input: resized, left, top });
  }

  const out = path.resolve(outputPath || path.join(dir, '..', 'output', 'review-contact-sheet.png'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp({
    create: { width: sheetW, height: sheetH, channels: 4, background: { r: 24, g: 26, b: 30, alpha: 1 } }
  })
    .composite(composites)
    .png()
    .toFile(out);

  return { output: out, count: files.length, cols, rows, aspect: isPortrait ? '9:16' : '16:9' };
}

// CLI usage
async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const flagValue = flag => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
  };
  const aspect = flagValue('--aspect') || '16:9';
  const targetW = aspect === '9:16' ? 1080 : 1920;
  const targetH = aspect === '9:16' ? 1920 : 1080;

  if (cmd === 'transparent') {
    const cleanArgs = args.filter((a, i) => a !== '--aspect' && args[i - 1] !== '--aspect');
    const target = cleanArgs[0];
    if (!target) throw new Error('Specify file or directory');
    const out = cleanArgs[1] || target.replace(/\.[^.]+$/, '.png');
    await toTransparent16x9(target, out, targetW, targetH);
    console.log(JSON.stringify({ input: target, output: out, aspect, status: `normalized_transparent_${aspect}` }));
  } else if (cmd === 'fullframe') {
    const cleanArgs = args.filter((a, i) => a !== '--aspect' && args[i - 1] !== '--aspect');
    const target = cleanArgs[0];
    if (!target) throw new Error('Specify file');
    const out = cleanArgs[1] || target.replace(/\.[^.]+$/, '.png');
    await normalizeFullFrame16x9(target, out, targetW, targetH);
    console.log(JSON.stringify({ input: target, output: out, aspect, status: `normalized_fullframe_${aspect}` }));
  } else if (cmd === 'contact-sheet') {
    const [scenesDir, out, cols] = args;
    if (!scenesDir) throw new Error('Usage: scene-studio.mjs contact-sheet <scenes_dir> [output_png] [cols]');
    const res = await buildContactSheet(scenesDir, out, cols ? parseInt(cols, 10) : 4);
    console.log(JSON.stringify(res, null, 2));
  } else if (cmd === 'generate-shot') {
    const normalizeFlag = args.includes('--normalize');
    const style = (flagValue('--style') || 'B6').toUpperCase();
    const cleanArgs = args.filter((a, i) =>
      a !== '--allow-network' &&
      a !== '--normalize' &&
      a !== '--aspect' && args[i - 1] !== '--aspect' &&
      a !== '--style' && args[i - 1] !== '--style'
    );
    const [out, ...descParts] = cleanArgs;
    const desc = descParts.join(' ');
    if (!out || !desc) throw new Error('Usage: scene-studio.mjs generate-shot <output_png> <description> [--style B6|B1] [--aspect 16:9|9:16] [--normalize]');
    const fullPrompt = `${getStyleAnchor(aspect, style)} Scene: ${desc}`;
    console.log(`Generating ${style} (${aspect}) full-frame artwork via Agnes AI: "${desc}"...`);
    const res = await generateAgnesImage({
      prompt: fullPrompt,
      output: out,
      model: 'agnes-image-2.5-flash',
      aspect,
      normalize: normalizeFlag
    });
    console.log(JSON.stringify(res, null, 2));
  } else if (cmd === 'cit-health') {
    const health = await checkCitHealth();
    console.log(JSON.stringify(health, null, 2));
  } else if (cmd === 'voice-cit') {
    const cleanArgs = args.filter((a, i) =>
      a !== '--voice' && args[i - 1] !== '--voice' &&
      a !== '--speed' && args[i - 1] !== '--speed' &&
      a !== '--base-url' && args[i - 1] !== '--base-url'
    );
    const [scriptOrText, projectDir] = cleanArgs;
    if (!scriptOrText) throw new Error('Usage: scene-studio.mjs voice-cit <script_file|text> [project_dir] [--voice <voice>] [--speed <speed>]');
    const pDir = projectDir ? path.resolve(projectDir) : process.cwd();
    const voice = flagValue('--voice') || process.env.CIT_VOICE || 'Văn Hải';
    const speed = parseFloat(flagValue('--speed') || process.env.CIT_SPEED || '1.0');
    const isFile = fs.existsSync(scriptOrText);
    const res = await generateVoiceCit({
      scriptFile: isFile ? scriptOrText : undefined,
      text: !isFile ? scriptOrText : undefined,
      outputAudio: path.join(pDir, 'narration.mp3'),
      outputSrt: path.join(pDir, 'input.srt'),
      voice,
      speed
    });
    console.log(JSON.stringify(res, null, 2));
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
    console.log(`  node scene-studio.mjs cit-health`);
    console.log(`  node scene-studio.mjs voice-cit <script_file|text> [project_dir] [--voice <voice>] [--speed <speed>]`);
    console.log(`  node scene-studio.mjs generate-shot <output_png> <description> [--style B6|B1] [--aspect 16:9|9:16] [--normalize]`);
    console.log(`  node scene-studio.mjs fullframe <file> [output_file] [--aspect 16:9|9:16]`);
    console.log(`  node scene-studio.mjs transparent <file> [output_file] [--aspect 16:9|9:16]`);
    console.log(`  node scene-studio.mjs contact-sheet <scenes_dir> [output_png] [cols]`);
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
