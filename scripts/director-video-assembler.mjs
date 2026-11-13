#!/usr/bin/env node
/**
 * Director Video Assembler & Conformance Engine
 * 
 * Functions:
 * 1. Conforms individual scene video clips to exact subtitle cue durations:
 *    - ffprobe analysis of source video duration & fps
 *    - Smart Dynamic Retiming (setpts) or Freeze-Padding (tpad) to match target seconds down to millisecond precision
 *    - Canonical scaling to 1920x1080 (or 1080x1920), 30fps, solid white background padding, yuv420p
 * 2. Concatenates all conformed video clips sequentially
 * 3. Muxes with narration audio and hardcodes styled subtitles
 * 4. Outputs master director video
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Gets exact duration of a video file in seconds using ffprobe.
 */
export async function getVideoDuration(filePath) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);
    const duration = parseFloat(stdout.trim());
    if (isNaN(duration)) throw new Error(`Invalid duration output: "${stdout}"`);
    return duration;
  } catch (err) {
    throw new Error(`Failed to probe ${filePath}: ${err.message}`);
  }
}

/**
 * Conforms an input video clip to exact target duration and 1080p resolution.
 */
export async function conformShotVideo(inputPath, outputPath, targetDuration, options = {}) {
  const {
    width = 1920,
    height = 1080,
    fps = 30,
    bgColor = 'white'
  } = options;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const actualDuration = await getVideoDuration(inputPath);

  // Compute video filter chain
  const scaleFilter = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${bgColor},setsar=1,fps=${fps}`;
  
  let timeFilter = '';
  const ratio = targetDuration / actualDuration;

  if (Math.abs(actualDuration - targetDuration) < 0.05) {
    // Virtually identical duration: just scale and format
    timeFilter = `${scaleFilter},trim=duration=${targetDuration.toFixed(3)}`;
  } else if (ratio >= 0.75 && ratio <= 1.35) {
    // Mild difference: use continuous smooth retiming
    timeFilter = `${scaleFilter},setpts=${ratio.toFixed(6)}*PTS,trim=duration=${targetDuration.toFixed(3)}`;
  } else if (actualDuration > targetDuration) {
    // Actual video is noticeably longer: trim cleanly
    timeFilter = `${scaleFilter},trim=duration=${targetDuration.toFixed(3)}`;
  } else {
    // Actual video is shorter: retime slightly (up to 1.25x) then freeze-hold final pose
    const intermediateDuration = Math.min(targetDuration, actualDuration * 1.25);
    const speedRatio = intermediateDuration / actualDuration;
    const freezeDuration = targetDuration - intermediateDuration;
    timeFilter = `${scaleFilter},setpts=${speedRatio.toFixed(6)}*PTS,tpad=stop_mode=clone:stop_duration=${freezeDuration.toFixed(3)},trim=duration=${targetDuration.toFixed(3)}`;
  }

  const args = [
    '-y',
    '-i', inputPath,
    '-filter_complex', timeFilter,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '19',
    '-an',
    outputPath
  ];

  await execFileAsync('ffmpeg', args);
  const conformedDuration = await getVideoDuration(outputPath);

  return {
    inputPath,
    outputPath,
    actualDuration,
    targetDuration,
    conformedDuration,
    delta: Math.abs(conformedDuration - targetDuration)
  };
}

/**
 * Concatenates an array of video files using FFmpeg concat demuxer.
 */
export async function concatenateVideos(videoPaths, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const listFile = `${outputPath}.concat.txt`;
  const listContent = videoPaths.map(p => `file '${path.resolve(p).replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listFile, listContent, 'utf8');

  const args = [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-c', 'copy',
    outputPath
  ];

  await execFileAsync('ffmpeg', args);
  try { fs.unlinkSync(listFile); } catch (e) {}

  return outputPath;
}

/**
 * Formats SRT subtitles for clean styling (no overflowing text).
 */
export function sanitizeSrtFile(srcSrt, destSrt, maxCharsPerLine = 60) {
  const content = fs.readFileSync(srcSrt, 'utf8');
  const blocks = content.trim().split(/\r?\n\r?\n/);
  const formattedBlocks = blocks.map(block => {
    const lines = block.split(/\r?\n/);
    if (lines.length < 3) return block;
    const cueIndex = lines[0];
    const timecode = lines[1];
    let subtitleText = lines.slice(2).join(' ').replace(/\s+/g, ' ').trim();

    // Wrap if excessively long
    if (subtitleText.length > maxCharsPerLine) {
      const words = subtitleText.split(' ');
      let line1 = '', line2 = '';
      for (const w of words) {
        if ((line1 + ' ' + w).length <= maxCharsPerLine) {
          line1 = (line1 ? line1 + ' ' : '') + w;
        } else {
          line2 = (line2 ? line2 + ' ' : '') + w;
        }
      }
      subtitleText = line2 ? `${line1}\n${line2}` : line1;
    }

    return `${cueIndex}\n${timecode}\n${subtitleText}`;
  });

  fs.writeFileSync(destSrt, formattedBlocks.join('\n\n'), 'utf8');
  return destSrt;
}

/**
 * Muxes video with narration audio and burns in subtitles.
 */
export async function muxFilm(options) {
  const {
    videoInput,
    audioInput,
    srtInput,
    outputFilm,
    fontSize = 24
  } = options;

  fs.mkdirSync(path.dirname(outputFilm), { recursive: true });

  let vfFilter = '';
  if (srtInput && fs.existsSync(srtInput)) {
    const safeSrtPath = path.resolve(srtInput).replace(/\\/g, '/').replace(/:/g, '\\:');
    vfFilter = `subtitles='${safeSrtPath}':force_style='FontSize=${fontSize},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2,Shadow=1,MarginV=30'`;
  }

  const args = [
    '-y',
    '-i', videoInput,
    '-i', audioInput
  ];

  if (vfFilter) {
    args.push('-vf', vfFilter);
  }

  args.push(
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '19',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    outputFilm
  );

  await execFileAsync('ffmpeg', args);
  return outputFilm;
}
