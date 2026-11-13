#!/usr/bin/env node
/**
 * Master Director Video Pipeline (Director Mode Upgrade)
 * 
 * Orchestrates:
 * 1. AI Video Generation via Agnes Video 2.5 (agnes-video-2.5 / agnes-video-2.5-flash)
 * 2. Precision Duration Conformance (FFmpeg Smart Retiming & Freeze-Hold)
 * 3. Video Assembly, Narration Muxing, and Subtitle Burn-In
 * 
 * Usage:
 * node scripts/director-video-pipeline.mjs --project projects/people-pleasing [--shots 1,2] [--model agnes-video-2.5-flash]
 */

import fs from 'node:fs';
import path from 'node:path';
import { generateAgnesVideo } from '../skills/directing-stickman-videos/scripts/agnes-video-adapter.mjs';
import {
  conformShotVideo,
  concatenateVideos,
  sanitizeSrtFile,
  muxFilm,
  getVideoDuration
} from './director-video-assembler.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const args = process.argv.slice(2);
const value = flag => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
};
const hasFlag = flag => args.includes(flag);

const projectPath = path.resolve(value('--project') || 'projects/people-pleasing');
const selectedShotsArg = value('--shots');
const chosenModel = value('--model') || process.env.AGNES_VIDEO_MODEL || 'agnes-video-2.5-flash';
const skipGen = hasFlag('--skip-gen') || hasFlag('--skip-generation');
const outputFilename = value('--output') || 'director-film.mp4';

async function main() {
  console.log(`================================================================`);
  console.log(`🎬 UPGRADED DIRECTOR MODE: AGNES VIDEO 2.5 PIPELINE`);
  console.log(`================================================================`);
  console.log(`Project Directory : ${projectPath}`);
  console.log(`AI Video Model    : ${chosenModel}`);

  const promptsFile = path.join(projectPath, 'director_video_prompts.json');
  if (!fs.existsSync(promptsFile)) {
    throw new Error(`Prompts file not found at ${promptsFile}. Run build_director_video_prompts.mjs first.`);
  }

  let shots = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
  if (selectedShotsArg) {
    const selectedList = selectedShotsArg.split(',').map(s => parseInt(s.trim(), 10));
    shots = shots.filter(s => selectedList.includes(s.shot));
    console.log(`Filtered Shots    : [ ${shots.map(s => s.shot).join(', ')} ] (Pilot Mode)`);
  } else {
    console.log(`Total Shots       : ${shots.length} shots`);
  }

  if (shots.length === 0) {
    console.log(`No shots selected or found. Exiting.`);
    return;
  }

  const scenesDir = path.join(projectPath, 'scenes');
  const outputDir = path.join(projectPath, 'output');
  fs.mkdirSync(scenesDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const conformedFiles = [];

  // Phase 1 & 2: Generation & Precision Conformance
  console.log(`\n--- Phase 1 & 2: Video Generation & Duration Conformance ---`);

  for (let i = 0; i < shots.length; i++) {
    const item = shots[i];
    const pad = String(item.shot).padStart(2, '0');
    const rawVideoFile = path.join(scenesDir, `shot_${pad}_video.mp4`);
    const conformedFile = path.join(scenesDir, `shot_${pad}_conformed.mp4`);

    console.log(`\n[Shot ${pad}/${String(shots.length).padStart(2, '0')}] "${item.title}"`);
    console.log(`  Timing         : ${item.start}s -> ${item.end}s (Target Duration: ${item.duration}s)`);

    // Step 1: AI Generation via Agnes Video 2.5
    if (skipGen && fs.existsSync(rawVideoFile)) {
      console.log(`  [Skip Gen] Raw video already exists: ${path.basename(rawVideoFile)}`);
    } else if (fs.existsSync(rawVideoFile) && fs.statSync(rawVideoFile).size > 50000) {
      console.log(`  [Cache Hit] Video already generated: ${path.basename(rawVideoFile)} (${(fs.statSync(rawVideoFile).size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`  [Agnes Video] Calling ${chosenModel} (target ${item.target_gen_seconds}s clip)...`);
      try {
        await generateAgnesVideo({
          prompt: item.prompt,
          output: rawVideoFile,
          model: chosenModel,
          aspect_ratio: '16:9',
          size: '720P',
          seconds: item.target_gen_seconds,
          maxRetries: 4,
          onProgress: p => {
            if (p.stage === 'submitting') console.log(`    -> Submitting video task (Attempt ${p.attempt})...`);
            if (p.stage === 'polling') console.log(`    -> Task ID: ${p.taskId}. Polling for render completion...`);
            if (p.stage === 'retry_wait') console.warn(`    [Retry Wait] Server busy (${p.error}). Waiting ${p.delayMs / 1000}s...`);
            if (p.stage === 'downloading') console.log(`    -> Video ready! Downloading from Agnes CDN...`);
          }
        });
        console.log(`  [Agnes Video] Saved to ${path.basename(rawVideoFile)}`);
      } catch (err) {
        console.error(`  [Agnes Video Error] Failed to generate Shot ${pad}: ${err.message}`);
        throw err;
      }

      // Small cooldown between API requests
      await sleep(2000);
    }

    // Step 2: Duration Conformance
    console.log(`  [Conformance] Retiming and conforming video to exactly ${item.duration}s...`);
    const confResult = await conformShotVideo(rawVideoFile, conformedFile, item.duration, {
      width: 1920,
      height: 1080,
      fps: 30,
      bgColor: 'white'
    });
    console.log(`  [Conformance Done] ${confResult.actualDuration.toFixed(2)}s -> ${confResult.conformedDuration.toFixed(3)}s (delta: ${confResult.delta.toFixed(4)}s)`);

    conformedFiles.push(conformedFile);
  }

  // Phase 3: Concatenation
  console.log(`\n--- Phase 3: Concatenating ${conformedFiles.length} Scene Clips ---`);
  const rawAssembled = path.join(outputDir, `director_raw_assembled_${Date.now()}.mp4`);
  await concatenateVideos(conformedFiles, rawAssembled);
  const totalVideoDuration = await getVideoDuration(rawAssembled);
  console.log(`Assembled Raw Video : ${path.basename(rawAssembled)} (${totalVideoDuration.toFixed(3)}s)`);

  // Phase 4: Audio Preparation & Subtitles Muxing
  console.log(`\n--- Phase 4: Audio Muxing & Subtitle Burn-In ---`);
  const fullNarration = path.join(projectPath, 'narration.wav');
  let finalAudio = fullNarration;

  // If pilot mode with partial shots, trim narration audio to match
  if (selectedShotsArg) {
    const firstShot = shots[0];
    const lastShot = shots[shots.length - 1];
    const audioTrimmed = path.join(outputDir, `pilot_narration_trimmed.wav`);
    console.log(`Trimming audio from ${firstShot.start}s for duration ${totalVideoDuration.toFixed(3)}s...`);
    await execFileAsync('ffmpeg', [
      '-y',
      '-ss', String(firstShot.start),
      '-t', String(totalVideoDuration),
      '-i', fullNarration,
      '-c', 'copy',
      audioTrimmed
    ]);
    finalAudio = audioTrimmed;
  }

  // Subtitles
  const srtSource = path.join(projectPath, 'captions.srt');
  let safeSrt = null;
  if (fs.existsSync(srtSource)) {
    safeSrt = path.join(outputDir, 'director_subtitles_styled.srt');
    sanitizeSrtFile(srtSource, safeSrt, 55);
  }

  const finalFilmPath = path.join(outputDir, outputFilename);
  console.log(`Final Muxing into: ${finalFilmPath}...`);
  await muxFilm({
    videoInput: rawAssembled,
    audioInput: finalAudio,
    srtInput: safeSrt,
    outputFilm: finalFilmPath,
    fontSize: 24
  });

  // Cleanup temporary assembled video
  try { fs.unlinkSync(rawAssembled); } catch (e) {}

  const finalDuration = await getVideoDuration(finalFilmPath);
  console.log(`\n================================================================`);
  console.log(`🎉 DIRECTOR MODE VIDEO COMPLETED SUCCESSFULLY!`);
  console.log(`================================================================`);
  console.log(`Output Video : ${finalFilmPath}`);
  console.log(`Total Length : ${finalDuration.toFixed(2)} seconds`);
  console.log(`File Size    : ${(fs.statSync(finalFilmPath).size / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('\n❌ Director Pipeline Failed:', err);
  process.exit(1);
});
