#!/usr/bin/env python3
"""
Dual-Layer Script QA Gate — Layer 1 (Deterministic Linter) + Layer 2 (AI Review Gatekeeper)
Cho hệ thống Stickman-Video song kênh:
  - 🇻🇳 Kênh Tiếng Việt (`vi` — Người Lữ Hành Khăn Choàng · B6 Terracotta-Amber)
  - 🇺🇸 Kênh Tiếng Anh (`en` — The Slate Ink Traveler · B6-EN Slate-Blue)
  - 3 Ngách: Tâm Lý Học (psychology) · Triết Lý (philosophy) · Kỹ Năng Sống (life-skills)
  - 3 Định dạng: longform (8-12p, 16:9) · medium (5-7p, 16:9) · shorts (45-90s, 9:16)

Tầng 1 (Python thuần - chạy < 1s, chính xác 100%):
  1. Kiểm tra khối lời thoại duy nhất (```text ... ```) cho CIT Voice Studio.
  2. Kiểm tra nhãn Hook [#01..#12] và chống trùng lặp với 4 tập gần nhất cùng kênh
     (quét cả `projects/topics-registry.json` lẫn các file `projects/<vi|en>/*/script.md`).
  3. Kiểm tra chống lặp mô-típ đồng hồ trong 6 tập gần nhất & danh sách đen câu mở đầu sáo rỗng.
  4. Kiểm tra độ dài Hard Hook (<=35 từ Long-form, <=24 từ Shorts), định mức số từ, nhịp câu & câu Punchline.
  5. Kiểm tra Anti-Listicle (tối đa <=2 lần Long-form, <=1 lần Shorts) và câu hỏi đối thoại `?`.
  6. Kiểm tra chuẩn sạch 100% cho TTS (cấm ngoặc đơn, ký tự markdown, emoji, chữ số/đơn vị/viết tắt chưa chuẩn hóa cho VieNeu-TTS).

Tầng 2 (Kiểm định phiếu chấm điểm của AI Biên Tập Viên - `script_review.json`):
  - Hỗ trợ 2 bộ trọng số riêng cho `longform`/`medium` (6 tiêu chí) và `shorts` (5 tiêu chí).
  - Tự tính lại điểm trọng số chống sai số cộng trừ của LLM.
  - Xác thực `voiceover_sha256` khớp đúng bản nháp `script.md` hiện tại.
  - Yêu cầu `overall_score >= 8.5` (tùy chỉnh qua `--min-ai-score`) và không tiêu chí nào `< 7.5`.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_REGISTRY_PATH = REPO_ROOT / "projects" / "topics-registry.json"

HOOK_CATALOG = {
    "#01": "Phá Vỡ Định Kiến (Contrarian Bomb)",
    "#02": "Lời Khuyên Phản Tác Dụng (Inverted Advice)",
    "#03": "Định Nghĩa Lại Bản Chất (Reframing Twist)",
    "#04": "Thí Nghiệm Kỳ Lạ (Weird Lab Study)",
    "#05": "Con Số Tương Phản Tàn Nhẫn (Brutal Stat Contrast)",
    "#06": "Bước Ngoặt Lịch Sử / Triết Gia (Historical Flashpoint)",
    "#07": "Đọc Vị Tim Đen (Mind-Reader Confession)",
    "#08": "Lát Cắt Kịch Tính 2 Câu (In Media Res Micro-Scene)",
    "#09": "Câu Nói Dối Tự Nhủ (Inner Voice Quote)",
    "#10": "Ẩn Dụ Thị Giác Ám Ảnh (Haunting Visual Metaphor)",
    "#11": "Cái Giá Vô Hình (Hidden Cost / Silent Theft)",
    "#12": "Nghịch Lý Không Lời Giải (The Impossible Paradox)",
}

CHANNEL_META = {
    "vi": {
        "name": "Người Lữ Hành Khăn Choàng (B6)",
        "folder": "projects/vi",
        "lang": "vi",
    },
    "en": {
        "name": "The Slate Ink Traveler (B6-EN)",
        "folder": "projects/en",
        "lang": "en",
    },
}

NICHE_ALIASES = {
    "psychology": "psychology",
    "tâm lý học": "psychology",
    "tam ly hoc": "psychology",
    "philosophy": "philosophy",
    "triết lý": "philosophy",
    "triet ly": "philosophy",
    "life-skills": "life-skills",
    "life skills": "life-skills",
    "kỹ năng sống": "life-skills",
    "ky nang song": "life-skills",
}

WORD_TARGETS = {
    "longform": {
        "ideal_min": 1200,
        "ideal_max": 1800,
        "hard_min": 950,
        "hard_max": 2250,
        "max_hard_hook_words": 35,
        "warn_first_two_words": 55,
        "min_questions": 4,
        "hard_min_questions": 1,
        "min_punchlines": 3,
        "max_listicle_markers": 2,
    },
    "medium": {
        "ideal_min": 750,
        "ideal_max": 1150,
        "hard_min": 600,
        "hard_max": 1350,
        "max_hard_hook_words": 35,
        "warn_first_two_words": 55,
        "min_questions": 3,
        "hard_min_questions": 1,
        "min_punchlines": 3,
        "max_listicle_markers": 2,
    },
    "shorts": {
        "ideal_min": 130,
        "ideal_max": 240,
        "hard_min": 95,
        "hard_max": 310,
        "max_hard_hook_words": 24,
        "warn_first_two_words": 42,
        "min_questions": 1,
        "hard_min_questions": 0,
        "min_punchlines": 2,
        "max_listicle_markers": 1,
    },
}

BANNED_OPENINGS_VI = [
    r"^có bao giờ bạn\b",
    r"^bạn đã bao giờ tự hỏi\b",
    r"^hôm nay chúng ta sẽ\b",
    r"^hôm nay mình sẽ\b",
    r"^trong video hôm nay\b",
    r"^chào mừng (?:các )?bạn\b",
    r"^chào mừng quý vị\b",
    r"^xin chào (?:các )?bạn\b",
    r"^xin chào quý vị\b",
]

BANNED_OPENINGS_EN = [
    r"^have you ever wondered\b",
    r"^today we(?:'re| are) going to\b",
    r"^in this video\b",
    r"^welcome back to\b",
    r"^welcome to\b",
    r"^hey (?:guys|everyone)\b",
    r"^hello everyone\b",
]

CLOCK_MOTIF_PATTERNS = [
    r"\bđồng hồ (?:đã )?điểm\b",
    r"\b(?:một|hai|ba|mười hai) giờ sáng\b",
    r"\b[123]\s*giờ sáng\b",
    r"\bclock strikes\b",
    r"\b(?:two|three) in the morning\b",
    r"\b[123]\s*a\.?m\.?\b",
    r"\b2:00\b|\b3:00\b",
]

LISTICLE_PATTERNS_VI = [
    r"\b(?:cơ chế|nguyên tắc|bước|lý do|dấu hiệu|bí quyết|quy luật|sai lầm|yếu tố)?\s*thứ\s+(?:nhất|hai|ba|tư|năm|sáu|bảy)\b",
    r"\b(?:một|hai|ba|bốn|năm)\s+là\b",
]

LISTICLE_PATTERNS_EN = [
    r"\b(?:firstly|secondly|thirdly|fourthly|fifthly)\b",
    r"\b(?:number one|number two|number three|number four)\b",
    r"\b(?:step one|step two|step three|reason one|reason two|reason three)\b",
]

FORMULAIC_PERSON_AB_PATTERNS_VI = [
    r"(?:hãy nhìn|có|lấy ví dụ về|hãy xem|hãy quan sát|nhìn vào|thử nhìn|xét)\s+(?:hai|2)\s+(?:con người|người|nhân viên|ứng viên|bạn trẻ|đồng nghiệp|chàng trai|cô gái)",
    r"(?:hãy tưởng tượng|tưởng tượng)\s+(?:hai|2)\s+(?:con người|người|nhân viên|đồng nghiệp)",
]

FORMULAIC_PERSON_AB_PATTERNS_EN = [
    r"(?:look at|take|imagine|consider)\s+(?:two|2)\s+(?:people|men|women|employees|candidates|friends|colleagues)",
]

EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001F9FF"
    "\U0001FA00-\U0001FAFF"
    "\U00002600-\U000027BF"
    "\U0001F1E0-\U0001F1FF"
    "]+",
    flags=re.UNICODE,
)

AI_CRITIC_WEIGHTS_LONGFORM = {
    "hook_impact": 0.25,
    "open_loop_payoff": 0.15,
    "micro_stories_vividness": 0.20,
    "mid_video_rehooks": 0.15,
    "channel_voice_and_flow": 0.15,
    "ending_shareability": 0.10,
}

AI_CRITIC_WEIGHTS_SHORTS = {
    "hook_impact": 0.30,
    "visual_metaphor_stickman": 0.25,
    "cognitive_twist": 0.20,
    "pacing_and_tts_flow": 0.15,
    "ending_engagement": 0.10,
}


def get_ai_weights(script_format: str) -> dict[str, float]:
    return AI_CRITIC_WEIGHTS_SHORTS if script_format == "shorts" else AI_CRITIC_WEIGHTS_LONGFORM


def normalize_niche(raw: str | None) -> str | None:
    if not raw:
        return None
    low = raw.strip().lower()
    return NICHE_ALIASES.get(low, low)


def compute_sha256_short(text: str) -> str:
    normalized = re.sub(r"\s+", " ", text.strip())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]


def infer_channel_and_format(
    script_path: Path,
    channel: str | None,
    script_format: str | None,
) -> tuple[str, str]:
    path_lower = str(script_path).replace("\\", "/").lower()
    inferred_ch = channel
    if not inferred_ch:
        if "/projects/en/" in path_lower:
            inferred_ch = "en"
        else:
            inferred_ch = "vi"

    inferred_fmt = script_format
    if not inferred_fmt:
        if "shorts" in script_path.parent.name.lower() or "short" in script_path.parent.name.lower():
            inferred_fmt = "shorts"
        else:
            inferred_fmt = "longform"

    return inferred_ch, inferred_fmt


def extract_voiceover_and_header(raw_content: str) -> tuple[str, str, int]:
    """Trích xuất khối ```text ... ``` và phần header bên ngoài."""
    matches = list(re.finditer(r"```text\s*\r?\n(.*?)\r?\n```", raw_content, re.DOTALL))
    block_count = len(matches)
    if block_count >= 1:
        voiceover = matches[0].group(1).strip()
        header = raw_content[: matches[0].start()].strip()
        return header, voiceover, block_count

    # Fallback cho kịch bản cũ chưa dùng code block ```text
    clean_lines = []
    header_lines = []
    for line in raw_content.splitlines():
        s = line.strip()
        if not s:
            continue
        if s.startswith("#") or s.startswith("|") or s.startswith("---") or s.startswith("**"):
            header_lines.append(s)
        else:
            clean_lines.append(s)
    return "\n".join(header_lines), "\n".join(clean_lines).strip(), 0


def extract_hook_code(raw_content: str, header: str) -> str | None:
    """Trích xuất mã Hook [#01..#12] từ header của script.md."""
    search_zone = header if header else raw_content[:1200]
    patterns = [
        r"(?:kiểu\s*hook|hook\s*type|hook\s*archetype)\s*[*:]+\s*\[?\s*(#(?:0[1-9]|1[0-2]))\b",
        r"\[\s*(#(?:0[1-9]|1[0-2]))\s*(?:-|—|:|\])",
    ]
    for pat in patterns:
        m = re.search(pat, search_zone, re.IGNORECASE)
        if m:
            return m.group(1)
    return None


def extract_setting_motif(header: str) -> str:
    m = re.search(r"(?:bối\s*cảnh|setting\s*motif)[^:*]*[*:]+\s*(.+)", header, re.IGNORECASE)
    return m.group(1).strip() if m else ""


def split_sentences(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text).strip()
    if not normalized:
        return []
    parts = re.split(r"(?<=[.?!…])\s+", normalized)
    return [p.strip() for p in parts if p.strip()]


def count_words(text: str) -> int:
    return len(re.findall(r"[^\s]+", text.strip()))


def load_recent_history(
    script_path: Path,
    channel: str,
    registry_path: Path | None = None,
    recent_dir: Path | None = None,
) -> list[dict]:
    """
    Hợp nhất lịch sử chống trùng Hook & mô-típ từ 2 nguồn:
    1. `projects/topics-registry.json` (bền vững ngay cả khi đã xóa thư mục video cũ)
    2. Các file `projects/<vi|en>/*/script.md` đang nằm trên đĩa
    Trả về tối đa 6 tập gần nhất cùng kênh (mới nhất đứng trước).
    """
    current_slug = script_path.parent.name
    current_resolved = script_path.resolve()
    entries_by_slug: dict[str, dict] = {}

    # Nguồn 1: topics-registry.json (thứ tự append -> đảo ngược để mới nhất lên đầu)
    reg_file = registry_path or DEFAULT_REGISTRY_PATH
    if reg_file.is_file():
        try:
            reg_data = json.loads(reg_file.read_text(encoding="utf-8"))
            produced = reg_data.get("produced_topics", [])
            for idx, item in enumerate(produced):
                if item.get("channel") != channel:
                    continue
                slug = str(item.get("slug", "")).strip()
                if not slug or slug == current_slug:
                    continue
                entries_by_slug[slug] = {
                    "project": slug,
                    "hook_code": item.get("hook_code"),
                    "setting_motif": item.get("setting_motif", ""),
                    "has_clock_motif": bool(item.get("has_clock_motif", False)),
                    "order_key": (item.get("date", ""), idx),
                    "source": "registry",
                }
        except Exception:
            pass

    # Nguồn 2: quét thư mục projects/<channel>/*/script.md trên đĩa
    scan_dir = recent_dir
    if scan_dir is None:
        cand = REPO_ROOT / "projects" / channel
        if cand.is_dir():
            scan_dir = cand

    if scan_dir and scan_dir.is_dir():
        for p in scan_dir.glob("*/script.md"):
            if p.resolve() == current_resolved:
                continue
            slug = p.parent.name
            try:
                mtime = p.stat().st_mtime
                raw = p.read_text(encoding="utf-8")
            except OSError:
                continue
            hdr, vo, _ = extract_voiceover_and_header(raw)
            hook_code = extract_hook_code(raw, hdr)
            motif = extract_setting_motif(hdr)
            opening_300 = vo[:300].lower()
            has_clock = any(re.search(pat, opening_300, re.IGNORECASE) for pat in CLOCK_MOTIF_PATTERNS)

            existing = entries_by_slug.get(slug)
            if existing:
                if hook_code and not existing.get("hook_code"):
                    existing["hook_code"] = hook_code
                if motif and not existing.get("setting_motif"):
                    existing["setting_motif"] = motif
                existing["has_clock_motif"] = existing.get("has_clock_motif", False) or has_clock
            else:
                entries_by_slug[slug] = {
                    "project": slug,
                    "hook_code": hook_code,
                    "setting_motif": motif,
                    "has_clock_motif": has_clock,
                    "order_key": (datetime.fromtimestamp(mtime).strftime("%Y-%m-%d"), int(mtime)),
                    "source": "disk",
                }

    ordered = sorted(entries_by_slug.values(), key=lambda x: x["order_key"], reverse=True)
    return ordered[:6]


def validate_ai_review(
    review_path: Path,
    expected_vo_sha256: str,
    script_format: str,
    min_ai_score: float,
    min_dim_score: float = 7.5,
) -> tuple[list[dict], list[dict], dict | None]:
    """Xác thực phiếu chấm điểm Tầng 2 (`script_review.json`) do AI Biên Tập Viên tạo."""
    errors: list[dict] = []
    warnings: list[dict] = []
    weights = get_ai_weights(script_format)

    if not review_path.is_file():
        errors.append({
            "code": "AI_REVIEW_MISSING",
            "message": f"Chưa có phiếu chấm điểm AI Tầng 2 tại: {review_path}. Hãy chạy AI Biên Tập Viên (review_script_ai.py) trước khi thu âm.",
        })
        return errors, warnings, None

    try:
        data = json.loads(review_path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append({
            "code": "AI_REVIEW_INVALID_JSON",
            "message": f"File script_review.json bị lỗi cú pháp JSON: {exc}",
        })
        return errors, warnings, None

    scores = data.get("scores", {})
    if not isinstance(scores, dict):
        errors.append({
            "code": "AI_REVIEW_NO_SCORES",
            "message": "script_review.json thiếu object `scores`.",
        })
        return errors, warnings, data

    missing_dims = [k for k in weights if k not in scores]
    if missing_dims:
        errors.append({
            "code": "AI_REVIEW_MISSING_DIMENSIONS",
            "message": f"script_review.json thiếu tiêu chí cho định dạng `{script_format}`: {', '.join(missing_dims)}",
        })
        return errors, warnings, data

    computed_total = 0.0
    low_dims = []
    parsed_scores = {}
    for dim, weight in weights.items():
        val = scores.get(dim)
        if isinstance(val, dict):
            val = val.get("score")
        try:
            num = float(val)
        except (TypeError, ValueError):
            errors.append({
                "code": "AI_REVIEW_BAD_SCORE",
                "message": f"Điểm của tiêu chí `{dim}` không hợp lệ: {val!r}",
            })
            return errors, warnings, data
        if not (0.0 <= num <= 10.0):
            errors.append({
                "code": "AI_REVIEW_SCORE_OUT_OF_RANGE",
                "message": f"Điểm của `{dim}` phải nằm trong [0, 10], nhận được: {num}",
            })
            return errors, warnings, data
        parsed_scores[dim] = round(num, 2)
        computed_total += num * weight
        if num < min_dim_score:
            low_dims.append(f"{dim}={num:.1f}")

    computed_total = round(computed_total, 2)
    review_sha = str(data.get("voiceover_sha256", "")).strip()
    if review_sha:
        if review_sha != expected_vo_sha256:
            errors.append({
                "code": "AI_REVIEW_STALE_HASH",
                "message": (
                    f"Phiếu chấm AI Tầng 2 đã cũ (hash={review_sha}) != bản script.md hiện tại "
                    f"(hash={expected_vo_sha256}). Hãy cho AI Biên Tập Viên chấm lại bản mới nhất!"
                ),
            })
    else:
        warnings.append({
            "code": "AI_REVIEW_NO_HASH",
            "message": "script_review.json không có trường `voiceover_sha256` để đối chiếu phiên bản kịch bản.",
        })

    verdict = str(data.get("verdict", "")).strip().upper()
    if verdict != "PASS":
        errors.append({
            "code": "AI_REVIEW_VERDICT_FAIL",
            "message": f"AI Biên Tập Viên Tầng 2 đánh giá CHƯA ĐẠT (verdict={verdict or 'EMPTY'}). Cần sửa kịch bản theo `priority_fixes`.",
        })

    if computed_total < min_ai_score:
        errors.append({
            "code": "AI_REVIEW_LOW_OVERALL",
            "message": f"Điểm tổng AI Tầng 2 đạt {computed_total:.2f}/10 (yêu cầu >= {min_ai_score:.1f}/10).",
        })

    if low_dims:
        errors.append({
            "code": "AI_REVIEW_LOW_DIMENSION",
            "message": f"Có tiêu chí dưới ngưỡng tối thiểu {min_dim_score:.1f}/10: {', '.join(low_dims)}",
        })

    summary = {
        "review_file": str(review_path),
        "verdict": verdict,
        "computed_overall_score": computed_total,
        "reported_overall_score": data.get("overall_score"),
        "scores": parsed_scores,
        "voiceover_sha256": review_sha,
        "priority_fixes": data.get("priority_fixes", []),
        "strengths": data.get("strengths", []),
    }
    return errors, warnings, summary


def validate_script(
    script_path: Path,
    channel: str | None = None,
    niche: str | None = None,
    script_format: str | None = None,
    registry_path: Path | None = None,
    recent_dir: Path | None = None,
    review_json: Path | None = None,
    require_ai_review: bool = False,
    min_ai_score: float = 8.5,
) -> dict:
    errors: list[dict] = []
    warnings: list[dict] = []

    if not script_path.is_file():
        return {
            "status": "FAIL",
            "script_file": str(script_path),
            "errors": [{"code": "FILE_NOT_FOUND", "message": f"Không tìm thấy file kịch bản: {script_path}"}],
            "warnings": [],
            "metrics": {},
        }

    channel, script_format = infer_channel_and_format(script_path, channel, script_format)
    lang = CHANNEL_META.get(channel, {}).get("lang", "vi")
    norm_niche = normalize_niche(niche)

    raw = script_path.read_text(encoding="utf-8")
    header, voiceover, block_count = extract_voiceover_and_header(raw)
    vo_sha256 = compute_sha256_short(voiceover)

    # 1. Kiểm tra khối ```text ... ```
    if block_count == 0:
        errors.append({
            "code": "MISSING_TEXT_CODE_BLOCK",
            "message": "Thiếu khối ```text ... ``` duy nhất bao trọn lời thoại TTS (xem references/hook-storytelling-engine.md).",
        })
    elif block_count > 1:
        errors.append({
            "code": "MULTIPLE_TEXT_CODE_BLOCKS",
            "message": f"Phát hiện {block_count} khối ```text ... ```. Toàn bộ lời thoại bắt buộc nằm trong DUY NHẤT 1 khối ```text.",
        })

    if not voiceover:
        errors.append({"code": "EMPTY_VOICEOVER", "message": "Nội dung lời thoại rỗng."})
        return {
            "status": "FAIL",
            "script_file": str(script_path),
            "channel": channel,
            "lang": lang,
            "niche": norm_niche,
            "format": script_format,
            "voiceover_sha256": vo_sha256,
            "errors": errors,
            "warnings": warnings,
            "metrics": {},
        }

    # 2. Kiểm tra Hook Header & Chống trùng 4 tập gần nhất (từ Registry + Disk)
    hook_code = extract_hook_code(raw, header)
    setting_motif = extract_setting_motif(header)
    recent_history = load_recent_history(script_path, channel, registry_path=registry_path, recent_dir=recent_dir)
    recent_4 = recent_history[:4]
    recent_6 = recent_history[:6]

    if not hook_code:
        errors.append({
            "code": "MISSING_HOOK_TAG",
            "message": "Bắt buộc ghi nhãn `**Kiểu Hook:** [#01..#12 - Tên kiểu Hook]` ở phần header của script.md để chống trùng lặp Hook.",
        })
    else:
        for prev in recent_4:
            if prev.get("hook_code") == hook_code:
                errors.append({
                    "code": "HOOK_DUPLICATE_RECENT_4",
                    "message": (
                        f"Trùng kiểu Hook {hook_code} ({HOOK_CATALOG.get(hook_code, '')}) với tập gần đây "
                        f"`{prev['project']}`. Luật bắt buộc: CẤM lặp kiểu Hook trong 4 tập gần nhất cùng kênh!"
                    ),
                })
                break

    # Kiểm tra mô-típ đồng hồ trong 6 tập gần nhất
    opening_300 = voiceover[:300].lower()
    has_clock_motif = any(re.search(pat, opening_300, re.IGNORECASE) for pat in CLOCK_MOTIF_PATTERNS)
    if has_clock_motif:
        clock_prev = [p["project"] for p in recent_6 if p.get("has_clock_motif")]
        if clock_prev:
            errors.append({
                "code": "CLOCK_MOTIF_REPEATED_6",
                "message": (
                    f"Lặp mô-típ tả giờ đồng hồ ở phần mở đầu (đã xuất hiện trong 6 tập gần nhất: "
                    f"{', '.join(clock_prev)}). Cấm lặp quá 1 lần mỗi 6 tập."
                ),
            })

    # 3. Kiểm tra Hard Hook & Banned Clichés
    target = WORD_TARGETS.get(script_format, WORD_TARGETS["longform"])
    sentences = split_sentences(voiceover)
    first_sentence = sentences[0] if sentences else ""
    first_sentence_lower = first_sentence.lower().lstrip("\"'“”‘’ ")
    banned_list = BANNED_OPENINGS_EN if lang == "en" else BANNED_OPENINGS_VI

    for pat in banned_list:
        if re.search(pat, first_sentence_lower, re.IGNORECASE):
            errors.append({
                "code": "BANNED_OPENING_CLICHE",
                "message": f"Câu mở đầu giây 00:00 dính mẫu sáo rỗng bị cấm: \"{first_sentence[:100]}\"",
            })
            break

    first_sentence_words = count_words(first_sentence)
    first_two_words = count_words(" ".join(sentences[:2])) if len(sentences) >= 2 else first_sentence_words
    max_hook_w = target["max_hard_hook_words"]
    if first_sentence_words > max_hook_w:
        errors.append({
            "code": "HARD_HOOK_TOO_LONG",
            "message": f"Câu Hard Hook đầu tiên quá dài ({first_sentence_words} từ > {max_hook_w} từ cho `{script_format}`). Cần đánh thẳng sắc lẹm ngay 3–6 giây đầu.",
        })
    elif first_two_words > target["warn_first_two_words"]:
        warnings.append({
            "code": "OPENING_SLIGHTLY_LONG",
            "message": f"2 câu mở đầu dài {first_two_words} từ (khuyến nghị <= {target['warn_first_two_words']} từ để giữ nhịp mở đầu thật gọn).",
        })

    # 4. Kiểm tra Định mức số từ, thời lượng & nhịp câu
    total_words = count_words(voiceover)
    wpm = 145 if lang == "en" else 155
    est_minutes = round(total_words / wpm, 2)
    est_seconds = round(total_words / wpm * 60.0, 1)

    if total_words < target["hard_min"]:
        errors.append({
            "code": "WORD_COUNT_TOO_SHORT",
            "message": (
                f"Tổng số từ quá ngắn: {total_words} từ (~{est_seconds}s / {est_minutes}p). "
                f"Định mức `{script_format}` là {target['ideal_min']}–{target['ideal_max']} từ (tối thiểu cứng {target['hard_min']})."
            ),
        })
    elif total_words > target["hard_max"]:
        errors.append({
            "code": "WORD_COUNT_TOO_LONG",
            "message": (
                f"Tổng số từ quá dài: {total_words} từ (~{est_seconds}s / {est_minutes}p). "
                f"Định mức `{script_format}` là {target['ideal_min']}–{target['ideal_max']} từ (tối đa cứng {target['hard_max']})."
            ),
        })
    elif not (target["ideal_min"] <= total_words <= target["ideal_max"]):
        warnings.append({
            "code": "WORD_COUNT_OUTSIDE_IDEAL",
            "message": (
                f"Tổng số từ {total_words} (~{est_seconds}s / {est_minutes}p) hơi lệch khung lý tưởng "
                f"{target['ideal_min']}–{target['ideal_max']} từ."
            ),
        })

    sentence_lengths = [count_words(s) for s in sentences] if sentences else []
    avg_sentence_len = round(sum(sentence_lengths) / len(sentence_lengths), 1) if sentence_lengths else 0.0
    overlong_sentences = [
        {"index": i + 1, "words": w, "snippet": sentences[i][:90]}
        for i, w in enumerate(sentence_lengths)
        if w > 40
    ]
    punchline_sentences = [s for s, w in zip(sentences, sentence_lengths) if 3 <= w <= 10]

    if avg_sentence_len > 26:
        warnings.append({
            "code": "AVG_SENTENCE_TOO_LONG",
            "message": f"Độ dài câu trung bình hơi cao ({avg_sentence_len} từ/câu; chuẩn nhịp thở TTS là 12–22 từ/câu).",
        })
    elif avg_sentence_len < 9 and script_format != "shorts":
        warnings.append({
            "code": "AVG_SENTENCE_TOO_SHORT",
            "message": f"Độ dài câu trung bình quá vụn ({avg_sentence_len} từ/câu; chuẩn 12–22 từ/câu).",
        })

    max_overlong = 1 if script_format == "shorts" else 5
    if len(overlong_sentences) > max_overlong:
        errors.append({
            "code": "TOO_MANY_OVERLONG_SENTENCES",
            "message": f"Có {len(overlong_sentences)} câu quá 40 từ dễ gây hụt hơi TTS. Ví dụ câu #{overlong_sentences[0]['index']}: \"{overlong_sentences[0]['snippet']}...\"",
        })
    elif overlong_sentences:
        warnings.append({
            "code": "OVERLONG_SENTENCES_FOUND",
            "message": f"Có {len(overlong_sentences)} câu dài > 40 từ nên tách dấu chấm. Ví dụ câu #{overlong_sentences[0]['index']}: \"{overlong_sentences[0]['snippet']}...\"",
        })

    if len(punchline_sentences) < target["min_punchlines"]:
        warnings.append({
            "code": "LOW_PACING_CONTRAST",
            "message": f"Chỉ có {len(punchline_sentences)} câu ngắn Punchline (3–10 từ; khuyến nghị >= {target['min_punchlines']}). Nên đập gãy nhịp để tạo điểm nhấn.",
        })

    # 5. Kiểm tra Anti-Listicle & Câu hỏi đối thoại
    listicle_patterns = LISTICLE_PATTERNS_EN if lang == "en" else LISTICLE_PATTERNS_VI
    listicle_hits = []
    for pat in listicle_patterns:
        for m in re.finditer(pat, voiceover, re.IGNORECASE):
            listicle_hits.append(m.group(0).strip())

    if len(listicle_hits) > target["max_listicle_markers"]:
        errors.append({
            "code": "ANTI_LISTICLE_VIOLATION",
            "message": (
                f"Vi phạm quy tắc chống liệt kê khô khan: phát hiện {len(listicle_hits)} mốc đánh số "
                f"({', '.join(listicle_hits[:6])}). Định dạng `{script_format}` tối đa <= {target['max_listicle_markers']} lần!"
            ),
        })

    question_count = voiceover.count("?")
    if question_count < target["hard_min_questions"]:
        errors.append({
            "code": "NO_INTERACTIVE_QUESTIONS",
            "message": "Kịch bản độc thoại một chiều (0 câu hỏi trực diện `?`). Cần cài câu hỏi kéo não người xem vào đối thoại.",
        })
    elif question_count < target["min_questions"]:
        warnings.append({
            "code": "FEW_INTERACTIVE_QUESTIONS",
            "message": f"Chỉ có {question_count} câu hỏi trực diện `?` (khuyến nghị >= {target['min_questions']} câu cho `{script_format}`).",
        })

    # Kiểm tra mẫu câu rập khuôn "Người A vs Người B" sáo rỗng
    ab_patterns = FORMULAIC_PERSON_AB_PATTERNS_EN if lang == "en" else FORMULAIC_PERSON_AB_PATTERNS_VI
    ab_hits = []
    for pat in ab_patterns:
        for m in re.finditer(pat, voiceover, re.IGNORECASE):
            ab_hits.append(m.group(0).strip())

    if ab_hits:
        warnings.append({
            "code": "FORMULAIC_PERSON_AB_TROPE",
            "message": (
                f"Phát hiện mẫu câu so sánh 2 người sáo rỗng ('{ab_hits[0]}'). "
                f"CẤM lạm dụng rập khuôn Người A vs Người B! Bắt buộc đổi sang các hình thái kể chuyện đa dạng: "
                f"POV nhập vai 'Chính bạn', case study nhân vật lịch sử/khoa học có thật, "
                f"xung đột 2 bản thể nội tâm, hoặc lát cắt hiện thực đời sống."
            ),
        })

    # 6. Kiểm tra chuẩn phát âm TTS (Zero-Clutter)
    tts_issues: list[str] = []

    if "(" in voiceover or ")" in voiceover:
        parens = re.findall(r"\([^)]{0,40}\)", voiceover)
        tts_issues.append(f"dấu ngoặc đơn `(...)` ({len(parens) or 'có'} vị trí, vd: {parens[0] if parens else '(...)'})")

    forbidden_chars = re.findall(r"[*_#\[\]{}`]", voiceover)
    if forbidden_chars:
        uniq = "".join(sorted(set(forbidden_chars)))
        tts_issues.append(f"ký tự markdown/lạ bị cấm: `{uniq}` ({len(forbidden_chars)} lần)")

    bullet_lines = [ln.strip()[:50] for ln in voiceover.splitlines() if re.match(r"^\s*(?:[-*•]|\d+[.)])\s+", ln)]
    if bullet_lines:
        tts_issues.append(f"dòng gạch đầu dòng/đánh số ({len(bullet_lines)} dòng, vd: `{bullet_lines[0]}`)")

    if re.search(r"--|\s-\s", voiceover):
        tts_issues.append("dấu gạch ngang rời ` - ` hoặc `--`")

    emojis = EMOJI_RE.findall(voiceover)
    if emojis:
        tts_issues.append(f"emoji ({len(emojis)} vị trí)")

    if tts_issues:
        errors.append({
            "code": "TTS_FORBIDDEN_SYMBOLS",
            "message": "Vi phạm chuẩn sạch TTS trong khối `text`: " + "; ".join(tts_issues) + ".",
        })

    exclamations = voiceover.count("!")
    if exclamations > 6:
        errors.append({
            "code": "TOO_MANY_EXCLAMATIONS",
            "message": f"Có {exclamations} dấu chấm than `!` (gây chói âm lượng TTS). Hãy thay phần lớn bằng dấu chấm `.`.",
        })
    elif exclamations > 3:
        warnings.append({
            "code": "HIGH_EXCLAMATION_COUNT",
            "message": f"Có {exclamations} dấu chấm than `!` (nên hạn chế <= 3 lần để giữ tông giọng đầm chắc).",
        })

    currency_or_pct = re.findall(
        r"(?:\d+(?:[.,]\d+)?\s*%|\$\s*\d+[.,\d]*[kKmMbB]?|\b\d+(?:[.,]\d+)?\s*(?:USD|VND|EUR|VNĐ|k|K|M|B)\b|[%$€£₫])",
        voiceover,
    )
    if currency_or_pct:
        errors.append({
            "code": "TTS_UNSPELLED_UNITS",
            "message": f"Phát hiện ký hiệu tiền tệ/phần trăm/đơn vị chưa viết thành chữ: {', '.join(currency_or_pct[:6])}",
        })

    raw_digits = re.findall(r"\b\d+(?:[.,/]\d+)?\b", voiceover)
    if raw_digits:
        if lang == "vi":
            errors.append({
                "code": "TTS_UNSPELLED_DIGITS",
                "message": (
                    f"Phát hiện {len(raw_digits)} chữ số chưa viết thành chữ tiếng Việt cho VieNeu-TTS "
                    f"(vd: {', '.join(raw_digits[:8])}). Bắt buộc viết bằng chữ!"
                ),
            })
        else:
            warnings.append({
                "code": "TTS_RAW_DIGITS_EN",
                "message": f"Có {len(raw_digits)} chữ số dạng số ({', '.join(raw_digits[:6])}); kiểm tra xem Kokoro có đọc tự nhiên không.",
            })

    if lang == "vi":
        dot_initials = re.findall(r"\b(?:[A-Z]\.){2,}", voiceover)
        if dot_initials:
            warnings.append({
                "code": "TTS_DOT_ABBREVIATIONS_VI",
                "message": f"Phát hiện tên viết tắt có dấu chấm ({', '.join(dot_initials[:4])}) dễ làm VieNeu-TTS ngắt câu sai. Nên bỏ chữ viết tắt (vd: viết 'nhà tâm lý học Skinner').",
            })

    # 7. Kiểm tra Tầng 2 (`script_review.json`) nếu được yêu cầu
    ai_review_summary = None
    effective_review_path = review_json
    if effective_review_path is None and require_ai_review:
        effective_review_path = script_path.parent / "script_review.json"

    if effective_review_path is not None:
        r_errs, r_warns, ai_review_summary = validate_ai_review(
            effective_review_path,
            expected_vo_sha256=vo_sha256,
            script_format=script_format,
            min_ai_score=min_ai_score,
        )
        errors.extend(r_errs)
        warnings.extend(r_warns)

    status = "PASS" if not errors else "FAIL"

    return {
        "status": status,
        "checked_at": datetime.now().isoformat(timespec="seconds"),
        "script_file": str(script_path),
        "channel": channel,
        "lang": lang,
        "niche": norm_niche,
        "format": script_format,
        "voiceover_sha256": vo_sha256,
        "hook_code": hook_code,
        "hook_name": HOOK_CATALOG.get(hook_code, "") if hook_code else "",
        "setting_motif": setting_motif,
        "recent_hooks_checked": [
            {"project": r["project"], "hook_code": r.get("hook_code"), "source": r.get("source")}
            for r in recent_4
        ],
        "metrics": {
            "total_words": total_words,
            "estimated_seconds": est_seconds,
            "estimated_minutes": est_minutes,
            "sentence_count": len(sentences),
            "avg_words_per_sentence": avg_sentence_len,
            "first_sentence_words": first_sentence_words,
            "first_two_sentences_words": first_two_words,
            "punchline_sentences": len(punchline_sentences),
            "overlong_sentences_gt_40w": len(overlong_sentences),
            "listicle_markers_count": len(listicle_hits),
            "question_count": question_count,
            "exclamation_count": exclamations,
            "has_clock_motif": has_clock_motif,
        },
        "ai_review": ai_review_summary,
        "errors": errors,
        "warnings": warnings,
    }


def print_report(report: dict) -> None:
    status = report["status"]
    icon = "✅" if status == "PASS" else "❌"
    m = report.get("metrics", {})
    print("\n" + "=" * 70)
    print(f"{icon} [STICKMAN SCRIPT QA — TẦNG 1{' + TẦNG 2' if report.get('ai_review') else ''}] KẾT QUẢ: {status}")
    print("=" * 70)
    print(f"  📄 Kịch bản    : {report.get('script_file')}")
    print(f"  📺 Kênh / Format: {report.get('channel')} ({report.get('lang')}) | {report.get('format')} | Ngách: {report.get('niche') or 'auto'}")
    print(f"  🪝 Kiểu Hook   : {report.get('hook_code') or 'CHƯA GẮN NHÃN'} {report.get('hook_name', '')}")
    print(f"  🔑 Hash lời đọc: {report.get('voiceover_sha256')}")
    if m:
        print(
            f"  📊 Định lượng  : {m['total_words']} từ (~{m['estimated_seconds']}s / {m['estimated_minutes']}p) | "
            f"Câu TB: {m['avg_words_per_sentence']} từ | Hook đầu: {m['first_sentence_words']} từ"
        )
        print(
            f"  🎯 Giữ chân    : {m['question_count']} câu hỏi `?` | "
            f"{m['punchline_sentences']} câu Punchline | "
            f"{m['listicle_markers_count']} mốc liệt kê | "
            f"{m['exclamation_count']} dấu `!`"
        )
    recent = report.get("recent_hooks_checked", [])
    if recent:
        summary_recent = ", ".join(f"{r['project']}:{r['hook_code'] or '?'}" for r in recent)
        print(f"  🔁 4 tập gần   : {summary_recent}")

    ai_rev = report.get("ai_review")
    if ai_rev:
        print("-" * 70)
        print(
            f"  🧠 AI CRITIC TẦNG 2: {ai_rev['verdict']} | "
            f"Điểm tổng: {ai_rev['computed_overall_score']:.2f}/10"
        )
        dims = ai_rev.get("scores", {})
        if dims:
            dim_str = " | ".join(f"{k}={v:.1f}" for k, v in dims.items())
            print(f"     Chi tiết  : {dim_str}")

    if report["errors"]:
        print("-" * 70)
        print(f"  ❌ LỖI BẮT BUỘC SỬA ({len(report['errors'])}):")
        for idx, e in enumerate(report["errors"], 1):
            print(f"     {idx}. [{e['code']}] {e['message']}")

    if report["warnings"]:
        print("-" * 70)
        print(f"  ⚠️  CẢNH BÁO TỐI ƯU THÊM ({len(report['warnings'])}):")
        for idx, w in enumerate(report["warnings"], 1):
            print(f"     {idx}. [{w['code']}] {w['message']}")

    print("=" * 70 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Kiểm duyệt kịch bản tự động Tầng 1 (Python Linter) & cổng xác thực Tầng 2 (Stickman-Video)"
    )
    parser.add_argument("--script-file", required=True, help="Đường dẫn tới file script.md")
    parser.add_argument("--channel", default=None, choices=["vi", "en"], help="Kênh sản xuất (vi/en)")
    parser.add_argument("--niche", default=None, help="Ngách: psychology, philosophy, life-skills")
    parser.add_argument(
        "--format",
        dest="script_format",
        default=None,
        choices=list(WORD_TARGETS.keys()),
        help="Định dạng: longform (8-12p), medium (5-7p), shorts (45-90s)",
    )
    parser.add_argument("--registry", default=None, help="Đường dẫn file topics-registry.json (mặc định: projects/topics-registry.json)")
    parser.add_argument("--recent-dir", default=None, help="Thư mục kênh chứa các tập gần nhất")
    parser.add_argument("--review-json", default=None, help="Đường dẫn file script_review.json từ AI Biên Tập Viên Tầng 2")
    parser.add_argument("--require-ai-review", action="store_true", help="Bắt buộc có phiếu script_review.json ĐẠT chuẩn Tầng 2")
    parser.add_argument("--min-ai-score", type=float, default=8.5, help="Điểm tổng tối thiểu của AI Tầng 2 (mặc định: 8.5)")
    parser.add_argument("--json-out", default=None, help="Lưu báo cáo JSON chi tiết (vd: script_qa_report.json)")
    parser.add_argument("--quiet", action="store_true", help="Chỉ xuất exit code và file JSON")

    args = parser.parse_args()
    script_path = Path(args.script_file).resolve()
    reg_path = Path(args.registry).resolve() if args.registry else None
    recent_dir = Path(args.recent_dir).resolve() if args.recent_dir else None
    review_json = Path(args.review_json).resolve() if args.review_json else None

    report = validate_script(
        script_path=script_path,
        channel=args.channel,
        niche=args.niche,
        script_format=args.script_format,
        registry_path=reg_path,
        recent_dir=recent_dir,
        review_json=review_json,
        require_ai_review=args.require_ai_review,
        min_ai_score=args.min_ai_score,
    )

    if args.json_out:
        out_path = Path(args.json_out).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    if not args.quiet:
        print_report(report)

    sys.exit(0 if report["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
