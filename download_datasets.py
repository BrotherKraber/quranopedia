import urllib.request
import json
import os
import time

WIKI_DIR = "/home/razim/quran-app/wiki"

def download_file(url):
    print(f"Downloading from {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error downloading: {e}")
        return None

def build_offline_database():
    os.makedirs(WIKI_DIR, exist_ok=True)
    
    # 1. Fetch Arabic Indo-Pak text
    arabic_url = "https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/ara-quranindopak.json"
    arabic_data = download_file(arabic_url)
    
    # 2. Fetch English Translation
    english_url = "https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/eng-ummmuhammad.json"
    english_data = download_file(english_url)
    
    if not arabic_data or not english_data:
        print("Failed to download primary scriptures.")
        return

    print("Consolidating scriptures...")
    unified_quran = []
    
    arabic_list = arabic_data.get("quran", [])
    english_list = english_data.get("quran", [])
    
    # Map by chapter and verse to be safe
    arabic_map = {(v["chapter"], v["verse"]): v["text"] for v in arabic_list}
    english_map = {(v["chapter"], v["verse"]): v["text"] for v in english_list}
    
    all_keys = sorted(list(set(arabic_map.keys()).union(english_map.keys())))
    
    for ch, v in all_keys:
        unified_quran.append({
            "chapter": ch,
            "verse": v,
            "arabic": arabic_map.get((ch, v), ""),
            "english": english_map.get((ch, v), "")
        })

    # Save to wiki/quran-data.json
    dest_scripture = os.path.join(WIKI_DIR, "quran-data.json")
    with open(dest_scripture, 'w', encoding='utf-8') as f:
        json.dump({"quran": unified_quran}, f, indent=2, ensure_ascii=False)
    print(f"Saved local scripture database with {len(unified_quran)} verses to {dest_scripture}")

    # 3. Fetch Word-by-Word Database (compressed)
    # Since there are 114 chapters, we query the API for each chapter at build time.
    print("Downloading word-by-word data for all 114 Surahs...")
    compressed_wbw = {}
    
    for ch in range(1, 115):
        print(f"Fetching Surah {ch}/114...", end="\r")
        url = f"https://api.quran.com/api/v4/verses/by_chapter/{ch}?words=true&word_fields=text_uthmani,translation"
        chapter_data = download_file(url)
        
        if not chapter_data:
            print(f"\nFailed to fetch Surah {ch}")
            continue
            
        ch_str = str(ch)
        compressed_wbw[ch_str] = {}
        
        verses = chapter_data.get("verses", [])
        for v in verses:
            v_num = str(v["verse_key"].split(':')[1])
            compressed_wbw[ch_str][v_num] = []
            
            words = v.get("words", [])
            for w in words:
                # We only want actual word items, not the end of ayah markers (char_type_name == 'end')
                if w.get("char_type_name") == "word":
                    compressed_wbw[ch_str][v_num].append({
                        "arabic": w.get("text_uthmani", w.get("text", "")),
                        "translation": w.get("translation", {}).get("text", ""),
                        "transliteration": w.get("transliteration", {}).get("text", "")
                    })
        time.sleep(0.05) # Polite throttle
        
    print("\nSaving compiled word-by-word database...")
    dest_wbw = os.path.join(WIKI_DIR, "quran-wbw.json")
    with open(dest_wbw, 'w', encoding='utf-8') as f:
        json.dump(compressed_wbw, f, indent=2, ensure_ascii=False)
    print(f"Saved local word-by-word database to {dest_wbw}")

if __name__ == "__main__":
    build_offline_database()
