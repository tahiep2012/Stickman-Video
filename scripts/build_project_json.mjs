import fs from 'node:fs';

const subs = JSON.parse(fs.readFileSync('scripts/parsed_subtitles.json', 'utf8'));
const scenes = JSON.parse(fs.readFileSync('scripts/scene_partition_41.json', 'utf8'));

// Ensure continuous timestamps for shots from 0 to subs[last].end
const totalDuration = subs[subs.length - 1].end;

const shots = scenes.map((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  const start = (idx === 0) ? 0 : scenes[idx - 1].end;
  const end = (idx === scenes.length - 1) ? totalDuration : s.end;

  return {
    start: Number(start.toFixed(3)),
    end: Number(end.toFixed(3)),
    layers: [
      {
        type: 'image',
        path: `scenes/shot_${pad}.png`,
        x: 320,
        y: 35,
        w: 640,
        keys: [
          { t: 0, y: 50, alpha: 0.85 },
          { t: 0.5, y: 35, alpha: 1.0 }
        ]
      }
    ]
  };
});

const project = {
  version: 1,
  style: "B1",
  width: 1280,
  height: 720,
  fps: 30,
  font: "NotoSans.ttf",
  voice: {
    path: "silent_track.m4a",
    lead: 0,
    tail: 0,
    contains_sfx: false
  },
  captions: subs.map(c => ({
    start: c.start,
    end: c.end,
    text: c.text
  })),
  shots: shots
};

fs.writeFileSync('projects/self-sabotage/project.json', JSON.stringify(project, null, 2), 'utf8');
console.log(`Successfully generated projects/self-sabotage/project.json with ${project.captions.length} captions and ${project.shots.length} shots.`);
