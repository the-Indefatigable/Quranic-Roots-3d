"""Voice, sound and timing for any reel described by a spec file.

    python scripts/reels/engine/reel_audio.py scripts/reels/specs/hamd.json <out-dir>

A spec lists segments in order: {"id", "say": text} is narration (Microsoft neural voice via
edge-tts, with every word's timing) and {"id", "recite": [mp3 urls]} is Quran recitation.
"sfx" anchors sound accents to a spoken word ({"seg", "word"}) or a segment edge
({"seg", "edge": "start"|"end", "offset"}). Nothing is ever mixed under a recitation, and there
is no music. Writes cues.json (segments, words, sfx times, duration) and soundtrack.wav.
"""
import asyncio, json, subprocess, sys, urllib.request
from pathlib import Path
import numpy as np
import edge_tts

SR = 44100
SPEC = json.loads(Path(sys.argv[1]).read_text())
OUT = Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
VOICE = SPEC.get("voice", "en-US-AndrewNeural")
RATE = SPEC.get("rate", "+8%")


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def trim(x, thresh=0.01):
    idx = np.where(np.abs(x) > thresh)[0]
    return (x[max(0, idx[0] - 600): idx[-1] + 2400], max(0, idx[0] - 600)) if len(idx) else (x, 0)


async def speak(text, path):
    for attempt in range(5):
        try:
            words = []
            com = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
            with open(path, "wb") as f:
                async for chunk in com.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        words.append({"w": chunk["text"], "s": chunk["offset"] / 1e7, "e": (chunk["offset"] + chunk["duration"]) / 1e7})
            if words:
                return words
        except Exception as err:  # the service drops a request now and then
            print("  retry", attempt, err)
        await asyncio.sleep(1.5 + attempt)
    raise SystemExit(f"could not synthesise: {text}")


# ---- sound accents, synthesised (nothing to license)
def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)

def ting(freq=1760, dur=1.1, gain=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.45 * np.sin(2 * np.pi * freq * 2.76 * t) + 0.2 * np.sin(2 * np.pi * freq * 5.4 * t)
    return (tone * env(n, 0.002, 0.28) * gain).astype(np.float32)

def tock(gain=0.5):
    n = int(0.22 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (180 * np.exp(-t * 18) + 60) * t) * env(n, 0.001, 0.05) * gain).astype(np.float32)

def tick(gain=0.12):
    n = int(0.03 * SR); rng = np.random.default_rng(1)
    return (np.diff(np.r_[0, rng.standard_normal(n)]) * env(n, 0.0005, 0.006) * gain).astype(np.float32)

def whoosh(dur=0.55, gain=0.35, rising=True):
    n = int(dur * SR); rng = np.random.default_rng(7); noise = rng.standard_normal(n)
    out = np.zeros(n); y = 0.0
    cut = np.linspace(0.02, 0.35, n) if rising else np.linspace(0.35, 0.02, n)
    for i in range(n):
        y += cut[i] * (noise[i] - y); out[i] = y
    return (out / (np.abs(out).max() + 1e-9) * np.sin(np.linspace(0, np.pi, n)) ** 1.6 * gain).astype(np.float32)

def chime(gain=0.18):
    a, b = ting(1318.5, 1.6, gain), ting(1975.5, 1.6, gain * 0.8)
    out = np.zeros(len(a) + int(0.12 * SR), dtype=np.float32); out[:len(a)] += a; out[int(0.12 * SR):] += b
    return out

def sub_hit(gain=0.45):
    n = int(0.9 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 48 * t) * env(n, 0.004, 0.35) * gain).astype(np.float32)

def buzz(gain=0.16):          # the quiz timer running out
    n = int(0.35 * SR); t = np.arange(n) / SR
    return (np.sign(np.sin(2 * np.pi * 140 * t)) * env(n, 0.005, 0.12) * gain).astype(np.float32)

def clock(gain=0.14):         # one second of the quiz timer
    return tock(gain)

SOUNDS = {"whoosh": whoosh(), "whoosh_down": whoosh(0.45, 0.28, False), "ting": ting(), "ting_hi": ting(2093, 1.2, 0.2),
          "tock": tock(), "sub": sub_hit(), "chime": chime(), "tick": tick(), "buzz": buzz(), "clock": clock()}


async def main():
    clips, timeline, cursor = [], [], SPEC.get("lead", 0.35)
    for i, seg in enumerate(SPEC["segments"]):
        sid = seg["id"]
        if "recite" in seg:
            parts = []
            for j, url in enumerate(seg["recite"]):
                mp3 = OUT / f"{sid}_{j}.mp3"; urllib.request.urlretrieve(url, mp3)
                parts.append(trim(decode(mp3))[0])
                parts.append(np.zeros(int(0.25 * SR), dtype=np.float32))
            audio = np.concatenate(parts[:-1]); words = []
        else:
            mp3 = OUT / f"vo_{sid}.mp3"; words = await speak(seg["say"], mp3)
            audio, cut = trim(decode(mp3)); shift = cut / SR
            words = [{**w, "s": round(w["s"] - shift, 3), "e": round(w["e"] - shift, 3)} for w in words]
        dur = len(audio) / SR
        timeline.append({"id": sid, "kind": "recite" if "recite" in seg else "say", "start": round(cursor, 3), "end": round(cursor + dur, 3),
                         "text": seg.get("say"), "words": [{**w, "s": round(cursor + w["s"], 3), "e": round(cursor + w["e"], 3)} for w in words]})
        clips.append((cursor, audio))
        cursor += dur + seg.get("gap", SPEC.get("gap", 0.3))
    total = cursor + SPEC.get("tail", 0.6)
    seg = {s["id"]: s for s in timeline}

    def when(a):
        s = seg[a["seg"]]
        if "word" in a:
            hits = [w for w in s["words"] if a["word"].lower() in w["w"].lower()]
            return hits[a.get("nth", 0)]["s"] + a.get("offset", 0)
        return s[a.get("edge", "start")] + a.get("offset", 0)

    sfx = []
    for a in SPEC.get("sfx", []):
        t = when(a)
        for k in range(a.get("count", 1)):
            sfx.append({"n": a["n"], "t": round(t + k * a.get("every", 0), 3)})

    mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for start, audio in clips:
        i = int(start * SR); mix[i:i + len(audio)] += audio * 0.95
    recites = [(s["start"] - 0.05, s["end"]) for s in timeline if s["kind"] == "recite"]
    for s in sfx:
        if any(a <= s["t"] <= b for a, b in recites):      # nothing over the recitation
            continue
        a = SOUNDS[s["n"]]; i = int(s["t"] * SR); mix[i:i + len(a)] += a[: len(mix) - i]
    mix /= max(1.0, float(np.abs(mix).max()) / 0.95)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "soundtrack.wav")],
                   input=mix[: int(total * SR)].tobytes(), check=True)
    (OUT / "cues.json").write_text(json.dumps({"duration": round(total, 2), "segments": timeline, "sfx": sfx}, ensure_ascii=False, indent=1))
    print(f"{Path(sys.argv[1]).stem}: {total:.1f}s, voice {VOICE}")
    for s in timeline:
        print(f"  {s['start']:6.2f}-{s['end']:6.2f}  {s['id']:10s} {s['text'] or '(recitation)'}")


asyncio.run(main())
