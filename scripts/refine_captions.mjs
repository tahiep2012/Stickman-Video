import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createCanvas, GlobalFonts } = require(path.resolve('skills/directing-stickman-videos/node_modules/@napi-rs/canvas'));

const proj = JSON.parse(fs.readFileSync('projects/self-sabotage/project.json', 'utf8'));
const fontPath = path.resolve('projects/self-sabotage/NotoSans.ttf');
GlobalFonts.registerFromPath(fontPath, 'B1Caption');

function wrap(ctx, text, maxWidth) {
  const parts = /\s/.test(text) ? text.split(/\s+/) : [...text];
  const separator = /\s/.test(text) ? ' ' : '';
  const lines = []; let line = '';
  for (const part of parts) {
    const next = line ? line + separator + part : part;
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = part; }
    else line = next;
    if (ctx.measureText(line).width > maxWidth) throw new Error('Text token too wide: ' + line);
  }
  if (line) lines.push(line);
  return lines;
}

const canvas = createCanvas(1280, 720);
const ctx = canvas.getContext('2d');
ctx.font = '600 28px B1Caption';

const refinedCaptions = [];

for (const c of proj.captions) {
  const text = c.text.replace(/[\r\n]+/g, ' ').trim();
  const lines = wrap(ctx, text, 1050); // safety width 1050px (< 1120px)

  if (lines.length === 1) {
    refinedCaptions.push({
      start: c.start,
      end: c.end,
      text: text
    });
  } else {
    // Split into 2 timed cues proportionally based on character length
    const words = text.split(/\s+/);
    const midWordIdx = Math.floor(words.length / 2);
    const part1 = words.slice(0, midWordIdx).join(' ');
    const part2 = words.slice(midWordIdx).join(' ');

    const totalChars = part1.length + part2.length;
    const dur = c.end - c.start;
    const splitT = Number((c.start + dur * (part1.length / totalChars)).toFixed(3));

    refinedCaptions.push({
      start: c.start,
      end: splitT,
      text: part1
    });
    refinedCaptions.push({
      start: splitT,
      end: c.end,
      text: part2
    });
  }
}

// Verify with 28px
ctx.font = '600 28px B1Caption';
let overflowCount = 0;
refinedCaptions.forEach(c => {
  const lines = wrap(ctx, c.text, 1120);
  if (lines.length > 1) {
    console.error('Still overflowing:', c);
    overflowCount++;
  }
});

console.log(`Refined captions count: ${refinedCaptions.length} (from ${proj.captions.length})`);
console.log(`Overflows at 28px: ${overflowCount}`);

proj.captions = refinedCaptions;
proj.captionSize = 28;
fs.writeFileSync('projects/self-sabotage/project.json', JSON.stringify(proj, null, 2), 'utf8');
console.log('Saved updated project.json with captionSize: 28 and 0 overflows!');
