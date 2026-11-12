import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createCanvas, GlobalFonts } = require(path.resolve('skills/directing-stickman-videos/node_modules/@napi-rs/canvas'));

const srtPath = "C:/Users/Elt.pur02/.gemini/antigravity/brain/dfe00fde-1097-4fd8-a054-95fe8fcfc159/.user_uploaded/media_1794473072019_30a30d5c.srt";
const fontPath = path.resolve('projects/people-pleasing/NotoSans.ttf');

GlobalFonts.registerFromPath(fontPath, 'NotoSans');

const canvas = createCanvas(1280, 720);
const ctx = canvas.getContext('2d');
ctx.font = '600 34px NotoSans';

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
        // Clean body: replace newlines with spaces, strip HTML tags, trim
        const body = lines.slice(2).join(' ')
          .replace(/<[^>]+>/g, '')
          .replace(/[\*\_]+/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        items.push({ id, start, end, duration: end - start, text: body });
      }
    }
  }
  return items;
}

const rawText = fs.readFileSync(srtPath, 'utf8');
const cues = parseSrt(rawText);

console.log(`Parsed ${cues.length} cues.`);

let over1120 = 0;
let maxW = 0;
let maxCue = null;

for (const c of cues) {
  const w = ctx.measureText(c.text).width;
  if (w > maxW) {
    maxW = w;
    maxCue = c;
  }
  if (w > 1120) {
    over1120++;
    console.log(`[OVER 1120px] Cue ${c.id} (${w.toFixed(1)}px): "${c.text}"`);
  }
}

console.log(`Max width: ${maxW.toFixed(1)}px (Cue ${maxCue?.id}: "${maxCue?.text}")`);
console.log(`Total cues over 1120px: ${over1120}`);

// Save parsed subtitles to projects/people-pleasing/captions.json
fs.writeFileSync('projects/people-pleasing/captions.json', JSON.stringify(cues, null, 2));
console.log('Saved to projects/people-pleasing/captions.json');
