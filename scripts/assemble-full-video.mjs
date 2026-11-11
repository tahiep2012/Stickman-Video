import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('D:/Antigravity/Tickman/skills/directing-stickman-videos/node_modules/sharp');

const brainDir = 'C:/Users/Elt.pur02/.gemini/antigravity/brain/c5690218-6497-42c2-a2e1-386a25a75f28';
const projectDir = 'D:/Antigravity/Tickman/projects/spotlight-effect';
const scenesDir = path.join(projectDir, 'scenes');

fs.mkdirSync(scenesDir, {recursive: true});

async function makeTransparent(inputPath, outputPath, threshold = 238) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0; // transparent
    }
  }

  await sharp(data, { raw: info })
    .png()
    .toFile(outputPath);
}

// Map shot index (1 to 22) to pattern
export async function collectAndProcessImages() {
  const files = fs.readdirSync(brainDir);
  console.log(`Scanning ${files.length} files in brainDir...`);

  for (let shot = 1; shot <= 22; shot++) {
    const pad = String(shot).padStart(2, '0');
    // Find matching file
    let match = null;
    if (shot === 1) {
      match = files.find(f => f.includes('nervous_stickman_test_shot_01') && /\.(jpg|png)$/i.test(f));
    } else {
      match = files.find(f => f.includes(`shot_${pad}`) && /\.(jpg|png)$/i.test(f));
    }

    if (match) {
      const src = path.join(brainDir, match);
      const dst = path.join(scenesDir, `shot_${pad}.png`);
      console.log(`Processing shot ${pad}: ${match} -> shot_${pad}.png`);
      await makeTransparent(src, dst);
    } else {
      console.log(`Warning: No image found yet for shot_${pad}`);
    }
  }
}

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('assemble-full-video.mjs')) {
  collectAndProcessImages()
    .then(() => console.log('Done processing available images.'))
    .catch(console.error);
}
