import fs from 'node:fs';
import path from 'node:path';
import { generateAgnesImage } from '../skills/directing-stickman-videos/scripts/agnes-media.mjs';

const B1_STYLE_ANCHOR = "Minimalist 2D hand-drawn stick figure animation style, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, isolated on solid pure white background (#FFFFFF), strictly 2D flat, no 3D shading, no gradients, no shadows, consistent line weight, completely standalone figure not touching image boundaries, no text, no typography.";

const SAMPLE_SHOTS = [
  {
    shot: 1,
    file: 'shot_01.png',
    prompt: `${B1_STYLE_ANCHOR} A nervous stick figure standing behind an office desk overflowing with tall stacks of paperwork and folders, peeking out with a sweat drop on forehead and a forced polite smile.`
  },
  {
    shot: 2,
    file: 'shot_02.png',
    prompt: `${B1_STYLE_ANCHOR} A stick figure bowing low apologetically, hands clasped, while next to it floats a symbolic red heart with a jagged crack mended with a band-aid.`
  },
  {
    shot: 3,
    file: 'shot_03.png',
    prompt: `${B1_STYLE_ANCHOR} A tired stick figure holding a smiling paper mask in front of its real exhausted face, surrounded by multiple disembodied thumbs-up signs giving praise.`
  },
  {
    shot: 4,
    file: 'shot_04.png',
    prompt: `${B1_STYLE_ANCHOR} A closed bedroom door on one side, and a stick figure curled up in bed staring wide-eyed at the ceiling, with a glowing small orange flame burning inside its chest.`
  }
];

const TARGET_DIR = path.resolve('projects/people-pleasing/scenes');
fs.mkdirSync(TARGET_DIR, { recursive: true });

async function main() {
  console.log("Generating sample shots using Agnes AI (model: agnes-image-2.5-flash)...");

  for (const item of SAMPLE_SHOTS) {
    const outputPath = path.join(TARGET_DIR, item.file);
    console.log(`[Agnes AI] Generating Shot ${item.shot} -> ${item.file}...`);
    const res = await generateAgnesImage({
      prompt: item.prompt,
      output: outputPath,
      model: 'agnes-image-2.5-flash',
      normalize: true
    });
    console.log(`[Agnes AI] Shot ${item.shot} generated successfully! Hash: ${res.sha256.slice(0, 16)}...`);
  }

  console.log("All sample scenes generated with Agnes AI successfully!");
}

main().catch(err => {
  console.error("Agnes AI generation failed:", err);
  process.exit(1);
});
