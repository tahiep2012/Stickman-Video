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
DEFAULT_VOICE = os.environ.get("CIT_VOICE", "Văn Hải")
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
    # If the markdown has a section like '## Lời Bình' or '## Kịch bản', extract only from there
    m_section = re.search(
        r"^##\s+(?:Lời Bình|Lời dẫn|Kịch bản|Nội dung|Phần đọc|Voiceover|Narration)[^\n]*\n",
        text,
        flags=re.MULTILINE | re.IGNORECASE,
    )
    if m_section:
        # Take everything from after that header line
        text = text[m_section.end():]
    else:
        # If no explicit header, strip top frontmatter / metadata lines
        text = re.sub(r"^[-*]?\s*\*\*[^*]+?\*\*:\s*.*$", "", text, flags=re.MULTILINE)

    # Remove markdown code blocks
    text = re.sub(r"```[\s\S]*?```", "", text)
    # Remove markdown headers (# Title)
    text = re.sub(r"^#{1,6}\s+.*$", "", text, flags=re.MULTILINE)
    # Remove horizontal rules
    text = re.sub(r"^[-*_]{3,}\s*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)
    # Remove bold/italic markdown
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    # Remove inline links
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    # Normalize punctuation and whitespace
    text = text.replace("—", ", ").replace("–", ", ")
    text = re.sub(r"\n\s*\n+", "\n\n", text).strip()
    return text


def parse_srt_timestamp(ts: str) -> float:
    """Parse SRT timestamp '00:01:23,456' to float seconds."""
    m = re.match(r"(\d+):(\d+):(\d+)[,\.](\d+)", ts.strip())
    if not m:
        return 0.0
    h, mi, s, ms = map(int, m.groups())
    return h * 3600.0 + mi * 60.0 + s + ms / 1000.0


def format_srt_timestamp(seconds: float) -> str:
    """Format float seconds to SRT timestamp '00:01:23,456'."""
    seconds = max(0.0, float(seconds))
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    if ms >= 1000:
        s += 1
        ms -= 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def shift_srt_chunk(srt_text: str, time_offset: float, starting_index: int = 1) -> tuple[str, int]:
    """Shift all timestamps in an SRT string by time_offset seconds and renumber entries."""
    pattern = re.compile(
        r"(\d+)\s*\n(\d+:\d+:\d+[,\.]\d+)\s*-->\s*(\d+:\d+:\d+[,\.]\d+)\s*\n([\s\S]*?)(?=\n\s*\d+\s*\n|\Z)"
    )
    shifted_blocks = []
    curr_idx = starting_index
    for m in pattern.finditer(srt_text.strip()):
        start_ts = parse_srt_timestamp(m.group(2)) + time_offset
        end_ts = parse_srt_timestamp(m.group(3)) + time_offset
        body = m.group(4).strip()
        if body:
            block = f"{curr_idx}\n{format_srt_timestamp(start_ts)} --> {format_srt_timestamp(end_ts)}\n{body}\n"
            shifted_blocks.append(block)
            curr_idx += 1
    return "\n".join(shifted_blocks), curr_idx


def split_into_chunks(raw_or_cleaned_text: str, max_words: int = 300) -> list[str]:
    """Split long text into logical, manageable sections for reliable TTS generation."""
    # Check if text has markdown section headers like ### Phần X: or ## Chương X:
    if re.search(r"^###?\s+(?:Phần|Chương|Section)\s+\d+:", raw_or_cleaned_text, flags=re.MULTILINE):
        raw_parts = re.split(r"(?=^###?\s+(?:Phần|Chương|Section)\s+\d+:)", raw_or_cleaned_text, flags=re.MULTILINE)
        chunks = []
        for part in raw_parts:
            cleaned = clean_script_text(part)
            if cleaned and len(cleaned.split()) >= 10:
                chunks.append(cleaned)
        if chunks:
            return chunks

    # Fallback: split by double newline paragraphs
    paragraphs = [p.strip() for p in raw_or_cleaned_text.split("\n\n") if p.strip()]
    chunks = []
    current_chunk = []
    current_words = 0

    for para in paragraphs:
        cleaned_para = clean_script_text(para) if not para.startswith("###") else ""
        if not cleaned_para:
            continue
        p_words = len(cleaned_para.split())
        if current_words + p_words > max_words and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [cleaned_para]
            current_words = p_words
        else:
            current_chunk.append(cleaned_para)
            current_words += p_words

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks if chunks else [clean_script_text(raw_or_cleaned_text)]


def _call_cit_api_single(
    text: str,
    voice_id: str,
    speed: float,
    base_url: str,
    audio_format: str = "wav",
    timeout: float = 300.0,
) -> tuple[bytes, str, float]:
    """Single API call to CIT Voice Studio."""
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

    return base64.b64decode(audio_b64), srt_content, duration_seconds


def generate_voice_cit(
    text: str,
    output_audio: str = "narration.mp3",
    output_srt: str = "input.srt",
    voice_id: str = DEFAULT_VOICE,
    speed: float = DEFAULT_SPEED,
    base_url: str = DEFAULT_BASE_URL,
    audio_format: str = "wav",
    timeout: float = 300.0,
    raw_source_text: str = None,
):
    """
    Calls CIT Voice Studio API to generate audio + srt.
    Supports automatic chunking for long-form scripts (8-12+ mins) to prevent timeouts.
    """
    health = check_health(base_url)
    if not health.get("online"):
        raise ConnectionError(
            f"CIT Voice Studio is NOT running at {base_url}. "
            "Please start CIT-Voice-Studio.exe on your machine first."
        )

    out_audio_path = Path(output_audio).resolve()
    out_audio_path.parent.mkdir(parents=True, exist_ok=True)
    out_srt_path = Path(output_srt).resolve()
    out_srt_path.parent.mkdir(parents=True, exist_ok=True)

    # Determine chunks
    source_to_split = raw_source_text or text
    chunks = split_into_chunks(source_to_split, max_words=320)

    if len(chunks) == 1:
        # Single chunk mode
        audio_bytes, srt_content, duration_seconds = _call_cit_api_single(
            chunks[0], voice_id, speed, base_url, audio_format, timeout
        )
        temp_wav = out_audio_path.with_suffix(".temp.wav")
        temp_wav.write_bytes(audio_bytes)
        if out_audio_path.suffix.lower() == ".mp3":
            try:
                subprocess.run(
                    ["ffmpeg", "-y", "-i", str(temp_wav), "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "48000", str(out_audio_path)],
                    check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                )
                if temp_wav.exists():
                    temp_wav.unlink()
            except Exception:
                if temp_wav.exists():
                    temp_wav.replace(out_audio_path)
        else:
            temp_wav.replace(out_audio_path)

        out_srt_path.write_text(srt_content, encoding="utf-8")
        return {
            "status": "success",
            "audio_path": str(out_audio_path),
            "srt_path": str(out_srt_path),
            "duration_seconds": duration_seconds,
            "voice_id": voice_id,
            "speed": speed,
            "sample_rate": 48000,
            "chunks_count": 1,
        }

    # Multi-chunk mode (for long-form videos)
    print(f"[CIT Bridge] Activating Long-form Chunking Mode: {len(chunks)} sections to synthesize...")
    chunk_wav_files = []
    all_shifted_srts = []
    cumulative_duration = 0.0
    current_srt_index = 1
    temp_dir = out_audio_path.parent / "_temp_cit_chunks"
    temp_dir.mkdir(parents=True, exist_ok=True)

    try:
        for idx, chunk_text in enumerate(chunks, 1):
            w_count = len(chunk_text.split())
            print(f"[CIT Bridge] Synthesizing Section {idx}/{len(chunks)} ({w_count} words) with voice '{voice_id}'...")
            c_audio_bytes, c_srt, c_duration = _call_cit_api_single(
                chunk_text, voice_id, speed, base_url, audio_format="wav", timeout=timeout
            )
            c_wav_path = temp_dir / f"chunk_{idx:02d}.wav"
            c_wav_path.write_bytes(c_audio_bytes)
            chunk_wav_files.append(c_wav_path)

            shifted_srt, next_idx = shift_srt_chunk(c_srt, cumulative_duration, current_srt_index)
            all_shifted_srts.append(shifted_srt)
            current_srt_index = next_idx
            cumulative_duration += c_duration
            print(f"[CIT Bridge] Section {idx}/{len(chunks)} completed: +{c_duration:.1f}s (Total: {cumulative_duration/60:.2f} mins)")

        # Concatenate audio files using ffmpeg concat demuxer
        concat_txt = temp_dir / "concat_list.txt"
        concat_lines = [f"file '{p.resolve().as_posix()}'" for p in chunk_wav_files]
        concat_txt.write_text("\n".join(concat_lines), encoding="utf-8")

        print(f"[CIT Bridge] Concatenating {len(chunk_wav_files)} sections into final 48kHz audio: {out_audio_path.name}...")
        ffmpeg_cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", str(concat_txt),
            "-c:a", "libmp3lame" if out_audio_path.suffix.lower() == ".mp3" else "copy",
            "-b:a", "192k",
            "-ar", "48000",
            str(out_audio_path)
        ]
        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Write merged SRT
        final_srt_content = "\n\n".join(all_shifted_srts).strip() + "\n"
        out_srt_path.write_text(final_srt_content, encoding="utf-8")
        print(f"[CIT Bridge] Subtitles merged successfully: {out_srt_path.name} ({current_srt_index - 1} entries)")

    finally:
        # Cleanup temp directory
        try:
            for p in temp_dir.glob("*"):
                try:
                    p.unlink()
                except Exception:
                    pass
            temp_dir.rmdir()
        except Exception:
            pass

    return {
        "status": "success",
        "audio_path": str(out_audio_path),
        "srt_path": str(out_srt_path),
        "duration_seconds": round(cumulative_duration, 3),
        "voice_id": voice_id,
        "speed": speed,
        "sample_rate": 48000,
        "chunks_count": len(chunks),
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
    raw_source = None
    if args.script_file:
        p = Path(args.script_file)
        if not p.is_file():
            print(f"Error: Script file not found: {args.script_file}", file=sys.stderr)
            sys.exit(1)
        raw_source = p.read_text(encoding="utf-8")
        text = clean_script_text(raw_source)
    elif args.text:
        raw_source = args.text
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
            raw_source_text=raw_source,
        )
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
