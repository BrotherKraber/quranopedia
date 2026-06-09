import urllib.request
import json
import re
import html

def clean_html(html_text):
    text = html_text
    # Convert block level tags to newlines
    text = re.sub(r'</?(p|h1|h2|h3|h4|div|br|li|ul|ol)[^>]*>', '\n', text)
    # Remove all other tags
    text = re.sub(r'<[^>]+>', '', text)
    # Unescape HTML entities
    text = html.unescape(text)
    # Collapse multiple newlines
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()

def test():
    url = "https://api.quran.com/api/v4/tafsirs/169/by_ayah/108:1"
    print(f"Fetching Tafsir for 108:1 from {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            tafsir_text = data.get('tafsir', {}).get('text', '')
            print("Successfully fetched Tafsir.")
            print("\n--- Raw Text (First 300 chars) ---")
            print(tafsir_text[:300])
            print("\n--- Cleaned Text (First 500 chars) ---")
            cleaned = clean_html(tafsir_text)
            print(cleaned[:500] + "...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
