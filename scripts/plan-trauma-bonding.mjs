import fs from 'node:fs';
import path from 'node:path';

const srtPath = 'projects/trauma-bonding/subtitles/captions.srt';

function parseSrt(text) {
  const blocks = text.trim().split(/\r?\n\r?\n/);
  const items = [];
  for (const b of blocks) {
    const lines = b.trim().split(/\r?\n/);
    if (lines.length >= 2) {
      const id = lines[0];
      const match = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      if (match) {
        const start = (+match[1])*3600 + (+match[2])*60 + (+match[3]) + (+match[4])/1000;
        const end = (+match[5])*3600 + (+match[6])*60 + (+match[7]) + (+match[8])/1000;
        const body = lines.slice(2).join(' ').replace(/<[^>]+>/g, '').replace(/[\*\_]+/g, '').trim();
        items.push({ id, start, end, duration: end - start, text: body });
      }
    }
  }
  return items;
}

const cues = parseSrt(fs.readFileSync(srtPath, 'utf8'));

// Segment cues into shots targeting 9-11 seconds each, splitting at sentence ends or natural pauses
const shots = [];
let curCues = [];
let shotStart = 0;

for (let i = 0; i < cues.length; i++) {
  curCues.push(cues[i]);
  const curDuration = cues[i].end - shotStart;
  const isLast = i === cues.length - 1;
  const text = cues[i].text;
  const isSentenceEnd = /[.!?":]$/.test(text.trim()) || (i < cues.length - 1 && cues[i+1].start - cues[i].end > 0.35);

  if (isLast || (curDuration >= 8.5 && isSentenceEnd) || curDuration >= 12.5) {
    shots.push({
      shot_index: shots.length + 1,
      start: +shotStart.toFixed(3),
      end: +cues[i].end.toFixed(3),
      duration: +(cues[i].end - shotStart).toFixed(2),
      cues: curCues.map(c => ({ start: +c.start.toFixed(3), end: +c.end.toFixed(3), text: c.text })),
      summary: curCues.map(c => c.text).join(' ')
    });
    if (!isLast) {
      shotStart = cues[i].end;
      curCues = [];
    }
  }
}

console.log(`Total shots: ${shots.length}`);
console.log(`Min duration: ${Math.min(...shots.map(s => s.duration))}s`);
console.log(`Max duration: ${Math.max(...shots.map(s => s.duration))}s`);
console.log(`Avg duration: ${(shots.reduce((a,b)=>a+b.duration,0)/shots.length).toFixed(1)}s`);

fs.writeFileSync('projects/trauma-bonding/shots_plan.json', JSON.stringify({ total_duration: cues[cues.length - 1].end, total_shots: shots.length, shots }, null, 2));

console.log('--- SHOTS SUMMARY ---');
shots.forEach(s => {
  console.log(`[Shot ${String(s.shot_index).padStart(2, '0')}] (${s.start}s - ${s.end}s, ${s.duration}s): ${s.summary.slice(0, 85)}...`);
});
