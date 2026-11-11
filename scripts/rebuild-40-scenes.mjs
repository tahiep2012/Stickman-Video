import fs from 'node:fs';
import path from 'node:path';

const projectPath = 'D:/Antigravity/Tickman/projects/spotlight-effect/project.json';
const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

// The 40 shots breakdown (all between 4.67s and 15.44s)
const shots40 = [
  // Opening Hook (Scenes 1 - 7: 0.00s - 62.59s)
  { start: 0, end: 7.36, title: 'QUÁN CÀ PHÊ ĐÔNG NGƯỜI', img: 'scenes/shot_01.png', layout: 'split', prop: '@b1/camera-handdrawn.png' },
  { start: 7.36, end: 12.03, title: 'BƯỚC ĐI GƯỢNG GẠO', img: 'scenes/shot_02.png', layout: 'split', prop: '@b1/clapper-crayon.png' },
  { start: 12.03, end: 21.93, title: 'NỖI XẤU HỔ TRONG ĐÊM', img: 'scenes/shot_03.png', layout: 'center' },
  { start: 21.93, end: 31.36, title: 'CHIẾC MÁY QUAY VÔ HÌNH', img: 'scenes/shot_04.png', layout: 'split', prop: '@b1/camera-handdrawn.png' },
  { start: 31.36, end: 41.845, title: 'NỖI SỢ BỊ PHÁN XÉT', img: 'scenes/shot_05.png', layout: 'center' },
  { start: 41.845, end: 51.013, title: 'BẢN NĂNG PHÒNG THỦ', img: 'scenes/shot_06.png', layout: 'split', prop: '@b1/idea-note-crayon.png' },
  { start: 51.013, end: 62.59, title: 'ÁNH ĐÈN SÂN KHẤU', img: 'scenes/shot_07.png', layout: 'center' },

  // Biểu hiện 1: Vết bẩn vô hình (62.59s - 89.66s)
  { start: 62.59, end: 75.61, title: 'VẾT CÀ PHÊ TRÊN ÁO', img: 'scenes/shot_08.png', layout: 'split', prop: '@b1/idea-bulb-crayon.png' },
  { start: 75.61, end: 89.66, title: 'CỰC HÌNH TÂM LÝ', img: 'scenes/shot_08.png', layout: 'center' },

  // Biểu hiện 2: Tê liệt giao tiếp (89.66s - 112.52s)
  { start: 89.66, end: 103.91, title: 'TÊ LIỆT GIAO TIẾP XÃ HỘI', img: 'scenes/shot_09.png', layout: 'split', prop: '@b1/clapper-crayon.png' },
  { start: 103.91, end: 112.52, title: 'BỎ LỠ CƠ HỘI TỎA SÁNG', img: 'scenes/shot_02.png', layout: 'center' },

  // Biểu hiện 3: Cơn hoảng loạn thuyết trình (112.52s - 137.76s)
  { start: 112.52, end: 124.55, title: 'HOẢNG LOẠN THUYẾT TRÌNH', img: 'scenes/shot_10.png', layout: 'center' },
  { start: 124.55, end: 137.76, title: 'SÂN KHẤU ẢO GIÁC', img: 'scenes/shot_05.png', layout: 'split', prop: '@b1/idea-note-crayon.png' },

  // Nghiên cứu khoa học: Đại học Cornell (137.76s - 162.75s)
  { start: 137.76, end: 151.86, title: 'NGHIÊN CỨU TÂM LÝ HỌC', img: 'scenes/shot_11.png', layout: 'split', prop: '@b1/script-page-crayon.png' },
  { start: 151.86, end: 162.75, title: 'THÍ NGHIỆM ĐẠI HỌC CORNELL', img: 'scenes/shot_11.png', layout: 'center' },

  // Chiếc áo Barry Manilow (162.75s - 186.83s)
  { start: 162.75, end: 174.88, title: 'CHIẾC ÁO BARRY MANILOW', img: 'scenes/shot_12.png', layout: 'center' },
  { start: 174.88, end: 186.83, title: 'KẾT QUẢ BẤT NGỜ: 23%', img: 'scenes/shot_13.png', layout: 'split', prop: '@b1/idea-bulb-crayon.png' },

  // Spotlight Effect & Thiên kiến quy ngã (186.83s - 213.05s)
  { start: 186.83, end: 199.50, title: 'HIỆU ỨNG ÁNH ĐÈN SÂN KHẤU', img: 'scenes/shot_07.png', layout: 'center' },
  { start: 199.50, end: 213.05, title: 'THIÊN KIẾN QUY NGÃ', img: 'scenes/shot_14.png', layout: 'split', prop: '@b1/open-source-crayon.png' },

  // Bẫy góc nhìn thứ nhất (213.05s - 242.44s)
  { start: 213.05, end: 227.00, title: 'GÓC NHÌN TỰ COI MÌNH LÀ TRUNG TÂM', img: 'scenes/shot_14.png', layout: 'center' },
  { start: 227.00, end: 242.44, title: 'ẢO TƯỞNG SUY ĐOÁN', img: 'scenes/shot_04.png', layout: 'split', prop: '@b1/camera-handdrawn.png' },

  // Ảo tưởng thấu suốt & Nỗi sợ nguyên thủy (242.44s - 268.48s)
  { start: 242.44, end: 255.00, title: 'ẢO TƯỞNG VỀ SỰ THẤU SUỐT', img: 'scenes/shot_15.png', layout: 'split', prop: '@b1/idea-bulb-crayon.png' },
  { start: 255.00, end: 268.48, title: 'NỖI SỢ NGUYÊN THỦY BỊ ĐÀO THẢI', img: 'scenes/shot_06.png', layout: 'center' },

  // Cái giá của nỗi sợ & Nỗi ám ảnh tuổi trẻ (268.48s - 301.05s)
  { start: 268.48, end: 279.79, title: 'CÁI GIÁ CỦA SỰ SỢ HÃI', img: 'scenes/shot_02.png', layout: 'split', prop: '@b1/clapper-crayon.png' },
  { start: 279.79, end: 290.00, title: 'NỖI ÁM ẢNH TUỔI TRẺ', img: 'scenes/shot_16.png', layout: 'center' },
  { start: 290.00, end: 301.05, title: 'THÁO BỎ ÁNH ĐÈN ẢO TƯỞNG', img: 'scenes/shot_17.png', layout: 'split', prop: '@b1/calendar-crayon.png' },

  // Quy tắc 18/40/60 & Tâm điểm của người khác (301.05s - 332.48s)
  { start: 301.05, end: 312.48, title: 'QUY TẮC 18 / 40 / 60', img: 'scenes/shot_17.png', layout: 'center' },
  { start: 312.48, end: 323.75, title: 'AI CŨNG BẬN VỚI ĐÈN CỦA RIÊNG HỌ', img: 'scenes/shot_18.png', layout: 'center' },
  { start: 323.75, end: 332.48, title: 'BẠN CHỈ LÀ VAI PHỤ', img: 'scenes/shot_18.png', layout: 'split', prop: '@b1/open-source-crayon.png' },

  // Giải pháp 2: Shifting Focus (332.48s - 358.14s)
  { start: 332.48, end: 344.65, title: 'ĐẶT GÓC NHÌN RA NGOÀI', img: 'scenes/shot_19.png', layout: 'split', prop: '@b1/open-source-crayon.png' },
  { start: 344.65, end: 358.14, title: 'QUAN SÁT THẾ GIỚI XUNG QUANH', img: 'scenes/shot_19.png', layout: 'center' },

  // Giải pháp 3: Mishap Desensitization (358.14s - 388.14s)
  { start: 358.14, end: 367.06, title: 'THỬ THÁCH LÀM ĐIỀU NGỚ NGẨN NHỎ', img: 'scenes/shot_20.png', layout: 'split', prop: '@b1/idea-bulb-crayon.png' },
  { start: 367.06, end: 376.89, title: 'BẦU TRỜI KHÔNG HỀ SỤP ĐỔ', img: 'scenes/shot_20.png', layout: 'center' },
  { start: 376.89, end: 388.14, title: 'XÓA BỎ PHẢN XẠ SỢ HÃI', img: 'scenes/shot_21.png', layout: 'split', prop: '@b1/clapper-crayon.png' },

  // Đúc kết & Tự do (388.14s - 416.89s)
  { start: 388.14, end: 398.05, title: 'NGƯỜI YÊU THƯƠNG THỰC SỰ', img: 'scenes/shot_21.png', layout: 'center' },
  { start: 398.05, end: 408.17, title: 'KẺ PHÁN XÉT SẼ QUÊN SẠCH', img: 'scenes/shot_22.png', layout: 'split', prop: '@b1/idea-note-crayon.png' },
  { start: 408.17, end: 416.89, title: 'TỰ TIN SỐNG THẬT VỚI CHÍNH MÌNH', img: 'scenes/shot_22.png', layout: 'center' },

  // Outro & Kêu gọi (416.89s - 434.416s)
  { start: 416.89, end: 428.62, title: 'ĐỒNG HÀNH CÙNG CÕI VÔ THỨC', img: 'scenes/shot_19.png', layout: 'split', prop: '@b1/youtube-crayon.png' },
  { start: 428.62, end: 434.416, title: 'HẸN GẶP LẠI BẠN!', img: 'scenes/shot_22.png', layout: 'center' },
];

console.log(`Building 40 high-tempo shots (averaging ~10s per shot)...`);

project.shots = shots40.map((shot, index) => {
  const pad = String(index + 1).padStart(2, '0');
  const title = shot.title;
  const isCenter = shot.layout === 'center';
  const headerX = 80;
  const headerY = 40;
  const titleWidth = Math.min(title.length * 27 + 20, 520);

  const layers = [];

  // 1. Topic Badge
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

  // 3. Hero Stickman Illustration
  if (isCenter) {
    layers.push({
      type: 'image',
      path: shot.img,
      x: 370,
      y: 90,
      w: 540,
      keys: [
        { t: 0, y: 105, alpha: 0.85 },
        { t: 0.5, y: 90, alpha: 1.0 },
      ],
    });
  } else {
    // Left prop / accent
    if (shot.prop) {
      layers.push({
        type: 'image',
        path: shot.prop,
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

    // Right hero stickman
    layers.push({
      type: 'image',
      path: shot.img,
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
console.log(`Successfully generated ${project.shots.length} shots in project.json!`);
