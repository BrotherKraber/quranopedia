import os
import shutil
import re

base_dir = "/home/razim/quran-app"
wiki_src = os.path.join(base_dir, "wiki")
wiki_dist = os.path.join(base_dir, "wiki_dist")

# 1. Clean previous build if any
if os.path.exists(wiki_dist):
    shutil.rmtree(wiki_dist)

# 2. Copy wiki folder to wiki_dist
shutil.copytree(wiki_src, wiki_dist)

# 3. Modify wiki_dist/index.html to remove/hide hifz helper & guide links
index_path = os.path.join(wiki_dist, "index.html")
with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove list items for hifz_helper and hifz_guide
content = re.sub(r'<li><a href="#hifz_helper".*?</li>\s*', '', content)
content = re.sub(r'<li><a href="#hifz_guide".*?</li>\s*', '', content)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

# 4. Modify wiki_dist/wiki.js to redirect hifz_helper and hifz_guide to main_page
wiki_js_path = os.path.join(wiki_dist, "wiki.js")
with open(wiki_js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# Insert redirection logic at the beginning of navigateTo function
nav_to_pattern = r'function navigateTo\(pageId,\s*updateHistory\s*=\s*true\)\s*\{'
redirection_code = 'function navigateTo(pageId, updateHistory = true) {\n    if (pageId === "hifz_helper" || pageId === "hifz_guide") {\n        pageId = "main_page";\n    }'

if re.search(nav_to_pattern, js_content):
    js_content = re.sub(nav_to_pattern, redirection_code, js_content, count=1)
    print("✓ Successfully injected route redirection in wiki.js")
else:
    print("⚠️ Warning: navigateTo function signature not matched. Redirection not inserted.")

with open(wiki_js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print("✓ Clean distribution folder prepared in 'wiki_dist'")
