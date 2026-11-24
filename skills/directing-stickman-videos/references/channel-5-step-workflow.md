# Luồng Khởi Động 6 Bước Đa Kênh VN & EN (Tâm Lý Học · Triết Lý · Kỹ Năng Sống)

Quy trình khởi động chuẩn cho hệ thống **2 kênh song song (Tiếng Việt & Tiếng Anh)** về **Tâm Lý Học, Triết Lý và Kỹ Năng Sống** bằng hoạt hình vẽ tay tối giản (Stickman / Editorial Line Art Animation).

Khi skill `directing-stickman-videos` được khởi động (và người dùng chưa chỉ định sẵn toàn bộ thông số bên dưới), AI **BẮT BUỘC** dẫn người dùng đi tuần tự qua từng bảng lựa chọn dưới đây (sử dụng `ask_question` hoặc bảng lựa chọn đánh số rõ ràng, **chỉ hiện từng bảng một**, chờ người dùng chọn rồi mới sang bảng tiếp theo).

---

## Bảng 0 · Chọn Kênh & Ngôn Ngữ Sản Xuất (Dual-Channel Selector)

Hiển thị đầu tiên ngay khi khởi động skill với đúng 3 lựa chọn:

1. **🇻🇳 Kênh Tiếng Việt (`vi`)** — Lưu tại `projects/vi/<slug>/`
   - **Ngôn ngữ**: Kịch bản, phụ đề `input.srt` và siêu dữ liệu `METADATA.md` 100% bằng **Tiếng Việt**.
   - **Giọng đọc**: CIT Voice Studio — **Model `VieNeu-TTS`** (mặc định giọng `Văn Hải`, 48kHz).
   - **Nhân vật mặc định gợi ý**: **`B6 · Ink Traveler` (Khăn choàng màu cam đất / Terracotta-Amber)**.
2. **🇺🇸 Kênh Tiếng Anh (`en`)** — Lưu tại `projects/en/<slug>/`
   - **Ngôn ngữ**: Kịch bản viết thẳng bằng **Tiếng Anh bản xứ (Native Storytelling)**, phụ đề `input.srt` và `METADATA.md` chuẩn SEO thị trường US/UK/Global.
   - **Giọng đọc**: CIT Voice Studio — **Model `Kokoro`** (chọn giọng tiếng Anh trực tiếp từ Kokoro trên CIT Voice Studio).
   - **Nhân vật mặc định gợi ý**: **`B6-EN · Slate Ink Traveler` (Khăn choàng màu xanh lam trầm / Muted Slate-Blue)** — tạo nhận diện thương hiệu độc lập hoàn toàn với kênh Tiếng Việt.
3. **🌐 Chuyển Thể Chủ Đề Giữa 2 Kênh (`adapt`: `VN → EN` hoặc `EN → VN`)**
   - Chọn 1 chủ đề đã triển khai thành công ở kênh bên kia (đọc từ `projects/topics-registry.json`) để bản địa hóa kịch bản sang ngôn ngữ đích.
   - Sinh giọng đọc mới trên đúng model của CIT Voice Studio (`Kokoro` cho `en` / `VieNeu-TTS` cho `vi`) và vẽ bộ phân cảnh mới chuẩn màu khăn nhận diện của kênh đích (`B6-EN` xanh lam trầm cho `en` / `B6` cam đất cho `vi`) → **100% tách biệt hình ảnh & âm thanh, an toàn tuyệt đối với chính sách kiếm tiền YouTube/Facebook**.

---

## Bảng 1 · Chọn Ngách Nội Dung *(Bỏ qua nếu chọn `adapt`)*

Hiển thị với đúng 3 mục:
1. **Tâm Lý Học (Psychology)** *(Hiệu ứng tâm lý, hành vi con người, cảm xúc, mối quan hệ, thao túng tâm lý...)*
2. **Triết Lý (Philosophy)** *(Chủ nghĩa Khắc kỷ Stoicism, Thiền, triết lý sống, tư duy phản biện, ý nghĩa cuộc sống...)*
3. **Kỹ Năng Sống (Life Skills)** *(Kỷ luật bản thân, giao tiếp tinh tế, quản lý thời gian, vượt qua trì hoãn, kiểm soát cảm xúc...)*

---

## Bảng 2 · Quét Dữ Liệu Trực Tuyến & Đề Xuất Chủ Đề (Chống Trùng Theo Từng Kênh)

Ngay sau khi người dùng chọn mục ở Bảng 1:
1. **Kiểm tra Sổ Đăng Ký Đề Tài Theo Kênh (Per-Channel Topic Registry Gate — Khóa Trùng Lặp Nội Bộ Kênh 100%)**:
   - AI **BẮT BUỘC** đọc file `projects/topics-registry.json` và quét thư mục tương ứng (`projects/vi/` hoặc `projects/en/`).
   - **Chỉ đưa vào danh sách loại trừ (Blacklist) các chủ đề đã làm trong CÙNG KÊNH (`channel === "vi"` hoặc `channel === "en"`)**.
   - Các chủ đề đã làm ở kênh `vi` **VẪN ĐƯỢC PHÉP** đề xuất hoặc chuyển thể sang kênh `en` (và ngược lại) mà không xung đột chính sách.
2. **Quét dữ liệu trực tuyến qua `search_web`**:
   - Quét xu hướng mới nhất và các đề tài Evergreen bằng ngôn ngữ tương ứng của kênh (Tiếng Việt cho `vi`, Tiếng Anh cho `en`).
3. **Đề xuất 5–6 chủ đề MỚI TINH hấp dẫn nhất**:
   - Trình bày 5–6 chủ đề hoàn toàn mới cho kênh hiện tại (mỗi chủ đề gồm: *Tiêu đề gợi mở tò mò + Góc nhìn cốt lõi + Phân loại Trend / Evergreen*).
   - Nếu đang làm kênh `en`, có thể gợi ý thêm 1–2 chủ đề tâm đắc đã thành công trên kênh `vi` để anh cân nhắc chuyển thể.
   - Cho phép người dùng chọn 1 chủ đề từ danh sách hoặc nhập chủ đề riêng.
4. **Tự động lưu vết vào Sổ Đăng Ký Đề Tài (Auto-Register)**:
   - Lưu thông tin dự án (kèm `"channel": "vi" | "en"`, `"language": "vi" | "en"`, `"project_path": "projects/<vi|en>/<slug>"`) vào `projects/topics-registry.json`.

---

## Bảng 3 · Chọn Phong Cách Nhân Vật (Visual Style)

Hiển thị danh sách phong cách nhân vật (tự động ưu tiên nhân vật thương hiệu đúng với kênh đã chọn ở Bảng 0):

### Nhóm gợi ý hàng đầu cho kênh Giải thích / Triết lý / Tâm lý (Mode B · Autopilot)
1. **B6 · Ink Traveler — Khăn Cam Đất (`Terracotta-Amber`)** *(Khuyên dùng số 1 cho Kênh Tiếng Việt `vi`)* — Nét vẽ tay tối giản Minimal Line Art với Character DNA khóa cứng (đầu tròn trắng, kính tròn mảnh, áo choàng trắng tối giản, **khăn choàng len màu cam đất**; nhân vật phụ đen trắng thuần).
2. **B6-EN · Slate Ink Traveler — Khăn Xanh Lam Trầm (`Muted Slate-Blue`)** *(Khuyên dùng số 1 cho Kênh Tiếng Anh `en`)* — Giữ nguyên nét vẽ tinh tế của dòng `B6`, nhưng đổi màu khăn đặc trưng sang **xanh lam trầm (muted slate-blue)** để tạo nhận diện thương hiệu quốc tế tách biệt 100% với kênh Tiếng Việt.
   - Khi chọn `B6` hoặc `B6-EN`, **BẮT BUỘC** đọc và áp dụng nguyên văn chuẩn DNA từ [`references/b6-ink-traveler.md`](b6-ink-traveler.md).
3. **B1 · Minimal Line Art** — Nét mực vẽ tay người que tối giản truyền thống, sạch sẽ.
4. **B2 · Colorful Hand-Drawn** — Vẽ tay màu sắc dịu nhẹ trên nền giấy kem, sâu lắng & chữa lành.
5. **B5 · Character Explainer** — Có 1 nhân vật dẫn chuyện đứng thuyết trình kết hợp người que minh họa.

### Các phong cách khác trong bộ skill
6. **B3 · Retro TV** — Phong cách TV cổ điển nền tối, bí ẩn.
7. **B4 · Survival Thriller** — Phong cách kịch tính nền tối, găng tay trắng.
8. **A1–A6 (Director Mode)** — `A1 Classic B&W`, `A2 Modern Pop`, `A3 Prehistoric Cave`, `A4 Cozy Storytelling`, `A5 Historical Cartoon`, `A6 Amber Noir`.

---

## Bảng 4 · Chọn Chế Độ Vận Hành (Execution Mode)

1. **Semi-Auto (Bán tự động — Khuyên dùng số 1)**: Quy trình kiểm soát chất lượng 2 cổng (**Two-Gate Review System**):
   - **Cổng Kiểm Duyệt 1 (Script Review Gate)**: AI viết kịch bản chi tiết đúng ngôn ngữ kênh (`vi` hoặc `en`) → **DỪNG LẠI** để người dùng duyệt kịch bản trước khi thu âm và vẽ ảnh.
   - **Cổng Kiểm Duyệt 2 (Contact Sheet Review Gate)**: Sau khi duyệt kịch bản, AI thu âm qua CIT Voice Studio và vẽ toàn bộ ảnh phân cảnh Full Frame qua Agnes AI → **DỪNG LẠI** lần 2 để người dùng xem ảnh lưới Contact Sheet và yêu cầu vẽ lại từng cảnh nếu cần trước khi render video.
2. **Auto (Tự động 100%)**: Tự động thực thi xuyên suốt không dừng từ nghiên cứu → kịch bản → thu âm CIT & phụ đề → vẽ ảnh → render video MP4 → xuất `METADATA.md`.

---

## Bảng 5 · Chọn Kích Thước Khung Hình & Thời Lượng Video (Aspect Ratio & Target Duration)

1. **`16:9` (Video dài chuẩn YouTube / Full HD `1920x1080`)**:
   - **Thời lượng chuẩn**: **8 – 12 phút** (~1.200 – 1.800 từ, nghiên cứu chuyên sâu, cấu trúc 5–7 chương hồi).
   - **Quy tắc nhịp phân cảnh**: **8 – 12 giây / cảnh** (~40 – 60 cảnh minh họa).
   - **Hình ảnh tạo ra**: **Full Frame `1920x1080`** tràn khung (`fit: 'cover'`).
2. **`9:16` (Video ngắn YouTube Shorts / TikTok / Reels / Full HD `1080x1920`)**:
   - **Thời lượng chuẩn**: **1 – 2 phút** (~150 – 300 từ, nhịp nhanh, giữ chân ngay 3 giây đầu).
   - **Quy tắc nhịp phân cảnh**: **3 – 5 giây / cảnh** (~15 – 30 cảnh).
   - **Hình ảnh tạo ra**: **Full Frame `1080x1920`** tràn khung dọc.

---

## Giai Đoạn Thực Thi (Sau Khi Hoàn Tất Các Bảng Lựa Chọn)

> Thư mục dự án luôn được lưu tách biệt theo kênh:
> - Kênh Tiếng Việt: `projects/vi/<slug>/`
> - Kênh Tiếng Anh: `projects/en/<slug>/`

### Bước 1 · Nghiên Cứu Chuyên Sâu & Viết Kịch Bản Chuẩn Ngôn Ngữ & Thời Lượng
- Gọi `search_web` thu thập dẫn chứng thực nghiệm, nghiên cứu tâm lý học, trích dẫn triết học chính xác (tuyệt đối không bịa đặt số liệu).
- Viết kịch bản có nhịp giữ chân cao theo **5-Stage Heartbeat Engine** (Golden Hook → Phá vỡ lầm tưởng → Giải mã cơ chế → Giải pháp thực tế → Đúc kết & Kêu gọi tương tác):
  - **Kênh `vi`**: Viết tiếng Việt tự nhiên, giàu cảm xúc, tối ưu nhịp ngắt hơi cho **VieNeu-TTS**.
  - **Kênh `en`**: Viết thẳng bằng **Tiếng Anh bản xứ tự nhiên** (idiomatic, concise storytelling, tránh câu dịch máy dài dòng), tối ưu nhịp phát âm cho **Kokoro TTS**.
- Lưu kịch bản vào `projects/<vi|en>/<slug>/script.md`.

### Bước 2 · CỔNG KIỂM DUYỆT 1: DUYỆT KỊCH BẢN (Khi Chọn `Semi-Auto`)
- Trình kịch bản hoàn chỉnh (kèm bản dịch tham khảo nhanh nếu người dùng cần đối chiếu kịch bản Tiếng Anh) và **BẮT BUỘC DỪNG LẠI** chờ người dùng duyệt.

### Bước 3 · Tạo Giọng Đọc Phòng Thu (CIT Voice Studio) & File Phụ Đề SRT (Kèm Chốt Kiểm Tra Model)
- Kết nối CIT Voice Studio cục bộ (`http://127.0.0.1:8001`) qua `GET /health`:
  - **Chốt Kiểm Tra Model-Ngôn Ngữ (Model-Language Guardrail)**:
    - **Kênh `vi` (`--lang vi`)**: Kiểm tra CIT Voice Studio đang chạy **Model `VieNeu-TTS`** (mặc định giọng `Văn Hải`). Nếu đang ở `Kokoro`, thông báo anh chuyển Model trên phần mềm sang `VieNeu-TTS` rồi chạy tiếp.
    - **Kênh `en` (`--lang en`)**: Kiểm tra CIT Voice Studio đang chạy **Model `Kokoro`** (tự động lấy danh sách giọng tiếng Anh từ `GET /voices` hoặc dùng giọng chỉ định qua `--voice` / `CIT_EN_VOICE`). Nếu phần mềm vẫn đang ở `VieNeu-TTS`, **tạm dừng và nhắc anh chuyển Model trên CIT Voice Studio sang Kokoro** rồi tiếp tục!
- Chạy lệnh thu âm tự động xuất `narration.mp3` (48kHz) và `input.srt` (khớp mili-giây):
  ```bash
  # Kênh Tiếng Việt (Model VieNeu-TTS)
  python scripts/generate_voice_cit.py --lang vi --script-file projects/vi/<slug>/script.md --project-dir projects/vi/<slug> --voice "Văn Hải"

  # Kênh Tiếng Anh (Model Kokoro)
  python scripts/generate_voice_cit.py --lang en --script-file projects/en/<slug>/script.md --project-dir projects/en/<slug> --voice auto
  ```
- Lấy `duration_seconds` thực tế làm căn cứ chia mốc thời gian từng cảnh.

### Bước 4 · Phân Cảnh & Tạo Hình Ảnh Full Frame Qua Agnes AI
- Chia cảnh theo nhịp (`16:9`: 8–12s/cảnh; `9:16`: 3–5s/cảnh).
- Tạo toàn bộ hình ảnh qua Agnes AI theo đúng DNA thương hiệu của kênh:
  - Kênh `vi`: `--style B6` (Khăn cam đất *muted terracotta-amber*).
  - Kênh `en`: `--style B6-EN` (Khăn xanh lam trầm *muted slate-blue*).
- Lưu vào `projects/<vi|en>/<slug>/scenes/shot_01.png`, `shot_02.png`, ... và kiểm tra tính độc bản (`validate-unique`).

### Bước 5 · CỔNG KIỂM DUYỆT 2: DUYỆT HÌNH ẢNH PHÂN CẢNH (Khi Chọn `Semi-Auto`)
- Tạo bảng ảnh tổng hợp `projects/<vi|en>/<slug>/output/review-contact-sheet.png` và **BẮT BUỘC DỪNG LẠI** để người dùng duyệt hoặc yêu cầu vẽ lại các cảnh chưa ưng ý.

### Bước 6 · Xây Dựng Cấu Hình Chuyển Động & Render Video Hoàn Chỉnh (Không Phụ Đề Cứng)
- **Zero Burned-in Subtitles Invariance**: Luôn đặt `hideCaptions: true` và `burnSubtitles: false` trong `project.json` — canvas video sạch 100%, xuất phụ đề mềm đồng bộ `input.srt` riêng để tải lên YouTube.
- Xây dựng `projects/<vi|en>/<slug>/project.json` chuẩn khung hình (`1920x1080` hoặc `1080x1920`, `style: "B6"` hoặc `"B6-EN"`), chuyển động Subpixel Ken Burns mượt mà, tràn khung `fit: 'cover'`.
- Render video `output/film.mp4` qua `autopilot.mjs`.

### Bước 7 · Tự Động Xuất Trọn Gói Siêu Dữ Liệu Đăng Bài (`METADATA.md` Invariant)
- Ngay khi render xong `film.mp4`, AI **BẮT BUỘC TỰ ĐỘNG TẠO FILE** `projects/<vi|en>/<slug>/METADATA.md` (và bản sao tại `output/METADATA.md`) bằng **đúng ngôn ngữ của kênh (`vi` hoặc `en`)**:
  1. **Bộ Tiêu Đề A/B Testing (CTR & Curiosity Hook)**: 3–5 phương án tiêu đề tối ưu cho Shorts/Reels (<60 ký tự) và YouTube Long-form (50–70 ký tự).
  2. **Mẫu Mô Tả Facebook Reels & TikTok**: Câu Hook trong 120 ký tự đầu, 3 bài học đúc kết thoáng dòng, CTA rõ ràng.
  3. **Mẫu Mô Tả YouTube Chuẩn SEO**: Đoạn mở đầu thu hút, tóm tắt giá trị, danh sách Chapters/Timestamps (cho video dài 16:9), CTA đăng ký kênh.
  4. **Bộ Thẻ Hashtag & SEO Tags**: 8–12 Hashtag thịnh hành theo ngách + 20 thẻ từ khóa SEO YouTube ngăn cách bằng dấu phẩy.
  5. **Bình Luận Ghim (Pinned Comment)**: Câu hỏi kích thích thảo luận cộng đồng.
