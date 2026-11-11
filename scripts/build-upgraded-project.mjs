import fs from 'node:fs';
import path from 'node:path';

const projectPath = 'D:/Antigravity/Tickman/projects/spotlight-effect/project.json';
const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

// Titles for each of the 22 shots
const shotTitles = [
  'QUÁN CÀ PHÊ ĐÔNG NGƯỜI',              // 1
  'BƯỚC ĐI GƯỢNG GẠO',                  // 2
  'NỖI XẤU HỔ TRONG ĐÊM',               // 3
  'CHIẾC MÁY QUAY VÔ HÌNH',             // 4
  'NỖI SỢ BỊ PHÁN XÉT',                 // 5
  'BẢN NĂNG PHÒNG THỦ',                 // 6
  'ÁNH ĐÈN SÂN KHẤU',                   // 7
  'VẾT CÀ PHÊ TRÊN ÁO',                 // 8
  'CẢM GIÁC LẠC LÕNG',                  // 9
  'CƠN HOẢNG LOẠN THUYẾT TRÌNH',        // 10
  'THÍ NGHIỆM ĐẠI HỌC CORNELL',         // 11
  'CHIẾC ÁO BARRY MANILOW',             // 12
  '50% ẢO TƯỞNG VS 23% SỰ THẬT',        // 13
  'THIÊN KIẾN TỰ COI MÌNH LÀ TRUNG TÂM', // 14
  'ẢO TƯỞNG VỀ SỰ THẤU SUỐT',           // 15
  'NỖI ÁM ẢNH TUỔI TRẺ',                // 16
  'TIẾN TRÌNH TRƯỞNG THÀNH',            // 17
  'AI CŨNG CÓ ÁNH ĐÈN RIÊNG',           // 18
  'ĐỔI GÓC NHÌN RA THẾ GIỚI',           // 19
  'CHUYỂN HƯỚNG SỰ CHÚ Ý',              // 20
  'TỰ DO TÂM TRÍ',                      // 21
  'TỰ TIN TỎA SÁNG',                    // 22
];

// Configuration for each shot layout
// - 'split': Left prop (w: 260) balances Right hero stickman (w: 580)
// - 'center': Centered hero (w: 540) below header
const shotConfigs = [
  { layout: 'split', prop: '@b1/camera-handdrawn.png' },            // 1: Cafe entrance
  { layout: 'split', prop: '@b1/clapper-crayon.png' },              // 2: Awkward walk
  { layout: 'center' },                                            // 3: Bed cringe (wide bed)
  { layout: 'split', prop: '@b1/camera-handdrawn.png' },            // 4: Invisible camera
  { layout: 'split', prop: '@b1/idea-note-crayon.png' },            // 5: Fear of judgment
  { layout: 'split', prop: '@b1/idea-note-crayon.png' },            // 6: Defense instinct
  { layout: 'center' },                                            // 7: Spotlight beam
  { layout: 'split', prop: '@b1/idea-bulb-crayon.png' },            // 8: Coffee stain
  { layout: 'split', prop: '@b1/clapper-crayon.png' },              // 9: Social freeze
  { layout: 'center' },                                            // 10: Presentation panic (wide stage)
  { layout: 'split', prop: '@b1/script-page-crayon.png' },          // 11: Cornell experiment
  { layout: 'center' },                                            // 12: Barry Manilow shirt
  { layout: 'center' },                                            // 13: Chart 50% vs 23% (wide chart)
  { layout: 'center' },                                            // 14: Egocentric distortion
  { layout: 'split', prop: '@b1/idea-bulb-crayon.png' },            // 15: Mind reading illusion
  { layout: 'split', prop: '@b1/calendar-crayon.png' },             // 16: Age / adolescence
  { layout: 'center' },                                            // 17: Age timeline (wide timeline)
  { layout: 'center' },                                            // 18: Busy crowd with spotlights (wide crowd)
  { layout: 'split', prop: '@b1/open-source-crayon.png' },          // 19: Binoculars looking outward
  { layout: 'split', prop: '@b1/idea-bulb-crayon.png' },            // 20: Focus outward
  { layout: 'split', prop: '@b1/open-source-crayon.png' },          // 21: Freedom & relief
  { layout: 'center' },                                            // 22: Confident living
];

console.log(`Rebuilding ${project.shots.length} shots with clean, balanced, hero-focused layout...`);

project.shots = project.shots.map((shot, index) => {
  const pad = String(index + 1).padStart(2, '0');
  const title = shotTitles[index] || `PHÂN CẢNH ${pad}`;
  const config = shotConfigs[index] || { layout: 'split' };
  const heroPath = `scenes/shot_${pad}.png`;

  const layers = [];
  const isCenter = config.layout === 'center';
  const headerX = 80;
  const headerY = 40;
  const titleWidth = Math.min(title.length * 27 + 20, 520);

  // 1. Clean Topic Badge (Header)
  layers.push({
    type: 'text',
    text: title,
    x: headerX,
    y: headerY,
    size: 40,
    bold: true,
    color: '#191916',
  });

  // 2. Animated underline
  layers.push({
    type: 'underline',
    x: headerX,
    y: headerY + 52,
    w: Math.max(240, titleWidth),
    color: '#191916',
    lineWidth: 4,
    keys: [
      { t: 0, progress: 0 },
      { t: 0.45, progress: 1 },
    ],
  });

  // 3. Hero Character Illustration
  if (isCenter) {
    layers.push({
      type: 'image',
      path: heroPath,
      x: 370,
      y: 90,
      w: 540,
      keys: [
        { t: 0, y: 105, alpha: 0.85 },
        { t: 0.5, y: 90, alpha: 1.0 },
      ],
    });
  } else {
    // Left prop / accent (w: 260)
    if (config.prop) {
      layers.push({
        type: 'image',
        path: config.prop,
        x: 140,
        y: 195,
        w: 260,
        keys: [
          { t: 0, angle: -0.05 },
          { t: 1.0, angle: 0.04 },
          { t: 2.0, angle: 0 },
        ],
      });
    }

    // Hero Character on the right (w: 580)
    layers.push({
      type: 'image',
      path: heroPath,
      x: 620,
      y: 30,
      w: 580,
      keys: [
        { t: 0, y: 48, alpha: 0.85 },
        { t: 0.45, y: 30, alpha: 1.0 },
      ],
    });
  }

  return {
    start: shot.start,
    end: shot.end,
    layers,
  };
});

fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), 'utf8');
console.log('Successfully updated project.json with perfected visual balance!');
