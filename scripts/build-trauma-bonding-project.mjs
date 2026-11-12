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

// High-impact visual concepts for all scenes
export const SCENE_PROMPTS = [
  // Shot 01 (0.00s - 8.19s): Người soi gương bối rối
  "Minimalist 2D hand-drawn stick figure looking thoughtfully into a standalone oval mirror, scratching head in confusion, wondering why gentle people feel boring, pure white background, crisp clean black lines, standalone figure centered.",
  
  // Shot 02 (8.19s - 18.02s): Kẻ lúc nóng lúc lạnh
  "Minimalist 2D hand-drawn stick figure standing between two symbolic elements: hot fire flames on one side and freezing ice icicles on the other, looking dizzy and hooked, pure white background, simple black linework.",

  // Shot 03 (18.02s - 24.82s): Cảnh báo hàng tá cờ đỏ (Red Flags)
  "Minimalist 2D hand-drawn stick figure walking past a forest of warning red triangular flags stuck into the ground, waving hands dismissively while friends try to pull back, crisp black outlines, pure white background.",

  // Shot 04 (24.82s - 34.25s): Chiếc điện thoại rung lên tin nhắn ngọt ngào
  "Minimalist 2D hand-drawn stick figure staring wide-eyed at a vibrating smartphone in hands with a glowing speech bubble 'Miss you', heart beating fast, pure white background, clean black lines.",

  // Shot 05 (34.25s - 42.94s): Vòng lặp thiêu thân lao vào lửa
  "Minimalist 2D hand-drawn stick figure with small moth wings fluttering anxiously towards a burning lantern lightbulb, caught in an infinite circular loop arrow, pure white background.",

  // Shot 06 (42.94s - 51.95s): Kênh Cõi Vô Thức - Sự thật khoa học
  "Minimalist 2D hand-drawn stick figure scientist or presenter standing next to a whiteboard with brain neural diagram and chemical molecular formulas, pointing explaining calmly, pure white background.",

  // Shot 07 (51.95s - 64.44s): Sòng bài Las Vegas & Con nghiện hóa học
  "Minimalist 2D hand-drawn stick figure standing next to a classic casino slot machine pulling the lever excitedly, slot reels spinning symbols, dopamine addiction metaphor, pure white background.",

  // Shot 08 (64.44s - 75.19s): Bẻ gãy chiếc còng vô hình
  "Minimalist 2D hand-drawn stick figure with arms raising up, breaking apart a pair of heavy iron handcuffs, links shattering, freedom and empowerment, pure white background.",

  // Shot 09 (75.19s - 88.32s): Giai đoạn 1 - Bội thực tình cảm (Love Bombing)
  "Minimalist 2D hand-drawn stick figure being showered by a massive rain of hearts and flying love letters, overwhelmed with flattered bliss and starry eyes, pure white background.",

  // Shot 10 (88.32s - 99.93s): Ngập tràn Dopamine và Oxytocin
  "Minimalist 2D hand-drawn stick figure floating happily in zero gravity inside a translucent glowing bubble labeled 'Dopamine & Oxytocin', serene dreamy smile, pure white background.",

  // Shot 11 (99.93s - 112.36s): Giai đoạn 2 - Bỏ đói cảm xúc (Breadcrumbing)
  "Minimalist 2D hand-drawn stick figure kneeling on the floor desperately picking up tiny breadcrumb crumbs falling from a distant cold figure turning away, pure white background.",

  // Shot 12 (112.36s - 123.32s): Hoang mang tột độ, hạ thấp cái tôi
  "Minimalist 2D hand-drawn stick figure sitting slumped on floor with hands holding head, large swirl of question marks hovering above, looking small and insecure, pure white background.",

  // Shot 13 (123.32s - 134.41s): Giai đoạn 3 - Ban phát phần thưởng ngẫu nhiên
  "Minimalist 2D hand-drawn stick figure receiving a single wrapped gift box from shadowy hands, bursting into relieved tears of temporary joy, pure white background.",

  // Shot 14 (134.41s - 144.03s): Chu kỳ lạnh nhạt lặp lại & Chiếc lồng vô hình
  "Minimalist 2D hand-drawn stick figure standing inside a large invisible circular birdcage outline, looking outside sadly through imaginary bars, pure white background.",

  // Shot 15 (144.03s - 152.79s): Sinh hóa thần kinh vạch trần ma lực
  "Minimalist 2D hand-drawn stick figure inspecting a glowing magnifying glass over biological brain synapses and test tubes, scientific discovery, pure white background.",

  // Shot 16 (152.79s - 164.83s): Thí nghiệm Hộp Skinner thế kỷ 20
  "Minimalist 2D hand-drawn stick figure scientist B.F. Skinner observing a glass experimental box with a lever and food dispenser, vintage psychological laboratory, pure white background.",

  // Shot 17 (164.83s - 174.55s): Nhóm chuột 1 - Gạt cần có ăn đều đặn
  "Minimalist 2D hand-drawn stick figure cute mouse pressing a lever calmly, eating a single cheese pellet, relaxed and unstressed posture, pure white background.",

  // Shot 18 (174.55s - 186.38s): Nhóm chuột 2 - Bỏ cuộc vì không bao giờ có thức ăn
  "Minimalist 2D hand-drawn stick figure cute mouse walking away indifferently from a dry empty food chute, waving tail and ignoring the lever, pure white background.",

  // Shot 19 (186.38s - 199.81s): Nhóm chuột 3 - Phát điên vì phần thưởng ngẫu nhiên
  "Minimalist 2D hand-drawn stick figure frantic mouse sweating and frenetically pushing the lever over and over in wild obsession, eyes wide open, pure white background.",

  // Shot 20 (199.81s - 214.69s): Cỗ máy đánh bạc Slot Machine tâm lý
  "Minimalist 2D hand-drawn stick figure looking up at giant slot machine displaying '7-7-BAR' with flashing lightbulbs, coins clattering, endless anticipation, pure white background.",

  // Shot 21 (214.69s - 226.98s): Cơn sốt Dopamine bùng nổ vì sự bất định
  "Minimalist 2D hand-drawn stick figure with glowing lightning bolts around brain, a rocket-like graph shooting straight up into the sky with percentages, pure white background.",

  // Shot 22 (226.98s - 235.58s): Im lặng buốt giá - Ngập chìm trong Cortisol
  "Minimalist 2D hand-drawn stick figure shivering in heavy cold rain under a stormy black cloud labeled 'Cortisol & Stress', hugging arms tightly, pure white background.",

  // Shot 23 (235.58s - 247.30s): Con thú nhỏ bị bỏ rơi giữa rừng rậm
  "Minimalist 2D hand-drawn cute stick figure huddled alone in a dark forest surrounded by giant shadowy tree silhouettes, looking frightened and helpless, pure white background.",

  // Shot 24 (247.30s - 259.96s): Tàu lượn siêu tốc cảm xúc (Trauma Bonding)
  "Minimalist 2D hand-drawn stick figure riding a steep looping roller coaster cart, plunging from euphoric peak to dark abyss, holding on for dear life, pure white background.",

  // Shot 25 (259.96s - 273.68s): Triệu chứng cắt cơn nghiện của con bạc
  "Minimalist 2D hand-drawn stick figure trembling hands reaching for a missing cup, shaking off physiological withdrawal symptoms with sweaty brow, pure white background.",

  // Shot 26 (273.68s - 286.82s): Tê liệt hệ thống cảm nhận - Chê người tốt nhạt nhẽo
  "Minimalist 2D hand-drawn stick figure looking bored at a warm steaming cup of healthy tea while craving an explosive fizzy bottle of poison, sensory desensitization, pure white background.",

  // Shot 27 (286.82s - 299.75s): Đánh mất lòng tự trọng & Ranh giới cá nhân
  "Minimalist 2D hand-drawn stick figure stepping over broken chalk boundary lines on the floor, carrying a heavy burden of someone else's emotional baggage, pure white background.",

  // Shot 28 (299.75s - 312.25s): Quyết tâm cai nghiện - Lấy lại quyền làm chủ
  "Minimalist 2D hand-drawn stick figure standing tall and resolute with hands on hips, wearing a captain hat at a ship steering wheel, navigating own life, pure white background.",

  // Shot 29 (312.25s - 322.92s): Bước 1 - Nguyên tắc No Contact tuyệt đối
  "Minimalist 2D hand-drawn stick figure pressing a big red 'BLOCK' icon button on a phone screen, cutting cables, a solid brick wall rising between two figures, pure white background.",

  // Shot 30 (322.92s - 333.41s): Chặn số, xóa tin nhắn & Vượt qua 2-3 tuần đầu
  "Minimalist 2D hand-drawn stick figure crossing off calendar days with red marker 'Day 7, Day 14, Day 21', holding a calendar steadily, milestone detox, pure white background.",

  // Shot 31 (333.41s - 345.34s): Nhận diện cơn đói Dopamine của não bộ
  "Minimalist 2D hand-drawn stick figure placing one hand over chest heart and pointing other hand to head brain, taking a deep mindful breath, emotional awareness, pure white background.",

  // Shot 32 (345.34s - 359.62s): Bước 2 - Viết Bản cáo trạng sự thật
  "Minimalist 2D hand-drawn stick figure holding a fountain pen writing firmly into a thick notebook labeled 'THE REALITY', list of toxic events, banishing rosy illusions, pure white background.",

  // Shot 33 (359.62s - 371.78s): Đọc danh sách sự thật khi tay muốn gửi tin nhắn
  "Minimalist 2D hand-drawn stick figure reading an unfolded long parchment scroll with determined eyes, pulling hand away from smartphone on desk, pure white background.",

  // Shot 34 (371.78s - 384.90s): Bước 3 - Viết lại từ điển cảm xúc
  "Minimalist 2D hand-drawn stick figure standing in front of an open dictionary book, crossing out 'Love = Panic' and writing 'Love = Peace', emotional redefinition, pure white background.",

  // Shot 35 (384.90s - 396.10s): Tình yêu đích thực là bình yên và an toàn
  "Minimalist 2D hand-drawn stick figure resting peacefully under a blossoming shady tree on soft grass, breathing easily with a calm smile, serene warmth, pure white background.",

  // Shot 36 (396.10s - 408.72s): Bạn không phải là con chuột trong hộp thí nghiệm!
  "Minimalist 2D hand-drawn stick figure proudly kicking open the latch of a cage, walking out into bright warm sunlight with head held high, liberation, pure white background.",

  // Shot 37 (408.72s - 419.11s): Xứng đáng được yêu thương đường hoàng trọn vẹn
  "Minimalist 2D hand-drawn stick figure wearing a shining golden laurel crown, receiving genuine supportive applause and respect, healthy self-worth, pure white background.",

  // Shot 38 (419.11s - 433.39s): Kêu gọi Like, Share và Đăng ký kênh Cõi Vô Thức
  "Minimalist 2D hand-drawn stick figure pointing cheerfully towards animated Like thumbs-up badge and Subscribe bell icon, community engagement, pure white background.",

  // Shot 39 (433.39s - 443.22s): Lời nhắn gửi bình luận & Chia sẻ câu chuyện
  "Minimalist 2D hand-drawn stick figure sitting at desk typing into a laptop with chat bubbles rising, encouraging thoughtful viewer comments, pure white background.",

  // Shot 40 (443.22s - 446.72s): Vẫy tay chào tạm biệt ấm áp
  "Minimalist 2D hand-drawn stick figure smiling warmly and waving goodbye with right hand, radiating sparkling stars of hope and happiness, pure white background."
];

// Split cues accurately into 40 shots
const shotBoundaries = [
  8.193,   // 01
  18.015,  // 02
  24.815,  // 03
  34.248,  // 04
  42.935,  // 05
  51.946,  // 06
  64.442,  // 07
  75.189,  // 08
  88.316,  // 09
  99.926,  // 10
  112.360, // 11
  123.324, // 12
  134.409, // 13
  144.026, // 14
  152.786, // 15
  164.828, // 16
  174.550, // 17
  186.384, // 18
  199.807, // 19
  214.689, // 20
  226.978, // 21
  235.583, // 22
  247.302, // 23
  259.961, // 24
  273.679, // 25
  286.823, // 26
  299.745, // 27
  312.250, // 28
  322.922, // 29
  333.409, // 30
  345.339, // 31
  359.623, // 32
  371.780, // 33
  384.903, // 34
  396.095, // 35
  408.721, // 36
  419.107, // 37
  433.386, // 38
  443.221, // 39
  446.717  // 40
];

let lastEnd = 0;
const shots = shotBoundaries.map((b, idx) => {
  const start = lastEnd;
  const end = b;
  lastEnd = end;
  const shotNum = idx + 1;
  const shotKey = String(shotNum).padStart(2, '0');
  return {
    shot_index: shotNum,
    start,
    end,
    duration: +(end - start).toFixed(2),
    prompt: SCENE_PROMPTS[idx],
    layers: [
      {
        type: 'image',
        path: `scenes/shot_${shotKey}.png`,
        x: 320,
        y: 35,
        w: 640,
        keys: [
          { t: 0, y: 50, alpha: 0.85 },
          { t: 0.5, y: 35, alpha: 1.0 }
        ]
      }
    ]
  };
});

const captions = cues.map(c => ({
  start: +c.start.toFixed(3),
  end: +c.end.toFixed(3),
  text: c.text
}));

const project = {
  version: 1,
  style: "B1",
  width: 1280,
  height: 720,
  fps: 30,
  font: "NotoSans.ttf",
  voice: {
    path: "audio/narration.mp3",
    lead: 0,
    tail: 0,
    contains_sfx: false
  },
  captions,
  shots
};

fs.writeFileSync('projects/trauma-bonding/project.json', JSON.stringify(project, null, 2), 'utf8');
console.log(`Generated projects/trauma-bonding/project.json with ${shots.length} shots and ${captions.length} captions.`);
