import fs from 'node:fs';

const subs = JSON.parse(fs.readFileSync('scripts/parsed_subtitles.json', 'utf8'));
console.log(`Loaded ${subs.length} captions. Total duration: ${subs[subs.length - 1].end}s\n`);

let fullText = '';
subs.forEach((s, i) => {
  console.log(`[${i+1}] [${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`);
  fullText += s.text + ' ';
});

fs.writeFileSync('scripts/full_transcript.txt', fullText, 'utf8');
