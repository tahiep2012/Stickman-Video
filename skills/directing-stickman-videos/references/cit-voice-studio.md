# Cầu Nối CIT Voice Studio (Offline VieNeu-TTS v3 Turbo 48kHz)

Hệ thống kết nối trực tiếp với phần mềm **CIT Voice Studio** đang chạy trên máy tính (`http://127.0.0.1:8001`), tự động hóa 100% quy trình thu âm giọng đọc phòng thu 48.000 Hz và xuất file phụ đề SRT đồng bộ tuyệt đối từng mili-giây.

---

## 1. Sơ Đồ Kiến Trúc Kết Nối (Local HTTP Bridge)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Skill as Stickman Video (Script)
    participant CIT as CIT Voice Studio (127.0.0.1:8001)
    participant FFmpeg as FFmpeg Engine

    Skill->>CIT: GET /health (Kiểm tra phần mềm đã bật chưa)
    CIT-->>Skill: 200 OK (Mô hình VieNeu-TTS-v3 Turbo, 48kHz, CPU/GPU)

    Skill->>CIT: GET /voices (Lấy danh sách 26+ giọng đọc & Voice Clone)
    CIT-->>Skill: Danh sách giọng ("I Thought", "Hải Đăng", "Mai Anh"...)

    Skill->>CIT: POST /api/tts/generate-with-subtitles (Gửi kịch bản prose)
    Note over CIT: VieNeu-TTS tổng hợp giọng đọc 48kHz<br/>& tính toán timestamps chuẩn từng từ
    CIT-->>Skill: JSON { audio_base64, srt, duration_seconds }

    Skill->>FFmpeg: Giải mã audio_base64 -> narration.mp3 (48kHz)
    Skill->>Skill: Lưu phụ đề -> input.srt / captions.srt
    Skill-->>User: Sẵn sàng audio & phụ đề để dựng video Full Frame
```

---

## 2. Cấu Hình Tùy Chỉnh (File `.env`)

Cấu hình máy chủ và giọng đọc mặc định trong file `.env` ở thư mục gốc hoặc thư mục skill:

```ini
# CIT Voice Studio Configuration (Offline VieNeu-TTS v3 Turbo 48kHz)
CIT_BASE_URL=http://127.0.0.1:8001
CIT_VOICE=I Thought
CIT_SPEED=1.0
```

- **`CIT_BASE_URL`**: Địa chỉ máy chủ cục bộ (mặc định: `http://127.0.0.1:8001`).
- **`CIT_VOICE`**: Tên giọng đọc mong muốn (mặc định: `I Thought`).
- **`CIT_SPEED`**: Tốc độ đọc (mặc định: `1.0`).

---

## 3. Dữ Liệu Gửi Đi & Nhận Về

### Endpoint: `POST http://127.0.0.1:8001/api/tts/generate-with-subtitles`

**Gói tin gửi đi (JSON)**:
```json
{
  "text": "Đã bao giờ bạn cố ngồi xem hết một bộ phim cực kỳ nhàm chán...",
  "voice_id": "I Thought",
  "speed": 1.0,
  "format": "wav"
}
```

**Phản hồi nhận về (JSON)**:
- `audio_base64`: Chuỗi Base64 chứa dữ liệu âm thanh phòng thu 48.000 Hz nguyên bản.
- `srt`: Nội dung file phụ đề SRT với timestamps khớp từng mili-giây với giọng đọc.
- `duration_seconds`: Tổng thời lượng chính xác của file âm thanh (làm căn cứ phân chia cảnh cho video).

---

## 4. Lệnh Sử Dụng (CLI & Code)

### Cách 1 · Dùng script Python chuẩn (`generate_voice_cit.py`)
Script sử dụng thư viện chuẩn `urllib.request` của Python, không cần cài thêm package nào:

```bash
# 1. Kiểm tra trạng thái CIT Voice Studio
python scripts/generate_voice_cit.py --check-health

# 2. Xem danh sách giọng đọc có sẵn
python scripts/generate_voice_cit.py --list-voices

# 3. Tạo trọn gói narration.mp3 và input.srt từ kịch bản
python scripts/generate_voice_cit.py \
    --script-file projects/<tên-dự-án>/script.md \
    --project-dir projects/<tên-dự-án> \
    --voice "I Thought"
```

### Cách 2 · Dùng qua `scene-studio.mjs` (Node.js)
```bash
# Kiểm tra kết nối CIT Voice Studio
node skills/directing-stickman-videos/scripts/scene-studio.mjs cit-health

# Tạo giọng đọc và phụ đề từ kịch bản
node skills/directing-stickman-videos/scripts/scene-studio.mjs voice-cit projects/<tên-dự-án>/script.md projects/<tên-dự-án> --voice "I Thought"
```

---

## 5. Danh Sách Giọng Đọc Tiêu Biểu Trong CIT Voice Studio

| Tên Giọng | Vùng miền / Phong cách | Tần số lấy mẫu | Loại giọng |
| :--- | :--- | :---: | :--- |
| **I Thought** | Nam · Bắc · Phong cách tự nhiên, sâu lắng | 48.000 Hz | Cloned (Đặc quyền) |
| **Hải Đăng** | Nam · Bắc · Tự nhiên, rõ ràng | 48.000 Hz | Gốc |
| **Thiện Minh** | Nam · Bắc · Kể chuyện truyền cảm | 48.000 Hz | Gốc |
| **Mai Anh** | Nữ · Bắc · Tin tức, chuẩn mực | 48.000 Hz | Gốc |
| **Trúc Ly** | Nữ · Bắc · Tự nhiên, nhẹ nhàng | 48.000 Hz | Gốc |
| **Thùy Dung** | Nữ · Nam · Tin tức, hiện đại | 48.000 Hz | Gốc |
| **Thái Sơn** | Nam · Nam · Kể chuyện, trầm ấm | 48.000 Hz | Gốc |
| **Văn Hải** | Nam · Bắc · Tự nhiên, đĩnh đạc | 48.000 Hz | Cloned |
