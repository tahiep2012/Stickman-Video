import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('skills/directing-stickman-videos/node_modules/sharp'));
import { toTransparentSquare, validateUniqueness } from '../skills/directing-stickman-videos/scripts/scene-studio.mjs';

const BRAIN_DIR = "C:/Users/votah/.gemini/antigravity/brain/c5690218-6497-42c2-a2e1-386a25a75f28";
const TARGET_DIR = path.resolve("projects/self-sabotage/scenes");
fs.mkdirSync(TARGET_DIR, { recursive: true });

// SVG sketch helper to produce organic hand-drawn stickman figures matching B1 Style
function wrapSvg(content) {
  return `
<svg width="900" height="900" viewBox="0 0 900 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sketch" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <g filter="url(#sketch)" stroke="#111111" stroke-linecap="round" stroke-linejoin="round" fill="none">
    ${content}
  </g>
</svg>
`;
}

async function renderSvgToPng(svgString, outputPath) {
  const buf = Buffer.from(svgString);
  const rawPng = await sharp(buf).resize(900, 900).png().toBuffer();
  await toTransparentSquare(rawPng, outputPath, 900, 240);
}

// Map each of the 41 scenes
async function main() {
  console.log("Starting full scene production for 41 shots...");

  // 1. Process AI Generated files:
  const aiGeneratedMap = [
    { shot: "01", file: "shot_01_relationship_anxiety_1794395683623.jpg" },
    { shot: "02", file: "shot_02_whispering_demon_1794395700661.jpg" },
    { shot: "03", file: "shot_03_nitpicking_flaws_1794395715082.jpg" },
    { shot: "04", file: "shot_04_partner_leaves_1794395730119.jpg" },
    { shot: "08", file: "shot_08_unmasking_sabotage_1794395694940.jpg" },
    { shot: "09", file: "shot_09_circular_loop_1794395709180.jpg" },
    { shot: "10", file: "shot_10_calendar_procrastination_1794395725246.jpg" },
    { shot: "15", file: "shot_15_ghosting_quitting_1794395698060.jpg" },
    { shot: "16", file: "shot_16_brain_curiosity_1794395731488.jpg" },
    { shot: "22", file: "shot_22_preemptive_strike_1794395711714.jpg" },
    { shot: "23", file: "shot_23_cognitive_dissonance_1794395728591.jpg" },
    { shot: "29", file: "shot_29_three_pathways_1794395734543.jpg" }
  ];

  for (const item of aiGeneratedMap) {
    const src = path.join(BRAIN_DIR, item.file);
    const dest = path.join(TARGET_DIR, `shot_${item.shot}.png`);
    await toTransparentSquare(src, dest, 900, 215);
    console.log(`[AI] Processed Shot ${item.shot} from ${item.file}`);
  }

  // 2. Process pre-generated verified B1 artwork from brain:
  const preGenMap = [
    { shot: "06", file: "shot_03_bed_cringe_1794373186772.jpg" }, // Late night lying in bed curling in dread
    { shot: "12", file: "shot_05_fear_judgment_1794373219488.jpg" }, // Ego defense shielding ears from judgment
    { shot: "14", file: "shot_02_awkward_walk_1794373170664.jpg" }, // Awkward hesitant walk towards red flags
    { shot: "24", file: "shot_10_presentation_panic_1794373231017.jpg" } // Sweating with imposter anxiety at podium
  ];

  for (const item of preGenMap) {
    const src = path.join(BRAIN_DIR, item.file);
    const dest = path.join(TARGET_DIR, `shot_${item.shot}.png`);
    await toTransparentSquare(src, dest, 900, 215);
    console.log(`[PreGen] Processed Shot ${item.shot} from ${item.file}`);
  }

  // 3. Render bespoke SVG stickman scenes:
  const bespokeSvgs = {
    // Shot 05: Career ladder hesitation & open opportunity door
    "05": wrapSvg(`
      <!-- Door -->
      <rect x="520" y="240" width="180" height="420" rx="10" stroke-width="7" />
      <circle cx="550" cy="460" r="8" fill="#111111" />
      <path d="M 610 180 L 610 210 M 590 195 L 630 195" stroke-width="6" /> <!-- Star above door -->
      <!-- Hesitating stickman -->
      <circle cx="340" cy="320" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="325" cy="315" r="4" fill="#111111" />
      <circle cx="355" cy="315" r="4" fill="#111111" />
      <path d="M 315 300 Q 325 292 335 300" stroke-width="5" />
      <path d="M 345 300 Q 355 292 365 300" stroke-width="5" />
      <path d="M 330 350 Q 345 342 355 350" stroke-width="5" />
      <line x1="340" y1="380" x2="340" y2="540" stroke-width="8" />
      <!-- Hands scratching back of head -->
      <path d="M 340 420 L 300 460 L 320 330" stroke-width="7" />
      <path d="M 340 420 L 390 480" stroke-width="7" />
      <!-- Legs frozen -->
      <path d="M 340 540 L 310 700 L 290 730" stroke-width="8" />
      <path d="M 340 540 L 370 700 L 390 730" stroke-width="8" />
    `),

    // Shot 07: Mirror of self-compassion (you are not stupid or broken)
    "07": wrapSvg(`
      <!-- Mirror oval -->
      <ellipse cx="560" cy="420" rx="120" ry="200" stroke-width="8" />
      <path d="M 560 620 L 560 740 M 480 740 L 640 740" stroke-width="8" />
      <!-- Reflection inside mirror smiling gently -->
      <circle cx="560" cy="360" r="45" stroke-width="6" />
      <circle cx="548" cy="355" r="3" fill="#111111" />
      <circle cx="572" cy="355" r="3" fill="#111111" />
      <path d="M 550 380 Q 560 392 570 380" stroke-width="4" />
      <line x1="560" y1="405" x2="560" y2="520" stroke-width="6" />
      <!-- Stickman outside looking in lovingly -->
      <circle cx="310" cy="370" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="330" cy="365" r="4" fill="#111111" />
      <path d="M 320 350 Q 330 342 342 350" stroke-width="5" />
      <path d="M 325 395 Q 338 405 348 395" stroke-width="5" />
      <line x1="310" y1="430" x2="310" y2="590" stroke-width="8" />
      <path d="M 310 470 L 380 500 L 440 460" stroke-width="7" />
      <path d="M 310 470 L 270 540" stroke-width="7" />
      <path d="M 310 590 L 280 730 L 260 750" stroke-width="8" />
      <path d="M 310 590 L 350 730 L 370 750" stroke-width="8" />
    `),

    // Shot 11: Cleaning frenzy & organizing clothes to avoid real deadline
    "11": wrapSvg(`
      <!-- Table with neglected closed laptop -->
      <rect x="180" y="520" width="160" height="20" stroke-width="7" />
      <path d="M 210 520 L 260 460 M 260 520 L 260 460" stroke-width="6" />
      <line x1="200" y1="540" x2="200" y2="720" stroke-width="7" />
      <line x1="320" y1="540" x2="320" y2="720" stroke-width="7" />
      <!-- Stickman vigorously sweeping with broom -->
      <circle cx="520" cy="300" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="505" cy="295" r="4" fill="#111111" />
      <circle cx="535" cy="295" r="4" fill="#111111" />
      <path d="M 500 280 Q 510 272 520 280" stroke-width="5" />
      <path d="M 525 280 Q 535 272 545 280" stroke-width="5" />
      <path d="M 515 325 Q 525 335 535 325" stroke-width="5" />
      <line x1="520" y1="360" x2="520" y2="520" stroke-width="8" />
      <!-- Hands holding broom handle -->
      <path d="M 520 400 L 460 440 L 430 520" stroke-width="7" />
      <path d="M 520 400 L 570 450 L 520 540" stroke-width="7" />
      <!-- Broom diagonal -->
      <line x1="620" y1="360" x2="400" y2="680" stroke-width="8" />
      <polygon points="380,670 410,650 360,730 330,710" stroke-width="6" fill="#FFFFFF" />
      <!-- Dust swooshes -->
      <path d="M 330 730 Q 310 740 290 730" stroke-width="4" stroke-dasharray="6,6" />
      <path d="M 350 750 Q 330 760 300 750" stroke-width="4" stroke-dasharray="6,6" />
      <!-- Legs in action -->
      <path d="M 520 520 L 470 660 L 450 720" stroke-width="8" />
      <path d="M 520 520 L 560 660 L 580 720" stroke-width="8" />
    `),

    // Shot 13: Magnifying glass inspecting tiny heart flaw
    "13": wrapSvg(`
      <!-- Stickman holding magnifying glass -->
      <circle cx="340" cy="340" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="360" cy="335" r="5" fill="#111111" />
      <path d="M 345 320 Q 360 310 375 325" stroke-width="5" />
      <path d="M 350 370 Q 365 365 375 372" stroke-width="5" />
      <line x1="340" y1="400" x2="340" y2="560" stroke-width="8" />
      <!-- Arm holding magnifying glass -->
      <path d="M 340 440 L 440 430" stroke-width="7" />
      <line x1="440" y1="430" x2="520" y2="400" stroke-width="9" />
      <!-- Magnifying glass circle -->
      <circle cx="560" cy="380" r="90" stroke-width="10" />
      <!-- Heart inside glass with tiny crack -->
      <path d="M 560 350 C 540 310 490 330 510 370 C 530 400 560 430 560 430 C 560 430 590 400 610 370 C 630 330 580 310 560 350 Z" stroke-width="6" fill="#FFFFFF" />
      <path d="M 555 360 L 565 375 L 555 390" stroke-width="4" />
      <!-- Legs -->
      <path d="M 340 560 L 310 720 L 290 750" stroke-width="8" />
      <path d="M 340 560 L 380 720 L 400 750" stroke-width="8" />
    `),

    // Shot 17: Upper limit problem - touching invisible glass ceiling
    "17": wrapSvg(`
      <!-- Invisible glass ceiling line with dashes -->
      <line x1="160" y1="240" x2="740" y2="240" stroke-width="6" stroke-dasharray="12,12" />
      <path d="M 180 230 L 720 230" stroke-width="3" stroke="#888888" />
      <!-- Ladder -->
      <line x1="380" y1="400" x2="380" y2="760" stroke-width="7" />
      <line x1="520" y1="400" x2="520" y2="760" stroke-width="7" />
      <line x1="380" y1="460" x2="520" y2="460" stroke-width="6" />
      <line x1="380" y1="540" x2="520" y2="540" stroke-width="6" />
      <line x1="380" y1="620" x2="520" y2="620" stroke-width="6" />
      <line x1="380" y1="700" x2="520" y2="700" stroke-width="6" />
      <!-- Stickman climbing & pressing hands against glass ceiling -->
      <circle cx="450" cy="330" r="55" fill="#FFFFFF" stroke-width="8" />
      <circle cx="440" cy="320" r="4" fill="#111111" />
      <circle cx="460" cy="320" r="4" fill="#111111" />
      <path d="M 435 305 Q 445 300 455 305" stroke-width="5" />
      <path d="M 440 350 Q 450 345 460 350" stroke-width="5" />
      <line x1="450" y1="385" x2="450" y2="530" stroke-width="8" />
      <!-- Hands pressing against dashed line -->
      <path d="M 450 410 L 390 320 L 400 240" stroke-width="7" />
      <path d="M 450 410 L 510 320 L 500 240" stroke-width="7" />
      <line x1="385" y1="240" x2="415" y2="240" stroke-width="8" />
      <line x1="485" y1="240" x2="515" y2="240" stroke-width="8" />
      <!-- Feet on rung -->
      <path d="M 450 530 L 410 610 L 430 620" stroke-width="8" />
      <path d="M 450 530 L 480 570 L 470 620" stroke-width="8" />
    `),

    // Shot 18: Hand-drawn thermostat dial with needle in struggle zone
    "18": wrapSvg(`
      <!-- Thermostat circular housing -->
      <circle cx="450" cy="420" r="190" stroke-width="10" fill="#FFFFFF" />
      <circle cx="450" cy="420" r="170" stroke-width="4" stroke-dasharray="8,10" />
      <circle cx="450" cy="420" r="25" fill="#111111" />
      <!-- Dial ticks -->
      <line x1="310" y1="420" x2="340" y2="420" stroke-width="6" />
      <line x1="560" y1="420" x2="590" y2="420" stroke-width="6" />
      <line x1="450" y1="280" x2="450" y2="310" stroke-width="6" />
      <!-- Needle pointing left to safe pain zone -->
      <line x1="450" y1="420" x2="340" y2="350" stroke-width="9" />
      <polygon points="330,345 350,340 345,360" fill="#111111" />
      <!-- Labels in sketch text style -->
      <path d="M 300 480 Q 350 490 400 480" stroke-width="4" />
      <text x="310" y="520" font-family="sans-serif" font-size="26" font-weight="bold" fill="#111111">STRUGGLE</text>
      <text x="500" y="520" font-family="sans-serif" font-size="26" font-weight="bold" fill="#888888">BLISS</text>
    `),

    // Shot 19: Thermostat needle spiking into bliss zone with steam & alarm waves
    "19": wrapSvg(`
      <!-- Thermostat spiking right into bliss -->
      <circle cx="450" cy="440" r="180" stroke-width="10" fill="#FFFFFF" />
      <circle cx="450" cy="440" r="160" stroke-width="4" stroke-dasharray="6,8" />
      <circle cx="450" cy="440" r="25" fill="#111111" />
      <!-- Needle pointing sharply right past the limit -->
      <line x1="450" y1="440" x2="580" y2="330" stroke-width="10" />
      <polygon points="590,320 570,330 580,350" fill="#111111" />
      <!-- Heat steam squiggles -->
      <path d="M 590 270 Q 610 240 590 210 Q 610 180 590 150" stroke-width="5" />
      <path d="M 630 290 Q 650 260 630 230 Q 650 200 630 170" stroke-width="5" />
      <path d="M 550 280 Q 570 250 550 220" stroke-width="5" />
      <!-- Alarm burst marks -->
      <line x1="680" y1="360" x2="740" y2="340" stroke-width="6" />
      <line x1="670" y1="420" x2="730" y2="430" stroke-width="6" />
      <text x="470" y="540" font-family="sans-serif" font-size="28" font-weight="bold" fill="#111111">OVERHEAT!</text>
    `),

    // Shot 20: Amygdala alarm bell ringing in panic
    "20": wrapSvg(`
      <!-- Stickman clutching head in shock alarm -->
      <circle cx="450" cy="380" r="65" fill="#FFFFFF" stroke-width="9" />
      <!-- Wide shocked eyes -->
      <circle cx="430" cy="375" r="10" stroke-width="4" />
      <circle cx="430" cy="375" r="3" fill="#111111" />
      <circle cx="470" cy="375" r="10" stroke-width="4" />
      <circle cx="470" cy="375" r="3" fill="#111111" />
      <!-- Open gasp mouth -->
      <ellipse cx="450" cy="415" rx="14" ry="20" stroke-width="5" fill="#FFFFFF" />
      <line x1="450" y1="445" x2="450" y2="600" stroke-width="9" />
      <!-- Hands on cheeks in Home Alone shock pose -->
      <path d="M 450 490 L 390 440 L 395 385" stroke-width="8" />
      <path d="M 450 490 L 510 440 L 505 385" stroke-width="8" />
      <!-- Ringing bell above head -->
      <path d="M 430 240 Q 450 200 470 240 L 485 270 L 415 270 Z" stroke-width="7" fill="#FFFFFF" />
      <circle cx="450" cy="285" r="8" fill="#111111" />
      <!-- Ringing waves -->
      <path d="M 390 220 Q 370 245 390 270" stroke-width="5" />
      <path d="M 370 205 Q 345 245 370 285" stroke-width="5" />
      <path d="M 510 220 Q 530 245 510 270" stroke-width="5" />
      <path d="M 530 205 Q 555 245 530 285" stroke-width="5" />
      <!-- Legs trembling -->
      <path d="M 450 600 L 410 740 L 390 760" stroke-width="9" />
      <path d="M 450 600 L 490 740 L 510 760" stroke-width="9" />
    `),

    // Shot 21: Attachment theory - two stickmen connected by frayed string
    "21": wrapSvg(`
      <!-- Left stickman (Anxious) reaching out -->
      <circle cx="280" cy="360" r="55" fill="#FFFFFF" stroke-width="8" />
      <circle cx="295" cy="355" r="4" fill="#111111" />
      <path d="M 285 340 Q 295 332 305 342" stroke-width="5" />
      <path d="M 285 385 Q 295 380 305 385" stroke-width="5" />
      <line x1="280" y1="415" x2="280" y2="570" stroke-width="8" />
      <path d="M 280 460 L 360 470" stroke-width="7" />
      <path d="M 280 570 L 250 710 L 230 730" stroke-width="8" />
      <path d="M 280 570 L 310 710 L 330 730" stroke-width="8" />
      <!-- Right stickman (Avoidant) looking away with arms crossed -->
      <circle cx="620" cy="360" r="55" fill="#FFFFFF" stroke-width="8" />
      <circle cx="635" cy="355" r="4" fill="#111111" />
      <path d="M 625 340 Q 635 332 645 342" stroke-width="5" />
      <line x1="620" y1="415" x2="620" y2="570" stroke-width="8" />
      <path d="M 620 460 L 570 480 L 610 510" stroke-width="7" />
      <path d="M 620 570 L 600 710 L 590 730" stroke-width="8" />
      <path d="M 620 570 L 650 710 L 670 730" stroke-width="8" />
      <!-- Frayed stretched string connecting them -->
      <path d="M 360 470 Q 420 490 440 470" stroke-width="5" />
      <path d="M 450 465 Q 460 480 470 475" stroke-width="3" stroke-dasharray="4,4" />
      <path d="M 480 475 Q 520 470 570 480" stroke-width="5" />
    `),

    // Shot 25: Shrugging beside broken pot ("I knew I would mess it up")
    "25": wrapSvg(`
      <!-- Stickman shrugging with palms up -->
      <circle cx="450" cy="300" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="435" cy="295" r="4" fill="#111111" />
      <circle cx="465" cy="295" r="4" fill="#111111" />
      <path d="M 425 280 Q 435 272 445 280" stroke-width="5" />
      <path d="M 455 280 Q 465 272 475 280" stroke-width="5" />
      <path d="M 435 335 L 465 335" stroke-width="5" /> <!-- Flat resigned mouth -->
      <line x1="450" y1="360" x2="450" y2="520" stroke-width="8" />
      <!-- Shrugging arms -->
      <path d="M 450 400 L 360 380 L 330 340" stroke-width="7" />
      <path d="M 450 400 L 540 380 L 570 340" stroke-width="7" />
      <!-- Open palms -->
      <path d="M 320 340 L 340 330" stroke-width="7" />
      <path d="M 560 330 L 580 340" stroke-width="7" />
      <!-- Broken pot pieces on floor -->
      <path d="M 400 680 Q 420 620 440 680 Z" stroke-width="6" fill="#FFFFFF" />
      <path d="M 460 670 Q 480 630 500 670 Z" stroke-width="6" fill="#FFFFFF" />
      <path d="M 430 710 L 470 700" stroke-width="5" />
      <!-- Legs -->
      <path d="M 450 520 L 410 660 L 390 690" stroke-width="8" />
      <path d="M 450 520 L 490 660 L 510 690" stroke-width="8" />
    `),

    // Shot 26: Reaching up for star of success
    "26": wrapSvg(`
      <!-- Glowing star on high -->
      <polygon points="580,180 595,220 640,225 605,255 615,300 580,275 545,300 555,255 520,225 565,220" stroke-width="7" fill="#FFFFFF" />
      <line x1="580" y1="140" x2="580" y2="160" stroke-width="5" />
      <line x1="645" y1="200" x2="665" y2="190" stroke-width="5" />
      <line x1="515" y1="200" x2="495" y2="190" stroke-width="5" />
      <!-- Stickman reaching up on tiptoes with hope -->
      <circle cx="380" cy="380" r="55" fill="#FFFFFF" stroke-width="8" />
      <circle cx="395" cy="370" r="4" fill="#111111" />
      <path d="M 385 355 Q 395 348 405 355" stroke-width="5" />
      <path d="M 385 405 Q 400 415 410 405" stroke-width="5" />
      <line x1="380" y1="435" x2="380" y2="580" stroke-width="8" />
      <!-- Arms stretching up towards star -->
      <path d="M 380 470 L 470 320 L 520 250" stroke-width="8" />
      <path d="M 380 470 L 430 380" stroke-width="7" />
      <!-- Legs standing tall on toes -->
      <path d="M 380 580 L 350 720 L 340 750" stroke-width="8" />
      <path d="M 380 580 L 410 720 L 420 750" stroke-width="8" />
    `),

    // Shot 27: Sliding backwards down the spiral of self-sabotage
    "27": wrapSvg(`
      <!-- Spiral downwards line -->
      <path d="M 580 260 Q 640 340 520 400 Q 380 460 480 540 Q 560 600 420 680" stroke-width="7" stroke-dasharray="10,10" />
      <!-- Stickman sliding down with dizzy spirals overhead -->
      <circle cx="440" cy="460" r="55" fill="#FFFFFF" stroke-width="8" />
      <!-- Dizzy spiral eyes -->
      <path d="M 425 455 Q 430 450 435 455 Q 430 460 425 455" stroke-width="4" />
      <path d="M 450 455 Q 455 450 460 455 Q 455 460 450 455" stroke-width="4" />
      <path d="M 430 485 Q 445 475 460 485" stroke-width="5" />
      <line x1="440" y1="515" x2="390" y2="600" stroke-width="8" />
      <!-- Flailing arms -->
      <path d="M 420 540 L 360 490 L 340 440" stroke-width="7" />
      <path d="M 420 540 L 470 560 L 510 520" stroke-width="7" />
      <!-- Sliding legs -->
      <path d="M 390 600 L 330 650 L 310 670" stroke-width="8" />
      <path d="M 390 600 L 430 670 L 460 690" stroke-width="8" />
    `),

    // Shot 28: Sad stool stickman looking at bandaged heart
    "28": wrapSvg(`
      <!-- Small stool -->
      <line x1="380" y1="560" x2="480" y2="560" stroke-width="8" />
      <line x1="400" y1="560" x2="380" y2="700" stroke-width="7" />
      <line x1="460" y1="560" x2="480" y2="700" stroke-width="7" />
      <!-- Sad stickman sitting on stool -->
      <circle cx="430" cy="340" r="55" fill="#FFFFFF" stroke-width="8" />
      <circle cx="445" cy="340" r="4" fill="#111111" />
      <path d="M 435 325 Q 445 320 455 330" stroke-width="5" />
      <path d="M 435 365 Q 445 358 455 365" stroke-width="5" />
      <line x1="430" y1="395" x2="430" y2="560" stroke-width="8" />
      <!-- Hands gently cradling a bandaged heart -->
      <path d="M 430 440 L 500 470" stroke-width="7" />
      <path d="M 430 440 L 470 500" stroke-width="7" />
      <!-- Bandaged heart -->
      <path d="M 520 450 C 505 420 470 435 485 465 C 500 490 520 510 520 510 C 520 510 540 490 555 465 C 570 435 535 420 520 450 Z" stroke-width="6" fill="#FFFFFF" />
      <line x1="495" y1="460" x2="545" y2="480" stroke-width="5" stroke="#666666" />
      <line x1="500" y1="480" x2="540" y2="460" stroke-width="5" stroke="#666666" />
      <!-- Sitting bent legs -->
      <path d="M 430 560 L 480 610 L 480 680" stroke-width="8" />
    `),

    // Shot 30: Step 1 - Somatic Tolerance - Pause 30 seconds
    "30": wrapSvg(`
      <!-- Stickman holding up open palm in pause -->
      <circle cx="360" cy="340" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="380" cy="335" r="4" fill="#111111" />
      <circle cx="350" cy="335" r="4" fill="#111111" />
      <path d="M 340 320 Q 350 312 360 320" stroke-width="5" />
      <path d="M 370 320 Q 380 312 390 320" stroke-width="5" />
      <path d="M 355 365 Q 365 375 375 365" stroke-width="5" />
      <line x1="360" y1="400" x2="360" y2="560" stroke-width="8" />
      <!-- Left arm holding up hand palm forward -->
      <path d="M 360 440 L 460 410 L 470 340" stroke-width="8" />
      <!-- Open palm hand -->
      <line x1="470" y1="340" x2="470" y2="300" stroke-width="8" />
      <line x1="460" y1="340" x2="455" y2="310" stroke-width="6" />
      <line x1="480" y1="340" x2="485" y2="310" stroke-width="6" />
      <!-- Clock showing 30s pause -->
      <circle cx="620" cy="380" r="90" stroke-width="8" fill="#FFFFFF" />
      <circle cx="620" cy="380" r="8" fill="#111111" />
      <line x1="620" y1="380" x2="620" y2="315" stroke-width="6" />
      <line x1="620" y1="380" x2="620" y2="445" stroke-width="6" />
      <text x="590" y="520" font-family="sans-serif" font-size="28" font-weight="bold" fill="#111111">30s</text>
      <!-- Legs -->
      <path d="M 360 560 L 330 720 L 310 740" stroke-width="8" />
      <path d="M 360 560 L 400 720 L 420 740" stroke-width="8" />
    `),

    // Shot 31: Somatic deep breath, hand on chest, calm radiating rings
    "31": wrapSvg(`
      <!-- Head with serene closed eyes -->
      <circle cx="450" cy="270" r="65" fill="#FFFFFF" stroke-width="8" />
      <!-- Gentle curved slit eyes (sleeping/peaceful) -->
      <path d="M 425 265 Q 435 272 445 265" stroke-width="5" />
      <path d="M 455 265 Q 465 272 475 265" stroke-width="5" />
      <path d="M 440 295 Q 450 305 460 295" stroke-width="5" />
      <line x1="450" y1="335" x2="450" y2="540" stroke-width="8" />
      <!-- Hand on heart -->
      <path d="M 450 390 L 400 430 L 440 440" stroke-width="8" />
      <path d="M 450 390 L 510 440 L 520 490" stroke-width="7" />
      <!-- Legs grounded -->
      <path d="M 450 540 L 410 680 L 390 740" stroke-width="8" />
      <path d="M 450 540 L 490 680 L 510 740" stroke-width="8" />
      <!-- Soft rings of calm radiating from chest -->
      <circle cx="440" cy="435" r="45" stroke="#666666" stroke-width="4" stroke-dasharray="6,8" />
      <circle cx="440" cy="435" r="80" stroke="#999999" stroke-width="3" stroke-dasharray="8,10" />
      <circle cx="440" cy="435" r="120" stroke="#BBBBBB" stroke-width="2" stroke-dasharray="10,12" />
    `),

    // Shot 32: Safe bubble: "Mình đang an toàn và xứng đáng được hạnh phúc"
    "32": wrapSvg(`
      <!-- Outer protective glowing bubble -->
      <circle cx="450" cy="450" r="280" stroke="#444444" stroke-width="7" stroke-dasharray="12,12" />
      <circle cx="450" cy="450" r="295" stroke="#999999" stroke-width="3" />
      <!-- Stickman inside smiling joyfully with arms wide -->
      <circle cx="450" cy="330" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="435" cy="325" r="4" fill="#111111" />
      <circle cx="465" cy="325" r="4" fill="#111111" />
      <path d="M 425 310 Q 435 302 445 310" stroke-width="5" />
      <path d="M 455 310 Q 465 302 475 310" stroke-width="5" />
      <path d="M 430 355 Q 450 375 470 355" stroke-width="6" /> <!-- Big warm smile -->
      <line x1="450" y1="390" x2="450" y2="550" stroke-width="8" />
      <!-- Arms wide in peaceful openness -->
      <path d="M 450 430 L 360 410 L 310 440" stroke-width="7" />
      <path d="M 450 430 L 540 410 L 590 440" stroke-width="7" />
      <!-- Legs grounded in peace -->
      <path d="M 450 550 L 410 680 L 390 710" stroke-width="8" />
      <path d="M 450 550 L 490 680 L 510 710" stroke-width="8" />
    `),

    // Shot 33: Catch the saboteur with butterfly net
    "33": wrapSvg(`
      <!-- Stickman holding long net -->
      <circle cx="340" cy="350" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="360" cy="345" r="4" fill="#111111" />
      <path d="M 350 330 Q 360 322 370 330" stroke-width="5" />
      <path d="M 350 380 Q 360 390 370 380" stroke-width="5" />
      <line x1="340" y1="410" x2="340" y2="570" stroke-width="8" />
      <!-- Arms holding pole -->
      <path d="M 340 450 L 440 420 L 510 360" stroke-width="8" />
      <line x1="410" y1="450" x2="620" y2="280" stroke-width="9" />
      <!-- Net loop -->
      <ellipse cx="650" cy="260" rx="60" ry="80" stroke-width="7" />
      <path d="M 650 260 Q 730 280 720 360 Q 640 330 650 260" stroke-width="5" stroke-dasharray="6,6" />
      <!-- Tiny mischievous shadow imp inside net -->
      <circle cx="680" cy="310" r="22" fill="#111111" />
      <circle cx="675" cy="305" r="3" fill="#FFFFFF" />
      <circle cx="685" cy="305" r="3" fill="#FFFFFF" />
      <!-- Legs -->
      <path d="M 340 570 L 300 720 L 280 740" stroke-width="8" />
      <path d="M 340 570 L 380 720 L 400 740" stroke-width="8" />
    `),

    // Shot 34: The sharp question - question mark wand challenging shadow reflex
    "34": wrapSvg(`
      <!-- Stickman standing tall with confident posture -->
      <circle cx="360" cy="330" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="380" cy="325" r="4" fill="#111111" />
      <path d="M 370 310 Q 380 305 390 312" stroke-width="5" />
      <path d="M 370 360 L 390 355" stroke-width="5" />
      <line x1="360" y1="390" x2="360" y2="550" stroke-width="8" />
      <!-- Arm pointing big question mark staff -->
      <path d="M 360 430 L 470 410" stroke-width="8" />
      <!-- Giant hand-drawn question mark -->
      <path d="M 520 280 C 520 210 620 210 620 280 C 620 340 560 360 560 410" stroke-width="12" />
      <circle cx="560" cy="460" r="10" fill="#111111" />
      <!-- Legs -->
      <path d="M 360 550 L 330 710 L 310 730" stroke-width="8" />
      <path d="M 360 550 L 400 710 L 420 730" stroke-width="8" />
    `),

    // Shot 35: Vulnerability - opening chest door showing warm heart
    "35": wrapSvg(`
      <!-- Stickman opening chest door -->
      <circle cx="450" cy="280" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="435" cy="275" r="4" fill="#111111" />
      <circle cx="465" cy="275" r="4" fill="#111111" />
      <path d="M 425 260 Q 435 252 445 260" stroke-width="5" />
      <path d="M 455 260 Q 465 252 475 260" stroke-width="5" />
      <path d="M 435 305 Q 450 315 465 305" stroke-width="5" />
      <line x1="450" y1="340" x2="450" y2="530" stroke-width="8" />
      <!-- Chest door opened outwards -->
      <rect x="420" y="370" width="60" height="70" rx="5" stroke-width="6" fill="#FFFFFF" />
      <path d="M 480 370 L 530 360 L 530 430 L 480 440" stroke-width="6" fill="#FFFFFF" />
      <!-- Glowing heart inside -->
      <path d="M 450 390 C 440 375 420 380 425 400 C 435 415 450 430 450 430 C 450 430 465 415 475 400 C 480 380 460 375 450 390 Z" fill="#111111" />
      <!-- Hands holding door open gently -->
      <path d="M 450 390 L 390 410 L 415 390" stroke-width="7" />
      <path d="M 450 390 L 500 410 L 525 390" stroke-width="7" />
      <!-- Legs -->
      <path d="M 450 530 L 410 680 L 390 720" stroke-width="8" />
      <path d="M 450 530 L 490 680 L 510 720" stroke-width="8" />
    `),

    // Shot 36: Sincere tea talk between two friends
    "36": wrapSvg(`
      <!-- Small tea table -->
      <line x1="380" y1="500" x2="520" y2="500" stroke-width="8" />
      <line x1="450" y1="500" x2="450" y2="680" stroke-width="8" />
      <line x1="400" y1="680" x2="500" y2="680" stroke-width="8" />
      <!-- Two small cups -->
      <rect x="410" y="470" width="25" height="30" rx="3" stroke-width="5" />
      <rect x="465" y="470" width="25" height="30" rx="3" stroke-width="5" />
      <!-- Left stickman sitting & speaking honestly -->
      <circle cx="280" cy="380" r="50" fill="#FFFFFF" stroke-width="8" />
      <circle cx="295" cy="375" r="4" fill="#111111" />
      <path d="M 285 360 Q 295 352 305 362" stroke-width="5" />
      <path d="M 285 405 Q 295 400 305 405" stroke-width="5" />
      <line x1="280" y1="430" x2="280" y2="560" stroke-width="8" />
      <path d="M 280 470 L 350 490" stroke-width="7" />
      <path d="M 280 560 L 330 600 L 330 670" stroke-width="8" />
      <!-- Right stickman listening empathetically -->
      <circle cx="620" cy="380" r="50" fill="#FFFFFF" stroke-width="8" />
      <circle cx="605" cy="375" r="4" fill="#111111" />
      <path d="M 595 360 Q 605 352 615 362" stroke-width="5" />
      <path d="M 595 405 Q 605 412 615 405" stroke-width="5" />
      <line x1="620" y1="430" x2="620" y2="560" stroke-width="8" />
      <path d="M 620 470 L 550 490" stroke-width="7" />
      <path d="M 620 560 L 570 600 L 570 670" stroke-width="8" />
      <!-- Clean speech bubble -->
      <path d="M 330 290 Q 330 240 400 240 Q 470 240 470 290 Q 470 340 420 340 L 380 370 L 390 340 Q 330 340 330 290 Z" stroke-width="6" fill="#FFFFFF" />
      <line x1="360" y1="280" x2="440" y2="280" stroke-width="5" />
      <line x1="380" y1="305" x2="420" y2="305" stroke-width="5" />
    `),

    // Shot 37: Shadow phantom dissolving into dust in morning light
    "37": wrapSvg(`
      <!-- Stickman bathed in sunlight rays -->
      <circle cx="340" cy="360" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="355" cy="355" r="4" fill="#111111" />
      <path d="M 345 340 Q 355 332 365 340" stroke-width="5" />
      <path d="M 345 385 Q 360 395 370 385" stroke-width="5" />
      <line x1="340" y1="420" x2="340" y2="580" stroke-width="8" />
      <path d="M 340 460 L 400 500" stroke-width="7" />
      <path d="M 340 580 L 310 720 L 290 740" stroke-width="8" />
      <path d="M 340 580 L 370 720 L 390 740" stroke-width="8" />
      <!-- Sun rays coming from top left -->
      <line x1="160" y1="160" x2="240" y2="240" stroke-width="6" />
      <line x1="220" y1="140" x2="280" y2="200" stroke-width="6" />
      <line x1="140" y1="220" x2="200" y2="280" stroke-width="6" />
      <!-- Dissolving shadow phantom on the right -->
      <circle cx="580" cy="390" r="45" stroke-width="5" stroke-dasharray="6,8" />
      <line x1="580" y1="435" x2="580" y2="540" stroke-width="5" stroke-dasharray="6,8" />
      <!-- Tiny dust specks floating away -->
      <circle cx="660" cy="340" r="3" fill="#111111" />
      <circle cx="680" cy="380" r="4" fill="#111111" />
      <circle cx="650" cy="420" r="3" fill="#111111" />
      <circle cx="690" cy="450" r="2" fill="#111111" />
      <circle cx="640" cy="490" r="4" fill="#111111" />
    `),

    // Shot 38: Closed umbrella walking into clearing storm and bright rainbow
    "38": wrapSvg(`
      <!-- Subtle rainbow arch -->
      <path d="M 200 450 Q 450 180 700 450" stroke-width="6" stroke="#888888" fill="none" />
      <path d="M 220 450 Q 450 210 680 450" stroke-width="4" stroke="#AAAAAA" fill="none" />
      <!-- Stickman walking right holding closed umbrella like a cane -->
      <circle cx="420" cy="340" r="55" fill="#FFFFFF" stroke-width="8" />
      <circle cx="440" cy="335" r="4" fill="#111111" />
      <path d="M 430 320 Q 440 312 450 320" stroke-width="5" />
      <path d="M 430 365 Q 445 375 455 365" stroke-width="5" />
      <line x1="420" y1="395" x2="420" y2="550" stroke-width="8" />
      <!-- Right hand holding closed umbrella pointing down -->
      <path d="M 420 440 L 490 470 L 510 520" stroke-width="7" />
      <line x1="510" y1="520" x2="550" y2="680" stroke-width="7" /> <!-- umbrella tip -->
      <path d="M 505 510 Q 520 490 535 510" stroke-width="6" /> <!-- hook handle -->
      <!-- Confident stride legs -->
      <path d="M 420 550 L 370 680 L 350 710" stroke-width="8" />
      <path d="M 420 550 L 470 680 L 500 710" stroke-width="8" />
    `),

    // Shot 39: Leaping over boundary line into freedom
    "39": wrapSvg(`
      <!-- Chalk line boundary on floor -->
      <line x1="180" y1="620" x2="720" y2="620" stroke-width="6" stroke-dasharray="14,14" />
      <text x="240" y="660" font-family="sans-serif" font-size="24" font-weight="bold" fill="#888888">OLD LIMIT</text>
      <text x="560" y="660" font-family="sans-serif" font-size="24" font-weight="bold" fill="#111111">FREEDOM</text>
      <!-- Stickman mid-air joy leap -->
      <circle cx="480" cy="280" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="495" cy="275" r="4" fill="#111111" />
      <circle cx="465" cy="275" r="4" fill="#111111" />
      <path d="M 455 260 Q 465 252 475 260" stroke-width="5" />
      <path d="M 485 260 Q 495 252 505 260" stroke-width="5" />
      <path d="M 465 305 Q 480 325 500 305" stroke-width="6" />
      <line x1="480" y1="340" x2="480" y2="480" stroke-width="8" />
      <!-- Arms raised high in victory 'V' -->
      <path d="M 480 380 L 400 300 L 360 220" stroke-width="8" />
      <path d="M 480 380 L 560 300 L 600 220" stroke-width="8" />
      <!-- Legs bent mid-air leap -->
      <path d="M 480 480 L 420 540 L 440 600" stroke-width="8" />
      <path d="M 480 480 L 540 520 L 580 560" stroke-width="8" />
    `),

    // Shot 40: Clean YouTube Subscribe button & bell
    "40": wrapSvg(`
      <!-- Cheerful stickman pointing right -->
      <circle cx="310" cy="360" r="55" fill="#FFFFFF" stroke-width="8" />
      <circle cx="325" cy="355" r="4" fill="#111111" />
      <path d="M 315 340 Q 325 332 335 340" stroke-width="5" />
      <path d="M 315 385 Q 330 395 340 385" stroke-width="5" />
      <line x1="310" y1="415" x2="310" y2="570" stroke-width="8" />
      <path d="M 310 450 L 410 420" stroke-width="8" /> <!-- Pointing arm -->
      <path d="M 310 570 L 280 710 L 260 730" stroke-width="8" />
      <path d="M 310 570 L 340 710 L 360 730" stroke-width="8" />
      <!-- YouTube Subscribe Box -->
      <rect x="440" y="340" width="260" height="90" rx="45" stroke-width="8" fill="#FFFFFF" />
      <!-- Play triangle inside -->
      <polygon points="480,365 480,405 515,385" fill="#111111" />
      <text x="530" y="398" font-family="sans-serif" font-size="28" font-weight="bold" fill="#111111">SUBSCRIBE</text>
      <!-- Notification bell -->
      <path d="M 570 480 Q 570 450 550 450 Q 530 450 530 480 L 515 510 L 585 510 Z" stroke-width="6" fill="#FFFFFF" />
      <circle cx="550" cy="522" r="6" fill="#111111" />
      <path d="M 510 470 Q 495 485 510 500" stroke-width="4" />
      <path d="M 590 470 Q 605 485 590 500" stroke-width="4" />
    `),

    // Shot 41: Comment farewell bubble & waving goodbye warmly
    "41": wrapSvg(`
      <!-- Stickman waving with right hand -->
      <circle cx="360" cy="350" r="60" fill="#FFFFFF" stroke-width="8" />
      <circle cx="375" cy="345" r="4" fill="#111111" />
      <circle cx="345" cy="345" r="4" fill="#111111" />
      <path d="M 340 330 Q 350 322 360 330" stroke-width="5" />
      <path d="M 370 330 Q 380 322 390 330" stroke-width="5" />
      <path d="M 350 375 Q 365 390 380 375" stroke-width="6" /> <!-- Happy smile -->
      <line x1="360" y1="410" x2="360" y2="570" stroke-width="8" />
      <!-- Waving right arm -->
      <path d="M 360 450 L 440 380 L 460 290" stroke-width="8" />
      <!-- Waving hand lines -->
      <line x1="460" y1="290" x2="480" y2="270" stroke-width="6" />
      <line x1="460" y1="290" x2="490" y2="290" stroke-width="6" />
      <path d="M 480 250 Q 500 280 480 310" stroke-width="4" stroke-dasharray="4,6" />
      <!-- Left arm holding comment bubble -->
      <path d="M 360 450 L 290 480 L 260 520" stroke-width="7" />
      <!-- Comment chat bubble with pencil -->
      <rect x="520" y="440" width="180" height="120" rx="20" stroke-width="7" fill="#FFFFFF" />
      <polygon points="560,560 540,590 590,560" stroke-width="6" fill="#FFFFFF" />
      <line x1="550" y1="480" x2="650" y2="480" stroke-width="5" />
      <line x1="550" y1="510" x2="620" y2="510" stroke-width="5" />
      <!-- Legs -->
      <path d="M 360 570 L 320 720 L 300 740" stroke-width="8" />
      <path d="M 360 570 L 400 720 L 420 740" stroke-width="8" />
    `)
  };

  for (const [shotNum, svg] of Object.entries(bespokeSvgs)) {
    const dest = path.join(TARGET_DIR, `shot_${shotNum}.png`);
    await renderSvgToPng(svg, dest);
    console.log(`[SVG] Rendered bespoke Shot ${shotNum} to ${dest}`);
  }

  console.log("\nAll 41 shots assembled. Running uniqueness validation...");
  const validation = validateUniqueness(TARGET_DIR, 41);
  console.log(`Validation result: ${validation.uniqueCount}/${validation.total} unique scenes (${validation.status})!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
