import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('skills/directing-stickman-videos/node_modules/sharp'));

const scenesDir = path.resolve('projects/people-pleasing/scenes');
const outputDir = path.resolve('projects/people-pleasing/output');
const totalShots = 27;
const cols = 6;
const rows = Math.ceil(totalShots / cols); // 5 rows
const cellW = 320;
const cellH = 180; // 16:9 ratio
const sheetW = cols * cellW; // 1920
const sheetH = rows * cellH; // 900

async function makeFullContactSheet() {
  const composites = [];

  for (let i = 1; i <= totalShots; i++) {
    const pad = String(i).padStart(2, '0');
    const shotPath = path.join(scenesDir, `shot_${pad}.png`);
    const col = (i - 1) % cols;
    const row = Math.floor((i - 1) / cols);
    const x = col * cellW;
    const y = row * cellH;

    // Create a 16:9 cell with faint warm paper background (#FDFDFC) & subtle border
    const cellBuf = await sharp({
      create: {
        width: cellW,
        height: cellH,
        channels: 4,
        background: { r: 253, g: 253, b: 252, alpha: 1 }
      }
    })
    .composite([
      {
        input: await sharp(shotPath).resize(cellH - 24, cellH - 24, { fit: 'inside' }).toBuffer(),
        top: 12,
        left: Math.round((cellW - (cellH - 24)) / 2)
      },
      // Shot number label badge
      {
        input: Buffer.from(`
          <svg width="${cellW}" height="${cellH}">
            <rect x="1" y="1" width="${cellW - 2}" height="${cellH - 2}" fill="none" stroke="#E5E7EB" stroke-width="1" />
            <rect x="8" y="8" width="56" height="24" rx="4" fill="#111827" opacity="0.85" />
            <text x="36" y="24" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">#${pad}</text>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toBuffer();

    composites.push({
      input: cellBuf,
      left: x,
      top: y
    });
  }

  // Base canvas for entire sheet
  const sheet = await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 243, g: 244, b: 246, alpha: 1 }
    }
  })
  .composite(composites)
  .png()
  .toFile(path.join(outputDir, 'film-all-27-shots-contact-sheet.png'));

  console.log(`Generated full contact sheet with all ${totalShots} shots successfully!`);
}

makeFullContactSheet().catch(console.error);
