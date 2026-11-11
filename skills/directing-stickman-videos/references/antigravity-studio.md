# Antigravity Scene Studio & AI Image Workflow

Hệ thống mở rộng dành riêng cho môi trường Antigravity để tự động hóa việc tạo hình ảnh độc bản cho từng phân cảnh trong video người que (Autopilot Mode).

## 1. Tổng quan quy trình

Thay vì chỉ sử dụng 3 tư thế mẫu cố định (`character-pose-sheet-v6.png`), quy trình mới cho phép Antigravity tự động hóa toàn diện:
1. **Phân tích kịch bản**: Tách phụ đề `.srt` thành các phân cảnh có độ dài hợp lý (3–6 giây/cảnh).
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
5. **Ráp và Render**: Engine Autopilot (`scripts/autopilot.mjs`) tự động đọc các ảnh này dưới dạng layer `{"type": "image", "path": "scenes/shot_XX.png"}` và render ra video MP4 hoàn chỉnh.
