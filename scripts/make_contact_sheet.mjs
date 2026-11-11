import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('skills/directing-stickman-videos/node_modules/sharp'));

const scenesDir = path.resolve('projects/self-sabotage/scenes');
const totalShots = 41;
const cols = 7;
const rows = Math.ceil(totalShots / cols); // 6 rows
const cellW = 320;
const cellH = 180; // 16:9 ratio
const sheetW = cols * cellW;
const sheetH = rows * cellH;

async function makeContactSheet() {
  const composites = [];

  for (let i = 1; i <= totalShots; i++) {
    const pad = String(i).padStart(2, '0');
    const shotPath = path.join(scenesDir, `shot_${pad}.png`);
    const col = (i - 1) % cols;
    const row = Math.floor((i - 1) / cols);
    const x = col * cellW;
    const y = row * cellH;

    // Create a 16:9 cell with white background
    const cellBuf = await sharp({
      create: {
        width: cellW,
        height: cellH,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([
      {
        input: await sharp(shotPath).resize(cellH - 20, cellH - 20, { fit: 'inside' }).toBuffer(),
        top: 10,
        left: Math.round((cellW - (cellH - 20)) / 2)
      },
      // Shot number label badge
      {
        input: Buffer.from(`
          <svg width="${cellW}" height="${cellH}">
            <rect x="8" y="8" width="56" height="24" rx="4" fill="#000000" opacity="0.75" />
            <text x="36" y="24" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">#${pad}</text>
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

  const base = await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 240, g: 240, b: 240, alpha: 1 }
    }
  })
  .composite(composites)
  .png()
  .toBuffer();

  const outPath = 'projects/self-sabotage/output/contact_sheet.png';
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, base);

  // Copy to brain artifacts
  const artifactPath = 'C:/Users/votah/.gemini/antigravity/brain/c5690218-6497-42c2-a2e1-386a25a75f28/self_sabotage_contact_sheet.png';
  fs.writeFileSync(artifactPath, base);

  console.log(`Contact sheet generated: ${outPath} and ${artifactPath} (${sheetW}x${sheetH})`);
}

makeContactSheet().catch(err => {
  console.error(err);
  process.exit(1);
});
