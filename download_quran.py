import urllib.request
import json
import os

def download():
    url = "https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/eng-ummmuhammad.json"
    dest = "/home/razim/quran-app/eng-ummmuhammad.json"
    
    print(f"Downloading from {url}...")
    try:
        response = urllib.request.urlopen(url)
        data = response.read()
        
        # Verify it is valid JSON
        parsed = json.loads(data.decode('utf-8'))
        print(f"Success! Fetched translation with {len(parsed.get('quran', []))} verses.")
        
        # Save pretty printed JSON
        with open(dest, 'w', encoding='utf-8') as f:
            json.dump(parsed, f, indent=2, ensure_ascii=False)
        print(f"Saved to {dest}")
        
        # Print a sample verse to inspect structure
        if parsed.get('quran'):
            print("Sample verse:")
            print(json.dumps(parsed['quran'][0], indent=2))
            
    except Exception as e:
        print(f"Error downloading: {e}")

if __name__ == "__main__":
    download()
