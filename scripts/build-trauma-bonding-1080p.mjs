import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createCanvas, GlobalFonts } = require(path.resolve('skills/directing-stickman-videos/node_modules/@napi-rs/canvas'));

const srtPath = 'projects/trauma-bonding/subtitles/captions.srt';

function parseSrt(text) {
  const blocks = text.trim().split(/\r?\n\r?\n/);
  const items = [];
  for (const b of blocks) {
    const lines = b.trim().split(/\r?\n/);
    if (lines.length >= 2) {
      const id = lines[0];
      const match = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      if (match) {
        const start = (+match[1])*3600 + (+match[2])*60 + (+match[3]) + (+match[4])/1000;
        const end = (+match[5])*3600 + (+match[6])*60 + (+match[7]) + (+match[8])/1000;
        const body = lines.slice(2).join(' ').replace(/<[^>]+>/g, '').replace(/[\*\_]+/g, '').trim();
        items.push({ id, start, end, duration: end - start, text: body });
      }
    }
  }
  return items;
}

const rawCues = parseSrt(fs.readFileSync(srtPath, 'utf8'));
const audioDuration = 423.521750; // exact ffprobe duration

// Exact cue index (1-based) ending each shot:
const shotEndCueIndices = [
  2,   // 01
  6,   // 02
  9,   // 03
  12,  // 04
  15,  // 05
  18,  // 06
  21,  // 07
  25,  // 08
  29,  // 09
  32,  // 10
  36,  // 11
  39,  // 12
  42,  // 13
  45,  // 14
  48,  // 15
  52,  // 16
  55,  // 17
  59,  // 18
  63,  // 19
  67,  // 20
  71,  // 21
  73,  // 22
  77,  // 23
  80,  // 24
  85,  // 25
  89,  // 26
  93,  // 27
  98,  // 28
  101, // 29
  105, // 30
  109, // 31
  114, // 32
  118, // 33
  122, // 34
  125, // 35
  129, // 36
  133, // 37
  136, // 38
  140, // 39
  141  // 40
];

// Check caption font width
GlobalFonts.registerFromPath('projects/trauma-bonding/NotoSans.ttf', 'B1Caption');
const canvas = createCanvas(1280, 720);
const ctx = canvas.getContext('2d');
ctx.font = '25px B1Caption';

let maxW = 0;
rawCues.forEach(c => {
  const w = ctx.measureText(c.text).width;
  if (w > maxW) maxW = w;
  if (w > 1120) {
    console.warn(`Warning: cue ${c.id} width ${w} > 1120: "${c.text}"`);
  }
});
console.log(`Max caption width at 25px: ${maxW.toFixed(1)}px (allowed: 1120px)`);

// Load scene prompts from old project if available
const oldProject = JSON.parse(fs.readFileSync('projects/trauma-bonding/project.json', 'utf8'));

// Format cues for project.json, clamping last cue to audioDuration - 0.001
const captions = rawCues.map((c, i) => {
  const start = +c.start.toFixed(3);
  let end = +c.end.toFixed(3);
  if (i === rawCues.length - 1 || end > audioDuration) {
    end = Number((audioDuration - 0.001).toFixed(3));
  }
  return { start, end, text: c.text };
});

// Build 40 shots
let lastEnd = 0;
const shots = shotEndCueIndices.map((cueIdx, idx) => {
  const shotNum = idx + 1;
  const shotKey = String(shotNum).padStart(2, '0');
  const start = lastEnd;
  let end = captions[cueIdx - 1].end;
  if (idx === shotEndCueIndices.length - 1) {
    end = Number((audioDuration - 0.001).toFixed(3));
  }
  lastEnd = end;

  const oldShot = oldProject.shots[idx] || {};
  return {
    shot_index: shotNum,
    start: Number(start.toFixed(3)),
    end: Number(end.toFixed(3)),
    duration: Number((end - start).toFixed(3)),
    prompt: oldShot.prompt || '',
    layers: [
      {
        type: 'image',
        path: `scenes/shot_${shotKey}.png`,
        x: 320,
        y: 35,
        w: 640,
        keys: [
          { t: 0, y: 50, alpha: 0.85 },
          { t: 0.5, y: 35, alpha: 1.0 }
        ]
      }
    ]
  };
});

const project = {
  version: 1,
  style: "B1",
  width: 1920,
  height: 1080,
  fps: 30,
  captionSize: 25,
  font: "NotoSans.ttf",
  voice: {
    path: "audio/narration.mp3",
    lead: 0,
    tail: 0,
    contains_sfx: false
  },
  captions,
  shots
};

fs.writeFileSync('projects/trauma-bonding/project.json', JSON.stringify(project, null, 2), 'utf8');
console.log(`Generated projects/trauma-bonding/project.json:`);
console.log(`- Resolution: ${project.width}x${project.height} (Full HD)`);
console.log(`- Total shots: ${project.shots.length}`);
console.log(`- Total captions: ${project.captions.length}`);
console.log(`- Final shot end: ${project.shots[39].end}s (audio duration: ${audioDuration}s)`);
