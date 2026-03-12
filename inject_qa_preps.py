import json
import os

def main():
    file_path = 'src/data/verbsData.json'
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    print("Loading verbsData.json...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Specific prepositions for the required test roots
    AMAN_PREPS = [
        {"preposition": "بِ", "meaning": "to believe in / trust"},
        {"preposition": "لِ", "meaning": "to yield to / believe"},
    ]
    QALA_PREPS = [
        {"preposition": "لِ", "meaning": "to say to (someone)"},
        {"preposition": "فِي", "meaning": "to speak about (a subject)"},
        {"preposition": "عَلَى", "meaning": "to speak against / lie upon"},
    ]

    count = 0
    for r in data.get("roots", []):
        if r["root"] == "امن" or r["id"] == "امن":
            for bab in r.get("babs", []):
                if bab["form"] == "I" or bab["form"] == "IV":
                    bab["prepositions"] = AMAN_PREPS
                    count += 1
        elif r["root"] == "قول" or r["id"] == "قول":
            for bab in r.get("babs", []):
                if bab["form"] == "I":
                    bab["prepositions"] = QALA_PREPS
                    count += 1

    print("Saving verbsData.json...")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Injected specific prepositions into {count} target Babs for QA.")

if __name__ == '__main__':
    main()
