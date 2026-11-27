#!/usr/bin/env node
/**
 * Stickman-Video Cinema Render Engine v2.0 (B6 / B6-EN Editorial Standard)
 *
 * Implements all 4 Cinematic Retention Upgrades in a unified, reusable CLI:
 *   1. Subpixel Ken Burns Motion (30fps, 2x supersampled -> 0% jitter)
 *      Presets: zoom_in, zoom_out, pan_lr, pan_rl, drift_up
 *   2. Rhythmic Editorial Transitions (xfade 0.35s + intentional hard cuts at Re-Hooks/Punchlines)
 *      Zero SRT sync drift via automatic fade-overlap duration compensation.
 *   3. 3-Layer Cinema Audio Engine + YouTube -14 LUFS Mastering:
 *      - Seamless BGM (handles shorter OR longer videos via 3.5s acrossfade loop + fade in/out)
 *      - Automatic Sidechain Ducking under Narration + vocal-frequency carve EQ
 *      - Intentional AUDIO CUT dramatic silence dropouts before major twists
 *      - Restrained Editorial Micro-SFX (page_turn, pen_stroke, soft_click, warm_swell)
 *      - Final EBU R128 loudnorm (-14 LUFS, -1.5 dBTP)
 *   4. Living Paper Feel (8fps subtle animated sketchbook grain overlay + gentle warm vignette)
 *      Zero Burned-in Subtitles Invariance preserved (exports clean film.mp4 + external film.srt).
 *
 * Usage:
 *   node scripts/render_cinema.mjs \
 *       --project-dir projects/vi/cognitive-offloading-psychology \
 *       [--plan cinema_plan.json] [--aspect 16:9] [--niche psychology] \
 *       [--bgm "assets/audio/Asher Fulero - Night Snow.mp3"] [--no-paper] [--no-bgm]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');

function parseArgs(argv) {
  const opts = {
    projectDir: null,
    planPath: null,
    aspect: '16:9',
    niche: null,
    bgm: null,
    fps: 30,
    fadeDur: 0.35,
    bgmLufs: -30, // Exact calibrated BGM loudness (sits ~14 dB below -16 LUFS voice in pauses, ~17-18 dB under speech)
    voLufs: -16,
    paperOpacity: 0.14,
    noPaper: false,
    noBgm: false,
    noSfx: false,
    audioOnly: false,
    concurrency: 4,
    keepTmp: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project-dir') opts.projectDir = argv[++i];
    else if (a === '--plan') opts.planPath = argv[++i];
    else if (a === '--aspect') opts.aspect = argv[++i];
    else if (a === '--niche') opts.niche = argv[++i];
    else if (a === '--bgm') opts.bgm = argv[++i];
    else if (a === '--fps') opts.fps = Number(argv[++i]);
    else if (a === '--fade-dur') opts.fadeDur = Number(argv[++i]);
    else if (a === '--bgm-lufs') opts.bgmLufs = Number(argv[++i]);
    else if (a === '--bgm-db') opts.bgmLufs = Number(argv[++i]); // backwards-compat alias
    else if (a === '--paper-opacity') opts.paperOpacity = Number(argv[++i]);
    else if (a === '--no-paper') opts.noPaper = true;
    else if (a === '--no-bgm') opts.noBgm = true;
    else if (a === '--no-sfx') opts.noSfx = true;
    else if (a === '--audio-only') opts.audioOnly = true;
    else if (a === '--concurrency') opts.concurrency = Math.max(1, Number(argv[++i]));
    else if (a === '--keep-tmp') opts.keepTmp = true;
  }
  if (!opts.projectDir) {
    throw new Error('Missing required --project-dir <path>');
  }
  return opts;
}

function ffprobeDuration(filePath) {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ], { encoding: 'utf8' });
  return parseFloat(out.trim());
}

function normalizeNicheSlug(niche) {
  if (!niche) return null;
  const n = niche.trim().toLowerCase();
  if (n.includes('tâm lý') || n.includes('tam ly') || n.includes('psych')) return 'psychology';
  if (n.includes('triết') || n.includes('triet') || n.includes('phil') || n.includes('stoic')) return 'philosophy';
  if (n.includes('kỹ năng') || n.includes('ky nang') || n.includes('life') || n.includes('skill') || n.includes('habit')) return 'life-skills';
  return n.replace(/\s+/g, '-');
}

function resolveBgmFile(explicitBgm, niche) {
  if (explicitBgm) {
    const p = path.isAbsolute(explicitBgm) ? explicitBgm : path.resolve(REPO_ROOT, explicitBgm);
    if (fs.existsSync(p)) return p;
    console.warn(`⚠️ Explicit BGM not found (${p}), falling back to niche/default BGM...`);
  }
  const audioRoot = path.join(REPO_ROOT, 'assets', 'audio');
  const bgmDir = path.join(audioRoot, 'bgm');
  const candidates = [];

  const slug = normalizeNicheSlug(niche);
  if (slug) {
    for (const ext of ['.mp3', '.wav', '.m4a', '.ogg']) {
      candidates.push(path.join(bgmDir, `${slug}${ext}`));
      candidates.push(path.join(audioRoot, `${slug}${ext}`));
    }
  }
  // Channel signature default fallback: philosophy.mp3 (Asher Fulero - Night Snow)
  candidates.push(path.join(bgmDir, 'philosophy.mp3'));
  candidates.push(path.join(audioRoot, 'Asher Fulero - Night Snow.mp3'));
  candidates.push(path.join(bgmDir, 'Asher Fulero - Night Snow.mp3'));

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  // Fallback: first audio file directly in assets/audio/bgm/ or assets/audio/
  for (const dir of [bgmDir, audioRoot]) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(f => /\.(mp3|wav|m4a|ogg)$/i.test(f))
        .sort();
      if (files.length > 0) return path.join(dir, files[0]);
    }
  }
  return null;
}

function ensureCinemaAssets() {
  const sfxDir = path.join(REPO_ROOT, 'assets', 'audio', 'sfx');
  const tex16 = path.join(REPO_ROOT, 'assets', 'textures', 'paper_grain_16x9.mp4');
  const tex9 = path.join(REPO_ROOT, 'assets', 'textures', 'paper_grain_9x16.mp4');
  const sfxOk = fs.existsSync(path.join(sfxDir, 'page_turn.wav')) && fs.existsSync(path.join(sfxDir, 'warm_swell.wav'));
  if (!sfxOk || !fs.existsSync(tex16) || !fs.existsSync(tex9)) {
    console.log('🛠️ Generating missing offline Micro-SFX & Living Paper Texture assets...');
    execFileSync('python', [path.join(REPO_ROOT, 'scripts', 'cinema_assets_gen.py')], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
  }
}

function loadCinemaPlan(projectDir, explicitPlanPath) {
  const planFile = explicitPlanPath
    ? (path.isAbsolute(explicitPlanPath) ? explicitPlanPath : path.resolve(REPO_ROOT, explicitPlanPath))
    : path.join(projectDir, 'cinema_plan.json');

  if (fs.existsSync(planFile)) {
    return JSON.parse(fs.readFileSync(planFile, 'utf8'));
  }

  // Fallback: auto-extract SHOT_DURATIONS from render-video.mjs if no cinema_plan.json exists
  const legacyRender = path.join(projectDir, 'render-video.mjs');
  if (fs.existsSync(legacyRender)) {
    const src = fs.readFileSync(legacyRender, 'utf8');
    const matches = [...src.matchAll(/\{\s*shot:\s*(\d+)\s*,\s*duration:\s*([\d.]+)\s*\}/g)];
    if (matches.length > 0) {
      const motions = ['pan_lr', 'zoom_in', 'zoom_out', 'pan_rl', 'zoom_in', 'drift_up'];
      const shots = matches.map((m, idx) => ({
        shot: Number(m[1]),
        duration: Number(m[2]),
        motion: idx === matches.length - 1 ? 'zoom_out' : motions[idx % motions.length],
        transition: idx === matches.length - 1 ? 'none' : ((idx + 1) % 5 === 0 ? 'cut' : 'fade'),
      }));
      return { shots, audioCuts: [], sfxCues: [] };
    }
  }
  throw new Error(`No cinema_plan.json or render-video.mjs found in ${projectDir}`);
}

function buildZoompanFilter(motion, frames, outW, outH, fps) {
  // 2x supersampling canvas prevents integer-pixel zoompan jitter completely!
  const supW = outW * 2;
  const supH = outH * 2;
  const denom = Math.max(1, frames - 1);
  let zExpr, xExpr, yExpr;

  switch (motion) {
    case 'zoom_in':
      zExpr = `1.0+0.065*on/${denom}`;
      xExpr = `iw/2-(iw/zoom/2)`;
      yExpr = `ih/2-(ih/zoom/2)`;
      break;
    case 'zoom_out':
      zExpr = `1.065-0.065*on/${denom}`;
      xExpr = `iw/2-(iw/zoom/2)`;
      yExpr = `ih/2-(ih/zoom/2)`;
      break;
    case 'pan_lr':
      zExpr = `1.07`;
      xExpr = `(iw-iw/zoom)*(0.12+0.76*on/${denom})`;
      yExpr = `ih/2-(ih/zoom/2)`;
      break;
    case 'pan_rl':
      zExpr = `1.07`;
      xExpr = `(iw-iw/zoom)*(0.88-0.76*on/${denom})`;
      yExpr = `ih/2-(ih/zoom/2)`;
      break;
    case 'drift_up':
      zExpr = `1.02+0.045*on/${denom}`;
      xExpr = `iw/2-(iw/zoom/2)`;
      yExpr = `(ih-ih/zoom)*(0.75-0.50*on/${denom})`;
      break;
    default:
      zExpr = `1.0+0.055*on/${denom}`;
      xExpr = `iw/2-(iw/zoom/2)`;
      yExpr = `ih/2-(ih/zoom/2)`;
      break;
  }

  return [
    `scale=${supW}:${supH}:force_original_aspect_ratio=increase:flags=lanczos`,
    `crop=${supW}:${supH}`,
    `zoompan=z='${zExpr}':x='${xExpr}':y='${yExpr}':d=${frames}:s=${outW}x${outH}:fps=${fps}`,
    `setsar=1`,
    `format=yuv420p`,
  ].join(',');
}

async function runPool(items, concurrency, workerFn) {
  let nextIdx = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIdx < items.length) {
      const idx = nextIdx++;
      await workerFn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

/**
 * Build seamless BGM track matching exact totalDur (handles BGM shorter OR longer than video),
 * normalized to an exact target LUFS (consistent across quiet piano & louder lo-fi tracks),
 * plus optional dramatic AUDIO CUT silence windows.
 */
async function buildSeamlessBgm(bgmPath, totalDur, audioCuts, bgmLufs, outWavPath) {
  const bgmDur = ffprobeDuration(bgmPath);
  const xfadeDur = Math.min(3.5, Math.max(1.5, bgmDur * 0.12));
  const args = ['-y'];
  let filterParts = [];
  let bgmStreamLabel = '';

  if (bgmDur >= totalDur + 0.5) {
    // Video is shorter than BGM -> direct trim + fade in/out
    args.push('-i', bgmPath);
    filterParts.push(`[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,atrim=0:${totalDur.toFixed(3)},asetpts=PTS-STARTPTS[bgm_raw]`);
    bgmStreamLabel = '[bgm_raw]';
  } else {
    // Video is longer than BGM -> seamless crossfade loop with acrossfade
    const effStep = Math.max(1.0, bgmDur - xfadeDur);
    const loops = Math.ceil((totalDur + xfadeDur) / effStep) + 1;
    console.log(`🔁 BGM (${bgmDur.toFixed(1)}s) < Video (${totalDur.toFixed(1)}s): building ${loops}x seamless ${xfadeDur.toFixed(1)}s acrossfade loop...`);
    for (let i = 0; i < loops; i++) {
      args.push('-i', bgmPath);
      filterParts.push(`[${i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,asetpts=PTS-STARTPTS[b${i}]`);
    }
    let prev = '[b0]';
    for (let i = 1; i < loops; i++) {
      const nextLbl = i === loops - 1 ? '[bgm_looped]' : `[bl${i}]`;
      filterParts.push(`${prev}[b${i}]acrossfade=d=${xfadeDur.toFixed(2)}:c1=tri:c2=tri${nextLbl}`);
      prev = nextLbl;
    }
    filterParts.push(`[bgm_looped]atrim=0:${totalDur.toFixed(3)},asetpts=PTS-STARTPTS[bgm_raw]`);
    bgmStreamLabel = '[bgm_raw]';
  }

  // Sculpt BGM to sit warmly under Vietnamese/English voiceover + calibrated LUFS level
  const fadeOutDur = Math.min(3.0, Math.max(1.0, totalDur * 0.1));
  const fadeOutStart = Math.max(0, totalDur - fadeOutDur);

  // Build smooth AUDIO CUT volume expression (180ms ramp down & up so zero clicks!)
  let cutExpr = '1';
  if (audioCuts && audioCuts.length > 0) {
    const terms = audioCuts.map(c => {
      const s = Number(c.start);
      const d = Number(c.duration);
      const e = s + d;
      const r = 0.18;
      const sIn = (s + r).toFixed(3);
      const eOut = (e - r).toFixed(3);
      return `(if(between(t,${s.toFixed(3)},${sIn}),1-(t-${s.toFixed(3)})/${r},if(between(t,${sIn},${eOut}),0,if(between(t,${eOut},${e.toFixed(3)}),(t-${eOut})/${r},1))))`;
    });
    cutExpr = terms.join('*');
  }

  // Normalize ANY BGM track to exact -18 LUFS first, then shift cleanly to target bgmLufs (e.g. -30 LUFS)
  const shiftDb = (bgmLufs - (-18.0)).toFixed(1);
  filterParts.push(
    `${bgmStreamLabel}` +
    `loudnorm=I=-18:TP=-2:LRA=11,` +
    `equalizer=f=2800:t=q:w=1.2:g=-3.0,` +
    `equalizer=f=100:t=q:w=1.0:g=-1.5,` +
    `volume=${shiftDb}dB,` +
    `afade=t=in:st=0:d=1.8,` +
    `afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${fadeOutDur.toFixed(3)},` +
    `volume='${cutExpr}':eval=frame[bgm_final]`
  );

  args.push(
    '-filter_complex', filterParts.join(';'),
    '-map', '[bgm_final]',
    '-c:a', 'pcm_s24le',
    '-ar', '48000',
    '-ac', '2',
    outWavPath
  );

  await execFileAsync('ffmpeg', args, { maxBuffer: 20 * 1024 * 1024 });
}

/**
 * Master 3-Layer Audio Mix:
 *   Layer 1: Polished Narration calibrated to -16 LUFS
 *   Layer 2: Seamless BGM calibrated to bgmLufs (~ -30 LUFS) with gentle 3-4 dB Sidechain Ducking + AUDIO CUTs
 *   Layer 3: Restrained Editorial Micro-SFX cues at exact timestamps
 *   Master : EBU R128 loudnorm (-14 LUFS, -1.5 dBTP) -> 48kHz Stereo AAC
 */
async function buildMasterAudio(narrationPath, bgmWavPath, sfxCues, totalDur, voLufs, outMasterWav) {
  const sfxDir = path.join(REPO_ROOT, 'assets', 'audio', 'sfx');
  const validCues = (sfxCues || [])
    .map(c => ({
      time: Number(c.time),
      gainDb: c.gainDb !== undefined ? Number(c.gainDb) : -14,
      file: path.join(sfxDir, `${c.sfx}.wav`),
    }))
    .filter(c => fs.existsSync(c.file) && c.time >= 0 && c.time < totalDur - 0.2);

  const args = ['-y', '-i', narrationPath];
  const filterParts = [];

  // Input 0: Narration -> polish + calibrate to exact voLufs (-16 LUFS) + stereo
  filterParts.push(
    `[0:a]aresample=48000,highpass=f=75,equalizer=f=3000:t=q:w=1.5:g=1.4,` +
    `loudnorm=I=${voLufs}:TP=-1.5:LRA=9,` +
    `pan=stereo|c0=c0|c1=c0,apad=whole_dur=${totalDur.toFixed(3)},atrim=0:${totalDur.toFixed(3)},asetpts=PTS-STARTPTS[vo_clean]`
  );

  const mixInputs = ['[vo_main]'];
  let nextInputIdx = 1;

  if (bgmWavPath && fs.existsSync(bgmWavPath)) {
    args.push('-i', bgmWavPath);
    const bgmIdx = nextInputIdx++;
    filterParts.push(`[vo_clean]asplit=2[vo_main][vo_sc]`);
    // Gentle musical sidechain ducking (~3-4 dB dip under speech, breathes back up in pauses)
    filterParts.push(
      `[${bgmIdx}:a][vo_sc]sidechaincompress=threshold=0.06:ratio=2.0:attack=150:release=500:makeup=1[bgm_ducked]`
    );
    mixInputs.push('[bgm_ducked]');
  } else {
    filterParts.push(`[vo_clean]anull[vo_main]`);
  }

  // Layer 3: Micro-SFX cues
  if (validCues.length > 0) {
    const cueLabels = [];
    for (let i = 0; i < validCues.length; i++) {
      const cue = validCues[i];
      args.push('-i', cue.file);
      const inpIdx = nextInputIdx++;
      const delayMs = Math.max(0, Math.round(cue.time * 1000));
      const lbl = `[sfx${i}]`;
      filterParts.push(
        `[${inpIdx}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,` +
        `volume=${cue.gainDb}dB,adelay=${delayMs}|${delayMs},apad=whole_dur=${totalDur.toFixed(3)},atrim=0:${totalDur.toFixed(3)}[sfx${i}]`
      );
      cueLabels.push(lbl);
    }
    if (cueLabels.length === 1) {
      filterParts.push(`${cueLabels[0]}anull[sfx_mix]`);
    } else {
      filterParts.push(`${cueLabels.join('')}amix=inputs=${cueLabels.length}:duration=first:normalize=0[sfx_mix]`);
    }
    mixInputs.push('[sfx_mix]');
  }

  // Combine layers without auto-attenuation, then YouTube -14 LUFS mastering
  if (mixInputs.length === 1) {
    filterParts.push(`${mixInputs[0]}loudnorm=I=-14:TP=-1.5:LRA=11[master_a]`);
  } else {
    filterParts.push(
      `${mixInputs.join('')}amix=inputs=${mixInputs.length}:duration=first:normalize=0,` +
      `loudnorm=I=-14:TP=-1.5:LRA=11[master_a]`
    );
  }

  args.push(
    '-filter_complex', filterParts.join(';'),
    '-map', '[master_a]',
    '-c:a', 'pcm_s24le',
    '-ar', '48000',
    '-ac', '2',
    outMasterWav
  );

  await execFileAsync('ffmpeg', args, { maxBuffer: 20 * 1024 * 1024 });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const projectDir = path.isAbsolute(opts.projectDir) ? opts.projectDir : path.resolve(REPO_ROOT, opts.projectDir);
  const scenesDir = path.join(projectDir, 'scenes');
  const outputDir = path.join(projectDir, 'output');
  fs.mkdirSync(outputDir, { recursive: true });
  const tmpDir = path.join(os.tmpdir(), `stickman_cinema_${path.basename(projectDir)}_${crypto.randomBytes(4).toString('hex')}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const narrationPath = path.join(projectDir, 'narration.mp3');
  if (!fs.existsSync(narrationPath)) throw new Error(`Missing narration.mp3 at ${narrationPath}`);

  ensureCinemaAssets();

  const plan = loadCinemaPlan(projectDir, opts.planPath);
  const shots = plan.shots || [];
  if (shots.length === 0) throw new Error('Cinema plan has no shots.');

  const isVertical = opts.aspect === '9:16';
  const outW = isVertical ? 1080 : 1920;
  const outH = isVertical ? 1920 : 1080;
  const fps = opts.fps;
  const fadeDur = opts.fadeDur;

  const totalDur = shots.reduce((acc, s) => acc + Number(s.duration), 0);
  const audioDur = ffprobeDuration(narrationPath);
  const targetDur = Math.max(totalDur, audioDur);

  const bgmPath = opts.noBgm ? null : resolveBgmFile(opts.bgm || plan.bgm, opts.niche || plan.niche);
  const paperPath = opts.noPaper
    ? null
    : path.join(REPO_ROOT, 'assets', 'textures', isVertical ? 'paper_grain_9x16.mp4' : 'paper_grain_16x9.mp4');

  console.log('======================================================================');
  console.log(`🎬 STICKMAN CINEMA RENDER ENGINE v2.0 (${opts.audioOnly ? 'FAST AUDIO REMUX' : `${opts.aspect} · ${outW}x${outH} @ ${fps}fps`})`);
  console.log('======================================================================');
  console.log(`  📂 Project : ${projectDir}`);
  console.log(`  🎞️  Shots   : ${shots.length} shots | Plan=${totalDur.toFixed(3)}s | Audio=${audioDur.toFixed(3)}s`);
  console.log(`  🎵 BGM     : ${bgmPath ? path.basename(bgmPath) : 'OFF'} (Target=${opts.bgmLufs} LUFS under ${opts.voLufs} LUFS VO + Gentle Ducking)`);
  console.log(`  🔊 SFX/Cut : ${(plan.sfxCues || []).length} Micro-SFX cues | ${(plan.audioCuts || []).length} AUDIO CUTs | Master -14 LUFS`);
  console.log(`  📄 Texture : ${opts.audioOnly ? 'PRESERVED (Stream Copy)' : (paperPath ? `Living Paper 8fps (${Math.round(opts.paperOpacity * 100)}%) + Warm Vignette` : 'OFF')}`);
  console.log('======================================================================');

  const finalFilm = path.join(outputDir, 'film.mp4');

  if (opts.audioOnly) {
    if (!fs.existsSync(finalFilm)) throw new Error(`Cannot run --audio-only: existing ${finalFilm} not found`);
    console.log('\n🎵 [Fast Audio Remux] Mixing calibrated 3-Layer Audio...');
    const tA = Date.now();
    let bgmWavPath = null;
    if (bgmPath) {
      bgmWavPath = path.join(tmpDir, 'bgm_prepared.wav');
      await buildSeamlessBgm(bgmPath, targetDur, plan.audioCuts || [], opts.bgmLufs, bgmWavPath);
    }
    const masterWavPath = path.join(tmpDir, 'master_audio.wav');
    await buildMasterAudio(
      narrationPath,
      bgmWavPath,
      opts.noSfx ? [] : (plan.sfxCues || []),
      targetDur,
      opts.voLufs,
      masterWavPath
    );
    const remuxedOut = path.join(tmpDir, 'film_remuxed.mp4');
    await execFileAsync('ffmpeg', [
      '-y',
      '-i', finalFilm,
      '-i', masterWavPath,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-shortest',
      '-movflags', '+faststart',
      remuxedOut,
    ], { maxBuffer: 20 * 1024 * 1024 });
    fs.copyFileSync(remuxedOut, finalFilm);
    if (!opts.keepTmp) fs.rmSync(tmpDir, { recursive: true, force: true });
    const stat = fs.statSync(finalFilm);
    console.log(`✅ Fast Audio Remux completed in ${((Date.now() - tA) / 1000).toFixed(1)}s -> ${finalFilm} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
    return;
  }

  // ------------------------------------------------------------------
  // STAGE 1: Parallel Subpixel Ken Burns Rendering per Shot (30fps)
  // ------------------------------------------------------------------
  console.log(`\n🖌️ [Stage 1/4] Rendering ${shots.length} Subpixel Ken Burns clips (${opts.concurrency}x parallel)...`);
  const t1 = Date.now();
  const shotClipInfo = shots.map((s, idx) => {
    const pad = String(s.shot).padStart(2, '0');
    const imgPath = path.join(scenesDir, `shot_${pad}.png`);
    if (!fs.existsSync(imgPath)) throw new Error(`Missing scene image: ${imgPath}`);
    const isLast = idx === shots.length - 1;
    const outTrans = isLast ? 'none' : (s.transition || 'fade');
    // Compensate outgoing xfade overlap so exact SRT beat boundaries never drift!
    const clipDur = Number(s.duration) + (outTrans === 'fade' ? fadeDur : 0);
    const frames = Math.max(2, Math.round(clipDur * fps));
    const exactDur = frames / fps;
    return {
      shot: s.shot,
      pad,
      imgPath,
      motion: s.motion || 'zoom_in',
      outTrans,
      nominalDur: Number(s.duration),
      clipDur: exactDur,
      frames,
      clipPath: path.join(tmpDir, `clip_${pad}.mp4`),
    };
  });

  await runPool(shotClipInfo, opts.concurrency, async (info) => {
    const vf = buildZoompanFilter(info.motion, info.frames, outW, outH, fps);
    await execFileAsync('ffmpeg', [
      '-y',
      '-loop', '1',
      '-i', info.imgPath,
      '-vf', vf,
      '-frames:v', String(info.frames),
      '-r', String(fps),
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '15',
      '-pix_fmt', 'yuv420p',
      info.clipPath,
    ], { maxBuffer: 10 * 1024 * 1024 });
  });
  console.log(`✅ Stage 1 completed in ${((Date.now() - t1) / 1000).toFixed(1)}s.`);

  // ------------------------------------------------------------------
  // STAGE 2: Assemble Rhythmic Segments (xfade within fade-runs, hard cut between segments)
  // ------------------------------------------------------------------
  console.log('\n✂️ [Stage 2/4] Assembling Rhythmic Editorial Transitions (xfade + hard cuts)...');
  const t2 = Date.now();
  const segments = [];
  let curSeg = [];
  for (let i = 0; i < shotClipInfo.length; i++) {
    curSeg.push(shotClipInfo[i]);
    if (shotClipInfo[i].outTrans !== 'fade') {
      segments.push(curSeg);
      curSeg = [];
    }
  }
  if (curSeg.length > 0) segments.push(curSeg);

  const segPaths = [];
  for (let sIdx = 0; sIdx < segments.length; sIdx++) {
    const seg = segments[sIdx];
    const segOut = path.join(tmpDir, `seg_${String(sIdx + 1).padStart(2, '0')}.mp4`);
    if (seg.length === 1) {
      segPaths.push(seg[0].clipPath);
      continue;
    }

    const args = ['-y'];
    for (const c of seg) args.push('-i', c.clipPath);
    const filterParts = [];
    let prevLbl = '[0:v]';
    let offset = seg[0].clipDur - fadeDur;
    for (let i = 1; i < seg.length; i++) {
      const outLbl = i === seg.length - 1 ? '[vseg]' : `[vx${i}]`;
      filterParts.push(
        `${prevLbl}[${i}:v]xfade=transition=fade:duration=${fadeDur.toFixed(3)}:offset=${offset.toFixed(3)}${outLbl}`
      );
      prevLbl = outLbl;
      offset += seg[i].clipDur - fadeDur;
    }
    args.push(
      '-filter_complex', filterParts.join(';'),
      '-map', '[vseg]',
      '-r', String(fps),
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '15',
      '-pix_fmt', 'yuv420p',
      segOut
    );
    await execFileAsync('ffmpeg', args, { maxBuffer: 20 * 1024 * 1024 });
    segPaths.push(segOut);
  }

  const segConcatPath = path.join(tmpDir, 'segments.txt');
  fs.writeFileSync(
    segConcatPath,
    segPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n'),
    'utf8'
  );
  console.log(`✅ Stage 2 completed (${segments.length} editorial segments) in ${((Date.now() - t2) / 1000).toFixed(1)}s.`);

  // ------------------------------------------------------------------
  // STAGE 3: 3-Layer Cinema Audio Engine (BGM + Ducking + AUDIO CUT + SFX + -14 LUFS)
  // ------------------------------------------------------------------
  console.log('\n🎵 [Stage 3/4] Mixing 3-Layer Audio (Calibrated Seamless BGM + Gentle Ducking + Micro-SFX + -14 LUFS)...');
  const t3 = Date.now();
  let bgmWavPath = null;
  if (bgmPath) {
    bgmWavPath = path.join(tmpDir, 'bgm_prepared.wav');
    await buildSeamlessBgm(bgmPath, targetDur, plan.audioCuts || [], opts.bgmLufs, bgmWavPath);
  }
  const masterWavPath = path.join(tmpDir, 'master_audio.wav');
  await buildMasterAudio(
    narrationPath,
    bgmWavPath,
    opts.noSfx ? [] : (plan.sfxCues || []),
    targetDur,
    opts.voLufs,
    masterWavPath
  );
  console.log(`✅ Stage 3 audio mastering completed in ${((Date.now() - t3) / 1000).toFixed(1)}s.`);

  // ------------------------------------------------------------------
  // STAGE 4: Final Master Pass (Living Paper Feel 8fps + Warm Vignette + H.264/AAC)
  // ------------------------------------------------------------------
  console.log('\n✨ [Stage 4/4] Encoding final master film.mp4 with Living Paper Feel & Warm Vignette...');
  const t4 = Date.now();
  const finalArgs = [
    '-y',
    '-f', 'concat', '-safe', '0', '-i', segConcatPath,
    '-i', masterWavPath,
  ];

  if (paperPath && fs.existsSync(paperPath)) {
    finalArgs.push('-stream_loop', '-1', '-i', paperPath);
    const vfGraph = [
      `[0:v]setpts=PTS-STARTPTS,format=yuv420p[base]`,
      `[2:v]setpts=PTS-STARTPTS,fps=${fps},scale=${outW}:${outH},format=yuv420p[tex]`,
      `[base][tex]blend=all_mode=overlay:all_opacity=${opts.paperOpacity.toFixed(2)}:shortest=1,` +
      `vignette=angle=PI/15:eval=init,format=yuv420p[vout]`,
    ].join(';');
    finalArgs.push(
      '-filter_complex', vfGraph,
      '-map', '[vout]',
      '-map', '1:a'
    );
  } else {
    finalArgs.push(
      '-map', '0:v',
      '-map', '1:a',
      '-vf', 'format=yuv420p'
    );
  }

  finalArgs.push(
    '-t', targetDur.toFixed(3),
    '-r', String(fps),
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '19',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-movflags', '+faststart',
    finalFilm
  );

  await execFileAsync('ffmpeg', finalArgs, { maxBuffer: 30 * 1024 * 1024 });

  // Copy synced external soft subtitles (Zero Burned-in Subtitles Invariance)
  const inputSrt = path.join(projectDir, 'input.srt');
  if (fs.existsSync(inputSrt)) {
    fs.copyFileSync(inputSrt, path.join(outputDir, 'film.srt'));
  }

  // Cleanup temp directory unless --keep-tmp
  if (!opts.keepTmp) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const stat = fs.statSync(finalFilm);
  const outDur = ffprobeDuration(finalFilm);
  console.log(`✅ Stage 4 completed in ${((Date.now() - t4) / 1000).toFixed(1)}s.`);
  console.log('\n======================================================================');
  console.log(`🎉 CINEMA PRODUCTION COMPLETE: ${finalFilm}`);
  console.log(`   📐 Resolution : ${outW}x${outH} @ ${fps}fps (Zero Hardsub)`);
  console.log(`   ⏱️  Duration   : ${outDur.toFixed(3)}s | Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log('======================================================================');
}

main().catch(err => {
  console.error('❌ Cinema Render Failed:', err.stderr || err.message || err);
  process.exit(1);
});
