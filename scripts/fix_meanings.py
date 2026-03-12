"""
Fix root meanings and generate specific bab verb meanings using Claude API.
Run: python3 scripts/fix_meanings.py
Requires: ANTHROPIC_API_KEY env var
"""

import json
import os
import time
import sys
from pathlib import Path

import anthropic

DATA_PATH = Path(__file__).parent.parent / "public" / "data" / "verbsData.json"
BATCH_SIZE = 10  # roots per API call

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def looks_bad(meaning: str) -> bool:
    """Detect transliterated or obviously wrong meanings."""
    if not meaning or len(meaning.strip()) == 0:
        return True
    m = meaning.lower().strip()
    # Remove "to " prefix for analysis
    core = m.removeprefix("to ").strip()
    # If core is a single word that looks like a transliteration (no real English meaning)
    bad_signals = [
        len(core.split()) == 1 and len(core) <= 4 and core.isalpha(),  # short single word
        core in {"sayh", "jia", "shea", "rod", "boa", "zako", "neil", "basl",
                 "being", "came", "msds", "gurrr", "nbz", "sjr", "sabo", "atto",
                 "arw", "dso", "msu", "lvo", "hafo", "sagho", "sjoo", "dahu",
                 "tahu", "otho", "fazo", "hout", "qadda", "nazzg", "zjo", "asho",
                 "waka", "fazz", "safwa", "mona", "aso", "noob", "dom", "cor",
                 "sam", "ken", "sol", "sram", "cbcb", "cbb", "nx", "rex", "bor",
                 "lafs", "haig", "mer", "fata", "boa", "yum", "ren", "mello",
                 "glo", "nbat", "ism", "sjoo", "psst", "tahu", "watta", "gus",
                 "ptk", "lvf", "sjr", "dso", "msu", "bahl", "dhak", "dhaha",
                 "sfg", "spg", "arw", "msr", "dur"},
        # Looks like it just echoes the Arabic transliteration
        any(core.startswith(x) for x in ["say", "jia", "shea"]) and len(core) <= 6,
    ]
    return any(bad_signals)


def fix_batch(roots_batch: list) -> dict:
    """
    Given a list of root dicts, return a mapping of root_id -> {
        "rootMeaning": str,
        "babs": { bab_id: { "verbMeaning": str } }
    }
    """
    # Build prompt
    roots_info = []
    for r in roots_batch:
        bab_list = []
        for b in r["babs"]:
            bab_list.append({
                "id": b["id"],
                "form": b["romanNumeral"],
                "arabicPattern": b["arabicPattern"],
                "formMeaning": b.get("semanticMeaning") or b.get("meaning") or "",
            })
        roots_info.append({
            "id": r["id"],
            "root": r["root"],
            "currentMeaning": r["meaning"],
            "babs": bab_list,
        })

    prompt = f"""You are an expert in Arabic linguistics, specifically Quranic Arabic verb forms (أبواب الفعل).

I will give you a list of Arabic verb roots. For each root:
1. Provide the correct short English meaning for the root itself (2-5 words, starting with "to"). Fix any wrong/transliterated meanings.
2. For each bab (verb form/pattern) of that root, provide a SHORT specific English phrase (3-7 words) that captures what THIS verb actually means in THAT form — combining the root meaning with the form's semantic effect.

Examples of good bab verb meanings:
- Root "to know" Form I → "to know, to be aware"
- Root "to know" Form II (intensive/causative) → "to teach, to make known"
- Root "to know" Form IV (causative) → "to inform, to notify"
- Root "to know" Form V (reflexive of II) → "to learn, to become informed"
- Root "to glorify" Form II → "to exalt greatly, to magnify"
- Root "to believe" Form IV → "to give safety, to bring to faith"

Keep meanings concise, natural English. Do NOT use generic labels like "Base form" or "Causative".

Return ONLY valid JSON in this exact structure:
{{
  "results": [
    {{
      "id": "<root id>",
      "rootMeaning": "<corrected root meaning>",
      "babs": [
        {{ "id": "<bab id>", "verbMeaning": "<specific verb meaning in this form>" }}
      ]
    }}
  ]
}}

Here are the roots to process:
{json.dumps(roots_info, ensure_ascii=False, indent=2)}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    data = json.loads(text)
    result = {}
    for item in data["results"]:
        result[item["id"]] = {
            "rootMeaning": item["rootMeaning"],
            "babs": {b["id"]: b["verbMeaning"] for b in item["babs"]},
        }
    return result


def main():
    print(f"Loading data from {DATA_PATH}")
    with open(DATA_PATH, encoding="utf-8") as f:
        data = json.load(f)

    roots = data["roots"]
    print(f"Total roots: {len(roots)}")

    # Decide which roots to process:
    # - All roots get bab verbMeaning added
    # - Only bad meanings get rootMeaning fixed
    # For efficiency, process ALL roots (to get bab meanings) but Claude will fix meanings too

    # Check if a progress checkpoint exists
    checkpoint_path = DATA_PATH.parent / "verbsData_checkpoint.json"
    processed_ids = set()
    if checkpoint_path.exists():
        print("Found checkpoint, resuming...")
        with open(checkpoint_path, encoding="utf-8") as f:
            checkpoint = json.load(f)
        # Build a set of already-processed root ids
        for r in checkpoint["roots"]:
            if r["babs"] and "verbMeaning" in r["babs"][0]:
                processed_ids.add(r["id"])
        data = checkpoint
        roots = data["roots"]
        print(f"Already processed: {len(processed_ids)} roots")

    # Build index for quick lookup
    root_index = {r["id"]: i for i, r in enumerate(roots)}

    # Process in batches
    to_process = [r for r in roots if r["id"] not in processed_ids]
    print(f"Roots to process: {len(to_process)}")

    total_batches = (len(to_process) + BATCH_SIZE - 1) // BATCH_SIZE

    for batch_num, i in enumerate(range(0, len(to_process), BATCH_SIZE)):
        batch = to_process[i : i + BATCH_SIZE]
        print(f"Batch {batch_num + 1}/{total_batches}: processing {[r['root'] for r in batch]}")

        try:
            fixes = fix_batch(batch)
        except Exception as e:
            print(f"  ERROR on batch: {e}")
            # Save checkpoint and exit
            with open(checkpoint_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Checkpoint saved. Re-run to continue.")
            sys.exit(1)

        # Apply fixes to data
        for root_id, fix in fixes.items():
            idx = root_index.get(root_id)
            if idx is None:
                continue
            r = roots[idx]

            # Fix root meaning
            new_meaning = fix.get("rootMeaning", "").strip()
            if new_meaning:
                r["meaning"] = new_meaning

            # Add verbMeaning to each bab
            bab_fixes = fix.get("babs", {})
            for bab in r["babs"]:
                vm = bab_fixes.get(bab["id"], "").strip()
                if vm:
                    bab["verbMeaning"] = vm

        # Save checkpoint every batch
        with open(checkpoint_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)

        print(f"  Done. Sleeping 0.5s...")
        time.sleep(0.5)

    # All done — write final output
    output_path = DATA_PATH
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    # Clean up checkpoint
    if checkpoint_path.exists():
        checkpoint_path.unlink()

    print(f"\nDone! Updated {DATA_PATH}")
    print("Sample check:")
    for r in roots[:3]:
        print(f"  {r['root']}: {r['meaning']}")
        for b in r["babs"][:2]:
            print(f"    Bab {b['romanNumeral']}: {b.get('verbMeaning', '(no verbMeaning)')}")


if __name__ == "__main__":
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: Set ANTHROPIC_API_KEY environment variable first")
        sys.exit(1)
    main()
