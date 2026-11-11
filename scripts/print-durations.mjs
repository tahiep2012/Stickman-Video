import fs from 'node:fs';

const project = JSON.parse(fs.readFileSync('D:/Antigravity/Tickman/projects/spotlight-effect/project.json', 'utf8'));

console.log('| STT | Bắt đầu | Kết thúc | Thời lượng | Tiêu đề phân cảnh |');
console.log('| :--- | :--- | :--- | :--- | :--- |');

project.shots.forEach((s, i) => {
  const pad = String(i + 1).padStart(2, '0');
  const dur = (s.end - s.start).toFixed(2);
  const startFmt = formatTime(s.start);
  const endFmt = formatTime(s.end);
  const title = s.layers.find(l => l.type === 'text')?.text || `Phân cảnh ${pad}`;
  console.log(`| **${pad}** | \`${startFmt}\` | \`${endFmt}\` | **${dur}s** | ${title} |`);
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
}
