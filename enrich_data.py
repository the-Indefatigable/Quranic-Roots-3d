import json
import os

# Standard 14 pronouns ordered by Person, Gender, Number
PRONOUNS = [
    # Third Person
    {"person": "3ms", "english": "He (3ms)"},
    {"person": "3fs", "english": "She (3fs)"},
    {"person": "3md", "english": "They two (masc) (3md)"},
    {"person": "3fd", "english": "They two (fem) (3fd)"},
    {"person": "3mp", "english": "They (masc pl) (3mp)"},
    {"person": "3fp", "english": "They (fem pl) (3fp)"},
    # Second Person
    {"person": "2ms", "english": "You (masc sg) (2ms)"},
    {"person": "2fs", "english": "You (fem sg) (2fs)"},
    {"person": "2md", "english": "You two (masc) (2md)"},
    {"person": "2fd", "english": "You two (fem) (2fd)"},
    {"person": "2mp", "english": "You all (masc pl) (2mp)"},
    {"person": "2fp", "english": "You all (fem pl) (2fp)"},
    # First Person
    {"person": "1s",  "english": "I (1s)"},
    {"person": "1p",  "english": "We (1p)"},
]

# AMR (Imperative) only applies to Second Person
AMR_PRONOUNS = [
    {"person": "2ms", "english": "You (masc sg) (2ms)"},
    {"person": "2fs", "english": "You (fem sg) (2fs)"},
    {"person": "2md", "english": "You two (masc) (2md)"},
    {"person": "2fd", "english": "You two (fem) (2fd)"},
    {"person": "2mp", "english": "You all (masc pl) (2mp)"},
    {"person": "2fp", "english": "You all (fem pl) (2fp)"},
]

# Morphological meaning of Babs
BAB_SEMANTICS = {
    "I": "Base form (Root meaning)",
    "II": "Intensification / Causative",
    "III": "Mutual Action / Effort",
    "IV": "Causative / Transitive",
    "V": "Reflexive of Form II (Consequence)",
    "VI": "Mutual / Reciprocal of Form III",
    "VII": "Passive / Reflexive of Form I",
    "VIII": "Reflexive / Intentional Effort",
    "IX": "Colors / Defects",
    "X": "Seeking / Asking / Deeming",
}

def fill_conjugations(tenses_list):
    """
    Ensures that every tense has exactly 14 conjugations (or 6 for Amr).
    If a form is missing, we insert a placeholder or an auto-generated one.
    Because exact Arabic morphology (Sarf) for irregular roots is extremely complex,
    we will retain existing conjugations and pad missing ones with an indicator so the UI 
    renders the full 14-row table without crashing.
    """
    for tense in tenses_list:
        existing_forms = {c["person"]: c for c in tense.get("conjugation", [])}
        target_pronouns = AMR_PRONOUNS if tense["type"] == "amr" else PRONOUNS
        
        new_conjugation = []
        for p in target_pronouns:
            if p["person"] in existing_forms:
                # Keep existing from Quran
                new_conjugation.append(existing_forms[p["person"]])
            else:
                # Pad missing with a greyed-out indicator
                new_conjugation.append({
                    "person": p["person"],
                    "arabic": "-",
                    "transliteration": "-",
                    "english": p["english"]
                })
        
        tense["conjugation"] = new_conjugation

def main():
    file_path = 'src/data/verbsData.json'
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    print("Loading verbsData.json...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("Enriching data...")
    roots = data.get("roots", [])
    
    for r in roots:
        for bab in r.get("babs", []):
            # 1. Add Semantic Meaning
            form_num = bab.get("form", "I")
            bab["semanticMeaning"] = BAB_SEMANTICS.get(form_num, "")
            
            # 2. Fill missing conjugations
            tenses = bab.get("tenses", [])
            fill_conjugations(tenses)

    print("Saving enriched verbsData.json...")
    # Save back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Enrichment complete! Form tables now standardized to 14 rows.")

if __name__ == '__main__':
    main()
