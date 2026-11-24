import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('skills/directing-stickman-videos/node_modules/sharp'));

async function createMockup(coverPath, circleAvatarPath, outputPath) {
  const coverMeta = await sharp(coverPath).metadata();
  const avatarSize = 340;
  
  const avatarResized = await sharp(circleAvatarPath)
    .resize(avatarSize, avatarSize)
    .toBuffer();
    
  const radius = avatarSize / 2;
  const borderWidth = 6;
  const totalSize = avatarSize + borderWidth * 2;
  
  const borderedSvg = Buffer.from(
    `<svg width="${totalSize}" height="${totalSize}">
       <circle cx="${radius + borderWidth}" cy="${radius + borderWidth}" r="${radius + borderWidth - 1}" fill="white" stroke="#d1d5db" stroke-width="3"/>
     </svg>`
  );
  
  const finalAvatar = await sharp(borderedSvg)
    .composite([{ input: avatarResized, top: borderWidth, left: borderWidth }])
    .png()
    .toBuffer();

  const leftPos = 90;
  const topPos = coverMeta.height - totalSize - 40;

  await sharp(coverPath)
    .composite([{ input: finalAvatar, left: leftPos, top: topPos }])
    .png()
    .toFile(outputPath);
    
  console.log('Mockup created:', outputPath);
}

async function run() {
  const circle1 = 'C:/Users/votah/.gemini/antigravity/brain/85bd34cd-735f-4e9d-ba66-a5120e131a04/b6-facebook-avatar-circle-preview.png';
  const circle2 = 'C:/Users/votah/.gemini/antigravity/brain/85bd34cd-735f-4e9d-ba66-a5120e131a04/b6-facebook-avatar-opt2-circle-preview.png';
  
  await createMockup(
    'assets/b6/facebook-cover-landscape.png',
    circle1,
    'C:/Users/votah/.gemini/antigravity/brain/85bd34cd-735f-4e9d-ba66-a5120e131a04/facebook-page-mockup-landscape-1.png'
  );
  
  await createMockup(
    'assets/b6/facebook-cover-landscape.png',
    circle2,
    'C:/Users/votah/.gemini/antigravity/brain/85bd34cd-735f-4e9d-ba66-a5120e131a04/facebook-page-mockup-landscape-2.png'
  );
}

run().catch(console.error);
