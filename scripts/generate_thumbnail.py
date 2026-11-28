#!/usr/bin/env python3
"""
Stickman-Video 16:9 YouTube Thumbnail CTR Generator (Dual-Channel B6 & B6-EN)
- Chuẩn khung hình: 16:9 Full HD (1920x1080).
- Tự động phân tích vùng không gian âm (Negative Space Mapping) để 0% che nhân vật B6/B6-EN
  và né tuyệt đối góc dưới bên phải (nơi YouTube hiển thị mốc thời lượng video).
- AI Linguistic Typography (Smart Semantic Break):
  * Tiêu đề ngắn chuẩn CTR di động (vi: 4–7 từ, en: 2–7 từ).
  * Bảo vệ 100% từ ghép tiếng Việt ngách Tâm Lý · Triết Lý · Kỹ Năng Sống, cấm từ cô phụ 1 chữ.
- 2 Chế độ phối màu tự động theo nền:
  * Light Paper Editorial (mặc định cho B6 / B6-EN / B1 / B2 / B5 trên giấy kem):
    Mực than đậm (#18181B) + Màu nhấn đồng bộ khăn thương hiệu:
    - B6 (vi): Cam đất Terracotta-Amber (#C25224)
    - B6-EN (en): Xanh lam trầm Muted Slate-Blue (#2D5473)
  * Dark Cinematic (tự động kích hoạt cho B3 / B4 / A6 hoặc nền tối):
    Vàng chanh (#FFE600) + Trắng tuyết (#FFFFFF) với viền đậm & đổ bóng sâu.
- Hỗ trợ 2 nguồn ảnh nền:
  1. Dùng ảnh có sẵn (`--base-image projects/vi/<slug>/scenes/shot_34.png`)
  2. Tự sinh ảnh bìa `thumbnail_base.png` mới qua Agnes AI (`--prompt "<mô tả cảnh>"`)
     có khóa DNA nhân vật B6/B6-EN đứng bên phải và khoảng trống sạch bên trái.

Cách dùng:
  # Cách 1: Dùng cảnh có sẵn (nhanh 1 giây, 0 tốn API ảnh)
  python scripts/generate_thumbnail.py \
      --base-image projects/vi/emotional-contagion-psychology/scenes/shot_34.png \
      --title "BẠN KHÔNG TỰ NHIÊN BUỒN" \
      --style B6 \
      --output projects/vi/emotional-contagion-psychology/output/thumbnail.png

  # Cách 2: Sinh ảnh nền chuyên biệt mới qua Agnes AI rồi ghép chữ CTR
  python scripts/generate_thumbnail.py \
      --prompt "Protagonist stands calm and dry on the right behind a tall transparent glass pane while dark ink rain pours outside" \
      --title "LÂY LAN\nCẢM XÚC TIÊU CỰC" \
      --style B6 \
      --output projects/vi/emotional-contagion-psychology/output/thumbnail.png
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parent.parent
AGNES_MEDIA_MJS = REPO_ROOT / "skills" / "directing-stickman-videos" / "scripts" / "agnes-media.mjs"

# Bộ từ điển từ ghép bất khả phân cho ngách Tâm Lý Học · Triết Lý · Kỹ Năng Sống
VIETNAMESE_COMPOUNDS = {
    # Tâm lý học & Cảm xúc
    "lây lan", "cảm xúc", "tiêu cực", "tích cực", "kiệt sức", "tâm lý", "hành vi",
    "ranh giới", "thấu cảm", "hòa tan", "vô thức", "tiềm thức", "nhận thức", "ảo giác",
    "điểm mù", "thao túng", "bản năng", "trực giác", "nội tâm", "tổn thương", "chữa lành",
    "tự nhiên", "người lạ", "đám đông", "tâm điểm", "giả mạo", "hội chứng", "hiệu ứng",
    "thả thính", "ngắt quãng", "mập mờ", "tế bào", "thần kinh", "não bộ", "lo âu",
    "trầm cảm", "cô đơn", "bất an", "tự ti", "tự tin", "hoàn hảo", "áp lực", "căng thẳng",
    "phán xét", "so sánh", "lựa chọn", "nghịch lý", "tê liệt", "quyết định", "độc hại",
    "hào quang", "sừng quỷ", "mỏ neo", "chìm đắm", "cơn mưa", "tấm kính", "chiếc bẫy",
    # Triết lý & Khắc kỷ
    "triết lý", "khắc kỷ", "số phận", "nghịch cảnh", "kiểm soát", "buông bỏ", "chấp niệm",
    "tĩnh lặng", "bản lĩnh", "tự do", "ý nghĩa", "cuộc đời", "cuộc sống", "thời gian",
    "vô thường", "tỉnh thức", "suy tưởng", "tri thức", "chân lý", "phản biện", "tư duy",
    # Kỹ năng sống & Hiệu suất
    "kỷ luật", "tự thân", "động lực", "thói quen", "trì hoãn", "năng lượng", "năng suất",
    "bận rộn", "tập trung", "giao tiếp", "từ chối", "cả nể", "hài lòng", "thành công",
    "thất bại", "chi phí", "chi phí chìm", "bẫy chi phí", "hệ thống", "quy luật",
    "nguyên tắc", "bí mật", "sự thật", "mạng xã hội", "điện thoại", "màn hình",
    "công sở", "đồng nghiệp", "gia đình", "mối quan hệ", "con người", "thế giới",
    # Cụm tiếng Anh CTR bất khả phân
    "emotional contagion", "mirror neurons", "sunk cost", "impostor syndrome",
    "dunning kruger", "spotlight effect", "toxic positivity", "toxic productivity",
    "paradox of choice", "intermittent reinforcement", "cheap dopamine", "dopamine trap",
    "amor fati", "memento mori", "inner child", "people pleaser", "self sabotage",
    "your brain", "your mind", "mental health", "quiet burnout", "real reason",
}

ENGLISH_DANGLING_WORDS = {
    "the", "a", "an", "at", "in", "on", "of", "to", "for", "with", "by", "from",
    "your", "my", "our", "why", "how", "and", "or", "but", "not", "is", "are",
}

STYLE_PALETTES = {
    "b6": {
        "mode": "light",
        "primary": (24, 24, 27, 255),      # Deep Editorial Ink (#18181B)
        "accent": (194, 82, 36, 255),      # Signature Terracotta-Amber (#C25224)
        "bar": (194, 82, 36, 255),
        "wash": (250, 248, 243),           # Warm Off-White Sketchbook Paper
        "halo": (250, 248, 243, 235),
        "font_pref": "editorial_sans",
    },
    "b6-vi": None,  # alias -> b6
    "b6-en": {
        "mode": "light",
        "primary": (24, 24, 27, 255),      # Deep Editorial Ink (#18181B)
        "accent": (45, 84, 115, 255),      # Signature Muted Slate-Blue (#2D5473)
        "bar": (45, 84, 115, 255),
        "wash": (250, 248, 243),
        "halo": (250, 248, 243, 235),
        "font_pref": "editorial_sans",
    },
    "b1": {
        "mode": "light",
        "primary": (20, 20, 20, 255),
        "accent": (190, 42, 42, 255),      # Editorial Crimson Accent
        "bar": (190, 42, 42, 255),
        "wash": (252, 252, 250),
        "halo": (252, 252, 250, 235),
        "font_pref": "editorial_sans",
    },
    "b2": {
        "mode": "light",
        "primary": (31, 41, 55, 255),
        "accent": (194, 82, 36, 255),
        "bar": (194, 82, 36, 255),
        "wash": (250, 247, 240),
        "halo": (250, 247, 240, 235),
        "font_pref": "editorial_serif",
    },
    "b5": {
        "mode": "light",
        "primary": (24, 24, 27, 255),
        "accent": (37, 99, 235, 255),
        "bar": (37, 99, 235, 255),
        "wash": (250, 250, 252),
        "halo": (250, 250, 252, 235),
        "font_pref": "editorial_sans",
    },
    "dark": {
        "mode": "dark",
        "primary": (255, 255, 255, 255),
        "accent": (255, 230, 0, 255),
        "bar": (255, 230, 0, 255),
        "wash": (10, 14, 22),
        "halo": (0, 0, 0, 235),
        "font_pref": "editorial_sans",
    },
}

DNA_BASE_STYLE = (
    "Minimalist 2D hand-drawn editorial line art illustration, clean uniform black ink linework "
    "on warm off-white sketchbook paper background, strictly flat 2D minimal shading, no gradients, "
    "no 3D rendering, no text, no letters, no words, no numbers."
)
DNA_THUMBNAIL_LAYOUT = (
    "16:9 YouTube thumbnail cover composition, place the protagonist and main dramatic visual metaphor "
    "prominently on the RIGHT HALF of the frame, leaving clean open warm off-white negative space "
    "on the LEFT HALF for editorial typography."
)
DNA_B6_VI = (
    "Protagonist Character DNA (LOCKED): minimalist slender hand-drawn figure with a clean smooth round white bald head "
    "(no hair, no nose, no ears), simple expressive small black-ink dot eyes and subtle curved eyebrows, wearing thin "
    "round black wire glasses, a crisp white minimalist knee-length tailored overcoat drawn in clean black ink outlines "
    "with simple slim white trousers and dark ink shoes, and ONE signature flowing muted terracotta-amber knitted scarf "
    "wrapped neatly around the neck with two short tails hanging down the front. "
    "Color Lock: ONLY the protagonist wears the warm muted terracotta-amber scarf and thin round wire glasses; "
    "secondary people are faint monochrome black-and-white ink outlines without color, scarves, or glasses."
)
DNA_B6_EN = (
    "Protagonist Character DNA (LOCKED): minimalist slender hand-drawn figure with a clean smooth round white bald head "
    "(no hair, no nose, no ears), simple expressive small black-ink dot eyes and subtle curved eyebrows, wearing thin "
    "round black wire glasses, a crisp white minimalist knee-length tailored overcoat drawn in clean black ink outlines "
    "with simple slim white trousers and dark ink shoes, and ONE signature flowing muted slate-blue knitted scarf "
    "wrapped neatly around the neck with two short tails hanging down the front. "
    "Color Lock: ONLY the protagonist wears the calm muted slate-blue scarf and thin round wire glasses; "
    "secondary people are faint monochrome black-and-white ink outlines without color, scarves, or glasses."
)


def count_words(title: str) -> list[str]:
    tokens = re.split(r"[\s\-–—/]+", title.replace("\\n", " ").strip())
    return [t for t in tokens if t and not re.fullmatch(r"[^\w\d%]+", t)]


def resolve_palette(style: str, base_img: Image.Image) -> dict:
    key = (style or "b6").strip().lower()
    if key == "b6-vi":
        key = "b6"
    if key in ("b3", "b4", "a6"):
        return STYLE_PALETTES["dark"]
    if key in STYLE_PALETTES and STYLE_PALETTES[key] is not None:
        pal = STYLE_PALETTES[key]
    else:
        pal = STYLE_PALETTES["b6"]

    # Auto-fallback sang dark mode nếu ảnh nền thực tế tối (mean luminance < 110)
    mean_lum = float(ImageStat.Stat(base_img.convert("L")).mean[0])
    if mean_lum < 110.0 and pal["mode"] == "light":
        return STYLE_PALETTES["dark"]
    return pal


def find_font(font_size: int, pref: str = "editorial_sans") -> ImageFont.FreeTypeFont:
    local_fonts_dir = REPO_ROOT / "skills" / "directing-stickman-videos" / "assets" / "fonts"
    candidates: list[str] = []
    if local_fonts_dir.is_dir():
        for ext in ("*.ttf", "*.otf"):
            for p in sorted(local_fonts_dir.glob(ext)):
                if any(k in p.name.lower() for k in ("bold", "black", "heavy", "slab")):
                    candidates.append(str(p))

    if pref == "editorial_serif":
        candidates.extend([
            "C:\\Windows\\Fonts\\constanb.ttf",
            "C:\\Windows\\Fonts\\cambriab.ttf",
            "C:\\Windows\\Fonts\\palab.ttf",
            "C:\\Windows\\Fonts\\timesbd.ttf",
        ])
    else:
        candidates.extend([
            "C:\\Windows\\Fonts\\segoeuib.ttf",
            "C:\\Windows\\Fonts\\arialbd.ttf",
            "C:\\Windows\\Fonts\\calibrib.ttf",
            "C:\\Windows\\Fonts\\constanb.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ])

    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, font_size)
            except Exception:
                continue
    return ImageFont.load_default()


def fit_cover_16_9(img: Image.Image, target_w: int = 1920, target_h: int = 1080) -> Image.Image:
    src_w, src_h = img.size
    if src_w == target_w and src_h == target_h:
        return img
    scale = max(target_w / src_w, target_h / src_h)
    new_w = int(round(src_w * scale))
    new_h = int(round(src_h * scale))
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def analyze_negative_space(img: Image.Image, forced_zone: str | None = None) -> dict:
    """Quét mật độ nét vẽ (Edge + Ink Density) để tự chọn nửa khung hình trống nhất."""
    W, H = img.size
    gray = img.convert("L")
    edges = gray.filter(ImageFilter.FIND_EDGES)

    # Tránh rìa biên 40px khi đo mật độ bằng Pillow ImageStat (không cần numpy)
    left_box = (40, 40, W // 2, H - 40)
    right_box = (W // 2, 40, W - 40, H - 40)

    le_stat = ImageStat.Stat(edges.crop(left_box))
    re_stat = ImageStat.Stat(edges.crop(right_box))
    lg_stat = ImageStat.Stat(gray.crop(left_box))
    rg_stat = ImageStat.Stat(gray.crop(right_box))

    left_score = float(le_stat.mean[0] + lg_stat.stddev[0] * 0.6)
    right_score = float(re_stat.mean[0] + rg_stat.stddev[0] * 0.6)

    if forced_zone and forced_zone.lower() in ("left", "right"):
        zone = forced_zone.upper()
        subject_side = "RIGHT" if zone == "LEFT" else "LEFT"
    elif right_score >= left_score * 1.10:
        subject_side = "RIGHT"
        zone = "LEFT"
    elif left_score >= right_score * 1.10:
        subject_side = "LEFT"
        zone = "RIGHT"
    else:
        subject_side = "BALANCED"
        zone = "LEFT"

    if zone == "LEFT":
        safe_x = 96
        safe_max_w = int(W * 0.48)
    else:
        safe_x = int(W * 0.49)
        safe_max_w = int(W * 0.45)

    return {
        "subject_side": subject_side,
        "recommended_zone": zone,
        "left_score": left_score,
        "right_score": right_score,
        "safe_x": safe_x,
        "safe_max_w": safe_max_w,
        "W": W,
        "H": H,
    }


def is_compound_cut(line_words: list[str], next_line_words: list[str]) -> tuple[bool, str]:
    if not line_words or not next_line_words:
        return False, ""
    b2 = f"{line_words[-1]} {next_line_words[0]}".lower()
    if b2 in VIETNAMESE_COMPOUNDS:
        return True, b2.upper()
    if len(line_words) >= 2:
        b3a = f"{line_words[-2]} {line_words[-1]} {next_line_words[0]}".lower()
        if b3a in VIETNAMESE_COMPOUNDS:
            return True, b3a.upper()
    if len(next_line_words) >= 2:
        b3b = f"{line_words[-1]} {next_line_words[0]} {next_line_words[1]}".lower()
        if b3b in VIETNAMESE_COMPOUNDS:
            return True, b3b.upper()
    return False, ""


def smart_semantic_break(
    title: str,
    safe_max_w: int,
    base_img: Image.Image,
    font_pref: str,
    forced_font_size: int | None = None,
) -> tuple[list[str], int, ImageFont.FreeTypeFont, list[str]]:
    dummy_draw = ImageDraw.Draw(base_img)
    words_clean = count_words(title)

    detected_compounds = []
    text_lower = " ".join(words_clean).lower()
    for comp in sorted(VIETNAMESE_COMPOUNDS, key=lambda x: -len(x)):
        if comp in text_lower:
            detected_compounds.append(comp.upper())
            text_lower = text_lower.replace(comp, " ")

    explicit_candidate = None
    if "\n" in title or "\\n" in title:
        raw_lines = [ln.strip().upper() for ln in title.replace("\\n", "\n").split("\n") if ln.strip()]
        lw_lists = [count_words(ln) for ln in raw_lines]
        bad_cut = any(is_compound_cut(lw_lists[i], lw_lists[i + 1])[0] for i in range(len(lw_lists) - 1))
        has_orphan = any(len(lw) == 1 for lw in lw_lists) and len(raw_lines) > 1
        if not bad_cut and not has_orphan:
            explicit_candidate = raw_lines

    candidates: list[tuple[float, list[str]]] = []
    n = len(words_clean)
    if n <= 3:
        candidates.append((0.0, [" ".join(words_clean).upper()]))
    else:
        for i in range(1, n):
            l1, l2 = words_clean[:i], words_clean[i:]
            pen = 0.0
            if is_compound_cut(l1, l2)[0]:
                pen += 100000.0
            if l1[-1].lower() in ENGLISH_DANGLING_WORDS:
                pen += 60000.0
            if len(l1) == 1 or len(l2) == 1:
                pen += 40000.0
            pen += abs(len(" ".join(l1)) - len(" ".join(l2))) * 10.0
            candidates.append((pen, [" ".join(l1).upper(), " ".join(l2).upper()]))

        if n >= 5:
            for i in range(1, n - 1):
                for j in range(i + 1, n):
                    l1, l2, l3 = words_clean[:i], words_clean[i:j], words_clean[j:]
                    pen = 3000.0
                    if is_compound_cut(l1, l2)[0] or is_compound_cut(l2, l3)[0]:
                        pen += 100000.0
                    if l1[-1].lower() in ENGLISH_DANGLING_WORDS or l2[-1].lower() in ENGLISH_DANGLING_WORDS:
                        pen += 60000.0
                    if len(l1) == 1 or len(l2) == 1 or len(l3) == 1:
                        pen += 40000.0
                    lens = [len(" ".join(l1)), len(" ".join(l2)), len(" ".join(l3))]
                    avg_l = sum(lens) / 3.0
                    pen += sum((x - avg_l) ** 2 for x in lens) * 0.5
                    candidates.append((pen, [" ".join(l1).upper(), " ".join(l2).upper(), " ".join(l3).upper()]))

    candidates.sort(key=lambda x: x[0])
    chosen_lines = explicit_candidate or (candidates[0][1] if candidates else [" ".join(words_clean).upper()])

    target_size = forced_font_size or (136 if len(chosen_lines) == 1 else (118 if len(chosen_lines) == 2 else 102))
    font = find_font(target_size, pref=font_pref)

    def _max_w(lns: list[str], fnt: ImageFont.FreeTypeFont) -> int:
        return max(dummy_draw.textbbox((0, 0), ln, font=fnt)[2] - dummy_draw.textbbox((0, 0), ln, font=fnt)[0] for ln in lns)

    for _ in range(18):
        if _max_w(chosen_lines, font) > safe_max_w and target_size > 68:
            target_size -= 4
            font = find_font(target_size, pref=font_pref)
        else:
            break

    if _max_w(chosen_lines, font) > safe_max_w and len(chosen_lines) == 2 and not forced_font_size:
        three_ok = [c for c in candidates if len(c[1]) == 3 and c[0] < 50000]
        if three_ok:
            chosen_lines = three_ok[0][1]
            target_size = 102
            font = find_font(target_size, pref=font_pref)
            for _ in range(18):
                if _max_w(chosen_lines, font) > safe_max_w and target_size > 68:
                    target_size -= 4
                    font = find_font(target_size, pref=font_pref)
                else:
                    break

    return chosen_lines, target_size, font, detected_compounds


def generate_agnes_background(scene_prompt: str, out_bg_path: Path, style: str = "B6", model: str = "agnes-image-2.5-flash") -> None:
    """Sinh ảnh nền thumbnail 16:9 chuyên biệt qua Agnes AI giữ khóa DNA B6 / B6-EN."""
    st = (style or "B6").strip().upper()
    if st == "B6-EN":
        full_prompt = f"{DNA_BASE_STYLE} {DNA_THUMBNAIL_LAYOUT} {DNA_B6_EN} Scene: {scene_prompt}"
    elif st in ("B6", "B6-VI"):
        full_prompt = f"{DNA_BASE_STYLE} {DNA_THUMBNAIL_LAYOUT} {DNA_B6_VI} Scene: {scene_prompt}"
    else:
        full_prompt = f"{DNA_BASE_STYLE} {DNA_THUMBNAIL_LAYOUT} Scene: {scene_prompt}"

    node_code = (
        "import { generateAgnesImage } from './skills/directing-stickman-videos/scripts/agnes-media.mjs';"
        "const args = JSON.parse(process.argv[1]);"
        "await generateAgnesImage({ prompt: args.prompt, output: args.output, model: args.model, aspect: '16:9' });"
    )
    payload = json.dumps({"prompt": full_prompt, "output": str(out_bg_path), "model": model}, ensure_ascii=False)
    print(f"🎨 Đang sinh ảnh nền Thumbnail 16:9 ({st}) qua Agnes AI...")
    res = subprocess.run(["node", "--input-type=module", "-e", node_code, payload], cwd=str(REPO_ROOT))
    if res.returncode != 0 or not out_bg_path.is_file():
        raise RuntimeError("Không thể sinh ảnh nền Thumbnail qua Agnes AI.")


def render_thumbnail(
    base_img_path: Path,
    output_path: Path,
    title: str,
    style: str = "B6",
    subtitle: str | None = None,
    forced_zone: str | None = None,
    accent_line: int | None = None,
    forced_font_size: int | None = None,
) -> None:
    # Quy tắc Zero-Category-Tag Invariance: Tuyệt đối không hiển thị nhãn ngách (TÂM LÝ HỌC, TRIẾT LÝ, KỸ NĂNG SỐNG...)
    if subtitle:
        sub_clean = subtitle.strip().upper()
        if sub_clean in ("TÂM LÝ HỌC", "TRIẾT LÝ", "KỸ NĂNG SỐNG", "PSYCHOLOGY", "PHILOSOPHY", "LIFE SKILLS", "TÂM LÝ"):
            subtitle = None

    raw_img = Image.open(base_img_path).convert("RGBA")
    base_img = fit_cover_16_9(raw_img, 1920, 1080)
    W, H = base_img.size

    pal = resolve_palette(style, base_img)
    analysis = analyze_negative_space(base_img, forced_zone=forced_zone)
    lines, font_size, font, compounds = smart_semantic_break(
        title=title,
        safe_max_w=analysis["safe_max_w"],
        base_img=base_img,
        font_pref=pal["font_pref"],
        forced_font_size=forced_font_size,
    )

    dummy_draw = ImageDraw.Draw(base_img)
    line_spacing = int(font_size * 0.22)
    metrics = []
    max_line_w = 0
    total_h = 0
    for ln in lines:
        bb = dummy_draw.textbbox((0, 0), ln, font=font)
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        metrics.append((w, h, bb[1]))
        max_line_w = max(max_line_w, w)
        total_h += h
    total_h += (len(lines) - 1) * line_spacing

    sub_font = find_font(max(34, int(font_size * 0.34)), pref="editorial_sans") if subtitle else None
    sub_h = 0
    if subtitle and sub_font:
        sbb = dummy_draw.textbbox((0, 0), subtitle.upper(), font=sub_font)
        sub_h = (sbb[3] - sbb[1]) + 28
        total_h += sub_h

    # Căn giữa dọc hợp lý (hơi đẩy lên trên 4% để né góc dưới phải thời lượng YouTube)
    pos_x = analysis["safe_x"]
    pos_y = max(96, int((H - total_h) * 0.44))

    # 1. Soft Editorial Wash (Paper Wash cho nền sáng B6 / Dark Vignette cho nền tối)
    wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    w_draw = ImageDraw.Draw(wash)
    wr, wg, wb = pal["wash"]
    max_alpha = 205 if pal["mode"] == "light" else 155

    if analysis["recommended_zone"] == "LEFT":
        fade_w = min(W, int(pos_x + max_line_w + 220))
        for x in range(fade_w):
            ratio = x / max(1, fade_w)
            alpha = int(max_alpha * (0.5 + 0.5 * math.cos(ratio * math.pi)))
            w_draw.line([(x, 0), (x, H)], fill=(wr, wg, wb, alpha))
    else:
        fade_w = min(W, int((W - pos_x) + 220))
        for i in range(fade_w):
            x = W - 1 - i
            ratio = i / max(1, fade_w)
            alpha = int(max_alpha * (0.5 + 0.5 * math.cos(ratio * math.pi)))
            w_draw.line([(x, 0), (x, H)], fill=(wr, wg, wb, alpha))

    composite = Image.alpha_composite(base_img, wash)

    # 2. Vẽ Typography chuẩn CTR + Thanh nhấn thương hiệu căn chuẩn đỉnh/đáy thân chữ (Optical Cap-Height Alignment)
    text_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(text_layer)

    cap_bb = dummy_draw.textbbox((0, 0), "H", font=font)
    title_start_y = pos_y + (sub_h if (subtitle and sub_font) else 0)
    first_draw_y = title_start_y - metrics[0][2]
    last_cur_y = title_start_y + sum(metrics[i][1] + line_spacing for i in range(len(lines) - 1))
    last_draw_y = last_cur_y - metrics[-1][2]

    if subtitle and sub_font:
        sub_cap_bb = dummy_draw.textbbox((0, 0), "H", font=sub_font)
        bar_top = pos_y + sub_cap_bb[1]
    else:
        bar_top = first_draw_y + cap_bb[1]
    bar_bot = last_draw_y + cap_bb[3]

    bar_x = max(36, pos_x - 36)
    t_draw.rounded_rectangle(
        [(bar_x, bar_top), (bar_x + 10, bar_bot)],
        radius=5,
        fill=pal["bar"],
    )

    cur_y = pos_y
    if subtitle and sub_font:
        t_draw.text((pos_x, cur_y), subtitle.upper(), font=sub_font, fill=pal["accent"])
        cur_y += sub_h

    # Chọn dòng nhấn màu (mặc định: dòng cuối cho 2–3 dòng để chốt punchline, hoặc dòng 1 nếu chỉ 1 dòng)
    hi_idx = (accent_line - 1) if accent_line else (len(lines) - 1 if len(lines) >= 2 else 0)

    for idx, ln in enumerate(lines):
        w, h, y_off = metrics[idx]
        color = pal["accent"] if idx == hi_idx else pal["primary"]
        draw_y = cur_y - y_off

        if pal["mode"] == "light":
            # Halo giấy kem mảnh giúp nét chữ tách bạch tuyệt đối khỏi đường mực nền
            halo_r = 3
            for sx in range(-halo_r, halo_r + 1):
                for sy in range(-halo_r, halo_r + 1):
                    if sx * sx + sy * sy <= halo_r * halo_r:
                        t_draw.text((pos_x + sx, draw_y + sy), ln, font=font, fill=pal["halo"])
            # Bóng mềm editorial cực nhẹ
            t_draw.text((pos_x + 2, draw_y + 4), ln, font=font, fill=(0, 0, 0, 26))
        else:
            stroke_w = max(4, int(font_size * 0.045))
            for dx, dy in [(-6, 6), (6, 6), (0, 10), (0, 14)]:
                t_draw.text((pos_x + dx, draw_y + dy), ln, font=font, fill=(0, 0, 0, 165))
            for sx in range(-stroke_w, stroke_w + 1):
                for sy in range(-stroke_w, stroke_w + 1):
                    if sx * sx + sy * sy <= stroke_w * stroke_w:
                        t_draw.text((pos_x + sx, draw_y + sy), ln, font=font, fill=pal["halo"])

        t_draw.text((pos_x, draw_y), ln, font=font, fill=color)
        cur_y += h + line_spacing

    final_img = Image.alpha_composite(composite, text_layer).convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    final_img.save(output_path, format="PNG", quality=95)

    print("\n" + "=" * 68)
    print(f"✅ [STICKMAN 16:9 THUMBNAIL CTR] Đã xuất ảnh bìa: {output_path}")
    print("=" * 68)
    print(f"  🎨 Phong cách / Mode : {style.upper()} ({pal['mode'].upper()} Editorial)")
    print(f"  👁️  Vùng đặt chữ      : {analysis['recommended_zone']} (Trái={analysis['left_score']:.1f} | Phải={analysis['right_score']:.1f})")
    print(f"  🔤 Ngắt dòng ngữ nghĩa: {len(lines)} dòng | Font {font_size}px | Cụm bảo vệ: {', '.join(compounds) if compounds else 'Chuẩn'}")
    for i, ln in enumerate(lines, 1):
        tag = " [ACCENT]" if (i - 1) == hi_idx else ""
        print(f"      Dòng {i}: {ln}{tag}")
    print("=" * 68 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Tạo Thumbnail 16:9 chuẩn CTR cho Stickman-Video (B6 & B6-EN)")
    parser.add_argument("--title", required=True, help="Tiêu đề ngắn trên Thumbnail (vi: 4–7 từ, en: 2–7 từ; hỗ trợ \\n)")
    parser.add_argument("--subtitle", default=None, help="Nhãn phụ ngắn trên đầu (vd: TÂM LÝ HỌC · B6)")
    parser.add_argument("--base-image", default=None, help="Ảnh nền 16:9 có sẵn (vd: scenes/shot_34.png)")
    parser.add_argument("--prompt", default=None, help="Mô tả cảnh tiếng Anh để sinh ảnh nền mới qua Agnes AI")
    parser.add_argument("--style", default="B6", help="Phong cách thương hiệu: B6, B6-EN, B1, B2, B5, B3, B4, A6")
    parser.add_argument("--lang", default="vi", choices=["vi", "en"], help="Ngôn ngữ tiêu đề (vi: 4–7 từ, en: 2–7 từ)")
    parser.add_argument("--zone", default=None, choices=["left", "right"], help="Ép vị trí đặt chữ (mặc định: tự quét)")
    parser.add_argument("--accent-line", type=int, default=None, help="Số thứ tự dòng tô màu nhấn thương hiệu (1-based)")
    parser.add_argument("--font-size", type=int, default=None, help="Ép cỡ chữ thủ công")
    parser.add_argument("--max-words", type=int, default=7, help="Giới hạn từ tối đa (mặc định: 7)")
    parser.add_argument("--model", default="agnes-image-2.5-flash", help="Model Agnes AI nếu dùng --prompt")
    parser.add_argument("--output", required=True, help="Đường dẫn file thumbnail.png đầu ra")

    args = parser.parse_args()
    if args.subtitle:
        sub_clean = args.subtitle.strip().upper()
        if sub_clean in ("TÂM LÝ HỌC", "TRIẾT LÝ", "KỸ NĂNG SỐNG", "PSYCHOLOGY", "PHILOSOPHY", "LIFE SKILLS", "TÂM LÝ"):
            args.subtitle = None

    words = count_words(args.title)
    min_w = 2 if args.lang == "en" else 4
    max_w = max(7, args.max_words)
    if not (min_w <= len(words) <= max_w):
        sys.stderr.write(
            f"[LỖI QUY CHUẨN THUMBNAIL] Tiêu đề '{args.title}' có {len(words)} từ "
            f"(yêu cầu {min_w}–{max_w} từ cho `{args.lang}` để đọc rõ trên di động).\n"
        )
        sys.exit(1)

    out_path = Path(args.output).resolve()
    if args.base_image:
        bg_path = Path(args.base_image).resolve()
        if not bg_path.is_file():
            sys.stderr.write(f"[LỖI] Không tìm thấy ảnh nền: {bg_path}\n")
            sys.exit(1)
    elif args.prompt:
        bg_path = out_path.with_name("thumbnail_base.png")
        generate_agnes_background(args.prompt, bg_path, style=args.style, model=args.model)
    else:
        sys.stderr.write("[LỖI] Bắt buộc truyền --base-image (ảnh có sẵn) hoặc --prompt (sinh mới qua Agnes AI).\n")
        sys.exit(1)

    render_thumbnail(
        base_img_path=bg_path,
        output_path=out_path,
        title=args.title,
        style=args.style,
        subtitle=args.subtitle,
        forced_zone=args.zone,
        accent_line=args.accent_line,
        forced_font_size=args.font_size,
    )


if __name__ == "__main__":
    main()
