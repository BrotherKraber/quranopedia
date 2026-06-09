import urllib.request
import json

def get_english_tafsirs():
    url = "https://api.quran.com/api/v4/resources/tafsirs?language=en"
    print(f"Fetching Tafsirs list from {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            tafsirs = data.get('tafsirs', [])
            eng_tafsirs = [t for t in tafsirs if t.get('language_name') == 'english']
            print(f"Found {len(eng_tafsirs)} English Tafsirs:")
            for t in eng_tafsirs:
                print(f"  ID: {t.get('id')} | Slug: {t.get('slug')} | Name: {t.get('name')} by {t.get('author_name')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_english_tafsirs()
