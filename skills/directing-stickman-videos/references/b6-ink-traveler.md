# B6 · Ink Traveler (Người Lữ Hành Khăn Choàng) — Character DNA Standard

Phong cách **nhân vật thương hiệu độc quyền** dành cho kênh YouTube **Tâm Lý Học · Triết Lý · Kỹ Năng Sống**. Giữ nguyên vẻ sạch sẽ, sâu sắc của nét vẽ tay tối giản (*Minimal Line Art*) nhưng sở hữu dấu ấn nhận diện thương hiệu 0.5 giây không thể nhầm lẫn.

---

## 1. Bộ Quy Chuẩn DNA Nhân Vật (Bắt Buộc Khóa Cứng — LOCKED)

> [!IMPORTANT]
> **QUY TẮC BẤT BIẾN (Zero-Drift DNA Rule)**: Khi tạo bất kỳ phân cảnh nào theo phong cách `B6`, **TUYỆT ĐỐI KHÔNG** rút gọn bằng các từ như *"same character"*, *"người lữ hành như cảnh trước"*. AI **BẮT BUỘC** lặp lại nguyên văn (verbatim) cả 3 khối DNA bên dưới trong **MỌI** prompt sinh ảnh.

### Khối 1 · Base Visual Style (Khóa nét vẽ & chất liệu giấy)
```text
Minimalist 2D hand-drawn editorial line art illustration, clean uniform black ink linework on warm off-white sketchbook paper background, strictly flat 2D minimal shading, no gradients, no 3D rendering, no text, no letters, no words, no numbers.
```

### Khối 2 · Protagonist Character DNA (Khóa ngoại hình nhân vật chính)
```text
Protagonist Character DNA (LOCKED): minimalist slender hand-drawn figure with a clean smooth round white bald head (no hair, no nose, no ears), simple expressive small black-ink dot eyes and subtle curved eyebrows, wearing thin round black wire glasses, a crisp white minimalist knee-length tailored overcoat drawn in clean black ink outlines with simple slim white trousers and dark ink shoes, and ONE signature flowing muted terracotta-amber knitted scarf wrapped neatly around the neck with two short tails hanging down the front.
```

### Khối 3 · Brand Color Lock — Mẹo Khóa Nhận Diện Thương Hiệu (Supporting Cast Separation)
```text
Color Lock: ONLY the protagonist wears the warm muted terracotta-amber scarf and thin round wire glasses; whenever secondary people appear in the scene, draw them strictly as faint monochrome black-and-white ink outlines without color, scarves, or glasses (do not add extra people unless described in the scene).
```

### Khối 4 · Aspect Ratio Anchor (Chọn đúng theo khung hình video)
- **Khung hình `16:9` (YouTube ngang — `1920x1080`, nhịp 8–12 giây/cảnh)**:
  ```text
  16:9 widescreen cinematic full-frame composition, wide illustrated editorial background spreading edge-to-edge across the entire frame.
  ```
- **Khung hình `9:16` (Shorts / TikTok / Reels — `1080x1920`, nhịp 3–5 giây/cảnh)**:
  ```text
  9:16 vertical cinematic full-frame composition, rich vertical editorial background with foreground and background depth filling the entire frame.
  ```

---

## 2. Công Thức Ghép Prompt Chuẩn Cho Mọi Phân Cảnh B6

```text
[Khối 1: Base Visual Style] + [Khối 4: Aspect Ratio Anchor] + [Khối 2: Protagonist Character DNA] + [Khối 3: Brand Color Lock] + Scene: [Mô tả hành động, biểu cảm và bối cảnh cụ thể của cảnh đó bằng tiếng Anh]
```

Hoặc sinh ảnh trực tiếp qua CLI đã tích hợp sẵn DNA:
```bash
# Sinh ảnh 16:9 Full Frame với B6 Ink Traveler DNA tự động
node skills/directing-stickman-videos/scripts/scene-studio.mjs generate-shot projects/<slug>/scenes/shot_01.png "<mô tả cảnh>" --style B6 --aspect 16:9

# Sinh ảnh 9:16 Full Frame với B6 Ink Traveler DNA tự động
node skills/directing-stickman-videos/scripts/scene-studio.mjs generate-shot projects/<slug>/scenes/shot_01.png "<mô tả cảnh>" --style B6 --aspect 9:16
```

---

## 3. Quy Tắc Biểu Cảm & Bối Cảnh

| Nguyên tắc | Yêu cầu bắt buộc |
| :--- | :--- |
| **Khuôn mặt & Biểu cảm** | Chỉ biểu đạt cảm xúc qua **độ cong lông mày, hình dáng miệng tối giản và ngôn ngữ cơ thể** (vai rũ khi mệt mỏi, tay chống cằm khi suy tư, tay đút túi bước thẳng khi tự tin). Không thêm tóc, không vẽ mũi/tai rườm rà. |
| **Màu nhấn duy nhất** | **Cam đất / Hổ phách dịu (muted terracotta-amber)** chỉ xuất hiện trên chiếc khăn choàng của nhân vật chính (và ánh sáng bình minh/đèn lồng cực nhẹ nếu cảnh yêu cầu). Tránh tô quá nhiều màu sặc sỡ làm loãng nhận diện chiếc khăn. |
| **Nhân vật phụ (Crowd / Coworkers / Partner)** | 100% **đen trắng thuần túy (monochrome ink outlines)**, **KHÔNG** đeo kính tròn, **KHÔNG** quàng khăn. Nhờ vậy nhân vật đại diện kênh luôn nổi bật trong 0.5 giây ở mọi khung hình. |
| **Không chữ trong tranh** | Cấm tuyệt đối chữ viết, ký tự, con số trong hình vẽ. Toàn bộ nội dung chữ chỉ hiển thị qua hệ thống phụ đề đồng bộ. |

---

## 4. Bộ Ảnh Chuẩn Tham Chiếu (Reference Pack)

Dữ liệu DNA máy đọc được và bộ 4 ảnh kiểm chứng độ đồng nhất đa bối cảnh lưu tại `assets/b6/`:
- `assets/b6/character-dna.json` — Định nghĩa DNA chuẩn dạng JSON cho script tự động nạp.
- `assets/b6/dna-verification-sheet.png` — Bảng kiểm chứng 4 bối cảnh (*Bàn làm việc áp lực · Quán cà phê mưa · Đứng giữa đám đông đen trắng · Bước qua cánh cửa bình minh*).
- `assets/b6/ref-01-desk.png`, `ref-02-cafe.png`, `ref-03-crowd.png`, `ref-04-sunrise.png`.

---

## 5. Checklist Nghiệm Thu Ảnh B6 (Semi-Auto QA Gate)

Trước khi duyệt cảnh `B6` để dựng video, kiểm tra nhanh 5 điểm:
1. Đầu tròn trắng nhẵn (không tóc, không tai), đeo **kính tròn mảnh**.
2. Mặc **áo choàng trắng tối giản dáng dài ngang gối** vẽ bằng nét mực đen sạch.
3. Quàng **khăn cam đất / hổ phách dịu** với 2 vạt ngắn rủ phía trước.
4. Nếu cảnh có nhiều người: **tất cả nhân vật phụ đều đen trắng thuần**, không ai khác mang khăn màu hay kính tròn giống nhân vật chính.
5. Tranh phủ kín **Full Frame 16:9 hoặc 9:16**, không có viền thừa, không có chữ lỗi.
