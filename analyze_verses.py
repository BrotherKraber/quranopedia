import json
from collections import Counter

def analyze():
    path = "/home/razim/quran-app/eng-ummmuhammad.json"
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    verses = data.get('quran', [])
    counts = Counter(v['chapter'] for v in verses)
    
    print("Verse counts for all 114 chapters:")
    sorted_counts = sorted(counts.items())
    for ch, cnt in sorted_counts:
        print(f"{ch}: {cnt}", end=", " if ch % 10 != 0 else "\n")
    print()

if __name__ == "__main__":
    analyze()
