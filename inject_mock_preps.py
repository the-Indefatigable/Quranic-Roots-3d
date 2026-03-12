import json
import os
import random

MOCK_PREPS = [
    {"preposition": "فِي", "meaning": "to desire"},
    {"preposition": "عَنْ", "meaning": "to turn away from"},
    {"preposition": "بِ", "meaning": "to attach to"},
    {"preposition": "لِ", "meaning": "to belong to"},
]

def main():
    file_path = 'src/data/verbsData.json'
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    print("Loading verbsData.json...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Inject mock prepositions into just a few forms for frontend testing
    print("Injecting mock prepositions...")
    count = 0
    for r in data.get("roots", []):
        for bab in r.get("babs", []):
            if random.random() < 0.05: # 5% chance to have prepositions
                num_preps = random.randint(1, 3)
                bab["prepositions"] = random.sample(MOCK_PREPS, num_preps)
                count += 1

    print("Saving verbsData.json...")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Injected mock prepositions into {count} Babs. Ready for UI testing.")

if __name__ == '__main__':
    main()
