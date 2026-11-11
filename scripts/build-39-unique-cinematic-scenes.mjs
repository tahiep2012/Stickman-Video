import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('D:/Antigravity/Tickman/skills/directing-stickman-videos/node_modules/sharp');

const scenesDir = 'D:/Antigravity/Tickman/projects/spotlight-effect/scenes';
const projectPath = 'D:/Antigravity/Tickman/projects/spotlight-effect/project.json';
const b1Assets = 'D:/Antigravity/Tickman/skills/directing-stickman-videos/assets/b1';
const b5Assets = 'D:/Antigravity/Tickman/skills/directing-stickman-videos/assets/b5/reference';
const brainDir = 'C:/Users/Elt.pur02/.gemini/antigravity/brain/c5690218-6497-42c2-a2e1-386a25a75f28';
const repoThumbnailDir = 'D:/Antigravity/Tickman/assets/readme/thumbnails';

async function toTransparentSquare(buf, targetSize = 900, threshold = 210) {
  const raw = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < raw.data.length; i += 4) {
    if (raw.data[i] >= threshold && raw.data[i+1] >= (threshold - 5) && raw.data[i+2] >= (threshold - 10)) {
      raw.data[i+3] = 0;
    }
  }
  const trimmed = await sharp(raw.data, { raw: raw.info }).trim().png().toBuffer();
  
  // Normalization: Ensure every illustration fills ~85% of canvas (765px), ensuring bold, captivating prominence
  const contentSize = Math.round(targetSize * 0.85);
  const resized = await sharp(trimmed)
    .resize({ width: contentSize, height: contentSize, fit: 'inside' })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const left = Math.round((targetSize - meta.width) / 2);
  const top = Math.round((targetSize - meta.height) / 2);

  return sharp(resized)
    .extend({
      top: top,
      bottom: targetSize - meta.height - top,
      left: left,
      right: targetSize - meta.width - left,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
}

async function prepareAll39Images() {
  console.log('--- GENERATING 39 100% UNIQUE, CLEAN STICKMAN ILLUSTRATIONS ---');

  const poseSheet = path.join(b1Assets, 'character-pose-sheet-v6.png');
  const actRef = path.join(b1Assets, 'character-acting-reference.png');
  const motionSheet = path.join(b1Assets, 'approved-2026-10-23-motion-sheet.png');
  const b1Long = path.join(b1Assets, 'approved-2026-10-24-longform-contact-sheet.jpg');
  const noCam = path.join(repoThumbnailDir, 'no-camera.jpg');

  // Shot 01: Nervous walking (AI original shot 1)
  const s01AI = fs.readFileSync(path.join(brainDir, 'nervous_stickman_test_shot_01_1794372760058.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_01.png'), await toTransparentSquare(s01AI, 900, 235));

  // Shot 02: Awkward walk looking at crowd (AI shot 2)
  const s02AI = fs.readFileSync(path.join(brainDir, 'shot_02_awkward_walk_1794373170664.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_02.png'), await toTransparentSquare(s02AI, 900, 235));

  // Shot 03: Bed cringe replay at 2am (AI shot 3)
  const s03AI = fs.readFileSync(path.join(brainDir, 'shot_03_bed_cringe_1794373186772.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_03.png'), await toTransparentSquare(s03AI, 900, 235));

  // Shot 04: Invisible camera zoom (AI shot 4)
  const s04AI = fs.readFileSync(path.join(brainDir, 'shot_04_invisible_camera_1794373202790.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_04.png'), await toTransparentSquare(s04AI, 900, 235));

  // Shot 05: Fear of judgment microscope (AI shot 5)
  const s05AI = fs.readFileSync(path.join(brainDir, 'shot_05_fear_judgment_1794373219488.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_05.png'), await toTransparentSquare(s05AI, 900, 235));

  // Shot 06: Screaming shock, hands on ears (Pose 1)
  const p1 = await sharp(poseSheet).extract({ left: 661, top: 0, width: 661, height: 793 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_06.png'), await toTransparentSquare(p1, 900, 230));

  // Shot 07: Spotlight beam illuminating stickman (AI shot 7)
  const s07AI = fs.readFileSync(path.join(brainDir, 'shot_07_spotlight_beam_1794373179077.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_07.png'), await toTransparentSquare(s07AI, 900, 235));

  // Shot 08: Huge red coffee stain on shirt (AI shot 8)
  const s08AI = fs.readFileSync(path.join(brainDir, 'shot_08_coffee_stain_1794373196515.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_08.png'), await toTransparentSquare(s08AI, 900, 235));

  // Shot 09: Stickman crouching in awkward despair (b5 0390.png - cropped below "NOT ONCE")
  const b5_0390 = await sharp(path.join(b5Assets, '0390.png')).extract({ left: 200, top: 480, width: 600, height: 520 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_09.png'), await toTransparentSquare(b5_0390, 900, 210));

  // Shot 10: Social freeze (stiff posture, AI shot 9)
  const s09AI = fs.readFileSync(path.join(brainDir, 'shot_09_social_freezing_1794373212872.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_10.png'), await toTransparentSquare(s09AI, 900, 235));

  // Shot 11: Sad stickman on stool with tear (motion sheet row 3 col 1 - ZERO text, 100% pure white)
  const stoolBuf = await sharp(motionSheet).extract({ left: 30, top: 560, width: 280, height: 250 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_11.png'), await toTransparentSquare(stoolBuf, 900, 230));

  // Shot 12: Presentation panic podium (AI shot 10)
  const s10AI = fs.readFileSync(path.join(brainDir, 'shot_10_presentation_panic_1794373231017.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_12.png'), await toTransparentSquare(s10AI, 900, 235));

  // Shot 13: Holding collapsing pile of cards (acting reference right)
  const s13Buf = await sharp(actRef).extract({ left: 800, top: 0, width: 800, height: 450 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_13.png'), await toTransparentSquare(s13Buf, 900, 230));

  // Shot 14: Stickman raised finger with knowing smirk (no-camera right)
  const s14Buf = await sharp(noCam).extract({ left: 650, top: 0, width: 630, height: 720 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_14.png'), await toTransparentSquare(s14Buf, 900, 230));

  // Shot 15: Full 16:9 Easel with yellow frame, play button & pointing stickman (b1 longform panel 2 - ZERO text!)
  const boardBuf = await sharp(b1Long).extract({ left: 725, top: 145, width: 440, height: 210 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_15.png'), await toTransparentSquare(boardBuf, 900, 230));

  // Shot 16: Barry Manilow t-shirt experiment (AI shot 12)
  const s12AI = fs.readFileSync(path.join(brainDir, 'shot_12_barry_shirt_1794373191290.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_16.png'), await toTransparentSquare(s12AI, 900, 235));

  // Shot 17: 50% vs 23% comparison chart (AI shot 13)
  const s13AI = fs.readFileSync(path.join(brainDir, 'shot_13_chart_50_23_1794373205993.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_17.png'), await toTransparentSquare(s13AI, 900, 235));

  // Shot 18: Stickman editing at desk phase 2 (motion sheet row 1 col 2 - ZERO text)
  const deskPhase2 = await sharp(motionSheet).extract({ left: 350, top: 0, width: 350, height: 270 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_18.png'), await toTransparentSquare(deskPhase2, 900, 230));

  // Shot 19: Egocentric bias VR headset rays (AI shot 14)
  const s14AI = fs.readFileSync(path.join(brainDir, 'shot_14_egocentric_bias_1794373221557.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_19.png'), await toTransparentSquare(s14AI, 900, 235));

  // Shot 20: Stickman looking at mirror sad reflection (b5 0580.png - threshold 210 removes off-white)
  const b5_0580 = await sharp(path.join(b5Assets, '0580.png')).extract({ left: 320, top: 300, width: 500, height: 650 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_20.png'), await toTransparentSquare(b5_0580, 900, 210));

  // Shot 21: Stickman struggling with heavy box (b5 0055.png)
  const b5_0055 = await sharp(path.join(b5Assets, '0055.png')).extract({ left: 260, top: 460, width: 450, height: 500 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_21.png'), await toTransparentSquare(b5_0055, 900, 210));

  // Shot 22: Deep melancholy reflection, hand on chin (Pose 2)
  const p2 = await sharp(poseSheet).extract({ left: 1322, top: 0, width: 661, height: 793 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_22.png'), await toTransparentSquare(p2, 900, 230));

  // Shot 23: Stickman tied up with red ribbon (b5 0128.png)
  const b5_0128 = await sharp(path.join(b5Assets, '0128.png')).extract({ left: 50, top: 400, width: 550, height: 550 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_23.png'), await toTransparentSquare(b5_0128, 900, 210));

  // Shot 24: Overloaded desk / office chair with mountain of documents (b5 0226.png)
  const b5_0226 = await sharp(path.join(b5Assets, '0226.png')).extract({ left: 200, top: 550, width: 480, height: 480 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_24.png'), await toTransparentSquare(b5_0226, 900, 210));

  // Shot 25: Stickman neutral straight face (b5 0335.png - cropped below "NDENCE")
  const b5_0335 = await sharp(path.join(b5Assets, '0335.png')).extract({ left: 450, top: 320, width: 300, height: 600 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_25.png'), await toTransparentSquare(b5_0335, 900, 210));

  // Shot 26: Desk work intently at computer (acting ref left)
  const s26Buf = await sharp(actRef).extract({ left: 0, top: 0, width: 800, height: 450 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_26.png'), await toTransparentSquare(s26Buf, 900, 230));

  // Shot 27: Age timeline 18 - 40 - 60 (AI shot 17)
  const s17AI = fs.readFileSync(path.join(brainDir, 'shot_17_age_timeline_1794373204601.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_27.png'), await toTransparentSquare(s17AI, 900, 235));

  // Shot 28: Busy crowd with individual spotlights (AI shot 18)
  const s18AI = fs.readFileSync(path.join(brainDir, 'shot_18_busy_crowd_spotlights_1794373222604.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_28.png'), await toTransparentSquare(s18AI, 900, 235));

  // Shot 29: Stickman walking carrying small box (b5 0000.png)
  const b5_0000 = await sharp(path.join(b5Assets, '0000.png')).extract({ left: 350, top: 450, width: 380, height: 550 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_29.png'), await toTransparentSquare(b5_0000, 900, 210));

  // Shot 30: Looking outward with binoculars (AI shot 19)
  const s19AI = fs.readFileSync(path.join(brainDir, 'shot_19_binoculars_outward_1794373241451.jpg'));
  fs.writeFileSync(path.join(scenesDir, 'shot_30.png'), await toTransparentSquare(s19AI, 900, 235));

  // Shot 31: Stickman bracing collapsing pile of cards phase 2 (motion sheet row 2 col 2 - ZERO text)
  const cardsPhase2 = await sharp(motionSheet).extract({ left: 350, top: 270, width: 350, height: 270 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_31.png'), await toTransparentSquare(cardsPhase2, 900, 230));

  // Shot 32: Passionate speech leaning forward (Pose 0)
  const p0 = await sharp(poseSheet).extract({ left: 0, top: 0, width: 661, height: 793 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_32.png'), await toTransparentSquare(p0, 900, 230));

  // Shot 33: Stickman dodging / flinching away in panic (b5 0510.png)
  const b5_0510 = await sharp(path.join(b5Assets, '0510.png')).extract({ left: 240, top: 430, width: 350, height: 500 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_33.png'), await toTransparentSquare(b5_0510, 900, 210));

  // Shot 34: Sad stickman on stool looking down phase 2 (motion sheet row 3 col 2 - ZERO text)
  const stoolPhase2 = await sharp(motionSheet).extract({ left: 350, top: 540, width: 350, height: 270 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_34.png'), await toTransparentSquare(stoolPhase2, 900, 230));

  // Shot 35: Stickman looking at mirror with happy confident reflection (b5 0641.png)
  const b5_0641 = await sharp(path.join(b5Assets, '0641.png')).extract({ left: 300, top: 300, width: 500, height: 650 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_35.png'), await toTransparentSquare(b5_0641, 900, 210));

  // Shot 36: Stickman writing ideas on table with pencil & pointing finger up (motion sheet row 4 col 1 - ZERO text)
  const tablePencil1 = await sharp(motionSheet).extract({ left: 30, top: 820, width: 300, height: 260 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_36.png'), await toTransparentSquare(tablePencil1, 900, 230));

  // Shot 37: Confident stickman presenting with yellow script (b1 longform panel 3 - ZERO text)
  const scriptPresenter1 = await sharp(b1Long).extract({ left: 1730, top: 120, width: 170, height: 260 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_37.png'), await toTransparentSquare(scriptPresenter1, 900, 230));

  // Shot 38: Stickman sitting at desk with coffee editing video (motion sheet row 1 col 1 - ZERO text)
  const deskPhase1 = await sharp(motionSheet).extract({ left: 30, top: 20, width: 300, height: 250 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_38.png'), await toTransparentSquare(deskPhase1, 900, 230));

  // Shot 39: Triumphant finale stickman waving and presenting (b1 longform panel 14 - ZERO text)
  const triumphantBuf = await sharp(b1Long).extract({ left: 690, top: 1330, width: 140, height: 210 }).png().toBuffer();
  fs.writeFileSync(path.join(scenesDir, 'shot_39.png'), await toTransparentSquare(triumphantBuf, 900, 230));

  console.log('Finished writing all 39 images to disk!');

  // Check unique hashes
  const hashes = new Map();
  for (let i = 1; i <= 39; i++) {
    const pad = String(i).padStart(2, '0');
    const f = path.join(scenesDir, `shot_${pad}.png`);
    if (!fs.existsSync(f)) throw new Error(`Missing shot_${pad}.png!`);
    const buf = fs.readFileSync(f);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    if (hashes.has(hash)) {
      throw new Error(`DUPLICATE DETECTED: shot_${pad} matches shot_${hashes.get(hash)}!`);
    }
    hashes.set(hash, pad);
  }
  console.log(`ALL 39 IMAGES VERIFIED: ${hashes.size} / 39 are 100% unique, non-repeating!`);

  // Now update project.json with 39 shots, ZERO Topic Badges
  const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

  const shots39Timing = [
    { start: 0, end: 7.36 },
    { start: 7.36, end: 12.03 },
    { start: 12.03, end: 21.93 },
    { start: 21.93, end: 31.36 },
    { start: 31.36, end: 41.845 },
    { start: 41.845, end: 51.013 },
    { start: 51.013, end: 62.59 },
    { start: 62.59, end: 75.61 },
    { start: 75.61, end: 89.66 },
    { start: 89.66, end: 103.91 },
    { start: 103.91, end: 112.52 },
    { start: 112.52, end: 124.55 },
    { start: 124.55, end: 137.76 },
    { start: 137.76, end: 151.86 },
    { start: 151.86, end: 162.75 },
    { start: 162.75, end: 174.88 },
    { start: 174.88, end: 186.83 },
    { start: 186.83, end: 199.50 },
    { start: 199.50, end: 213.05 },
    { start: 213.05, end: 227.00 },
    { start: 227.00, end: 242.44 },
    { start: 242.44, end: 255.00 },
    { start: 255.00, end: 268.48 },
    { start: 268.48, end: 279.79 },
    { start: 279.79, end: 290.00 },
    { start: 290.00, end: 301.05 },
    { start: 301.05, end: 312.48 },
    { start: 312.48, end: 323.75 },
    { start: 323.75, end: 332.48 },
    { start: 332.48, end: 344.65 },
    { start: 344.65, end: 358.14 },
    { start: 358.14, end: 367.06 },
    { start: 367.06, end: 376.89 },
    { start: 376.89, end: 388.14 },
    { start: 388.14, end: 398.05 },
    { start: 398.05, end: 408.17 },
    { start: 408.17, end: 416.89 },
    { start: 416.89, end: 428.62 },
    { start: 428.62, end: 434.416 }
  ];

  // Specific layout: alternating between center and split with prop
  // ZERO text / underline layers!
  const props = [
    '@b1/camera-handdrawn.png',
    null,
    null,
    '@b1/camera-handdrawn.png',
    null,
    null,
    null,
    '@b1/idea-bulb-crayon.png',
    null,
    '@b1/clapper-crayon.png',
    null,
    null,
    null,
    '@b1/script-page-crayon.png',
    null,
    null,
    '@b1/idea-bulb-crayon.png',
    null,
    '@b1/open-source-crayon.png',
    null,
    null,
    null,
    null,
    '@b1/clapper-crayon.png',
    null,
    '@b1/calendar-crayon.png',
    null,
    null,
    '@b1/open-source-crayon.png',
    '@b1/open-source-crayon.png',
    null,
    '@b1/idea-bulb-crayon.png',
    null,
    '@b1/clapper-crayon.png',
    null,
    '@b1/idea-note-crayon.png',
    null,
    '@b1/youtube-crayon.png',
    null,
  ];

  project.shots = shots39Timing.map((timing, i) => {
    const pad = String(i + 1).padStart(2, '0');
    const heroPath = `scenes/shot_${pad}.png`;
    const prop = props[i];
    const layers = [];

    if (prop) {
      // Split layout: Left prop + Right hero
      layers.push({
        type: 'image',
        path: prop,
        x: 120,
        y: 190,
        w: 280,
        keys: [
          { t: 0, angle: -0.05 },
          { t: 1.0, angle: 0.04 },
          { t: 2.0, angle: 0 },
        ],
      });

      layers.push({
        type: 'image',
        path: heroPath,
        x: 580,
        y: 35,
        w: 620,
        keys: [
          { t: 0, y: 50, alpha: 0.85 },
          { t: 0.5, y: 35, alpha: 1.0 },
        ],
      });
    } else {
      // Center layout: Bold hero commanding the canvas
      layers.push({
        type: 'image',
        path: heroPath,
        x: 320,
        y: 35,
        w: 640,
        keys: [
          { t: 0, y: 50, alpha: 0.85 },
          { t: 0.5, y: 35, alpha: 1.0 },
        ],
      });
    }

    return {
      start: timing.start,
      end: timing.end,
      layers,
    };
  });

  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), 'utf8');
  console.log('Successfully generated 39 shots in project.json with ZERO Topic Badges and 100% unique artwork!');
}

prepareAll39Images().catch(err => {
  console.error('Error during generation:', err);
  process.exit(1);
});
