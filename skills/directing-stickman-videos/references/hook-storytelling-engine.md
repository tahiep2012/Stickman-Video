# Bộ Máy Hook 12 Phong Cách, Kể Chuyện Giữ Chân v2.0 & Kiểm Duyệt Kịch Bản 2 Tầng
### *Áp dụng cho hệ thống song kênh Stickman-Video: 🇻🇳 Người Lữ Hành Khăn Choàng (`B6`) × 🇺🇸 The Slate Ink Traveler (`B6-EN`)*
### *🎯 Định vị nhất quán: KÊNH PHÁT TRIỂN BẢN THÂN TOÀN DIỆN (SỰ NGHIỆP × TINH THẦN) — 1% Better Every Day*
### *Phủ trọn 3 ngách: Tâm Lý Học (Psychology) · Triết Lý (Philosophy) · Kỹ Năng Sống (Life Skills) — Hỗ trợ cả `16:9 Long-form` & `9:16 Shorts`*

---

## 0. Tuyên Ngôn Định Vị: Đập Tan Ảo Tưởng Để Tái Thiết Hành Động

Mọi kịch bản của Người Lữ Hành Khăn Choàng (`B6 / B6-EN`) được sáng tác theo nguyên lý:
> **"Đập tan ảo tưởng để tái thiết hành động — Giúp người xem tốt lên mỗi ngày từ sự nghiệp đến tinh thần."**

1. **Trục Sự Nghiệp & Năng Suất (Career & Productivity)**: Phá vỡ bẫy trì hoãn, xây dựng kỷ luật thép, làm việc sâu (Deep Work), tối ưu thời gian, nâng cao tư duy chiến lược và năng lực cạnh tranh thực chiến.
2. **Trục Tinh Thần & Nội Tâm (Mental Clarity & Inner Peace)**: Hóa giải lo âu quá mức (overthinking), chữa lành kiệt sức (burnout), rèn luyện khả năng phục hồi cảm xúc (Resilience), ứng dụng triết học Khắc Kỷ để tìm sự bình an và bản lĩnh giữa nghịch cảnh.
3. **Quy Tắc Văn Phong**: Sắc bén, tỉnh táo, bóc trần sự thật nhưng luôn **hướng thượng và trao quyền (Empowering & Actionable)**. Không dừng lại ở việc mổ xẻ nỗi đau khiến người xem bi quan hay bất lực; luôn kết thúc bằng nhận thức mới và một hành vi nhỏ thay đổi được ngay trong đời thực.

---

## 1. Quy Chuẩn Header & Khối Lời Đọc Chuẩn TTS (TTS-Optimized Invariance)

Mọi file kịch bản `projects/<vi|en>/<slug>/script.md` **BẮT BUỘC** tuân thủ cấu trúc chuẩn sau:

```markdown
# KỊCH BẢN VIDEO — <TÊN DỰ ÁN>
**Kênh:** `vi` (Người Lữ Hành Khăn Choàng) | `en` (The Slate Ink Traveler)
**Ngách:** Tâm Lý Học | Triết Lý | Kỹ Năng Sống
**Định dạng:** `16:9 Long-form` (`longform` / `medium`) | `9:16 Shorts` (`shorts`)
**Kiểu Hook:** [#03 - Định Nghĩa Lại Bản Chất (Reframing Twist)]
**Bối cảnh chủ đạo (Setting Motif):** Phòng họp kính ban ngày & hành lang văn phòng
**Tóm tắt Micro-Stories / Ẩn dụ thị giác:** ...
**Tóm tắt Mid-Video Re-Hooks (Long-form):** ...

```text
[TOÀN BỘ LỜI ĐỌC LỒNG TIẾNG SẠCH 100% NẰM TRỌN TRONG DUY NHẤT 1 KHỐI NÀY]
```
```

### 4 Luật Cứng Sạch Tuyệt Đối Cho Giọng Đọc (`VieNeu-TTS` & `Kokoro`)
1. **Duy nhất 1 Code Block ```` ```text ... ``` ````**: Tuyệt đối không chèn ghi chú `[Visual]`, `[SFX]`, `[00:15]`, hay tiêu đề chương vào bên trong khối `text`. Script `generate_voice_cit.py` trích xuất trực tiếp nội dung trong khối này để đọc.
2. **Nhịp thở & Độ dài câu vàng (`12–22 từ/câu`)**:
   - Không viết câu quá `40 từ` (gây hụt hơi, ngắt sai nhịp trên `VieNeu-TTS`).
   - Dấu phẩy `,` đặt đúng chỗ lấy hơi tự nhiên (nghỉ 200–300ms); dấu chấm `.` hạ giọng dứt khoát.
   - Hạn chế dấu chấm than `!` (tối đa `<= 3` lần trong toàn bài) để tránh chói cao độ.
3. **Zero Clutter (Cấm tuyệt đối ký tự lạ trong khối `text`)**:
   - Cấm: `*`, `_`, `#`, `[]`, `{}`, `` ` ``, emoji, dòng gạch đầu dòng `-`, dấu gạch ngang rời ` - ` hoặc `--`.
   - **Cấm tuyệt đối dấu ngoặc đơn `(...)`**: Ngoặc đơn khiến TTS đọc vấp hoặc bỏ chữ. Phải viết nối tự nhiên bằng dấu phẩy (vd: thay `Hiệu ứng chim mồi (Decoy Effect)` thành `Hiệu ứng chim mồi, hay còn gọi là bẫy mồi nhử`).
4. **Chuẩn hóa số, đơn vị & tên viết tắt cho kênh Tiếng Việt (`vi`)**:
   - Viết bằng chữ tiếng Việt: `năm mươi phần trăm` (không viết `50%`), `hai mươi tư giờ` (không viết `24/7`), `năm mươi nghìn đồng` (không viết `50k`), `năm hai nghìn không trăm hai mươi tư` (không viết `2024`).
   - Tránh tên viết tắt kiểu `B.F. Skinner` (TTS dễ đọc ngắt câu sai ở dấu chấm) → viết `nhà tâm lý học Skinner` hoặc `nhà tâm lý học hành vi Skinner`.

---

## 2. Bộ Máy Hook 12 Phong Cách Chống Trùng Lặp (`Anti-Repetition Hook Engine`)

### A. Cấu Trúc Mở Đầu Bắt Buộc Theo Định Dạng

#### 1. Video Dài `16:9` (`longform`: 8–12 phút / `1200–1800 từ` | `medium`: 5–7 phút / `750–1150 từ`) — **30 GIÂY VÀNG**
- `00:00 – 00:06` (**The Hard Hook**, `<= 35 từ`): Đánh thẳng bằng **1 trong 12 kiểu Hook** bên dưới ngay câu đầu tiên, xác nhận cú click trong 3 giây đầu.
- `00:06 – 00:18` (**Micro-Mirror / Validation**): Chạm đúng trải nghiệm thật của người xem trong 1–2 câu cô đọng, không kể lể dài dòng.
- `00:18 – 00:30` (**Zeigarnik Open Loop**): Gài **1 vòng lặp tò mò chưa đóng** — hé lộ một cú twist phản trực giác, một thí nghiệm gây sốc hoặc cái bẫy ẩn chỉ được giải mã trọn vẹn ở ~65% bài. **TUYỆT ĐỐI CẤM** chỉ nhắc lại đúng tên chủ đề đã ghi trên Tiêu đề.

#### 2. Video Ngắn `9:16` (`shorts`: 45–90 giây / `130–240 từ`) — **6 GIÂY CHẶN NGÓN TAY (SCROLL-STOPPER)**
- `00:00 – 00:04` (**Lightning Hard Hook**, `<= 24 từ`): Tung ngay 1 trong 12 kiểu Hook cực bén, gãy gọn, tạo xung đột nhận thức hoặc hình ảnh stickman gây tò mò ngay lập tức.
- `00:04 – 00:10` (**Assumption Shatter**): Đập tan lầm tưởng phổ biến trong 1 câu ngắn và gài ngay ẩn dụ thị giác chủ đạo cho toàn bộ video.

### B. Luật Chống Trùng Lặp & Danh Sách Đen (Cưỡng Chế Bằng Python)
1. **Cấm lặp kiểu Hook trong 4 tập gần nhất cùng kênh**: Trước khi viết kịch bản, BẮT BUỘC chạy `python scripts/manage_topic_registry.py recent-hooks --channel <vi|en>` để xem 4 mã Hook vừa dùng và chọn một mã Hook **KHÁC HOÀN TOÀN**.
2. **Cấm lặp mô-típ đồng hồ/nửa đêm trong 6 tập gần nhất**: Không mở đầu bằng *"Đồng hồ điểm 2 giờ sáng..."* / *"At 2 a.m..."* quá 1 lần mỗi 6 tập.
3. **Danh Sách Đen Câu Mở Đầu Sáo Rỗng (Banned Clichés)**:
   - Tiếng Việt (`vi`): Cấm mở đầu bằng *"Có bao giờ bạn..."*, *"Bạn đã bao giờ tự hỏi..."*, *"Hôm nay chúng ta sẽ..."*, *"Trong video hôm nay..."*, *"Chào mừng các bạn..."*, *"Xin chào các bạn..."*.
   - Tiếng Anh (`en`): Cấm *"Have you ever wondered..."*, *"Today we're going to..."*, *"In this video..."*, *"Welcome back to..."*, *"Hey guys..."*.

### C. Thư Viện 12 Kiểu Hook Xoay Vòng (4 Nhóm × 3 Kiểu)

| Mã | Nhóm Hook | Tên Kiểu Hook | Cơ Chế Tâm Lý & Gợi Ý Vẽ Stickman `B6 / B6-EN` |
|---|---|---|---|
| **`#01`** | *Phá Vỡ Nhận Thức* | **Phá Vỡ Định Kiến (`Contrarian Bomb`)** | Đập tan niềm tin số đông ngay giây thứ 2 (*"Bạn không trì hoãn vì lười — não bạn đang bật còi báo động sinh tồn."*). Visual: Stickman đập vỡ tấm bảng niềm tin sai. |
| **`#02`** | *Phá Vỡ Nhận Thức* | **Lời Khuyên Phản Tác Dụng (`Inverted Advice`)** | Lật tẩy lời khuyên quen thuộc hóa ra làm vấn đề tệ hơn (*"Mọi lời khuyên ép bạn phải suy nghĩ tích cực đang âm thầm kéo bạn lún sâu hơn."*). |
| **`#03`** | *Phá Vỡ Nhận Thức* | **Định Nghĩa Lại Bản Chất (`Reframing Twist`)** | Gọi tên bản chất thật giật mình sau một hành vi quen thuộc (*"Nụ cười bình thản bạn giữ cả ngày không phải bản lĩnh — đó là lớp kính cách âm giấu còi báo động."*). |
| **`#04`** | *Bằng Chứng Sốc* | **Thí Nghiệm Kỳ Lạ (`Weird Lab Study`)** | Mở thẳng bằng 1 thí nghiệm tâm lý/hành vi có thật gây kinh ngạc (*"Năm một nghìn chín trăm bảy mươi, một căn phòng kính một chiều đã lật ngược hoàn toàn điều ta tin về sự lạnh lùng."*). |
| **`#05`** | *Bằng Chứng Sốc* | **Con Số Tương Phản Tàn Nhẫn (`Brutal Stat Contrast`)** | Đặt 2 con số đối lập sát nhau tạo cú sốc tức thì (*"Danh bạ lưu ba trăm cái tên, nhưng số người bạn dám gọi lúc sụp đổ lại bằng không."*). |
| **`#06`** | *Bằng Chứng Sốc* | **Bước Ngoặt Lịch Sử / Triết Gia (`Historical Flashpoint`)** | Mở bằng 1 khoảnh khắc thật của danh nhân/triết gia (*"Giữa đại dịch cướp đi nửa đế chế La Mã, vị hoàng đế quyền lực nhất thế giới chỉ viết đúng hai chữ vào cuốn sổ tay."*). Đặc trị ngách **Triết Lý**. |
| **`#07`** | *Đọc Vị & Nhập Vai* | **Đọc Vị Tim Đen (`Mind-Reader Confession`)** | Nói toạc suy nghĩ thầm kín khán giả chưa dám thừa nhận (*"Đôi khi bạn không buồn vì thất bại — bạn chỉ kiệt sức vì lúc nào cũng phải tỏ ra mình ổn."*). Đặc trị **Tâm Lý Học**. |
| **`#08`** | *Đọc Vị & Nhập Vai* | **Lát Cắt Kịch Tính 2 Câu (`In Media Res Micro-Scene`)** | Thả thẳng vào khoảnh khắc căng thẳng nhất trong đúng 2 câu ngắn rồi bẻ ngoặt sang xung đột *(cấm lặp mô-típ tả giờ đồng hồ)*. |
| **`#09`** | *Đọc Vị & Nhập Vai* | **Câu Nói Dối Tự Nhủ (`Inner Voice Quote`)** | Mở bằng 1 câu thoại người xem hay tự lừa mình (*"'Chờ xong việc này đã' — câu nói dối êm tai nhất đang âm thầm đánh cắp cả tuổi trẻ của bạn."*). Đặc trị **Kỹ Năng Sống**. |
| **`#10`** | *Đọc Vị & Nhập Vai* | **Ẩn Dụ Thị Giác Ám Ảnh (`Haunting Visual Metaphor`)** | Một hình ảnh ẩn dụ ngắn khiến não lập tức tự dựng phim — **cực hợp với hoạt hình Stickman** (*"Giống như lái chiếc xe cạn xăng nhưng thay vì dừng lại, bạn lấy băng dính đen dán che đèn báo đỏ."*). |
| **`#11`** | *Quyền Lợi & Nghịch Lý* | **Cái Giá Vô Hình (`Hidden Cost / Silent Theft`)** | Chỉ thẳng tài sản quý nhất (thời gian, năng lượng, tự do tâm trí) đang bị đánh cắp mỗi ngày mà không hay biết. |
| **`#12`** | *Quyền Lợi & Nghịch Lý* | **Nghịch Lý Không Lời Giải (`The Impossible Paradox`)** | Đặt ra 1 mâu thuẫn phi lý buộc não phải ở lại nghe lời giải (*"Tại sao một tin nhắn đã xem nhưng im lặng lại khiến bạn bứt rứt hơn cả ngàn lời hứa hẹn?"*). |

---

## 3. Bộ Máy Kể Chuyện Giữ Chân v3.0: Nhân Vật Hóa Đời Thực & Kịch Tính Đỉnh Cao (`Character-Driven Storytelling Engine`)

Học hỏi từ các case study video triệu view tăng trưởng thần tốc trong ngách phát triển bản thân, kịch bản của Người Lữ Hành Khăn Choàng (`B6 / B6-EN`) được nâng cấp toàn diện lên chuẩn **Kể chuyện Nhân vật hóa Đời thực (Character-Driven Narrative)**. Não người ghét bị thuyết giảng đạo lý, nhưng luôn bị cuốn hút và đồng cảm tuyệt đối khi theo dõi số phận của một con người cụ thể.

### 6 Trụ Cột Kể Chuyện Triệu View Bắt Buộc Áp Dụng:

> [!CAUTION]
> **QUY TẮC BẤT BIẾN — CẤM CHÉP VÍ DỤ MINH HỌA (*Zero-Example-Copying Invariance*)**:
> Mọi tình huống, đồ vật, con số ngày, câu thoại và ẩn dụ được ghi in nghiêng bên dưới (như *11h48 đêm, đôi giày phủ bụi, kẻ ba hoa quán cà phê, não tự trả lương trước, ngày thứ 18 nhìn trần nhà, bát chè đậu xanh, tấm lịch gạch dấu, quy tắc 5 phút...*) **CHỈ LÀ VÍ DỤ MINH HỌA CẤU TRÚC**.
> Khi viết bất kỳ kịch bản mới nào, AI **CHỈ ĐƯỢC HỌC CẤU TRÚC TÂM LÝ** của 6 trụ cột và **TUYỆT ĐỐI CẤM** tái sử dụng, sao chép hoặc nhái lại các hình ảnh, nhân vật, bối cảnh hay ẩn dụ mẫu trong tài liệu này. Mọi kịch bản phải tự kiến tạo **100% thế giới câu chuyện, nhân vật, đạo cụ và ẩn dụ stickman độc bản** gắn sát với đề tài và dữ liệu nghiên cứu trực tuyến của tập đó.

1. **Mở Đầu Bằng "Lát Cắt Hiện Thực Siêu Cụ Thể" (*Specific Reality Slice Hook*)**:
   - Thay vì mở đầu bằng lý thuyết trừu tượng, luôn thả người xem vào một **khoảnh khắc vật lý cụ thể đến từng chi tiết** trong đời thực (thời gian, không gian, đồ vật, hành động):
     - *11 giờ 48 phút đêm, căn phòng tối om, ánh sáng duy nhất chiếu lên mặt là màn hình điện thoại, cuốn sách tiếng Anh vẫn mở ở trang hôm qua.*
     - *Một tối nọ đăng status: 'Từ tháng sau mình sẽ gym mỗi sáng và lột xác'... Mọi người thả tim rần rần... nhưng đến tuần thứ hai, đôi giày vẫn đóng bụi, quyển vở mới viết đúng 1 trang.*
     - *5 giờ sáng, chuông reo, ngồi dậy ngay không nằm nướng, chăn gối gấp 4 góc vuông như thước kẻ.*
   - Khán giả lập tức thấy **chính hình bóng và nỗi đau của mình** ngay trong 3–5 giây đầu (*Instant Identification*).

2. **Đa Dạng Hóa Hình Thái Dẫn Dắt & Cấm Rập Khuôn "Người A vs Người B" (*Diverse Narrative Modalities & Anti-Formulaic Invariance*)**:

   > [!CAUTION]
   > **LỆNH CẤM BẤT BIẾN — CHỐNG RẬP KHUÔN "NGƯỜI A VS NGƯỜI B"**:
   > **TUYỆT ĐỐI CẤM** công thức hóa kịch bản theo lối mòn: *"Hãy nhìn hai người tên A và B: A thì thế này, còn B thì thế kia..."* xuất hiện liên tục qua các tập phim. Lối viết này khiến video trở nên giả tạo, máy móc và gây nhàm chán trầm trọng cho khán giả.
   > Mỗi kịch bản mới **BẮT BUỘC PHẢI LUÂN PHIÊN** lựa chọn linh hoạt 1 trong 5 hình thái dẫn dắt độc bản dưới đây (CẤM dùng cùng 1 hình thái trong 2 tập liên tiếp):

   - **Hình thái 1 · Nhập vai trải nghiệm trực tiếp ("Chính Bạn" — 2nd/1st-Person Immersive POV)**:
     - Không cần bịa ra bất kỳ tên nhân vật nào. Đặt thẳng người xem vào vai nhân vật chính với các cảm giác cơ thể và hoàn cảnh có thật:
       * *Hai giờ chiều thứ Ba, bạn vừa gửi xong bản kế hoạch quan trọng nhất quý... Mười phút lại ấn F5 làm mới hòm thư một lần, tim đập thình thịch mỗi khi có thông báo mới...*
       * *Đã bao nhiêu lần bạn tự hứa tối nay sẽ đọc sách, nhưng vừa đặt lưng xuống giường, tay bạn lại tự động quẹt mở ứng dụng quen thuộc?*
     - Tạo sự đồng cảm tuyệt đối (*Instant Identification*) vì khán giả thấy câu chuyện đang nói về chính mình chứ không phải một người xa lạ tên A hay B.

   - **Hình thái 2 · Hồ sơ nhân vật & Sự kiện lịch sử có thật (*Historical & Real-Life Profiles*)**:
     - Kể lại một case study có thật chấn động về một nhà bác học, kỳ thủ cờ vua, phi hành gia, triết gia, vận động viên hay một cuộc khủng hoảng lịch sử:
       * *Năm 1943, nhà toán học Abraham Wald bước vào căn phòng của Không quân Mỹ, nơi các sĩ quan đang bàn cách bọc giáp cho những vị trí dính nhiều vết đạn nhất trên máy bay ném bom...*
       * *Năm 65 sau Công Nguyên, triết gia Seneca nhận lệnh lưu đày ra đảo hoang, mất sạch tài sản và danh tiếng chỉ sau một đêm...*
     - Tư liệu người thật việc thật luôn mang lại sức nặng uy tín và tính lôi cuốn vượt trội gấp nhiều lần chuyện hư cấu.

   - **Hình thái 3 · Cuộc chiến giữa 2 bản thể nội tâm (*Internal Dual-Self Conflict*)**:
     - Không so sánh 2 con người ngoài đời, mà phơi bày **cuộc nội chiến giữa 2 bản thể đối lập bên trong cùng một con người**:
       * *Bản thể lúc 11 giờ đêm* (tràn đầy quyết tâm, vạch ra kế hoạch hoàn hảo) đối đầu với *Bản thể lúc 6 giờ sáng* (mệt mỏi, bấm hoãn báo thức, tìm mọi lý do để bỏ cuộc).
       * Cuộc giằng co giữa *Não cảm xúc bốc đồng* (muốn dopamine tức thì) và *Vỏ não lý trí* (muốn mục tiêu dài hạn).
     - Rất đắt giá cho các chủ đề về Kỷ luật, Trì hoãn, Năng suất và Khắc chế bản thân.

   - **Hình thái 4 · Lát cắt xã hội & Quan sát ẩn danh (*Societal Vignette & Anonymous Reality*)**:
     - Khắc họa bức tranh đời sống chân thực thông qua một hình mẫu ẩn danh tiêu biểu trong xã hội mà không cần gán tên giả:
       * *Một người giao hàng đứng đợi đèn đỏ lúc 2 giờ sáng dưới trời mưa phùn, nhìn lên những tầng cao ốc còn sáng đèn...*
       * *Một nhân viên văn phòng lặng lẽ tắt màn hình sau 14 tiếng cày ải, đứng trước cửa thang máy đông nghẹt mà trong lòng trống rỗng...*
     - Phản ánh chân thực các hiện tượng xã hội như kiệt sức ngầm (*quiet burnout*), hội chứng làm hài lòng người khác (*people pleaser*).

   - **Hình thái 5 · Ẩn dụ cơ học, sinh học & quy luật tự nhiên (*Natural & Mechanical Parables*)**:
     - Dẫn dắt bằng quy luật tự nhiên hoặc nguyên lý kỹ thuật kỳ thú:
       * *Hạt tre ngầm nằm im lìm dưới lòng đất suốt 5 năm, chỉ mọc được vài centimet rễ, trước khi vươn cao 30 mét chỉ trong vòng 6 tuần ngắn ngủi...*
       * *Chiếc bánh đà khổng lồ bằng gang nặng 2 tấn: cú đẩy đầu tiên mất 1 tiếng chỉ nhích được vài milimet, nhưng khi đã có đà, nó tự quay nghiền nát mọi vật cản...*

   - *(Hình thái bổ trợ hạn chế)* **Cặp nhân vật đối sánh tự nhiên**: Chỉ dùng tối đa 1 trong 4–5 tập khi thực sự cần kịch tính đối đầu trực tiếp, và **TUYỆT ĐỐI CẤM** dùng mẫu câu mở bài ngây ngô: *"Hãy nhìn hai người tên A và B..."*.

3. **Bình Dân Hóa Khoa Học Não Bộ Bằng Ẩn Dụ Đắt Giá (*Pop-Neuroscience Translation*)**:
   - Mọi cơ chế tâm lý/thần kinh học phải được giải thích bằng hình ảnh dân dã, dễ vẽ thành hoạt hình Stickman:
     - *Dopamine* không phải chất tạo niềm vui, mà là **chất tạo sự mong đợi phần thưởng (Variable Reward)** như máy đánh bạc lướt video ngắn.
     - Khoe trước = **Não tự trả lương trước khi làm** (*Premature Reward*), triệt tiêu ý chí nhấc quả tạ.
     - Siêu kỷ luật mù quáng = **Chiếc xe hết nhớt dán băng dính che đèn báo đỏ**.
     - Dẫn chứng nghiên cứu thực tế có số liệu cụ thể (nghiên cứu thói quen Phillippa Lally trung bình 66 ngày; thí nghiệm Stanford 1997 kìm nén cảm xúc).

4. **Đỉnh Điểm Giằng Xé Cảm Xúc — "Đêm Tối Của Linh Hồn" (*The Dark Night of the Soul*)**:
   - Tuyệt đối không viết một hành trình thành công trơn tru một đường thẳng màu hồng.
   - Bắt buộc cài cắm ít nhất **1 khoảnh khắc khủng hoảng cực hạn** khiến nhân vật gần như bỏ cuộc (mốc ~60–70% video):
     - *Ngày thứ 18 nằm nhìn trần nhà, người vẫn gầy, lướt mạng thấy bạn bè khoe thành công rực rỡ, tự hỏi: 'Mình đang cố vì cái gì? Hay mình vốn dĩ là kẻ thất bại?'*
     - *Chuông điện thoại báo mẹ ngất ở chợ, bệnh viện cách 15 phút, nhưng chân không nhúc nhích vì bị kẹt trong chiếc lồng giam của 'luật là luật, lịch chưa ghi nghỉ'.*
   - Xung đột kịch tính này chính là chìa khóa giữ nhịp tim khán giả hồi hộp đến giây cuối cùng, đẩy tỷ lệ giữ chân (*Retention*) lên trên 70%.

5. **Hệ Thống Hành Vi Vi Mô Làm Được Ngay (*Actionable Micro-Habits*)**:
   - Cấm kết bài bằng lời khuyên sáo rỗng (*"hãy tích cực lên"*, *"hãy kiên trì"*). Luôn đưa ra giải pháp siêu nhỏ, đo đếm được, làm được ngay trong ngày:
     - **Tấm lịch gạch dấu:** Mỗi ngày làm xong gạch 1 dấu, bảo vệ chuỗi gạch dài không bị đứt.
     - **Quy tắc 5 phút:** Không muốn học -> ngồi 5 phút; không muốn chạy -> xỏ giày; không muốn đọc -> đọc 2 trang. Hạ thấp tối đa rào cản bắt đầu.
     - **Kiểm soát môi trường trước khi đổi bản thân:** Tắt thông báo, bỏ điện thoại sang phòng khác.
     - **Bài tập 3 cột sự thật:** Sự thật khách quan — Cảm xúc thật không mặt nạ — Một hành động nhỏ nhất xử lý nguyên nhân gốc rễ.

6. **Câu Kết Đảo Chiều Nhận Thức & "Mic-Drop" Khắc Sâu (*Quotable Mic-Drop Ending*)**:
   - Câu chốt hạ ngắn gọn, cô đọng, đập tan định kiến cũ, biến thành câu châm ngôn người xem muốn chép lại vào phần bình luận hoặc chia sẻ:
     - *"Tiến bộ không cần khán giả. Nó chỉ cần cậu làm thêm một ngày nữa."*
     - *"Cuộc đời không thay đổi khi bạn xem thêm một video về cách thành công. Cuộc đời thay đổi khi bạn đóng video đó lại và bắt đầu hành động."*
     - *"Kỷ luật là không bao giờ dừng, hay là biết khi nào nên dừng?"*

---

### Khung Nhịp Chuẩn `16:9 Long-form` Kể Chuyện Nhân Vật Hóa (5–12 Phút)
- `00:00 – 00:35`: **Lát Cắt Hiện Thực Siêu Cụ Thể** (Thời gian/địa điểm/tình huống đời thực chạm đúng trải nghiệm + Mở vòng lặp tò mò).
- `00:35 – 02:00`: **Thực Trạng & Vòng Xoáy Leo Thang** (Nhân vật đại diện vấp phải bế tắc + Giới thiệu nhân vật đối sánh).
- `02:00 – 03:30`: **Giải Mã Khoa Học Não Bộ & Re-Hook #1 (~35%)** (Lật tẩy cơ chế dopamine / phần thưởng sớm / tiến trình mỉa mai bằng ẩn dụ stickman).
- `03:30 – 05:30`: **Hành Trình Thử Nghiệm & Đỉnh Điểm Khủng Hoảng (~65%)** (Đêm tối của linh hồn, xung đột kịch tính nghẹt thở giữa lý trí và cảm xúc).
- `05:30 – 07:30`: **Bước Ngoặt Thức Tỉnh & Cú Xoay Chuyển Góc Nhìn** (Phá vỡ bẫy tâm lý, hành động vi mô cứu vãn tình thế).
- `07:30 – 10:00`: **Thành Quả Nội Tâm, Bài Học 3 Cột & Câu Kết Mic-Drop** (Không ồn ào khoe mẽ, tìm lại quyền kiểm soát cuộc sống).

### B. Dành Cho Video Ngắn `9:16 Shorts` (45–90 giây / `130–240 từ`) — **Tốc Độ & Ẩn Dụ Thị Giác**
- `00:00 – 00:05`: **Lightning Hard Hook** (1 trong 12 kiểu Hook, `<= 24 từ`).
- `00:05 – 00:15`: **Assumption Shatter + Visual Anchor** (Đập tan ngộ nhận + thả 1 ẩn dụ thị giác stickman đắt giá như *máy xèng*, *bánh xe chuột hamster*, *con vịt đạp chân dưới nước*).
- `00:15 – 00:35`: **Core Mechanism / Proof** (1 bằng chứng/thí nghiệm sắc lẹm, giải thích trong 2–3 câu gãy gọn, xen 1 câu Punchline 3–10 từ).
- `00:35 – 00:50`: **Paradigm Shift + Mic-Drop / Debate Prompt** (1 câu thức tỉnh sắc lạnh + 1 câu hỏi chạm đúng trải nghiệm để kéo bình luận).

---

## 4. Cổng Kiểm Duyệt Kịch Bản 2 Tầng Bắt Buộc (`Dual-Layer Script QA Gate`)

Ngay sau khi lưu `projects/<vi|en>/<slug>/script.md`, AI **BẮT BUỘC** chạy đủ 2 tầng trước khi qua Gate 1 duyệt kịch bản (Semi-Auto) hoặc thu âm CIT (Auto):

### Tầng 1 · Python Deterministic Linter (`scripts/validate_script.py`, chạy `< 1s`)
```bash
python scripts/validate_script.py \
    --script-file projects/<vi|en>/<slug>/script.md \
    --channel <vi|en> \
    --niche <psychology|philosophy|life-skills> \
    --format <longform|medium|shorts> \
    --json-out projects/<vi|en>/<slug>/script_qa_report.json
```
- Tự động đối chiếu lịch sử trong `projects/topics-registry.json` + thư mục kênh để chặn cứng: trùng Hook 4 tập gần nhất, lặp mô-típ đồng hồ 6 tập, dính câu sáo rỗng, Hard Hook quá dài, sai khối ```` ```text ````, lỗi sạch TTS (ngoặc đơn, chữ số, ký tự markdown, dấu `!` quá nhiều), bệnh liệt kê (*Anti-Listicle*), thiếu câu hỏi đối thoại.
- Nếu `FAIL`: sửa sạch 100% lỗi cứng rồi chạy lại cho tới khi Tầng 1 trả về `PASS`.

### Tầng 2 · AI Biên Tập Viên Độc Lập (`scripts/review_script_ai.py` + Independent Subagent)
**CẤM AI viết bài tự chấm chính mình trong cùng ngữ cảnh.** Bắt buộc tách vai:
1. Tạo gói đề chấm bài gắn mã băm `voiceover_sha256` chống dùng lại phiếu cũ:
   ```bash
   python scripts/review_script_ai.py \
       --script-file projects/<vi|en>/<slug>/script.md \
       --mode prompt \
       --channel <vi|en> \
       --niche <psychology|philosophy|life-skills> \
       --format <longform|medium|shorts> \
       --title "<Tiêu đề dự kiến>"
   ```
2. Gọi **1 Subagent độc lập** (`invoke_subagent`, `TypeName: "research"`, `Role: "YouTube Retention Script Critic"`) đọc `critic_prompt.md` và trả về duy nhất 1 khối JSON chấm nghiêm khắc (chống lạm phát điểm). *(Hoặc chạy `--mode api` nếu dùng ngoài terminal có cấu hình `CRITIC_BASE_URL` & `CRITIC_API_KEY` trong `.env`).*
3. Lưu JSON vào `projects/<vi|en>/<slug>/script_review.json` và xác thực 2 tầng:
   ```bash
   python scripts/review_script_ai.py --script-file projects/<vi|en>/<slug>/script.md --format <longform|medium|shorts> --mode verify
   python scripts/validate_script.py --script-file projects/<vi|en>/<slug>/script.md --channel <vi|en> --format <longform|medium|shorts> --require-ai-review
   ```
- **Ngưỡng ĐẠT (`PASS`)**: Điểm tổng có trọng số **`>= 8.5/10`** VÀ **không tiêu chí nào `< 7.5/10`** VÀ khớp chính xác `voiceover_sha256`.
- **Auto-Revision Loop (tối đa 2 vòng)**: Nếu `FAIL` → sửa đúng từng đoạn trong `priority_fixes` → chạy lại Tầng 1 & Tầng 2 cho tới khi `PASS`.

---

## 5. YouTube Outlier & Demand Radar v2.0 (Quét Chủ Đề Thực Chiến)

Trước khi hiện **Bảng 2**, thực hiện đủ 3 bước:
1. **Kiểm tra Kho Backlog & Lịch Sử Chống Trùng**:
   ```bash
   python scripts/manage_topic_registry.py list-backlog --channel <vi|en> --niche <niche>
   python scripts/manage_topic_registry.py recent-hooks --channel <vi|en> --limit 6
   ```
2. **Quét Live 3 Tầng (`search_web`) & Bộ Lọc Giá Trị Phát Triển Bản Thân**:
   - *Tầng 1 (YouTube Outlier & Search Demand)*: Tìm các video essay / shorts cùng ngách đang đột biến view + từ khóa câu hỏi thực tế (*"tại sao..."*, *"why do I..."*) liên quan đến bứt phá năng lực, sự nghiệp, hoặc giải phóng tâm trí.
   - *Tầng 2 (Community Pain-Point Mining)*: Đào chủ đề tranh luận nóng trên Threads, TikTok, Reddit (`r/psychology`, `r/Stoicism`, `r/selfimprovement`, `r/productivity`), Psychology Today.
   - *Tầng 3 (Anti-Saturation & Personal Growth Filter)*: Đối chiếu 5 tập gần nhất trong `topics-registry.json` để tránh trùng mô-típ/bối cảnh. Lọc bỏ 100% chủ đề drama hóng biến, giật gân rẻ tiền; chỉ giữ lại đề tài đem lại giá trị nâng cấp sự nghiệp hoặc củng cố nội lực tinh thần.
3. **Bảng Điểm 4 Tiêu Chí & `Packaging Preview`** (Cấm chấm cảm tính 9.7/10 đồng loạt):
   - `D` (*Demand* 0–10) • `P` (*Pain/Stakes* 0–10) • `C` (*Packaging/CTR* 0–10) • `F` (*Freshness* 0–10).
   - Mỗi đề xuất bắt buộc kèm **Nhãn `[🔥 HOT TREND]` / `[🌿 EVERGREEN]`**, **Bằng chứng nguồn** (với Trend), **Giá trị phát triển bản thân (Sự nghiệp hoặc Tinh thần)**, và **Packaging Preview** (nháp tiêu đề CTR + ý tưởng khung hình stickman mở đầu).
   - Toàn bộ đề tài hay mà người dùng **chưa chọn** sẽ tự động lưu vào `backlog_topics` qua `manage_topic_registry.py add-backlog` để dành cho các tập tiếp theo!
