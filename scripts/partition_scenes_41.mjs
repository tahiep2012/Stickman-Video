import fs from 'node:fs';

const subs = JSON.parse(fs.readFileSync('scripts/parsed_subtitles.json', 'utf8'));

// Refined partition:
// We want ~40 scenes, duration between 8s and 12s, aligning cleanly with subtitle transitions.
// We make explicit split points at natural semantic breaks:
const explicitBreakpoints = [
  // Scene 1: 0.0 - 8.8s (Mối quan hệ hoàn hảo & cảm giác bất an)
  { endCaptionIdx: 2 }, // ends at [3] 8.817s
  // Scene 2: 9.3s - 17.3s (Giọng nói thì thầm nghi ngờ)
  { endCaptionIdx: 4 }, // ends at [5] 17.345s
  // Scene 3: 18.0s - 30.5s -> split at 23.2s
  { endCaptionIdx: 6 }, // ends at [7] 23.2s (cố tình gây chiến)
  { endCaptionIdx: 8 }, // ends at [9] 30.5s (mình biết ngay sẽ kết thúc thế này)
  // Scene 5: 31.1s - 42.3s -> split at 38.8s
  { endCaptionIdx: 11 }, // ends at [12] 38.8s (trì hoãn trước thời khắc quyết định)
  { endCaptionIdx: 13 }, // ends at [14] 45.6s (đánh sập cơ hội trước vạch đích)
  // Scene 7: 46.3s - 55.1s
  { endCaptionIdx: 16 }, // ends at [17] 55.1s (bạn không hề ngốc nghếch)
  // Scene 8: 55.6s - 65.5s
  { endCaptionIdx: 20 }, // ends at [21] 65.5s (nghịch lý tự phá hoại)
  // Scene 9: 65.5s - 77.8s
  { endCaptionIdx: 23 }, // ends at [24] 77.8s (ngụy trang khéo léo)
  // Scene 10: 77.8s - 88.4s
  { endCaptionIdx: 26 }, // ends at [27] 88.4s (thói quen 1: trì hoãn mạn tính)
  // Scene 11: 88.8s - 98.8s
  { endCaptionIdx: 29 }, // ends at [30] 98.8s (dọn phòng lướt video thay vì làm)
  // Scene 12: 99.3s - 108.2s
  { endCaptionIdx: 32 }, // ends at [33] 108.2s (tấm khiên tự vệ lòng tự trọng)
  // Scene 13: 108.7s - 121.0s
  { endCaptionIdx: 36 }, // ends at [37] 121.0s (thói quen 2: soi kính lúp tình cảm)
  // Scene 14: 121.5s - 131.6s
  { endCaptionIdx: 39 }, // ends at [40] 131.6s (thử thách đẩy người tốt ra xa)
  // Scene 15: 132.3s - 144.5s
  { endCaptionIdx: 43 }, // ends at [44] 144.5s (thói quen 3: đóng vai nạn nhân, ghosting)
  // Scene 16: 145.2s - 157.8s
  { endCaptionIdx: 47 }, // ends at [48] 157.8s (tại sao não lại tự hủy hoại?)
  // Scene 17: 158.4s - 169.4s
  { endCaptionIdx: 50 }, // ends at [51] 169.4s (Góc nhìn 1: The Upper Limit Problem & Thermostat)
  // Scene 18: 169.4s - 180.9s
  { endCaptionIdx: 53 }, // ends at [54] 180.9s (nhiệt độ tâm lý cài đặt ở mức chịu đựng)
  // Scene 19: 180.9s - 192.9s
  { endCaptionIdx: 57 }, // ends at [58] 192.9s (hạnh phúc mới lạ bị coi là nguy hiểm)
  // Scene 20: 193.3s - 207.0s
  { endCaptionIdx: 61 }, // ends at [62] 207.0s (Amygdala báo động & kéo về vùng quen thuộc)
  // Scene 21: 207.7s - 219.9s
  { endCaptionIdx: 65 }, // ends at [66] 219.9s (Góc nhìn 2: Thuyết gắn bó & nỗi sợ bị bỏ rơi)
  // Scene 22: 219.9s - 231.7s
  { endCaptionIdx: 68 }, // ends at [69] 231.7s (thà tự tay phá hủy trước)
  // Scene 23: 231.7s - 244.0s
  { endCaptionIdx: 71 }, // ends at [72] 244.0s (Góc nhìn 3: Bất hòa nhận thức)
  // Scene 24: 244.0s - 255.3s
  { endCaptionIdx: 74 }, // ends at [75] 255.3s (mâu thuẫn giữa niềm tin thất bại và lời khen)
  // Scene 25: 255.8s - 266.4s
  { endCaptionIdx: 77 }, // ends at [78] 266.4s (tự phá để chứng minh niềm tin là đúng)
  // Scene 26: 267.1s - 276.8s
  { endCaptionIdx: 81 }, // ends at [82] 276.8s (vòng lặp nghiệt ngã 1-2)
  // Scene 27: 277.4s - 288.3s
  { endCaptionIdx: 84 }, // ends at [85] 288.3s (vòng lặp 3-4-5 sụp đổ)
  // Scene 28: 288.3s - 300.0s
  { endCaptionIdx: 88 }, // ends at [89] 300.0s (phá nát lòng tin vào bản thân)
  // Scene 29: 300.5s - 312.4s
  { endCaptionIdx: 92 }, // ends at [93] 312.4s (3 bước can thiệp tâm lý hành vi)
  // Scene 30: 313.0s - 325.1s
  { endCaptionIdx: 96 }, // ends at [97] 325.1s (Bước 1: Nâng ngưỡng điều nhiệt, dừng lại 30s)
  // Scene 31: 325.8s - 335.1s
  { endCaptionIdx: 99 }, // ends at [100] 335.1s (hít sâu, đặt tay lên ngực dung nạp)
  // Scene 32: 335.1s - 344.9s
  { endCaptionIdx: 102 }, // ends at [103] 344.9s (huấn luyện hệ thần kinh quen an ổn)
  // Scene 33: 345.6s - 357.7s
  { endCaptionIdx: 106 }, // ends at [107] 357.7s (Bước 2: Bắt bài tiếng nói tự phá hoại, đặt tên)
  // Scene 34: 358.4s - 371.0s
  { endCaptionIdx: 110 }, // ends at [111] 371.0s (suy nghĩ không phải sự thật, câu hỏi chất vấn)
  // Scene 35: 371.6s - 383.8s
  { endCaptionIdx: 113 }, // ends at [114] 383.8s (Bước 3: Giao tiếp chân thật về sự yếu đuối)
  // Scene 36: 384.4s - 400.8s -> split at 394.0s
  { endCaptionIdx: 115 }, // ends at [116] 394.0s (nói thật cảm xúc bất an với đối phương)
  { endCaptionIdx: 117 }, // ends at [118] 400.8s (sự chân thành tước đi sức mạnh phá hoại)
  // Scene 38: 401.4s - 411.2s
  { endCaptionIdx: 120 }, // ends at [121] 411.2s (sống sót qua giông bão để hạnh phúc)
  // Scene 39: 411.7s - 418.9s
  { endCaptionIdx: 123 }, // ends at [124] 418.9s (can đảm bước qua giới hạn cũ)
  // Scene 40: 419.6s - 431.7s
  { endCaptionIdx: 127 }, // ends at [128] 431.7s (Like, chia sẻ và đăng ký kênh Cõi Vô Thức)
  // Scene 41: 432.3s - 441.141s
  { endCaptionIdx: 130 }, // ends at [131] 441.141s (Bình luận & hẹn gặp lại)
];

const scenes = [];
let prevEndCaption = -1;
let prevStartTime = subs[0].start;

explicitBreakpoints.forEach((bp, idx) => {
  const startIdx = prevEndCaption + 1;
  const endIdx = bp.endCaptionIdx;
  const startT = subs[startIdx].start;
  const endT = subs[endIdx].end;
  const duration = Number((endT - startT).toFixed(3));
  const captionText = subs.slice(startIdx, endIdx + 1).map(c => c.text).join(' ');

  scenes.push({
    sceneIndex: idx + 1,
    start: startT,
    end: endT,
    duration,
    startCaptionIdx: startIdx,
    endCaptionIdx: endIdx,
    captions: captionText
  });

  prevEndCaption = endIdx;
  prevStartTime = endT;
});

console.log(`Generated exactly ${scenes.length} scenes.`);
scenes.forEach((s) => {
  console.log(`Scene ${String(s.sceneIndex).padStart(2, '0')}: [${String(s.start.toFixed(1)).padStart(5, ' ')}s -> ${String(s.end.toFixed(1)).padStart(5, ' ')}s] (${String(s.duration.toFixed(1)).padStart(4, ' ')}s) | ${s.captions.slice(0, 50)}...`);
});

fs.writeFileSync('scripts/scene_partition_41.json', JSON.stringify(scenes, null, 2), 'utf8');
