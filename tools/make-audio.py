#!/usr/bin/env python3
"""
make-audio.py - build spoken-review MP3 "audio packs" for the study app.

For every course section that has flashcards/questions, writes
    <out>/<track>/<sectionId>.mp3
and an index at <out>/index.json (format: docs/app-spec.md "Audio packs"):
    { "generated": ISO, "tracks": { "clf": [ {section,title,file,seconds,items,hash} ], "saa": [...] } }
`file` paths are relative to the webapp root (e.g. "audio/clf/clf-05.mp3").

Deps: Python 3.9+, `pip install edge-tts`, node (to read the app's data files),
ffmpeg + ffprobe on PATH (optional: without ffmpeg each section is one edge-tts call
and pauses are approximated; without ffprobe durations are estimated from file size).

Usage (from repo root):
    python tools/make-audio.py                          # everything -> webapp/audio
    python tools/make-audio.py --tracks clf --sections clf-05,clf-16 --out /tmp/audio
    python tools/make-audio.py --skip-unchanged         # reuse MP3s whose content hash matches
Exits 0 even if some sections fail (prints a warning summary); exits 1 only on setup errors.
"""

import argparse
import asyncio
import datetime as dt
import hashlib
import json
import os
import random
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT_VERSION = 1          # bump to force regeneration of every pack
REPO = Path(__file__).resolve().parent.parent
JS_DIR = REPO / "webapp" / "js"
LETTERS = "ABCDE"

PAUSE_AFTER_INTRO = 1.0
PAUSE_CARD = 2.5            # between term and definition
PAUSE_QUESTION = 5.0        # between options and answer
PAUSE_BETWEEN_ITEMS = 1.2
SAMPLE_RATE = 24000         # edge-tts native rate
BITRATE = "48k"             # mono, low bitrate
EDGE_BYTES_PER_SEC = 48000 / 8   # edge-tts default output: 24 kHz 48 kbit/s mono mp3

TRACK_NAMES = {"clf": "Cloud Practitioner", "saa": "Solutions Architect Associate"}


# ------------------------------------------------------------------ data loading
NODE_LOADER = r"""
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = process.argv[1];
const ctx = {}; vm.createContext(ctx);
for (const f of ['course.js', 'data.js', 'data-saa.js']) {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
}
const get = (n) => vm.runInContext(`typeof ${n} === 'undefined' ? null : ${n}`, ctx);
process.stdout.write(JSON.stringify({
  courses: get('COURSES'),
  clf: { cards: get('FLASHCARDS') || [], questions: get('QUESTIONS') || [] },
  saa: { cards: get('SAA_FLASHCARDS') || [], questions: get('SAA_QUESTIONS') || [] },
}));
"""


def load_data():
    node = shutil.which("node")
    if not node:
        sys.exit("ERROR: node is required to read webapp/js/*.js")
    res = subprocess.run([node, "-e", NODE_LOADER, str(JS_DIR)],
                         capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        sys.exit("ERROR: could not load app data:\n" + res.stderr)
    return json.loads(res.stdout)


# ------------------------------------------------------------------ script text
def clean(text):
    """Make text friendlier for TTS."""
    t = str(text or "")
    t = re.sub(r"<[^>]+>", " ", t)            # stray html
    t = t.replace("&", " and ").replace("→", " to ").replace("≥", " at least ")
    t = t.replace("≤", " at most ").replace("×", " times ").replace("|", ", ")
    t = t.replace("e.g.", "for example").replace("i.e.", "that is")
    t = re.sub(r"\s+", " ", t).strip()
    return t


def end(t):
    t = t.rstrip()
    return t if not t or t[-1] in ".?!:" else t + "."


def build_segments(track, section, cards, questions):
    """Returns list of ("say", text) / ("pause", seconds)."""
    n_items = len(cards) + len(questions)
    segs = [("say", end(f"{TRACK_NAMES.get(track, track)}. Section {section['n']}: "
                        f"{clean(section['title'])}") + f" {n_items} item{'s' if n_items != 1 else ''}."),
            ("pause", PAUSE_AFTER_INTRO)]
    for i, c in enumerate(cards, 1):
        segs.append(("say", f"Card {i}. {end(clean(c['term']))}"))
        segs.append(("pause", PAUSE_CARD))
        segs.append(("say", end(clean(c["definition"]))))
        segs.append(("pause", PAUSE_BETWEEN_ITEMS))
    for i, q in enumerate(questions, 1):
        opts = " ".join(f"Option {LETTERS[k]}: {end(clean(o))}" for k, o in enumerate(q["options"]))
        segs.append(("say", f"Question {i}. {end(clean(q['question']))} {opts}"))
        segs.append(("pause", PAUSE_QUESTION))
        ans = q["answer"] if isinstance(q["answer"], list) else [q["answer"]]
        if len(ans) > 1:
            letters = " and ".join(LETTERS[a] for a in ans)
            texts = "; and ".join(end(clean(q["options"][a]))[:-1] for a in ans)
            head = f"The answers are {letters}: {texts}."
        else:
            head = f"The answer is {LETTERS[ans[0]]}: {end(clean(q['options'][ans[0]]))}"
        segs.append(("say", f"{head} {end(clean(q.get('explanation', '')))}".strip()))
        segs.append(("pause", PAUSE_BETWEEN_ITEMS))
    return segs


def content_hash(segs, voice, rate, mode):
    h = hashlib.sha256(json.dumps([SCRIPT_VERSION, voice, rate, mode, BITRATE, segs],
                                  ensure_ascii=False).encode("utf-8"))
    return h.hexdigest()[:16]


# ------------------------------------------------------------------ tts + audio
async def tts_to_file(text, path, voice, rate, retries=5):
    import edge_tts
    delay = 2.0
    for attempt in range(1, retries + 1):
        try:
            await edge_tts.Communicate(text, voice, rate=rate).save(str(path))
            if path.exists() and path.stat().st_size > 0:
                return
            raise RuntimeError("empty audio")
        except Exception as e:  # network hiccups, throttling, NoAudioReceived
            if attempt == retries:
                raise RuntimeError(f"edge-tts failed after {retries} tries: {e}") from e
            await asyncio.sleep(delay + random.random())
            delay *= 2


def run(cmd):
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        raise RuntimeError(f"{Path(cmd[0]).name} failed: {res.stderr.strip()[-400:]}")
    return res.stdout


def probe_seconds(path, ffprobe):
    if ffprobe:
        try:
            out = run([ffprobe, "-v", "error", "-show_entries", "format=duration",
                       "-of", "default=noprint_wrappers=1:nokey=1", str(path)])
            return round(float(out.strip()))
        except Exception:
            pass
    return round(path.stat().st_size / EDGE_BYTES_PER_SEC)


class SilenceCache:
    def __init__(self, ffmpeg, tmp):
        self.ffmpeg, self.tmp, self.files = ffmpeg, tmp, {}

    def get(self, seconds):
        key = f"{seconds:.2f}"
        if key not in self.files:
            p = Path(self.tmp) / f"silence-{key}.mp3"
            run([self.ffmpeg, "-y", "-v", "error", "-f", "lavfi", "-t", key,
                 "-i", f"anullsrc=r={SAMPLE_RATE}:cl=mono",
                 "-c:a", "libmp3lame", "-b:a", BITRATE, str(p)])
            self.files[key] = p
        return self.files[key]


async def render_with_ffmpeg(segs, out_path, voice, rate, ffmpeg, silence, workdir, inner_jobs=3):
    work = Path(workdir)
    sem = asyncio.Semaphore(inner_jobs)
    parts = []

    async def speak(i, text):
        p = work / f"u{i:04d}.mp3"
        async with sem:
            await tts_to_file(text, p, voice, rate)
        return p

    tasks = {}
    for i, (kind, val) in enumerate(segs):
        if kind == "say":
            tasks[i] = asyncio.ensure_future(speak(i, val))
    try:
        await asyncio.gather(*tasks.values())
    except Exception:
        for t in tasks.values():
            t.cancel()
        raise
    for i, (kind, val) in enumerate(segs):
        parts.append(tasks[i].result() if kind == "say" else silence.get(val))

    lst = work / "list.txt"
    lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in parts), encoding="utf-8")
    tmp_out = out_path.with_suffix(".tmp.mp3")
    await asyncio.to_thread(run, [ffmpeg, "-y", "-v", "error", "-f", "concat", "-safe", "0",
                                  "-i", str(lst), "-ac", "1", "-ar", str(SAMPLE_RATE),
                                  "-c:a", "libmp3lame", "-b:a", BITRATE, str(tmp_out)])
    os.replace(tmp_out, out_path)


async def render_single_call(segs, out_path, voice, rate):
    """Fallback without ffmpeg: one edge-tts call; pauses approximated with ellipses."""
    chunks = []
    for kind, val in segs:
        if kind == "say":
            chunks.append(val)
        else:
            chunks.append(" ... " * max(1, round(val)))
    tmp_out = out_path.with_suffix(".tmp.mp3")
    await tts_to_file(" ".join(chunks), tmp_out, voice, rate)
    os.replace(tmp_out, out_path)


# ------------------------------------------------------------------ main
def read_index(path):
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data.get("tracks"), dict) else {"tracks": {}}
    except Exception:
        return {"tracks": {}}


def write_index(path, order, entries):
    tracks = {}
    for tr, ids in order.items():
        lst = [entries[(tr, sid)] for sid in ids if (tr, sid) in entries]
        if lst:
            tracks[tr] = lst
    data = {"generated": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
            "tracks": tracks}
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, path)


async def main_async(args):
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        sys.exit("ERROR: edge-tts not installed (pip install edge-tts)")

    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    mode = "ffmpeg" if ffmpeg else "single"
    if not ffmpeg:
        print("WARNING: ffmpeg not found - using one edge-tts call per section (approximate pauses).")
    if not ffprobe:
        print("WARNING: ffprobe not found - durations estimated from file size.")

    data = load_data()
    courses = data["courses"] or {}
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    index_path = out / "index.json"
    old = read_index(index_path)

    tracks = [t.strip() for t in args.tracks.split(",") if t.strip()]
    only = {s.strip() for s in args.sections.split(",") if s.strip()} if args.sections else None

    # Full course order (all tracks) so previously generated packs are kept in the index.
    order, sections = {}, {}
    for tr, course in courses.items():
        if tr not in data:
            continue
        order[tr] = []
        for s in course.get("sections", []):
            cards = [c for c in data[tr]["cards"] if c.get("section") == s["id"]]
            qs = [q for q in data[tr]["questions"] if q.get("section") == s["id"]]
            if cards or qs:
                order[tr].append(s["id"])
                sections[(tr, s["id"])] = (s, cards, qs)

    # Seed entries with still-valid packs from the previous index.
    entries = {}
    for tr, lst in old.get("tracks", {}).items():
        for e in lst or []:
            key = (tr, e.get("section"))
            if key in sections and (out / tr / f"{key[1]}.mp3").exists():
                entries[key] = e

    todo = [k for k in sections if k[0] in tracks and (only is None or k[1] in only)]
    if only:
        missing = only - {k[1] for k in todo}
        for m in sorted(missing):
            print(f"WARNING: section {m} not found in selected tracks or has no items")
    print(f"Voice {args.voice} rate {args.rate} | {len(todo)} section(s) | mode {mode} | out {out}")

    failures, stats = [], {"made": 0, "reused": 0}
    lock = asyncio.Lock()
    sem = asyncio.Semaphore(max(1, args.jobs))
    tmp_root = tempfile.mkdtemp(prefix="make-audio-")
    silence = SilenceCache(ffmpeg, tmp_root) if ffmpeg else None

    async def do_section(key):
        tr, sid = key
        s, cards, qs = sections[key]
        segs = build_segments(tr, s, cards, qs)
        h = content_hash(segs, args.voice, args.rate, mode)
        mp3 = out / tr / f"{sid}.mp3"
        rel = f"audio/{tr}/{sid}.mp3"   # webapp-root relative (app serves webapp/audio)
        entry = {"section": sid, "title": s["title"], "file": rel, "items": len(cards) + len(qs)}
        prev = entries.get(key)
        if args.skip_unchanged and prev and prev.get("hash") == h and mp3.exists():
            async with lock:
                entries[key] = {**entry, "seconds": prev.get("seconds") or probe_seconds(mp3, ffprobe), "hash": h}
                stats["reused"] += 1
            print(f"  = {sid} unchanged")
            return
        async with sem:
            mp3.parent.mkdir(parents=True, exist_ok=True)
            try:
                if mode == "ffmpeg":
                    wd = Path(tmp_root) / f"{tr}-{sid}"
                    wd.mkdir(exist_ok=True)
                    await render_with_ffmpeg(segs, mp3, args.voice, args.rate, ffmpeg, silence, wd)
                    shutil.rmtree(wd, ignore_errors=True)
                else:
                    await render_single_call(segs, mp3, args.voice, args.rate)
                secs = await asyncio.to_thread(probe_seconds, mp3, ffprobe)
            except Exception as e:
                failures.append((sid, str(e)))
                print(f"  ! {sid} FAILED: {e}")
                return
            async with lock:
                entries[key] = {**entry, "seconds": secs, "hash": h}
                stats["made"] += 1
                write_index(index_path, order, entries)   # save progress as we go
            print(f"  + {sid} {secs}s ({entry['items']} items)")

    if silence:  # pre-create silences serially (avoids races)
        for d in {PAUSE_AFTER_INTRO, PAUSE_CARD, PAUSE_QUESTION, PAUSE_BETWEEN_ITEMS}:
            silence.get(d)
    await asyncio.gather(*(do_section(k) for k in todo))
    write_index(index_path, order, entries)
    shutil.rmtree(tmp_root, ignore_errors=True)

    print(f"Done: {stats['made']} generated, {stats['reused']} reused, {len(failures)} failed. Index: {index_path}")
    if failures:
        print("WARNING: some sections failed (they are omitted from / keep their old entry in index.json):")
        for sid, e in failures:
            print(f"  - {sid}: {e[:200]}")
    return 0


def main():
    ap = argparse.ArgumentParser(description="Generate spoken-review MP3 audio packs.")
    ap.add_argument("--out", default=str(REPO / "webapp" / "audio"),
                    help="output dir (default webapp/audio); index paths are always audio/<track>/<id>.mp3")
    ap.add_argument("--tracks", default="clf,saa")
    ap.add_argument("--sections", default="", help="comma-separated section ids (default: all)")
    ap.add_argument("--voice", default="en-US-AndrewNeural")
    ap.add_argument("--rate", default="+0%", help='edge-tts rate, e.g. "+10%%" or "-5%%"')
    ap.add_argument("--jobs", type=int, default=4, help="sections rendered in parallel")
    ap.add_argument("--skip-unchanged", action="store_true",
                    help="reuse existing MP3 when the section's content hash is unchanged")
    args = ap.parse_args()
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    except Exception:
        pass
    sys.exit(asyncio.run(main_async(args)))


if __name__ == "__main__":
    main()
