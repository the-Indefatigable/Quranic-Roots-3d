#!/usr/bin/env python3
"""
Extract the roots of every word in the salah path's surahs from the Quranic Arabic Corpus.

Source: Quranic Arabic Corpus v0.4 (© Kais Dukes 2009–2017, GNU GPL v3), in the Arabic-script
edition with root corrections at github.com/mustafa0x/quran-morphology. Writes
scripts/data/qac-salah.json: {"words": {"s:a:w": root}, "counts": {root: occurrences in the Quran}}.
Counts are words carrying the root anywhere in the Quran, the same way corpus.quran.com counts them.

Run: python3 scripts/extract-qac-salah.py path/to/quran-morphology.txt
"""
import json, re, sys
from collections import Counter

SURAHS = {1, 112, 113, 114, 108, 103, 110, 109, 111, 107, 106, 105}
words, counts = {}, Counter()
for line in open(sys.argv[1], encoding='utf-8'):
    loc, _form, _tag, feat = line.rstrip('\n').split('\t')
    s, a, w, _seg = map(int, loc.split(':'))
    m = re.search(r'ROOT:([^|]+)', feat)
    if not m:
        continue
    key = f'{s}:{a}:{w}'
    root = m.group(1)
    counts[(key, root)] = 1          # one per word, even when a word has several segments
    if s in SURAHS:
        words.setdefault(key, root)

per_root = Counter(root for (_k, root) in counts)
needed = set(words.values())
out = {'source': 'Quranic Arabic Corpus v0.4 (c) Kais Dukes, GPL v3; github.com/mustafa0x/quran-morphology',
       'words': words, 'counts': {r: per_root[r] for r in sorted(needed)}}
json.dump(out, open('scripts/data/qac-salah.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f'{len(words)} words, {len(needed)} roots;', ', '.join(f'{r} {per_root[r]}' for r in ['رحم', 'حمد', 'علم', 'أله', 'ربب']))
