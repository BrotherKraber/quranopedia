#!/usr/bin/env python3
"""
prepare_deploy.py
=================
Builds a clean public distribution and deploys it to Netlify production.

What it does
────────────
1. Copies wiki/ → wiki_dist/           (fresh copy every run)
2. Copies db/quranopedia.min.json into wiki_dist/ (in case build_quranopedia_db.py
   hasn't been run yet, falls back to wiki/quranopedia.min.json)
3. Deploys wiki_dist/ to Netlify production

Usage
─────
    cd /home/razim/quran-app
    python3 prepare_deploy.py

To preview without deploying:
    python3 prepare_deploy.py --preview
"""

import os
import shutil
import subprocess
import sys

BASE      = os.path.dirname(os.path.abspath(__file__))
WIKI_SRC  = os.path.join(BASE, "wiki")
WIKI_DIST = os.path.join(BASE, "wiki_dist")
DB_MIN    = os.path.join(BASE, "db", "quranopedia.min.json")

preview_only = "--preview" in sys.argv

# ─────────────────────────────────────────────────────────────────────────────
# 1. Clean + copy
# ─────────────────────────────────────────────────────────────────────────────
print("► Cleaning previous build …")
if os.path.exists(WIKI_DIST):
    shutil.rmtree(WIKI_DIST)

print("► Copying wiki/ → wiki_dist/ …")
shutil.copytree(WIKI_SRC, WIKI_DIST)
print("  ✓ Copied")

# ─────────────────────────────────────────────────────────────────────────────
# 2. Ensure unified DB is present in wiki_dist/
#    Priority: db/quranopedia.min.json > wiki/quranopedia.min.json (already copied)
# ─────────────────────────────────────────────────────────────────────────────
db_dest = os.path.join(WIKI_DIST, "quranopedia.min.json")
if os.path.exists(DB_MIN):
    shutil.copy2(DB_MIN, db_dest)
    size_mb = os.path.getsize(db_dest) / (1024 * 1024)
    print(f"► Updated quranopedia.min.json from db/ ({size_mb:.1f} MB)")
elif os.path.exists(db_dest):
    size_mb = os.path.getsize(db_dest) / (1024 * 1024)
    print(f"► quranopedia.min.json present from wiki/ copy ({size_mb:.1f} MB)")
else:
    print("  [ERROR] quranopedia.min.json not found. Run build_quranopedia_db.py first.")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# 3. Deploy
# ─────────────────────────────────────────────────────────────────────────────
if preview_only:
    print("\n✅ Preview build ready in wiki_dist/ (not deployed — pass no args to deploy)")
    sys.exit(0)

print("\n► Deploying wiki_dist/ to Netlify production …")
result = subprocess.run(
    ["netlify", "deploy", "--prod", "--dir", "wiki_dist"],
    cwd=BASE,
    capture_output=False,
)
sys.exit(result.returncode)
