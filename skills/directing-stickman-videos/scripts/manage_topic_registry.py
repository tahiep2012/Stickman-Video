#!/usr/bin/env python3
"""
Dual-Channel Topic Registry, Backlog & Hook Anti-Repetition Manager v3.0
Quản lý hợp nhất `projects/topics-registry.json` (và đồng bộ bảng `projects/TOPIC_BACKLOG.md`):
  - Theo dõi đề tài ĐÃ SẢN XUẤT (`produced_topics`) kèm `hook_code` (#01..#12), `setting_motif`, `category` (Trend/Evergreen).
  - Theo dõi kho đề tài ĐỂ DÀNH (`backlog_topics`) kèm bảng điểm thực chiến 4 tiêu chí:
    `D` (Demand) • `P` (Pain/Stakes) • `C` (Packaging/CTR) • `F` (Freshness) + `packaging_preview`.
  - Lệnh `recent-hooks`: xem nhanh 4 kiểu Hook và 6 mô-típ bối cảnh gần nhất cùng kênh để CẤM trùng lặp.
  - Lệnh `register-produced --sync`: ghi dự án vừa xong vào registry, tự đánh dấu hoàn tất backlog tương ứng và đồng bộ lên GitHub.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = REPO_ROOT / "projects" / "topics-registry.json"
BACKLOG_MD_PATH = REPO_ROOT / "projects" / "TOPIC_BACKLOG.md"
SYNC_SCRIPT_PATH = REPO_ROOT / "scripts" / "sync-topics-registry.mjs"

HOOK_NAMES = {
    "#01": "Phá Vỡ Định Kiến (Contrarian Bomb)",
    "#02": "Lời Khuyên Phản Tác Dụng (Inverted Advice)",
    "#03": "Định Nghĩa Lại Bản Chất (Reframing Twist)",
    "#04": "Thí Nghiệm Kỳ Lạ (Weird Lab Study)",
    "#05": "Con Số Tương Phản Tàn Nhẫn (Brutal Stat Contrast)",
    "#06": "Bước Ngoặt Lịch Sử / Triết Gia (Historical Flashpoint)",
    "#07": "Đọc Vị Tim Đen (Mind-Reader Confession)",
    "#08": "Lát Cắt Kịch Tính 2 Câu (In Media Res)",
    "#09": "Câu Nói Dối Tự Nhủ (Inner Voice Quote)",
    "#10": "Ẩn Dụ Thị Giác Ám Ảnh (Haunting Visual Metaphor)",
    "#11": "Cái Giá Vô Hình (Hidden Cost)",
    "#12": "Nghịch Lý Không Lời Giải (The Impossible Paradox)",
}

NICHE_LABELS = {
    "psychology": "Tâm Lý Học",
    "tâm lý học": "Tâm Lý Học",
    "tam ly hoc": "Tâm Lý Học",
    "philosophy": "Triết Lý",
    "triết lý": "Triết Lý",
    "triet ly": "Triết Lý",
    "life-skills": "Kỹ Năng Sống",
    "life skills": "Kỹ Năng Sống",
    "kỹ năng sống": "Kỹ Năng Sống",
    "ky nang song": "Kỹ Năng Sống",
}


def normalize_niche_label(raw: str | None) -> str:
    if not raw:
        return "Tâm Lý Học"
    return NICHE_LABELS.get(raw.strip().lower(), raw.strip())


def normalize_category(raw: str | None) -> str:
    low = (raw or "").strip().lower()
    return "Trend" if "trend" in low else "Evergreen"


def compute_score(item: dict) -> float:
    scores = item.get("scores")
    if isinstance(scores, dict) and scores:
        vals = [float(scores.get(k, 8.0)) for k in ("demand", "pain", "packaging", "freshness")]
        return round(sum(vals) / len(vals), 1)
    return 8.0


def load_registry(reg_path: Path = REGISTRY_PATH) -> dict:
    if reg_path.is_file():
        data = json.loads(reg_path.read_text(encoding="utf-8"))
        data.setdefault("version", "3.0")
        data.setdefault("produced_topics", [])
        data.setdefault("backlog_topics", [])
        return data
    return {
        "version": "3.0",
        "description": "Sổ đăng ký đề tài đa kênh & Kho Backlog Stickman-Video (vi & en).",
        "channels": {
            "vi": {
                "name": "Kênh Tiếng Việt — Người Lữ Hành Khăn Choàng",
                "root_dir": "projects/vi",
                "default_style": "B6",
                "default_voice_engine": "CIT Voice Studio (VieNeu-TTS)",
                "default_voice": "Hải Đăng",
            },
            "en": {
                "name": "English Channel — The Slate Ink Traveler",
                "root_dir": "projects/en",
                "default_style": "B6-EN",
                "default_voice_engine": "CIT Voice Studio (Kokoro)",
                "default_voice": "auto-kokoro",
            },
        },
        "produced_topics": [],
        "backlog_topics": [],
    }


def save_registry(data: dict, reg_path: Path = REGISTRY_PATH) -> None:
    reg_path.parent.mkdir(parents=True, exist_ok=True)
    reg_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sync_backlog_markdown(data)


def sync_backlog_markdown(data: dict, md_path: Path = BACKLOG_MD_PATH) -> None:
    backlog = data.get("backlog_topics", [])
    produced = data.get("produced_topics", [])

    lines = [
        "# KHO ĐỀ TÀI & SỔ LỊCH SỬ HOOK — STICKMAN-VIDEO (DUAL-CHANNEL v3.0)",
        "### *Đồng bộ tự động từ `projects/topics-registry.json` — 🇻🇳 Kênh Tiếng Việt (`B6`) × 🇺🇸 English Channel (`B6-EN`)*",
        "",
        "## 📌 1. ĐỀ TÀI ĐỂ DÀNH (PENDING BACKLOG)",
        "",
        "| STT | Kênh | Ngách | Loại | Đề Tài & Packaging Preview | Điểm 4 Tiêu Chí | Ngày Lưu |",
        "|:---:|:---:|---|:---:|---|:---:|:---:|",
    ]

    pending = [b for b in backlog if b.get("status", "pending") == "pending"]
    if not pending:
        lines.append("| - | - | - | - | *Chưa có đề tài chờ. Khi chạy Radar v2.0 ở Bảng 2, các đề tài chưa chọn sẽ tự lưu vào đây.* | - | - |")
    else:
        for idx, b in enumerate(pending, 1):
            ch = "🇻🇳 vi" if b.get("channel") == "vi" else "🇺🇸 en"
            cat = "🔥 Trend" if normalize_category(b.get("category")) == "Trend" else "🌿 Evergreen"
            sc = b.get("scores", {})
            avg = compute_score(b)
            score_txt = f"⭐ **{avg}/10**<br>`D:{sc.get('demand','-')} P:{sc.get('pain','-')} C:{sc.get('packaging','-')} F:{sc.get('freshness','-')}`"
            pkg = b.get("packaging_preview", {})
            sub_parts = []
            if pkg.get("draft_title"):
                sub_parts.append(f"Title: _{pkg['draft_title']}_")
            if pkg.get("visual_hook"):
                sub_parts.append(f"Visual: _{pkg['visual_hook']}_")
            desc = f"**{b.get('topic', '')}**" + (f"<br>{' • '.join(sub_parts)}" if sub_parts else "")
            lines.append(f"| `{idx:02d}` | {ch} | {b.get('niche', '')} | `{cat}` | {desc} | {score_txt} | {b.get('created_at', '')} |")

    lines.extend([
        "",
        "---",
        "",
        "## ✅ 2. LỊCH SỬ ĐỀ TÀI ĐÃ SẢN XUẤT & MÃ HOOK (MỚI NHẤT TRÊN CÙNG)",
        "",
        "| STT | Kênh | Ngách | Định Dạng | Mã Hook | Tên Video | Ngày |",
        "|:---:|:---:|---|---|:---:|---|:---:|",
    ])

    for idx, p in enumerate(reversed(produced), 1):
        ch = "🇻🇳 vi" if p.get("channel") == "vi" else "🇺🇸 en"
        hk = p.get("hook_code") or "—"
        lines.append(
            f"| `{idx:02d}` | {ch} | {p.get('niche', '')} | {p.get('format', '')} | `{hk}` | **{p.get('title', '')}** (`{p.get('slug', '')}`) | {p.get('date', '')} |"
        )

    lines.append("")
    md_path.write_text("\n".join(lines), encoding="utf-8")


def cmd_list_backlog(args: argparse.Namespace) -> None:
    data = load_registry()
    items = [b for b in data.get("backlog_topics", []) if b.get("status", "pending") == "pending"]
    if args.channel:
        items = [b for b in items if b.get("channel") == args.channel]
    if args.niche:
        want = normalize_niche_label(args.niche).lower()
        items = [b for b in items if normalize_niche_label(b.get("niche")).lower() == want]

    if not items:
        print(f"ℹ️  Kho Backlog đang trống (lọc: channel={args.channel or 'all'}, niche={args.niche or 'all'}).")
        return

    print(f"\n📋 KHO ĐỀ TÀI ĐỂ DÀNH ({len(items)} đề tài pending):")
    for idx, b in enumerate(items, 1):
        sc = b.get("scores", {})
        avg = compute_score(b)
        cat = "🔥 TREND" if normalize_category(b.get("category")) == "Trend" else "🌿 EVERGREEN"
        print(
            f"  {idx}. [{b.get('channel')}] [{cat}] {b.get('topic')} | ⭐ {avg}/10 "
            f"(D:{sc.get('demand','-')} P:{sc.get('pain','-')} C:{sc.get('packaging','-')} F:{sc.get('freshness','-')})"
        )
        pkg = b.get("packaging_preview", {})
        if pkg.get("draft_title") or pkg.get("visual_hook"):
            print(f"     ↳ Title: {pkg.get('draft_title', '-')} | Visual: {pkg.get('visual_hook', '-')}")
    print()


def cmd_add_backlog(args: argparse.Namespace) -> None:
    data = load_registry()
    backlog = data.setdefault("backlog_topics", [])
    existing_keys = {(b.get("channel"), b.get("topic", "").strip().lower()) for b in backlog}
    key = (args.channel, args.topic.strip().lower())
    if key in existing_keys:
        print(f"ℹ️  Đề tài đã có trong backlog ({args.channel}): {args.topic}")
        return

    entry = {
        "topic": args.topic.strip(),
        "channel": args.channel,
        "niche": normalize_niche_label(args.niche),
        "category": normalize_category(args.category),
        "angle": args.angle.strip(),
        "scores": {
            "demand": round(args.demand, 1),
            "pain": round(args.pain, 1),
            "packaging": round(args.packaging, 1),
            "freshness": round(args.freshness, 1),
        },
        "packaging_preview": {
            "trend_source": args.trend_source.strip(),
            "draft_title": args.draft_title.strip(),
            "visual_hook": args.visual_hook.strip(),
        },
        "status": "pending",
        "created_at": datetime.now().strftime("%Y-%m-%d"),
    }
    backlog.append(entry)
    save_registry(data)
    print(f"✅ Đã lưu đề tài vào Backlog ({args.channel}): {args.topic}")


def cmd_recent_hooks(args: argparse.Namespace) -> None:
    data = load_registry()
    produced = [p for p in data.get("produced_topics", []) if p.get("channel") == args.channel]
    recent = list(reversed(produced))[: args.limit]
    blocked_hooks = [p.get("hook_code") for p in recent[:4] if p.get("hook_code")]

    print(f"\n🔁 LỊCH SỬ {len(recent)} TẬP GẦN NHẤT — KÊNH `{args.channel}`:")
    for idx, p in enumerate(recent, 1):
        hk = p.get("hook_code") or "chưa gắn"
        motif = p.get("setting_motif") or "—"
        print(f"  {idx}. {p.get('slug')} ({p.get('date', '')}) | Hook: [{hk}] | Bối cảnh: {motif}")

    if blocked_hooks:
        print(f"\n🚫 MÃ HOOK CẤM DÙNG LẠI (4 tập gần nhất): {', '.join(blocked_hooks)}")
        available = [f"{code} {name}" for code, name in HOOK_NAMES.items() if code not in blocked_hooks]
        print(f"✅ MÃ HOOK ĐƯỢC PHÉP CHỌN ({len(available)} kiểu): {', '.join(c.split()[0] for c in available)}")
    else:
        print("\n✅ Chưa có mã Hook nào bị khóa trong 4 tập gần nhất — được phép chọn tự do trong 12 kiểu [#01..#12].")
    print()


def cmd_register_produced(args: argparse.Namespace) -> None:
    data = load_registry()
    produced = data.setdefault("produced_topics", [])
    today = args.date or datetime.now().strftime("%Y-%m-%d")
    keywords = [k.strip() for k in args.keywords.split(",") if k.strip()] if args.keywords else []

    new_entry = {
        "slug": args.slug.strip(),
        "channel": args.channel,
        "language": args.channel,
        "project_path": f"projects/{args.channel}/{args.slug.strip()}",
        "title": args.title.strip(),
        "niche": normalize_niche_label(args.niche),
        "category": normalize_category(args.category),
        "format": args.format.strip(),
        "duration_seconds": round(args.duration, 2),
        "character_style": args.style.strip(),
        "voice": args.voice.strip(),
        "hook_code": args.hook_code.strip() if args.hook_code else None,
        "setting_motif": args.setting_motif.strip(),
        "has_clock_motif": bool(args.has_clock_motif),
        "date": today,
        "keywords": keywords,
    }

    # Cập nhật nếu slug đã tồn tại trên cùng kênh, ngược lại append mới
    updated = False
    for idx, item in enumerate(produced):
        if item.get("slug") == new_entry["slug"] and item.get("channel") == new_entry["channel"]:
            produced[idx] = new_entry
            updated = True
            break
    if not updated:
        produced.append(new_entry)

    # Tự động đánh dấu hoàn tất trong backlog nếu trùng tiêu đề
    title_low = new_entry["title"].lower()
    for b in data.get("backlog_topics", []):
        if b.get("channel") == new_entry["channel"] and b.get("status") == "pending":
            b_topic = b.get("topic", "").strip().lower()
            if b_topic and (b_topic in title_low or title_low in b_topic):
                b["status"] = "completed"
                b["completed_at"] = today
                b["project_path"] = new_entry["project_path"]

    save_registry(data)
    action = "Cập nhật" if updated else "Đăng ký mới"
    print(f"✅ {action} thành công dự án `{new_entry['slug']}` (Hook: {new_entry['hook_code'] or 'N/A'}) vào {REGISTRY_PATH}")

    if args.sync and SYNC_SCRIPT_PATH.is_file():
        commit_msg = f"chore(registry): add {new_entry['slug']} ({new_entry['hook_code'] or 'no-hook'}) to topics-registry.json"
        subprocess.run(["node", str(SYNC_SCRIPT_PATH), commit_msg], cwd=str(REPO_ROOT), check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Quản lý Sổ Đề Tài, Kho Backlog & Lịch Sử Hook Stickman-Video v3.0")
    sub = parser.add_subparsers(dest="command")

    p_list = sub.add_parser("list-backlog", help="Liệt kê các đề tài đang chờ trong kho Backlog")
    p_list.add_argument("--channel", default=None, choices=["vi", "en"])
    p_list.add_argument("--niche", default=None)

    p_add = sub.add_parser("add-backlog", help="Lưu đề tài chưa chọn từ Radar v2.0 vào Backlog")
    p_add.add_argument("--topic", required=True)
    p_add.add_argument("--channel", default="vi", choices=["vi", "en"])
    p_add.add_argument("--niche", default="Tâm Lý Học")
    p_add.add_argument("--category", default="Evergreen", choices=["Trend", "Evergreen"])
    p_add.add_argument("--angle", default="")
    p_add.add_argument("--demand", type=float, default=8.5)
    p_add.add_argument("--pain", type=float, default=8.5)
    p_add.add_argument("--packaging", type=float, default=8.5)
    p_add.add_argument("--freshness", type=float, default=8.5)
    p_add.add_argument("--trend-source", default="")
    p_add.add_argument("--draft-title", default="")
    p_add.add_argument("--visual-hook", default="")

    p_hooks = sub.add_parser("recent-hooks", help="Xem 4 mã Hook và 6 mô-típ bối cảnh gần nhất để tránh lặp")
    p_hooks.add_argument("--channel", default="vi", choices=["vi", "en"])
    p_hooks.add_argument("--limit", type=int, default=6)

    p_reg = sub.add_parser("register-produced", help="Ghi dự án vừa hoàn tất vào topics-registry.json")
    p_reg.add_argument("--slug", required=True)
    p_reg.add_argument("--channel", default="vi", choices=["vi", "en"])
    p_reg.add_argument("--title", required=True)
    p_reg.add_argument("--niche", default="Tâm Lý Học")
    p_reg.add_argument("--category", default="Evergreen", choices=["Trend", "Evergreen"])
    p_reg.add_argument("--format", default="9:16 Shorts")
    p_reg.add_argument("--duration", type=float, default=0.0)
    p_reg.add_argument("--style", default="B6 · Ink Traveler (Terracotta-Amber Scarf)")
    p_reg.add_argument("--voice", default="Hải Đăng (CIT Voice Studio - VieNeu-TTS)")
    p_reg.add_argument("--hook-code", default=None)
    p_reg.add_argument("--setting-motif", default="")
    p_reg.add_argument("--has-clock-motif", action="store_true")
    p_reg.add_argument("--keywords", default="")
    p_reg.add_argument("--date", default=None)
    p_reg.add_argument("--sync", action="store_true", help="Tự động commit & push topics-registry.json lên GitHub")

    sub.add_parser("sync-md", help="Đồng bộ projects/topics-registry.json sang projects/TOPIC_BACKLOG.md")

    args = parser.parse_args()
    if args.command == "list-backlog":
        cmd_list_backlog(args)
    elif args.command == "add-backlog":
        cmd_add_backlog(args)
    elif args.command == "recent-hooks":
        cmd_recent_hooks(args)
    elif args.command == "register-produced":
        cmd_register_produced(args)
    elif args.command == "sync-md":
        sync_backlog_markdown(load_registry())
        print(f"✅ Đã đồng bộ bảng tổng hợp tại: {BACKLOG_MD_PATH}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
