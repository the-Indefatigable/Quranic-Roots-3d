#!/usr/bin/env python3
"""
Fix diacritic errors in verbsData.json using Claude Opus.

Reads diacritic_errors.json (output of find-diacritic-errors.py),
sends each flagged form to Opus for verification and correction,
then applies confirmed fixes to verbsData.json.

Usage:
    python3 scripts/fix-diacritic-errors.py <ANTHROPIC_API_KEY>
    or set ANTHROPIC_API_KEY env var and run without argument.

A timestamped backup is created before any changes are written.
"""

import json, sys, os, time, shutil
from datetime import datetime
from anthropic import Anthropic

MODEL      = "claude-opus-4-6"
BATCH_SIZE = 30
ERRORS_FILE = "scripts/diacritic_errors.json"
VERBS_FILE  = "data/verbsData.json"
LOG_FILE    = "scripts/fix-diacritic-errors.log"

SYSTEM_PROMPT = """You are an expert in classical Arabic morphology and Quranic Arabic conjugation.

Your task: review Arabic verb conjugation forms that have been statistically flagged as potential diacritic errors, and decide whether each is correct or incorrect.

For each flagged form you receive:
- root: the trilateral root
- baab: the verb form class (I–X)
- tense: madi / mudari / amr / passive_madi / passive_mudari
- person: 3ms, 3fs, 3mp, 3fp, 2ms, 2fs, 2mp, 2fp, 1s, 1p, etc.
- arabic: the flagged Arabic form (possibly wrong diacritics)
- majority_readable: the diacritic pattern shared by 85%+ of similar verbs
- majority_samples: example correct forms from the same cell

Rules:
- Apply classical Arabic morphology rules strictly
- If the form is correct as-is (e.g. an irregular or doubly-weak root that has a legitimately different pattern), return it unchanged
- If the form has wrong diacritics, return the corrected Arabic with proper diacritics
- Keep the consonants exactly as they are — only fix diacritics
- Return ONLY valid JSON: an array of {"id": "...", "correct": true/false, "arabic": "..."} objects
  - id: the id field from input (root|baab|tense|person)
  - correct: true if form is fine as-is, false if you changed it
  - arabic: the correct Arabic form (same as input if correct: true)"""

# ── Colors ─────────────────────────────────────────────────────────────────────
GREEN  = "\033[92m"; YELLOW = "\033[93m"; RED  = "\033[91m"
CYAN   = "\033[96m"; DIM    = "\033[2m";  BOLD = "\033[1m"; RESET = "\033[0m"

def print_header(text):
    print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}")
    print(f"{BOLD}{CYAN}  {text}{RESET}")
    print(f"{BOLD}{CYAN}{'─'*60}{RESET}\n")

# ── API key ────────────────────────────────────────────────────────────────────
api_key = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    print("Usage: python3 scripts/fix-diacritic-errors.py <ANTHROPIC_API_KEY>")
    sys.exit(1)

client = Anthropic(api_key=api_key)

# ── Load flagged errors ────────────────────────────────────────────────────────
with open(ERRORS_FILE, encoding='utf-8') as f:
    errors_data = json.load(f)
flagged = errors_data['flagged']

print_header(f"Fixing {len(flagged)} flagged forms with {MODEL}")
print(f"  Errors file : {ERRORS_FILE}")
print(f"  Verbs file  : {VERBS_FILE}")
print(f"  Batch size  : {BATCH_SIZE}")
print(f"  Total batches: {(len(flagged) + BATCH_SIZE - 1) // BATCH_SIZE}\n")

# ── Build verbsData lookup: (root_id, baab_form, tense_type, person) → cell ref ──
print("Loading verbsData.json...")
with open(VERBS_FILE, encoding='utf-8') as f:
    vdata = json.load(f)

# Build index: (root_id, baab_form, tense_type, person) → cell dict (mutable ref)
cell_index: dict[tuple, dict] = {}
for root in vdata['roots']:
    root_id = root['id']
    for bab in root.get('babs', []):
        baab_form = bab.get('form', '')
        for tense in bab.get('tenses', []):
            tense_type = tense.get('type', '')
            for cell in tense.get('conjugation', []):
                person = cell.get('person', '')
                key = (root_id, baab_form, tense_type, person)
                cell_index[key] = cell

print(f"  {len(cell_index):,} conjugation cells indexed.\n")

# ── Process in batches ─────────────────────────────────────────────────────────
total_fixed = 0
total_correct = 0
total_cost_in = 0.0
total_cost_out = 0.0
log_lines = [f"Fix run: {datetime.now().isoformat()}", ""]

backup_done = False

for batch_start in range(0, len(flagged), BATCH_SIZE):
    batch = flagged[batch_start: batch_start + BATCH_SIZE]
    batch_num = batch_start // BATCH_SIZE + 1
    total_batches = (len(flagged) + BATCH_SIZE - 1) // BATCH_SIZE

    print(f"{BOLD}Batch {batch_num}/{total_batches}{RESET}  "
          f"{DIM}(forms {batch_start+1}–{min(batch_start+BATCH_SIZE, len(flagged))}){RESET}")

    # Build payload for Opus
    payload = []
    for item in batch:
        uid = f"{item['root']}|{item['baab']}|{item['tense']}|{item['person']}"
        payload.append({
            "id":               uid,
            "root":             item['root'],
            "baab":             item['baab'],
            "tense":            item['tense'],
            "person":           item['person'],
            "arabic":           item['arabic'],
            "diac_pattern":     item['diac_readable'],
            "majority_pattern": item['majority_readable'],
            "majority_samples": item['majority_samples'],
        })

    user_msg = (
        f"Review these {len(batch)} flagged Arabic conjugation forms.\n"
        f"For each: is the diacritic pattern correct for this root/baab/tense/person? "
        f"If not, provide the corrected form.\n\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )

    # Call Opus with retry
    response = None
    for attempt in range(3):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=4000,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_msg}],
            )
            break
        except Exception as e:
            if attempt == 2:
                print(f"  {RED}⚠ API error after 3 attempts: {e}{RESET}")
                break
            print(f"  {YELLOW}Retry {attempt+1}/3: {e}{RESET}")
            time.sleep(4)

    if response is None:
        print(f"  {YELLOW}Skipping batch {batch_num}{RESET}\n")
        continue

    # Track cost (Opus: $15/M input, $75/M output)
    usage = response.usage
    cost = usage.input_tokens * 15 / 1_000_000 + usage.output_tokens * 75 / 1_000_000
    total_cost_in  += usage.input_tokens  * 15 / 1_000_000
    total_cost_out += usage.output_tokens * 75 / 1_000_000
    print(f"  {DIM}tokens: {usage.input_tokens} in / {usage.output_tokens} out  cost: ${cost:.4f}{RESET}")

    # Parse response
    import re
    raw = response.content[0].text.strip()
    json_match = re.search(r'\[.*\]', raw, re.DOTALL)
    if not json_match:
        print(f"  {YELLOW}⚠ Could not parse JSON from response{RESET}")
        print(f"  {DIM}{raw[:300]}{RESET}\n")
        continue

    try:
        results = json.loads(json_match.group())
    except json.JSONDecodeError as e:
        print(f"  {YELLOW}⚠ JSON decode error: {e}{RESET}\n")
        continue

    # Build lookup by id
    result_map = {r['id']: r for r in results if 'id' in r}

    # Apply fixes
    batch_fixed = 0
    batch_correct = 0

    for item in batch:
        uid = f"{item['root']}|{item['baab']}|{item['tense']}|{item['person']}"
        result = result_map.get(uid)
        if not result:
            print(f"  {DIM}  {item['root']:12} {item['person']} — no response{RESET}")
            continue

        is_correct = result.get('correct', True)
        new_arabic  = result.get('arabic', item['arabic']).strip()

        if is_correct or new_arabic == item['arabic']:
            print(f"  {DIM}✓ {item['root']:12} {item['baab']:3} {item['tense']:15} {item['person']:4}  {item['arabic']}{RESET}")
            batch_correct += 1
            log_lines.append(f"OK    {uid}  {item['arabic']}")
            continue

        # Apply fix to verbsData
        key = (item['root'], item['baab'], item['tense'], item['person'])
        cell = cell_index.get(key)

        if cell is None:
            print(f"  {YELLOW}⚠ Could not find cell in verbsData: {uid}{RESET}")
            log_lines.append(f"MISS  {uid}  (cell not found)")
            continue

        # Backup before first write
        if not backup_done:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"{VERBS_FILE}.backup_{ts}"
            shutil.copy2(VERBS_FILE, backup_path)
            print(f"\n  {CYAN}Backup created: {backup_path}{RESET}\n")
            backup_done = True

        old_arabic = cell['arabic']
        cell['arabic'] = new_arabic
        batch_fixed += 1
        total_fixed += 1

        print(f"  {YELLOW}✗ {item['root']:12} {item['baab']:3} {item['tense']:15} {item['person']:4}{RESET}  "
              f"{RED}{old_arabic}{RESET} → {GREEN}{new_arabic}{RESET}")
        log_lines.append(f"FIX   {uid}  {old_arabic} → {new_arabic}")

    total_correct += batch_correct
    print(f"\n  {GREEN}fixed: {batch_fixed}{RESET}  {DIM}correct: {batch_correct}{RESET}\n")

    # Save after every batch
    if backup_done:
        with open(VERBS_FILE, 'w', encoding='utf-8') as f:
            json.dump(vdata, f, ensure_ascii=False, indent=2)

    if batch_start + BATCH_SIZE < len(flagged):
        time.sleep(0.5)

# ── Final ──────────────────────────────────────────────────────────────────────
total_cost = total_cost_in + total_cost_out
log_lines += [
    "",
    f"Total fixed  : {total_fixed}",
    f"Total correct: {total_correct}",
    f"Total cost   : ${total_cost:.4f}",
]
with open(LOG_FILE, 'w', encoding='utf-8') as f:
    f.write('\n'.join(log_lines))

print_header("Complete")
print(f"  {GREEN}Forms fixed    : {total_fixed}{RESET}")
print(f"  {DIM}Already correct: {total_correct}{RESET}")
print(f"  Input tokens  : {total_cost_in  / (15/1_000_000):,.0f}  (${total_cost_in:.4f})")
print(f"  Output tokens : {total_cost_out / (75/1_000_000):,.0f}  (${total_cost_out:.4f})")
print(f"  {BOLD}Total cost    : ${total_cost:.4f}{RESET}")
print(f"\n  verbsData.json updated → run: npm run generate-data")
print(f"  Log: {LOG_FILE}\n")
