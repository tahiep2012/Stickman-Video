# Luồng Khởi Động 5 Bước (Tâm Lý Học · Triết Lý · Kỹ Năng Sống)

Quy trình khởi động chuẩn cho kênh giải thích **Tâm Lý Học, Triết Lý và Kỹ Năng Sống** bằng hoạt hình người que (Stickman Animation).

Khi skill `directing-stickman-videos` được khởi động (và người dùng chưa chỉ định sẵn toàn bộ 5 thông số bên dưới), AI **BẮT BUỘC** dẫn người dùng đi tuần tự qua từng bảng lựa chọn dưới đây (sử dụng `ask_question` hoặc bảng lựa chọn đánh số rõ ràng, **chỉ hiện từng bảng một**, chờ người dùng chọn rồi mới sang bảng tiếp theo).

---

## Bảng 1 · Chọn Ngách Nội Dung

Hiển thị ngay khi khởi động skill với đúng 3 mục:
1. **Tâm Lý Học** *(Hiệu ứng tâm lý, hành vi con người, cảm xúc, mối quan hệ, thao túng tâm lý...)*
2. **Triết Lý** *(Chủ nghĩa Khắc kỷ, Thiền, triết lý sống, tư duy phản biện, ý nghĩa cuộc sống...)*
3. **Kỹ Năng Sống** *(Kỷ luật bản thân, giao tiếp tinh tế, quản lý thời gian, vượt qua trì hoãn, kiểm soát cảm xúc...)*

---

## Bảng 2 · Quét Dữ Liệu Trực Tuyến & Đề Xuất Chủ Đề

Ngay sau khi người dùng chọn 1 mục ở Bảng 1:
1. **Bắt buộc gọi `search_web`** để quét xu hướng mới nhất, các chủ đề đang được quan tâm và các đề tài giá trị bền vững (Evergreen) liên quan đến ngách vừa chọn.
2. Tổng hợp và trình bày **5–6 chủ đề hấp dẫn nhất** để người dùng chọn (mỗi chủ đề gồm: *Tiêu đề gợi mở tò mò + Góc nhìn cốt lõi + Phân loại Trend / Evergreen*).
3. Cho phép người dùng chọn 1 chủ đề từ danh sách hoặc nhập chủ đề riêng.

---

## Bảng 3 · Chọn Phong Cách Nhân Vật (Visual Style)

Sau khi người dùng chọn chủ đề, hiển thị danh sách phong cách nhân vật trong bộ skill (đưa nhân vật thương hiệu độc quyền `B6` lên vị trí số 1):

### Nhóm gợi ý hàng đầu cho kênh Giải thích / Triết lý / Tâm lý (Mode B · Autopilot)
1. **B6 · Ink Traveler (Người Lữ Hành Khăn Choàng)** *(Khuyên dùng số 1 — Thương hiệu độc quyền của kênh)* — Nét vẽ tay tối giản Minimal Line Art với bộ **Character DNA khóa cứng** (đầu tròn trắng, kính tròn mảnh, áo choàng trắng tối giản, **khăn choàng cam đất độc bản**; toàn bộ nhân vật phụ chỉ vẽ đen trắng thuần để khóa nhận diện 0.5 giây). Khi chọn `B6`, **BẮT BUỘC** đọc và áp dụng nguyên văn chuẩn DNA từ [`references/b6-ink-traveler.md`](b6-ink-traveler.md).
2. **B1 · Minimal Line Art** — Nét mực vẽ tay người que tối giản truyền thống, sạch sẽ, dễ theo dõi lập luận.
3. **B2 · Colorful Hand-Drawn** — Vẽ tay màu sắc dịu nhẹ trên nền giấy kem, sâu lắng & chữa lành.
4. **B5 · Character Explainer** — Có 1 nhân vật dẫn chuyện đặc trưng đứng thuyết trình kết hợp người que minh họa.

### Các phong cách khác trong bộ skill
5. **B3 · Retro TV** — Phong cách TV cổ điển nền tối, bí ẩn.
6. **B4 · Survival Thriller** — Phong cách kịch tính nền tối, găng tay trắng.
7. **A1 · Classic Black & White** — Đen trắng cổ điển (`Light` hoặc `Dark`) kèm điểm nhấn màu nổi.
8. **A2 · Modern Pop (Beanie Zeke)** — Nhân vật mũ len đỏ, áo vàng (`2A` Tech Studio hoặc `2B` Cinematic Story).
9. **A3 · Prehistoric Cave** — Hang động tiền sử hài hước châm biếm.
10. **A4 · Cozy Storytelling** — Hoạt hình 2D ấm áp đời thường nhiều bối cảnh.
11. **A5 · Historical Cartoon** — Hoạt hình lịch sử đổ bóng cel-shaded.
12. **A6 · Amber Noir** — Phong cách Noir ánh đèn hổ phách tương phản bóng tối sâu.

---

## Bảng 4 · Chọn Chế Độ Vận Hành (Execution Mode)

Sau khi chọn phong cách nhân vật, hiển thị 2 lựa chọn:
1. **Semi-Auto (Bán tự động — Khuyên dùng)**: Tự động nghiên cứu, viết kịch bản, phân cảnh và tạo hình ảnh toàn bộ các cảnh → **DỪNG LẠI** để người dùng xem lại (review) hình ảnh từng cảnh (qua ảnh lưới Contact Sheet + danh sách từng file). Người dùng có thể yêu cầu vẽ lại các cảnh chưa ưng; khi người dùng xác nhận duyệt ảnh → tự động chạy toàn bộ các bước còn lại (giọng đọc, phụ đề, render video MP4).
2. **Auto (Tự động 100%)**: Sau khi xong Bảng 5, tự động thực thi xuyên suốt không dừng từ nghiên cứu → kịch bản → phân cảnh → vẽ ảnh → giọng đọc & phụ đề → xuất video MP4 hoàn chỉnh.

---

## Bảng 5 · Chọn Kích Thước Khung Hình Video (Aspect Ratio)

Sau khi chọn chế độ vận hành, hiển thị 2 lựa chọn:
1. **`16:9` (Video ngang — YouTube / Full HD `1920x1080`)**:
   - Hình ảnh tạo ra: **Full Frame `1920x1080`** tràn toàn bộ khung hình video.
   - Quy tắc nhịp phân cảnh: **8 – 12 giây / cảnh**.
2. **`9:16` (Video dọc — YouTube Shorts / TikTok / Reels `1080x1920`)**:
   - Hình ảnh tạo ra: **Full Frame `1080x1920`** tràn toàn bộ khung hình video.
   - Quy tắc nhịp phân cảnh: **3 – 5 giây / cảnh**.

---

## Giai Đoạn Thực Thi (Sau Khi Hoàn Tất 5 Bảng)

### Bước 1 · Nghiên Cứu Chuyên Sâu & Viết Kịch Bản Cuốn Hút
- Gọi `search_web` để thu thập dẫn chứng thực tế, nghiên cứu tâm lý học, trích dẫn triết học chính xác (không bịa đặt số liệu).
- Viết kịch bản có nhịp điệu giữ chân người xem cao (High-Retention Script):
  1. **Golden Hook (Mở đầu gây tò mò)**: Một nghịch lý, câu hỏi chạm đúng nỗi đau hoặc tình huống ai cũng từng trải qua ngay trong 3–5 giây đầu.
  2. **Phá vỡ lầm tưởng**: Lật ngược suy nghĩ thông thường của số đông để tạo xung đột nhận thức.
  3. **Giải mã cơ chế / Bản chất**: Phân tích sâu cơ chế tâm lý, triết lý hoặc quy luật hành vi bằng ẩn dụ trực quan dễ hình dung.
  4. **Giải pháp & Chuyển hóa thực tế**: Đưa ra góc nhìn mới hoặc hành động cụ thể áp dụng được ngay.
  5. **Đúc kết & Câu hỏi mở**: Một câu chốt đáng nhớ kèm câu hỏi gợi thảo luận dưới phần bình luận.
- Lưu kịch bản vào `projects/<slug>/script.md`.

### Bước 2 · Tự Động Phân Cảnh Theo Đúng Nhịp Thời Lượng
- Chia kịch bản thành các phân cảnh (`scenes_plan.json`), gắn kèm lời thoại, thời lượng dự kiến và mô tả hình ảnh (Visual Prompt) tương ứng:
  - **Nếu chọn `9:16`**: Bắt buộc mỗi phân cảnh kéo dài từ **3 đến 5 giây** (nhịp nhanh, thay đổi hình ảnh liên tục để giữ chân người xem video ngắn).
  - **Nếu chọn `16:9`**: Bắt buộc mỗi phân cảnh kéo dài từ **8 đến 12 giây** (nhịp vừa phải, giàu chiều sâu để người xem thưởng thức nội dung và hình ảnh minh họa).
- Mỗi mô tả cảnh phải mang phong cách đã chọn ở **Bảng 3**, ghi rõ bố cục tràn viền theo đúng khung hình (`16:9 widescreen cinematic full-frame composition` hoặc `9:16 vertical cinematic full-frame composition`) và giữ nhất quán nhân vật xuyên suốt.

### Bước 3 · Tạo Hình Ảnh Full Frame Qua Agnes AI
- Dùng `skills/directing-stickman-videos/scripts/agnes-media.mjs` (hoặc `scene-studio.mjs generate-shot`) với cờ `--aspect 16:9` (mặc định `1920x1080`) hoặc `--aspect 9:16` (`1080x1920`) và `normalize: false` để ảnh lấp đầy 100% khung hình.
- Lưu toàn bộ ảnh vào `projects/<slug>/scenes/shot_01.png`, `shot_02.png`, ...
- Kiểm tra tính duy nhất của ảnh bằng `scene-studio.mjs validate-unique`.

### Bước 4 · Cổng Kiểm Duyệt Ảnh (Chỉ Áp Dụng Khi Chọn `Semi-Auto`)
- **Nếu chế độ là `Semi-Auto`**:
  1. Chạy lệnh tạo bảng ảnh xem trước:
     ```bash
     node skills/directing-stickman-videos/scripts/scene-studio.mjs contact-sheet projects/<slug>/scenes projects/<slug>/output/review-contact-sheet.png
     ```
  2. Hiển thị cho người dùng file `review-contact-sheet.png` kèm bảng danh sách từng cảnh (`Cảnh 01` → `Cảnh NN`: lời thoại + link file ảnh `shot_XX.png`).
  3. **DỪNG LẠI** và hỏi người dùng:
     - Duyệt toàn bộ để chạy tiếp tự động ra video, **hoặc**
     - Chọn số thứ tự các cảnh muốn vẽ lại (kèm góp ý sửa).
  4. Nếu người dùng yêu cầu sửa cảnh nào → chỉ vẽ lại đúng các cảnh đó, cập nhật lại `review-contact-sheet.png` và trình duyệt lại cho đến khi người dùng xác nhận duyệt.
- **Nếu chế độ là `Auto`**: Bỏ qua bước dừng và chạy thẳng sang Bước 5.

### Bước 5 · Tạo Giọng Đọc (CIT Voice Studio), Phụ Đề & Render Video Hoàn Chỉnh
- **Tự động kết nối CIT Voice Studio (`http://127.0.0.1:8001`)**:
  - Gửi yêu cầu `GET /health` để kiểm tra máy chủ CIT Voice Studio trên máy.
  - Khi CIT đang mở, tự động gọi `python scripts/generate_voice_cit.py` hoặc `node skills/directing-stickman-videos/scripts/scene-studio.mjs voice-cit` để tạo trọn gói âm thanh phòng thu **48.000 Hz (`narration.mp3`)** và file phụ đề đồng bộ chuẩn từng mili-giây **(`input.srt`)** với giọng đọc **`I Thought`** (hoặc giọng đã cấu hình trong `.env`). Xem chi tiết tại [`references/cit-voice-studio.md`](cit-voice-studio.md).
  - *(Phương án dự phòng: Nếu CIT Voice Studio chưa mở, thông báo người dùng bật phần mềm hoặc sử dụng Edge-TTS).*
- Xây dựng `projects/<slug>/project.json` theo đúng khung hình đã chọn (`1920x1080` cho `16:9` hoặc `1080x1920` cho `9:16`), sử dụng `buildPureCinematicLayout` để mọi hình ảnh hiển thị **Full Frame (`fit: 'cover'`)** không có viền thừa.
- Render video hoàn chỉnh bằng `autopilot.mjs` (Mode B) hoặc `director-video-pipeline.mjs` (Mode A), ghép âm thanh phòng thu (`mux-audio`) và bàn giao file MP4 cuối cùng cho người dùng.
