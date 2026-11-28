# Luồng Khởi Động 6 Bước Đa Kênh VN & EN (Tâm Lý Học · Triết Lý · Kỹ Năng Sống)

Quy trình khởi động chuẩn cho hệ thống **2 kênh song song (Tiếng Việt & Tiếng Anh)** về **Tâm Lý Học, Triết Lý và Kỹ Năng Sống** bằng hoạt hình vẽ tay tối giản (Stickman / Editorial Line Art Animation), tích hợp **Bộ Máy Hook 12 Phong Cách**, **Storytelling Engine v2.0**, **Radar Đề Tài 3 Tầng + Backlog** và **Cổng Kiểm Duyệt Kịch Bản 2 Tầng Độc Lập** ([hook-storytelling-engine.md](hook-storytelling-engine.md)).

### 🎯 Định Vị Kênh: Phát Triển Bản Thân Toàn Diện (Sự Nghiệp × Tinh Thần)
Kênh được định vị nhất quán là **Kênh Phát Triển Bản Thân (Self-Improvement & Personal Growth)** — sứ mệnh duy nhất là **giúp người xem ngày càng tốt lên mỗi ngày (1% better every day)**, đồng bộ trên cả 2 trục cột sống:
1. **Sự Nghiệp & Năng Suất (Career & Productivity)**: Kỷ luật bản thân, làm việc sâu (Deep Work), quản lý thời gian thực chiến, đánh tan trì hoãn, tư duy chiến lược, bứt phá giới hạn và làm chủ năng lực chuyên môn.
2. **Tinh Thần & Nội Tâm (Mental Clarity & Inner Peace)**: Khả năng phục hồi cảm xúc (Emotional Resilience), chữa lành kiệt sức (burnout), làm chủ tâm trí, triết lý Khắc Kỷ (Stoicism) và xây dựng nội lực an nhiên, vững vàng trước áp lực cuộc sống.

> [!IMPORTANT]
> **Quy Tắc Định Vị Bất Biến**:
> - **Khâu Quét Đề Tài (Radar v2.0)**: 100% đề xuất `[🔥 TREND]` hay `[🌿 EVERGREEN]` bắt buộc phải phục vụ trực tiếp mục tiêu nâng cấp sự nghiệp hoặc tinh thần. Tuyệt đối không quét hoặc đề xuất các chủ đề giật gân rẻ tiền, drama tiêu cực, hoặc mê tín vô bổ.
> - **Khâu Viết Kịch Bản (Storytelling v2.0)**: Giọng văn Người Lữ Hành Khăn Choàng (`B6 / B6-EN`) phải luôn sắc sảo, tỉnh táo, bóc trần sự thật nhưng **hướng thượng và trao quyền (Empowering & Action-Oriented)**. Không bao giờ dừng lại ở việc chỉ ra nỗi đau khiến người xem bi quan; luôn kết bài bằng giải pháp hành động cụ thể làm được ngay để tốt lên.

Khi skill `directing-stickman-videos` được khởi động (và người dùng chưa chỉ định sẵn toàn bộ thông số bên dưới), AI **BẮT BUỘC** dẫn người dùng đi tuần tự qua từng bảng lựa chọn dưới đây (sử dụng `ask_question` hoặc bảng lựa chọn đánh số rõ ràng, **chỉ hiện từng bảng một**, chờ người dùng chọn rồi mới sang bảng tiếp theo).

---

## Bảng 0 · Chọn Kênh & Ngôn Ngữ Sản Xuất (Dual-Channel Selector)

Hiển thị đầu tiên ngay khi khởi động skill với đúng 3 lựa chọn:

1. **🇻🇳 Kênh Tiếng Việt (`vi`)** — Lưu tại `projects/vi/<slug>/`
   - **Ngôn ngữ**: Kịch bản, phụ đề `input.srt` và siêu dữ liệu `METADATA.md` 100% bằng **Tiếng Việt**.
   - **Giọng đọc**: CIT Voice Studio — **Model `VieNeu-TTS`** (mặc định giọng `Hải Đăng`, 48kHz).
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

Hiển thị với đúng 3 trụ cột phụng sự định vị **Phát Triển Bản Thân Toàn Diện**:
1. **Tâm Lý Học (Psychology for Self-Growth)**: Vạch trần cạm bẫy tâm lý, cơ chế não bộ, giải mã hành vi, kiểm soát cảm xúc, nâng cao siêu nhận thức (metacognition) để tự nhận diện và vượt qua các giới hạn tự thân cản trở hạnh phúc và công việc.
2. **Triết Lý (Philosophy for Resilience)**: Chủ nghĩa Khắc Kỷ (Stoicism), triết lý sống thực hành, rèn luyện bản lĩnh tinh thần, làm chủ tâm trí giữa áp lực, tìm kiếm bình an nội tâm và xây dựng hệ giá trị sống vững vàng.
3. **Kỹ Năng Sống & Sự Nghiệp (Life Skills & Career Mastery)**: Kỷ luật thép, làm việc sâu (Deep Work), quản lý thời gian thực chiến, đánh tan trì hoãn, giao tiếp tinh tế, bứt phá năng suất và làm chủ lộ trình sự nghiệp.

---

## Bảng 2 · YouTube Outlier & Demand Radar v2.0 + Kho Backlog (Lọc Theo Định Vị Phát Triển Bản Thân)

Ngay sau khi người dùng chọn mục ở Bảng 1:
1. **Kiểm tra Sổ Đăng Ký, Kho Backlog & Lịch Sử Bối Cảnh**:
   - Chạy `python scripts/manage_topic_registry.py list-backlog --channel <vi|en> --niche "<niche>"` và `python scripts/manage_topic_registry.py recent-hooks --channel <vi|en> --limit 6`.
   - Đọc `projects/topics-registry.json`: **chỉ đưa vào danh sách loại trừ (Blacklist) các chủ đề đã làm trong CÙNG KÊNH (`channel === "vi"` hoặc `channel === "en"`)**. Đề tài đã làm ở kênh `vi` VẪN ĐƯỢC PHÉP làm/chuyển thể sang `en` (và ngược lại).
   - **Anti-Saturation Filter**: Soi 5 tập gần nhất cùng kênh để tránh đề xuất lặp lại cùng một bối cảnh/mô-típ (vd: tránh 2 tập liên tiếp cùng bối cảnh "phòng tối nửa đêm cầm điện thoại").
2. **Quét dữ liệu trực tuyến 3 tầng qua `search_web` & Lọc Theo Trục Phát Triển Bản Thân**:
   - *Tầng 1 (YouTube Outlier & Search Demand)*: Tìm các chủ đề video essay/shorts đang bùng nổ view và câu hỏi thực tế khán giả hay tìm (*"tại sao..."*, *"why do I..."*) liên quan mật thiết đến sự nghiệp và tinh thần.
   - *Tầng 2 (Community Pain-Point Mining)*: Đào nỗi đau/tranh luận nóng tuần này trên Threads, TikTok, Reddit (`r/selfimprovement`, `r/productivity`, `r/Stoicism`, `r/psychology`), Psychology Today bằng đúng ngôn ngữ kênh.
   - *Tầng 3 (Kho Evergreen & Backlog)*: Kết hợp các đề tài `pending` mạnh nhất từ kho Backlog (nếu có).
   - **Personal Growth Relevance Filter**: Tuyệt đối loại bỏ chủ đề giật gân, drama người nổi tiếng, hay mê tín dị đoan. Đề tài được chọn phải giải quyết 1 vấn đề cụ thể về **sự nghiệp (năng suất, tư duy, tiền bạc, thăng tiến)** hoặc **tinh thần (bình an, phục hồi nội lực, chữa lành kiệt sức)**.
3. **Đề xuất 5–6 chủ đề MỚI TINH cân bằng `[🔥 TREND]` & `[🌿 EVERGREEN]` kèm Chấm Điểm 4 Tiêu Chí & `Packaging Preview`**:
   - Mỗi đề tài **BẮT BUỘC** hiển thị:
     * Nhãn `[🔥 TREND]` (kèm bằng chứng nguồn trend thực tế) hoặc `[🌿 EVERGREEN]`.
     * **Bảng điểm 4 tiêu chí (`0–10`, cấm lạm phát 9.7 đồng loạt)**: `D` (*Demand*) • `P` (*Pain/Stakes*) • `C` (*Packaging/CTR*) • `F` (*Freshness*).
     * **Tác động phát triển bản thân (Self-Growth Impact)**: Nêu rõ video giúp người xem tốt lên ở điểm gì (nâng cấp năng suất sự nghiệp hay củng cố sức mạnh tinh thần).
     * **Packaging Preview**: Nháp tiêu đề CTR + Ý tưởng khung hình stickman mở đầu.
   - Cho phép người dùng chọn 1 chủ đề từ danh sách hoặc nhập chủ đề riêng.
4. **Tự động lưu các đề tài chưa chọn vào Kho Backlog**:
   - Ngay khi người dùng chọn 1 đề tài, gọi `python scripts/manage_topic_registry.py add-backlog ...` để lưu lại các đề tài tốt chưa chọn (trạng thái `pending`) vào `projects/topics-registry.json` cho các tập sau.

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
   - **Cổng Kiểm Duyệt 1 (Script Review Gate)**: AI viết kịch bản chuẩn Hook 12 phong cách + Storytelling v2.0 → **BẮT BUỘC chạy qua Cổng QA Kịch Bản 2 Tầng (`validate_script.py` + AI Critic độc lập đạt `>= 8.5/10`)** → Trình kịch bản kèm **Phiếu Chấm Điểm 2 Tầng** và **DỪNG LẠI** để người dùng duyệt trước khi thu âm và vẽ ảnh.
   - **Cổng Kiểm Duyệt 2 (Contact Sheet Review Gate)**: Sau khi duyệt kịch bản, AI thu âm qua CIT Voice Studio và vẽ toàn bộ ảnh phân cảnh Full Frame qua Agnes AI → **DỪNG LẠI** lần 2 để người dùng xem ảnh lưới Contact Sheet và yêu cầu vẽ lại từng cảnh nếu cần trước khi render video.
2. **Auto (Tự động 100%)**: Tự động thực thi xuyên suốt không dừng người dùng từ nghiên cứu → kịch bản → **Tự động chạy Cổng QA Kịch Bản 2 Tầng (và tự sửa tối đa 2 vòng đến khi PASS `>= 8.5/10`)** → thu âm CIT & phụ đề → vẽ ảnh → render video MP4 → xuất `METADATA.md` → đăng ký Registry & đẩy GitHub.

---

## Bảng 5 · Chọn Kích Thước Khung Hình & Thời Lượng Video (Aspect Ratio & Target Duration)

> [!IMPORTANT]
> **Quy Tắc Nhịp Phân Cảnh Hai Nửa Cho Video Dài (Two-Half Dynamic Pacing Invariance)**:
> - **Video Dài `16:9` (Long-form / Medium)**:
>   * **Nửa đầu thời lượng (0% – 50%)**: **3 – 5 giây / cảnh** — Tốc độ cao, dồn dập, chuyển cảnh liên tục để kích hoạt dopamine, tung đòn hook, bóc trần sự thật và giữ chặt chân người xem ngay từ những phút đầu (YouTube Retention).
>   * **Nửa sau thời lượng (50% – 100%)**: **5 – 8 giây / cảnh** — Nhịp chậm rãi hơn, điềm tĩnh và sâu lắng, phục vụ điểm thắt nút giằng xé nội tâm (*The Dark Night of the Soul* ~65%), giải mã cơ chế khoa học/triết lý và hướng dẫn hệ thống hành vi vi mô làm được ngay giúp người xem thẩm thấu trọn vẹn thông điệp mà không bị ngộp.
> - **Video Ngắn `9:16` (Shorts / Reels / TikTok)**:
>   * Toàn bộ thời lượng: **3 – 5 giây / cảnh** xuyên suốt.

1. **`16:9` (Video dài chuẩn YouTube / Full HD `1920x1080`)**:
   - **Thời lượng chuẩn**: **8 – 12 phút** (`--format longform`, `1.200 – 1.800 từ`, cấu trúc 30 Giây Vàng + 2 Micro-Stories + 2 Re-Hooks + Kết bài 3 chạm) hoặc **5 – 7 phút** (`--format medium`, `750 – 1.150 từ`).
   - **Quy tắc nhịp phân cảnh**: **3 – 5 giây / cảnh ở nửa đầu (0–50%)** và **5 – 8 giây / cảnh ở nửa sau (50–100%)** (~65 – 100 cảnh cho longform, ~40 – 60 cảnh cho medium).
   - **Hình ảnh tạo ra**: **Full Frame `1920x1080`** tràn khung (`fit: 'cover'`).
2. **`9:16` (Video ngắn YouTube Shorts / TikTok / Reels / Full HD `1080x1920`)**:
   - **Thời lượng chuẩn**: **45 – 90 giây** (`--format shorts`, `130 – 240 từ`, 6 Giây Chặn Ngón Tay + 1 Ẩn dụ thị giác Stickman đắt giá + Cú lật nhận thức + Câu Mic-Drop).
   - **Quy tắc nhịp phân cảnh**: **3 – 5 giây / cảnh** (~12 – 24 cảnh).
   - **Hình ảnh tạo ra**: **Full Frame `1080x1920`** tràn khung dọc.

---

## Giai Đoạn Thực Thi (Sau Khi Hoàn Tất Các Bảng Lựa Chọn)

> Thư mục dự án luôn được lưu tách biệt theo kênh:
> - Kênh Tiếng Việt: `projects/vi/<slug>/`
> - Kênh Tiếng Anh: `projects/en/<slug>/`

### Bước 1 · Nghiên Cứu Trực Tuyến 4 Tầng & Soạn Kịch Bản Kể Chuyện Nhân Vật Hóa v3.0 (Định Vị Phát Triển Bản Thân)
1. Đọc kỹ [`references/hook-storytelling-engine.md`](hook-storytelling-engine.md) và kiểm tra lịch sử Hook:
   ```bash
   python scripts/manage_topic_registry.py recent-hooks --channel <vi|en> --limit 6
   ```
2. Gọi `search_web` thu thập nghiên cứu 4 tầng thực tế (tuyệt đối không bịa số liệu): *Facts & Numbers* → *Real Case Study / Experiment* → *Scientific / Philosophical Proof* → *Contrarian Twist*.
3. **Áp Dụng Triệt Để 6 Trụ Cột Kể Chuyện Nhân Vật Hóa Triệu View (Storytelling v3.0)**:
   - **Lát cắt hiện thực siêu cụ thể:** Mở bài bằng thời gian, không gian, đồ vật, hành vi vật lý cực đời (11h48 đêm phòng tối, chiếc giày tập phủ bụi, chuông 5h sáng chăn gấp 4 góc vuông) để người xem thấy mình ngay trong 3 giây đầu.
   - **Đa dạng hóa hình thái dẫn dắt (Cấm rập khuôn A vs B):** Tuyệt đối CẤM lặp lại mô-típ sáo rỗng *"Hãy nhìn hai người tên A và B"*. Bắt buộc luân phiên 5 hình thái độc bản: (1) POV nhập vai trải nghiệm trực tiếp *"Chính bạn"*, (2) Case study lịch sử / nhân vật có thật chấn động, (3) Cuộc chiến 2 bản thể nội tâm trong cùng 1 con người, (4) Lát cắt xã hội ẩn danh đời thực, (5) Ẩn dụ cơ học / quy luật tự nhiên.
   - **Bình dân hóa khoa học não bộ:** Biến dopamine, variable reward, premature reward, 66 ngày thói quen thành ẩn dụ stickman đời thường (não tự trả lương trước, máy đánh bạc, xe hết nhớt dán băng dính che đèn đỏ).
   - **Đỉnh điểm giằng xé nội tâm (*The Dark Night of the Soul*):** Bắt buộc có 1 điểm khủng hoảng cực hạn ở mốc ~65% khi nhân vật gần như bỏ cuộc hoặc đứng trước xung đột lớn để đẩy nhịp tim và giữ chân người xem.
   - **Hành vi vi mô làm được ngay:** Tấm lịch gạch dấu, quy tắc 5 phút, thay đổi môi trường, bài tập 3 cột.
   - **Câu kết Mic-Drop:** Đảo chiều nhận thức, giàu tính triết lý, kích thích bình luận và chia sẻ.
4. Chọn **1 mã Hook `[#01..#12]` KHÁC với 4 tập gần nhất cùng kênh** và ghi rõ vào header `**Kiểu Hook:** [#XX - Tên kiểu Hook]` cùng `**Bối cảnh chủ đạo:** ...`.
5. Đặt toàn bộ lời đọc sạch 100% vào **DUY NHẤT 1 khối ```` ```text ... ``` ````** chuẩn `VieNeu-TTS` (kênh `vi`, viết chữ toàn bộ số/phần trăm/tiền tệ, không ngoặc đơn, không ký tự markdown) hoặc `Kokoro` (kênh `en`, native US/UK prose).
6. Lưu kịch bản vào `projects/<vi|en>/<slug>/script.md`.

### Bước 1.5 · CỔNG KIỂM DUYỆT KỊCH BẢN 2 TẦNG BẮT BUỘC (`Dual-Layer Script QA Gate`)
Áp dụng cho **CẢ `Semi-Auto` lẫn `Auto`** trước khi thu âm:
1. **Tầng 1 (Python Linter < 1s)**:
   ```bash
   python scripts/validate_script.py \
       --script-file projects/<vi|en>/<slug>/script.md \
       --channel <vi|en> \
       --niche <psychology|philosophy|life-skills> \
       --format <longform|medium|shorts> \
       --json-out projects/<vi|en>/<slug>/script_qa_report.json
   ```
   - Nếu `FAIL`: sửa dứt điểm 100% lỗi cứng rồi chạy lại tới khi `PASS`.
2. **Tầng 2 (AI Biên Tập Viên Độc Lập — Subagent Critic, 0 tốn API rời)**:
   - Sinh gói đề chấm bài gắn mã băm `voiceover_sha256`:
     ```bash
     python scripts/review_script_ai.py \
         --script-file projects/<vi|en>/<slug>/script.md \
         --mode prompt \
         --channel <vi|en> \
         --niche <psychology|philosophy|life-skills> \
         --format <longform|medium|shorts> \
         --title "<Tiêu đề dự kiến>"
     ```
   - Gọi 1 Subagent độc lập (`invoke_subagent`, `TypeName: "research"`, `Role: "YouTube Retention Script Critic"`) đọc `critic_prompt.md` và trả về JSON chấm nghiêm khắc (chống lạm phát điểm). Lưu kết quả vào `projects/<vi|en>/<slug>/script_review.json`.
   - Xác thực đồng thời Tầng 1 + Tầng 2:
     ```bash
     python scripts/review_script_ai.py --script-file projects/<vi|en>/<slug>/script.md --format <longform|medium|shorts> --mode verify
     python scripts/validate_script.py --script-file projects/<vi|en>/<slug>/script.md --channel <vi|en> --format <longform|medium|shorts> --require-ai-review
     ```
   - **Ngưỡng ĐẠT**: Tổng `>= 8.5/10` VÀ không tiêu chí nào `< 7.5/10` VÀ khớp `voiceover_sha256`. Nếu `FAIL` → tự sửa đúng các mục trong `priority_fixes` và chấm lại (tối đa 2 vòng) tới khi `PASS`.

### Bước 2 · CỔNG KIỂM DUYỆT 1: DUYỆT KỊCH BẢN (Khi Chọn `Semi-Auto`)
- Trình kịch bản đã vượt qua QA 2 tầng (kèm **nhãn Kiểu Hook `[#XX]`** và **Phiếu Chấm Điểm 2 Tầng**) và **BẮT BUỘC DỪNG LẠI** chờ người dùng duyệt.

### Bước 3 · Tạo Giọng Đọc Phòng Thu (CIT Voice Studio) & File Phụ Đề SRT (Kèm Chốt Kiểm Tra Model)
- Kết nối CIT Voice Studio cục bộ (`http://127.0.0.1:8001`) qua `GET /health`:
  - **Kênh `vi` (`--lang vi`)**: Kiểm tra đang chạy **Model `VieNeu-TTS`** (mặc định giọng `Hải Đăng`).
  - **Kênh `en` (`--lang en`)**: Kiểm tra đang chạy **Model `Kokoro`** (nếu vẫn đang ở `VieNeu-TTS`, tạm dừng nhắc người dùng chuyển Model trên CIT Voice Studio sang Kokoro).
- Chạy lệnh thu âm tự động xuất `narration.mp3` (48kHz) và `input.srt` (khớp mili-giây):
  ```bash
  # Kênh Tiếng Việt (Model VieNeu-TTS)
  python scripts/generate_voice_cit.py --lang vi --script-file projects/vi/<slug>/script.md --project-dir projects/vi/<slug> --voice "Hải Đăng"

  # Kênh Tiếng Anh (Model Kokoro)
  python scripts/generate_voice_cit.py --lang en --script-file projects/en/<slug>/script.md --project-dir projects/en/<slug> --voice auto
  ```
- Lấy `duration_seconds` thực tế làm căn cứ chia mốc thời gian từng cảnh.

### Bước 4 · Phân Cảnh & Tạo Hình Ảnh Full Frame Qua Agnes AI
- **Chia cảnh theo quy chuẩn 2 nửa thời lượng (Two-Half Dynamic Pacing)**:
  * **Video dài 16:9**: Nửa đầu (0% – 50% thời lượng) phân đoạn phụ đề SRT thành các cảnh **3 – 5 giây / cảnh** (nhịp nhanh, dồn dập). Nửa sau (50% – 100% thời lượng) phân đoạn thành các cảnh **5 – 8 giây / cảnh** (nhịp sâu lắng, lắng đọng chuyển hóa).
  * **Video ngắn 9:16**: Toàn bộ thời lượng phân đoạn **3 – 5 giây / cảnh**.
- Tạo toàn bộ hình ảnh qua Agnes AI (áp dụng giãn cách **15 giây cooldown** giữa mỗi ảnh để tránh lỗi HTTP 429) theo đúng DNA thương hiệu của kênh (`B6` khăn cam đất cho `vi` / `B6-EN` khăn xanh lam trầm cho `en`).
- Lưu vào `projects/<vi|en>/<slug>/scenes/shot_01.png`, `shot_02.png`, ...

### Bước 5 · CỔNG KIỂM DUYỆT 2: DUYỆT HÌNH ẢNH PHÂN CẢNH (Khi Chọn `Semi-Auto`)
- Tạo bảng ảnh tổng hợp `projects/<vi|en>/<slug>/output/contact_sheet.png` và **BẮT BUỘC DỪNG LẠI** để người dùng duyệt hoặc yêu cầu vẽ lại các cảnh chưa ưng ý.

### Bước 6 · Render Video Điện Ảnh Chuẩn Retention (`scripts/render_cinema.mjs` · Không Phụ Đề Cứng)
- **Zero Burned-in Subtitles Invariance**: Canvas video sạch 100%, không gắn hardsub; xuất phụ đề mềm đồng bộ `output/film.srt` riêng để tải lên YouTube CC.
- **Cinema Render Engine v2.0 (4 Nâng Cấp Chuẩn Kênh B6 / B6-EN)** — Luôn dùng `scripts/render_cinema.mjs` kèm file biên đạo `cinema_plan.json` trong thư mục dự án:
  1. **Chuyển động máy quay Subpixel Ken Burns (`30fps`)**: Supersample 2x trước `zoompan` để đạt **0% rung giật (zero jitter)**, luân phiên có chủ đích theo nhịp cảnh: `zoom_in` (đào sâu nội tâm / Punchline / Re-Hook), `zoom_out` (mở rộng góc nhìn / kết bài), `pan_lr` / `pan_rl` (cảnh chia đôi tương phản), `drift_up` (ẩn dụ không gian/đám mây).
  2. **Chuyển cảnh Editorial có nhịp điệu (`xfade` + `hard cut`)**: Dùng `xfade` mượt `0.35s` cho các cảnh kể chuyện liền mạch (tự bù thời lượng để khớp SRT tuyệt đối 0% trễ tiếng) và cố tình dùng **`hard cut`** dứt khoát tại các cú Re-Hook, mở đầu hồi mới hoặc Punchline để tạo tương phản nhịp.
  3. **Thiết kế Âm Thanh 3 Lớp + Mastering `-14 LUFS`**:
     - **Nhạc nền BGM mặc định chuẩn kênh & tự nối mượt**: Mặc định sử dụng bản nhạc nền chuẩn kênh `assets/audio/Vibe Tracks - Universal.mp3` (*Vibe Tracks - Universal*) cho toàn bộ video sản xuất bằng Skill này (hoặc tùy chọn nhạc theo ngách trong `assets/audio/bgm/`: `psychology.mp3`, `philosophy.mp3`, `life-skills.mp3`). Nếu video ngắn hơn nhạc → tự cắt + Fade-In `1.8s` / Fade-Out `3.0s`; nếu video dài hơn nhạc → tự nối vòng bằng **`acrossfade` `3.5s`** không gợn khớp. **Mức âm lượng nhạc nền mặc định: `-8.0 dB` so với giọng đọc** (chuẩn hóa tự động về **`-24.0 LUFS`** dưới giọng đọc **`-16.0 LUFS`**), kết hợp EQ mở dải trung cho giọng nói và **Sidechain Ducking** nhẹ (`~3–4 dB`) khi giọng đọc cất lên để nhạc nền luôn đầy đặn, rõ ấm mà không lấn lời thoại.
     - **Micro-SFX tiết chế & `AUDIO CUT`**: Điểm đúng `6–8` khoảnh khắc đắt giá (`page_turn`, `pen_stroke`, `soft_click`, `warm_swell` sinh offline sạch bản quyền trong `assets/audio/sfx/`) và cài ít nhất **1 nhịp `AUDIO CUT`** tắt êm nhạc nền `1.5–1.8s` ngay trước cú bẻ lái/đóng Open Loop lớn nhất.
     - **Mastering chuẩn YouTube**: Chuẩn hóa EBU R128 (`loudnorm=I=-14:TP=-1.5:LRA=11`) ở `48kHz Stereo AAC 192k`.
  4. **Chất liệu "Sổ Phác Thảo Sống" (*Living Paper Feel*)**: Phủ lớp vân giấy phác thảo chuyển động mảnh `8fps` (`assets/textures/paper_grain_16x9.mp4` hoặc `9x16`, chế độ `overlay 14%`) + vignette giấy ấm rất nhẹ (5–6%) *(tự động bỏ bằng `--no-paper` nếu dùng phong cách nền tối `B3/B4`)*.
  ```bash
  node scripts/render_cinema.mjs \
      --project-dir projects/<vi|en>/<slug> \
      --plan projects/<vi|en>/<slug>/cinema_plan.json \
      --aspect <16:9|9:16> \
      --niche <psychology|philosophy|life-skills>
  ```

### Bước 6.5 · Tự Động Tạo Thumbnail `16:9` Chuẩn CTR *(Bắt Buộc Với Mọi Video Dài `16:9`)*
- Ngay sau khi render xong video `16:9`, tự động tạo ảnh bìa `projects/<vi|en>/<slug>/output/thumbnail.png` (`1920x1080`) bằng `scripts/generate_thumbnail.py`:
  - **Tiêu đề bìa**: Bắt buộc ngắn gọn chuẩn CTR di động (**`vi`: 4–7 từ** | **`en`: 2–7 từ**), bảo vệ 100% từ ghép tiếng Việt và cấm từ cô phụ 1 chữ.
  - **Quy tắc Zero-Category-Tag Invariance**: **TUYỆT ĐỐI KHÔNG để chữ thể loại/ngách ('TÂM LÝ HỌC', 'TRIẾT LÝ', 'KỸ NĂNG SỐNG') trên Thumbnail**. Thumbnail chỉ tập trung 100% vào hình ảnh ẩn dụ stickman và duy nhất cụm Tiêu đề lớn 4–7 từ chuẩn CTR giật tò mò để tối ưu diện tích và độ rõ nét trên màn hình di động.
  - **Ảnh nền bìa**: Chọn 1 phân cảnh biểu tượng đẹp nhất trong `scenes/` (có khoảng trống sạch 1 bên) qua `--base-image`, **hoặc** sinh riêng `thumbnail_base.png` có nhân vật `B6 / B6-EN` đứng bên phải & không gian âm sạch bên trái qua `--prompt`.
  - **Phối màu nhận diện thương hiệu tự động**: Nền giấy kem `B6` dùng chữ mực đen `#18181B` + nhấn dòng chốt bằng **Cam đất `#C25224`** (`vi`) hoặc **Xanh lam trầm `#2D5473`** (`en`) — 0% che mặt nhân vật, né tuyệt đối góc dưới phải thời lượng YouTube.
  ```bash
  # Cách 1: Sinh ảnh nền chuyên biệt bố cục bìa 16:9 qua Agnes AI (khuyên dùng)
  python scripts/generate_thumbnail.py \
      --prompt "<Mô tả cảnh kịch tính nhất, nhân vật ở nửa phải>" \
      --title "<TIÊU ĐỀ 4-7 TỪ>\n<DÒNG NHẤN MÀU>" \
      --style B6 --lang vi \
      --output projects/vi/<slug>/output/thumbnail.png

  # Cách 2: Tận dụng phân cảnh đẹp nhất đã vẽ (0 tốn API ảnh)
  python scripts/generate_thumbnail.py \
      --base-image projects/vi/<slug>/scenes/shot_XX.png \
      --title "<TIÊU ĐỀ 4-7 TỪ>" \
      --style B6 --lang vi \
      --output projects/vi/<slug>/output/thumbnail.png
  ```

### Bước 7 · Tự Động Xuất Siêu Dữ Liệu Zero-Slop (`METADATA.md`) & Đồng Bộ GitHub Registry
- Tự động tạo `projects/<vi|en>/<slug>/METADATA.md` (và bản sao tại `output/METADATA.md`) bằng đúng ngôn ngữ kênh với quy chuẩn **Zero-Slop SEO**:
  1. **Tiêu Đề A/B (3 phương án, KHÔNG lặp 2 dấu `:`)**: Shorts (`< 60 ký tự`) / Long-form (`55–80 ký tự`).
  2. **Mẫu Mô Tả Facebook Reels & TikTok**: Câu Hook 120 ký tự đầu, 3 bài học đúc rút trực tiếp từ kịch bản (không câu sáo rỗng), CTA rõ ràng.
  3. **Mẫu Mô Tả YouTube Chuẩn SEO**: Đoạn mở đầu thu hút + Chapters/Timestamps khớp giây thực tế (với `16:9`) + CTA đăng ký kênh.
  4. **Bộ Hashtags & 20 Tags SEO (Tổng `<= 480 ký tự` vừa khít hộp 500 ký tự YouTube Studio)**.
  5. **Bình Luận Ghim (Pinned Comment)**: Tự nhiên, đánh thẳng vào câu hỏi tranh luận của tập.
- **Đăng ký Registry kèm `hook_code` & đẩy lên GitHub `main` ngay khi hoàn tất**:
  ```bash
  python scripts/manage_topic_registry.py register-produced \
      --slug "<slug>" --channel <vi|en> --title "<title>" \
      --niche "<niche>" --category <Trend|Evergreen> \
      --format "<9:16 Shorts|16:9 Long-form>" --duration <seconds> \
      --hook-code "#XX" --setting-motif "<bối cảnh>" \
      --keywords "<kw1,kw2,...>" --sync
  ```
