import fs from 'node:fs';

const scenes = JSON.parse(fs.readFileSync('scripts/scene_partition_41.json', 'utf8'));

const B1_BASE = "Minimalist 2D hand-drawn stick figure, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, isolated on solid pure white background (#FFFFFF), strictly 2D flat, no 3D shading, no gradients, no shadows, consistent line weight, cozy hand-drawn illustration style, completely standalone figure not touching image boundaries.";

const sceneConcepts = [
  {
    shot: "01",
    theme: "Mối quan hệ hoàn hảo & cảm giác bất an ngấm ngầm",
    prompt: `${B1_BASE} A stickman couple sitting together peacefully on a simple bench, one partner smiling kindly while the other stickman looks uneasy with a subtle nervous scribble above their head. Completely standalone in the center with plenty of white space around all edges.`
  },
  {
    shot: "02",
    theme: "Giọng nói thì thầm nghi ngờ: Quá tốt để có thể là thật",
    prompt: `${B1_BASE} A stickman standing nervously as a small shadowy stickman phantom whispers suspicious doubts into their ear: 'Too good to be true'. Standalone figure centered on pure white background, no edge contact.`
  },
  {
    shot: "03",
    theme: "Bắt đầu soi mói, cáu gắt và gây chiến vô cớ",
    prompt: `${B1_BASE} An irritated stickman angrily pointing at a tiny microscopic flaw on a simple table, exaggerated frowning face, looking frustrated. Centered standalone figure on pure white background, generous margin.`
  },
  {
    shot: "04",
    theme: "Đối phương rời đi & lời thở dài: 'Mình biết ngay mà'",
    prompt: `${B1_BASE} A lonely stickman sitting on the floor with folded arms and a resigned knowing smirk, watching distant footsteps walking away. Centered standalone figure on solid pure white background.`
  },
  {
    shot: "05",
    theme: "Trì hoãn trước cơ hội sự nghiệp và vạch đích",
    prompt: `${B1_BASE} A stickman standing in front of an open door with a star above it, but holding back with hesitation and doubts. Centered standalone figure, completely within white borders.`
  },
  {
    shot: "06",
    theme: "Thức trắng đêm lướt điện thoại tự phá hoại deadline",
    prompt: `${B1_BASE} A stickman slumped in bed or chair late at night, staring blankly at a glowing phone screen, with messy project papers neglected nearby. Centered standalone figure on pure white background.`
  },
  {
    shot: "07",
    theme: "Tự soi xét bản thân: Bạn không ngốc nghếch hay bất tài",
    prompt: `${B1_BASE} A stickman looking at their own reflection in a hand mirror with understanding and compassion, head tilted thoughtfully. Standalone centered figure on pure white background.`
  },
  {
    shot: "08",
    theme: "Bóc trần nghịch lý tâm lý học: Hành vi tự phá hoại",
    prompt: `${B1_BASE} A stickman holding up a theater mask labeled 'Self-Sabotage', revealing a thoughtful human face behind it. Centered standalone figure on pure white background.`
  },
  {
    shot: "09",
    theme: "Vòng lặp luẩn quẩn và mong muốn thoát ra",
    prompt: `${B1_BASE} A stickman walking inside a circular dotted loop pathway, pausing and looking outward towards an exit arrow. Centered standalone figure on pure white background.`
  },
  {
    shot: "10",
    theme: "Thói quen 1: Trì hoãn mạn tính trước thời hạn quan trọng",
    prompt: `${B1_BASE} A stickman standing beside a large simple wall calendar with a prominent Monday date circled, looking overwhelmed. Centered standalone figure on pure white background.`
  },
  {
    shot: "11",
    theme: "Dọn dẹp nhà cửa để trốn tránh công việc thực sự",
    prompt: `${B1_BASE} A stickman vigorously sweeping with a broom and folding clothes with intense energy while an untouched laptop rests on a desk. Centered standalone figure on pure white background.`
  },
  {
    shot: "12",
    theme: "Tấm khiên tự vệ bảo vệ lòng tự trọng",
    prompt: `${B1_BASE} A stickman holding a round hand-drawn shield protecting themselves from small incoming arrows representing fear of failure. Centered standalone figure on pure white background.`
  },
  {
    shot: "13",
    theme: "Thói quen 2: Hội chứng soi kính lúp trong tình cảm",
    prompt: `${B1_BASE} A stickman holding an oversized magnifying glass looking closely at a small heart, searching for nonexistent flaws. Centered standalone figure on pure white background.`
  },
  {
    shot: "14",
    theme: "Bị thu hút bởi người lạnh lùng và Red Flags",
    prompt: `${B1_BASE} A stickman walking hypnotically towards a figure holding a large patterned red flag, ignoring peaceful green paths. Centered standalone figure on pure white background.`
  },
  {
    shot: "15",
    theme: "Thói quen 3: Đóng vai nạn nhân hoặc rút lui sớm (Ghosting)",
    prompt: `${B1_BASE} A stickman turning translucent like a faint outline or ghost, quietly stepping backwards out of a door. Centered standalone figure on pure white background.`
  },
  {
    shot: "16",
    theme: "Bí ẩn não bộ: Tại sao lại chọn cách tự hủy hoại?",
    prompt: `${B1_BASE} A stickman inspecting a large whimsical hand-drawn brain with gears and lightbulbs, scratching head in deep curiosity. Centered standalone figure on pure white background.`
  },
  {
    shot: "17",
    theme: "Góc nhìn 1: Vấn đề giới hạn trên (The Upper Limit Problem)",
    prompt: `${B1_BASE} A stickman climbing a ladder and touching an invisible glass ceiling just above their head, unable to go higher. Centered standalone figure on pure white background.`
  },
  {
    shot: "18",
    theme: "Bộ điều nhiệt nội tâm (Psychological Thermostat)",
    prompt: `${B1_BASE} A hand-drawn circular thermostat dial on the wall with needle pointing to a safe middle zone, stickman looking at the dial. Centered standalone figure on pure white background.`
  },
  {
    shot: "19",
    theme: "Nhiệt độ cảm xúc tăng vọt vào vùng hạnh phúc mới lạ",
    prompt: `${B1_BASE} A stickman looking alarmed as a giant thermometer beside them rises high with steam ripples indicating unfamiliar intense joy. Centered standalone figure on pure white background.`
  },
  {
    shot: "20",
    theme: "Hạch hạnh nhân (Amygdala) rung chuông báo động nguy hiểm",
    prompt: `${B1_BASE} A stickman with a ringing alarm bell icon above their head, hands covering ears as sirens of panic sound. Centered standalone figure on pure white background.`
  },
  {
    shot: "21",
    theme: "Góc nhìn 2: Thuyết gắn bó và nỗi sợ bị bỏ rơi",
    prompt: `${B1_BASE} Two stickmen standing apart connected by a stretched, fragile string, one looking anxious and clutching their chest. Centered standalone figure on pure white background.`
  },
  {
    shot: "22",
    theme: "Thà tự tay phá hủy trước còn hơn ngồi chờ bị từ chối",
    prompt: `${B1_BASE} A stickman pushing down their own stacked wooden toy block tower with their own hand, preemptively ending the game. Centered standalone figure on pure white background.`
  },
  {
    shot: "23",
    theme: "Góc nhìn 3: Sự bất hòa nhận thức (Cognitive Dissonance)",
    prompt: `${B1_BASE} A stickman holding a two-sided balance scale where one side holds a certificate of praise and the other side holds self-doubt. Centered standalone figure on pure white background.`
  },
  {
    shot: "24",
    theme: "Mâu thuẫn giữa lời khen bên ngoài và tự ti bên trong",
    prompt: `${B1_BASE} A stickman being presented with a celebratory medal or trophy, but their internal shadow looks down nervously sweating. Centered standalone figure on pure white background.`
  },
  {
    shot: "25",
    theme: "Phá hỏng dự án để chứng minh niềm tin tiêu cực là đúng",
    prompt: `${B1_BASE} A stickman standing beside a cracked clay pot on the floor, shrugging shoulders as if saying 'I told you I was clumsy'. Centered standalone figure on pure white background.`
  },
  {
    shot: "26",
    theme: "Vòng lặp nghiệt ngã: Khát khao và nỗ lực đạt kết quả",
    prompt: `${B1_BASE} A stickman reaching upward toward a sparkling star on a pedestal with determination and hope. Centered standalone figure on pure white background.`
  },
  {
    shot: "27",
    theme: "Vòng lặp sụp đổ: Lo âu bùng phát và tự phá hoại",
    prompt: `${B1_BASE} A stickman sliding backward down a spiral slide with swirls of dizzy worry around their head. Centered standalone figure on pure white background.`
  },
  {
    shot: "28",
    theme: "Hậu quả: Lòng tin vào chính bản thân bị tổn thương",
    prompt: `${B1_BASE} A sad stickman sitting on a small stool looking at their own heart wrapped in bandages, deeply reflective. Centered standalone figure on pure white background.`
  },
  {
    shot: "29",
    theme: "Giải pháp: 3 bước can thiệp tâm lý hành vi",
    prompt: `${B1_BASE} A stickman standing confidently at a signpost with three arrows pointing upward marked '1', '2', '3'. Centered standalone figure on pure white background.`
  },
  {
    shot: "30",
    theme: "Bước 1: Nâng ngưỡng điều nhiệt - Dừng lại 30 giây",
    prompt: `${B1_BASE} A stickman holding up an open palm signaling 'Pause / 30 seconds', a peaceful clock face floating beside them. Centered standalone figure on pure white background.`
  },
  {
    shot: "31",
    theme: "Hít sâu, đặt tay lên ngực và dung nạp sự an ổn",
    prompt: `${B1_BASE} A calm stickman with eyes closed, taking a deep breath with one hand placed gently over their heart, gentle calm rings radiating. Centered standalone figure on pure white background.`
  },
  {
    shot: "32",
    theme: "Tự khẳng định: 'Mình đang an toàn và xứng đáng hạnh phúc'",
    prompt: `${B1_BASE} A stickman surrounded by a glowing protective circle of safety, smiling gently with arms relaxed at sides. Centered standalone figure on pure white background.`
  },
  {
    shot: "33",
    theme: "Bước 2: Bắt bài tiếng nói tự phá hoại (Catch the Saboteur)",
    prompt: `${B1_BASE} A stickman holding a magnifying glass or butterfly net catching a tiny mischievous scribble imp representing the Saboteur. Centered standalone figure on pure white background.`
  },
  {
    shot: "34",
    theme: "Chất vấn: Hành động này bảo vệ hay cướp đi tương lai?",
    prompt: `${B1_BASE} A stickman pointing a question mark wand at their own shadow, standing tall and rational. Centered standalone figure on pure white background.`
  },
  {
    shot: "35",
    theme: "Bước 3: Giao tiếp chân thật về sự yếu đuối",
    prompt: `${B1_BASE} A stickman opening a small door in their chest showing a warm glowing heart to a trusted friend. Centered standalone figure on pure white background.`
  },
  {
    shot: "36",
    theme: "Học cách nói thẳng cảm xúc bất an với người đồng hành",
    prompt: `${B1_BASE} Two stickmen sitting across a small table drinking tea, having a sincere, open-hearted conversation with clean speech bubbles. Centered standalone figure on pure white background.`
  },
  {
    shot: "37",
    theme: "Sự chân thành tước đi sức mạnh của bóng ma tâm lý",
    prompt: `${B1_BASE} A small dark shadow figure fading away and shrinking into tiny harmless dust as sunlight shines on the stickman. Centered standalone figure on pure white background.`
  },
  {
    shot: "38",
    theme: "Sống sót qua giông bão để đón nhận bình minh",
    prompt: `${B1_BASE} A stickman holding a closed umbrella, walking into warm morning sunshine with a rainbow arching overhead. Centered standalone figure on pure white background.`
  },
  {
    shot: "39",
    theme: "Can đảm bước qua giới hạn cũ và cho phép mình hạnh phúc",
    prompt: `${B1_BASE} A triumphant stickman joyfully taking a big leap forward over an old boundary line, arms raised in freedom. Centered standalone figure on pure white background.`
  },
  {
    shot: "40",
    theme: "Kêu gọi Like, Share và Đăng ký kênh CÕI VÔ THỨC",
    prompt: `${B1_BASE} A cheerful stickman gesturing towards a clean hand-drawn YouTube Subscribe button and ringing notification bell. Centered standalone figure on pure white background.`
  },
  {
    shot: "41",
    theme: "Để lại bình luận & Hẹn gặp lại trong video tới",
    prompt: `${B1_BASE} A friendly stickman waving goodbye warmly with one hand, holding a comment chat bubble with a pencil in the other. Centered standalone figure on pure white background.`
  }
];

fs.writeFileSync('scripts/scene_prompts.json', JSON.stringify(sceneConcepts, null, 2), 'utf8');
console.log(`Saved ${sceneConcepts.length} scene prompts to scripts/scene_prompts.json`);
