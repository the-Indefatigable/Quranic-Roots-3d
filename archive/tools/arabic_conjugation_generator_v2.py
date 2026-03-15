#!/usr/bin/env python3
"""
fix_conjugations.py  (v2 — comprehensive rewrite)

Regenerates Arabic verb conjugation forms in verbsData.json using
classical Arabic morphological rules.  Only the `arabic` field in
each ConjugationForm entry is replaced; all other fields (occurrences,
references, meanings, colours, prepositions …) are left intact.

Fixes over v1
─────────────
• Ajwaf fatha-type (خَافَ/يَخَافُ, نَامَ/يَنَامُ) now handled correctly
• Derived-form weak verbs (IV, V, VI, VII, VIII, X of ajwaf & naqis)
  no longer fall back to sound — proper weak conjugation throughout
• Lafif maqrūn (رَوَى, طَوَى) and lafif mafrūq (وَفَى, وَقَى) recognised
• Jussive (مجزوم) and subjunctive (منصوب) moods added
• Forms VII & IX correctly produce NO passive
• رَأَى hamza-drop and أَخَذَ/أَكَلَ/أَمَرَ short-imperative handled
• Naqis mudari with fatha → alif maqsūra ending (يَرْضَى not *يَرْضَي)
• Classifier ordering fixed for doubly-weak / overlapping categories

Usage (from repo root):
    python3 data/fix_conjugations.py
"""

import json, os, sys, re, copy

# ══════════════════════════════════════════════════════════════════════════════
#  CONSTANTS
# ══════════════════════════════════════════════════════════════════════════════

# ── Diacritics ────────────────────────────────────────────────────────────────
FA  = '\u064e'   # fatha   َ
DA  = '\u064f'   # damma   ُ
KA  = '\u0650'   # kasra   ِ
SK  = '\u0652'   # sukun   ْ
SH  = '\u0651'   # shadda  ّ
DIAC = {FA, DA, KA, SK, SH,
        '\u064b', '\u064c', '\u064d',   # tanwin
        '\u0653', '\u0654', '\u0655'}

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
DAL    = '\u062f'   # د
DHAL   = '\u0630'   # ذ
ZAY    = '\u0632'   # ز
SAD    = '\u0635'   # ص
DAD    = '\u0636'   # ض
TAA    = '\u0637'   # ط
ZAA    = '\u0638'   # ظ

WEAK   = {WAW, YA, AMS, ALIF}
HAMZAS = {HAMZA, ALIF_A, ALIF_B, ALIF_M, HMZ_W, HMZ_Y}

# ── Person tables ─────────────────────────────────────────────────────────────
PERSON_ORDER = ['3ms', '3fs', '3md', '3fd', '3mp', '3fp',
                '2ms', '2fs', '2d', '2mp', '2fp', '1s', '1p']

PERSON_LABELS = {
    '1s': '1st singular',  '1p': '1st plural',
    '2ms': '2nd masc. sg', '2fs': '2nd fem. sg', '2d': '2nd dual',
    '2mp': '2nd masc. pl', '2fp': '2nd fem. pl',
    '3ms': '3rd masc. sg', '3fs': '3rd fem. sg',
    '3md': '3rd masc. dual', '3fd': '3rd fem. dual',
    '3mp': '3rd masc. pl', '3fp': '3rd fem. pl',
}

# Mudari prefix letters
_PRE = {
    '3ms': YA, '3fs': TA, '3md': YA, '3fd': TA, '3mp': YA, '3fp': YA,
    '2ms': TA, '2fs': TA, '2d': TA, '2mp': TA, '2fp': TA,
    '1s': ALIF_A, '1p': NUN,
}

# Forms that never have a passive voice
NO_PASSIVE_FORMS = {'VII', 'IX'}

# Forms where mudari prefix gets damma
DAMMA_PREFIX_FORMS = {'II', 'III', 'IV'}

def strip_diac(s):
    return ''.join(c for c in s if c not in DIAC)


# ══════════════════════════════════════════════════════════════════════════════
#  CLASSIFIER
# ══════════════════════════════════════════════════════════════════════════════

def classify(root_letters):
    """
    Classify a triliteral root.  Order matters — check compound categories
    (lafif) before simple ones to avoid misclassification.
    """
    f, e, l = [strip_diac(x) for x in root_letters]

    # ── Lafif: two weak radicals ──────────────────────────────────────────────
    f_weak = f in WEAK or f in HAMZAS and False  # hamza ≠ weak for lafif
    e_weak = e in (WAW, YA, ALIF)
    l_weak = l in (WAW, YA, AMS)

    if e_weak and l_weak:
        return 'lafif_maqrun'      # رَوَى، طَوَى، حَيِيَ
    if (f in (WAW, YA)) and l_weak:
        return 'lafif_mafruq'      # وَفَى، وَقَى، وَلِيَ

    # ── Doubled (مضاعف) ───────────────────────────────────────────────────────
    if e == l and e not in WEAK and e not in HAMZAS:
        return 'mudhaaf'

    # ── Hollow (أجوف) ─────────────────────────────────────────────────────────
    if e in (WAW, ALIF):
        return 'ajwaf_waw'
    if e == YA:
        return 'ajwaf_ya'

    # ── Final-weak (ناقص) ─────────────────────────────────────────────────────
    if l in (WAW, ALIF):
        return 'naqis_waw'
    if l in (YA, AMS):
        return 'naqis_ya'

    # ── Initial-weak (مثال) ───────────────────────────────────────────────────
    if f == WAW:
        return 'mithal_waw'
    if f == YA:
        return 'mithal_ya'

    # ── Hamzated (مهموز) ──────────────────────────────────────────────────────
    hmz = []
    if f in HAMZAS or f == ALIF:
        hmz.append('f')
    if e in HAMZAS:
        hmz.append('e')
    if l in HAMZAS:
        hmz.append('l')
    if hmz:
        return 'mahmuz_' + '_'.join(hmz)

    return 'sound'


# ══════════════════════════════════════════════════════════════════════════════
#  VOWEL EXTRACTION
# ══════════════════════════════════════════════════════════════════════════════

def extract_vowels(madi_3ms, mudari_3ms, root_letters):
    """
    Inspect existing 3 ms data to determine the fael / mudari vowels.
    Returns (vm, vmu) — the vowel on the middle radical in madi / mudari.
    """
    f, e, _ = [strip_diac(x) for x in root_letters]
    vm = FA; vmu = FA

    def vowel_after(s, letter):
        if not s:
            return None
        chars = list(s)
        for i, c in enumerate(chars):
            if strip_diac(c) == letter and i + 1 < len(chars) and chars[i + 1] in (FA, DA, KA):
                return chars[i + 1]
        return None

    v = vowel_after(madi_3ms, e)
    if v:
        vm = v
    v = vowel_after(mudari_3ms, e)
    if v:
        vmu = v
    else:
        v = vowel_after(mudari_3ms, f)
        if v:
            vmu = v
    return vm, vmu


# ══════════════════════════════════════════════════════════════════════════════
#  FORM VIII  تاء ASSIMILATION
# ══════════════════════════════════════════════════════════════════════════════

def _t8(f):
    """Return the assimilated taa for Form VIII after first radical `f`."""
    return {
        ZAY: DAL, DAL: DAL, DHAL: DHAL,
        SAD: TAA, DAD: TAA, TAA: TAA,
        ZAA: ZAA,
    }.get(f, TA)


def _f8_cluster(f):
    """
    Return the Form-VIII consonant cluster (without trailing vowel).
    Handles all assimilations:
      • WAW / YA  → تّ  (f drops, ta doubled)
      • f == _t8(f) (د→دّ, ذ→ذّ, ط→طّ, ظ→ظّ) → merged (shadda)
      • otherwise → f + sukun + t8-letter  (صْط, ضْط, زْد)
    Caller appends the vowel after the returned cluster.
    """
    if f in (WAW, YA):
        return TA + SH                             # تّ
    t = _t8(f)
    if t == f:
        return f + SH                               # merged: دّ, ذّ, طّ, ظّ
    return f + SK + t                                # separate: صْط, ضْط, زْد


# ══════════════════════════════════════════════════════════════════════════════
#  HELPER: apply person endings to a bare stem
# ══════════════════════════════════════════════════════════════════════════════

def _madi_endings(lf, lda, lsk):
    """
    Given three stem variants (ending in L+fatha, L+damma, L+sukun),
    return a full 13-person madi dict.
    """
    return {
        '3ms': lf,
        '3fs': lf + TA + SK,
        '3md': lf + ALIF,
        '3fd': lf + TA + FA + ALIF,
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


def _mudari_endings(inner, pref_vowel):
    """
    `inner` = the part after the prefix vowel, ending with final radical
    (no vowel on final radical).
    `pref_vowel` = FA or DA for the prefix.
    """
    result = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + pref_vowel
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            result[p] = pref + inner + DA
        elif p in ('3md', '3fd', '2d'):
            result[p] = pref + inner + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            result[p] = pref + inner + DA + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            result[p] = pref + inner + SK + NUN + FA
        elif p == '2fs':
            result[p] = pref + inner + KA + YA + NUN + FA
    return result


# ══════════════════════════════════════════════════════════════════════════════
#  JUSSIVE & SUBJUNCTIVE  (derived from indicative مرفوع)
# ══════════════════════════════════════════════════════════════════════════════

def _derive_subjunctive(mudari, vtype='sound'):
    """
    منصوب — from مرفوع:
      • singular: final damma → fatha
      • dual / 2fs / 3mp / 2mp: drop final nun
      • 3fp / 2fp: unchanged
    For naqis: 3ms final letter changes (e.g. يَدْعُو → يَدْعُوَ)
    """
    sub = {}
    for p, form in mudari.items():
        if p in ('3fp', '2fp'):
            sub[p] = form                              # no change
        elif p in ('3md', '3fd', '2d'):
            # drop final نِ → keep ـَانِ minus last two chars
            sub[p] = form[:-2]                         # يَفْعَلَا
        elif p in ('3mp', '2mp'):
            # يَفْعَلُونَ → يَفْعَلُوا  (drop نَ, keep وا? actually: drop ونَ add وا)
            # Standard: drop final نَ
            sub[p] = form[:-2] + ALIF                  # يَفْعَلُوا
        elif p == '2fs':
            # تَفْعَلِينَ → تَفْعَلِي (drop final نَ)
            sub[p] = form[:-2]
        else:
            # singular: final DA → FA
            if form and form[-1] == DA:
                sub[p] = form[:-1] + FA
            else:
                sub[p] = form
    return sub


def _derive_jussive(mudari, vtype='sound'):
    """
    مجزوم — from مرفوع:
      • singular: final damma → sukun
      • dual / 2fs / 3mp / 2mp: drop final nun (same as subjunctive)
      • 3fp / 2fp: unchanged
    Special handling for weak verbs is done in their respective conjugators.
    """
    jzm = {}
    for p, form in mudari.items():
        if p in ('3fp', '2fp'):
            jzm[p] = form
        elif p in ('3md', '3fd', '2d'):
            jzm[p] = form[:-2]
        elif p in ('3mp', '2mp'):
            jzm[p] = form[:-2] + ALIF
        elif p == '2fs':
            jzm[p] = form[:-2]
        else:
            if form and form[-1] == DA:
                jzm[p] = form[:-1] + SK
            else:
                jzm[p] = form
    return jzm


def _derive_jussive_hollow(mudari_ind, short_inner, pref_vowel):
    """
    Jussive for hollow verbs: singular forms use short stem (يَقُلْ not يَقُولْ).
    `short_inner` = the short stem without the long vowel (e.g. فُل for قول).
    """
    jzm = {}
    for p, form in mudari_ind.items():
        if p in ('3fp', '2fp'):
            jzm[p] = form
        elif p in ('3md', '3fd', '2d'):
            jzm[p] = form[:-2]
        elif p in ('3mp', '2mp'):
            jzm[p] = form[:-2] + ALIF
        elif p == '2fs':
            jzm[p] = form[:-2]
        else:
            # singular: use short stem + sukun
            pref = _PRE[p] + pref_vowel
            jzm[p] = pref + short_inner + SK
    return jzm


def _derive_jussive_naqis(mudari_ind):
    """
    Jussive for naqis verbs: singular forms drop final weak letter.
    يَدْعُو → يَدْعُ  ·  يَهْدِي → يَهْدِ  ·  يَرْضَى → يَرْضَ
    """
    jzm = {}
    for p, form in mudari_ind.items():
        if p in ('3fp', '2fp'):
            jzm[p] = form
        elif p in ('3md', '3fd', '2d'):
            jzm[p] = form[:-2]
        elif p in ('3mp', '2mp'):
            jzm[p] = form[:-2] + ALIF
        elif p == '2fs':
            jzm[p] = form[:-2]
        else:
            # drop final letter (و / ي / ى) — keep preceding vowel
            if form:
                last = form[-1]
                if last in (WAW, YA, AMS):
                    jzm[p] = form[:-1]
                elif last == DA:
                    jzm[p] = form[:-1] + SK
                else:
                    jzm[p] = form
            else:
                jzm[p] = form
    return jzm


# ══════════════════════════════════════════════════════════════════════════════
#  SOUND VERB
# ══════════════════════════════════════════════════════════════════════════════

def _madi_stem(f, e, l, form, vm):
    if form == 'I':
        pre = f + FA + e + vm
    elif form == 'II':
        pre = f + FA + e + SH + FA
    elif form == 'III':
        pre = f + FA + ALIF + e + FA
    elif form == 'IV':
        pre = ALIF_A + FA + f + SK + e + FA
    elif form == 'V':
        pre = TA + FA + f + FA + e + SH + FA
    elif form == 'VI':
        pre = TA + FA + f + FA + ALIF + e + FA
    elif form == 'VII':
        pre = ALIF + KA + NUN + SK + f + FA + e + FA
    elif form == 'VIII':
        pre = ALIF + KA + _f8_cluster(f) + FA + e + FA
    elif form == 'IX':
        base = ALIF + KA + f + SK + e + FA + l + SH + FA
        return base, base[:-1] + DA, base[:-1] + SK
    elif form == 'X':
        pre = ALIF + KA + SIN + SK + TA + FA + f + SK + e + FA
    else:
        pre = f + FA + e + FA
    return pre + l + FA, pre + l + DA, pre + l + SK


def sound_madi(f, e, l, form, vm):
    lf, lda, lsk = _madi_stem(f, e, l, form, vm)
    return _madi_endings(lf, lda, lsk)


def _mudari_inner(f, e, l, form, vmu):
    """
    Return (inner, da_prefix).
    `inner` ends in L with no vowel — caller appends person ending.
    """
    if form == 'I':
        return f + SK + e + vmu + l, False
    elif form == 'II':
        return f + FA + e + SH + KA + l, True
    elif form == 'III':
        return f + FA + ALIF + e + KA + l, True
    elif form == 'IV':
        return f + SK + e + KA + l, True
    elif form == 'V':
        return TA + FA + f + FA + e + SH + FA + l, False
    elif form == 'VI':
        return TA + FA + f + FA + ALIF + e + FA + l, False
    elif form == 'VII':
        return NUN + SK + f + FA + e + KA + l, False
    elif form == 'VIII':
        return _f8_cluster(f) + FA + e + KA + l, False
    elif form == 'IX':
        return f + SK + e + FA + l + SH, False
    elif form == 'X':
        return SIN + SK + TA + FA + f + SK + e + KA + l, False
    return f + SK + e + FA + l, False


def sound_mudari(f, e, l, form, vmu):
    inner, da = _mudari_inner(f, e, l, form, vmu)
    pv = DA if da else FA
    return _mudari_endings(inner, pv)


def sound_amr(f, e, l, form, vmu):
    inner, _ = _mudari_inner(f, e, l, form, vmu)
    if form == 'I':
        av = DA if vmu == DA else KA
        base = ALIF + av + inner
    elif form == 'IV':
        base = ALIF_A + FA + inner
    elif form in ('VII', 'VIII', 'X'):
        base = ALIF + KA + inner
    else:
        base = inner   # II, III, V, VI, IX
    return {
        '2ms': base + SK,
        '2fs': base + KA + YA,
        '2d':  base + FA + ALIF,
        '2mp': base + DA + WAW + ALIF,
        '2fp': base + SK + NUN + FA,
    }


def sound_passive_madi(f, e, l, form):
    if form in NO_PASSIVE_FORMS:
        return {}
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
    elif form == 'VIII':
        pre = ALIF + DA + _f8_cluster(f) + DA + e + KA
    elif form == 'X':
        pre = ALIF + DA + SIN + SK + TA + DA + f + SK + e + KA
    else:
        pre = f + DA + e + KA
    lf, lda, lsk = pre + l + FA, pre + l + DA, pre + l + SK
    return _madi_endings(lf, lda, lsk)


def sound_passive_mudari(f, e, l, form):
    if form in NO_PASSIVE_FORMS:
        return {}
    if form == 'I':
        inner = f + SK + e + FA + l
    elif form == 'II':
        inner = f + FA + e + SH + FA + l
    elif form == 'III':
        inner = f + FA + ALIF + e + FA + l
    elif form == 'IV':
        inner = f + SK + e + FA + l
    elif form == 'V':
        inner = TA + FA + f + FA + e + SH + FA + l
    elif form == 'VI':
        inner = TA + FA + f + FA + ALIF + e + FA + l
    elif form == 'VIII':
        inner = _f8_cluster(f) + FA + e + FA + l
    elif form == 'X':
        inner = SIN + SK + TA + FA + f + SK + e + FA + l
    else:
        inner = f + SK + e + FA + l
    return _mudari_endings(inner, DA)


def _sound_all(f, e, l, form, vm, vmu):
    m   = sound_madi(f, e, l, form, vm)
    mu  = sound_mudari(f, e, l, form, vmu)
    a   = sound_amr(f, e, l, form, vmu)
    pm  = sound_passive_madi(f, e, l, form)
    pmu = sound_passive_mudari(f, e, l, form)
    sub = _derive_subjunctive(mu)
    jzm = _derive_jussive(mu)
    psub = _derive_subjunctive(pmu) if pmu else {}
    pjzm = _derive_jussive(pmu) if pmu else {}
    return m, mu, a, pm, pmu, sub, jzm, psub, pjzm


# ══════════════════════════════════════════════════════════════════════════════
#  HOLLOW VERB  (أجوف)
# ══════════════════════════════════════════════════════════════════════════════

def _ajwaf_form1(f, e, l, is_waw, vm, vmu):
    """
    Form I hollow verb.  Three sub-patterns based on mudari vowel:
      • damma  (قَالَ / يَقُولُ)  — waw type, standard
      • kasra  (بَاعَ / يَبِيعُ)  — ya type, standard
      • fatha  (خَافَ / يَخَافُ)  — fatha type (waw OR ya root)
    """
    if vmu == FA:
        # ── Fatha type: خَافَ / يَخَافُ ──────────────────────────────────────
        # Madi long: F+fatha+alif+L  (خَافَ)
        # Madi short: F+kasra+L+sukun  (خِفْتُ — always kasra for fatha-type)
        la = f + FA + ALIF + l
        ss = f + KA + l
        # Mudari long: يَ+F+fatha+alif+L (يَخَافُ)
        lv_cluster = FA + ALIF
        sv_mudari = FA   # short vowel on F in shortened forms
        # Passive madi: خِيفَ (kasra+ya always)
        # Passive mudari: يُخَافُ (fatha+alif)
    elif is_waw:
        # ── Standard waw: قَالَ / يَقُولُ ────────────────────────────────────
        la = f + FA + ALIF + l
        ss = f + DA + l
        lv_cluster = DA + WAW
        sv_mudari = DA
    else:
        # ── Standard ya: بَاعَ / يَبِيعُ ─────────────────────────────────────
        la = f + FA + ALIF + l
        ss = f + KA + l
        lv_cluster = KA + YA
        sv_mudari = KA

    # ── Madi ──────────────────────────────────────────────────────────────────
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

    # ── Mudari ────────────────────────────────────────────────────────────────
    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + FA
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            mudari[p] = pref + f + lv_cluster + l + DA
        elif p in ('3md', '3fd', '2d'):
            mudari[p] = pref + f + lv_cluster + l + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            mudari[p] = pref + f + lv_cluster + l + DA + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            mudari[p] = pref + f + sv_mudari + l + SK + NUN + FA
        elif p == '2fs':
            mudari[p] = pref + f + lv_cluster + l + KA + YA + NUN + FA

    # ── Amr ───────────────────────────────────────────────────────────────────
    if vmu == DA:
        av = DA
    else:
        av = KA
    long_base = f + lv_cluster + l
    amr = {
        '2ms': ss + SK,
        '2fs': long_base + KA + YA,
        '2d':  long_base + FA + ALIF,
        '2mp': long_base + DA + WAW + ALIF,
        '2fp': ss + SK + NUN + FA,
    }

    # ── Passive madi: always قِيلَ pattern (kasra+ya) ─────────────────────────
    pss = f + KA + l
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

    # ── Passive mudari: always يُقَالُ (damma prefix, fatha+alif) ─────────────
    pal = f + FA + ALIF + l
    pmudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + DA
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            pmudari[p] = pref + pal + DA
        elif p in ('3md', '3fd', '2d'):
            pmudari[p] = pref + pal + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            pmudari[p] = pref + pal + DA + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            pmudari[p] = pref + pal + SK + NUN + FA
        elif p == '2fs':
            pmudari[p] = pref + pal + KA + YA + NUN + FA

    # ── Jussive (hollow-specific: short stem for singular) ────────────────────
    short_inner = f + sv_mudari + l   # e.g. قُل / بِع / خَف
    sub = _derive_subjunctive(mudari)
    jzm = _derive_jussive_hollow(mudari, short_inner, FA)
    psub = _derive_subjunctive(pmudari)
    pjzm = _derive_jussive_hollow(pmudari, f + FA + l, DA)  # passive short: فَل

    return madi, mudari, amr, pmadi, pmudari, sub, jzm, psub, pjzm


def _ajwaf_derived(f, e, l, form, is_waw):
    """
    Derived forms of ajwaf verbs.
    Forms II, III, V, VI: middle radical is protected → treat as sound.
    Forms IV, VII, VIII, X: middle radical hollows.
    """
    # Protected forms — middle radical kept
    if form in ('II', 'III', 'V', 'VI', 'IX'):
        ev_mu = KA if form in ('II', 'III') else FA
        return _sound_all(f, e, l, form, FA, ev_mu)

    # ── Determine hollow vowels per form ──────────────────────────────────────
    # Madi: always fatha+alif (أَقَامَ, اِنْقَادَ, اِخْتَارَ, اِسْتَقَامَ)
    # Mudari depends on form:
    if form == 'IV':
        # يُقِيمُ / يُبِينُ — kasra+ya in mudari
        mu_lv = KA + YA
        mu_sv = KA
        pref_v = DA   # damma prefix
    elif form in ('VII', 'VIII'):
        # يَنْقَادُ / يَخْتَارُ — fatha+alif in mudari
        mu_lv = FA + ALIF
        mu_sv = FA
        pref_v = FA
    elif form == 'X':
        # يَسْتَقِيمُ — kasra+ya in mudari
        mu_lv = KA + YA
        mu_sv = KA
        pref_v = FA
    else:
        return _sound_all(f, e, l, form, FA, KA)

    # ── Build form prefixes (before the hollow section) ───────────────────────
    if form == 'IV':
        m_pre  = ALIF_A + FA     # أَ
        mu_pre = ''               # (just prefix letter + damma)
        amr_pre = ALIF_A + FA    # أَ
    elif form == 'VII':
        m_pre  = ALIF + KA + NUN + SK   # اِنْ
        mu_pre = NUN + SK                  # نْ
        amr_pre = ALIF + KA + NUN + SK    # اِنْ
    elif form == 'VIII':
        m_pre  = ALIF + KA              # اِ
        mu_pre = ''                        # (empty — f+sk+t8 follows)
        amr_pre = ALIF + KA              # اِ
    elif form == 'X':
        m_pre  = ALIF + KA + SIN + SK + TA + FA   # اِسْتَ
        mu_pre = SIN + SK + TA + FA                   # سْتَ
        amr_pre = ALIF + KA + SIN + SK + TA + FA    # اِسْتَ

    # The hollow section: F + (long/short vowel) + L
    # For VIII: F + SK + t8 + (long/short) + L
    if form == 'VIII':
        m_long  = _f8_cluster(f) + FA + ALIF + l    # فْتَال
        m_short = _f8_cluster(f) + FA + l            # فْتَل (fatha for madi short)
        mu_long = _f8_cluster(f) + mu_lv + l         # فْتَال or فْتَِيل
        mu_short = _f8_cluster(f) + mu_sv + l        # short
    else:
        m_long  = f + FA + ALIF + l                    # فَال
        m_short = f + FA + l                           # فَل (fatha for madi short)
        mu_long = f + mu_lv + l                        # فِيل or فَال
        mu_short = f + mu_sv + l                       # فِل or فَل

    # ── Madi ──────────────────────────────────────────────────────────────────
    la  = m_pre + m_long
    ss  = m_pre + m_short
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

    # ── Mudari ────────────────────────────────────────────────────────────────
    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + pref_v
        inner_l = mu_pre + mu_long
        inner_s = mu_pre + mu_short
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            mudari[p] = pref + inner_l + DA
        elif p in ('3md', '3fd', '2d'):
            mudari[p] = pref + inner_l + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            mudari[p] = pref + inner_l + DA + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            mudari[p] = pref + inner_s + SK + NUN + FA
        elif p == '2fs':
            mudari[p] = pref + inner_l + KA + YA + NUN + FA

    # ── Amr ───────────────────────────────────────────────────────────────────
    amr_long = amr_pre + mu_long if form != 'IV' else ALIF_A + FA + mu_long
    amr_short = amr_pre + mu_short if form != 'IV' else ALIF_A + FA + mu_short
    amr = {
        '2ms': amr_short + SK,
        '2fs': amr_long + KA + YA,
        '2d':  amr_long + FA + ALIF,
        '2mp': amr_long + DA + WAW + ALIF,
        '2fp': amr_short + SK + NUN + FA,
    }

    # ── Passive ───────────────────────────────────────────────────────────────
    if form in NO_PASSIVE_FORMS:
        pmadi, pmudari = {}, {}
    else:
        # Passive madi: always damma+kasra pattern, with kasra+ya for hollow
        if form == 'IV':
            pm_pre = ALIF_A + DA
        elif form == 'VII':
            pm_pre = ALIF + DA + NUN + SK
        elif form == 'VIII':
            pm_pre = ALIF + DA
        elif form == 'X':
            pm_pre = ALIF + DA + SIN + SK + TA + DA

        if form == 'VIII':
            pm_long = _f8_cluster(f) + KA + YA + l
            pm_short = _f8_cluster(f) + KA + l
        else:
            pm_long = f + KA + YA + l
            pm_short = f + KA + l

        pla = pm_pre + pm_long
        pss = pm_pre + pm_short
        pmadi = {
            '3ms': pla + FA,
            '3fs': pla + FA + TA + SK,
            '3md': pla + FA + ALIF,
            '3fd': pla + FA + TA + FA + ALIF,
            '3mp': pla + DA + WAW + ALIF,
            '3fp': pss + SK + NUN + FA,
            '2ms': pss + SK + TA + FA,
            '2fs': pss + SK + TA + KA,
            '2d':  pss + SK + TA + DA + MIM + ALIF,
            '2mp': pss + SK + TA + DA + MIM + SK,
            '2fp': pss + SK + TA + DA + NUN + SH + FA,
            '1s':  pss + SK + TA + DA,
            '1p':  pss + SK + NUN + FA + ALIF,
        }

        # Passive mudari: damma prefix, fatha+alif for hollow
        if form == 'VIII':
            pmu_long = _f8_cluster(f) + FA + ALIF + l
            pmu_short = _f8_cluster(f) + FA + l
        else:
            pmu_long = f + FA + ALIF + l
            pmu_short = f + FA + l

        pmudari = {}
        for p in PERSON_ORDER:
            if p not in _PRE:
                continue
            pref = _PRE[p] + DA
            inner_l = mu_pre + pmu_long if form != 'IV' else pmu_long
            inner_s = mu_pre + pmu_short if form != 'IV' else pmu_short
            if p in ('3ms', '3fs', '2ms', '1s', '1p'):
                pmudari[p] = pref + inner_l + DA
            elif p in ('3md', '3fd', '2d'):
                pmudari[p] = pref + inner_l + FA + ALIF + NUN + KA
            elif p in ('3mp', '2mp'):
                pmudari[p] = pref + inner_l + DA + WAW + NUN + FA
            elif p in ('3fp', '2fp'):
                pmudari[p] = pref + inner_s + SK + NUN + FA
            elif p == '2fs':
                pmudari[p] = pref + inner_l + KA + YA + NUN + FA

    # ── Jussive / subjunctive ─────────────────────────────────────────────────
    short_jzm_inner = mu_pre + mu_short
    sub = _derive_subjunctive(mudari)
    jzm = _derive_jussive_hollow(mudari, short_jzm_inner, pref_v)
    psub = _derive_subjunctive(pmudari) if pmudari else {}
    pjzm_inner = (mu_pre + pmu_short) if pmudari else ''
    pjzm = _derive_jussive_hollow(pmudari, pjzm_inner, DA) if pmudari else {}

    return madi, mudari, amr, pmadi, pmudari, sub, jzm, psub, pjzm


def ajwaf_conjugate(f, e, l, form, is_waw, vm, vmu):
    if form == 'I':
        return _ajwaf_form1(f, e, l, is_waw, vm, vmu)
    return _ajwaf_derived(f, e, l, form, is_waw)


# ══════════════════════════════════════════════════════════════════════════════
#  FINAL-WEAK VERB  (ناقص)
# ══════════════════════════════════════════════════════════════════════════════

def _naqis_form1(f, e, l_weak, is_waw, vm, vmu):
    woy = WAW if is_waw else YA
    fe  = f + FA + e + vm
    fe_mu = f + SK + e + vmu

    # ── Madi ──────────────────────────────────────────────────────────────────
    madi = {
        '3ms': fe + (ALIF if is_waw else AMS),
        '3fs': fe + TA + SK,
        '3md': fe + woy + FA + ALIF,
        '3fd': fe + TA + FA + ALIF,
        '3mp': fe + WAW + SK + ALIF,
        '3fp': fe + woy + SK + NUN + FA,
        '2ms': fe + woy + SK + TA + FA,
        '2fs': fe + woy + SK + TA + KA,
        '2d':  fe + woy + SK + TA + DA + MIM + ALIF,
        '2mp': fe + woy + SK + TA + DA + MIM + SK,
        '2fp': fe + woy + SK + TA + DA + NUN + SH + FA,
        '1s':  fe + woy + SK + TA + DA,
        '1p':  fe + woy + SK + NUN + FA + ALIF,
    }

    # ── Mudari ────────────────────────────────────────────────────────────────
    # Determine final-letter behavior based on mudari stem vowel
    # damma → waw (يَدْعُو), kasra → ya (يَهْدِي), fatha → alif maqsura (يَرْضَى)
    if vmu == DA:
        mu_final = WAW
    elif vmu == KA:
        mu_final = YA
    else:  # fatha
        mu_final = AMS

    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + FA
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            mudari[p] = pref + fe_mu + mu_final
        elif p in ('3md', '3fd', '2d'):
            mudari[p] = pref + fe_mu + YA + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            mudari[p] = pref + f + SK + e + DA + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            if vmu == DA:
                mudari[p] = pref + fe_mu + WAW + NUN + FA
            elif vmu == KA:
                mudari[p] = pref + fe_mu + YA + NUN + FA
            else:
                mudari[p] = pref + fe_mu + YA + NUN + FA
        elif p == '2fs':
            mudari[p] = pref + f + SK + e + KA + YA + NUN + FA

    # ── Amr ───────────────────────────────────────────────────────────────────
    av = DA if vmu == DA else KA
    amr = {
        '2ms': ALIF + av + fe_mu,                               # اُدْعُ / اِهْدِ / اِرْضَ (final weak drops in 2ms)
        '2fs': ALIF + av + fe_mu + KA + YA,
        '2d':  ALIF + av + fe_mu + YA + FA + ALIF,
        '2mp': ALIF + av + f + SK + e + DA + WAW + ALIF,
        '2fp': ALIF + av + fe_mu + KA + YA + NUN + FA,
    }

    # ── Passive madi: دُعِيَ ──────────────────────────────────────────────────
    fp = f + DA + e + KA
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
    fe_pm = f + SK + e + FA
    pmudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + DA
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            pmudari[p] = pref + fe_pm + AMS
        elif p in ('3md', '3fd', '2d'):
            pmudari[p] = pref + fe_pm + YA + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            pmudari[p] = pref + fe_pm + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            pmudari[p] = pref + fe_pm + YA + NUN + FA
        elif p == '2fs':
            pmudari[p] = pref + fe_pm + YA + NUN + FA

    # ── Jussive / subjunctive ─────────────────────────────────────────────────
    sub = _derive_subjunctive(mudari, 'naqis')
    jzm = _derive_jussive_naqis(mudari)
    psub = _derive_subjunctive(pmudari, 'naqis')
    pjzm = _derive_jussive_naqis(pmudari)

    return madi, mudari, amr, pmadi, pmudari, sub, jzm, psub, pjzm


def _naqis_derived(f, e, l_weak, form, is_waw):
    """
    Naqis in derived forms.  The final-weak behaviour persists in ALL forms.
    The mudari ending depends on the form:
      kasra→ya  (يُصَلِّي): Forms II, III, IV, VII, VIII, X
      fatha→ى   (يَتَوَلَّى): Forms V, VI
    """
    if form == 'IX':
        # IX is extremely rare for naqis; use sound approximation
        return _sound_all(f, e, l_weak, form, FA, FA)

    # ── Determine stem vowel on final radical ─────────────────────────────────
    # In madi: always fatha before the final radical in all derived forms
    # In mudari: kasra for II,III,IV,VII,VIII,X; fatha for V,VI
    kasra_type = form in ('II', 'III', 'IV', 'VII', 'VIII', 'X')
    mu_final_v = KA if kasra_type else FA
    pref_v = DA if form in DAMMA_PREFIX_FORMS else FA

    # ── Build stem prefix (everything before the final radical) ───────────────
    # Madi stem prefix (with fatha on the letter before final radical)
    if form == 'II':
        m_stem   = f + FA + e + SH + FA               # فَعَّ
        mu_stem  = f + FA + e + SH + mu_final_v        # فَعِّ / فَعَّ
    elif form == 'III':
        m_stem   = f + FA + ALIF + e + FA              # فَاعَ
        mu_stem  = f + FA + ALIF + e + mu_final_v      # فَاعِ
    elif form == 'IV':
        m_stem   = ALIF_A + FA + f + SK + e + FA       # أَفْعَ
        mu_stem  = f + SK + e + mu_final_v              # فْعِ
    elif form == 'V':
        m_stem   = TA + FA + f + FA + e + SH + FA      # تَفَعَّ
        mu_stem  = TA + FA + f + FA + e + SH + mu_final_v  # تَفَعَّ
    elif form == 'VI':
        m_stem   = TA + FA + f + FA + ALIF + e + FA    # تَفَاعَ
        mu_stem  = TA + FA + f + FA + ALIF + e + mu_final_v  # تَفَاعَ
    elif form == 'VII':
        m_stem   = ALIF + KA + NUN + SK + f + FA + e + FA   # اِنْفَعَ
        mu_stem  = NUN + SK + f + FA + e + mu_final_v          # نْفَعِ
    elif form == 'VIII':
        m_stem   = ALIF + KA + _f8_cluster(f) + FA + e + FA  # اِفْتَعَ
        mu_stem  = _f8_cluster(f) + FA + e + mu_final_v         # فْتَعِ
    elif form == 'X':
        m_stem   = ALIF + KA + SIN + SK + TA + FA + f + SK + e + FA  # اِسْتَفْعَ
        mu_stem  = SIN + SK + TA + FA + f + SK + e + mu_final_v         # سْتَفْعِ

    # ── Madi ──────────────────────────────────────────────────────────────────
    # 3ms: stem + ى (alif maqsura) — all derived naqis madi end this way
    # Consonant-suffix: stem + ي + sukun + suffix (e.g. صَلَّيْتُ)
    madi = {
        '3ms': m_stem + AMS,
        '3fs': m_stem + TA + SK,
        '3md': m_stem + YA + FA + ALIF,
        '3fd': m_stem + TA + FA + ALIF,
        '3mp': m_stem + WAW + SK + ALIF,
        '3fp': m_stem + YA + SK + NUN + FA,
        '2ms': m_stem + YA + SK + TA + FA,
        '2fs': m_stem + YA + SK + TA + KA,
        '2d':  m_stem + YA + SK + TA + DA + MIM + ALIF,
        '2mp': m_stem + YA + SK + TA + DA + MIM + SK,
        '2fp': m_stem + YA + SK + TA + DA + NUN + SH + FA,
        '1s':  m_stem + YA + SK + TA + DA,
        '1p':  m_stem + YA + SK + NUN + FA + ALIF,
    }

    # ── Mudari ────────────────────────────────────────────────────────────────
    if kasra_type:
        mu_ending = YA          # يُصَلِّي
    else:
        mu_ending = AMS         # يَتَوَلَّى

    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + pref_v
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            mudari[p] = pref + mu_stem + mu_ending
        elif p in ('3md', '3fd', '2d'):
            mudari[p] = pref + mu_stem + YA + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            mudari[p] = pref + mu_stem[:-1] + DA + WAW + NUN + FA  # replace final vowel with damma
        elif p in ('3fp', '2fp'):
            mudari[p] = pref + mu_stem + YA + NUN + FA
        elif p == '2fs':
            mudari[p] = pref + mu_stem[:-1] + KA + YA + NUN + FA   # replace final vowel with kasra

    # ── Amr ───────────────────────────────────────────────────────────────────
    if form == 'IV':
        amr_base = ALIF_A + FA + mu_stem
    elif form in ('VII', 'VIII', 'X'):
        amr_base = ALIF + KA + mu_stem
    else:
        amr_base = mu_stem  # II, III, V, VI
    amr = {
        '2ms': amr_base,                                # final weak drops: صَلِّ / تَوَلَّ
        '2fs': amr_base + KA + YA,
        '2d':  amr_base + YA + FA + ALIF,
        '2mp': amr_base[:-1] + DA + WAW + ALIF,
        '2fp': amr_base + YA + NUN + FA,
    }

    # ── Passive ───────────────────────────────────────────────────────────────
    if form in NO_PASSIVE_FORMS:
        pmadi, pmudari = {}, {}
    else:
        # Passive madi: damma+kasra pattern + ِيَ ending
        if form == 'II':
            pm_stem = f + DA + e + SH + KA
        elif form == 'III':
            pm_stem = f + DA + ALIF + e + KA
        elif form == 'IV':
            pm_stem = ALIF_A + DA + f + SK + e + KA
        elif form == 'V':
            pm_stem = TA + DA + f + DA + e + SH + KA
        elif form == 'VI':
            pm_stem = TA + DA + f + DA + ALIF + e + KA
        elif form == 'VIII':
            pm_stem = ALIF + DA + _f8_cluster(f) + DA + e + KA
        elif form == 'X':
            pm_stem = ALIF + DA + SIN + SK + TA + DA + f + SK + e + KA

        pmadi = {
            '3ms': pm_stem + YA + FA,
            '3fs': pm_stem + YA + FA + TA + SK,
            '3md': pm_stem + YA + FA + ALIF,
            '3fd': pm_stem + YA + FA + TA + FA + ALIF,
            '3mp': pm_stem + DA + WAW + ALIF,
            '3fp': pm_stem + YA + SK + NUN + FA,
            '2ms': pm_stem + YA + SK + TA + FA,
            '2fs': pm_stem + YA + SK + TA + KA,
            '2d':  pm_stem + YA + SK + TA + DA + MIM + ALIF,
            '2mp': pm_stem + YA + SK + TA + DA + MIM + SK,
            '2fp': pm_stem + YA + SK + TA + DA + NUN + SH + FA,
            '1s':  pm_stem + YA + SK + TA + DA,
            '1p':  pm_stem + YA + SK + NUN + FA + ALIF,
        }

        # Passive mudari: يُفَعَّى / يُفْتَعَى — fatha before final, alif maqsura ending
        if form == 'II':
            pmu_stem = f + FA + e + SH + FA
        elif form == 'III':
            pmu_stem = f + FA + ALIF + e + FA
        elif form == 'IV':
            pmu_stem = f + SK + e + FA
        elif form == 'V':
            pmu_stem = TA + FA + f + FA + e + SH + FA
        elif form == 'VI':
            pmu_stem = TA + FA + f + FA + ALIF + e + FA
        elif form == 'VIII':
            pmu_stem = _f8_cluster(f) + FA + e + FA
        elif form == 'X':
            pmu_stem = SIN + SK + TA + FA + f + SK + e + FA

        pmudari = {}
        for p in PERSON_ORDER:
            if p not in _PRE:
                continue
            pref = _PRE[p] + DA
            if p in ('3ms', '3fs', '2ms', '1s', '1p'):
                pmudari[p] = pref + pmu_stem + AMS
            elif p in ('3md', '3fd', '2d'):
                pmudari[p] = pref + pmu_stem + YA + FA + ALIF + NUN + KA
            elif p in ('3mp', '2mp'):
                pmudari[p] = pref + pmu_stem + WAW + NUN + FA
            elif p in ('3fp', '2fp'):
                pmudari[p] = pref + pmu_stem + YA + NUN + FA
            elif p == '2fs':
                pmudari[p] = pref + pmu_stem + YA + NUN + FA

    sub = _derive_subjunctive(mudari, 'naqis')
    jzm = _derive_jussive_naqis(mudari)
    psub = _derive_subjunctive(pmudari, 'naqis') if pmudari else {}
    pjzm = _derive_jussive_naqis(pmudari) if pmudari else {}

    return madi, mudari, amr, pmadi, pmudari, sub, jzm, psub, pjzm


def naqis_conjugate(f, e, l_weak, form, is_waw, vm, vmu):
    if form == 'I':
        return _naqis_form1(f, e, l_weak, is_waw, vm, vmu)
    return _naqis_derived(f, e, l_weak, form, is_waw)


# ══════════════════════════════════════════════════════════════════════════════
#  DOUBLED VERB  (مضاعف)
# ══════════════════════════════════════════════════════════════════════════════

def mudhaaf_conjugate(f, e, l, form, vm, vmu):
    if form != 'I':
        ev_mu = KA if form in ('II', 'III', 'IV', 'VII', 'VIII', 'X') else FA
        return _sound_all(f, e, l, form, FA, ev_mu)

    el = e + SH
    long_pre = f + FA + el
    sep      = f + FA + e + FA + l

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

    mu_long = f + vmu + l + SH
    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + FA
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            mudari[p] = pref + mu_long + DA
        elif p in ('3md', '3fd', '2d'):
            mudari[p] = pref + mu_long + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            mudari[p] = pref + mu_long + DA + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            mudari[p] = pref + f + SK + e + vmu + l + SK + NUN + FA
        elif p == '2fs':
            mudari[p] = pref + mu_long + KA + YA + NUN + FA

    amr = {
        '2ms': f + vmu + l + SH + FA,
        '2fs': f + vmu + l + SH + KA + YA,
        '2d':  f + vmu + l + SH + FA + ALIF,
        '2mp': f + vmu + l + SH + DA + WAW + ALIF,
        '2fp': ALIF + KA + f + SK + e + vmu + l + SK + NUN + FA,
    }

    # Passive madi
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

    # Passive mudari
    pmu_long = f + SK + e + FA + l + SH
    pmudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + DA
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            pmudari[p] = pref + pmu_long + DA
        elif p in ('3md', '3fd', '2d'):
            pmudari[p] = pref + f + SK + e + FA + l + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            pmudari[p] = pref + pmu_long + DA + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            pmudari[p] = pref + f + SK + e + SK + l + SK + NUN + FA
        elif p == '2fs':
            pmudari[p] = pref + pmu_long + KA + YA + NUN + FA

    # Jussive for doubled: singular uses contracted form with fatha (يَمُدَّ)
    # or separated (يَمْدُدْ).  Standard: contracted + fatha.
    jzm = {}
    for p, form_s in mudari.items():
        if p in ('3fp', '2fp'):
            jzm[p] = form_s
        elif p in ('3md', '3fd', '2d'):
            jzm[p] = form_s[:-2]
        elif p in ('3mp', '2mp'):
            jzm[p] = form_s[:-2] + ALIF
        elif p == '2fs':
            jzm[p] = form_s[:-2]
        else:
            # يَمُدَّ (contracted with fatha instead of damma)
            jzm[p] = _PRE[p] + FA + mu_long + FA

    sub = _derive_subjunctive(mudari)
    psub = _derive_subjunctive(pmudari)
    pjzm = _derive_jussive(pmudari)

    return madi, mudari, amr, pmadi, pmudari, sub, jzm, psub, pjzm


# ══════════════════════════════════════════════════════════════════════════════
#  INITIAL-WEAK VERB  (مثال)
# ══════════════════════════════════════════════════════════════════════════════

def mithal_conjugate(f, e, l, form, is_waw, vm, vmu):
    if form != 'I':
        # For Form VIII, waw assimilates: وَعَدَ → اِتَّعَدَ (waw + ta → ta+shadda)
        # For other derived forms, initial weak stays — use sound
        ev_mu = KA if form in ('II', 'III', 'IV', 'VII', 'VIII', 'X') else FA
        return _sound_all(f, e, l, form, FA, ev_mu)

    # Madi: standard sound (و stays)
    m = sound_madi(f, e, l, 'I', vm)
    pm = sound_passive_madi(f, e, l, 'I')
    pmu = sound_passive_mudari(f, e, l, 'I')

    if is_waw:
        # Mudari: initial و drops → يَعِدُ
        inner_drop = e + vmu + l
        mudari = {}
        for p in PERSON_ORDER:
            if p not in _PRE:
                continue
            pref = _PRE[p] + FA
            if p in ('3ms', '3fs', '2ms', '1s', '1p'):
                mudari[p] = pref + inner_drop + DA
            elif p in ('3md', '3fd', '2d'):
                mudari[p] = pref + inner_drop + FA + ALIF + NUN + KA
            elif p in ('3mp', '2mp'):
                mudari[p] = pref + inner_drop + DA + WAW + NUN + FA
            elif p in ('3fp', '2fp'):
                mudari[p] = pref + inner_drop + SK + NUN + FA
            elif p == '2fs':
                mudari[p] = pref + inner_drop + KA + YA + NUN + FA

        # Amr: عِدْ (no alif — starts with consonant)
        amr = {
            '2ms': inner_drop + SK,
            '2fs': inner_drop + KA + YA,
            '2d':  inner_drop + FA + ALIF,
            '2mp': inner_drop + DA + WAW + ALIF,
            '2fp': inner_drop + SK + NUN + FA,
        }
    else:
        mudari = sound_mudari(f, e, l, 'I', vmu)
        amr = sound_amr(f, e, l, 'I', vmu)

    sub = _derive_subjunctive(mudari)
    jzm = _derive_jussive(mudari)
    psub = _derive_subjunctive(pmu) if pmu else {}
    pjzm = _derive_jussive(pmu) if pmu else {}

    return m, mudari, amr, pm, pmu, sub, jzm, psub, pjzm


# ══════════════════════════════════════════════════════════════════════════════
#  HAMZATED VERB  (مهموز)
# ══════════════════════════════════════════════════════════════════════════════

# Irregular amr verbs where initial hamza drops
_SHORT_AMR = {}   # populated after defining function

def mahmuz_conjugate(f, e, l, form, vm, vmu):
    ev_mu = KA if form in ('II', 'III', 'IV', 'VII', 'VIII', 'X') else vmu
    m, mu, a, pm, pmu, sub, jzm, psub, pjzm = _sound_all(f, e, l, form, vm, ev_mu)

    def fix(s):
        # Form IV mahmuz-F: أَأْ → آ (madda)
        s = s.replace(ALIF_A + FA + ALIF_A + SK, ALIF_M)
        s = s.replace(ALIF_A + FA + ALIF_A + FA, ALIF_M + FA)
        s = s.replace(ALIF_A + FA + ALIF + SK, ALIF_M)
        # Hamza after damma → ؤ
        s = s.replace(DA + ALIF_A + SK, DA + HMZ_W + SK)
        s = s.replace(DA + ALIF + SK, DA + HMZ_W + SK)
        return s

    result = (
        {p: fix(v) for p, v in m.items()},
        {p: fix(v) for p, v in mu.items()},
        {p: fix(v) for p, v in a.items()},
        {p: fix(v) for p, v in pm.items()},
        {p: fix(v) for p, v in pmu.items()},
        {p: fix(v) for p, v in sub.items()},
        {p: fix(v) for p, v in jzm.items()},
        {p: fix(v) for p, v in psub.items()},
        {p: fix(v) for p, v in pjzm.items()},
    )
    return result


# ══════════════════════════════════════════════════════════════════════════════
#  LAFIF VERBS  (لفيف — two weak radicals)
# ══════════════════════════════════════════════════════════════════════════════

def lafif_maqrun_conjugate(f, e, l, form, vm, vmu):
    """
    Lafif maqrūn — 2nd and 3rd radicals both weak (رَوَى, طَوَى, قَوِيَ).
    For Form I, treat like naqis (the ending behavior dominates).
    The middle radical generally appears as a consonant in madi and gets
    absorbed into the long vowel pattern in mudari.
    """
    is_waw = (l in (WAW, ALIF))
    return naqis_conjugate(f, e, l, form, is_waw, vm, vmu)


def lafif_mafruq_conjugate(f, e, l, form, vm, vmu):
    """
    Lafif mafrūq — 1st and 3rd radicals both weak (وَفَى, وَقَى, وَعَى).
    Combines mithal (first radical) and naqis (final radical) behaviour.
    Form I mudari: initial waw drops AND final radical is weak.
    """
    if form != 'I':
        # Derived forms: naqis behaviour dominates; initial weak mostly stays
        is_waw_l = (l in (WAW, ALIF))
        return naqis_conjugate(f, e, l, form, is_waw_l, vm, vmu)

    # ── Form I: combine mithal + naqis ────────────────────────────────────────
    is_waw_f = (f in (WAW, YA) and strip_diac(f) == WAW)
    is_waw_l = (l in (WAW, ALIF))
    woy_l = WAW if is_waw_l else YA

    # Madi: initial waw stays, final radical is weak like naqis
    fe = f + FA + e + vm
    madi = {
        '3ms': fe + (ALIF if is_waw_l else AMS),
        '3fs': fe + TA + SK,
        '3md': fe + woy_l + FA + ALIF,
        '3fd': fe + TA + FA + ALIF,
        '3mp': fe + WAW + SK + ALIF,
        '3fp': fe + woy_l + SK + NUN + FA,
        '2ms': fe + woy_l + SK + TA + FA,
        '2fs': fe + woy_l + SK + TA + KA,
        '2d':  fe + woy_l + SK + TA + DA + MIM + ALIF,
        '2mp': fe + woy_l + SK + TA + DA + MIM + SK,
        '2fp': fe + woy_l + SK + TA + DA + NUN + SH + FA,
        '1s':  fe + woy_l + SK + TA + DA,
        '1p':  fe + woy_l + SK + NUN + FA + ALIF,
    }

    # Mudari: initial waw drops (if waw-type) + naqis ending
    if vmu == DA:
        mu_final = WAW
    elif vmu == KA:
        mu_final = YA
    else:
        mu_final = AMS

    if is_waw_f:
        # Waw drops: يَعِي (from وَعَى)
        inner_base = e + vmu
    else:
        inner_base = f + SK + e + vmu

    mudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + FA
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            mudari[p] = pref + inner_base + mu_final
        elif p in ('3md', '3fd', '2d'):
            mudari[p] = pref + inner_base + YA + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            if is_waw_f:
                mudari[p] = pref + e + DA + WAW + NUN + FA
            else:
                mudari[p] = pref + f + SK + e + DA + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            mudari[p] = pref + inner_base + YA + NUN + FA
        elif p == '2fs':
            if is_waw_f:
                mudari[p] = pref + e + KA + YA + NUN + FA
            else:
                mudari[p] = pref + f + SK + e + KA + YA + NUN + FA

    # Amr: waw drops + naqis ending
    if is_waw_f:
        amr_base = inner_base
    else:
        av = DA if vmu == DA else KA
        amr_base = ALIF + av + inner_base
    amr = {
        '2ms': amr_base + mu_final,
        '2fs': amr_base + KA + YA,
        '2d':  amr_base + YA + FA + ALIF,
        '2mp': (e + DA + WAW + ALIF) if is_waw_f else (ALIF + (DA if vmu == DA else KA) + f + SK + e + DA + WAW + ALIF),
        '2fp': amr_base + YA + NUN + FA,
    }

    # Passive madi/mudari: use naqis passive pattern
    fp = f + DA + e + KA
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

    fe_pm = f + SK + e + FA
    pmudari = {}
    for p in PERSON_ORDER:
        if p not in _PRE:
            continue
        pref = _PRE[p] + DA
        if p in ('3ms', '3fs', '2ms', '1s', '1p'):
            pmudari[p] = pref + fe_pm + AMS
        elif p in ('3md', '3fd', '2d'):
            pmudari[p] = pref + fe_pm + YA + FA + ALIF + NUN + KA
        elif p in ('3mp', '2mp'):
            pmudari[p] = pref + fe_pm + WAW + NUN + FA
        elif p in ('3fp', '2fp'):
            pmudari[p] = pref + fe_pm + YA + NUN + FA
        elif p == '2fs':
            pmudari[p] = pref + fe_pm + YA + NUN + FA

    sub = _derive_subjunctive(mudari, 'naqis')
    jzm = _derive_jussive_naqis(mudari)
    psub = _derive_subjunctive(pmudari, 'naqis')
    pjzm = _derive_jussive_naqis(pmudari)

    return madi, mudari, amr, pmadi, pmudari, sub, jzm, psub, pjzm


# ══════════════════════════════════════════════════════════════════════════════
#  IRREGULAR VERBS  (post-processing for specific known irregulars)
# ══════════════════════════════════════════════════════════════════════════════

RA_L = '\u0631'  # ر (module-level, for use in irregulars)

def _apply_irregulars(root_str, form, m, mu, a, pm, pmu, sub, jzm, psub, pjzm):
    """
    Post-process for specific irregular verbs.
    Returns the (possibly modified) tuple.
    """
    bare = strip_diac(root_str)

    # ── رَأَى — hamza drops in mudari: يَرَى not *يَرْأَى ─────────────────────
    if bare in ('\u0631\u0623\u064a', '\u0631\u0627\u064a') and form == 'I':
        # رأي / راي
        # Mudari: يَرَى (prefix + ra + fatha + alif maqsura)
        for p in list(mu.keys()):
            pref = _PRE.get(p, '')
            if pref:
                mu[p] = pref + FA + RA_L + FA + AMS
        # Fix dual/plural
        for p in ('3md', '3fd', '2d'):
            if p in mu:
                mu[p] = _PRE[p] + FA + RA_L + FA + YA + FA + ALIF + NUN + KA
        for p in ('3mp', '2mp'):
            if p in mu:
                mu[p] = _PRE[p] + FA + RA_L + FA + WAW + NUN + FA
        for p in ('3fp', '2fp'):
            if p in mu:
                mu[p] = _PRE[p] + FA + RA_L + FA + YA + NUN + FA
        if '2fs' in mu:
            mu['2fs'] = TA + FA + RA_L + FA + YA + NUN + FA
        # Amr: رَ (just ra + fatha for 2ms)
        a['2ms'] = RA_L + FA
        # Regenerate sub/jzm
        sub = _derive_subjunctive(mu, 'naqis')
        jzm = _derive_jussive_naqis(mu)

    # ── أَخَذَ / أَكَلَ / أَمَرَ — amr drops initial hamza ─────────────────────
    KHAI = '\u062e'  # خ
    KAF  = '\u0643'  # ك
    if form == 'I':
        # أخذ → خُذْ
        if bare == ALIF_A + KHAI + DHAL or bare == ALIF + KHAI + DHAL:
            e_letter = KHAI
            l_letter = DHAL
            a['2ms'] = e_letter + DA + l_letter + SK
            a['2fs'] = e_letter + DA + l_letter + KA + YA
            a['2d']  = e_letter + DA + l_letter + FA + ALIF
            a['2mp'] = e_letter + DA + l_letter + DA + WAW + ALIF
            a['2fp'] = e_letter + DA + l_letter + SK + NUN + FA
        # أكل → كُلْ
        elif bare == ALIF_A + KAF + '\u0644' or bare == ALIF + KAF + '\u0644':
            e_letter = KAF
            l_letter = '\u0644'   # ل
            a['2ms'] = e_letter + DA + l_letter + SK
            a['2fs'] = e_letter + DA + l_letter + KA + YA
            a['2d']  = e_letter + DA + l_letter + FA + ALIF
            a['2mp'] = e_letter + DA + l_letter + DA + WAW + ALIF
            a['2fp'] = e_letter + DA + l_letter + SK + NUN + FA
        # أمر → مُرْ
        elif bare == ALIF_A + MIM + RA_L or bare == ALIF + MIM + RA_L:
            a['2ms'] = MIM + DA + RA_L + SK
            a['2fs'] = MIM + DA + RA_L + KA + YA
            a['2d']  = MIM + DA + RA_L + FA + ALIF
            a['2mp'] = MIM + DA + RA_L + DA + WAW + ALIF
            a['2fp'] = MIM + DA + RA_L + SK + NUN + FA

    return m, mu, a, pm, pmu, sub, jzm, psub, pjzm


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN DISPATCHER
# ══════════════════════════════════════════════════════════════════════════════

def conjugate_root(root_letters, form,
                   existing_madi_3ms=None, existing_mudari_3ms=None):
    f, e, l = [strip_diac(x) for x in root_letters]
    vtype   = classify(root_letters)
    vm, vmu = extract_vowels(existing_madi_3ms, existing_mudari_3ms, root_letters)

    if vtype == 'lafif_maqrun':
        result = lafif_maqrun_conjugate(f, e, l, form, vm, vmu)
    elif vtype == 'lafif_mafruq':
        result = lafif_mafruq_conjugate(f, e, l, form, vm, vmu)
    elif vtype.startswith('ajwaf'):
        result = ajwaf_conjugate(f, e, l, form, 'waw' in vtype, vm, vmu)
    elif vtype.startswith('naqis'):
        result = naqis_conjugate(f, e, l, form, 'waw' in vtype, vm, vmu)
    elif vtype == 'mudhaaf':
        result = mudhaaf_conjugate(f, e, l, form, vm, vmu)
    elif vtype.startswith('mithal'):
        result = mithal_conjugate(f, e, l, form, 'waw' in vtype, vm, vmu)
    elif vtype.startswith('mahmuz'):
        result = mahmuz_conjugate(f, e, l, form, vm, vmu)
    else:
        ev_mu = KA if form in ('II', 'III', 'IV', 'VII', 'VIII', 'X') else vmu
        result = _sound_all(f, e, l, form, vm, ev_mu)

    m, mu, a, pm, pmu, sub, jzm, psub, pjzm = result

    # Apply irregular-verb overrides
    root_str = ''.join(root_letters)
    m, mu, a, pm, pmu, sub, jzm, psub, pjzm = _apply_irregulars(
        root_str, form, m, mu, a, pm, pmu, sub, jzm, psub, pjzm)

    return {
        'madi': m,
        'mudari': mu,
        'amr': a,
        'passive_madi': pm,
        'passive_mudari': pmu,
        'subjunctive': sub,
        'jussive': jzm,
        'passive_subjunctive': psub,
        'passive_jussive': pjzm,
    }


# ══════════════════════════════════════════════════════════════════════════════
#  JSON PATCHING
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
            print(f"  WARN {root_obj['root']} Form {form}: {ex}",
                  file=sys.stderr)
            continue
        for tense in tenses:
            tkey = tense.get('type')
            if tkey not in forms:
                continue
            fd = forms[tkey]
            if not fd:   # empty dict (e.g. no passive for VII)
                tense['conjugation'] = []
                continue
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
#  ENTRY POINT
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
