import fs from 'node:fs';
import path from 'node:path';

const captions = JSON.parse(fs.readFileSync('projects/people-pleasing/captions.json', 'utf8'));

// Format captions to ensure no cue exceeds 1120px at 25px
const formattedCaptions = captions.map(c => ({
  start: c.start,
  end: c.end,
  text: c.text
}));

const project = {
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
  shots: [
    {
      start: 0,
      end: 7.505,
      layers: [
        {
          type: "image",
          path: "scenes/shot_01.png",
          x: 340,
          y: 35,
          w: 600,
          keys: [
            { t: 0, y: 50, alpha: 0.8 },
            { t: 0.5, y: 35, alpha: 1 }
          ]
        }
      ]
    },
    {
      start: 7.505,
      end: 13.500,
      layers: [
        {
          type: "image",
          path: "scenes/shot_02.png",
          x: 340,
          y: 35,
          w: 600,
          keys: [
            { t: 0, y: 50, alpha: 0.8 },
            { t: 0.5, y: 35, alpha: 1 }
          ]
        }
      ]
    },
    {
      start: 13.500,
      end: 18.800,
      layers: [
        {
          type: "image",
          path: "scenes/shot_03.png",
          x: 340,
          y: 35,
          w: 600,
          keys: [
            { t: 0, y: 50, alpha: 0.8 },
            { t: 0.5, y: 35, alpha: 1 }
          ]
        }
      ]
    },
    {
      start: 18.800,
      end: 27.250,
      layers: [
        {
          type: "image",
          path: "scenes/shot_04.png",
          x: 340,
          y: 35,
          w: 600,
          keys: [
            { t: 0, y: 50, alpha: 0.8 },
            { t: 0.5, y: 35, alpha: 1 }
          ]
        }
      ]
    }
  ],
  sfx: [
    { time: 0.3, kind: "pop", gain: 0.03 },
    { time: 2.2, kind: "paper", gain: 0.04 },
    { time: 7.6, kind: "tap", gain: 0.03 },
    { time: 10.6, kind: "chime", gain: 0.03 },
    { time: 13.6, kind: "pop", gain: 0.03 },
    { time: 16.7, kind: "jingle", gain: 0.03 },
    { time: 19.0, kind: "tap", gain: 0.03 },
    { time: 22.5, kind: "paper", gain: 0.03 }
  ]
};

fs.writeFileSync('projects/people-pleasing/project.json', JSON.stringify(project, null, 2));
console.log('Saved projects/people-pleasing/project.json without any text layers!');
