#!/usr/bin/env python3
"""
fix_conjugations.py

Regenerates Arabic verb conjugation forms in verbsData.json using
classical Arabic morphological rules.  Only the `arabic` field in
each ConjugationForm entry is replaced; all other fields (occurrences,
references, meanings, colours, prepositions …) are left intact.

Usage (from repo root):
    python3 data/fix_conjugations.py
"""

import json, os, sys, re

# ── Diacritics ───────────────────────────────────────────────────────────────
FA  = '\u064e'   # fatha   َ
DA  = '\u064f'   # damma   ُ
KA  = '\u0650'   # kasra   ِ
SK  = '\u0652'   # sukun   ْ
SH  = '\u0651'   # shadda  ّ
DIAC = {FA, DA, KA, SK, SH,
        '\u064b','\u064c','\u064d',
        '\u0653','\u0654','\u0655'}

# ── Letters ───────────────────────────────────────────────────────────────────
ALIF   = '\u0627'   # ا
ALIF_A = '\u0623'   # أ
ALIF_B = '\u0625'   # إ
ALIF_M = '\u0622'   # آ
HAMZA  = '\u0621'   # ء
HMZ_W  = '\u0624'   # ؤ
HMZ_Y  = '\u0626'   # ئ
WAW    = '\u0648'   # و
YA     = '\u064a'   # ي
AMS    = '\u0649'   # ى  (alif maqsura)
TA     = '\u062a'   # ت
NUN    = '\u0646'   # ن
MIM    = '\u0645'   # م
SIN    = '\u0633'   # س

WEAK   = {WAW, YA, AMS, ALIF}
HAMZAS = {HAMZA, ALIF_A, ALIF_B, ALIF_M, HMZ_W, HMZ_Y}

# ── Person tables ─────────────────────────────────────────────────────────────
PERSON_ORDER = ['3ms','3fs','3md','3fd','3mp','3fp',
                '2ms','2fs','2d','2mp','2fp','1s','1p']

PERSON_LABELS = {
    '1s':'1st singular', '1p':'1st plural',
    '2ms':'2nd masc. sg', '2fs':'2nd fem. sg', '2d':'2nd dual',
    '2mp':'2nd masc. pl', '2fp':'2nd fem. pl',
    '3ms':'3rd masc. sg', '3fs':'3rd fem. sg',
    '3md':'3rd masc. dual', '3fd':'3rd fem. dual',
    '3mp':'3rd masc. pl', '3fp':'3rd fem. pl',
}

# Mudari prefix letters (before the fatha/damma vowel)
_PRE = {
    '3ms':YA, '3fs':TA, '3md':YA, '3fd':TA, '3mp':YA, '3fp':YA,
    '2ms':TA, '2fs':TA, '2d':TA, '2mp':TA, '2fp':TA,
    '1s':ALIF_A, '1p':NUN,
}

def strip_diac(s):
    return ''.join(c for c in s if c not in DIAC)

# ── Verb-type classifier ──────────────────────────────────────────────────────
def classify(root_letters):
    f, e, l = [strip_diac(x) for x in root_letters]
    if e == l and e not in WEAK and e not in HAMZAS:
        return 'mudhaaf'
    if e in (WAW, ALIF):
        return 'ajwaf_waw'
    if e == YA:
        return 'ajwaf_ya'
    if l in (WAW, ALIF):
        return 'naqis_waw'
    if l in (YA, AMS):
        return 'naqis_ya'
    if f == WAW:
        return 'mithal_waw'
    if f == YA:
        return 'mithal_ya'
    hmz = []
    # Plain alif (ا) in root = hamza stored without diacritic seat (corpus convention)
    if f in HAMZAS or f == ALIF: hmz.append('f')
    if e in HAMZAS: hmz.append('e')
    if l in HAMZAS: hmz.append('l')
    if hmz:
        return 'mahmuz_' + '_'.join(hmz)
    return 'sound'

# ── Extract Form-I vowel from existing 3ms data ───────────────────────────────
def extract_vowels(madi_3ms, mudari_3ms, root_letters):
    f, e, _ = [strip_diac(x) for x in root_letters]
    vm = FA; vmu = FA
    def vowel_after(s, letter):
        if not s: return None
        chars = list(s)
        for i, c in enumerate(chars):
            if strip_diac(c) == letter and i+1 < len(chars) and chars[i+1] in (FA,DA,KA):
                return chars[i+1]
        return None
    v = vowel_after(madi_3ms, e)
    if v: vm = v
    v = vowel_after(mudari_3ms, e)
    if v:
        vmu = v
    else:
        # For mudhaaf (e==l) or when e-vowel hidden by shadda, check vowel after f
        v = vowel_after(mudari_3ms, f)
        if v: vmu = v
    return vm, vmu

# ── Form VIII ت assimilation ──────────────────────────────────────────────────
def _t8(f):
    return {'\u0632':'\u062f','\u062f':'\u062f','\u0630':'\u0630',
            '\u0635':'\u0637','\u0636':'\u0637','\u0637':'\u0637',
            '\u0638':'\u0638'}.get(f, TA)

# ══════════════════════════════════════════════════════════════════════════════
#  SOUND VERB  (and base for mahmuz / mithal non-Form-I / etc.)
# ══════════════════════════════════════════════════════════════════════════════

def _madi_stem(f, e, l, form, vm):
    """
    Return (pre_lf, pre_lda, pre_lsk):
      pre_lf  = full 3ms madi form (ends in L+FA)
      pre_lda = same but L+DA  (for 3mp)
      pre_lsk = same but L+SK  (for consonant-suffix persons)
    All three share the same prefix; only the vowel on L changes.
    """
    if form == 'I':
        pre = f + FA + e + vm          # e.g. نَصَ (without final radical)
    elif form == 'II':
        pre = f + FA + e + SH + FA     # فَعَّ
    elif form == 'III':
        pre = f + FA + ALIF + e + FA   # فَاعَ
    elif form == 'IV':
        pre = ALIF_A + FA + f + SK + e + FA   # أَفْعَ
    elif form == 'V':
        pre = TA + FA + f + FA + e + SH + FA  # تَفَعَّ
    elif form == 'VI':
        pre = TA + FA + f + FA + ALIF + e + FA  # تَفَاعَ
    elif form == 'VII':
        pre = ALIF_B + SK + NUN + SK + f + FA + e + FA  # اِنْفَعَ
    elif form == 'VIII':
        pre = ALIF_B + SK + f + SK + _t8(f) + FA + e + FA  # اِفْتَعَ
    elif form == 'IX':
        # اِفْعَلَّ  — the final radical is doubled; handle separately
        base = ALIF_B + SK + f + SK + e + FA + l + SH + FA
        # For IX the "L" is already doubled; we treat it as a special case
        return base, base[:-1]+DA, base[:-1]+SK
    elif form == 'X':
        pre = ALIF_B + SK + SIN + SK + TA + FA + f + SK + e + FA  # اِسْتَفْعَ
    else:
        pre = f + FA + e + FA          # fallback
    return pre + l + FA, pre + l + DA, pre + l + SK

def sound_madi(f, e, l, form, vm):
    lf, lda, lsk = _madi_stem(f, e, l, form, vm)
    return {
        '3ms': lf,
        '3fs': lf  + TA + SK,
        '3md': lf  + ALIF,
        '3fd': lf  + TA + FA + ALIF,
        '3mp': lda + WAW + ALIF,
        '3fp': lsk + NUN + FA,
        '2ms': lsk + TA + FA,
        '2fs': lsk + TA + KA,
        '2d':  lsk + TA + DA + MIM + ALIF,
        '2mp': lsk + TA + DA + MIM + SK,
        '2fp': lsk + TA + DA + NUN + SH + FA,
        '1s':  lsk + TA + DA,
        '1p':  lsk + NUN + FA + ALIF,
    }

def _mudari_inner(f, e, l, form, vmu):
    """
    Return (inner, da_prefix).
    inner ends in L (no vowel on L — the caller appends the person vowel).
    da_prefix=True means prefix letter gets damma (Forms II-IV, VII-X).
    """
    if form == 'I':
        return f + SK + e + vmu + l, False    # فْعَلُ  (يَفْعَلُ)
    elif form == 'II':
        return f + FA + e + SH + KA + l, True  # فَعِّلُ  (يُفَعِّلُ)
    elif form == 'III':
        return f + FA + ALIF + e + KA + l, True  # فَاعِلُ
    elif form == 'IV':
        return f + SK + e + KA + l, True          # فْعِلُ
    elif form == 'V':
        return TA + FA + f + FA + e + SH + FA + l, False  # تَفَعَّلُ
    elif form == 'VI':
        return TA + FA + f + FA + ALIF + e + FA + l, False  # تَفَاعَلُ
    elif form == 'VII':
        return NUN + SK + f + FA + e + KA + l, False  # نْفَعِلُ
    elif form == 'VIII':
        return f + SK + _t8(f) + FA + e + KA + l, False  # فْتَعِلُ
    elif form == 'IX':
        return f + SK + e + FA + l + SH, False   # فْعَلُّ (shadda on last)
    elif form == 'X':
        return SIN + SK + TA + FA + f + SK + e + KA + l, False  # سْتَفْعِلُ
    return f + SK + e + FA + l, False

def sound_mudari(f, e, l, form, vmu):
    inner, da = _mudari_inner(f, e, l, form, vmu)
    pv = DA if da else FA
    result = {}
    for p in PERSON_ORDER:
        if p not in _PRE: continue
        pref = _PRE[p] + pv
        if p in ('3ms','3fs','2ms','1s','1p'):
            result[p] = pref + inner + DA
        elif p in ('3md','3fd','2d'):
            result[p] = pref + inner + FA + ALIF + NUN + KA
        elif p in ('3mp','2mp'):
            result[p] = pref + inner + DA + WAW + NUN + FA
        elif p in ('3fp','2fp'):
            result[p] = pref + inner + SK + NUN + FA
        elif p == '2fs':
            result[p] = pref + inner + KA + YA + NUN + FA
    return result

def sound_amr(f, e, l, form, vmu):
    inner, _ = _mudari_inner(f, e, l, form, vmu)
    if form == 'I':
        av = DA if vmu == DA else KA
        base = ALIF + av + inner        # اُفْعُلْ / اِفْعَلْ  (hamzat al-wasl)
    elif form == 'IV':
        base = ALIF_A + FA + inner      # أَفْعِلْ
    elif form in ('VII', 'VIII', 'X'):
        base = ALIF + KA + inner        # اِنْفَعِلْ / اِفْتَعِلْ / اِسْتَفْعِلْ
    else:
        base = inner   # Forms II, III, V, VI — no connecting alif
    return {
        '2ms': base + SK,
        '2fs': base + KA + YA,
        '2d':  base + FA + ALIF,
        '2mp': base + DA + WAW + ALIF,
        '2fp': base + SK + NUN + FA,
    }

def sound_passive_madi(f, e, l, form):
    if form == 'I':
        pre = f + DA + e + KA
    elif form == 'II':
        pre = f + DA + e + SH + KA
    elif form == 'III':
        pre = f + DA + ALIF + e + KA
    elif form == 'IV':
        pre = ALIF_A + DA + f + SK + e + KA
    elif form == 'V':
        pre = TA + DA + f + DA + e + SH + KA
    elif form == 'VI':
        pre = TA + DA + f + DA + ALIF + e + KA
    elif form == 'VII':
        pre = ALIF_B + DA + NUN + SK + f + DA + e + KA
    elif form == 'VIII':
        pre = ALIF_B + DA + f + SK + _t8(f) + DA + e + KA
    elif form == 'X':
        pre = ALIF_B + DA + SIN + SK + TA + DA + f + SK + e + KA
    else:
        pre = f + DA + e + KA
    lf, lda, lsk = pre+l+FA, pre+l+DA, pre+l+SK
    return {
        '3ms': lf,  '3fs': lf+TA+SK,
        '3md': lf+ALIF, '3fd': lf+TA+FA+ALIF,
        '3mp': lda+WAW+ALIF,
        '3fp': lsk+NUN+FA,  '2ms': lsk+TA+FA, '2fs': lsk+TA+KA,
        '2d':  lsk+TA+DA+MIM+ALIF, '2mp': lsk+TA+DA+MIM+SK,
        '2fp': lsk+TA+DA+NUN+SH+FA, '1s': lsk+TA+DA, '1p': lsk+NUN+FA+ALIF,
    }

def sound_passive_mudari(f, e, l, form):
    # يُفْعَلُ pattern — fatha on E for all forms
    if form == 'I':   inner = f + SK + e + FA + l
    elif form == 'II':  inner = f + FA + e + SH + FA + l
    elif form == 'III': inner = f + FA + ALIF + e + FA + l
    elif form == 'IV':  inner = f + SK + e + FA + l
    elif form == 'V':   inner = TA + FA + f + FA + e + SH + FA + l
    elif form == 'VI':  inner = TA + FA + f + FA + ALIF + e + FA + l
    elif form == 'VII': inner = NUN + SK + f + FA + e + FA + l
    elif form == 'VIII':inner = f + SK + _t8(f) + FA + e + FA + l
    elif form == 'X':   inner = SIN + SK + TA + FA + f + SK + e + FA + l
    else:               inner = f + SK + e + FA + l
    result = {}
    for p in PERSON_ORDER:
        if p not in _PRE: continue
        pref = _PRE[p] + DA
        if p in ('3ms','3fs','2ms','1s','1p'):
            result[p] = pref + inner + DA
        elif p in ('3md','3fd','2d'):
            result[p] = pref + inner + FA + ALIF + NUN + KA
        elif p in ('3mp','2mp'):
            result[p] = pref + inner + DA + WAW + NUN + FA
        elif p in ('3fp','2fp'):
            result[p] = pref + inner + SK + NUN + FA
        elif p == '2fs':
            result[p] = pref + inner + KA + YA + NUN + FA
    return result

def _sound_all(f, e, l, form, vm, vmu):
    return (sound_madi(f, e, l, form, vm),
            sound_mudari(f, e, l, form, vmu),
            sound_amr(f, e, l, form, vmu),
            sound_passive_madi(f, e, l, form),
            sound_passive_mudari(f, e, l, form))

# ══════════════════════════════════════════════════════════════════════════════
#  HOLLOW VERB  (أجوف — middle radical is و or ي)
# ══════════════════════════════════════════════════════════════════════════════

def ajwaf_conjugate(f, e, l, form, is_waw, vm, vmu):
    if form != 'I':
        ev_mu = KA if form in ('II','III','IV','VII','VIII','X') else FA
        return _sound_all(f, e, l, form, FA, ev_mu)

    sv = DA if is_waw else KA         # short vowel: damma (waw) / kasra (ya)
    lv = DA + WAW if is_waw else KA + YA   # long-vowel cluster for mudari

    # ── Madi ─────────────────────────────────────────────────────────────────
    # Long: F+FA+ALIF+L (hollow letter fuses with fatha → ā)
    la = f + FA + ALIF + l   # base without final vowel
    ss = f + sv + l           # short stem (قُلْ / بِعْ) — no final vowel

    madi = {
        '3ms': la + FA,
        '3fs': la + FA + TA + SK,
        '3md': la + FA + ALIF,
        '3fd': la + FA + TA + FA + ALIF,
        '3mp': la + DA + WAW + ALIF,
        '3fp': ss + SK + NUN + FA,
        '2ms': ss + SK + TA + FA,
        '2fs': ss + SK + TA + KA,
        '2d':  ss + SK + TA + DA + MIM + ALIF,
        '2mp': ss + SK + TA + DA + MIM + SK,
        '2fp': ss + SK + TA + DA + NUN + SH + FA,
        '1s':  ss + SK + TA + DA,
        '1p':  ss + SK + NUN + FA + ALIF,
    }

    # ── Mudari ───────────────────────────────────────────────────────────────
    # يَقُولُ / يَبِيعُ  — the hollow letter appears as long-vowel cluster
    # 3fp/2fp short: يَقُلْنَ / يَبِعْنَ (long vowel drops)
    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE: continue
        pref = _PRE[p] + FA
        if p in ('3ms','3fs','2ms','1s','1p'):
            mudari[p] = pref + f + lv + l + DA
        elif p in ('3md','3fd','2d'):
            mudari[p] = pref + f + lv + l + FA + ALIF + NUN + KA
        elif p in ('3mp','2mp'):
            mudari[p] = pref + f + lv + l + DA + WAW + NUN + FA
        elif p in ('3fp','2fp'):
            mudari[p] = pref + f + sv + l + SK + NUN + FA   # short form
        elif p == '2fs':
            mudari[p] = pref + f + lv + l + KA + YA + NUN + FA

    # ── Amr ──────────────────────────────────────────────────────────────────
    long_base = f + lv + l   # قُول / بِيع (long, no final vowel)
    amr = {
        '2ms': ss + SK,                       # قُلْ
        '2fs': long_base + KA + YA,           # قُولِي
        '2d':  long_base + FA + ALIF,         # قُولَا
        '2mp': long_base + DA + WAW + ALIF,   # قُولُوا
        '2fp': ss + SK + NUN + FA,            # قُلْنَ
    }

    # ── Passive madi: قِيلَ (always ي regardless of type) ────────────────────
    pss = f + KA + l     # short passive stem (قِلْ)
    pmadi = {
        '3ms': f + KA + YA + l + FA,
        '3fs': f + KA + YA + l + FA + TA + SK,
        '3md': f + KA + YA + l + FA + ALIF,
        '3fd': f + KA + YA + l + FA + TA + FA + ALIF,
        '3mp': f + KA + YA + l + DA + WAW + ALIF,
        '3fp': pss + SK + NUN + FA,
        '2ms': pss + SK + TA + FA,
        '2fs': pss + SK + TA + KA,
        '2d':  pss + SK + TA + DA + MIM + ALIF,
        '2mp': pss + SK + TA + DA + MIM + SK,
        '2fp': pss + SK + TA + DA + NUN + SH + FA,
        '1s':  pss + SK + TA + DA,
        '1p':  pss + SK + NUN + FA + ALIF,
    }

    # ── Passive mudari: يُقَالُ ───────────────────────────────────────────────
    pmudari = {}
    pal = f + FA + ALIF + l   # قَال (inner passive — fatha+alif, not sukun)
    for p in PERSON_ORDER:
        if p not in _PRE: continue
        pref = _PRE[p] + DA
        if p in ('3ms','3fs','2ms','1s','1p'):
            pmudari[p] = pref + pal + DA
        elif p in ('3md','3fd','2d'):
            pmudari[p] = pref + pal + FA + ALIF + NUN + KA
        elif p in ('3mp','2mp'):
            pmudari[p] = pref + pal + DA + WAW + NUN + FA
        elif p in ('3fp','2fp'):
            pmudari[p] = pref + pal + SK + NUN + FA
        elif p == '2fs':
            pmudari[p] = pref + pal + KA + YA + NUN + FA

    return madi, mudari, amr, pmadi, pmudari

# ══════════════════════════════════════════════════════════════════════════════
#  FINAL-WEAK VERB  (ناقص — last radical is و or ي)
# ══════════════════════════════════════════════════════════════════════════════

def naqis_conjugate(f, e, l_weak, form, is_waw, vm, vmu):
    if form != 'I':
        ev_mu = KA if form in ('II','III','IV','VII','VIII','X') else FA
        return _sound_all(f, e, l_weak, form, FA, ev_mu)

    woy = WAW if is_waw else YA      # the weak letter
    fe  = f + FA + e + vm            # فَعَ  (without final radical, no vowel at end)
    fe_mu = f + SK + e + vmu         # فْعَ  (mudari inner prefix)

    # ── Madi ─────────────────────────────────────────────────────────────────
    madi = {
        '3ms': fe + (ALIF if is_waw else AMS),       # دَعَا / هَدَى
        '3fs': fe + TA + SK,                          # دَعَتْ
        '3md': fe + woy + FA + ALIF,                  # دَعَوَا / هَدَيَا
        '3fd': fe + TA + FA + ALIF,                   # دَعَتَا
        '3mp': fe + WAW + SK + ALIF,                  # دَعَوْا  (always waw for 3mp)
        '3fp': fe + woy + SK + NUN + FA,              # دَعَوْنَ / هَدَيْنَ
        '2ms': fe + woy + SK + TA + FA,               # دَعَوْتَ
        '2fs': fe + woy + SK + TA + KA,
        '2d':  fe + woy + SK + TA + DA + MIM + ALIF,
        '2mp': fe + woy + SK + TA + DA + MIM + SK,
        '2fp': fe + woy + SK + TA + DA + NUN + SH + FA,
        '1s':  fe + woy + SK + TA + DA,
        '1p':  fe + woy + SK + NUN + FA + ALIF,
    }

    # ── Mudari ───────────────────────────────────────────────────────────────
    # يَدْعُو / يَهْدِي  — final radical appears as long vowel
    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE: continue
        pref = _PRE[p] + FA
        if p in ('3ms','3fs','2ms','1s','1p'):
            mudari[p] = pref + fe_mu + woy              # يَدْعُو / يَهْدِي
        elif p in ('3md','3fd','2d'):
            mudari[p] = pref + fe_mu + woy + FA + ALIF + NUN + KA
        elif p in ('3mp','2mp'):
            # Both waw and ya-type use DA+WAW in 3mp (ya→waw: يَهْدُونَ)
            mudari[p] = pref + f + SK + e + DA + WAW + NUN + FA
        elif p in ('3fp','2fp'):
            # waw-type: يَدْعُونَ (waw + نَ); ya-type: يَهْدِينَ (ya + نَ)
            mudari[p] = pref + fe_mu + WAW + NUN + FA if is_waw else \
                        pref + fe_mu + YA + NUN + FA
        elif p == '2fs':
            # Both types: تَدْعِينَ / تَهْدِينَ (always KA+YA)
            mudari[p] = pref + f + SK + e + KA + YA + NUN + FA

    # ── Amr ──────────────────────────────────────────────────────────────────
    av = DA if vmu == DA else KA
    base = ALIF + av + fe_mu + woy   # اُدْعُو / اِهْدِي  (hamzat al-wasl ا)
    amr = {
        '2ms': base,                                               # اُدْعُو / اِهْدِي
        '2fs': base + KA + YA,
        '2d':  base + FA + ALIF,
        '2mp': ALIF + av + f + SK + e + DA + WAW + ALIF,          # اُدْعُوا / اِهْدُوا
        '2fp': ALIF + av + f + SK + e + KA + YA + NUN + FA,       # اُدْعِينَ / اِهْدِينَ
    }

    # ── Passive madi: دُعِيَ ─────────────────────────────────────────────────
    fp = f + DA + e + KA    # دُعِ
    pmadi = {
        '3ms': fp + YA + FA,
        '3fs': fp + YA + FA + TA + SK,
        '3md': fp + YA + FA + ALIF,
        '3fd': fp + YA + FA + TA + FA + ALIF,
        '3mp': fp + DA + WAW + ALIF,
        '3fp': fp + YA + SK + NUN + FA,
        '2ms': fp + YA + SK + TA + FA,
        '2fs': fp + YA + SK + TA + KA,
        '2d':  fp + YA + SK + TA + DA + MIM + ALIF,
        '2mp': fp + YA + SK + TA + DA + MIM + SK,
        '2fp': fp + YA + SK + TA + DA + NUN + SH + FA,
        '1s':  fp + YA + SK + TA + DA,
        '1p':  fp + YA + SK + NUN + FA + ALIF,
    }

    # ── Passive mudari: يُدْعَى ───────────────────────────────────────────────
    fe_pm = f + SK + e + FA   # فْعَ
    pmudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE: continue
        pref = _PRE[p] + DA
        if p in ('3ms','3fs','2ms','1s','1p'):
            pmudari[p] = pref + fe_pm + AMS             # يُدْعَى
        elif p in ('3md','3fd','2d'):
            pmudari[p] = pref + fe_pm + FA + ALIF + NUN + KA
        elif p in ('3mp','2mp'):
            pmudari[p] = pref + fe_pm + WAW + NUN + FA
        elif p in ('3fp','2fp'):
            pmudari[p] = pref + fe_pm + SK + NUN + FA
        elif p == '2fs':
            pmudari[p] = pref + fe_pm + YA + NUN + FA

    return madi, mudari, amr, pmadi, pmudari

# ══════════════════════════════════════════════════════════════════════════════
#  DOUBLED VERB  (مضاعف — E == L)
# ══════════════════════════════════════════════════════════════════════════════

def mudhaaf_conjugate(f, e, l, form, vm, vmu):
    if form != 'I':
        ev_mu = KA if form in ('II','III','IV','VII','VIII','X') else FA
        return _sound_all(f, e, l, form, FA, ev_mu)

    el = e + SH                     # عَّ  (merged with shadda)
    long_pre = f + FA + el          # فَعَّ (contracted prefix)
    sep      = f + FA + e + FA + l  # فَعَلَ (separated form, no shadda)

    # ── Madi ─────────────────────────────────────────────────────────────────
    madi = {
        '3ms': long_pre + FA,
        '3fs': long_pre + FA + TA + SK,
        '3md': long_pre + FA + ALIF,
        '3fd': long_pre + FA + TA + FA + ALIF,
        '3mp': long_pre + DA + WAW + ALIF,
        '3fp': sep + SK + NUN + FA,
        '2ms': sep + SK + TA + FA,
        '2fs': sep + SK + TA + KA,
        '2d':  sep + SK + TA + DA + MIM + ALIF,
        '2mp': sep + SK + TA + DA + MIM + SK,
        '2fp': sep + SK + TA + DA + NUN + SH + FA,
        '1s':  sep + SK + TA + DA,
        '1p':  sep + SK + NUN + FA + ALIF,
    }

    # ── Mudari ───────────────────────────────────────────────────────────────
    mu_long = f + vmu + l + SH   # فُلُّ (contracted mudari — no SK/e between f and l)
    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE: continue
        pref = _PRE[p] + FA
        if p in ('3ms','3fs','2ms','1s','1p'):
            mudari[p] = pref + mu_long + DA
        elif p in ('3md','3fd','2d'):
            mudari[p] = pref + f + vmu + l + SH + FA + ALIF + NUN + KA
        elif p in ('3mp','2mp'):
            mudari[p] = pref + mu_long + DA + WAW + NUN + FA
        elif p in ('3fp','2fp'):
            mudari[p] = pref + f + SK + e + vmu + l + SK + NUN + FA
        elif p == '2fs':
            mudari[p] = pref + mu_long + KA + YA + NUN + FA

    # ── Amr ──────────────────────────────────────────────────────────────────
    amr = {
        '2ms': f + vmu + l + SH + FA,
        '2fs': f + vmu + l + SH + KA + YA,
        '2d':  f + vmu + l + SH + FA + ALIF,
        '2mp': f + vmu + l + SH + DA + WAW + ALIF,
        '2fp': ALIF + KA + f + SK + e + vmu + l + SK + NUN + FA,
    }

    # ── Passive madi ─────────────────────────────────────────────────────────
    p_long = f + DA + e + SH
    p_sep  = f + DA + e + KA + l
    pmadi = {
        '3ms': p_long + FA,
        '3fs': p_long + FA + TA + SK,
        '3md': p_long + FA + ALIF,
        '3fd': p_long + FA + TA + FA + ALIF,
        '3mp': p_long + DA + WAW + ALIF,
        '3fp': p_sep + SK + NUN + FA,
        '2ms': p_sep + SK + TA + FA,
        '2fs': p_sep + SK + TA + KA,
        '2d':  p_sep + SK + TA + DA + MIM + ALIF,
        '2mp': p_sep + SK + TA + DA + MIM + SK,
        '2fp': p_sep + SK + TA + DA + NUN + SH + FA,
        '1s':  p_sep + SK + TA + DA,
        '1p':  p_sep + SK + NUN + FA + ALIF,
    }

    # ── Passive mudari ────────────────────────────────────────────────────────
    pmu_long = f + SK + e + FA + l + SH
    pmudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE: continue
        pref = _PRE[p] + DA
        if p in ('3ms','3fs','2ms','1s','1p'):
            pmudari[p] = pref + pmu_long + DA
        elif p in ('3md','3fd','2d'):
            pmudari[p] = pref + f + SK + e + FA + l + FA + ALIF + NUN + KA
        elif p in ('3mp','2mp'):
            pmudari[p] = pref + pmu_long + DA + WAW + NUN + FA
        elif p in ('3fp','2fp'):
            pmudari[p] = pref + f + SK + e + SK + l + SK + NUN + FA
        elif p == '2fs':
            pmudari[p] = pref + pmu_long + KA + YA + NUN + FA

    return madi, mudari, amr, pmadi, pmudari

# ══════════════════════════════════════════════════════════════════════════════
#  INITIAL-WEAK VERB  (مثال — first radical is و or ي)
# ══════════════════════════════════════════════════════════════════════════════

def mithal_conjugate(f, e, l, form, is_waw, vm, vmu):
    if form != 'I':
        ev_mu = KA if form in ('II','III','IV','VII','VIII','X') else FA
        return _sound_all(f, e, l, form, FA, ev_mu)

    # Madi: standard (و stays in past tense)
    m, _, _, pm, pmu = _sound_all(f, e, l, 'I', vm, vmu)

    if is_waw:
        # Mudari: initial و drops → يَعِدُ, يَجِدُ
        inner_drop = e + vmu + l     # عِد (without و)
        mudari = {}
        for p in PERSON_ORDER:
            if p not in _PRE: continue
            pref = _PRE[p] + FA
            if p in ('3ms','3fs','2ms','1s','1p'):
                mudari[p] = pref + inner_drop + DA
            elif p in ('3md','3fd','2d'):
                mudari[p] = pref + inner_drop + FA + ALIF + NUN + KA
            elif p in ('3mp','2mp'):
                mudari[p] = pref + inner_drop + DA + WAW + NUN + FA
            elif p in ('3fp','2fp'):
                mudari[p] = pref + inner_drop + SK + NUN + FA
            elif p == '2fs':
                mudari[p] = pref + inner_drop + KA + YA + NUN + FA

        # Amr: عِدْ (no alif needed — starts directly with consonant)
        amr = {
            '2ms': inner_drop + SK,
            '2fs': inner_drop + KA + YA,
            '2d':  inner_drop + FA + ALIF,
            '2mp': inner_drop + DA + WAW + ALIF,
            '2fp': inner_drop + SK + NUN + FA,
        }
    else:
        # ya-mithal: less common; use standard sound
        _, mudari, amr, _, _ = _sound_all(f, e, l, 'I', vm, vmu)

    return m, mudari, amr, pm, pmu

# ══════════════════════════════════════════════════════════════════════════════
#  HAMZATED VERB  (مهموز — one radical is hamza)
# ══════════════════════════════════════════════════════════════════════════════

def mahmuz_conjugate(f, e, l, form, vm, vmu):
    """
    Treat as sound; then fix hamza orthography.
    Key rule: Form IV where F = hamza → أَفْعَلَ yields أَأْ → آ (madda).
    """
    ev_mu = KA if form in ('II','III','IV','VII','VIII','X') else vmu
    m, mu, a, pm, pmu = _sound_all(f, e, l, form, vm, ev_mu)

    def fix(s):
        # Form IV of mahmuz-F: أَأْ / أَاْ → آ (madda)
        s = s.replace(ALIF_A + FA + ALIF_A + SK, ALIF_M)
        s = s.replace(ALIF_A + FA + ALIF_A + FA, ALIF_M + FA)
        s = s.replace(ALIF_A + FA + ALIF + SK, ALIF_M)   # plain-alif root variant
        # Hamza after damma → ؤ (e.g. يُأْمِنُ / يُاْمِنُ → يُؤْمِنُ)
        s = s.replace(DA + ALIF_A + SK, DA + HMZ_W + SK)
        s = s.replace(DA + ALIF + SK, DA + HMZ_W + SK)    # plain-alif root variant
        return s

    return ({p:fix(v) for p,v in m.items()},
            {p:fix(v) for p,v in mu.items()},
            {p:fix(v) for p,v in a.items()},
            {p:fix(v) for p,v in pm.items()},
            {p:fix(v) for p,v in pmu.items()})

# ══════════════════════════════════════════════════════════════════════════════
#  MAIN DISPATCHER
# ══════════════════════════════════════════════════════════════════════════════

def conjugate_root(root_letters, form,
                   existing_madi_3ms=None, existing_mudari_3ms=None):
    f, e, l = [strip_diac(x) for x in root_letters]
    vtype   = classify(root_letters)
    vm, vmu = extract_vowels(existing_madi_3ms, existing_mudari_3ms, root_letters)

    if vtype.startswith('ajwaf'):
        m, mu, a, pm, pmu = ajwaf_conjugate(f, e, l, form, 'waw' in vtype, vm, vmu)
    elif vtype.startswith('naqis'):
        m, mu, a, pm, pmu = naqis_conjugate(f, e, l, form, 'waw' in vtype, vm, vmu)
    elif vtype == 'mudhaaf':
        m, mu, a, pm, pmu = mudhaaf_conjugate(f, e, l, form, vm, vmu)
    elif vtype.startswith('mithal'):
        m, mu, a, pm, pmu = mithal_conjugate(f, e, l, form, 'waw' in vtype, vm, vmu)
    elif vtype.startswith('mahmuz'):
        m, mu, a, pm, pmu = mahmuz_conjugate(f, e, l, form, vm, vmu)
    else:
        ev_mu = KA if form in ('II','III','IV','VII','VIII','X') else vmu
        m, mu, a, pm, pmu = _sound_all(f, e, l, form, vm, ev_mu)

    return {'madi':m, 'mudari':mu, 'amr':a,
            'passive_madi':pm, 'passive_mudari':pmu}

# ══════════════════════════════════════════════════════════════════════════════
#  JSON patching
# ══════════════════════════════════════════════════════════════════════════════

def get_3ms(tenses, ttype):
    for t in tenses:
        if t['type'] == ttype:
            for c in t.get('conjugation', []):
                if c['person'] == '3ms':
                    return c['arabic']
    return None

def patch_verb(root_obj):
    root_letters = root_obj.get('rootLetters', [])
    if len(root_letters) < 3:
        return
    for bab in root_obj.get('babs', []):
        form   = bab.get('form', 'I')
        tenses = bab.get('tenses', [])
        ex_m   = get_3ms(tenses, 'madi')
        ex_mu  = get_3ms(tenses, 'mudari')
        try:
            forms = conjugate_root(root_letters, form, ex_m, ex_mu)
        except Exception as ex:
            print(f"  WARN {root_obj['root']} Form {form}: {ex}", file=sys.stderr)
            continue
        for tense in tenses:
            tkey = tense.get('type')
            if tkey not in forms:
                continue
            fd = forms[tkey]
            new_conj = []
            for p in PERSON_ORDER:
                if p not in fd or not fd[p]:
                    continue
                new_conj.append({
                    'person': p,
                    'arabic': fd[p],
                    'transliteration': '',
                    'english': PERSON_LABELS.get(p, p),
                })
            if new_conj:
                tense['conjugation'] = new_conj

# ══════════════════════════════════════════════════════════════════════════════
#  Entry point
# ══════════════════════════════════════════════════════════════════════════════

def main():
    base = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base, '..', 'public', 'data', 'verbsData.json')
    print(f"Loading {path} …")
    with open(path, encoding='utf-8') as fh:
        data = json.load(fh)
    roots = data.get('roots', data)
    print(f"Processing {len(roots)} roots …")
    for i, r in enumerate(roots, 1):
        patch_verb(r)
        if i % 100 == 0:
            print(f"  {i}/{len(roots)}", file=sys.stderr)
    print(f"Writing {path} …")
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    print("Done.")

if __name__ == '__main__':
    main()
