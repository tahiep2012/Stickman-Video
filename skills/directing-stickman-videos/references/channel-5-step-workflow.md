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
1. **Semi-Auto (Bán tự động — Khuyên dùng số 1)**: Quy trình kiểm soát chất lượng 2 chặng nghiêm ngặt (**Two-Gate Review System**):
   - **Cổng Kiểm Duyệt 1 (Script Review Gate)**: AI nghiên cứu dữ liệu chuyên sâu và viết kịch bản chi tiết → **DỪNG LẠI** để người dùng xem lại (review) toàn bộ kịch bản, cấu trúc chương hồi và câu từ. Người dùng có thể yêu cầu chỉnh sửa, thêm bớt ý; chỉ khi người dùng bấm xác nhận duyệt kịch bản thì AI mới tiến hành các bước tiếp theo.
   - **Cổng Kiểm Duyệt 2 (Contact Sheet Review Gate)**: Sau khi duyệt kịch bản, AI tự động thu âm giọng đọc phòng thu CIT Voice Studio (Văn Hải) và tạo toàn bộ hình ảnh phân cảnh Full Frame qua Agnes AI → **DỪNG LẠI** lần thứ hai để người dùng xem lại ảnh lưới Contact Sheet. Người dùng có thể yêu cầu vẽ lại từng cảnh chưa ưng ý; khi người dùng xác nhận duyệt ảnh → AI mới render video MP4 cuối cùng.
2. **Auto (Tự động 100%)**: Sau khi xong Bảng 5, tự động thực thi xuyên suốt không dừng từ nghiên cứu → kịch bản → thu âm giọng đọc CIT & phụ đề → vẽ ảnh phân cảnh → render ra video MP4 hoàn chỉnh.

---

## Bảng 5 · Chọn Kích Thước Khung Hình & Thời Lượng Video (Aspect Ratio & Target Duration)

Sau khi chọn chế độ vận hành, hiển thị 2 lựa chọn với quy chuẩn thời lượng rõ ràng:
1. **`16:9` (Video dài chuẩn YouTube / Full HD `1920x1080`)**:
   - **Thời lượng chuẩn**: **8 – 12 phút** (Kịch bản chuyên sâu đa tầng, nghiên cứu kỹ lưỡng tâm lý/triết học/kinh tế, cấu trúc chương hồi rõ ràng, dung lượng khoảng **1.200 – 1.800 từ**).
   - **Quy tắc nhịp phân cảnh**: **8 – 12 giây / cảnh** (Khoảng 40 – 60 cảnh minh họa xuyên suốt video).
   - **Hình ảnh tạo ra**: **Full Frame `1920x1080`** tràn toàn bộ khung hình không có vệt đen viền thừa (`fit: 'cover'`).
2. **`9:16` (Video ngắn YouTube Shorts / TikTok / Reels / Full HD `1080x1920`)**:
   - **Thời lượng chuẩn**: **1 – 2 phút** (Kịch bản cô đọng, dồn dập, đánh trúng tâm lý người xem trong 3 giây đầu, dung lượng khoảng **150 – 300 từ**).
   - **Quy tắc nhịp phân cảnh**: **3 – 5 giây / cảnh** (Khoảng 15 – 30 cảnh chuyển động liên tục giữ chân người xem).
   - **Hình ảnh tạo ra**: **Full Frame `1080x1920`** tràn toàn bộ chiều dọc khung hình.

---

## Giai Đoạn Thực Thi (Sau Khi Hoàn Tất 5 Bảng)

### Bước 1 · Nghiên Cứu Chuyên Sâu & Viết Kịch Bản Chuẩn Thời Lượng
- Gọi `search_web` để thu thập dẫn chứng thực tế, nghiên cứu tâm lý học thực nghiệm, trích dẫn triết học chính xác (tuyệt đối không bịa đặt số liệu hay tên tác giả).
- Viết kịch bản có nhịp điệu giữ chân người xem cao (High-Retention Script) đúng quy chuẩn thời lượng:
  - **Nếu 16:9 (Video dài 8–12 phút)**: Kịch bản 1.200 – 1.800 từ, bố cục 5–7 chương/hồi phân tích đa góc nhìn, có câu chuyện minh họa thực tế, bài học ứng dụng cụ thể.
  - **Nếu 9:16 (Video ngắn 1–2 phút)**: Kịch bản 150 – 300 từ, vào thẳng vấn đề ngay trong 3 giây đầu, nhịp dồn dập, đúc kết sắc bén.
- Bố cục 5 giai đoạn cảm xúc (*5-Stage Heartbeat Engine*):
  1. **Golden Hook (Mở đầu gây tò mò)**: Nghịch lý hoặc câu hỏi đánh trúng nỗi đau người xem.
  2. **Phá vỡ lầm tưởng**: Lật ngược suy nghĩ thông thường của số đông để tạo xung đột nhận thức.
  3. **Giải mã cơ chế / Bản chất**: Phân tích sâu cơ chế tâm lý, triết lý hoặc quy luật hành vi bằng ẩn dụ trực quan.
  4. **Giải pháp & Chuyển hóa thực tế**: Góc nhìn mới, hành động cụ thể áp dụng được ngay.
  5. **Đúc kết & Kêu gọi tương tác**: Câu chốt đáng nhớ, gợi thảo luận sôi nổi và kêu gọi đăng ký kênh đồng hành cùng nhân vật thương hiệu.
- Lưu kịch bản vào `projects/<slug>/script.md`.

### Bước 2 · CỔNG KIỂM DUYỆT 1: DUYỆT KỊCH BẢN (Chỉ Áp Dụng Khi Chọn `Semi-Auto`)
- **Nếu chế độ là `Semi-Auto`**:
  1. Trình kịch bản hoàn chỉnh cho người dùng xem xét nội dung, bố cục chương hồi, văn phong và thông điệp.
  2. **BẮT BUỘC DỪNG LẠI**, tạo artifact review kịch bản hoặc gửi nội dung trực tiếp, chờ người dùng phản hồi.
  3. Nếu người dùng yêu cầu chỉnh sửa → tiếp thu và hoàn thiện lại kịch bản cho đến khi người dùng xác nhận duyệt: *"Kịch bản duyệt rồi, làm tiếp đi em"*.
- **Nếu chế độ là `Auto`**: Tự động chuyển thẳng sang Bước 3.

### Bước 3 · Tạo Giọng Đọc Phòng Thu (CIT Voice Studio) & File Phụ Đề SRT
- **Tự động kết nối CIT Voice Studio (`http://127.0.0.1:8001`)**:
  - Gửi yêu cầu `GET /health` để kiểm tra phần mềm đã sẵn sàng.
  - Tự động gọi `python scripts/generate_voice_cit.py` hoặc `node skills/directing-stickman-videos/scripts/scene-studio.mjs voice-cit` để tạo trọn gói âm thanh phòng thu **48.000 Hz (`narration.mp3`)** và file phụ đề đồng bộ chuẩn từng mili-giây **(`input.srt`)** với giọng đọc mặc định **`Văn Hải`** (hoặc giọng đã cấu hình trong `.env`). Xem chi tiết tại [`references/cit-voice-studio.md`](cit-voice-studio.md).
  - Lấy thời lượng thực tế từ phản hồi để làm căn cứ khớp mốc thời gian từng cảnh.
  - *(Phương án dự phòng: Nếu CIT Voice Studio chưa mở, thông báo người dùng bật phần mềm hoặc sử dụng Edge-TTS).*

### Bước 4 · Phân Cảnh & Tạo Hình Ảnh Full Frame Qua Agnes AI
- Phân chia kịch bản thành các cảnh theo đúng nhịp thời lượng đã chọn:
  - **`16:9`**: **8 đến 12 giây / cảnh** (Khoảng 40 – 60 cảnh cho video 8–12 phút).
  - **`9:16`**: **3 đến 5 giây / cảnh** (Khoảng 15 – 30 cảnh cho video 1–2 phút).
- Tạo từng hình ảnh qua Agnes AI theo phong cách đã chọn ở Bảng 3 (đặc biệt khóa chặt chuẩn **B6 Ink Traveler DNA** và màu sắc độc bản nếu chọn B6).
- Lưu toàn bộ ảnh vào `projects/<slug>/scenes/shot_01.png`, `shot_02.png`, ...
- Kiểm tra tính độc bản bằng `scene-studio.mjs validate-unique` để đảm bảo 100% không có cảnh nào bị trùng lặp.

### Bước 5 · CỔNG KIỂM DUYỆT 2: DUYỆT HÌNH ẢNH PHÂN CẢNH (Chỉ Áp Dụng Khi Chọn `Semi-Auto`)
- **Nếu chế độ là `Semi-Auto`**:
  1. Chạy lệnh tạo bảng ảnh xem trước tổng hợp (Contact Sheet):
     ```bash
     node skills/directing-stickman-videos/scripts/scene-studio.mjs contact-sheet projects/<slug>/scenes projects/<slug>/output/review-contact-sheet.png
     ```
  2. Hiển thị cho người dùng file `review-contact-sheet.png` kèm bảng đối chiếu thời gian, lời bình và hình ảnh từng cảnh.
  3. **BẮT BUỘC DỪNG LẠI** và hỏi người dùng:
     - Xác nhận duyệt toàn bộ để render video hoàn thiện, **hoặc**
     - Chọn số thứ tự các cảnh muốn vẽ lại (kèm mô tả yêu cầu điều chỉnh).
  4. Nếu người dùng yêu cầu vẽ lại cảnh nào → vẽ lại đúng các cảnh đó, cập nhật lại `review-contact-sheet.png` và trình duyệt lại cho đến khi người dùng xác nhận duyệt.
- **Nếu chế độ là `Auto`**: Tự động chuyển thẳng sang Bước 6.

### Bước 6 · Xây Dựng Cấu Hình Chuyển Động & Render Video Hoàn Chỉnh
- Xây dựng `projects/<slug>/project.json` chuẩn khung hình đã chọn (`1920x1080` cho `16:9` hoặc `1080x1920` cho `9:16`), áp dụng hiệu ứng chuyển động máy quay Subpixel Ken Burns tinh tế (Pan/Zoom mượt mà, không giật lag).
- Đảm bảo toàn bộ hình ảnh hiển thị **Full Frame (`fit: 'cover'`)** 100% không viền đen.
- Render video hoàn chỉnh bằng `autopilot.mjs` (Mode B) hoặc `director-video-pipeline.mjs` (Mode A), ghép âm thanh phòng thu 48kHz (`mux-audio`) và phụ đề đồng bộ.
- Bàn giao sản phẩm cuối cùng `projects/<slug>/output/film.mp4` cho người dùng.
