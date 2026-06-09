import urllib.request
import json

def list_eng():
    url = "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.json"
    print(f"Fetching editions from {url}...")
    try:
        response = urllib.request.urlopen(url)
        data = response.read().decode('utf-8')
        parsed = json.loads(data)
        eng_editions = {k: v for k, v in parsed.items() if v.get('language', '').lower() == 'english'}
        print(f"Found {len(eng_editions)} English editions:")
        for k, v in sorted(eng_editions.items()):
            print(f"  {k}: {v.get('author')} (Name: {v.get('name')})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_eng()
