import fs from 'node:fs';

const proj = JSON.parse(fs.readFileSync('projects/self-sabotage/project.json', 'utf8'));

// Audio duration is 441.140998
const maxDuration = 441.140;

// Ensure every caption is within [0, maxDuration], sorted, and non-overlapping
let lastEnd = 0;
for (let i = 0; i < proj.captions.length; i++) {
  const c = proj.captions[i];
  if (c.start < lastEnd) {
    c.start = lastEnd;
  }
  if (c.end <= c.start) {
    c.end = c.start + 0.1;
  }
  if (c.end > maxDuration) {
    c.end = maxDuration;
  }
  if (c.start >= maxDuration) {
    c.start = maxDuration - 0.1;
    c.end = maxDuration;
  }
  lastEnd = c.end;
}

// Ensure shots are continuous and clamp the last shot to maxDuration
for (let i = 0; i < proj.shots.length; i++) {
  const s = proj.shots[i];
  if (i === 0) s.start = 0;
  else s.start = proj.shots[i - 1].end;

  if (i === proj.shots.length - 1) {
    s.end = maxDuration;
  } else if (s.end > maxDuration) {
    s.end = maxDuration;
  }
}

fs.writeFileSync('projects/self-sabotage/project.json', JSON.stringify(proj, null, 2), 'utf8');
console.log(`Clamped all captions and shots to maxDuration: ${maxDuration}s.`);
console.log('Last caption:', proj.captions[proj.captions.length - 1]);
console.log('Last shot:', proj.shots[proj.shots.length - 1]);
