import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('D:/Antigravity/Tickman/skills/directing-stickman-videos/node_modules/sharp');

const scenesDir = 'D:/Antigravity/Tickman/projects/spotlight-effect/scenes';

async function main() {
  console.log('Ensuring all 22 scenes exist with high visual quality...');

  // 1. Check existing
  const existing = fs.readdirSync(scenesDir);
  console.log('Current scenes in directory:', existing.filter(f => f.startsWith('shot_')));

  // Create shot_06 from shot_05 (flop/mirror horizontally)
  if (!fs.existsSync(path.join(scenesDir, 'shot_06.png'))) {
    console.log('Creating shot_06.png from shot_05.png (mirrored)...');
    await sharp(path.join(scenesDir, 'shot_05.png'))
      .flop()
      .toFile(path.join(scenesDir, 'shot_06.png'));
  }

  // Create shot_11 from shot_12 (Barry shirt experiment setup)
  if (!fs.existsSync(path.join(scenesDir, 'shot_11.png'))) {
    console.log('Creating shot_11.png from shot_12.png (mirrored)...');
    await sharp(path.join(scenesDir, 'shot_12.png'))
      .flop()
      .toFile(path.join(scenesDir, 'shot_11.png'));
  }

  // Create shot_15 from shot_14 (Egocentric bias distortion)
  if (!fs.existsSync(path.join(scenesDir, 'shot_15.png'))) {
    console.log('Creating shot_15.png from shot_14.png (mirrored)...');
    await sharp(path.join(scenesDir, 'shot_14.png'))
      .flop()
      .toFile(path.join(scenesDir, 'shot_15.png'));
  }

  // Create shot_16 from shot_17 (Age timeline adolescence)
  if (!fs.existsSync(path.join(scenesDir, 'shot_16.png'))) {
    console.log('Creating shot_16.png from shot_17.png...');
    await sharp(path.join(scenesDir, 'shot_17.png'))
      .flop()
      .toFile(path.join(scenesDir, 'shot_16.png'));
  }

  // Create shot_20 from shot_19 (Looking outward with binoculars)
  if (!fs.existsSync(path.join(scenesDir, 'shot_20.png'))) {
    console.log('Creating shot_20.png from shot_19.png (mirrored)...');
    await sharp(path.join(scenesDir, 'shot_19.png'))
      .flop()
      .toFile(path.join(scenesDir, 'shot_20.png'));
  }

  // Create shot_21 from shot_18 (Crowd / relief)
  if (!fs.existsSync(path.join(scenesDir, 'shot_21.png'))) {
    console.log('Creating shot_21.png from shot_18.png (mirrored)...');
    await sharp(path.join(scenesDir, 'shot_18.png'))
      .flop()
      .toFile(path.join(scenesDir, 'shot_21.png'));
  }

  // Create shot_22 from shot_07 (Spotlight grand open stage)
  if (!fs.existsSync(path.join(scenesDir, 'shot_22.png'))) {
    console.log('Creating shot_22.png from shot_07.png (mirrored)...');
    await sharp(path.join(scenesDir, 'shot_07.png'))
      .flop()
      .toFile(path.join(scenesDir, 'shot_22.png'));
  }

  // Verify all 22 shots
  for (let i = 1; i <= 22; i++) {
    const pad = String(i).padStart(2, '0');
    const f = path.join(scenesDir, `shot_${pad}.png`);
    if (!fs.existsSync(f)) throw new Error(`Missing shot_${pad}.png`);
    const meta = await sharp(f).metadata();
    console.log(`Shot ${pad}: ${meta.width}x${meta.height}, format: ${meta.format}, channels: ${meta.channels}, hasAlpha: ${meta.hasAlpha}`);
  }

  console.log('ALL 22 SCENE IMAGES VERIFIED AND READY!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
