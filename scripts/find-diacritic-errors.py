#!/usr/bin/env python3
"""
Statistical diacritic error detector for verbsData.json conjugation tables.

Key design decisions:
  - Roots are classified by verb type BEFORE grouping (sound / hollow /
    weak_final / doubled / doubly_weak / hamzated / other).
  - Outlier detection uses ABSOLUTE count (≤ MAX_OUTLIER_COUNT roots), not
    percentage. This avoids flagging morphological sub-groups (e.g. 5 وقي-type
    doubly-weak roots all sharing a contracted form) while still catching lone
    data-entry mistakes.
  - Majority must be very clear (≥ MAJORITY_THRESHOLD) and group large enough.
"""

import json
from collections import defaultdict, Counter

VERBS_FILE  = 'data/verbsData.json'
REPORT_FILE = 'scripts/diacritic_errors_report.txt'
JSON_FILE   = 'scripts/diacritic_errors.json'

MAJORITY_THRESHOLD = 0.85   # majority must hold ≥ 85% of the group
MAX_OUTLIER_COUNT  = 2      # flag only if ≤ 2 roots share the outlier pattern
MIN_GROUP_SIZE     = 8      # ignore tiny groups

DIACRITICS = set('\u064e\u064f\u0650\u0651\u0652\u0670\u064b\u064c\u064d\u0653')

DIAC_NAME = {
    '\u064e': 'fatha',    '\u064f': 'damma',    '\u0650': 'kasra',
    '\u0651': 'shadda',   '\u0652': 'sukun',    '\u0670': 'sup-alef',
    '\u064b': 'tanwin-f', '\u064c': 'tanwin-d', '\u064d': 'tanwin-k',
}

WEAK = {'و', 'ي', 'ا'}
HAMZA = {'ء', 'أ', 'إ', 'آ', 'ؤ', 'ئ'}

# ── Root classification ────────────────────────────────────────────────────────
def classify_root(root: str) -> str:
    if len(root) < 3:
        return 'other'
    r = list(root)
    initial_weak  = r[0] in WEAK
    middle_weak   = r[1] in WEAK
    final_weak    = r[-1] in WEAK
    doubled       = len(r) >= 3 and r[1] == r[2]

    if doubled:
        return 'doubled'
    # doubly-weak: any two of the three radicals are weak
    weak_count = sum([initial_weak, middle_weak, final_weak])
    if weak_count >= 2:
        return 'doubly_weak'
    if middle_weak:
        return 'hollow'
    if final_weak:
        return 'weak_final'
    if initial_weak:
        return 'initial_weak'
    if any(c in HAMZA for c in r):
        return 'hamzated'
    return 'sound'

def extract_diac_sig(arabic: str) -> str:
    return ''.join(c for c in arabic if c in DIACRITICS)

def sig_readable(sig: str) -> str:
    return '-'.join(DIAC_NAME.get(c, f'U+{ord(c):04X}') for c in sig) or '(none)'

# ── Load ───────────────────────────────────────────────────────────────────────
print("Loading verbsData.json...")
with open(VERBS_FILE, encoding='utf-8') as f:
    data = json.load(f)
roots_list = data['roots']
print(f"  {len(roots_list)} roots")

class_counts: Counter = Counter()
cell_data: dict[tuple, list] = defaultdict(list)

for root in roots_list:
    root_id    = root['id']
    verb_class = classify_root(root_id)
    class_counts[verb_class] += 1

    for bab in root.get('babs', []):
        baab_form = bab.get('form', '')
        for tense in bab.get('tenses', []):
            tense_type = tense.get('type', '')
            for cell in tense.get('conjugation', []):
                person = cell.get('person', '')
                arabic = cell.get('arabic', '').strip()
                if not arabic:
                    continue
                key = (verb_class, baab_form, tense_type, person)
                cell_data[key].append((arabic, root_id))

print("  Root classes:", dict(class_counts.most_common()))
print(f"  {len(cell_data)} unique (class, baab, tense, person) cells\n")

# ── Detect outliers ────────────────────────────────────────────────────────────
flagged = []

for (verb_class, baab, tense, person), entries in sorted(cell_data.items()):
    if len(entries) < MIN_GROUP_SIZE:
        continue

    sig_counter: Counter = Counter()
    sig_entries: dict[str, list] = {}
    for arabic, root_id in entries:
        sig = extract_diac_sig(arabic)
        sig_counter[sig] += 1
        sig_entries.setdefault(sig, []).append((arabic, root_id))

    total = len(entries)
    majority_sig, majority_count = sig_counter.most_common(1)[0]
    if majority_count / total < MAJORITY_THRESHOLD:
        continue   # no clear majority — legitimate morphological split

    for sig, count in sig_counter.items():
        if sig == majority_sig:
            continue
        # Only flag if a very small number of roots have this pattern
        if count <= MAX_OUTLIER_COUNT:
            for arabic, root_id in sig_entries[sig]:
                flagged.append({
                    'verb_class':        verb_class,
                    'baab':              baab,
                    'tense':             tense,
                    'person':            person,
                    'root':              root_id,
                    'arabic':            arabic,
                    'diac_sig':          sig,
                    'diac_readable':     sig_readable(sig),
                    'majority_sig':      majority_sig,
                    'majority_readable': sig_readable(majority_sig),
                    'majority_pct':      round(majority_count / total * 100, 1),
                    'outlier_count':     count,
                    'group_size':        total,
                    'majority_samples':  [a for a, _ in sig_entries[majority_sig][:5]],
                })

print(f"Flagged {len(flagged)} potential diacritic errors.\n")

# Sort by outlier_count ascending (singletons first — most suspicious)
flagged.sort(key=lambda x: (x['outlier_count'], x['verb_class'], x['baab'], x['tense'], x['person']))

# ── Save JSON ──────────────────────────────────────────────────────────────────
with open(JSON_FILE, 'w', encoding='utf-8') as f:
    json.dump({'flagged': flagged, 'total': len(flagged)}, f, ensure_ascii=False, indent=2)
print(f"Written: {JSON_FILE}")

# ── Build cell grouping ────────────────────────────────────────────────────────
by_cell: dict[tuple, list] = defaultdict(list)
for item in flagged:
    key = (item['verb_class'], item['baab'], item['tense'], item['person'])
    by_cell[key].append(item)

# ── Write report ───────────────────────────────────────────────────────────────
lines = [
    "=" * 80,
    "DIACRITIC ERROR REPORT — verbsData.json",
    f"Thresholds: majority≥{int(MAJORITY_THRESHOLD*100)}%  outlier≤{MAX_OUTLIER_COUNT} roots  group≥{MIN_GROUP_SIZE}",
    f"Total flagged forms : {len(flagged)}",
    f"Unique cells flagged: {len(by_cell)}",
    "=" * 80, "",
]

for (verb_class, baab, tense, person), items in sorted(
        by_cell.items(), key=lambda kv: (kv[1][0]['outlier_count'], kv[0])):
    i0 = items[0]
    lines.append(
        f"▶ [{verb_class}] Baab {baab} | {tense} | {person}  "
        f"[group={i0['group_size']}, majority={i0['majority_pct']}% → {i0['majority_readable']}]"
    )
    lines.append(f"  Majority samples: {' / '.join(i0['majority_samples'])}")
    lines.append(f"  Outliers ({len(items)}):")
    for item in items:
        lines.append(
            f"    ROOT {item['root']:12}  {item['arabic']}  "
            f"[{item['diac_readable']}]  (n={item['outlier_count']})"
        )
    lines.append("")

with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print(f"Written: {REPORT_FILE}")

# ── Terminal output ────────────────────────────────────────────────────────────
CYAN  = "\033[96m"; YELLOW = "\033[93m"; GREEN = "\033[92m"
DIM   = "\033[2m";  BOLD   = "\033[1m";  RESET = "\033[0m"

print(f"\n{BOLD}{CYAN}{'─'*70}{RESET}")
print(f"{BOLD}{CYAN}  FLAGGED CELLS — singletons first (most suspicious){RESET}")
print(f"{BOLD}{CYAN}{'─'*70}{RESET}\n")

shown = 0
for (verb_class, baab, tense, person), items in sorted(
        by_cell.items(), key=lambda kv: (kv[1][0]['outlier_count'], kv[0])):
    if shown >= 50:
        break
    i0 = items[0]
    print(f"{BOLD}[{verb_class}] Baab {baab} | {tense} | {person}{RESET}  "
          f"{DIM}group={i0['group_size']}  majority={i0['majority_pct']}%{RESET}")
    print(f"  {DIM}expected: {i0['majority_readable']}{RESET}")
    print(f"  {DIM}samples:  {' / '.join(i0['majority_samples'])}{RESET}")
    for item in items:
        print(f"  {YELLOW}ROOT {item['root']:12}{RESET}  "
              f"{GREEN}{item['arabic']}{RESET}  "
              f"{DIM}→ {item['diac_readable']} (n={item['outlier_count']}){RESET}")
    print()
    shown += 1

remaining = len(by_cell) - shown
if remaining > 0:
    print(f"{DIM}... {remaining} more cells in {REPORT_FILE}{RESET}\n")

print(f"{BOLD}Total flagged forms : {len(flagged)}{RESET}")
print(f"{BOLD}Unique cells flagged: {len(by_cell)}{RESET}")
print(f"\nFull report → {REPORT_FILE}")
print(f"Machine JSON → {JSON_FILE}\n")
