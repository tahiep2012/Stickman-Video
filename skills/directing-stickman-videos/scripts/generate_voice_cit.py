#!/usr/bin/env python3
"""
CIT Voice Studio Local HTTP Bridge
Connects to offline VieNeu-TTS-v3 Turbo running at http://127.0.0.1:8001
Generates 48kHz studio-quality voiceover + millisecond-synchronized SRT subtitles.
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path


def load_env(env_path=None):
    """Load configuration from .env file without external dependencies."""
    candidates = [
        env_path,
        Path.cwd() / ".env",
        Path(__file__).resolve().parent / ".env",
        Path(__file__).resolve().parent.parent / ".env",
        Path(__file__).resolve().parent.parent.parent / ".env",
    ]
    for p in candidates:
        if p and Path(p).is_file():
            try:
                for line in Path(p).read_text(encoding="utf-8").splitlines():
                    m = re.match(r"^\s*([\w.-]+)\s*=\s*(.*)?\s*$", line)
                    if m:
                        key, val = m.group(1), m.group(2) or ""
                        val = val.strip().strip("'\"")
                        if key not in os.environ:
                            os.environ[key] = val
                break
            except Exception:
                pass


load_env()

DEFAULT_BASE_URL = os.environ.get("CIT_BASE_URL", "http://127.0.0.1:8001").rstrip("/")
DEFAULT_VOICE = os.environ.get("CIT_VOICE", "I Thought")
DEFAULT_SPEED = float(os.environ.get("CIT_SPEED", "1.0"))


def check_health(base_url=DEFAULT_BASE_URL, timeout=3.0):
    """Check if CIT Voice Studio is running and ready."""
    url = f"{base_url}/health"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CIT-Bridge/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                return {"online": True, "data": data}
    except Exception as e:
        return {"online": False, "error": str(e)}
    return {"online": False, "error": "Unknown status"}


def get_voices(base_url=DEFAULT_BASE_URL, timeout=5.0):
    """Get list of available voices from CIT Voice Studio."""
    url = f"{base_url}/voices"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CIT-Bridge/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as res:
            if res.status == 200:
                return json.loads(res.read().decode("utf-8"))
    except Exception as e:
        raise RuntimeError(f"Failed to fetch voices from CIT Voice Studio: {e}")
    return []


def clean_script_text(text: str) -> str:
    """Clean markdown formatting and extract spoken prose for TTS."""
    # Remove markdown code blocks
    text = re.sub(r"```[\s\S]*?```", "", text)
    # Remove markdown headers (# Title)
    text = re.sub(r"^#{1,6}\s+.*$", "", text, flags=re.MULTILINE)
    # Remove metadata lines (- Key: Value or > Quote marks)
    text = re.sub(r"^[-*]\s+\*\*.*?\*\*:.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)
    # Remove bold/italic markdown
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    # Remove inline links
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    # Normalize punctuation and whitespace
    text = text.replace("—", ", ").replace("–", ", ")
    text = re.sub(r"\n\s*\n+", "\n\n", text).strip()
    return text


def generate_voice_cit(
    text: str,
    output_audio: str = "narration.mp3",
    output_srt: str = "input.srt",
    voice_id: str = DEFAULT_VOICE,
    speed: float = DEFAULT_SPEED,
    base_url: str = DEFAULT_BASE_URL,
    audio_format: str = "wav",
    timeout: float = 300.0,
):
    """
    Calls CIT Voice Studio API to generate audio + srt.
    Endpoint: POST /api/tts/generate-with-subtitles
    """
    health = check_health(base_url)
    if not health.get("online"):
        raise ConnectionError(
            f"CIT Voice Studio is NOT running at {base_url}. "
            "Please start CIT-Voice-Studio.exe on your machine first."
        )

    endpoint = f"{base_url}/api/tts/generate-with-subtitles"
    payload = {
        "text": text,
        "voice_id": voice_id,
        "speed": speed,
        "format": audio_format,
    }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=req_data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "CIT-Bridge/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read().decode("utf-8")
            data = json.loads(raw)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"CIT Voice Studio HTTP {e.code}: {err_body}")
    except Exception as e:
        raise RuntimeError(f"Failed to communicate with CIT Voice Studio: {e}")

    audio_b64 = data.get("audio_base64")
    srt_content = data.get("srt", "")
    duration_seconds = float(data.get("duration_seconds", 0.0))

    if not audio_b64:
        raise ValueError("CIT Voice Studio returned no audio_base64 payload")

    audio_bytes = base64.b64decode(audio_b64)

    # Save audio: if format is wav and requested output is .mp3, convert via ffmpeg
    out_audio_path = Path(output_audio).resolve()
    out_audio_path.parent.mkdir(parents=True, exist_ok=True)
    temp_wav = out_audio_path.with_suffix(".temp.wav")
    temp_wav.write_bytes(audio_bytes)

    if out_audio_path.suffix.lower() == ".mp3":
        try:
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-i",
                    str(temp_wav),
                    "-c:a",
                    "libmp3lame",
                    "-b:a",
                    "192k",
                    "-ar",
                    "48000",
                    str(out_audio_path),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            if temp_wav.exists():
                temp_wav.unlink()
        except Exception:
            # Fallback: rename directly if ffmpeg fails
            if temp_wav.exists():
                temp_wav.replace(out_audio_path)
    else:
        temp_wav.replace(out_audio_path)

    # Save SRT
    out_srt_path = Path(output_srt).resolve()
    out_srt_path.parent.mkdir(parents=True, exist_ok=True)
    out_srt_path.write_text(srt_content, encoding="utf-8")

    return {
        "status": "success",
        "audio_path": str(out_audio_path),
        "srt_path": str(out_srt_path),
        "duration_seconds": duration_seconds,
        "voice_id": voice_id,
        "speed": speed,
        "sample_rate": 48000,
    }


def main():
    parser = argparse.ArgumentParser(description="CIT Voice Studio HTTP Bridge")
    parser.add_argument("--check-health", action="store_true", help="Check if CIT Voice Studio is running")
    parser.add_argument("--list-voices", action="store_true", help="List all available voices")
    parser.add_argument("--script-file", type=str, help="Path to script markdown or text file")
    parser.add_argument("--text", type=str, help="Direct text to synthesize")
    parser.add_argument("--project-dir", type=str, help="Directory to save narration.mp3 and input.srt")
    parser.add_argument("--output-audio", type=str, default=None, help="Output audio file path")
    parser.add_argument("--output-srt", type=str, default=None, help="Output srt file path")
    parser.add_argument("--voice", type=str, default=DEFAULT_VOICE, help=f"Voice ID (default: {DEFAULT_VOICE})")
    parser.add_argument("--speed", type=float, default=DEFAULT_SPEED, help=f"Playback speed (default: {DEFAULT_SPEED})")
    parser.add_argument("--base-url", type=str, default=DEFAULT_BASE_URL, help=f"Base URL (default: {DEFAULT_BASE_URL})")

    args = parser.parse_args()

    if args.check_health:
        health = check_health(args.base_url)
        print(json.dumps(health, indent=2, ensure_ascii=False))
        sys.exit(0 if health.get("online") else 1)

    if args.list_voices:
        voices = get_voices(args.base_url)
        print(json.dumps(voices, indent=2, ensure_ascii=False))
        sys.exit(0)

    # Resolve text input
    text = ""
    if args.script_file:
        p = Path(args.script_file)
        if not p.is_file():
            print(f"Error: Script file not found: {args.script_file}", file=sys.stderr)
            sys.exit(1)
        raw_text = p.read_text(encoding="utf-8")
        text = clean_script_text(raw_text)
    elif args.text:
        text = clean_script_text(args.text)
    else:
        print("Error: Specify either --script-file, --text, --check-health, or --list-voices", file=sys.stderr)
        sys.exit(1)

    if not text.strip():
        print("Error: Empty script text after cleaning", file=sys.stderr)
        sys.exit(1)

    # Resolve output paths
    if args.project_dir:
        pdir = Path(args.project_dir)
        output_audio = args.output_audio or str(pdir / "narration.mp3")
        output_srt = args.output_srt or str(pdir / "input.srt")
    else:
        output_audio = args.output_audio or "narration.mp3"
        output_srt = args.output_srt or "input.srt"

    try:
        result = generate_voice_cit(
            text=text,
            output_audio=output_audio,
            output_srt=output_srt,
            voice_id=args.voice,
            speed=args.speed,
            base_url=args.base_url,
        )
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
