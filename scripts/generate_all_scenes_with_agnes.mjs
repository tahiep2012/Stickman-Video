import fs from 'node:fs';
import path from 'node:path';
import { generateAgnesImage } from '../skills/directing-stickman-videos/scripts/agnes-media.mjs';

const promptsFile = path.resolve('projects/people-pleasing/scene_prompts_ai.json');
const prompts = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
const TARGET_DIR = path.resolve('projects/people-pleasing/scenes');
fs.mkdirSync(TARGET_DIR, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateShotWithRetry(item, maxRetries = 4) {
  const pad = String(item.shot).padStart(2, '0');
  const filename = `shot_${pad}.png`;
  const outputPath = path.join(TARGET_DIR, filename);

  // If already generated and valid size, skip
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
    console.log(`[Skip] Shot ${pad} already exists (${filename})`);
    return { shot: item.shot, file: filename, skipped: true };
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Agnes AI] Generating Shot ${pad} (Attempt ${attempt}): "${item.title}"...`);
      const res = await generateAgnesImage({
        prompt: item.prompt,
        output: outputPath,
        model: 'agnes-image-2.5-flash',
        normalize: true
      });
      console.log(`[Agnes AI] Shot ${pad} completed! Hash: ${res.sha256.slice(0, 16)}...`);
      return { shot: item.shot, file: filename, res };
    } catch (err) {
      if (err.message.includes('429') && attempt < maxRetries) {
        console.warn(`[Rate Limit 429] Waiting 6 seconds before retry ${attempt + 1}...`);
        await sleep(6000);
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  console.log(`Starting sequential Agnes AI scene generation for remaining shots...`);

  for (let i = 0; i < prompts.length; i++) {
    const item = prompts[i];
    await generateShotWithRetry(item);
    // 2.5s polite delay between requests to keep within free-tier rate limits
    await sleep(2500);
  }

  console.log("\nAll 27 Agnes AI scenes successfully generated and normalized!");
}

main().catch(err => {
  console.error("Batch Agnes AI generation failed:", err);
  process.exit(1);
});
