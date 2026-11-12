import fs from 'node:fs';
import path from 'node:path';
import { generateAgnesImage } from '../skills/directing-stickman-videos/scripts/agnes-media.mjs';
import { B1_STYLE_ANCHOR, validateUniqueness } from '../skills/directing-stickman-videos/scripts/scene-studio.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('skills/directing-stickman-videos/node_modules/sharp'));

const projectPath = 'projects/trauma-bonding/project.json';
const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Starting batch generation for ${project.shots.length} shots using Agnes AI...`);
  
  for (let i = 0; i < project.shots.length; i++) {
    const shot = project.shots[i];
    const shotNum = shot.shot_index;
    const shotKey = String(shotNum).padStart(2, '0');
    const outPath = path.resolve(`projects/trauma-bonding/scenes/shot_${shotKey}.png`);
    
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) {
      console.log(`[Shot ${shotKey}/40] Already exists (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB), skipping.`);
      continue;
    }

    const promptDesc = shot.prompt || "Minimalist 2D hand-drawn stick figure illustration";
    const fullPrompt = `${B1_STYLE_ANCHOR} Scene: ${promptDesc}`;

    console.log(`[Shot ${shotKey}/40] Generating via Agnes AI: "${promptDesc.slice(0, 60)}..."`);
    try {
      const res = await generateAgnesImage({
        prompt: fullPrompt,
        output: outPath,
        model: 'agnes-image-2.5-flash',
        normalize: true
      });
      console.log(`[Shot ${shotKey}/40] Done! SHA-256: ${res.sha256.slice(0, 12)}...`);
    } catch (err) {
      console.error(`[Shot ${shotKey}/40] Error: ${err.message}. Retrying in 2s...`);
      await sleep(2000);
      const res = await generateAgnesImage({
        prompt: fullPrompt,
        output: outPath,
        model: 'agnes-image-2.5-flash',
        normalize: true
      });
      console.log(`[Shot ${shotKey}/40] Retry succeeded! SHA-256: ${res.sha256.slice(0, 12)}...`);
    }

    await sleep(400);
  }

  console.log('\n--- ALL 40 SHOTS GENERATED ---');
  console.log('Running uniqueness validation...');
  const validation = validateUniqueness('projects/trauma-bonding/scenes', 40);
  console.log('Validation result:', JSON.stringify(validation, null, 2));

  if (validation.status !== 'pass') {
    throw new Error('Uniqueness validation failed!');
  }

  console.log('\nBuilding 40-shot montage contact sheet...');
  const cols = 5;
  const rows = 8;
  const tileW = 240;
  const tileH = 240;
  const canvasW = cols * tileW;
  const canvasH = rows * tileH;

  const composites = [];
  for (let idx = 0; idx < 40; idx++) {
    const shotKey = String(idx + 1).padStart(2, '0');
    const p = path.resolve(`projects/trauma-bonding/scenes/shot_${shotKey}.png`);
    const c = idx % cols;
    const r = Math.floor(idx / cols);

    const tileBuf = await sharp(p)
      .resize(tileW - 16, tileH - 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    composites.push({
      input: tileBuf,
      left: c * tileW + 8,
      top: r * tileH + 8
    });
  }

  const montagePath = 'projects/trauma-bonding/output/all_40_shots_montage.png';
  fs.mkdirSync(path.dirname(montagePath), { recursive: true });

  await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 245, g: 245, b: 247, alpha: 1 }
    }
  })
    .composite(composites)
    .png()
    .toBuffer()
    .then(b => fs.writeFileSync(montagePath, b));

  console.log(`Montage saved to: ${montagePath}`);
}

main().catch(e => {
  console.error('Fatal batch error:', e);
  process.exitCode = 1;
});
