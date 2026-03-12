import json
import time
import sys
from deep_translator import GoogleTranslator

def main():
    file_path = 'src/data/verbsData.json'
    
    print("Loading data...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Initialize translator from Arabic to English
    translator = GoogleTranslator(source='ar', target='en')

    count = 0
    total_missing = 0
    
    # Pre-calculate to show progress
    for r in data['roots']:
        m = r.get('meaning', '')
        if not (' ' in m or m.startswith('to ')):
            total_missing += 1

    print(f"Found {total_missing} roots needing translation.")

    if total_missing == 0:
        return

    # Process each root
    for r in data['roots']:
        m = r.get('meaning', '')
        
        # If the meaning doesn't have a space and doesn't start with "to ", we assume it's just the buckwalter code.
        if not (' ' in m or m.startswith('to ')):
            root_arabic = r['root']
            try:
                # deep_translator throws an error or returns the input if not found, we use it directly:
                en = translator.translate(root_arabic)
                
                # Simple cleanup (lowercasing and prepending 'to' if it's not there and seems like a single verb translation)
                en = en.lower()
                if ' ' not in en and not en.startswith('to '):
                    en = f"to {en}"

                print(f"[{count+1}/{total_missing}] Translated {root_arabic} ({m}) -> {en}")
                r['meaning'] = en
                count += 1
                
                # Small sleep to be polite to the Translation API
                time.sleep(0.4)
                
            except Exception as e:
                print(f"Error translating {root_arabic}: {e}")
                time.sleep(1) # wait longer on error

            # Save periodically to not lose progress on failure
            if count % 20 == 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

    # Final save
    if count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\nDone! Successfully updated {count} meanings.")

if __name__ == '__main__':
    main()
