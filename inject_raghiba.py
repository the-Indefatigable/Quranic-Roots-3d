import json
import os

def main():
    file_path = 'src/data/verbsData.json'
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    print("Loading verbsData.json for Raghiba Injection...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Specific prepositions for the required test roots
    RAGHIBA_PREPS = [
        {"preposition": "فِي", "meaning": "to desire"},
        {"preposition": "عَنْ", "meaning": "to turn away from (reject)"},
    ]
    
    count = 0
    for r in data.get("roots", []):
        if r["root"] == "رغب" or r.get("id") == "رغب":
            r["meaning"] = "to desire / to wish"
            for bab in r.get("babs", []):
                # We specifically want to inject it into Form I
                if bab.get("form") == "I" or bab.get("romanNumeral") == "I":
                    bab["prepositions"] = RAGHIBA_PREPS
                    count += 1
                    print(f"Injected into bab: {bab.get('id', 'unknown')}")

    print("Saving verbsData.json...")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Injected specific prepositions into {count} target Babs for رغب.")

if __name__ == '__main__':
    main()
