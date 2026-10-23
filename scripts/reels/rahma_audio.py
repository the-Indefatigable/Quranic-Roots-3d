"""Narration, sound effects and timing for the ر ح م reel.

Writes <out>/cues.json (scene times, every spoken word's start and end, sound-effect times) and
<out>/soundtrack.wav. The page scripts/reels/rahma2.html reads the cues so captions, cuts and
sounds land on the same frame. Narration: Microsoft neural voice via edge-tts. Sound effects are
synthesised here, so there is nothing to license. Nothing plays under the recitation.

Run: python scripts/reels/rahma_audio.py <out-dir> [voice]
Needs: edge-tts, numpy, ffmpeg.
"""
import asyncio, json, subprocess, sys, urllib.request
from pathlib import Path
import numpy as np
import edge_tts

SR = 44100
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
VOICE = sys.argv[2] if len(sys.argv) > 2 else "en-US-AndrewNeural"
RECITATION = "https://everyayah.com/data/Alafasy_128kbps/001001.mp3"

# (id, text) in order; "recite" is the Alafasy clip of 1:1.
SCRIPT = [
    ("hook", "You say this at least seventeen times a day."),
    ("recite", None),
    ("two", "Two of these words grow from the same three letters."),
    ("letters", "Ra. Ha. Meem."),
    ("meaning", "The root of mercy."),
    ("family", "From it comes mercy. The Most Gracious. The Most Merciful. And the womb."),
    ("count", "Three hundred and thirty three words in the Quran grow from this one root."),
    ("cta", "Understand every word of your salah in thirty days. Link in bio."),
]
GAP = {"hook": 0.25, "recite": 0.35, "two": 0.2, "letters": 0.25, "meaning": 0.3, "family": 0.35, "count": 0.3, "cta": 0.8}


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


async def speak(text, path):
    for attempt in range(4):
        try:
            words = []
            com = edge_tts.Communicate(text, VOICE, rate="+8%", boundary="WordBoundary")
            with open(path, "wb") as f:
                async for chunk in com.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        words.append({"w": chunk["text"], "s": chunk["offset"] / 1e7, "e": (chunk["offset"] + chunk["duration"]) / 1e7})
            if words:
                return words
        except Exception as err:  # the service drops a request now and then
            print("retry", attempt, err)
        await asyncio.sleep(1.5)
    raise SystemExit(f"could not synthesise: {text}")


def trim(x, thresh=0.01):
    idx = np.where(np.abs(x) > thresh)[0]
    return x[max(0, idx[0] - 600): idx[-1] + 2400] if len(idx) else x


# ---- sound effects
def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)

def ting(freq=1760, dur=1.1, gain=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.45 * np.sin(2 * np.pi * freq * 2.76 * t) + 0.2 * np.sin(2 * np.pi * freq * 5.4 * t)
    return (tone * env(n, 0.002, 0.28) * gain).astype(np.float32)

def tock(gain=0.5):
    n = int(0.22 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (180 * np.exp(-t * 18) + 60) * t)
    return (body * env(n, 0.001, 0.05) * gain).astype(np.float32)

def tick(gain=0.12):
    n = int(0.03 * SR); rng = np.random.default_rng(1)
    return (np.diff(np.r_[0, rng.standard_normal(n)]) * env(n, 0.0005, 0.006) * gain).astype(np.float32)

def whoosh(dur=0.55, gain=0.35, rising=True):
    n = int(dur * SR); rng = np.random.default_rng(7)
    noise = rng.standard_normal(n)
    out = np.zeros(n); y = 0.0
    cut = np.linspace(0.02, 0.35, n) if rising else np.linspace(0.35, 0.02, n)   # sweeping one-pole low-pass
    for i in range(n):
        y += cut[i] * (noise[i] - y); out[i] = y
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    return (out / (np.abs(out).max() + 1e-9) * shape * gain).astype(np.float32)

def chime(gain=0.18):
    a, b = ting(1318.5, 1.6, gain), ting(1975.5, 1.6, gain * 0.8)
    out = np.zeros(len(a) + int(0.12 * SR), dtype=np.float32); out[:len(a)] += a; out[int(0.12 * SR):] += b
    return out

def sub_hit(gain=0.45):
    n = int(0.9 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 48 * t) * env(n, 0.004, 0.35) * gain).astype(np.float32)


async def main():
    clips, timeline, cursor = {}, [], 0.35       # a beat of silence, then the hook
    for sid, text in SCRIPT:
        if sid == "recite":
            mp3 = OUT / "recite.mp3"; urllib.request.urlretrieve(RECITATION, mp3)
            audio = trim(decode(mp3)); words = []
        else:
            mp3 = OUT / f"vo_{sid}.mp3"; words = await speak(text, mp3)
            audio = decode(mp3)
            lead = int(np.argmax(np.abs(audio) > 0.01)); audio = trim(audio)
            shift = max(0, lead - 600) / SR
            words = [{**w, "s": round(w["s"] - shift, 3), "e": round(w["e"] - shift, 3)} for w in words]
        dur = len(audio) / SR
        timeline.append({"id": sid, "start": round(cursor, 3), "end": round(cursor + dur, 3), "text": text,
                         "words": [{**w, "s": round(cursor + w["s"], 3), "e": round(cursor + w["e"], 3)} for w in words]})
        clips[sid] = (cursor, audio)
        cursor += dur + GAP[sid]
    total = cursor + 0.6

    seg = {s["id"]: s for s in timeline}
    word_at = lambda sid, needle: next(w["s"] for w in seg[sid]["words"] if needle.lower() in w["w"].lower())
    sfx = [
        ("whoosh", seg["recite"]["start"] - 0.45),
        ("ting", word_at("two", "Two")), ("ting_hi", word_at("two", "three")),
        ("tock", word_at("letters", "Ra")), ("tock", word_at("letters", "Ha")), ("tock", word_at("letters", "Meem")),
        ("sub", word_at("meaning", "mercy")),
        ("ting", word_at("family", "mercy")), ("ting", word_at("family", "Gracious")), ("ting", word_at("family", "Merciful")),
        ("chime", word_at("family", "womb")),
        ("whoosh_down", seg["count"]["start"] - 0.35),
        ("chime", seg["cta"]["start"] - 0.1),
    ]
    count_s = seg["count"]["start"]
    sfx += [("tick", round(count_s + i * 0.07, 3)) for i in range(16)]   # the counter running up
    sounds = {"whoosh": whoosh(), "whoosh_down": whoosh(0.45, 0.28, False), "ting": ting(), "ting_hi": ting(2093, 1.2, 0.2),
              "tock": tock(), "sub": sub_hit(), "chime": chime(), "tick": tick()}

    mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for sid, (start, audio) in clips.items():
        i = int(start * SR); mix[i:i + len(audio)] += audio * (1.0 if sid == "recite" else 0.95)
    rec_s, rec_e = seg["recite"]["start"], seg["recite"]["end"]
    for name, t in sfx:
        if rec_s - 0.05 <= t <= rec_e:       # nothing over the recitation
            continue
        a = sounds[name]; i = int(t * SR); mix[i:i + len(a)] += a[: len(mix) - i]
    mix /= max(1.0, float(np.abs(mix).max()) / 0.95)

    wav = OUT / "soundtrack.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(wav)],
                   input=mix[: int(total * SR)].tobytes(), check=True)
    (OUT / "cues.json").write_text(json.dumps({"duration": round(total, 2), "segments": timeline, "sfx": [{"n": n, "t": round(t, 3)} for n, t in sfx]}, ensure_ascii=False, indent=1))
    print(f"voice {VOICE}, {total:.1f}s")
    for s in timeline:
        print(f"{s['start']:6.2f}-{s['end']:6.2f}  {s['id']:8s} {s['text'] or '(recitation)'}")


asyncio.run(main())
