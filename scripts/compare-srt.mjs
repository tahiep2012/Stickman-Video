import fs from 'node:fs';

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

const oldCues = parseSrt(fs.readFileSync('projects/trauma-bonding/subtitles/captions.srt', 'utf8'));
const newCues = parseSrt(fs.readFileSync('C:/Users/Elt.pur02/.gemini/antigravity/brain/c5690218-6497-42c2-a2e1-386a25a75f28/.user_uploaded/media_1794458425877_8542cde2.srt', 'utf8'));

console.log('Old length:', oldCues.length, 'New length:', newCues.length);
let textDiffs = 0;
for (let i = 0; i < Math.min(oldCues.length, newCues.length); i++) {
  if (oldCues[i].text !== newCues[i].text) {
    console.log(`Diff at cue ${i+1}:`);
    console.log('  OLD:', oldCues[i].text);
    console.log('  NEW:', newCues[i].text);
    textDiffs++;
  }
}
console.log('Total text diffs:', textDiffs);
