import fs from 'node:fs';
import path from 'node:path';

const captions = JSON.parse(fs.readFileSync('projects/people-pleasing/captions.json', 'utf8'));
const prompts = JSON.parse(fs.readFileSync('projects/people-pleasing/scene_prompts_ai.json', 'utf8'));

// Format captions (clean text, no newlines)
const formattedCaptions = captions.map(c => ({
  start: c.start,
  end: c.end,
  text: c.text
}));

// Build all 27 shots with subtle zoom/slide keys, NO text layers
const shots = prompts.map(p => {
  const pad = String(p.shot).padStart(2, '0');
  const duration = p.end - p.start;
  return {
    start: p.start,
    end: p.end,
    layers: [
      {
        type: "image",
        path: `scenes/shot_${pad}.png`,
        x: 340,
        y: 35,
        w: 600,
        keys: [
          { t: 0, y: 48, alpha: 0.88 },
          { t: Math.min(0.6, duration * 0.1), y: 35, alpha: 1 }
        ]
      }
    ]
  };
});

// Sound design: Add meaningful Foley SFX at key dramatic beats
const sfx = [
  // Opening: overwhelmed, people pleaser
  { time: 0.3, kind: "pop", gain: 0.03 },
  { time: 2.2, kind: "paper", gain: 0.04 },
  { time: 7.6, kind: "tap", gain: 0.03 },
  { time: 10.6, kind: "chime", gain: 0.03 },
  { time: 13.6, kind: "pop", gain: 0.03 },
  { time: 16.7, kind: "jingle", gain: 0.03 },
  { time: 19.0, kind: "tap", gain: 0.03 },
  { time: 22.5, kind: "paper", gain: 0.03 },

  // Dramatic shifts & psychological reveal
  { time: 27.5, kind: "tap", gain: 0.03 },
  { time: 34.2, kind: "pop", gain: 0.04 },
  { time: 45.6, kind: "chime", gain: 0.035 },
  { time: 51.0, kind: "tap", gain: 0.03 },
  { time: 60.0, kind: "pop", gain: 0.03 },
  { time: 71.8, kind: "paper", gain: 0.03 },
  { time: 79.2, kind: "tap", gain: 0.03 },
  { time: 98.3, kind: "pop", gain: 0.03 },
  { time: 121.2, kind: "paper", gain: 0.035 },
  { time: 146.2, kind: "tap", gain: 0.03 },
  { time: 159.2, kind: "chime", gain: 0.03 },
  { time: 178.2, kind: "tap", gain: 0.03 },
  { time: 204.2, kind: "pop", gain: 0.03 },
  { time: 219.2, kind: "tap", gain: 0.03 },
  { time: 239.2, kind: "pop", gain: 0.04 },
  { time: 258.2, kind: "jingle", gain: 0.03 },
  { time: 279.2, kind: "tap", gain: 0.03 },
  { time: 305.2, kind: "paper", gain: 0.03 },
  { time: 325.2, kind: "tap", gain: 0.03 },
  { time: 345.2, kind: "chime", gain: 0.035 },
  { time: 368.2, kind: "pop", gain: 0.03 },
  { time: 397.2, kind: "tap", gain: 0.03 },
  { time: 423.2, kind: "chime", gain: 0.04 },
  { time: 435.0, kind: "jingle", gain: 0.03 }
];

const fullProject = {
  version: 1,
  style: "B1",
  width: 1920,
  height: 1080,
  fps: 30,
  hideTextLayers: true,
  captionSize: 25,
  captionFont: "NotoSans.ttf",
  font: "NotoSans.ttf",
  voice: {
    path: "narration.wav",
    lead: 0,
    tail: 0,
    contains_sfx: false
  },
  captions: formattedCaptions,
  shots,
  sfx
};

fs.writeFileSync('projects/people-pleasing/project.json', JSON.stringify(fullProject, null, 2));
console.log(`Saved full project.json with ${shots.length} shots and ${formattedCaptions.length} captions!`);
