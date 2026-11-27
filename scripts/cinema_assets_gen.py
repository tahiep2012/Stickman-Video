#!/usr/bin/env python3
"""
Stickman-Video Cinema Assets Generator (100% Offline, Royalty-Free, Zero External Dependencies)
Generates and caches:
  1. Restrained Editorial Micro-SFX (48kHz Stereo WAV) in assets/audio/sfx/:
     - page_turn.wav  : Soft warm sketchbook paper rustle for chapter transitions
     - pen_stroke.wav : Subtle ink/pencil nib brush on warm paper for metaphor reveals
     - soft_click.wav : Muted tactile switch/device click for screen/UI story beats
     - warm_swell.wav : Gentle felt low-mid tonal swell for Re-Hooks & Paradigm Shifts
  2. Living Sketchbook Paper Texture Loops (8fps animated grain) in assets/textures/:
     - paper_grain_16x9.mp4 (1920x1080, 2s seamless 8fps neutral-gray organic paper texture)
     - paper_grain_9x16.mp4 (1080x1920, 2s seamless 8fps neutral-gray organic paper texture)
"""
from __future__ import annotations

import math
import random
import shutil
import struct
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from PIL import Image, ImageFilter

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = REPO_ROOT / "assets" / "audio" / "sfx"
TEX_DIR = REPO_ROOT / "assets" / "textures"
SR = 48000


def write_wav_stereo(path: Path, samples_l: list[float], samples_r: list[float] | None = None) -> None:
    if samples_r is None:
        samples_r = samples_l
    path.parent.mkdir(parents=True, exist_ok=True)
    peak = max(1e-6, max(max(abs(x) for x in samples_l), max(abs(x) for x in samples_r)))
    scale = 0.85 / peak if peak > 0.85 else 1.0
    raw = bytearray()
    for l_val, r_val in zip(samples_l, samples_r):
        li = max(-32767, min(32767, int(l_val * scale * 32767)))
        ri = max(-32767, min(32767, int(r_val * scale * 32767)))
        raw.extend(struct.pack("<hh", li, ri))
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(bytes(raw))


def one_pole_lp(data: list[float], cutoff_hz: float) -> list[float]:
    rc = 1.0 / (2.0 * math.pi * cutoff_hz)
    dt = 1.0 / SR
    alpha = dt / (rc + dt)
    out = [0.0] * len(data)
    y = 0.0
    for i, x in enumerate(data):
        y += alpha * (x - y)
        out[i] = y
    return out


def one_pole_hp(data: list[float], cutoff_hz: float) -> list[float]:
    rc = 1.0 / (2.0 * math.pi * cutoff_hz)
    dt = 1.0 / SR
    alpha = rc / (rc + dt)
    out = [0.0] * len(data)
    y = 0.0
    prev_x = 0.0
    for i, x in enumerate(data):
        y = alpha * (y + x - prev_x)
        prev_x = x
        out[i] = y
    return out


def gen_page_turn(out_path: Path) -> None:
    """Soft, airy sketchbook page turn (~0.42s), warm bandpass paper brush."""
    rng = random.Random(42)
    n = int(SR * 0.42)
    noise_l = [rng.uniform(-1.0, 1.0) for _ in range(n)]
    noise_r = [rng.uniform(-1.0, 1.0) for _ in range(n)]
    bp_l = one_pole_hp(one_pole_lp(noise_l, 2600.0), 420.0)
    bp_r = one_pole_hp(one_pole_lp(noise_r, 2400.0), 400.0)

    out_l, out_r = [], []
    for i in range(n):
        t = i / SR
        # Two-stage paper lift + settle envelope
        env1 = math.sin(min(1.0, t / 0.24) * math.pi) ** 1.6 if t < 0.24 else 0.0
        env2 = 0.55 * (math.sin(min(1.0, (t - 0.14) / 0.26) * math.pi) ** 1.8) if 0.14 <= t < 0.40 else 0.0
        env = (env1 + env2) * 0.42
        # Gentle subtle stereo sweep left -> right
        pan_l = 0.85 - 0.35 * (i / n)
        pan_r = 0.50 + 0.35 * (i / n)
        out_l.append(bp_l[i] * env * pan_l)
        out_r.append(bp_r[i] * env * pan_r)
    write_wav_stereo(out_path, out_l, out_r)


def gen_pen_stroke(out_path: Path) -> None:
    """Delicate pencil/ink brush stroke on textured paper (~0.30s)."""
    rng = random.Random(108)
    n = int(SR * 0.30)
    noise = [rng.uniform(-1.0, 1.0) for _ in range(n)]
    bp = one_pole_hp(one_pole_lp(noise, 3400.0), 950.0)
    out = []
    for i in range(n):
        t = i / SR
        # Quick crisp ink flick envelope + subtle grit modulation
        env = (math.sin(min(1.0, t / 0.28) * math.pi) ** 1.4) * (0.75 + 0.25 * math.sin(2 * math.pi * 28 * t))
        out.append(bp[i] * env * 0.38)
    write_wav_stereo(out_path, out, out)


def gen_soft_click(out_path: Path) -> None:
    """Muted tactile switch/smartphone button click (~0.16s), never harsh."""
    rng = random.Random(7)
    n = int(SR * 0.16)
    noise = [rng.uniform(-1.0, 1.0) for _ in range(n)]
    click_n = one_pole_hp(one_pole_lp(noise, 2200.0), 320.0)
    out = []
    for i in range(n):
        t = i / SR
        # Warm wooden/matte transient + soft damped body resonance
        transient = click_n[i] * math.exp(-t * 95.0) * 0.55
        body = math.sin(2.0 * math.pi * (240.0 * math.exp(-t * 14.0)) * t) * math.exp(-t * 48.0) * 0.35
        out.append(transient + body)
    write_wav_stereo(out_path, out, out)


def gen_warm_swell(out_path: Path) -> None:
    """Subtle editorial felt piano/pad swell (~1.35s) for Re-Hooks & Paradigm Shifts."""
    n = int(SR * 1.35)
    # Warm D-minor/A-sus2 airy harmonics (matches calm Night Snow tonal space)
    freqs = [(146.83, 0.30), (220.00, 0.24), (293.66, 0.18), (329.63, 0.12)]
    out_l, out_r = [], []
    for i in range(n):
        t = i / SR
        # Smooth bell-shaped rise & warm decay
        if t < 0.55:
            env = (t / 0.55) ** 2.2
        else:
            env = math.exp(-(t - 0.55) * 3.4)
        val_l = 0.0
        val_r = 0.0
        for idx, (f, amp) in enumerate(freqs):
            detune = 0.35 if idx % 2 == 0 else -0.35
            val_l += math.sin(2.0 * math.pi * f * t) * amp
            val_r += math.sin(2.0 * math.pi * (f + detune) * t) * amp
        out_l.append(val_l * env * 0.35)
        out_r.append(val_r * env * 0.35)
    write_wav_stereo(out_path, out_l, out_r)


def gen_paper_grain_loop(out_path: Path, width: int, height: int, seed: int = 2026) -> None:
    """
    Generate a seamless 2-second 8fps neutral-gray organic sketchbook paper grain loop
    designed for FFmpeg `blend=all_mode=overlay:all_opacity=0.14`.
    Uses small noise tile upscaled smoothly for fibrous paper tooth (fast & natural).
    """
    if out_path.is_file() and out_path.stat().st_size > 20000:
        print(f"⏭️ Paper grain texture exists: {out_path.name}")
        return

    with tempfile.TemporaryDirectory(prefix=f"stickman_{out_path.stem}_") as tmp_str:
        tmp_dir = Path(tmp_str)
        rng = random.Random(seed)

        # 16 unique frames at 8 fps = 2.0s seamless loop
        # Generate at 1/2 resolution then smoothly scale up for soft paper fibers
        gw, gh = width // 2, height // 2
        num_frames = 16
        print(f"📄 Generating {num_frames}-frame 8fps Living Paper Texture ({width}x{height})...")

        # Base stationary paper tooth so the paper feels continuous (60% static tooth + 40% subtle boiling grain)
        base_bytes = bytearray(gw * gh)
        for idx in range(gw * gh):
            # Centered at 128, narrow subtle range [112..144]
            v = 128 + int(rng.gauss(0, 5.5))
            base_bytes[idx] = max(96, min(160, v))
        base_img = Image.frombytes("L", (gw, gh), bytes(base_bytes)).filter(ImageFilter.GaussianBlur(radius=0.6))

        for f_idx in range(num_frames):
            # Slight random offset of the static tooth + delicate fresh fine grain for organic hand-drawn boil
            ox = rng.randint(-12, 12)
            oy = rng.randint(-12, 12)
            shifted = Image.new("L", (gw, gh), 128)
            shifted.paste(base_img, (ox, oy))

            # Mix subtle dynamic fine fiber grain
            dyn_bytes = bytearray(gw * gh)
            base_px = shifted.tobytes()
            for idx in range(gw * gh):
                v = base_px[idx] + int(rng.gauss(0, 3.2))
                dyn_bytes[idx] = max(92, min(164, v))
            frame = Image.frombytes("L", (gw, gh), bytes(dyn_bytes)).resize((width, height), Image.Resampling.BILINEAR)
            # Warm paper neutral tint (very slightly warm R/G over B around 128)
            rgb = Image.merge("RGB", (
                frame.point(lambda p: min(255, p + 1)),
                frame,
                frame.point(lambda p: max(0, p - 2)),
            ))
            rgb.save(tmp_dir / f"f_{f_idx:02d}.png", format="PNG")

        cmd = [
            "ffmpeg", "-y",
            "-framerate", "8",
            "-i", str(tmp_dir / "f_%02d.png"),
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p",
            str(out_path),
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✅ Saved Living Paper Texture: {out_path}")


def main() -> None:
    SFX_DIR.mkdir(parents=True, exist_ok=True)
    TEX_DIR.mkdir(parents=True, exist_ok=True)

    sfx_jobs = [
        (SFX_DIR / "page_turn.wav", gen_page_turn),
        (SFX_DIR / "pen_stroke.wav", gen_pen_stroke),
        (SFX_DIR / "soft_click.wav", gen_soft_click),
        (SFX_DIR / "warm_swell.wav", gen_warm_swell),
    ]
    for path, fn in sfx_jobs:
        fn(path)
        print(f"✅ Generated Micro-SFX: {path.name}")

    gen_paper_grain_loop(TEX_DIR / "paper_grain_16x9.mp4", 1920, 1080, seed=2026)
    gen_paper_grain_loop(TEX_DIR / "paper_grain_9x16.mp4", 1080, 1920, seed=2027)
    print("🎉 All Cinema Assets ready.")


if __name__ == "__main__":
    main()
