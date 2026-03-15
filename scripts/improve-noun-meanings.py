#!/usr/bin/env python3
"""
Improve noun meanings in nounsData.json using Claude Opus.

Usage:
    python3 scripts/improve-noun-meanings.py <ANTHROPIC_API_KEY>
    or set ANTHROPIC_API_KEY env var and run without argument.

Shows every change live in terminal. Saves progress after each batch
so you can safely interrupt and resume.
"""

import json, sys, os, time
from anthropic import Anthropic

# ── Config ────────────────────────────────────────────────────────────────────
MODEL      = "claude-opus-4-6"
BATCH_SIZE = 50
NOUNS_FILE = "public/data/nounsData.json"

SYSTEM_PROMPT = """You are an expert in Quranic Arabic, classical Arabic lexicography, and Islamic theology.

Your task: given a list of Quranic nominal forms (nouns, adjectives, active participles, passive participles, masadars), provide a precise dictionary-style meaning for each one AS USED IN THE QURAN.

Rules:
- Reflect the Quranic usage specifically — not generic modern Arabic
- 2–8 words for most entries; up to 15 for theologically rich terms
- Dictionary form: noun/adjective phrases, not full sentences
- For active participles: use "one who [verb]s" or "[verb]ing one"
- For passive participles: use "one who is [verb]ed" or "[verb]ed"
- For masadars: use a gerund or abstract noun form
- For theologically significant terms (نفس، روح، فتنة، صراط، خشوع، etc.) capture the Quranic depth
- Do NOT just copy the existing meaning — improve it if it can be better
- Return ONLY valid JSON: an array of {"id": "...", "meaning": "..."} objects, same order as input"""

# ── Colors for terminal ───────────────────────────────────────────────────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
DIM    = "\033[2m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def print_header(text):
    print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}")
    print(f"{BOLD}{CYAN}  {text}{RESET}")
    print(f"{BOLD}{CYAN}{'─'*60}{RESET}\n")

def print_change(noun, old, new):
    label = f"[{noun['typeAr']}]" + (f" باب {noun['baab']}" if noun['baab'] else "")
    print(f"  {BOLD}{noun['lemma']:20}{RESET} {DIM}{label}{RESET}")
    print(f"    {DIM}before:{RESET} {YELLOW}{old}{RESET}")
    print(f"    {DIM}after: {RESET} {GREEN}{new}{RESET}")

def print_kept(noun):
    print(f"  {DIM}  {noun['lemma']:20} ✓  {noun['meaning']}{RESET}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    # API key
    api_key = None
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    else:
        api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("Usage: python3 scripts/improve-noun-meanings.py <ANTHROPIC_API_KEY>")
        print("  or:  ANTHROPIC_API_KEY=sk-... python3 scripts/improve-noun-meanings.py")
        sys.exit(1)

    client = Anthropic(api_key=api_key)

    # Load nouns
    with open(NOUNS_FILE, encoding='utf-8') as f:
        data = json.load(f)
    nouns = data['nouns']

    print_header(f"Improving {len(nouns)} noun meanings with {MODEL}")
    print(f"  Batch size : {BATCH_SIZE}")
    print(f"  Total batches: {(len(nouns) + BATCH_SIZE - 1) // BATCH_SIZE}")
    print(f"  File: {NOUNS_FILE}\n")

    total_changed = 0
    total_kept    = 0
    total_cost_in = 0
    total_cost_out= 0

    # Process in batches
    for batch_start in range(0, len(nouns), BATCH_SIZE):
        batch = nouns[batch_start : batch_start + BATCH_SIZE]
        batch_num = batch_start // BATCH_SIZE + 1
        total_batches = (len(nouns) + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"{BOLD}Batch {batch_num}/{total_batches}{RESET}  "
              f"{DIM}(nouns {batch_start+1}–{min(batch_start+BATCH_SIZE, len(nouns))}){RESET}")

        # Build input payload
        payload = []
        for n in batch:
            payload.append({
                "id":      n["lemmaClean"],
                "lemma":   n["lemma"],
                "root":    n["root"],
                "type":    n["typeAr"],
                "baab":    n["baab"],
                "current": n["meaning"],
                "refs":    n["references"][:3],
            })

        user_msg = f"Improve these {len(batch)} Quranic noun meanings:\n\n{json.dumps(payload, ensure_ascii=False, indent=2)}"

        # Call API with retry
        for attempt in range(3):
            try:
                response = client.messages.create(
                    model=MODEL,
                    max_tokens=2000,
                    system=SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_msg}],
                )
                break
            except Exception as e:
                if attempt == 2:
                    print(f"  {YELLOW}⚠ API error after 3 attempts: {e}{RESET}")
                    response = None
                    break
                print(f"  {YELLOW}Retry {attempt+1}/3: {e}{RESET}")
                time.sleep(3)

        if response is None:
            print(f"  {YELLOW}Skipping batch {batch_num}{RESET}\n")
            continue

        # Track token usage
        usage = response.usage
        cost_in  = usage.input_tokens  * 15 / 1_000_000
        cost_out = usage.output_tokens * 75 / 1_000_000
        total_cost_in  += cost_in
        total_cost_out += cost_out

        print(f"  {DIM}tokens: {usage.input_tokens} in / {usage.output_tokens} out  "
              f"cost: ${cost_in + cost_out:.4f}{RESET}")

        # Parse response
        raw = response.content[0].text.strip()
        # Extract JSON array from response (model might add prose)
        import re
        json_match = re.search(r'\[.*\]', raw, re.DOTALL)
        if not json_match:
            print(f"  {YELLOW}⚠ Could not parse JSON from response{RESET}")
            print(f"  {DIM}{raw[:200]}{RESET}\n")
            continue

        try:
            results = json.loads(json_match.group())
        except json.JSONDecodeError as e:
            print(f"  {YELLOW}⚠ JSON decode error: {e}{RESET}\n")
            continue

        # Build lookup by id
        result_map = {r['id']: r['meaning'] for r in results if 'id' in r and 'meaning' in r}

        # Apply and display
        batch_changed = 0
        batch_kept    = 0
        for noun in batch:
            new_meaning = result_map.get(noun['lemmaClean'], '').strip()
            if not new_meaning:
                print_kept(noun)
                batch_kept += 1
                continue

            old_meaning = noun['meaning']
            if new_meaning.lower() != old_meaning.lower():
                print_change(noun, old_meaning, new_meaning)
                noun['meaning'] = new_meaning
                batch_changed += 1
            else:
                print_kept(noun)
                batch_kept += 1

        total_changed += batch_changed
        total_kept    += batch_kept
        print(f"\n  {GREEN}changed: {batch_changed}{RESET}  {DIM}kept: {batch_kept}{RESET}\n")

        # Save after every batch (safe to interrupt)
        with open(NOUNS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # Small pause between batches
        if batch_start + BATCH_SIZE < len(nouns):
            time.sleep(0.5)

    # Final summary
    total_cost = total_cost_in + total_cost_out
    print_header("Complete")
    print(f"  {GREEN}Total changed : {total_changed}{RESET}")
    print(f"  {DIM}Total kept    : {total_kept}{RESET}")
    print(f"  Input tokens  : {total_cost_in  / (15/1_000_000):,.0f}  (${total_cost_in:.4f})")
    print(f"  Output tokens : {total_cost_out / (75/1_000_000):,.0f}  (${total_cost_out:.4f})")
    print(f"  {BOLD}Total cost    : ${total_cost:.4f}{RESET}")
    print(f"\n  Saved to {NOUNS_FILE}\n")

if __name__ == "__main__":
    main()
