import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('D:/Antigravity/Tickman/skills/directing-stickman-videos/node_modules/sharp');

const scenesDir = 'D:/Antigravity/Tickman/projects/spotlight-effect/scenes';

async function optimizeImages() {
  console.log('Optimizing all 22 scene images to maximize character prominence...');

  for (let i = 1; i <= 22; i++) {
    const pad = String(i).padStart(2, '0');
    const f = path.join(scenesDir, `shot_${pad}.png`);
    if (!fs.existsSync(f)) continue;

    // 1. Trim outer transparent space
    const trimmed = await sharp(f).trim().png().toBuffer();
    const meta = await sharp(trimmed).metadata();
    const tw = meta.width;
    const th = meta.height;

    // 2. Pad so character fills ~88% of canvas with beautiful centering
    const maxDim = Math.max(tw, th);
    const targetSize = Math.round(maxDim * 1.12);

    const left = Math.round((targetSize - tw) / 2);
    const top = Math.round((targetSize - th) / 2);

    await sharp(trimmed)
      .extend({
        top: top,
        bottom: targetSize - th - top,
        left: left,
        right: targetSize - tw - left,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(scenesDir, `shot_${pad}_optimized.png`));

    fs.copyFileSync(path.join(scenesDir, `shot_${pad}_optimized.png`), f);
    fs.unlinkSync(path.join(scenesDir, `shot_${pad}_optimized.png`));

    console.log(`Shot ${pad}: trimmed from (${tw}x${th}) -> centered square (${targetSize}x${targetSize})`);
  }

  console.log('All scene images optimized!');
}

optimizeImages().catch(console.error);
