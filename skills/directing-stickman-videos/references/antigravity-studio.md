# Antigravity Scene Studio & AI Image Workflow

Hệ thống mở rộng dành riêng cho môi trường Antigravity để tự động hóa việc tạo hình ảnh độc bản cho từng phân cảnh trong video người que (Autopilot Mode).

## 1. Tổng quan quy trình

Thay vì chỉ sử dụng 3 tư thế mẫu cố định (`character-pose-sheet-v6.png`), quy trình mới cho phép Antigravity tự động hóa toàn diện:
1. **Phân tích kịch bản**: Tách phụ đề `.srt` thành các phân cảnh có độ dài hợp lý.
2. **Khóa mỏ neo phong cách 16:9 Full Frame (Style Anchor)**: Áp dụng prompt cố định để đảm bảo nhân vật người que đồng nhất nét vẽ và bố cục tràn toàn bộ khung hình 16:9:
   ```text
   Minimalist 2D hand-drawn stick figure animation style, 16:9 widescreen cinematic full-frame composition, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, full-frame illustrated background spreading across the entire 16:9 canvas, strictly 2D flat, no 3D shading, consistent line weight, cozy hand-drawn illustration style, no text, no typography.
   ```
3. **Sinh ảnh 16:9 tự động qua Agnes AI**: Mặc định tạo ảnh ở độ phân giải Full HD **`1920x1080`** (cấu hình qua `AGNES_IMAGE_SIZE` trong `.env`) bằng lệnh:
   ```bash
   node skills/directing-stickman-videos/scripts/scene-studio.mjs generate-shot <output_png> "<mô_tả_cảnh>"
   ```
   hoặc `agnes-media.mjs` và lưu vào `projects/<tên_dự_án>/scenes/`.
4. **Chuẩn hoá ảnh Full Frame 16:9**: Sử dụng lệnh:
   ```bash
   node skills/directing-stickman-videos/scripts/scene-studio.mjs fullframe <file> [output_file]
   ```
   để đảm bảo ảnh đạt chuẩn `1920x1080` tràn viền (hoặc dùng `transparent` nếu cần tách nền trắng trên canvas 16:9).
5. **Chuẩn Bố cục Thị giác Full Frame 16:9 (`buildPureCinematicLayout`)**:
   - **Tràn toàn bộ khung hình video**: Mỗi ảnh phân cảnh được đặt ở tọa độ `x: 0, y: 0, w: 1280, h: 720, fit: 'cover'` trên design plane (tự động scale sắc nét ra `1280x720` hoặc `1920x1080`), loại bỏ hoàn toàn viền trống hai bên trái/phải.
   - **Không chèn chữ thừa trong khung ảnh**: Giữ khung hình sạch sẽ, chỉ hiển thị phụ đề đồng bộ ở cạnh dưới.
   - **Micro-animation**: Hiệu ứng fade-in mượt mà (`alpha: 0.9 -> 1.0`) giữa các phân cảnh.
6. **Ghép âm thanh thuyết minh (Audio Muxing)**:
   Khi có file giọng đọc thực tế (`.mp3` hoặc `.m4a`), sử dụng lệnh 1 chạm để ghép vào video render:
   ```bash
   node skills/directing-stickman-videos/scripts/scene-studio.mjs mux-audio <path_to_film.mp4> <path_to_voice.m4a> [output.mp4]
   ```
