#!/usr/bin/env python3
"""
Diff our surahIndex.json against the Quranic Arabic Corpus morphology file.
Finds roots present in QAC for a surah but missing from our index.
"""

import json, re, sys
from collections import defaultdict

QAC_FILE = 'quranic-corpus-morphology-0.4.txt'

# Buckwalter → Arabic (consonants only)
BW = {
    "'": 'ء', '>': 'أ', '<': 'إ', '|': 'آ', '&': 'ؤ', '}': 'ئ',
    'A': 'ا', 'b': 'ب', 't': 'ت', 'v': 'ث', 'j': 'ج', 'H': 'ح',
    'x': 'خ', 'd': 'د', '*': 'ذ', 'r': 'ر', 'z': 'ز', 's': 'س',
    '$': 'ش', 'S': 'ص', 'D': 'ض', 'T': 'ط', 'Z': 'ظ', 'E': 'ع',
    'g': 'غ', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل', 'm': 'م',
    'n': 'ن', 'h': 'ه', 'w': 'و', 'y': 'ي', '{': 'ا', 'p': 'ة',
    'Y': 'ى', 'W': 'ء', '_': '', '#': '',
}

def bw_to_ar(bw_root):
    return ''.join(BW.get(c, c) for c in bw_root)

def normalize(ar_root):
    """Normalize to match our app's root format (no hamza distinctions)."""
    r = ar_root
    r = r.replace('أ','ا').replace('إ','ا').replace('آ','ا')
    r = r.replace('ء','ا').replace('ؤ','و').replace('ئ','ي')
    r = r.replace('ى','ي').replace('ة','ه')
    return r

# POS tags to EXCLUDE (non-root-bearing function words)
SKIP_TAGS = {'CONJ', 'F', 'COND', 'SUB', 'T', 'VOC', 'REM', 'INC', 'COM',
             'AMD', 'ANS', 'AVR', 'PRO', 'DEM', 'REL', 'INL', 'P', 'DET',
             'INTG', 'EXL', 'INT', 'NEG', 'CERT', 'FUT', 'EXH', 'RES',
             'EXP', 'PREV', 'IMPN', 'SUR'}

# Parse QAC file: build {surah_num: set(normalized_roots)}
qac_roots = defaultdict(set)  # surah -> set of normalized roots
qac_roots_raw = defaultdict(dict)  # surah -> {normalized_root: bw_original}

print("Parsing QAC morphology file...", file=sys.stderr)
with open(QAC_FILE, encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('LOCATION'):
            continue
        parts = line.split('\t')
        if len(parts) < 4:
            continue
        location, form, tag, features = parts[0], parts[1], parts[2], parts[3]

        # Skip pure function words
        if tag in SKIP_TAGS:
            continue

        # Extract surah number from location (surah:verse:word:segment)
        m = re.match(r'\((\d+):', location)
        if not m:
            continue
        surah = int(m.group(1))

        # Extract ROOT from features (stop at | delimiter)
        root_m = re.search(r'ROOT:([A-Za-z\*\$\{\}\'\>\<&_#]+)', features)
        if not root_m:
            continue
        bw_root = root_m.group(1)
        ar_root = normalize(bw_to_ar(bw_root))

        # Skip very short (1-char) or very long (5+ char) roots — likely artifacts
        if len(ar_root) < 2 or len(ar_root) > 4:
            continue

        qac_roots[surah].add(ar_root)
        qac_roots_raw[surah][ar_root] = bw_root

print(f"Done. Found roots for {len(qac_roots)} surahs.", file=sys.stderr)

# Load our surahIndex
with open('public/data/surahIndex.json', encoding='utf-8') as f:
    our_index = json.load(f)

# Load verbsData to know which roots we actually have
with open('data/verbsData.json', encoding='utf-8') as f:
    vdata = json.load(f)
our_root_ids = {r['id'] for r in vdata['roots']}

# --- DIFF ---
print("\n=== ROOT DIFF: QAC vs Our surahIndex ===\n")

total_missing = 0
total_extra = 0

for surah_str in sorted(our_index.keys(), key=int):
    surah = int(surah_str)
    our_roots = set(our_index[surah_str].keys())
    qac = qac_roots.get(surah, set())

    missing = qac - our_roots   # in QAC but not in our index
    extra   = our_roots - qac   # in our index but not in QAC

    # Filter missing: only roots that exist in our verbsData (so we can add them)
    missing_known   = {r for r in missing if r in our_root_ids}
    missing_unknown = {r for r in missing if r not in our_root_ids}

    if missing_known or missing_unknown or extra:
        print(f"Surah {surah}:")
        if missing_known:
            total_missing += len(missing_known)
            for r in sorted(missing_known):
                bw = qac_roots_raw[surah].get(r, '?')
                print(f"  MISSING (in verbsData): {r}  [{bw}]")
        if missing_unknown:
            for r in sorted(missing_unknown):
                bw = qac_roots_raw[surah].get(r, '?')
                print(f"  MISSING (not in verbsData): {r}  [{bw}]")
        if extra:
            total_extra += len(extra)
            for r in sorted(extra):
                print(f"  EXTRA (in our index, not QAC): {r}")
        print()

print(f"Summary: {total_missing} missing roots that exist in verbsData across all surahs")
print(f"         {total_extra} roots in our index not found in QAC")
