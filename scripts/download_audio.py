#!/usr/bin/env python3
"""
scripts/download_audio.py
=========================
Downloads Quran recitation MP3 files from everyayah.com for local hosting.

Default reciter: Alafasy_128kbps (Mishary Rashid Alafasy)

Naming convention (everyayah.com standard):
    {surah:03d}{verse:03d}.mp3
    e.g., Surah 1 Verse 1 -> 001001.mp3
    Bismillah (verse 0) -> {surah:03d}000.mp3

Usage
-----
    cd /home/razim/quran-app
    python3 scripts/download_audio.py

    # Custom reciter:
    python3 scripts/download_audio.py --reciter Husary_128kbps

    # Dry run (print URLs only):
    python3 scripts/download_audio.py --dry-run

Output
------
    audio_cache/{reciter}/{surah:03d}{verse:03d}.mp3

After downloading, upload to Cloudflare R2:
    rclone copy audio_cache/Alafasy_128kbps/ r2:quranopedia-audio/Alafasy_128kbps/ --progress

IMPORTANT - Copyright Notice
-----------------------------
Mishary Alafasy's recordings are commercially copyrighted (managed by Alfan Music).
everyayah.com has no published license.  These files are widely used in the Islamic
developer community for free, non-commercial, non-ad-supported educational use.
This script is provided for that purpose only.  Do NOT use behind a paywall or in
commercial contexts.  Credit: Sheikh Mishary Rashid Alafasy / everyayah.com
"""

import argparse
import os
import sys
import time
import urllib.request
import urllib.error

# -- Surah verse counts (Uthmani Quran, 114 surahs) --------------------------
VERSE_COUNTS = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
    123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
    34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
    60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
    28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
    15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
    5, 4, 5, 6,
]

# Surahs that do NOT get a standalone Bismillah verse (Al-Fatihah=1, At-Tawbah=9)
NO_BISMILLAH = {1, 9}

# -- Supported reciters on everyayah.com -------------------------------------
RECITERS = [
    "Alafasy_128kbps",
    "Husary_128kbps",
    "Abdul_Basit_Murattal_192kbps",
    "Abdurrahmaan_As-Sudais_192kbps",
    "Ghamadi_40kbps",
    "aziz_alili_128kbps",
]

BASE_URL    = "https://everyayah.com/data"
RETRY_LIMIT = 3
RETRY_DELAY = 2   # seconds between retries


def download_file(url, dest, dry_run):
    """Download url to dest. Returns True on success. Skips if already exists."""
    if os.path.exists(dest):
        return True  # already downloaded

    if dry_run:
        print(f"  [DRY] {url}")
        return True

    os.makedirs(os.path.dirname(dest), exist_ok=True)

    for attempt in range(1, RETRY_LIMIT + 1):
        try:
            urllib.request.urlretrieve(url, dest)
            return True
        except urllib.error.HTTPError as e:
            if e.code == 404:
                print(f"  [404] {url}")
                return False
            print(f"  [HTTP {e.code}] {url}  (attempt {attempt}/{RETRY_LIMIT})")
        except Exception as e:
            print(f"  [ERR] {url}: {e}  (attempt {attempt}/{RETRY_LIMIT})")
        if attempt < RETRY_LIMIT:
            time.sleep(RETRY_DELAY)

    return False


def run(reciter, dry_run, out_dir):
    total_files = 0
    skipped     = 0
    downloaded  = 0
    failed      = 0

    reciter_dir = os.path.join(out_dir, reciter)

    print(f"\n{'='*60}")
    print(f"  Reciter : {reciter}")
    print(f"  Output  : {reciter_dir}")
    print(f"  Dry run : {dry_run}")
    print(f"{'='*60}\n")

    for surah_idx, verse_count in enumerate(VERSE_COUNTS):
        surah     = surah_idx + 1
        surah_str = f"{surah:03d}"

        # Bismillah (verse 0) for most surahs
        if surah not in NO_BISMILLAH:
            filename = f"{surah_str}000.mp3"
            url  = f"{BASE_URL}/{reciter}/{filename}"
            dest = os.path.join(reciter_dir, filename)
            total_files += 1
            if os.path.exists(dest):
                skipped += 1
            else:
                if download_file(url, dest, dry_run):
                    downloaded += 1
                else:
                    failed += 1

        # Regular verses
        for verse in range(1, verse_count + 1):
            filename = f"{surah_str}{verse:03d}.mp3"
            url  = f"{BASE_URL}/{reciter}/{filename}"
            dest = os.path.join(reciter_dir, filename)
            total_files += 1

            if os.path.exists(dest):
                skipped += 1
            else:
                if download_file(url, dest, dry_run):
                    downloaded += 1
                    if downloaded % 100 == 0:
                        print(f"  ... {downloaded} files downloaded so far")
                else:
                    failed += 1

        # Per-surah progress report
        if not dry_run and os.path.isdir(reciter_dir):
            size_mb = sum(
                os.path.getsize(os.path.join(reciter_dir, f))
                for f in os.listdir(reciter_dir)
                if f.endswith('.mp3')
            ) / (1024 * 1024)
            print(f"  Surah {surah:3d}/114 done | "
                  f"new={downloaded:4d}  skipped={skipped:4d}  "
                  f"failed={failed}  size={size_mb:.1f} MB")

    print(f"\n{'='*60}")
    print(f"  COMPLETE: {downloaded} new, {skipped} skipped, {failed} failed")
    print(f"{'='*60}\n")

    if not dry_run and failed == 0:
        print("Next step - upload to Cloudflare R2:")
        print(f"  rclone copy {reciter_dir}/ r2:quranopedia-audio/{reciter}/ --progress\n")
        print("Then update wiki.js AudioController.reloadAudioSource():")
        print("  Change remoteUrl to: https://audio.quranopedia.org/{reciter}/{sStr}{vStr}.mp3\n")

    return failed == 0


def main():
    parser = argparse.ArgumentParser(
        description="Download Quran audio from everyayah.com for local/CDN hosting"
    )
    parser.add_argument(
        "--reciter",
        default="Alafasy_128kbps",
        choices=RECITERS,
        help="Reciter folder name on everyayah.com (default: Alafasy_128kbps)"
    )
    parser.add_argument(
        "--out-dir",
        default=os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "audio_cache"
        ),
        help="Local output directory (default: audio_cache/ in project root)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print URLs without downloading anything"
    )
    args = parser.parse_args()

    success = run(args.reciter, args.dry_run, args.out_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
