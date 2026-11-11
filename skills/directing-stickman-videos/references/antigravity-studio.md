# Antigravity Scene Studio & AI Image Workflow

Hệ thống mở rộng dành riêng cho môi trường Antigravity để tự động hóa việc tạo hình ảnh độc bản cho từng phân cảnh trong video người que (Autopilot Mode).

## 1. Tổng quan quy trình

Thay vì chỉ sử dụng 3 tư thế mẫu cố định (`character-pose-sheet-v6.png`), quy trình mới cho phép Antigravity tự động hóa toàn diện:
1. **Phân tích kịch bản**: Tách phụ đề `.srt` thành các phân cảnh có độ dài hợp lý.
2. **Khóa mỏ neo phong cách (Style Anchor)**: Áp dụng prompt cố định để đảm bảo nhân vật người que luôn đồng nhất nét vẽ xuyên suốt cả video:
   ```text
   Minimalist 2D hand-drawn stick figure, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, isolated on pure white background (#FFFFFF), no 3D shading, consistent line weight, cozy hand-drawn illustration style.
   ```
3. **Sinh ảnh tự động**: Sử dụng subagent `image-generator` của Antigravity để sinh ảnh tương ứng với từng hành động của phân cảnh đó và lưu vào `projects/<tên_dự_án>/scenes/`.
4. **Xử lý nền trong suốt (Alpha Channel)**: Sử dụng lệnh:
   ```bash
   node skills/directing-stickman-videos/scripts/scene-studio.mjs transparent <thư_mục_ảnh_hoặc_file>
   ```
   để chuyển nền trắng `#FFFFFF` thành PNG trong suốt mượt mà bằng thư viện `sharp`.
5. **Chuẩn Bố cục Thị giác Nâng cao (Hero-Centric & Anti-Clutter)**:
   - **Xóa bỏ chữ trùng lặp thừa thãi**: Chỉ giữ 1 Topic Badge ngắn gọn, nổi bật ở đầu khung hình (`size: 40`, gạch chân animated). Không chèn thêm các dòng phụ đề phụ ở giữa màn hình vì lời đọc đã có phụ đề bên dưới.
   - **Phóng to nhân vật Stickman**: Tối ưu crop chặt viền trong suốt và phóng to nhân vật lên `w: 580 - 650`, giúp nhân vật nổi bật, chiếm ~80-90% chiều cao an toàn của khung hình.
   - **Cân bằng hai cột (Two-Column Harmony)**:
     - Với cảnh có đạo cụ: Bên trái đặt Badge + Icon đạo cụ lớn (`w: 260`), bên phải đặt nhân vật chính (`w: 580`). Loại bỏ hoàn toàn khoảng trống chết ở giữa.
     - Với cảnh nội tâm/đặc tả: Đặt nhân vật chính ngay giữa khung hình (`x: 370, y: 90, w: 540`).
   - **Micro-animation**: Thêm keyframe trượt nhẹ khi xuất hiện (`y: 48 -> 30, alpha: 0.85 -> 1.0`) và xoay nghiêng nhẹ góc đạo cụ.
6. **Ghép âm thanh thuyết minh (Audio Muxing)**:
   Khi có file giọng đọc thực tế (`.mp3` hoặc `.m4a`), sử dụng lệnh 1 chạm để ghép vào video render:
   ```bash
   node skills/directing-stickman-videos/scripts/scene-studio.mjs mux-audio <path_to_film.mp4> <path_to_voice.m4a> [output.mp4]
   ```
