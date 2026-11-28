#!/usr/bin/env python3
"""
Dual-Layer Script QA Gate — Layer 2 (Independent AI Editorial Critic Engine)
Cho hệ thống Stickman-Video song kênh (vi · B6 Ink Traveler | en · B6-EN Slate Ink Traveler).
Hỗ trợ 2 bộ rubric riêng biệt cho:
  - `longform` / `medium` (16:9, 6 tiêu chí trọng số)
  - `shorts` (9:16, 5 tiêu chí trọng số tốc độ cao + ẩn dụ thị giác stickman)

3 chế độ vận hành:
  1. --mode prompt (Mặc định cho Antigravity Subagent, 0 tốn API rời)
  2. --mode api (Headless CLI, dùng CRITIC_BASE_URL / CRITIC_API_KEY / CRITIC_MODEL trong .env)
  3. --mode verify (Kiểm định script_review.json, tự tính lại điểm trọng số & xác thực voiceover_sha256)
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from validate_script import (  # noqa: E402
    CHANNEL_META,
    compute_sha256_short,
    extract_voiceover_and_header,
    get_ai_weights,
    infer_channel_and_format,
    normalize_niche,
    validate_script,
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

CHANNEL_VOICE_GUIDELINES = {
    ("vi", "psychology"): (
        "Kênh Tiếng Việt — Người Lữ Hành Khăn Choàng (B6 · Tâm Lý Học Kể Chuyện Đa Dạng & Sáng Tạo): "
        "Mở bài bằng lát cắt hiện thực siêu cụ thể (thời gian, đồ vật, hành vi đời thực chạm đúng trải nghiệm); "
        "kể chuyện sáng tạo, thoát khỏi lối mòn (luân phiên 5 hình thái: POV nhập vai 'Chính bạn', case study nhân vật lịch sử có thật, cuộc chiến 2 bản thể nội tâm, lát cắt xã hội ẩn danh, ẩn dụ tự nhiên — TUYỆT ĐỐI KHÔNG rập khuôn mẫu 'Hãy nhìn hai người tên A và B'); "
        "bình dân hóa cơ chế não bộ (dopamine, phần thưởng sớm, tiến trình mỉa mai) bằng ẩn dụ stickman đời thường; "
        "bắt buộc có đỉnh điểm giằng xé nội tâm (The Dark Night of the Soul ở mốc ~65%) đẩy cao trào kịch tính; "
        "kết bài bằng hệ thống hành vi vi mô làm được ngay (quy tắc 5 phút, lịch gạch dấu, bài tập 3 cột) và câu chốt Mic-Drop sâu sắc, "
        "KHÔNG sến sẩm, KHÔNG than thở bi quan bế tắc, KHÔNG giảng bài khô khan."
    ),
    ("vi", "philosophy"): (
        "Kênh Tiếng Việt — Người Lữ Hành Khăn Choàng (B6 · Triết Lý Khắc Kỷ & Bản Lĩnh Tinh Thần): "
        "Giọng văn điềm tĩnh, đĩnh đạc, thấm đẫm tinh thần Khắc Kỷ (Stoicism) và triết học thực hành; "
        "dẫn chuyện bằng tư liệu lịch sử có thật, triết gia hoặc mâu thuẫn nội tâm sâu sắc, thoát khỏi lối mòn so sánh 2 nhân vật A và B hư cấu; "
        "biến tư tưởng lớn thành lát cắt câu chuyện sống động, mâu thuẫn đời thường và hình ảnh stickman giàu sức nặng; "
        "giúp người xem tôi luyện bản lĩnh tinh thần, tìm thấy bình an nội tâm và đứng vững trước nghịch cảnh cuộc sống, "
        "KHÔNG trích dẫn giáo điều rỗng tuếch, KHÔNG bi lụy."
    ),
    ("vi", "life-skills"): (
        "Kênh Tiếng Việt — Người Lữ Hành Khăn Choàng (B6 · Kỹ Năng Sống & Kỷ Luật Hành Động): "
        "Giọng văn thực chiến, thẳng thắn, phản trực giác, đánh gãy lời khuyên tự lực mòn sáo; "
        "dẫn chuyện bằng POV người xem trực tiếp trải nghiệm, case study thực tế hoặc xung đột 2 bản thể nội tâm (tránh rập khuôn mô-típ 'Hãy nhìn hai người A và B'); "
        "tập trung vào kỷ luật thép, làm việc sâu (Deep Work), đánh tan trì hoãn, quản lý thời gian và thăng tiến sự nghiệp; "
        "đưa ra các giải pháp hành vi vi mô (quy tắc 5 phút, kiểm soát môi trường) và câu kết Mic-Drop đanh thép."
    ),
    ("en", "psychology"): (
        "English Channel — The Slate Ink Traveler (B6-EN · Diverse Narrative Psychology): "
        "Gripping, slice-of-life opening hooks anchored in specific physical details; "
        "diverse storytelling avoiding formulaic tropes (alternating 2nd-person POV, historical case studies, internal dual-self conflicts, societal vignettes; never robotic Person A vs Person B cliches), pop-neuroscience metaphors, "
        "a poignant Dark Night of the Soul turning point (~65%), and immediately actionable micro-habits topped with a memorable mic-drop punchline; "
        "zero stiff translated phrasing, zero cynical despair, zero generic self-help fluff."
    ),
    ("en", "philosophy"): (
        "English Channel — The Slate Ink Traveler (B6-EN · Practical Philosophy & Resilience): "
        "Calm, razor-sharp modern philosophical storytelling anchored in Stoic resilience, real historical profiles, concrete human dilemmas, and stark visual metaphors (free of repetitive Person A vs Person B tropes); "
        "guiding viewers toward inner peace and fortitude under modern pressure without pedantic academic lecturing."
    ),
    ("en", "life-skills"): (
        "English Channel — The Slate Ink Traveler (B6-EN · Life Skills & Radical Action): "
        "Punchy, counter-intuitive, evidence-backed practical storytelling using immersive POV, dual-self battles, deep work, radical discipline, and career breakthroughs; "
        "delivering crisp punchlines and immediately actionable real-world micro-experiments."
    ),
}

DIMENSION_LABELS_LONGFORM = {
    "hook_impact": ("Sức nặng 6s–30s Mở đầu & Khớp kỳ vọng Click", 25),
    "open_loop_payoff": ("Độ mạnh Vòng lặp tò mò (Open Loop) & Độ đã khi giải mã", 15),
    "micro_stories_vividness": ("Độ sống động của 1–2 Câu chuyện vi mô & Ẩn dụ Stickman", 20),
    "mid_video_rehooks": ("2 Cú Re-Hook giữa video (~35% & ~65%) chống tụt Retention", 15),
    "channel_voice_and_flow": ("Mạch điều tra nhân–quả, Định vị Phát Triển Bản Thân & Bản sắc B6", 15),
    "ending_shareability": ("Kết bài Paradigm Shift + Hành động nâng cấp bản thân + Mic-Drop", 10),
}

DIMENSION_LABELS_SHORTS = {
    "hook_impact": ("Sức nặng 3–5s Hard Hook chặn ngón tay lướt qua", 30),
    "visual_metaphor_stickman": ("Độ đắt giá của Ẩn dụ thị giác (dễ vẽ Stickman cuốn hút)", 25),
    "cognitive_twist": ("Cú lật nhận thức (Assumption Shatter) & Mật độ giá trị", 20),
    "pacing_and_tts_flow": ("Nhịp câu gãy gọn, Punchline sắc & Độ mượt đọc TTS", 15),
    "ending_engagement": ("Câu kết Mic-Drop & Lực kéo bình luận/tranh luận", 10),
}


def get_dimension_labels(script_format: str) -> dict[str, tuple[str, int]]:
    return DIMENSION_LABELS_SHORTS if script_format == "shorts" else DIMENSION_LABELS_LONGFORM


def load_dotenv(env_path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not env_path.is_file():
        return values
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        values[k.strip()] = v.strip().strip('"').strip("'")
    return values


def build_critic_prompt(
    script_path: Path,
    channel: str,
    niche: str | None,
    script_format: str,
    qa_report: dict,
    title: str | None = None,
    min_score: float = 8.5,
    min_dim_score: float = 7.5,
) -> str:
    raw = script_path.read_text(encoding="utf-8")
    _, voiceover, _ = extract_voiceover_and_header(raw)
    vo_sha = compute_sha256_short(voiceover)
    lang = CHANNEL_META.get(channel, {}).get("lang", "vi")
    ch_name = CHANNEL_META.get(channel, {}).get("name", channel)
    norm_niche = normalize_niche(niche) or "psychology"
    voice_guide = CHANNEL_VOICE_GUIDELINES.get(
        (channel, norm_niche),
        "Văn nói tinh gọn, sắc bén, giàu ẩn dụ thị giác stickman, không liệt kê khô khan kiểu bài blog.",
    )

    metrics = qa_report.get("metrics", {})
    l1_errors = qa_report.get("errors", [])
    l1_warnings = qa_report.get("warnings", [])

    packaging_block = ""
    if title:
        packaging_block = (
            "## ĐÓNG GÓI TIÊU ĐỀ DỰ KIẾN (ĐỐI CHIẾU KHỚP KỲ VỌNG CLICK)\n"
            f"- **Tiêu đề dự kiến:** {title}\n"
            "- Kiểm tra xem 3–6 giây đầu có xác nhận ngay cú click của người xem hay bị lệch tông.\n\n"
        )

    l1_notes = []
    if l1_errors:
        l1_notes.append("- Lỗi cứng Tầng 1 còn tồn đọng: " + "; ".join(e["code"] for e in l1_errors))
    if l1_warnings:
        l1_notes.append("- Cảnh báo Tầng 1: " + "; ".join(w["message"] for w in l1_warnings[:4]))
    l1_summary = "\n".join(l1_notes) if l1_notes else "- Tầng 1 (Python Linter) đã PASS sạch 100%."

    if script_format == "shorts":
        rubric_block = """## THANG ĐIỂM 5 TIÊU CHÍ CHO 9:16 SHORTS (TRỌNG SỐ 100%)
1. `hook_impact` (**30%**): 3–5 giây đầu (Hard Hook) có đủ sức chặn ngón tay lướt ngay lập tức bằng xung đột nhận thức hoặc câu hỏi đắt giá không? Có bị dài dòng hay dính sáo rỗng không?
2. `visual_metaphor_stickman` (**25%**): Kịch bản có ít nhất 1 ẩn dụ thị giác cực sắc và dễ vẽ thành hoạt hình Stickman tối giản (vd: máy xèng, bánh xe hamster, băng dính đen che đèn báo xăng) hay chỉ toàn chữ trừu tượng khó minh họa?
3. `cognitive_twist` (**20%**): Có cú đập tan định kiến (Assumption Shatter) thật sự thông minh, mang lại khoảnh khắc "ồ lên" khai sáng nhận thức, tiếp thêm nội lực và giá trị phát triển bản thân thiết thực không?
4. `pacing_and_tts_flow` (**15%**): Nhịp câu có gãy gọn, tương phản câu dài–câu ngắn Punchline tốt, và đọc bằng giọng TTS (`VieNeu-TTS` / `Kokoro`) có trơn tru tự nhiên không?
5. `ending_engagement` (**10%**): Câu kết có sắc bén đáng nhớ (Mic-Drop), khẳng định tinh thần tự hoàn thiện bản thân (1% better every day) và kích thích người xem dừng lại bình luận/tranh luận tự nhiên thay vì CTA nhạt nhẽo không?"""
        scores_schema = """    "hook_impact": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "visual_metaphor_stickman": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "cognitive_twist": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "pacing_and_tts_flow": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "ending_engagement": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"}"""
    else:
        rubric_block = """## THANG ĐIỂM 6 TIÊU CHÍ CHO 16:9 LONG-FORM (TRỌNG SỐ 100% · STORYTELLING v3.0)
1. `hook_impact` (**25%**): 6 giây đầu (Hard Hook) có mở bằng một **lát cắt hiện thực siêu cụ thể** (thời gian, đồ vật, hành động đời thực như 11h48 đêm phòng tối, chiếc giày tập phủ bụi, chuông 5h sáng chăn gấp 4 góc vuông) để người xem thấy chính mình ngay lập tức không? 30 giây vàng có gọn sắc (Hard Hook → Micro-Mirror → Zeigarnik Open Loop)?
2. `open_loop_payoff` (**15%**): Giây 18–30 có gài được 1 vòng lặp tò mò thực sự (không chỉ lặp lại tiêu đề) và đến ~65% bài có giải mã trọn vẹn khiến người xem thấy "đã" không?
3. `micro_stories_vividness` (**20%**): Kịch bản có xây dựng được **câu chuyện/lát cắt giàu cảm xúc, sáng tạo, thoát khỏi bẫy rập khuôn sáo rỗng "người A vs người B"** (thưởng điểm cao khi áp dụng linh hoạt 1 trong 5 hình thái: POV nhập vai "Chính bạn", case study nhân vật lịch sử có thật, cuộc chiến 2 bản thể nội tâm, lát cắt xã hội ẩn danh, hoặc ẩn dụ tự nhiên) và giải mã khoa học não bộ (dopamine, premature reward, 66 ngày thói quen) bằng **ẩn dụ stickman đời thường giàu chất liệu tạo hình**? **BẮT BUỘC TRỪ ĐIỂM NẶNG (chỉ cho <= 7.0/10)** nếu kịch bản mở đầu lười biếng bằng mẫu câu rập khuôn kiểu: *"Hãy nhìn hai người/nhân viên tên A và B..."*!
4. `mid_video_rehooks` (**15%**): Ở 2 vùng dễ tụt retention (~35% và ~65% bài), có thực sự xuất hiện 2 cú Re-Hook bẻ lái kịch tính, đặc biệt là **Đỉnh điểm giằng xé nội tâm (The Dark Night of the Soul ở mốc ~65%)** khi nhân vật đối mặt với khủng hoảng cực hạn để kéo nhịp tim người xem không?
5. `channel_voice_and_flow` (**15%**): Chuyển đoạn giữa các ý có liền mạch theo mạch điều tra nhân–quả (không liệt kê kiểu bài blog đọc thành tiếng), đúng chuẩn Định Vị Kênh Phát Triển Bản Thân (hướng thượng, trao quyền, bóc trần cạm bẫy để giúp người xem nâng cấp sự nghiệp hoặc củng cố sức mạnh tinh thần, không bi quan bế tắc), đúng chất `B6 / B6-EN` và mượt khi đọc bằng TTS không?
6. `ending_shareability` (**10%**): Kết bài có thoát khỏi mô-típ "3 lời khuyên hiền lành" để đạt đủ 3 điểm chạm: Cú xoay chuyển góc nhìn (*Paradigm Shift*) + **Hệ thống hành vi vi mô làm được ngay** (tấm lịch gạch dấu, quy tắc 5 phút, thay đổi môi trường, bài tập 3 cột) + **1 câu kết chốt hạ đắt giá đáng chia sẻ/bình luận (*Mic-Drop*)** không?"""
        scores_schema = """    "hook_impact": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "open_loop_payoff": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "micro_stories_vividness": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "mid_video_rehooks": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "channel_voice_and_flow": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"},
    "ending_shareability": {"score": 0.0, "reason": "Nhận xét ngắn gọn có trích dẫn cụ thể"}"""

    return f"""# NHIỆM VỤ: BIÊN TẬP VIÊN CHẤM ĐIỂM GIỮ CHÂN NGƯỜI XEM (STICKMAN-VIDEO RETENTION CRITIC — TẦNG 2)

Bạn là **Tổng Biên Tập Kịch Bản YouTube/Shorts cực kỳ khó tính và khách quan** (độc lập hoàn toàn với người viết kịch bản).
Nhiệm vụ của bạn là đọc kịch bản dưới đây với tư cách người xem sẵn sàng bấm thoát sau 3–5 giây, phát hiện mọi đoạn lê thê, khô khan, sáo rỗng, thiếu ẩn dụ thị giác stickman hoặc thiếu cao trào, và chấm điểm nghiêm khắc.

## NGUYÊN TẮC CHẤM ĐIỂM BẮT BUỘC (ANTI-INFLATION)
1. **CẤM nịnh nọt hay lạm phát điểm:** Một kịch bản bình thường, đọc trôi chảy nhưng thiếu cú sốc nhận thức hoặc kể chuyện/ẩn dụ mờ nhạt chỉ xứng **6.5 – 7.8/10**, TUYỆT ĐỐI KHÔNG cho 8.5–9.0 theo thói quen.
2. Chỉ cho **>= 8.5** ở một tiêu chí khi có dẫn chứng câu chữ cụ thể thật sự đắt giá trong bài.
3. Mỗi góp ý sửa (`priority_fixes`) **BẮT BUỘC trích dẫn nguyên văn đoạn yếu** trong bài, giải thích vì sao người xem sẽ chán/thoát ở đúng giây đó, và đưa ra **hướng viết lại sắc bén hơn**.
4. **Ngưỡng ĐẠT (`PASS`):** Điểm tổng có trọng số `>= {min_score:.1f}/10` VÀ **không có bất kỳ tiêu chí nào dưới `{min_dim_score:.1f}/10`**. Nếu vi phạm một trong hai điều kiện trên, bắt buộc trả `verdict: "FAIL"`.

## NGỮ CẢNH KÊNH & BẢN SẮC
- **Kênh:** `{ch_name}` (`{channel}` | Ngôn ngữ: `{lang}` | Ngách: `{norm_niche}` | Định dạng: `{script_format}`)
- **Chuẩn giọng văn:** {voice_guide}
- **Kiểu Hook đã khai báo:** `{qa_report.get('hook_code') or 'CHƯA KHAI BÁO'} {qa_report.get('hook_name', '')}`
- **Chỉ số định lượng Tầng 1:** {metrics.get('total_words', 0)} từ (~{metrics.get('estimated_seconds', 0)}s / {metrics.get('estimated_minutes', 0)}p) | Câu TB: {metrics.get('avg_words_per_sentence', 0)} từ | Hard Hook: {metrics.get('first_sentence_words', 0)} từ | Câu hỏi `?`: {metrics.get('question_count', 0)} | Punchline: {metrics.get('punchline_sentences', 0)}
- **Trạng thái Tầng 1:**
{l1_summary}

{packaging_block}{rubric_block}

## ĐỊNH DẠNG ĐẦU RA BẮT BUỘC (CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI JSON HỢP LỆ)
Lưu ý: Trường `voiceover_sha256` BẮT BUỘC giữ nguyên chính xác giá trị `"{vo_sha}"`.

```json
{{
  "verdict": "PASS hoặc FAIL",
  "overall_score": 0.0,
  "voiceover_sha256": "{vo_sha}",
  "channel": "{channel}",
  "format": "{script_format}",
  "scores": {{
{scores_schema}
  }},
  "strengths": [
    "Điểm mạnh thực sự nổi bật #1 (có trích dẫn)",
    "Điểm mạnh thực sự nổi bật #2"
  ],
  "priority_fixes": [
    {{
      "section": "Vị trí đoạn yếu (vd: Hard Hook / Ẩn dụ thị giác / Re-Hook #1 / Kết bài)",
      "quote": "Trích dẫn nguyên văn câu/đoạn đang yếu trong kịch bản",
      "issue": "Vì sao đoạn này làm giảm giữ chân người xem",
      "suggestion": "Hướng viết lại sắc bén hơn (kèm câu mẫu cụ thể)"
    }}
  ],
  "editor_summary": "Kết luận ngắn gọn 2-3 câu của Tổng Biên Tập"
}}
```

---

## TOÀN VĂN KỊCH BẢN CẦN CHẤM ĐIỂM (`{script_path.name}`)

{raw}
"""


def extract_json_object(raw_text: str) -> dict:
    text = raw_text.strip()
    m = re.search(r"```(?:json)?\s*\r?\n(.*?)\r?\n```", text, re.DOTALL | re.IGNORECASE)
    if m:
        text = m.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise


def normalize_and_enforce_review(
    review_data: dict,
    expected_vo_sha: str,
    channel: str,
    script_format: str,
    min_score: float,
    min_dim_score: float = 7.5,
) -> dict:
    scores_in = review_data.get("scores", {})
    if not isinstance(scores_in, dict):
        raise ValueError("Phản hồi thiếu trường `scores` dạng object.")

    weights = get_ai_weights(script_format)
    normalized_scores = {}
    weighted_sum = 0.0
    below_min_dims = []

    for dim, weight in weights.items():
        if dim not in scores_in:
            raise ValueError(f"Phản hồi thiếu tiêu chí chấm điểm `{dim}` cho định dạng `{script_format}`.")
        entry = scores_in[dim]
        if isinstance(entry, dict):
            score_val = float(entry.get("score"))
            reason_val = str(entry.get("reason", "")).strip()
        else:
            score_val = float(entry)
            reason_val = ""
        score_val = round(max(0.0, min(10.0, score_val)), 2)
        normalized_scores[dim] = {"score": score_val, "reason": reason_val}
        weighted_sum += score_val * weight
        if score_val < min_dim_score:
            below_min_dims.append(dim)

    overall = round(weighted_sum, 2)
    passed = (overall >= min_score) and (len(below_min_dims) == 0)

    return {
        "verdict": "PASS" if passed else "FAIL",
        "overall_score": overall,
        "min_required_score": min_score,
        "min_required_dimension": min_dim_score,
        "below_threshold_dimensions": below_min_dims,
        "voiceover_sha256": expected_vo_sha,
        "channel": channel,
        "format": script_format,
        "reviewed_at": datetime.now().isoformat(timespec="seconds"),
        "scores": normalized_scores,
        "strengths": review_data.get("strengths", []),
        "priority_fixes": review_data.get("priority_fixes", []),
        "editor_summary": str(review_data.get("editor_summary", "")).strip(),
    }


def call_critic_api(prompt: str, base_url: str, api_key: str, model: str, timeout: int = 120) -> dict:
    endpoint = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a strict, independent YouTube/Shorts Retention Script Editor. "
                    "Return ONLY a single valid JSON object matching the requested schema."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    }

    def _post(body: dict) -> dict:
        data_bytes = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    try:
        resp_json = _post(payload)
    except urllib.error.HTTPError as err:
        if err.code == 400:
            payload.pop("response_format", None)
            resp_json = _post(payload)
        else:
            err_body = err.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Critic API trả lỗi HTTP {err.code}: {err_body[:400]}") from err

    choices = resp_json.get("choices", [])
    if not choices:
        raise RuntimeError(f"Critic API không trả về choices hợp lệ: {resp_json}")
    content = choices[0].get("message", {}).get("content", "")
    return extract_json_object(content)


def print_review_scorecard(review: dict) -> None:
    verdict = review.get("verdict", "FAIL")
    icon = "✅" if verdict == "PASS" else "❌"
    overall = review.get("overall_score", 0.0)
    min_req = review.get("min_required_score", 8.5)
    fmt = review.get("format", "longform")
    labels = get_dimension_labels(fmt)
    print("\n" + "=" * 72)
    print(f"{icon} [PHIẾU CHẤM ĐIỂM AI BIÊN TẬP VIÊN — TẦNG 2 ({fmt.upper()})] {verdict} ({overall:.2f}/10 | Chuẩn >= {min_req:.1f})")
    print("=" * 72)
    scores = review.get("scores", {})
    for dim, (label, pct) in labels.items():
        entry = scores.get(dim, {})
        val = entry.get("score", entry) if isinstance(entry, dict) else entry
        reason = entry.get("reason", "") if isinstance(entry, dict) else ""
        flag = "⚠️ " if isinstance(val, (int, float)) and val < review.get("min_required_dimension", 7.5) else "   "
        print(f"{flag}- {label} ({pct}%): {float(val):.1f}/10")
        if reason:
            print(f"      ↳ {reason}")

    strengths = review.get("strengths", [])
    if strengths:
        print("-" * 72)
        print("  🌟 ĐIỂM MẠNH:")
        for s in strengths:
            print(f"     • {s}")

    fixes = review.get("priority_fixes", [])
    if fixes:
        print("-" * 72)
        print(f"  🛠️  ĐIỂM CẦN SỬA ƯU TIÊN ({len(fixes)}):")
        for idx, fx in enumerate(fixes, 1):
            if isinstance(fx, dict):
                print(f"     {idx}. [{fx.get('section', 'Đoạn cần sửa')}]")
                if fx.get("quote"):
                    print(f"        Trích đoạn: \"{fx['quote']}\"")
                if fx.get("issue"):
                    print(f"        Vấn đề    : {fx['issue']}")
                if fx.get("suggestion"):
                    print(f"        Đề xuất   : {fx['suggestion']}")
            else:
                print(f"     {idx}. {fx}")

    if review.get("editor_summary"):
        print("-" * 72)
        print(f"  📝 KẾT LUẬN BIÊN TẬP: {review['editor_summary']}")
    print("=" * 72 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="AI Editorial Critic Engine (Tầng 2) cho Stickman-Video (Long-form & Shorts)"
    )
    parser.add_argument("--script-file", required=True, help="Đường dẫn tới file script.md")
    parser.add_argument(
        "--mode",
        default="prompt",
        choices=["prompt", "api", "verify"],
        help="prompt: tạo critic_prompt.md cho Subagent | api: gọi LLM trực tiếp | verify: xác thực script_review.json",
    )
    parser.add_argument("--channel", default=None, choices=["vi", "en"], help="Mã kênh (vi/en)")
    parser.add_argument("--niche", default=None, help="Ngách: psychology, philosophy, life-skills")
    parser.add_argument("--format", dest="script_format", default=None, choices=["longform", "medium", "shorts"])
    parser.add_argument("--title", default=None, help="Tiêu đề dự kiến để đối chiếu khớp Hook")
    parser.add_argument("--min-score", type=float, default=8.5, help="Điểm tổng tối thiểu để PASS (mặc định: 8.5)")
    parser.add_argument("--min-dim-score", type=float, default=7.5, help="Điểm tối thiểu từng tiêu chí (mặc định: 7.5)")
    parser.add_argument("--prompt-out", default=None, help="Nơi lưu critic_prompt.md")
    parser.add_argument("--review-out", default=None, help="Nơi lưu/đọc script_review.json")
    parser.add_argument("--print-prompt", action="store_true", help="In toàn bộ critic prompt ra stdout")

    args = parser.parse_args()
    script_path = Path(args.script_file).resolve()
    if not script_path.is_file():
        sys.stderr.write(f"[LỖI] Không tìm thấy file kịch bản: {script_path}\n")
        sys.exit(1)

    channel, script_format = infer_channel_and_format(script_path, args.channel, args.script_format)
    raw = script_path.read_text(encoding="utf-8")
    _, voiceover, _ = extract_voiceover_and_header(raw)
    vo_sha = compute_sha256_short(voiceover)

    prompt_out = Path(args.prompt_out).resolve() if args.prompt_out else script_path.parent / "critic_prompt.md"
    review_out = Path(args.review_out).resolve() if args.review_out else script_path.parent / "script_review.json"

    qa_report = validate_script(
        script_path=script_path,
        channel=channel,
        niche=args.niche,
        script_format=script_format,
    )

    if args.mode == "prompt":
        prompt_text = build_critic_prompt(
            script_path=script_path,
            channel=channel,
            niche=args.niche,
            script_format=script_format,
            qa_report=qa_report,
            title=args.title,
            min_score=args.min_score,
            min_dim_score=args.min_dim_score,
        )
        prompt_out.parent.mkdir(parents=True, exist_ok=True)
        prompt_out.write_text(prompt_text, encoding="utf-8")
        if args.print_prompt:
            print(prompt_text)
        else:
            print(f"✅ Đã sinh gói chấm bài AI Biên Tập Viên Tầng 2 ({script_format}) tại: {prompt_out}")
            print(f"   🔑 Voiceover SHA256: {vo_sha}")
            print(f"   👉 Bước tiếp theo: Gửi `{prompt_out.name}` cho Subagent độc lập chấm điểm, lưu JSON vào `{review_out.name}`, rồi chạy:")
            print(f"      python scripts/review_script_ai.py --script-file \"{script_path}\" --format {script_format} --mode verify")
        sys.exit(0)

    if args.mode == "verify":
        if not review_out.is_file():
            sys.stderr.write(f"[LỖI] Không tìm thấy file phiếu chấm điểm: {review_out}\n")
            sys.exit(1)
        try:
            loaded = extract_json_object(review_out.read_text(encoding="utf-8"))
        except Exception as exc:
            sys.stderr.write(f"[LỖI] Không đọc được JSON hợp lệ từ {review_out}: {exc}\n")
            sys.exit(1)

        loaded_sha = str(loaded.get("voiceover_sha256", "")).strip()
        if loaded_sha and loaded_sha != vo_sha:
            sys.stderr.write(
                f"[LỖI] Phiếu chấm điểm đã cũ (hash={loaded_sha}) != bản script.md hiện tại (hash={vo_sha}).\n"
                "Hãy cho AI Biên Tập Viên chấm lại bản mới nhất!\n"
            )
            sys.exit(1)

        normalized = normalize_and_enforce_review(
            review_data=loaded,
            expected_vo_sha=vo_sha,
            channel=channel,
            script_format=script_format,
            min_score=args.min_score,
            min_dim_score=args.min_dim_score,
        )
        review_out.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
        print_review_scorecard(normalized)
        sys.exit(0 if normalized["verdict"] == "PASS" else 1)

    if args.mode == "api":
        repo_root = SCRIPTS_DIR.parent
        env_file = load_dotenv(repo_root / ".env")

        def _env(key: str, default: str = "") -> str:
            return os.environ.get(key) or env_file.get(key) or default

        base_url = _env("CRITIC_BASE_URL") or _env("OPENAI_BASE_URL")
        api_key = _env("CRITIC_API_KEY") or _env("OPENAI_API_KEY")
        model = _env("CRITIC_MODEL") or "gpt-4o-mini"

        if not base_url or not api_key:
            sys.stderr.write(
                "\n⚠️  [CHƯA CẤU HÌNH CRITIC API] Để dùng `--mode api`, hãy điền CRITIC_BASE_URL, CRITIC_API_KEY, CRITIC_MODEL vào `.env`.\n"
                "👉 Trong Antigravity, dùng `--mode prompt` kết hợp Subagent độc lập (miễn phí, không cần API rời).\n"
            )
            sys.exit(2)

        prompt_text = build_critic_prompt(
            script_path=script_path,
            channel=channel,
            niche=args.niche,
            script_format=script_format,
            qa_report=qa_report,
            title=args.title,
            min_score=args.min_score,
            min_dim_score=args.min_dim_score,
        )
        prompt_out.write_text(prompt_text, encoding="utf-8")

        print(f"🧠 [AI CRITIC TẦNG 2] Đang gửi kịch bản ({script_format}) tới `{model}` để chấm điểm độc lập...")
        try:
            raw_review = call_critic_api(prompt_text, base_url=base_url, api_key=api_key, model=model)
            normalized = normalize_and_enforce_review(
                review_data=raw_review,
                expected_vo_sha=vo_sha,
                channel=channel,
                script_format=script_format,
                min_score=args.min_score,
                min_dim_score=args.min_dim_score,
            )
        except Exception as exc:
            sys.stderr.write(f"[LỖI AI CRITIC API] {exc}\n")
            sys.exit(1)

        review_out.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
        print_review_scorecard(normalized)
        print(f"💾 Đã lưu phiếu chấm điểm tại: {review_out}")
        sys.exit(0 if normalized["verdict"] == "PASS" else 1)


if __name__ == "__main__":
    main()
