# B6 & B6-EN · Ink Traveler (Nhân Vật Thương Hiệu Đa Kênh VN & EN) — Character DNA Standard

Phong cách **nhân vật thương hiệu độc quyền** dành cho hệ thống 2 kênh YouTube/Facebook **Tâm Lý Học · Triết Lý · Kỹ Năng Sống**. Giữ nguyên vẻ sạch sẽ, sâu sắc của nét vẽ tay tối giản (*Minimal Line Art*) nhưng tách biệt màu khăn choàng đặc trưng giữa 2 kênh để khóa nhận diện 0.5 giây và đảm bảo **100% độc lập hình ảnh** giữa kênh Tiếng Việt và kênh Tiếng Anh:

| Mã Phong Cách | Kênh Áp Dụng | Màu Khăn Choàng Khóa Cứng (Brand Color Lock) | Thư Mục Dự Án |
| :---: | :--- | :--- | :--- |
| **`B6`** *(hoặc `B6-VI`)* | 🇻🇳 Kênh Tiếng Việt — *Người Lữ Hành Khăn Choàng* | **Cam đất / Hổ phách dịu (`muted terracotta-amber`)** | `projects/vi/<slug>/` |
| **`B6-EN`** | 🇺🇸 Kênh Tiếng Anh — *The Slate Ink Traveler* | **Xanh lam trầm (`muted slate-blue`)** | `projects/en/<slug>/` |

---

## 1. Bộ Quy Chuẩn DNA Nhân Vật (Bắt Buộc Khóa Cứng — LOCKED)

> [!IMPORTANT]
> **QUY TẮC BẤT BIẾN (Zero-Drift DNA Rule)**: Khi tạo bất kỳ phân cảnh nào theo phong cách `B6` hoặc `B6-EN`, **TUYỆT ĐỐI KHÔNG** rút gọn bằng các từ như *"same character"*, *"người lữ hành như cảnh trước"*. AI **BẮT BUỘC** lặp lại nguyên văn (verbatim) cả 3 khối DNA tương ứng bên dưới trong **MỌI** prompt sinh ảnh.

### Khối 1 · Base Visual Style (Dùng chung cho cả `B6` và `B6-EN`)
```text
Minimalist 2D hand-drawn editorial line art illustration, clean uniform black ink linework on warm off-white sketchbook paper background, strictly flat 2D minimal shading, no gradients, no 3D rendering, no text, no letters, no words, no numbers.
```

### Khối 2A · Protagonist Character DNA — Kênh Tiếng Việt (`B6` · Khăn Cam Đất)
```text
Protagonist Character DNA (LOCKED): minimalist slender hand-drawn figure with a clean smooth round white bald head (no hair, no nose, no ears), simple expressive small black-ink dot eyes and subtle curved eyebrows, wearing thin round black wire glasses, a crisp white minimalist knee-length tailored overcoat drawn in clean black ink outlines with simple slim white trousers and dark ink shoes, and ONE signature flowing muted terracotta-amber knitted scarf wrapped neatly around the neck with two short tails hanging down the front.
```

### Khối 2B · Protagonist Character DNA — Kênh Tiếng Anh (`B6-EN` · Khăn Xanh Lam Trầm)
```text
Protagonist Character DNA (LOCKED): minimalist slender hand-drawn figure with a clean smooth round white bald head (no hair, no nose, no ears), simple expressive small black-ink dot eyes and subtle curved eyebrows, wearing thin round black wire glasses, a crisp white minimalist knee-length tailored overcoat drawn in clean black ink outlines with simple slim white trousers and dark ink shoes, and ONE signature flowing muted slate-blue knitted scarf wrapped neatly around the neck with two short tails hanging down the front.
```

### Khối 3A · Brand Color Lock — Kênh Tiếng Việt (`B6`)
```text
Color Lock: ONLY the protagonist wears the warm muted terracotta-amber scarf and thin round wire glasses; whenever secondary people appear in the scene, draw them strictly as faint monochrome black-and-white ink outlines without color, scarves, or glasses (do not add extra people unless described in the scene).
```

### Khối 3B · Brand Color Lock — Kênh Tiếng Anh (`B6-EN`)
```text
Color Lock: ONLY the protagonist wears the calm muted slate-blue scarf and thin round wire glasses; whenever secondary people appear in the scene, draw them strictly as faint monochrome black-and-white ink outlines without color, scarves, or glasses (do not add extra people unless described in the scene).
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

## 2. Công Thức Ghép Prompt Chuẩn Cho Mọi Phân Cảnh `B6` / `B6-EN`

```text
[Khối 1: Base Visual Style] + [Khối 4: Aspect Ratio Anchor] + [Khối 2A/2B: Protagonist Character DNA] + [Khối 3A/3B: Brand Color Lock] + Scene: [Mô tả hành động, biểu cảm và bối cảnh cụ thể của cảnh đó bằng tiếng Anh]
```

Hoặc sinh ảnh trực tiếp qua CLI đã tích hợp sẵn DNA tự động cho cả 2 kênh:
```bash
# Kênh Tiếng Việt (B6 — Khăn cam đất)
node skills/directing-stickman-videos/scripts/scene-studio.mjs generate-shot projects/vi/<slug>/scenes/shot_01.png "<mô tả cảnh>" --style B6 --aspect 16:9

# Kênh Tiếng Anh (B6-EN — Khăn xanh lam trầm)
node skills/directing-stickman-videos/scripts/scene-studio.mjs generate-shot projects/en/<slug>/scenes/shot_01.png "<scene description>" --style B6-EN --aspect 16:9
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
