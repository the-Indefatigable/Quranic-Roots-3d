#!/usr/bin/env python3
"""
Extract all nominal forms from the QAC morphology file.
Produces nounsData.json with unique lemmas grouped by root,
each tagged with type (noun/active_participle/passive_participle/masdar/adjective).
Also captures word positions for meaning lookups.
"""

import json, re, sys
from collections import defaultdict

QAC_FILE = 'quranic-corpus-morphology-0.4.txt'

# ── Buckwalter → Arabic ────────────────────────────────────────────────────────
BW_CONSONANTS = {
    "'": 'ء', '>': 'أ', '<': 'إ', '|': 'آ', '&': 'ؤ', '}': 'ئ',
    'A': 'ا', 'b': 'ب', 't': 'ت', 'v': 'ث', 'j': 'ج', 'H': 'ح',
    'x': 'خ', 'd': 'د', '*': 'ذ', 'r': 'ر', 'z': 'ز', 's': 'س',
    '$': 'ش', 'S': 'ص', 'D': 'ض', 'T': 'ط', 'Z': 'ظ', 'E': 'ع',
    'g': 'غ', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل', 'm': 'م',
    'n': 'ن', 'h': 'ه', 'w': 'و', 'y': 'ي', '{': 'ا', 'p': 'ة',
    'Y': 'ى', 'W': 'ء',
}
BW_DIACRITICS = {
    'a': '\u064e', 'i': '\u0650', 'u': '\u064f', '~': '\u0651',
    'o': '\u0652', 'F': '\u064b', 'N': '\u064c', 'K': '\u064d',
    '`': '\u0670', '^': '\u0653', '_': '', '#': '',
}

def bw_to_ar(bw, with_diacritics=True):
    result = ''
    for c in bw:
        if c in BW_CONSONANTS:
            result += BW_CONSONANTS[c]
        elif with_diacritics and c in BW_DIACRITICS:
            result += BW_DIACRITICS[c]
    return result

def normalize_root(ar):
    return (ar.replace('أ','ا').replace('إ','ا').replace('آ','ا')
              .replace('ء','ا').replace('ؤ','و').replace('ئ','ي')
              .replace('ى','ي').replace('ة','ه'))

def strip_diacritics(s):
    diacritics = '\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652\u0670\u0653'
    return ''.join(c for c in s if c not in diacritics)

# ── POS type mapping ───────────────────────────────────────────────────────────
def get_type(features):
    if 'POS:N|ACT|PCPL' in features:
        baab = re.search(r'\(([IVX]+)\)', features)
        return ('active_participle', 'اسم فاعل', baab.group(1) if baab else None)
    if 'POS:N|PASS|PCPL' in features or 'POS:ADJ|PASS|PCPL' in features:
        baab = re.search(r'\(([IVX]+)\)', features)
        return ('passive_participle', 'اسم مفعول', baab.group(1) if baab else None)
    if 'POS:N|VN' in features:
        baab = re.search(r'\(([IVX]+)\)', features)
        return ('masdar', 'مصدر', baab.group(1) if baab else None)
    if 'POS:ADJ' in features:
        return ('adjective', 'صفة', None)
    if 'POS:PN' in features:
        return ('proper_noun', 'اسم علم', None)
    if 'POS:N' in features:
        return ('noun', 'اسم', None)
    return None

SKIP_TAGS = {'CONJ','F','COND','SUB','T','VOC','REM','INC','COM','AMD','ANS',
             'AVR','PRO','DEM','REL','INL','P','DET','INTG','EXL','INT','NEG',
             'CERT','FUT','EXH','RES','EXP','PREV','IMPN','SUR','V','PRON',
             'LOC','TIME','DUR','RSLT','CAUS','CIRC'}

# ── Parse QAC ─────────────────────────────────────────────────────────────────
print("Parsing QAC...", file=sys.stderr)

# key → entry dict
lemmas = {}

with open(QAC_FILE, encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('LOCATION'):
            continue
        parts = line.split('\t')
        if len(parts) < 4:
            continue

        location, form, tag, features = parts

        if tag in SKIP_TAGS:
            continue
        if not any(p in features for p in ['POS:N','POS:ADJ','POS:PN']):
            continue

        root_m = re.search(r'ROOT:([A-Za-z\*\$\{\}\'\>\<&_#]+)', features)
        if not root_m:
            continue

        lem_m = re.search(r'LEM:([^|]+)', features)
        if not lem_m:
            continue

        # Location: (surah:verse:word:segment)
        loc_m = re.match(r'\((\d+):(\d+):(\d+):', location)
        if not loc_m:
            continue
        surah = int(loc_m.group(1))
        verse = int(loc_m.group(2))
        word_pos = int(loc_m.group(3))

        ar_root = normalize_root(bw_to_ar(root_m.group(1), with_diacritics=False))
        if len(ar_root) < 2 or len(ar_root) > 4:
            continue

        bw_lem = lem_m.group(1)
        lemma_vocalized = bw_to_ar(bw_lem, with_diacritics=True)
        lemma_clean = strip_diacritics(lemma_vocalized)

        type_info = get_type(features)
        if not type_info:
            continue
        type_en, type_ar, baab = type_info

        key = f"{lemma_clean}|{ar_root}"

        if key not in lemmas:
            lemmas[key] = {
                'lemma': lemma_vocalized,
                'lemmaClean': lemma_clean,
                'root': ar_root,
                'type': type_en,
                'typeAr': type_ar,
                'baab': baab,
                'meaning': '',
                # store first occurrence with word position for API lookup
                'lookupRef': f"{surah}:{verse}:{word_pos}",
                'refs': set(),
            }

        lemmas[key]['refs'].add(f"{surah}:{verse}")

print(f"Found {len(lemmas)} unique nominal lemmas.", file=sys.stderr)

# ── Build output ──────────────────────────────────────────────────────────────
def sort_ref(r):
    s, v = r.split(':')
    return (int(s), int(v))

noun_list = []
for key, entry in sorted(lemmas.items()):
    noun_list.append({
        'id': entry['lemmaClean'],
        'lemma': entry['lemma'],
        'lemmaClean': entry['lemmaClean'],
        'root': entry['root'],
        'type': entry['type'],
        'typeAr': entry['typeAr'],
        'baab': entry['baab'],
        'meaning': '',
        'lookupRef': entry['lookupRef'],
        'references': sorted(entry['refs'], key=sort_ref),
    })

noun_list.sort(key=lambda x: (x['root'], x['lemmaClean']))

output = {'nouns': noun_list}

with open('public/data/nounsData.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("Written to public/data/nounsData.json", file=sys.stderr)

from collections import Counter
type_counts = Counter(n['type'] for n in noun_list)
print("\nBreakdown by type:", file=sys.stderr)
for t, count in type_counts.most_common():
    print(f"  {t}: {count}", file=sys.stderr)
