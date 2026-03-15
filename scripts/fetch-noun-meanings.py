#!/usr/bin/env python3
"""
Fetches word-by-word translations from quran.com API for all surahs,
then applies meanings to nounsData.json using QAC word positions.
"""

import json, re, time, sys
import urllib.request, urllib.error
from collections import defaultdict

NOUNS_FILE   = 'public/data/nounsData.json'
CACHE_FILE   = 'public/data/quranWordsCache.json'

HEADERS = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
}

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    resp = urllib.request.urlopen(req, timeout=15)
    return json.loads(resp.read())

# ── Step 1: Build / load quran.com word cache ─────────────────────────────────
def build_cache():
    """Fetch all 114 surahs from quran.com, return {surah:verse:wordPos: translation}."""
    cache = {}  # "surah:verse:pos" -> translation text

    for surah_num in range(1, 115):
        print(f"  Fetching surah {surah_num}/114...", end='\r', file=sys.stderr)
        page = 1
        while True:
            url = (f"https://api.quran.com/api/v4/verses/by_chapter/{surah_num}"
                   f"?words=true&word_fields=text_uthmani,translation"
                   f"&per_page=300&page={page}")
            try:
                data = fetch_json(url)
            except Exception as e:
                print(f"\n  Error on surah {surah_num} page {page}: {e}", file=sys.stderr)
                time.sleep(2)
                continue

            for verse in data.get('verses', []):
                v_num = verse['verse_number']
                for word in verse.get('words', []):
                    if word.get('char_type_name') != 'word':
                        continue
                    pos = word['position']
                    trans = word.get('translation', {}).get('text', '')
                    if trans:
                        cache[f"{surah_num}:{v_num}:{pos}"] = trans

            meta = data.get('meta', {})
            if page >= meta.get('total_pages', 1):
                break
            page += 1
            time.sleep(0.05)  # be polite

        time.sleep(0.1)

    print(f"\n  Cached {len(cache)} word translations.", file=sys.stderr)
    return cache

# Check if cache exists
import os
if os.path.exists(CACHE_FILE):
    print("Loading existing word cache...", file=sys.stderr)
    with open(CACHE_FILE, encoding='utf-8') as f:
        cache = json.load(f)
    print(f"  Loaded {len(cache)} entries.", file=sys.stderr)
else:
    print("Fetching word translations from quran.com (114 surahs)...", file=sys.stderr)
    cache = build_cache()
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False)
    print("  Cache saved.", file=sys.stderr)

# ── Step 2: Apply meanings to nounsData.json ──────────────────────────────────
print("\nApplying meanings to nounsData.json...", file=sys.stderr)

with open(NOUNS_FILE, encoding='utf-8') as f:
    nouns_data = json.load(f)

filled = 0
missing = 0

for noun in nouns_data['nouns']:
    if noun.get('meaning'):
        continue  # already has a meaning

    lookup = noun.get('lookupRef', '')  # "surah:verse:wordPos"
    if not lookup:
        missing += 1
        continue

    translation = cache.get(lookup, '')
    if translation:
        # Clean up: remove leading articles / punctuation for dictionary feel
        noun['meaning'] = translation
        filled += 1
    else:
        # Try nearby word positions (prefix handling: QAC stem might be word N, API might differ by 1)
        parts = lookup.split(':')
        if len(parts) == 3:
            s, v, w = parts
            for offset in [1, -1, 2, -2]:
                alt = f"{s}:{v}:{int(w)+offset}"
                if cache.get(alt):
                    noun['meaning'] = cache[alt]
                    filled += 1
                    break
            else:
                missing += 1
        else:
            missing += 1

print(f"  Filled: {filled} | Still missing: {missing}", file=sys.stderr)

with open(NOUNS_FILE, 'w', encoding='utf-8') as f:
    json.dump(nouns_data, f, ensure_ascii=False, indent=2)

print("Done. nounsData.json updated with meanings.", file=sys.stderr)
