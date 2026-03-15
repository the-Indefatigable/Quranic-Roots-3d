#!/usr/bin/env python3
"""
Arabic Verb Conjugation Generator
Fills all '-' conjugation slots with morphologically derived Arabic forms.
Covers Forms I–X, all tenses (māḍī, muḍāri', amr, passive māḍī, passive muḍāri'),
for sound, hollow (waaw/yāʾ), defective (waaw/yāʾ), and doubled root types.

Usage: python3 generate_conjugations.py
       (reads and writes public/data/verbsData.json in-place)
"""

import json, re, sys
from copy import deepcopy

# ─── Diacritics ────────────────────────────────────────────────────────────────
F  = '\u064e'   # fatha   َ
K  = '\u0650'   # kasra   ِ
D  = '\u064f'   # damma   ُ
S  = '\u0652'   # sukun   ْ
SH = '\u0651'   # shadda  ّ
ALL_DIAC = frozenset([F, K, D, S, SH, '\u064b', '\u064c', '\u064d', '\u0670', '\u0671'])

# ─── Arabic letters ─────────────────────────────────────────────────────────────
A   = 'ا'   # bare alef
AH  = 'أ'   # alef-hamza-above
AL  = 'إ'   # alef-hamza-below
AM  = 'آ'   # alef-madda
AW  = 'ٱ'   # alef-wasla
AMQ = 'ى'   # alef-maqsura (defective alef)
W   = 'و'   # waaw
Y   = 'ي'   # yaa
TA  = 'ت'
NA  = 'ن'
ALEFS = frozenset([A, AH, AL, AM, AW])

def strip(s):
    """Remove all diacritics from a string."""
    return ''.join(c for c in s if c not in ALL_DIAC)

def get_r123(letters):
    """Return bare consonants R1,R2,R3 (normalise alef forms)."""
    r = [strip(l) for l in letters[:3]]
    while len(r) < 3:
        r.append('')
    return r[0], r[1], r[2]

def classify(r1, r2, r3):
    """Return root type string."""
    if r2 in (W, Y):
        return 'hollow_w' if r2 == W else 'hollow_y'
    if r3 in (W, Y, AMQ):
        return 'defective_w' if r3 == W else 'defective_y'
    if r2 and r3 and r2 == r3:
        return 'doubled'
    if r1 == W:
        return 'initial_w'
    return 'sound'

# ─── Helpers to extract vowels from existing attested 3ms forms ─────────────────

def cv_pairs(text):
    """Parse Arabic text into list of (consonant, vowel) pairs."""
    chars = list(text)
    result = []
    i = 0
    while i < len(chars):
        c = chars[i]
        if c in ALL_DIAC:
            i += 1
            continue
        # c is a consonant/letter
        v = ''
        if i + 1 < len(chars) and chars[i+1] in ALL_DIAC:
            v = chars[i+1]
            i += 1
        # handle shadda (may be followed by another diacritic)
        if v == SH and i + 1 < len(chars) and chars[i+1] in ALL_DIAC:
            v = SH + chars[i+1]
            i += 1
        result.append((c, v))
        i += 1
    return result

def madi_v2_from_3ms(form3ms, root_type):
    """Extract the R2 vowel from the 3ms māḍī form for Form I sound verbs.
       Returns F, K, or D."""
    if not form3ms or form3ms == '-':
        return F
    pairs = cv_pairs(form3ms)
    # Form I sound 3ms = (R1,F)(R2,v2)(R3,F)  →  index 1 is R2
    if len(pairs) >= 2 and root_type == 'sound':
        v = pairs[1][1]
        return v if v in (F, K, D) else F
    return F

def mudari_vowel_from_3ms(form_mudari, form, root_type):
    """Extract the characteristic mudari vowel for Form I sound verbs (the vowel on R2).
       Returns F, K, or D."""
    if not form_mudari or form_mudari == '-' or form != 'I':
        return D
    pairs = cv_pairs(form_mudari)
    # يَ (prefix, index 0), R1+S (index 1), R2+v (index 2), R3 (index 3)
    if len(pairs) >= 3 and root_type == 'sound':
        v = pairs[2][1]
        if v == S:
            v = pairs[2][1]  # R2 has sukun; mudari vowel is actually on the next
        return v if v in (F, K, D) else D
    return D

# ─── Suffix / prefix tables ─────────────────────────────────────────────────────

# Madi suffix table: (R3 diacritic to add, suffix string)
MADI_SFX = {
    '3ms': (F,  ''),
    '3fs': (F,  'تْ'),
    '3md': (F,  'ا'),
    '3fd': (F,  'تَا'),
    '3mp': (D,  'وا'),
    '3fp': (S,  'نَ'),
    '2ms': (S,  'تَ'),
    '2fs': (S,  'تِ'),
    '2md': (S,  'تُمَا'),
    '2fd': (S,  'تُمَا'),
    '2mp': (S,  'تُمْ'),
    '2fp': (S,  'تُنَّ'),
    '1s':  (S,  'تُ'),
    '1p':  (S,  'نَا'),
}

# Mudari prefix/suffix table: (prefix str, R3 diacritic, suffix string)
MUDARI_SFX = {
    '3ms': ('يَ', D,  ''),
    '3fs': ('تَ', D,  ''),
    '3md': ('يَ', F,  'انِ'),
    '3fd': ('تَ', F,  'انِ'),
    '3mp': ('يَ', D,  'ونَ'),
    '3fp': ('يَ', S,  'نَ'),
    '2ms': ('تَ', D,  ''),
    '2fs': ('تَ', K,  'ينَ'),
    '2md': ('تَ', F,  'انِ'),
    '2fd': ('تَ', F,  'انِ'),
    '2mp': ('تَ', D,  'ونَ'),
    '2fp': ('تَ', S,  'نَ'),
    '1s':  ('أَ', D,  ''),
    '1p':  ('نَ', D,  ''),
}

# Mudari prefix with damma (for Forms II–X passive prefix)
MUDARI_SFX_U = {p: ('يُ' if pfx[0] in 'يت' else pfx[:1] + D + pfx[1:], r3v, sfx)
                for p, (pfx, r3v, sfx) in MUDARI_SFX.items()}
MUDARI_SFX_U = {
    '3ms': ('يُ', D,  ''),
    '3fs': ('تُ', D,  ''),
    '3md': ('يُ', F,  'انِ'),
    '3fd': ('تُ', F,  'انِ'),
    '3mp': ('يُ', D,  'ونَ'),
    '3fp': ('يُ', S,  'نَ'),
    '2ms': ('تُ', D,  ''),
    '2fs': ('تُ', K,  'ينَ'),
    '2md': ('تُ', F,  'انِ'),
    '2fd': ('تُ', F,  'انِ'),
    '2mp': ('تُ', D,  'ونَ'),
    '2fp': ('تُ', S,  'نَ'),
    '1s':  ('أُ', D,  ''),
    '1p':  ('نُ', D,  ''),
}

PERSONS_FULL = ['3ms','3fs','3md','3fd','3mp','3fp','2ms','2fs','2md','2fd','2mp','2fp','1s','1p']
PERSONS_AMR  = ['2ms','2fs','2md','2fd','2mp','2fp']

# ─── Generic madi builder ────────────────────────────────────────────────────────

def apply_madi_sfx(stem_open, stem_closed):
    """
    stem_open: the R3 consonant (no diacritic yet) and everything before it,
               for forms that use vowel-continuing suffixes (3ms, 3fs, 3md, 3fd, 3mp).
    stem_closed: stem with R3 having sukun already applied, used for other persons.
    """
    out = {}
    for p in PERSONS_FULL:
        r3diac, sfx = MADI_SFX[p]
        if r3diac == S:
            out[p] = stem_closed + sfx
        else:
            out[p] = stem_open + r3diac + sfx
    return out

def apply_mudari_sfx(inner_stem, tbl=None):
    """inner_stem: the stem after the prefix (e.g., كْتُب for يَكْتُبُ)."""
    if tbl is None:
        tbl = MUDARI_SFX
    out = {}
    for p in PERSONS_FULL:
        pfx, r3diac, sfx = tbl[p]
        out[p] = pfx + inner_stem + r3diac + sfx
    return out

def apply_amr_sfx(amr_base):
    """amr_base: stem that ends with bare R3 (no diacritic yet)."""
    out = {}
    sfx_map = {
        '2ms': (S,  ''),
        '2fs': (K,  'ي'),
        '2md': (F,  'ا'),
        '2fd': (F,  'ا'),
        '2mp': (D,  'وا'),
        '2fp': (S,  'نَ'),
    }
    for p in PERSONS_AMR:
        r3diac, sfx = sfx_map[p]
        out[p] = amr_base + r3diac + sfx
    return out

# ─── Form I builders ─────────────────────────────────────────────────────────────

def form1_madi_sound(r1, r2, r3, v2):
    stem_base = r1 + F + r2 + v2 + r3
    stem_cl   = stem_base + S
    return apply_madi_sfx(stem_base, stem_cl)

def form1_madi_hollow(r1, r2, r3, rtype):
    """Hollow madi: long stem for 3ms/3fs/3md/3fd/3mp, short for rest."""
    long_base = r1 + F + A + r3      # قَال (bare R3, no diacritic yet)
    if rtype == 'hollow_w':
        short = r1 + D + r3 + S     # قُلْ
    else:
        short = r1 + K + r3 + S     # بِعْ
    out = {}
    for p in PERSONS_FULL:
        r3diac, sfx = MADI_SFX[p]
        if r3diac == S:
            out[p] = short + sfx
        else:
            out[p] = long_base + r3diac + sfx
    return out

def form1_madi_defective_y(r1, r2, r3):
    """Defective-yāʾ madi (رَمَى type)."""
    stem = r1 + F + r2 + F   # رَمَ (base, R3=ي becomes ا/ى)
    out = {
        '3ms': stem + AMQ,          # رَمَى
        '3fs': stem + Y + S + 'تْ', # wait... رَمَتْ actually — R3 drops!
        # Actually for defective madi:
        # 3ms: رَمَى (alef maqsura)
        # 3fs: رَمَتْ (R3=ي drops, just stem+تْ)
        # 3md: رَمَيَا
        # 3fd: رَمَتَا (R3 drops again)
        # 3mp: رَمَوا (special: R3=ي→و + وا)
        # 3fp: رَمَيْنَ (R3=ي explicit + sukun + نَ)
        # 2...: رَمَيْتَ etc (R3=ي explicit + sukun + suffix)
    }
    # Rebuild properly
    out = {
        '3ms': stem + AMQ,
        '3fs': stem + TA + S,       # رَمَتْ (R3 drops in 3fs)
        '3md': stem + Y + F + A,    # رَمَيَا
        '3fd': stem + TA + F + A,   # رَمَتَا
        '3mp': stem + W + A,        # رَمَوا (written as رَمَوا)
        '3fp': stem + Y + S + 'نَ', # رَمَيْنَ
        '2ms': stem + Y + S + 'تَ', # رَمَيْتَ
        '2fs': stem + Y + S + 'تِ',
        '2md': stem + Y + S + 'تُمَا',
        '2fd': stem + Y + S + 'تُمَا',
        '2mp': stem + Y + S + 'تُمْ',
        '2fp': stem + Y + S + 'تُنَّ',
        '1s':  stem + Y + S + 'تُ',
        '1p':  stem + Y + S + 'نَا',
    }
    return out

def form1_madi_defective_w(r1, r2, r3):
    """Defective-waaw madi (دَعَا type)."""
    stem = r1 + F + r2 + F    # دَعَ
    return {
        '3ms': stem + A,              # دَعَا
        '3fs': stem + TA + S,         # دَعَتْ
        '3md': stem + W + F + A,      # دَعَوَا
        '3fd': stem + TA + F + A,     # دَعَتَا
        '3mp': stem + W + A,          # دَعَوا
        '3fp': stem + W + S + 'نَ',   # دَعَوْنَ
        '2ms': stem + W + S + 'تَ',   # دَعَوْتَ
        '2fs': stem + W + S + 'تِ',
        '2md': stem + W + S + 'تُمَا',
        '2fd': stem + W + S + 'تُمَا',
        '2mp': stem + W + S + 'تُمْ',
        '2fp': stem + W + S + 'تُنَّ',
        '1s':  stem + W + S + 'تُ',
        '1p':  stem + W + S + 'نَا',
    }

def form1_madi_doubled(r1, r2, r3, v2):
    """Doubled madi (مَدَّ type, R2=R3)."""
    # long form: R1F + R2 with shadda + vowel (for vowel-continuing)
    # short form (sep): R1F + R2F + R3S (for consonant suffixes)
    long_base = r1 + F + r2 + SH   # مَدّ (base, diacritic added per suffix)
    sep_base  = r1 + F + r2 + v2 + r3 + S  # مَدَدْ

    out = {}
    for p in PERSONS_FULL:
        r3diac, sfx = MADI_SFX[p]
        if r3diac == S:
            # consonant suffix → use separated form
            out[p] = sep_base + sfx
        else:
            # vowel-continuing → use geminated form
            out[p] = long_base + r3diac + sfx
    return out

# ─── Form I Mudari builders ───────────────────────────────────────────────────────

def form1_mudari_sound(r1, r2, r3, vm):
    """vm = mudari vowel on R2."""
    inner = r1 + S + r2 + vm + r3
    return apply_mudari_sfx(inner)

def form1_mudari_hollow(r1, r2, r3, rtype):
    """Hollow mudari. Long vowel maintained except 3fp/2fp."""
    if rtype == 'hollow_w':
        long_inner = r1 + D + W + r3   # قُو + ل (no diacritic on R3 yet)
    else:
        long_inner = r1 + K + Y + r3   # بِي + ع
    short_r3 = r1 + S + r3            # for 3fp/2fp where long vowel drops

    out = {}
    for p in PERSONS_FULL:
        pfx, r3diac, sfx = MUDARI_SFX[p]
        if p in ('3fp', '2fp'):
            out[p] = pfx + short_r3 + S + sfx
        else:
            out[p] = pfx + long_inner + r3diac + sfx
    return out

def form1_mudari_defective_y(r1, r2, r3):
    """Defective-yāʾ mudari (يَرْمِي type)."""
    # Inner stem before R3 (which becomes ي or drops):
    stem = r1 + S + r2 + K   # كْمِ in يَرْمِي
    out = {}
    sfx_map = {
        '3ms': Y,
        '3fs': Y,
        '3md': Y + F + 'انِ',
        '3fd': Y + F + 'انِ',
        '3mp': W + 'نَ',     # يَرْمُونَ — ي→و before ون? Actually: يَرْمُونَ uses damma
        '3fp': Y + 'نَ',     # يَرْمِينَ
        '2ms': Y,
        '2fs': Y + 'نَ',
        '2md': Y + F + 'انِ',
        '2fd': Y + F + 'انِ',
        '2mp': W + 'نَ',
        '2fp': Y + 'نَ',
        '1s':  Y,
        '1p':  Y,
    }
    # For 3mp/2mp: يَرْمُونَ not يَرْمِيونَ → use damma on R2
    stem_u = r1 + S + r2 + D
    for p in PERSONS_FULL:
        pfx = MUDARI_SFX[p][0]
        end = sfx_map[p]
        if p in ('3mp', '2mp'):
            out[p] = pfx + stem_u + end
        else:
            out[p] = pfx + stem + end
    return out

def form1_mudari_defective_w(r1, r2, r3):
    """Defective-waaw mudari (يَدْعُو type)."""
    stem   = r1 + S + r2 + D    # دْعُ
    sfx_map = {
        '3ms': W,
        '3fs': W,
        '3md': W + F + 'انِ',
        '3fd': W + F + 'انِ',
        '3mp': W + 'نَ',
        '3fp': W + 'نَ',
        '2ms': W,
        '2fs': W + 'نَ',
        '2md': W + F + 'انِ',
        '2fd': W + F + 'انِ',
        '2mp': W + 'نَ',
        '2fp': W + 'نَ',
        '1s':  W,
        '1p':  W,
    }
    out = {}
    for p in PERSONS_FULL:
        pfx = MUDARI_SFX[p][0]
        out[p] = pfx + stem + sfx_map[p]
    return out

def form1_mudari_doubled(r1, r2, r3, vm):
    """Doubled mudari (يَمُدُّ type)."""
    inner = r1 + S + r2 + vm + r2 + SH
    return apply_mudari_sfx(inner)

# ─── Form I AMR ───────────────────────────────────────────────────────────────────

def form1_amr_sound(r1, r2, r3, vm):
    """Sound Form I imperative."""
    # Alef wasla vowel: damma if vm==D, kasra otherwise
    aw_v = D if vm == D else K
    base = AW + aw_v + r1 + S + r2 + vm + r3
    return apply_amr_sfx(base)

def form1_amr_hollow(r1, r2, r3, rtype):
    """Hollow Form I imperative."""
    if rtype == 'hollow_w':
        long_base = r1 + D + W + r3   # قُو + ل
        short_base = r1 + D + r3       # قُل (for 2ms/2fp)
    else:
        long_base = r1 + K + Y + r3
        short_base = r1 + K + r3
    out = {
        '2ms': short_base + S,
        '2fs': long_base + K + Y,
        '2md': long_base + F + A,
        '2fd': long_base + F + A,
        '2mp': long_base + D + W + A,
        '2fp': short_base + S + 'نَ',
    }
    return out

def form1_amr_defective_y(r1, r2, r3):
    """Defective-yāʾ Form I imperative (اِرْمِ type)."""
    base = AW + K + r1 + S + r2 + K   # اِرْمِ
    return {
        '2ms': base,                      # اِرْمِ (ends with kasra, no explicit ي)
        '2fs': base + Y,                  # اِرْمِي
        '2md': base + Y + F + A,          # اِرْمِيَا
        '2fd': base + Y + F + A,
        '2mp': base + W + A,              # اِرْمُوا (with damma)
        '2fp': base + Y + S + 'نَ',       # اِرْمِينَ
    }

def form1_amr_defective_w(r1, r2, r3):
    """Defective-waaw Form I imperative (اُدْعُ type)."""
    base = AW + D + r1 + S + r2 + D   # اُدْعُ
    return {
        '2ms': base,
        '2fs': base + W + K + Y,
        '2md': base + W + F + A,
        '2fd': base + W + F + A,
        '2mp': base + W + A,
        '2fp': base + W + S + 'نَ',
    }

def form1_amr_doubled(r1, r2, r3, vm):
    """Doubled Form I imperative (مُدَّ type)."""
    aw_v = D if vm == D else K
    base_long  = AW + aw_v + r1 + S + r2 + SH  # اُمُدّ
    base_short = AW + aw_v + r1 + S + r2 + vm + r3  # separated form for 2fp
    return {
        '2ms': base_long + S,
        '2fs': base_long + K + Y,
        '2md': base_long + F + A,
        '2fd': base_long + F + A,
        '2mp': base_long + D + W + A,
        '2fp': base_short + S + 'نَ',
    }

# ─── Form I Passive ───────────────────────────────────────────────────────────────

def form1_passive_madi_sound(r1, r2, r3):
    """Sound Form I passive madi (فُعِلَ)."""
    stem_base = r1 + D + r2 + K + r3
    stem_cl   = stem_base + S
    return apply_madi_sfx(stem_base, stem_cl)

def form1_passive_madi_hollow(r1, r2, r3, rtype):
    """Hollow Form I passive madi (قِيلَ/بِيعَ type — both use ī)."""
    # قِيلَ: R1K + Y + R3F (regardless of waaw or yaa — always ī in passive madi)
    long_base = r1 + K + Y + r3
    short = r1 + K + r3 + S
    out = {}
    for p in PERSONS_FULL:
        r3diac, sfx = MADI_SFX[p]
        if r3diac == S:
            out[p] = short + sfx
        else:
            out[p] = long_base + r3diac + sfx
    return out

def form1_passive_madi_defective_y(r1, r2, r3):
    """Defective-yāʾ passive madi (رُمِيَ type)."""
    stem = r1 + D + r2 + K
    return {
        '3ms': stem + Y + F,
        '3fs': stem + Y + F + TA + S,
        '3md': stem + Y + F + A,
        '3fd': stem + Y + F + TA + F + A,
        '3mp': stem + W + A,
        '3fp': stem + Y + S + 'نَ',
        '2ms': stem + Y + S + 'تَ',
        '2fs': stem + Y + S + 'تِ',
        '2md': stem + Y + S + 'تُمَا',
        '2fd': stem + Y + S + 'تُمَا',
        '2mp': stem + Y + S + 'تُمْ',
        '2fp': stem + Y + S + 'تُنَّ',
        '1s':  stem + Y + S + 'تُ',
        '1p':  stem + Y + S + 'نَا',
    }

def form1_passive_madi_doubled(r1, r2, r3):
    """Doubled Form I passive madi (مُدَّ type: فُعِلَ with shadda)."""
    long_base = r1 + D + r2 + SH     # مُدّ
    sep_base  = r1 + D + r2 + K + r3 + S  # مُدِدْ
    out = {}
    for p in PERSONS_FULL:
        r3diac, sfx = MADI_SFX[p]
        if r3diac == S:
            out[p] = sep_base + sfx
        else:
            out[p] = long_base + r3diac + sfx
    return out

def form1_passive_mudari_sound(r1, r2, r3):
    """Sound Form I passive mudari (يُفْعَلُ)."""
    inner = r1 + S + r2 + F + r3
    return apply_mudari_sfx(inner, MUDARI_SFX_U)

def form1_passive_mudari_hollow(r1, r2, r3):
    """Hollow Form I passive mudari (يُقَالُ type — always ā regardless of hollow type)."""
    # يُقَالُ: يُ + R1S + ā(A) + R3D
    long_inner = r1 + S + A + r3
    short_r3   = r1 + S + r3
    out = {}
    for p in PERSONS_FULL:
        pfx, r3diac, sfx = MUDARI_SFX_U[p]
        if p in ('3fp', '2fp'):
            out[p] = pfx + short_r3 + S + sfx
        else:
            out[p] = pfx + long_inner + r3diac + sfx
    return out

def form1_passive_mudari_defective_y(r1, r2, r3):
    """Defective-yāʾ passive mudari (يُرْمَى type)."""
    stem = r1 + S + r2 + F
    sfx_map = {
        '3ms': AMQ, '3fs': AMQ, '3md': Y + F + 'انِ', '3fd': Y + F + 'انِ',
        '3mp': W + 'نَ', '3fp': Y + 'نَ', '2ms': AMQ, '2fs': Y + 'نَ',
        '2md': Y + F + 'انِ', '2fd': Y + F + 'انِ', '2mp': W + 'نَ', '2fp': Y + 'نَ',
        '1s': AMQ, '1p': AMQ,
    }
    stem_u = r1 + S + r2 + F
    out = {}
    for p in PERSONS_FULL:
        pfx = MUDARI_SFX_U[p][0]
        out[p] = pfx + stem_u + sfx_map[p]
    return out

def form1_passive_mudari_doubled(r1, r2, r3):
    """Doubled Form I passive mudari (يُمَدُّ type)."""
    inner = r1 + S + r2 + F + r2 + SH
    return apply_mudari_sfx(inner, MUDARI_SFX_U)

# ─── Derived Forms II–X ───────────────────────────────────────────────────────────
# For these forms, the prefix/infix structure is fixed regardless of root type
# (with minor exceptions for weak roots which we handle approximately).

def derived_madi(prefix, r1v, r2_spec, r3, root_type):
    """Generic derived-form madi builder.
    prefix: string prepended (e.g. '' for Form II, 'أَ' for Form IV)
    r1v: R1 with vowel string (e.g. r1+S for Form IV)
    r2_spec: R2 part with any infix/shadda (e.g. r2+SH+F for Form II)
    r3: bare R3 consonant
    """
    stem_base = prefix + r1v + r2_spec + r3
    stem_cl   = stem_base + S
    return apply_madi_sfx(stem_base, stem_cl)

def derived_mudari(prefix, r1v, r2_spec, r3, passive=False):
    """Generic derived-form mudari builder.
    prefix: e.g. 'يُ' for Form II passive, 'يَتَ' for Form V etc.
    The full 3ms form is: prefix + r1v + r2_spec + r3 + D
    """
    tbl = MUDARI_SFX_U if passive else MUDARI_SFX
    inner = r1v + r2_spec + r3
    out = {}
    for p in PERSONS_FULL:
        pfx, r3diac, sfx = tbl[p]
        # For derived forms, replace the يَ/تَ etc. prefix with the form-specific one
        # But we still vary person suffix (دَ/تَ etc.)
        if passive:
            person_pfx = pfx  # يُ/تُ/أُ/نُ
        else:
            person_pfx = pfx  # يَ/تَ/أَ/نَ
        # For forms V,VI,VII,VIII,X the prefix is multi-char (يَتَ, يَنْ etc.)
        # We need to use the form prefix + person marker only for 3ms/3fs/1s/1p
        # Actually: for Forms II–X mudari, the full prefix is:
        #   3ms: يُفَعِّلُ → يُ + inner; 3fs: تُفَعِّلُ → تُ + inner; etc.
        # So we just replace the يَ/تَ/أَ/نَ with the appropriate form prefix
        out[p] = prefix.replace('يَ', person_pfx[0] + (D if passive else F)).replace('يُ', person_pfx) \
                 + inner + r3diac + sfx
    return out

# Simpler approach for derived forms: build form-by-form

def build_form(form, r1, r2, r3, tense, root_type):
    """Main dispatcher for Forms II–X."""

    def madi_out(base_str):
        """Build full madi from base (3ms) string, treating it as a sound-like stem."""
        # We fake a 3-consonant sound structure from the full base
        # Split: base ends with r3, everything before is the "left side"
        left = base_str[:-len(r3)] if base_str.endswith(r3) else base_str
        stem_cl = base_str + S
        return apply_madi_sfx(base_str, stem_cl)

    def mudari_out(prefix, inner_stem, passive=False):
        tbl = MUDARI_SFX_U if passive else MUDARI_SFX
        PFX_MAP = {
            'يَ': {'يَ':'يَ','تَ':'تَ','أَ':'أَ','نَ':'نَ'},
            'يُ': {'يُ':'يُ','تُ':'تُ','أُ':'أُ','نُ':'نُ'},
        }
        base_pfx = 'يُ' if passive else 'يَ'
        # detect multi-char prefix (Forms V,VI,VII,VIII,X)
        # e.g. 'يَتَ', 'يَنْ', 'يَسْتَ'
        extra = prefix[len(base_pfx):] if prefix.startswith(base_pfx) else \
                prefix[len('يُ'):] if prefix.startswith('يُ') else ''
        out = {}
        for p in PERSONS_FULL:
            pfx0, r3diac, sfx = tbl[p]
            out[p] = pfx0 + extra + inner_stem + r3diac + sfx
        return out

    # ── Helper: handle weak R3 for derived forms ──
    def defective_madi(base_vowel_side, r3_root):
        """base_vowel_side: everything up to but not including R3 (includes R2 vowel)."""
        if root_type == 'defective_y':
            return {
                '3ms': base_vowel_side + AMQ,
                '3fs': base_vowel_side + TA + S,
                '3md': base_vowel_side + Y + F + A,
                '3fd': base_vowel_side + TA + F + A,
                '3mp': base_vowel_side + W + A,
                '3fp': base_vowel_side + Y + S + 'نَ',
                '2ms': base_vowel_side + Y + S + 'تَ',
                '2fs': base_vowel_side + Y + S + 'تِ',
                '2md': base_vowel_side + Y + S + 'تُمَا',
                '2fd': base_vowel_side + Y + S + 'تُمَا',
                '2mp': base_vowel_side + Y + S + 'تُمْ',
                '2fp': base_vowel_side + Y + S + 'تُنَّ',
                '1s':  base_vowel_side + Y + S + 'تُ',
                '1p':  base_vowel_side + Y + S + 'نَا',
            }
        else:  # defective_w
            return {
                '3ms': base_vowel_side + A,
                '3fs': base_vowel_side + TA + S,
                '3md': base_vowel_side + W + F + A,
                '3fd': base_vowel_side + TA + F + A,
                '3mp': base_vowel_side + W + A,
                '3fp': base_vowel_side + W + S + 'نَ',
                '2ms': base_vowel_side + W + S + 'تَ',
                '2fs': base_vowel_side + W + S + 'تِ',
                '2md': base_vowel_side + W + S + 'تُمَا',
                '2fd': base_vowel_side + W + S + 'تُمَا',
                '2mp': base_vowel_side + W + S + 'تُمْ',
                '2fp': base_vowel_side + W + S + 'تُنَّ',
                '1s':  base_vowel_side + W + S + 'تُ',
                '1p':  base_vowel_side + W + S + 'نَا',
            }

    def defective_mudari(prefix_str, stem_before_r3, r3_mudari_v, passive=False):
        """For defective mudari derived forms."""
        tbl = MUDARI_SFX_U if passive else MUDARI_SFX
        base_pfx = 'يُ' if passive else 'يَ'
        extra = prefix_str[len(base_pfx):] if prefix_str.startswith(base_pfx) else \
                prefix_str[len('يُ'):] if prefix_str.startswith('يُ') else ''
        if root_type == 'defective_y':
            sfx_map = {
                '3ms': Y, '3fs': Y, '3md': Y + F + 'انِ', '3fd': Y + F + 'انِ',
                '3mp': W + 'نَ', '3fp': Y + 'نَ', '2ms': Y, '2fs': Y + 'نَ',
                '2md': Y + F + 'انِ', '2fd': Y + F + 'انِ', '2mp': W + 'نَ', '2fp': Y + 'نَ',
                '1s': Y, '1p': Y,
            }
            stem_u = stem_before_r3.replace(r3_mudari_v + r3_mudari_v[-1:], r3_mudari_v[:-1] + D) \
                     if len(stem_before_r3) > 0 else stem_before_r3
        else:
            sfx_map = {
                '3ms': W, '3fs': W, '3md': W + F + 'انِ', '3fd': W + F + 'انِ',
                '3mp': W + 'نَ', '3fp': W + 'نَ', '2ms': W, '2fs': W + 'نَ',
                '2md': W + F + 'انِ', '2fd': W + F + 'انِ', '2mp': W + 'نَ', '2fp': W + 'نَ',
                '1s': W, '1p': W,
            }
        out = {}
        for p in PERSONS_FULL:
            pfx0 = tbl[p][0]
            out[p] = pfx0 + extra + stem_before_r3 + sfx_map[p]
        return out

    is_def = root_type in ('defective_y', 'defective_w')

    # ─────────────────────────────────────────
    if form == 'II':
        if tense == 'madi':
            side = r1 + F + r2 + SH + F
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = r1 + F + r2 + SH + K + r3
            return mudari_out('يَ', r1 + F + r2 + SH + K + r3)
        elif tense == 'amr':
            base = r1 + F + r2 + SH + K + r3
            return apply_amr_sfx(base)
        elif tense == 'passive_madi':
            side = r1 + D + r2 + SH + K
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'passive_mudari':
            inner = r1 + F + r2 + SH + F + r3
            return mudari_out('يَ', inner, passive=True)

    elif form == 'III':
        if tense == 'madi':
            side = r1 + F + A + r2 + F
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = r1 + F + A + r2 + K + r3
            return mudari_out('يَ', inner)
        elif tense == 'amr':
            base = r1 + F + A + r2 + K + r3
            return apply_amr_sfx(base)
        elif tense == 'passive_madi':
            side = r1 + D + W + r2 + K
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'passive_mudari':
            inner = r1 + F + A + r2 + F + r3
            return mudari_out('يَ', inner, passive=True)

    elif form == 'IV':
        if tense == 'madi':
            side = AH + F + r1 + S + r2 + F
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = r1 + S + r2 + K + r3
            return mudari_out('يَ', inner, passive=False)   # يُفْعِلُ → prefix يُ
        elif tense == 'amr':
            # أَفْعِلْ
            base = AH + F + r1 + S + r2 + K + r3
            return apply_amr_sfx(base)
        elif tense == 'passive_madi':
            side = AH + D + r1 + S + r2 + K
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'passive_mudari':
            inner = r1 + S + r2 + F + r3
            return mudari_out('يَ', inner, passive=True)   # يُفْعَلُ

    elif form == 'V':
        if tense == 'madi':
            side = 'تَ' + r1 + F + r2 + SH + F
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = 'تَ' + r1 + F + r2 + SH + F + r3
            return mudari_out('يَ', inner)
        elif tense == 'amr':
            base = 'تَ' + r1 + F + r2 + SH + F + r3
            return apply_amr_sfx(base)
        elif tense == 'passive_madi':
            side = 'تُ' + r1 + D + r2 + SH + K
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'passive_mudari':
            inner = 'تَ' + r1 + F + r2 + SH + F + r3
            return mudari_out('يَ', inner, passive=True)

    elif form == 'VI':
        if tense == 'madi':
            side = 'تَ' + r1 + F + A + r2 + F
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = 'تَ' + r1 + F + A + r2 + F + r3
            return mudari_out('يَ', inner)
        elif tense == 'amr':
            base = 'تَ' + r1 + F + A + r2 + F + r3
            return apply_amr_sfx(base)
        elif tense == 'passive_madi':
            side = 'تُ' + r1 + D + W + r2 + K
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'passive_mudari':
            inner = 'تَ' + r1 + F + A + r2 + F + r3
            return mudari_out('يَ', inner, passive=True)

    elif form == 'VII':
        pref = AW + K + NA + S   # اِنْ
        if tense == 'madi':
            side = pref + r1 + F + r2 + F
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = NA + S + r1 + F + r2 + K + r3
            return mudari_out('يَ', inner)
        elif tense == 'amr':
            base = pref + r1 + F + r2 + K + r3
            return apply_amr_sfx(base)
        elif tense == 'passive_madi':
            # Form VII has no passive typically, generate same as active
            side = pref + r1 + D + r2 + K
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'passive_mudari':
            inner = NA + S + r1 + F + r2 + F + r3
            return mudari_out('يَ', inner, passive=True)

    elif form == 'VIII':
        pref = AW + K    # اِ
        if tense == 'madi':
            side = pref + r1 + S + 'تَ' + r2 + F
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = r1 + S + 'تَ' + r2 + K + r3
            return mudari_out('يَ', inner)
        elif tense == 'amr':
            base = pref + r1 + S + 'تَ' + r2 + K + r3
            return apply_amr_sfx(base)
        elif tense == 'passive_madi':
            side = pref + r1 + S + 'تُ' + r2 + K
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'passive_mudari':
            inner = r1 + S + 'تَ' + r2 + F + r3
            return mudari_out('يَ', inner, passive=True)

    elif form == 'IX':
        if tense == 'madi':
            side = AW + K + r1 + S + r2 + F + r3
            stem_base = side + SH
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = r1 + S + r2 + F + r3 + SH + r3
            return mudari_out('يَ', inner)
        elif tense == 'amr':
            base = AW + K + r1 + S + r2 + F + r3 + SH + r3
            return apply_amr_sfx(base)

    elif form == 'X':
        pref = AW + K + 'سْتَ'   # اِسْتَ
        if tense == 'madi':
            side = pref + r1 + S + r2 + F
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'mudari':
            inner = 'سْتَ' + r1 + S + r2 + K + r3
            return mudari_out('يَ', inner)
        elif tense == 'amr':
            base = pref + r1 + S + r2 + K + r3
            return apply_amr_sfx(base)
        elif tense == 'passive_madi':
            side = pref + r1 + S + r2 + K
            if is_def:
                return defective_madi(side, r3)
            stem_base = side + r3
            return apply_madi_sfx(stem_base, stem_base + S)
        elif tense == 'passive_mudari':
            inner = 'سْتَ' + r1 + S + r2 + F + r3
            return mudari_out('يَ', inner, passive=True)

    return None

# ─── Form IV mudari fix (it uses يُ prefix, not يَ) ─────────────────────────────

def _form4_mudari_out(inner, passive=False):
    """Form IV mudari always uses يُ/تُ/أُ/نُ prefix."""
    tbl = MUDARI_SFX_U
    out = {}
    for p in PERSONS_FULL:
        pfx, r3diac, sfx = tbl[p]
        out[p] = pfx + inner + r3diac + sfx
    return out

# ─── Dispatcher ──────────────────────────────────────────────────────────────────

def generate_paradigm(form, tense, letters):
    """
    Main entry point. Returns a dict { person: arabic_form } for all persons.
    """
    r1, r2, r3 = get_r123(letters)
    if not r1 or not r2 or not r3:
        return None

    rtype = classify(r1, r2, r3)

    if form == 'I':
        # Get vowels from the existing store — but here we call this function
        # BEFORE we have the existing forms, so we pass them in separately.
        # This function is called with a v2 and vm parameter injected via closure.
        # We'll handle this in the caller.
        return None  # handled separately in caller

    # For Forms II–X, dispatch to build_form
    result = build_form(form, r1, r2, r3, tense, rtype)

    # Fix Form IV mudari to use proper يُ prefix
    if form == 'IV' and tense in ('mudari', 'passive_mudari'):
        passive = tense == 'passive_mudari'
        if tense == 'mudari':
            inner = r1 + S + r2 + K + r3
        else:
            inner = r1 + S + r2 + F + r3
        result = _form4_mudari_out(inner, passive)

    return result

def generate_form1(tense, letters, form3ms_madi, form3ms_mudari):
    """Generate Form I paradigm using existing 3ms forms as anchors."""
    r1, r2, r3 = get_r123(letters)
    if not r1 or not r2 or not r3:
        return None
    rtype = classify(r1, r2, r3)

    # Determine vowels
    v2 = madi_v2_from_3ms(form3ms_madi, rtype)
    vm = mudari_vowel_from_3ms(form3ms_mudari, 'I', rtype)

    if tense == 'madi':
        if rtype == 'sound' or rtype == 'initial_w':
            return form1_madi_sound(r1, r2, r3, v2)
        elif rtype in ('hollow_w', 'hollow_y'):
            return form1_madi_hollow(r1, r2, r3, rtype)
        elif rtype == 'defective_y':
            return form1_madi_defective_y(r1, r2, r3)
        elif rtype == 'defective_w':
            return form1_madi_defective_w(r1, r2, r3)
        elif rtype == 'doubled':
            return form1_madi_doubled(r1, r2, r3, v2)

    elif tense == 'mudari':
        if rtype == 'sound' or rtype == 'initial_w':
            return form1_mudari_sound(r1, r2, r3, vm)
        elif rtype in ('hollow_w', 'hollow_y'):
            return form1_mudari_hollow(r1, r2, r3, rtype)
        elif rtype == 'defective_y':
            return form1_mudari_defective_y(r1, r2, r3)
        elif rtype == 'defective_w':
            return form1_mudari_defective_w(r1, r2, r3)
        elif rtype == 'doubled':
            return form1_mudari_doubled(r1, r2, r3, vm)

    elif tense == 'amr':
        if rtype == 'sound' or rtype == 'initial_w':
            return form1_amr_sound(r1, r2, r3, vm)
        elif rtype in ('hollow_w', 'hollow_y'):
            return form1_amr_hollow(r1, r2, r3, rtype)
        elif rtype == 'defective_y':
            return form1_amr_defective_y(r1, r2, r3)
        elif rtype == 'defective_w':
            return form1_amr_defective_w(r1, r2, r3)
        elif rtype == 'doubled':
            return form1_amr_doubled(r1, r2, r3, vm)

    elif tense == 'passive_madi':
        if rtype == 'sound' or rtype == 'initial_w':
            return form1_passive_madi_sound(r1, r2, r3)
        elif rtype in ('hollow_w', 'hollow_y'):
            return form1_passive_madi_hollow(r1, r2, r3, rtype)
        elif rtype == 'defective_y':
            return form1_passive_madi_defective_y(r1, r2, r3)
        elif rtype == 'defective_w':
            return form1_passive_madi_defective_y(r1, r2, r3)  # approx
        elif rtype == 'doubled':
            return form1_passive_madi_doubled(r1, r2, r3)

    elif tense == 'passive_mudari':
        if rtype == 'sound' or rtype == 'initial_w':
            return form1_passive_mudari_sound(r1, r2, r3)
        elif rtype in ('hollow_w', 'hollow_y'):
            return form1_passive_mudari_hollow(r1, r2, r3)
        elif rtype == 'defective_y':
            return form1_passive_mudari_defective_y(r1, r2, r3)
        elif rtype == 'defective_w':
            return form1_passive_mudari_defective_y(r1, r2, r3)  # approx
        elif rtype == 'doubled':
            return form1_passive_mudari_doubled(r1, r2, r3)

    return None

# ─── English labels ───────────────────────────────────────────────────────────────
ENGLISH_LABELS = {
    '3ms': '3rd masc. sg',
    '3fs': '3rd fem. sg',
    '3md': '3rd masc. dual',
    '3fd': '3rd fem. dual',
    '3mp': '3rd masc. pl',
    '3fp': '3rd fem. pl',
    '2ms': '2nd masc. sg',
    '2fs': '2nd fem. sg',
    '2md': '2nd masc. dual',
    '2fd': '2nd fem. dual',
    '2mp': '2nd masc. pl',
    '2fp': '2nd fem. pl',
    '1s':  '1st singular',
    '1p':  '1st plural',
}

# ─── Main fill logic ──────────────────────────────────────────────────────────────

def fill_tense(bab_form, tense_obj, letters):
    """Fill missing ('-') conjugations in a tense object. Returns modified tense."""
    tense_type = tense_obj.get('type', '')
    existing = {c['person']: c for c in tense_obj.get('conjugation', [])}

    # Get the 3ms anchors from the tense or default to '-'
    ms3_madi_form   = existing.get('3ms', {}).get('arabic', '-') if tense_type == 'madi' else '-'
    ms3_mudari_form = existing.get('3ms', {}).get('arabic', '-') if tense_type == 'mudari' else '-'

    # Generate full paradigm
    if bab_form == 'I':
        # We need both madi and mudari 3ms from the same bab — stored at caller level
        paradigm = None  # will be set below
    else:
        paradigm = generate_paradigm(bab_form, tense_type, letters)

    return paradigm, existing

def process_root(root):
    """Process all babs and tenses for a root, filling in missing forms."""
    letters = root.get('rootLetters', [])

    for bab in root.get('babs', []):
        bab_form = bab.get('form', 'I')

        # Collect 3ms madi and mudari for Form I from this bab
        form1_3ms = {'madi': '-', 'mudari': '-'}
        if bab_form == 'I':
            for t in bab.get('tenses', []):
                tt = t.get('type', '')
                if tt in ('madi', 'mudari'):
                    for c in t.get('conjugation', []):
                        if c['person'] == '3ms' and c['arabic'] != '-':
                            form1_3ms[tt] = c['arabic']

        for tense in bab.get('tenses', []):
            tense_type = tense.get('type', '')
            existing = {c['person']: c['arabic'] for c in tense.get('conjugation', [])}

            # Generate the full paradigm
            if bab_form == 'I':
                paradigm = generate_form1(
                    tense_type, letters,
                    form1_3ms.get('madi', '-'),
                    form1_3ms.get('mudari', '-')
                )
            else:
                paradigm = generate_paradigm(bab_form, tense_type, letters)

            if paradigm is None:
                continue

            # Determine which persons apply for this tense
            persons = PERSONS_AMR if tense_type == 'amr' else PERSONS_FULL

            # Build new conjugation list: keep attested, fill '-'
            new_conj = []
            for person in persons:
                existing_entry = next((c for c in tense.get('conjugation', []) if c['person'] == person), None)
                if existing_entry and existing_entry.get('arabic', '-') != '-':
                    new_conj.append(existing_entry)
                else:
                    new_form = paradigm.get(person, '-')
                    new_conj.append({
                        'person': person,
                        'arabic': new_form if new_form else '-',
                        'transliteration': '',
                        'english': ENGLISH_LABELS.get(person, person),
                    })

            tense['conjugation'] = new_conj

    return root

# ─── Entry point ──────────────────────────────────────────────────────────────────

def main():
    input_path = 'public/data/verbsData.json'
    print(f'Loading {input_path}...')
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    roots = data.get('roots', [])
    print(f'Processing {len(roots)} roots...')

    for i, root in enumerate(roots):
        process_root(root)
        if (i + 1) % 100 == 0:
            print(f'  {i + 1}/{len(roots)}')

    # Count filled slots
    missing_after = sum(
        1 for r in roots
        for b in r['babs']
        for t in b['tenses']
        for c in t['conjugation']
        if c['arabic'] == '-'
    )
    total = sum(
        len(t['conjugation'])
        for r in roots for b in r['babs'] for t in b['tenses']
    )
    print(f'Writing {input_path}...')
    with open(input_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    print(f'Done. Remaining dashes: {missing_after}/{total} '
          f'({missing_after/total*100:.1f}%)')

if __name__ == '__main__':
    main()
