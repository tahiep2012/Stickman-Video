import fs from 'node:fs';

const srtPath = "C:/Users/votah/.gemini/antigravity/brain/c5690218-6497-42c2-a2e1-386a25a75f28/.user_uploaded/media_1794395128506_a332a1e3.srt";
const raw = fs.readFileSync(srtPath, "utf8");

function parseTime(t) {
  const [hms, ms] = t.trim().split(",");
  const [h, m, s] = hms.split(":").map(Number);
  return Number((h * 3600 + m * 60 + s + Number(ms) / 1000).toFixed(3));
}

const blocks = raw.trim().replace(/\r\n/g, "\n").split(/\n\n+/);
const parsed = [];
for (const b of blocks) {
  const lines = b.split("\n");
  if (lines.length >= 3) {
    const idx = lines[0].trim();
    const [startStr, endStr] = lines[1].split("-->");
    const text = lines.slice(2).join(" ").trim();
    parsed.push({
      start: parseTime(startStr),
      end: parseTime(endStr),
      text
    });
  }
}

console.log("Total caption blocks:", parsed.length);
console.log("First block:", parsed[0]);
console.log("Last block:", parsed[parsed.length - 1]);
fs.writeFileSync("scripts/parsed_subtitles.json", JSON.stringify(parsed, null, 2), "utf8");
console.log("Saved parsed subtitles to scripts/parsed_subtitles.json");
