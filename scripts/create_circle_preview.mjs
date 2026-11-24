import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('skills/directing-stickman-videos/node_modules/sharp'));

async function makeCircle(inputPath, outputPath) {
  const width = 1024, height = 1024;
  const radius = width / 2;
  const circleSvg = Buffer.from(
    `<svg width="${width}" height="${height}"><circle cx="${radius}" cy="${radius}" r="${radius - 4}" fill="white"/></svg>`
  );
  
  await sharp(inputPath)
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toFile(outputPath);
    
  console.log('Circular avatar preview created for:', outputPath);
}

async function run() {
  await makeCircle('assets/b6/facebook-avatar.png', 'C:/Users/votah/.gemini/antigravity/brain/85bd34cd-735f-4e9d-ba66-a5120e131a04/b6-facebook-avatar-circle-preview.png');
  await makeCircle('assets/b6/facebook-avatar-opt2.png', 'C:/Users/votah/.gemini/antigravity/brain/85bd34cd-735f-4e9d-ba66-a5120e131a04/b6-facebook-avatar-opt2-circle-preview.png');
}

run().catch(console.error);
