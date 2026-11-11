import fs from 'node:fs';

const project = JSON.parse(fs.readFileSync('D:/Antigravity/Tickman/projects/spotlight-effect/project.json', 'utf8'));

// Print captions around scene 8 to 20
project.shots.forEach((shot, i) => {
  if (i < 7) return; // scenes 1-7 are already short
  const duration = shot.end - shot.start;
  const caps = project.captions.filter(c => c.start >= shot.start - 0.05 && c.end <= shot.end + 0.05);
  console.log(`\n========================================`);
  console.log(`Shot ${i + 1} (${shot.start.toFixed(2)}s - ${shot.end.toFixed(2)}s, total: ${duration.toFixed(2)}s):`);
  caps.forEach((c, ci) => {
    console.log(`  [${c.start.toFixed(2)} - ${c.end.toFixed(2)}] (${(c.end - c.start).toFixed(2)}s): ${c.text}`);
  });
});
