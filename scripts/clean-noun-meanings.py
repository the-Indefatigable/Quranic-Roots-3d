#!/usr/bin/env python3
"""
Strip leading conjunctions, prepositions, articles, and parentheticals
from noun meanings to produce clean dictionary-style headings.
"""

import json, re

NOUNS_FILE = 'public/data/nounsData.json'

# Applied in order, repeatedly until no more matches
STRIP_PATTERNS = [
    # Parenthetical prefix: (is), (of), (in), (and), (to), etc.
    r'^\([^)]+\)\s+',
    # Leading conjunctions
    r'^(and|so|then|but|or|nor|yet)\s+',
    # Leading prepositions
    r'^(to|for|of|with|in|by|from|on|upon|at|as|into|about|through|between|among)\s+',
    # Leading articles
    r'^(the|a|an)\s+',
    # Leading possessives
    r'^(his|her|their|our|your|its|my|their)\s+',
    # Leading subject pronouns (leftover from "(is) X")
    r'^(it|he|she|they|we|you|I)\s+',
    # Trailing punctuation cleanup
    r'\s+$',
]

def clean_meaning(text):
    if not text:
        return text
    original = text
    # Apply patterns iteratively until stable
    for _ in range(6):  # max 6 passes
        prev = text
        for pattern in STRIP_PATTERNS:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        if text == prev:
            break
    # Capitalize first letter
    if text:
        text = text[0].upper() + text[1:]
    # If we stripped everything meaningful, revert
    if len(text) < 2:
        return original
    return text

with open(NOUNS_FILE, encoding='utf-8') as f:
    data = json.load(f)

changed = 0
for noun in data['nouns']:
    original = noun['meaning']
    cleaned  = clean_meaning(original)
    if cleaned != original:
        noun['meaning'] = cleaned
        changed += 1

print(f"Cleaned {changed} meanings.")

# Show before/after samples
print("\nSamples:")
samples = [
    ("and grass",           clean_meaning("and grass")),
    ("to his father",       clean_meaning("to his father")),
    ("(in) flocks",         clean_meaning("(in) flocks")),
    ("and giving",          clean_meaning("and giving")),
    ("(is) sure to come",   clean_meaning("(is) sure to come")),
    ("the camels",          clean_meaning("the camels")),
    ("a penalty",           clean_meaning("a penalty")),
    ("(of) Allah",          clean_meaning("(of) Allah")),
    ("sinner",              clean_meaning("sinner")),
    ("one who asks",        clean_meaning("one who asks")),
    ("repel",               clean_meaning("repel")),
    ("By the morning brightness", clean_meaning("By the morning brightness")),
]
for before, after in samples:
    marker = '→' if before != after else '='
    print(f"  {before!r:35} {marker}  {after!r}")

with open(NOUNS_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nnounsData.json updated.")
