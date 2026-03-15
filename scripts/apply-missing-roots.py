#!/usr/bin/env python3
"""
Auto-fix script: adds roots that QAC confirms exist in a surah but are
missing from our surahIndex.json (and updates verbsData.json allReferences).

Only touches "safe" additions — never removes existing data.
"""

import json, re, sys
from collections import defaultdict

QAC_FILE = 'quranic-corpus-morphology-0.4.txt'

# Buckwalter → Arabic
BW = {
    "'": 'ء', '>': 'أ', '<': 'إ', '&': 'ؤ', '}': 'ئ',
    'A': 'ا', 'b': 'ب', 't': 'ت', 'v': 'ث', 'j': 'ج', 'H': 'ح',
    'x': 'خ', 'd': 'د', '*': 'ذ', 'r': 'ر', 'z': 'ز', 's': 'س',
    '$': 'ش', 'S': 'ص', 'D': 'ض', 'T': 'ط', 'Z': 'ظ', 'E': 'ع',
    'g': 'غ', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل', 'm': 'م',
    'n': 'ن', 'h': 'ه', 'w': 'و', 'y': 'ي', '{': 'ا', 'p': 'ة',
    'Y': 'ى', 'W': 'ء', '_': '', '#': '',
}

def bw_to_ar(bw_root):
    return ''.join(BW.get(c, c) for c in bw_root)

def normalize(ar):
    return (ar.replace('أ','ا').replace('إ','ا').replace('آ','ا')
              .replace('ء','ا').replace('ؤ','و').replace('ئ','ي')
              .replace('ى','ي').replace('ة','ه'))

SKIP_TAGS = {'CONJ', 'F', 'COND', 'SUB', 'T', 'VOC', 'REM', 'INC', 'COM',
             'AMD', 'ANS', 'AVR', 'PRO', 'DEM', 'REL', 'INL', 'P', 'DET',
             'INTG', 'EXL', 'INT', 'NEG', 'CERT', 'FUT', 'EXH', 'RES',
             'EXP', 'PREV', 'IMPN', 'SUR'}

# Parse QAC: build {(surah, root): [verse_numbers]}  and  {(surah, root): first_verse}
print("Parsing QAC...", file=sys.stderr)
qac_refs = defaultdict(set)    # (surah, ar_root) -> set of verse numbers

with open(QAC_FILE, encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('LOCATION'):
            continue
        parts = line.split('\t')
        if len(parts) < 4:
            continue
        location, form, tag, features = parts[0], parts[1], parts[2], parts[3]
        if tag in SKIP_TAGS:
            continue
        m = re.match(r'\((\d+):(\d+):', location)
        if not m:
            continue
        surah, verse = int(m.group(1)), int(m.group(2))
        root_m = re.search(r'ROOT:([A-Za-z\*\$\{\}\'\>\<&_#]+)', features)
        if not root_m:
            continue
        ar_root = normalize(bw_to_ar(root_m.group(1)))
        if len(ar_root) < 2 or len(ar_root) > 4:
            continue
        qac_refs[(surah, ar_root)].add(verse)

print("Done parsing.", file=sys.stderr)

# Load our data
with open('public/data/surahIndex.json', encoding='utf-8') as f:
    surah_index = json.load(f)

with open('data/verbsData.json', encoding='utf-8') as f:
    vdata = json.load(f)

roots_map = {r['id']: r for r in vdata['roots']}
our_root_ids = set(roots_map.keys())

# Find and apply fixes
fixes_index = 0
fixes_refs = 0

for (surah, ar_root), verse_set in sorted(qac_refs.items()):
    surah_str = str(surah)
    if surah_str not in surah_index:
        continue
    # Skip if already in surahIndex
    if ar_root in surah_index[surah_str]:
        continue
    # Skip if root not in our verbsData
    if ar_root not in our_root_ids:
        continue

    # Add to surahIndex: value = first verse number
    first_verse = min(verse_set)
    surah_index[surah_str][ar_root] = first_verse
    fixes_index += 1

    # Add missing verse references to verbsData allReferences
    root_entry = roots_map[ar_root]
    existing_refs = set(root_entry.get('allReferences', []))
    new_refs = {f"{surah}:{v}" for v in verse_set} - existing_refs
    if new_refs:
        all_refs = sorted(
            existing_refs | new_refs,
            key=lambda x: (int(x.split(':')[0]), int(x.split(':')[1]))
        )
        root_entry['allReferences'] = all_refs
        fixes_refs += len(new_refs)

print(f"surahIndex fixes: {fixes_index} root-surah pairs added", file=sys.stderr)
print(f"allReferences fixes: {fixes_refs} new verse refs added", file=sys.stderr)

# Write updated files
print("Writing surahIndex.json...", file=sys.stderr)
with open('public/data/surahIndex.json', 'w', encoding='utf-8') as f:
    json.dump(surah_index, f, ensure_ascii=False, separators=(',', ':'))

print("Writing verbsData.json...", file=sys.stderr)
with open('data/verbsData.json', 'w', encoding='utf-8') as f:
    json.dump(vdata, f, ensure_ascii=False, separators=(',', ':'))

print("Done.", file=sys.stderr)
