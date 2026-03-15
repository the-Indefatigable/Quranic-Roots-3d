#!/usr/bin/env python3
"""
Parse Quranic Arabic Corpus morphology file (v0.4) and extract all verbs.
Outputs clean JSON grouped by root → bab (form) → tense → conjugations.

Usage: python3 parse_corpus.py quranic-corpus-morphology-0.4.txt
"""
import sys
import json
import re
from collections import defaultdict

# ── Buckwalter → Arabic Unicode ──────────────────────────────────────────────
BW = {
    "'": '\u0621', '|': '\u0622', '>': '\u0623', '&': '\u0624', '<': '\u0625',
    '}': '\u0626', 'A': '\u0627', 'b': '\u0628', 't': '\u062a', 'v': '\u062b',
    'j': '\u062c', 'H': '\u062d', 'x': '\u062e', 'd': '\u062f', '*': '\u0630',
    'r': '\u0631', 'z': '\u0632', 's': '\u0633', '$': '\u0634', 'S': '\u0635',
    'D': '\u0636', 'T': '\u0637', 'Z': '\u0638', 'E': '\u0639', 'g': '\u063a',
    'f': '\u0641', 'q': '\u0642', 'k': '\u0643', 'l': '\u0644', 'm': '\u0645',
    'n': '\u0646', 'h': '\u0647', 'w': '\u0648', 'Y': '\u0649', 'y': '\u064a',
    'F': '\u064b', 'N': '\u064c', 'K': '\u064d', 'a': '\u064e', 'u': '\u064f',
    'i': '\u0650', '~': '\u0651', 'o': '\u0652', 'p': '\u0629', 'P': '\u0629',
    '{': '\u0671', 'e': '\u0649',
}

def bw2ar(text):
    return ''.join(BW.get(c, c) for c in text)

def strip_diacritics(text):
    diac = set('\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652\u0653\u0654\u0655')
    return ''.join(c for c in text if c not in diac)

# ── Arabic verb form patterns ─────────────────────────────────────────────────
BAB_PATTERNS = {
    'I':    {'ar': '\u0641\u064e\u0639\u064e\u0644\u064e',                                   'en': 'Base form'},
    'II':   {'ar': '\u0641\u064e\u0639\u0651\u064e\u0644\u064e',                             'en': 'Intensive / causative'},
    'III':  {'ar': '\u0641\u064e\u0627\u0639\u064e\u0644\u064e',                             'en': 'Reciprocal / associative'},
    'IV':   {'ar': '\u0623\u064e\u0641\u0652\u0639\u064e\u0644\u064e',                       'en': 'Causative'},
    'V':    {'ar': '\u062a\u064e\u0641\u064e\u0639\u0651\u064e\u0644\u064e',                 'en': 'Reflexive of Form II'},
    'VI':   {'ar': '\u062a\u064e\u0641\u064e\u0627\u0639\u064e\u0644\u064e',                 'en': 'Reflexive of Form III'},
    'VII':  {'ar': '\u0627\u0650\u0646\u0652\u0641\u064e\u0639\u064e\u0644\u064e',           'en': 'Passive / intransitive'},
    'VIII': {'ar': '\u0627\u0650\u0641\u0652\u062a\u064e\u0639\u064e\u0644\u064e',           'en': 'Reflexive / middle'},
    'IX':   {'ar': '\u0627\u0650\u0641\u0652\u0639\u064e\u0644\u0651\u064e',                 'en': 'Colors and defects'},
    'X':    {'ar': '\u0627\u0650\u0633\u0652\u062a\u064e\u0641\u0652\u0639\u064e\u0644\u064e','en': 'Seeking / considering'},
}

TENSE_META = {
    'madi':           {'ar': '\u0645\u064e\u0627\u0636\u0650\u064a',                                    'en': 'Past (M\u0101\u1e0d\u012b)',           'color': '#ffd700'},
    'mudari':         {'ar': '\u0645\u064f\u0636\u064e\u0627\u0631\u0650\u0639',                        'en': 'Present (Mu\u1e0d\u0101ri\u02bf)',       'color': '#00d4ff'},
    'amr':            {'ar': '\u0623\u064e\u0645\u0652\u0631',                                          'en': 'Imperative (Amr)',                      'color': '#ff6b6b'},
    'passive_madi':   {'ar': '\u0645\u064e\u062c\u0652\u0647\u064f\u0648\u0644 \u0645\u064e\u0627\u0636\u0650\u064a',  'en': 'Passive Past',   'color': '#c084fc'},
    'passive_mudari': {'ar': '\u0645\u064e\u062c\u0652\u0647\u064f\u0648\u0644 \u0645\u064f\u0636\u064e\u0627\u0631\u0650\u0639','en': 'Passive Present','color': '#86efac'},
}

BAB_COLORS = {
    'I':'#4a9eff','II':'#f97316','III':'#a855f7','IV':'#22c55e',
    'V':'#ec4899','VI':'#14b8a6','VII':'#f59e0b','VIII':'#64748b',
    'IX':'#ef4444','X':'#8b5cf6',
}

PERSON_ORDER = ['3MS','3FS','3MD','3FD','3MP','3FP','2MS','2FS','2D','2MP','2FP','1S','1P']

PERSON_LABELS = {
    '1S':  {'code': '1s',  'en': '1st singular'},
    '2MS': {'code': '2ms', 'en': '2nd masc. sg'},
    '2FS': {'code': '2fs', 'en': '2nd fem. sg'},
    '3MS': {'code': '3ms', 'en': '3rd masc. sg'},
    '3FS': {'code': '3fs', 'en': '3rd fem. sg'},
    '1P':  {'code': '1p',  'en': '1st plural'},
    '2MP': {'code': '2mp', 'en': '2nd masc. pl'},
    '2FP': {'code': '2fp', 'en': '2nd fem. pl'},
    '3MP': {'code': '3mp', 'en': '3rd masc. pl'},
    '3FP': {'code': '3fp', 'en': '3rd fem. pl'},
    '2D':  {'code': '2d',  'en': '2nd dual'},
    '3MD': {'code': '3md', 'en': '3rd masc. dual'},
    '3FD': {'code': '3fd', 'en': '3rd fem. dual'},
}

ROOT_MEANINGS = {
    'Ebd':'to worship','Ewn':'to help','hdy':'to guide','nEm':'to bless',
    'Amn':'to believe/be safe','qwm':'to rise/stand','rzq':'to provide',
    'nfq':'to spend','nzl':'to send down/descend','yqn':'to be certain',
    'kfr':'to disbelieve','n*r':'to warn','xtm':'to seal','qwl':'to say',
    'xdE':'to deceive','ktb':'to write','Elm':'to know','Dhb':'to go',
    'slm':'to submit/be safe','rHm':'to have mercy','Hmd':'to praise',
    'rbb':'to be lord','smw':'to be high/name','fEl':'to do',
    'jEl':'to make/place','rjE':'to return','xrj':'to exit','dxl':'to enter',
    'HkA':'to tell','qrA':'to read/recite','smE':'to hear','bSr':'to see',
    'fkr':'to think','Eql':'to reason','Hll':'to be lawful','Hrm':'to forbid',
    'wjd':'to find','wjb':'to be necessary','wqE':'to fall/occur',
    'wqy':'to protect','wly':'to be a guardian/turn to','Hfz':'to preserve/guard',
    'Hqq':'to be true/right','Amr':'to command','>mr':'to command',
    'nhY':'to forbid','bEv':'to send/resurrect','bEd':'to be far',
    'qrb':'to be near','tmm':'to complete','byn':'to be clear',
    'Erf':'to know/recognise','ElA':'to be high','ftH':'to open/conquer',
    'Hkm':'to judge/rule','Hsb':'to reckon/account','zyd':'to increase',
    'Hml':'to carry/bear','trk':'to leave','qtl':'to kill','mwt':'to die',
    'Hyy':'to live','blg':'to reach/convey','Eml':'to work/do',
    'fwz':'to succeed','Gfr':'to forgive','twb':'to repent',
    'sbH':'to glorify','$kr':'to be grateful','sbr':'to be patient',
    'Dll':'to go astray','rwH':'to go/depart','wHy':'to reveal/inspire',
    'HsA':'to count','xlS':'to be saved/pure','njw':'to save',
    'Edb':'to punish','wEd':'to promise/threaten','frd':'to be alone/specify',
    'jHd':'to strive','jAh':'to strive','jhd':'to strive',
    'nSr':'to help/give victory','Hbb':'to love','kll':'to be whole',
    'bdA':'to begin','bdl':'to change/exchange','TlA':'to rise',
    'nfr':'to go forth','bdr':'to hasten','slk':'to walk/follow a path',
    'Smr':'to be determined','Hsr':'to gather/regret','wrv':'to inherit',
    'wrt':'to inherit','zll':'to slip/err','Dlm':'to oppress/wrong',
    'frr':'to flee','Amn':'to believe','Hyy':'to live','zAd':'to increase',
}

def parse_features(feat_str):
    result = {'pos': None, 'tense': None, 'form': 'I', 'lem': None,
              'root': None, 'person': None, 'passive': False}
    parts = feat_str.split('|')
    for p in parts:
        if p.startswith('POS:'):
            result['pos'] = p[4:]
        elif p in ('PERF', 'IMPF', 'IMPV'):
            result['tense'] = p
        elif re.match(r'^\(([IVX]+)\)$', p):
            result['form'] = re.match(r'^\(([IVX]+)\)$', p).group(1)
        elif p.startswith('LEM:'):
            result['lem'] = p[4:]
        elif p.startswith('ROOT:'):
            result['root'] = p[5:]
        elif p == 'PASS':
            result['passive'] = True
        elif p in PERSON_LABELS:
            result['person'] = p
    return result

def main():
    filename = sys.argv[1] if len(sys.argv) > 1 else 'quranic-corpus-morphology-0.4.txt'

    # data[root_bw][bab_form][tense_key] = {forms: {person: arabic}, refs: set, count: int}
    data = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: {
        'forms': {},   # person -> arabic text
        'refs': set(),
        'count': 0,
    })))

    loc_re = re.compile(r'\((\d+):(\d+):')

    with open(filename, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or line.startswith('LOCATION'):
                continue

            cols = line.split('\t')
            if len(cols) < 4:
                continue

            location, form_bw, tag, features_str = cols[0], cols[1], cols[2], cols[3]
            feats = parse_features(features_str)

            if feats['pos'] != 'V' or not feats['root'] or not feats['tense']:
                continue

            root_bw = feats['root']
            bab     = feats['form']
            passive = feats['passive']
            tense   = feats['tense']
            person  = feats['person'] or '3MS'

            if passive:
                tense_key = 'passive_madi' if tense == 'PERF' else 'passive_mudari'
            else:
                tense_key = {'PERF': 'madi', 'IMPF': 'mudari', 'IMPV': 'amr'}[tense]

            m = loc_re.match(location)
            ref = f"{m.group(1)}:{m.group(2)}" if m else ''

            entry = data[root_bw][bab][tense_key]
            entry['count'] += 1
            if ref:
                entry['refs'].add(ref)
            if person not in entry['forms']:
                entry['forms'][person] = bw2ar(form_bw)

    # ── Build output ─────────────────────────────────────────────────────────
    roots_out = []

    for root_bw, babs_data in sorted(data.items(),
            key=lambda x: -sum(t['count'] for bab in x[1].values() for t in bab.values())):

        root_ar = strip_diacritics(bw2ar(root_bw))
        if len(root_ar) < 2:
            continue

        babs_out = []
        for bab_form in sorted(babs_data.keys(),
                key=lambda f: ['I','II','III','IV','V','VI','VII','VIII','IX','X'].index(f)
                              if f in ['I','II','III','IV','V','VI','VII','VIII','IX','X'] else 99):

            bab_info = BAB_PATTERNS.get(bab_form, {'ar': f'Form {bab_form}', 'en': ''})
            tenses_out = []

            for tense_key in ['madi','mudari','amr','passive_madi','passive_mudari']:
                if tense_key not in babs_data[bab_form]:
                    continue
                tense_data = babs_data[bab_form][tense_key]
                tmeta = TENSE_META[tense_key]

                conjugations = []
                for person_key in PERSON_ORDER:
                    if person_key not in tense_data['forms']:
                        continue
                    pl = PERSON_LABELS.get(person_key, {'code': person_key.lower(), 'en': person_key})
                    conjugations.append({
                        'person': pl['code'],
                        'arabic': tense_data['forms'][person_key],
                        'transliteration': '',
                        'english': pl['en'],
                    })

                tenses_out.append({
                    'id': f"{root_ar}_{bab_form}_{tense_key}",
                    'type': tense_key,
                    'arabicName': tmeta['ar'],
                    'englishName': tmeta['en'],
                    'color': tmeta['color'],
                    'occurrences': tense_data['count'],
                    'references': sorted(tense_data['refs'])[:8],
                    'conjugation': conjugations,
                })

            if not tenses_out:
                continue

            babs_out.append({
                'id': f"{root_ar}_{bab_form}",
                'form': bab_form,
                'arabicPattern': bab_info['ar'],
                'romanNumeral': bab_form,
                'meaning': bab_info['en'],
                'color': BAB_COLORS.get(bab_form, '#4a9eff'),
                'tenses': tenses_out,
            })

        if not babs_out:
            continue

        roots_out.append({
            'id': root_ar,
            'root': root_ar,
            'rootLetters': list(root_ar),
            'meaning': ROOT_MEANINGS.get(root_bw, root_bw),
            'babs': babs_out,
        })

    print(json.dumps({'roots': roots_out}, ensure_ascii=False, indent=2))
    print(f"# Total roots extracted: {len(roots_out)}", file=sys.stderr)

if __name__ == '__main__':
    main()
