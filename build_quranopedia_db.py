#!/usr/bin/env python3
"""
build_quranopedia_db.py
=======================
Populates /db/quranopedia.json from all existing source files:

  Sources read
  ─────────────
  wiki/quran-data.json       → verse arabic + english text
  wiki/quran-wbw.json        → word-by-word breakdown
  wiki/hadith-data.json      → hadith entries
  wiki/dua-data.json         → dua entries
  philosophy/philosophy-data.json    → philosophy articles (via build_db.py output)
  philosophy/exegesis-data.json      → verse exegesis commentaries
  philosophy/sources-data.json       → primary scholar source texts
  surahs.py (imported)               → surah identity + aliases

  Custom annotations (embedded in this script)
  ─────────────────────────────────────────────
  SURAH_EXTRA   → revelation order/place, juz, hizb, seerah_period,
                   hifz metadata, philosophy_tags
  EXEGESIS_TAGS → philosophy_tags to attach to each exegesis verse
  VERSE_EXTRAS  → sparse dict of {chapter:verse} → custom verse fields

Usage
─────
  cd /home/razim/quran-app
  python3 build_quranopedia_db.py

Output
──────
  db/quranopedia.json   (~8 MB, human-readable with indent=2)
  db/quranopedia.min.json  (minified, ~4 MB, for production deploy)
"""

import json
import os
import sys
import datetime
import datetime as dt

BASE = os.path.dirname(os.path.abspath(__file__))

# ──────────────────────────────────────────────────────────────────────────────
# 1.  CUSTOM ANNOTATION TABLES
#     These are the "new" fields that don't exist in any existing file.
#     Edit these freely — they're designed to be extended by you.
# ──────────────────────────────────────────────────────────────────────────────

# --- Revelation order (Nöldeke/Egyptian canonical numbering, 1–114) ----------
# Source: Classical Islamic scholarship consensus
REVELATION_ORDER = {
    1: 5,    2: 87,   3: 89,   4: 92,   5: 112,  6: 55,   7: 39,
    8: 88,   9: 113,  10: 51,  11: 52,  12: 53,  13: 96,  14: 72,
    15: 54,  16: 70,  17: 50,  18: 69,  19: 44,  20: 45,  21: 73,
    22: 103, 23: 74,  24: 102, 25: 68,  26: 65,  27: 48,  28: 49,
    29: 85,  30: 84,  31: 83,  32: 82,  33: 86,  34: 75,  35: 27,
    36: 41,  37: 56,  38: 36,  39: 59,  40: 60,  41: 57,  42: 66,
    43: 64,  44: 63,  45: 67,  46: 71,  47: 47,  48: 111, 49: 62,
    50: 61,  51: 58,  52: 38,  53: 43,  54: 54,  55: 97,  56: 46,
    57: 94,  58: 91,  59: 93,  60: 90,  61: 100, 62: 108, 63: 107,
    64: 98,  65: 101, 66: 80,  67: 92,  68: 105, 69: 104, 70: 99,
    71: 53,  72: 40,  73: 45,  74: 74,  75: 76,  76: 31,  77: 77,
    78: 78,  79: 79,  80: 80,  81: 7,   82: 6,   83: 8,   84: 20,
    85: 22,  86: 23,  87: 24,  88: 25,  89: 26,  90: 28,  91: 29,
    92: 30,  93: 17,  94: 18,  95: 16,  96: 19,  97: 21,  98: 4,
    99: 3,   100: 2,  101: 10, 102: 11, 103: 12, 104: 14, 105: 15,
    106: 9,  107: 13, 108: 1,  109: 5,  110: 33, 111: 34, 112: 35,
    113: 37, 114: 114
}

# --- Revelation place: "meccan" or "medinan" --------------------------------
REVELATION_PLACE = {
    1: "meccan",
    **{i: "medinan" for i in [2, 3, 4, 5, 8, 9, 22, 24, 33, 47, 48, 49,
                                57, 58, 59, 60, 61, 62, 63, 64, 65, 66,
                                76, 98, 110]},
}

def get_revelation_place(surah_id):
    return REVELATION_PLACE.get(surah_id, "meccan")

# --- Juz (part) number where each surah starts (Madani mushaf) ---------------
JUZ_START = {
    1: 1,   2: 1,   3: 3,   4: 4,   5: 6,   6: 7,   7: 8,   8: 9,
    9: 10,  10: 11, 11: 11, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14,
    17: 15, 18: 15, 19: 16, 20: 16, 21: 17, 22: 17, 23: 18, 24: 18,
    25: 18, 26: 19, 27: 19, 28: 20, 29: 20, 30: 21, 31: 21, 32: 21,
    33: 21, 34: 22, 35: 22, 36: 22, 37: 23, 38: 23, 39: 23, 40: 24,
    41: 24, 42: 25, 43: 25, 44: 25, 45: 25, 46: 26, 47: 26, 48: 26,
    49: 26, 50: 26, 51: 26, 52: 27, 53: 27, 54: 27, 55: 27, 56: 27,
    57: 27, 58: 28, 59: 28, 60: 28, 61: 28, 62: 28, 63: 28, 64: 28,
    65: 28, 66: 28, 67: 29, 68: 29, 69: 29, 70: 29, 71: 29, 72: 29,
    73: 29, 74: 29, 75: 29, 76: 29, 77: 29, 78: 30, 79: 30, 80: 30,
    81: 30, 82: 30, 83: 30, 84: 30, 85: 30, 86: 30, 87: 30, 88: 30,
    89: 30, 90: 30, 91: 30, 92: 30, 93: 30, 94: 30, 95: 30, 96: 30,
    97: 30, 98: 30, 99: 30, 100: 30, 101: 30, 102: 30, 103: 30,
    104: 30, 105: 30, 106: 30, 107: 30, 108: 30, 109: 30, 110: 30,
    111: 30, 112: 30, 113: 30, 114: 30,
}

# --- Seerah Period mapping per surah ----------------------------------------
# "early_meccan"  = 610–615 CE
# "middle_meccan" = 615–619 CE
# "late_meccan"   = 619–622 CE
# "medinan"       = 622–632 CE
# "mixed"         = spans multiple periods
SEERAH_PERIOD = {
    1:   "late_meccan",   # Al-Fatihah — scholarly disagreement; late Meccan traditional view
    2:   "medinan",
    3:   "medinan",
    4:   "medinan",
    5:   "medinan",
    6:   "late_meccan",
    7:   "middle_meccan",
    8:   "medinan",
    9:   "medinan",
    10:  "late_meccan",
    11:  "late_meccan",
    12:  "late_meccan",
    13:  "medinan",
    14:  "late_meccan",
    15:  "middle_meccan",
    16:  "late_meccan",
    17:  "late_meccan",
    18:  "middle_meccan",
    19:  "early_meccan",
    20:  "early_meccan",
    21:  "late_meccan",
    22:  "medinan",
    23:  "late_meccan",
    24:  "medinan",
    25:  "late_meccan",
    26:  "middle_meccan",
    27:  "middle_meccan",
    28:  "late_meccan",
    29:  "mixed",
    30:  "late_meccan",
    31:  "late_meccan",
    32:  "late_meccan",
    33:  "medinan",
    34:  "late_meccan",
    35:  "late_meccan",
    36:  "middle_meccan",
    37:  "middle_meccan",
    38:  "middle_meccan",
    39:  "late_meccan",
    40:  "late_meccan",
    41:  "late_meccan",
    42:  "late_meccan",
    43:  "late_meccan",
    44:  "late_meccan",
    45:  "late_meccan",
    46:  "late_meccan",
    47:  "medinan",
    48:  "medinan",
    49:  "medinan",
    50:  "late_meccan",
    51:  "middle_meccan",
    52:  "early_meccan",
    53:  "early_meccan",
    54:  "middle_meccan",
    55:  "middle_meccan",
    56:  "early_meccan",
    57:  "medinan",
    58:  "medinan",
    59:  "medinan",
    60:  "medinan",
    61:  "medinan",
    62:  "medinan",
    63:  "medinan",
    64:  "medinan",
    65:  "medinan",
    66:  "medinan",
    67:  "early_meccan",
    68:  "early_meccan",
    69:  "middle_meccan",
    70:  "middle_meccan",
    71:  "early_meccan",
    72:  "late_meccan",
    73:  "early_meccan",
    74:  "early_meccan",
    75:  "early_meccan",
    76:  "medinan",
    77:  "early_meccan",
    78:  "early_meccan",
    79:  "early_meccan",
    80:  "early_meccan",
    81:  "early_meccan",
    82:  "early_meccan",
    83:  "early_meccan",
    84:  "early_meccan",
    85:  "early_meccan",
    86:  "early_meccan",
    87:  "early_meccan",
    88:  "early_meccan",
    89:  "early_meccan",
    90:  "early_meccan",
    91:  "early_meccan",
    92:  "early_meccan",
    93:  "early_meccan",
    94:  "early_meccan",
    95:  "early_meccan",
    96:  "early_meccan",    # First revelation (Al-Alaq)
    97:  "early_meccan",
    98:  "medinan",
    99:  "medinan",
    100: "early_meccan",
    101: "early_meccan",
    102: "early_meccan",
    103: "early_meccan",
    104: "early_meccan",
    105: "early_meccan",
    106: "early_meccan",
    107: "early_meccan",
    108: "early_meccan",
    109: "early_meccan",
    110: "medinan",
    111: "early_meccan",
    112: "early_meccan",
    113: "early_meccan",
    114: "early_meccan",
}

# --- Hifz metadata per surah -------------------------------------------------
# difficulty: "easy" | "medium" | "hard"
# page_start / page_end: Madani mushaf page numbers (604-page edition)
# rukus: number of Ruku' sections
# sajdahs: number of Sajdah al-Tilawa verses
# popular_for_memorisation: community flag

HIFZ_DATA = {
    1:   {"difficulty": "easy",   "page_start": 1,   "page_end": 1,   "rukus": 1,  "sajdahs": 0, "popular": True},
    2:   {"difficulty": "hard",   "page_start": 2,   "page_end": 49,  "rukus": 40, "sajdahs": 0, "popular": False},
    3:   {"difficulty": "hard",   "page_start": 50,  "page_end": 76,  "rukus": 20, "sajdahs": 0, "popular": False},
    4:   {"difficulty": "hard",   "page_start": 77,  "page_end": 106, "rukus": 24, "sajdahs": 0, "popular": False},
    5:   {"difficulty": "hard",   "page_start": 106, "page_end": 127, "rukus": 16, "sajdahs": 0, "popular": False},
    6:   {"difficulty": "hard",   "page_start": 128, "page_end": 150, "rukus": 20, "sajdahs": 0, "popular": False},
    7:   {"difficulty": "hard",   "page_start": 151, "page_end": 176, "rukus": 24, "sajdahs": 1, "popular": False},
    8:   {"difficulty": "medium", "page_start": 177, "page_end": 186, "rukus": 10, "sajdahs": 0, "popular": False},
    9:   {"difficulty": "hard",   "page_start": 187, "page_end": 207, "rukus": 16, "sajdahs": 0, "popular": False},
    10:  {"difficulty": "hard",   "page_start": 208, "page_end": 221, "rukus": 11, "sajdahs": 0, "popular": False},
    11:  {"difficulty": "hard",   "page_start": 221, "page_end": 235, "rukus": 10, "sajdahs": 0, "popular": False},
    12:  {"difficulty": "medium", "page_start": 235, "page_end": 248, "rukus": 12, "sajdahs": 1, "popular": False},
    13:  {"difficulty": "medium", "page_start": 249, "page_end": 255, "rukus": 6,  "sajdahs": 1, "popular": False},
    14:  {"difficulty": "medium", "page_start": 255, "page_end": 261, "rukus": 7,  "sajdahs": 0, "popular": False},
    15:  {"difficulty": "medium", "page_start": 262, "page_end": 267, "rukus": 6,  "sajdahs": 0, "popular": False},
    16:  {"difficulty": "hard",   "page_start": 267, "page_end": 281, "rukus": 16, "sajdahs": 1, "popular": False},
    17:  {"difficulty": "hard",   "page_start": 282, "page_end": 293, "rukus": 12, "sajdahs": 1, "popular": False},
    18:  {"difficulty": "medium", "page_start": 293, "page_end": 304, "rukus": 12, "sajdahs": 0, "popular": True},
    19:  {"difficulty": "medium", "page_start": 305, "page_end": 312, "rukus": 6,  "sajdahs": 1, "popular": False},
    20:  {"difficulty": "medium", "page_start": 312, "page_end": 321, "rukus": 8,  "sajdahs": 0, "popular": False},
    21:  {"difficulty": "medium", "page_start": 322, "page_end": 331, "rukus": 7,  "sajdahs": 1, "popular": False},
    22:  {"difficulty": "medium", "page_start": 332, "page_end": 341, "rukus": 10, "sajdahs": 2, "popular": False},
    23:  {"difficulty": "medium", "page_start": 342, "page_end": 349, "rukus": 6,  "sajdahs": 0, "popular": False},
    24:  {"difficulty": "medium", "page_start": 350, "page_end": 359, "rukus": 9,  "sajdahs": 0, "popular": False},
    25:  {"difficulty": "medium", "page_start": 359, "page_end": 366, "rukus": 6,  "sajdahs": 1, "popular": False},
    26:  {"difficulty": "medium", "page_start": 367, "page_end": 376, "rukus": 11, "sajdahs": 0, "popular": False},
    27:  {"difficulty": "medium", "page_start": 377, "page_end": 385, "rukus": 7,  "sajdahs": 1, "popular": False},
    28:  {"difficulty": "medium", "page_start": 385, "page_end": 396, "rukus": 9,  "sajdahs": 0, "popular": False},
    29:  {"difficulty": "medium", "page_start": 396, "page_end": 404, "rukus": 7,  "sajdahs": 1, "popular": False},
    30:  {"difficulty": "medium", "page_start": 404, "page_end": 411, "rukus": 6,  "sajdahs": 1, "popular": False},
    31:  {"difficulty": "easy",   "page_start": 411, "page_end": 414, "rukus": 4,  "sajdahs": 1, "popular": False},
    32:  {"difficulty": "easy",   "page_start": 415, "page_end": 417, "rukus": 3,  "sajdahs": 1, "popular": False},
    33:  {"difficulty": "hard",   "page_start": 418, "page_end": 427, "rukus": 9,  "sajdahs": 0, "popular": False},
    34:  {"difficulty": "medium", "page_start": 428, "page_end": 434, "rukus": 6,  "sajdahs": 0, "popular": False},
    35:  {"difficulty": "medium", "page_start": 434, "page_end": 440, "rukus": 5,  "sajdahs": 0, "popular": False},
    36:  {"difficulty": "medium", "page_start": 440, "page_end": 445, "rukus": 5,  "sajdahs": 0, "popular": True},
    37:  {"difficulty": "medium", "page_start": 446, "page_end": 452, "rukus": 5,  "sajdahs": 0, "popular": False},
    38:  {"difficulty": "medium", "page_start": 453, "page_end": 458, "rukus": 5,  "sajdahs": 1, "popular": False},
    39:  {"difficulty": "medium", "page_start": 458, "page_end": 467, "rukus": 8,  "sajdahs": 1, "popular": False},
    40:  {"difficulty": "medium", "page_start": 467, "page_end": 476, "rukus": 9,  "sajdahs": 0, "popular": False},
    41:  {"difficulty": "medium", "page_start": 477, "page_end": 482, "rukus": 6,  "sajdahs": 1, "popular": False},
    42:  {"difficulty": "medium", "page_start": 483, "page_end": 489, "rukus": 5,  "sajdahs": 0, "popular": False},
    43:  {"difficulty": "medium", "page_start": 489, "page_end": 495, "rukus": 7,  "sajdahs": 0, "popular": False},
    44:  {"difficulty": "easy",   "page_start": 496, "page_end": 498, "rukus": 3,  "sajdahs": 0, "popular": False},
    45:  {"difficulty": "easy",   "page_start": 499, "page_end": 502, "rukus": 4,  "sajdahs": 1, "popular": False},
    46:  {"difficulty": "medium", "page_start": 502, "page_end": 506, "rukus": 4,  "sajdahs": 0, "popular": False},
    47:  {"difficulty": "medium", "page_start": 507, "page_end": 510, "rukus": 4,  "sajdahs": 0, "popular": False},
    48:  {"difficulty": "medium", "page_start": 511, "page_end": 515, "rukus": 4,  "sajdahs": 0, "popular": False},
    49:  {"difficulty": "easy",   "page_start": 515, "page_end": 517, "rukus": 2,  "sajdahs": 0, "popular": False},
    50:  {"difficulty": "easy",   "page_start": 518, "page_end": 520, "rukus": 3,  "sajdahs": 0, "popular": False},
    51:  {"difficulty": "easy",   "page_start": 520, "page_end": 523, "rukus": 3,  "sajdahs": 0, "popular": False},
    52:  {"difficulty": "easy",   "page_start": 523, "page_end": 525, "rukus": 2,  "sajdahs": 0, "popular": False},
    53:  {"difficulty": "easy",   "page_start": 526, "page_end": 528, "rukus": 3,  "sajdahs": 1, "popular": False},
    54:  {"difficulty": "medium", "page_start": 528, "page_end": 531, "rukus": 3,  "sajdahs": 0, "popular": False},
    55:  {"difficulty": "medium", "page_start": 531, "page_end": 534, "rukus": 3,  "sajdahs": 0, "popular": True},
    56:  {"difficulty": "medium", "page_start": 534, "page_end": 537, "rukus": 3,  "sajdahs": 0, "popular": True},
    57:  {"difficulty": "medium", "page_start": 537, "page_end": 541, "rukus": 4,  "sajdahs": 0, "popular": False},
    58:  {"difficulty": "medium", "page_start": 542, "page_end": 545, "rukus": 3,  "sajdahs": 0, "popular": False},
    59:  {"difficulty": "medium", "page_start": 545, "page_end": 548, "rukus": 3,  "sajdahs": 0, "popular": False},
    60:  {"difficulty": "medium", "page_start": 549, "page_end": 551, "rukus": 2,  "sajdahs": 0, "popular": False},
    61:  {"difficulty": "easy",   "page_start": 551, "page_end": 552, "rukus": 2,  "sajdahs": 0, "popular": False},
    62:  {"difficulty": "easy",   "page_start": 553, "page_end": 554, "rukus": 2,  "sajdahs": 0, "popular": False},
    63:  {"difficulty": "easy",   "page_start": 554, "page_end": 555, "rukus": 2,  "sajdahs": 0, "popular": False},
    64:  {"difficulty": "easy",   "page_start": 556, "page_end": 557, "rukus": 2,  "sajdahs": 0, "popular": False},
    65:  {"difficulty": "easy",   "page_start": 558, "page_end": 559, "rukus": 2,  "sajdahs": 0, "popular": False},
    66:  {"difficulty": "easy",   "page_start": 560, "page_end": 561, "rukus": 2,  "sajdahs": 0, "popular": False},
    67:  {"difficulty": "medium", "page_start": 562, "page_end": 564, "rukus": 2,  "sajdahs": 0, "popular": True},
    68:  {"difficulty": "easy",   "page_start": 564, "page_end": 566, "rukus": 2,  "sajdahs": 1, "popular": False},
    69:  {"difficulty": "easy",   "page_start": 566, "page_end": 568, "rukus": 2,  "sajdahs": 0, "popular": False},
    70:  {"difficulty": "easy",   "page_start": 568, "page_end": 570, "rukus": 2,  "sajdahs": 0, "popular": False},
    71:  {"difficulty": "easy",   "page_start": 570, "page_end": 571, "rukus": 2,  "sajdahs": 0, "popular": False},
    72:  {"difficulty": "easy",   "page_start": 572, "page_end": 573, "rukus": 2,  "sajdahs": 0, "popular": False},
    73:  {"difficulty": "easy",   "page_start": 574, "page_end": 575, "rukus": 2,  "sajdahs": 0, "popular": False},
    74:  {"difficulty": "easy",   "page_start": 575, "page_end": 577, "rukus": 2,  "sajdahs": 1, "popular": False},
    75:  {"difficulty": "easy",   "page_start": 577, "page_end": 578, "rukus": 2,  "sajdahs": 0, "popular": False},
    76:  {"difficulty": "easy",   "page_start": 578, "page_end": 580, "rukus": 2,  "sajdahs": 0, "popular": False},
    77:  {"difficulty": "easy",   "page_start": 580, "page_end": 581, "rukus": 2,  "sajdahs": 0, "popular": False},
    78:  {"difficulty": "easy",   "page_start": 582, "page_end": 583, "rukus": 2,  "sajdahs": 0, "popular": True},
    79:  {"difficulty": "easy",   "page_start": 583, "page_end": 584, "rukus": 2,  "sajdahs": 0, "popular": False},
    80:  {"difficulty": "easy",   "page_start": 585, "page_end": 585, "rukus": 1,  "sajdahs": 0, "popular": False},
    81:  {"difficulty": "easy",   "page_start": 586, "page_end": 586, "rukus": 1,  "sajdahs": 0, "popular": False},
    82:  {"difficulty": "easy",   "page_start": 587, "page_end": 587, "rukus": 1,  "sajdahs": 0, "popular": False},
    83:  {"difficulty": "easy",   "page_start": 587, "page_end": 589, "rukus": 1,  "sajdahs": 0, "popular": False},
    84:  {"difficulty": "easy",   "page_start": 589, "page_end": 590, "rukus": 1,  "sajdahs": 1, "popular": False},
    85:  {"difficulty": "easy",   "page_start": 590, "page_end": 591, "rukus": 1,  "sajdahs": 0, "popular": False},
    86:  {"difficulty": "easy",   "page_start": 591, "page_end": 591, "rukus": 1,  "sajdahs": 0, "popular": False},
    87:  {"difficulty": "easy",   "page_start": 591, "page_end": 592, "rukus": 1,  "sajdahs": 0, "popular": True},
    88:  {"difficulty": "easy",   "page_start": 592, "page_end": 592, "rukus": 1,  "sajdahs": 0, "popular": False},
    89:  {"difficulty": "easy",   "page_start": 593, "page_end": 594, "rukus": 1,  "sajdahs": 0, "popular": False},
    90:  {"difficulty": "easy",   "page_start": 594, "page_end": 594, "rukus": 1,  "sajdahs": 0, "popular": False},
    91:  {"difficulty": "easy",   "page_start": 595, "page_end": 595, "rukus": 1,  "sajdahs": 0, "popular": False},
    92:  {"difficulty": "easy",   "page_start": 595, "page_end": 596, "rukus": 1,  "sajdahs": 0, "popular": False},
    93:  {"difficulty": "easy",   "page_start": 596, "page_end": 596, "rukus": 1,  "sajdahs": 0, "popular": True},
    94:  {"difficulty": "easy",   "page_start": 596, "page_end": 596, "rukus": 1,  "sajdahs": 0, "popular": True},
    95:  {"difficulty": "easy",   "page_start": 597, "page_end": 597, "rukus": 1,  "sajdahs": 0, "popular": False},
    96:  {"difficulty": "easy",   "page_start": 597, "page_end": 598, "rukus": 1,  "sajdahs": 1, "popular": True},
    97:  {"difficulty": "easy",   "page_start": 598, "page_end": 598, "rukus": 1,  "sajdahs": 0, "popular": True},
    98:  {"difficulty": "easy",   "page_start": 598, "page_end": 599, "rukus": 1,  "sajdahs": 1, "popular": False},
    99:  {"difficulty": "easy",   "page_start": 599, "page_end": 599, "rukus": 1,  "sajdahs": 0, "popular": True},
    100: {"difficulty": "easy",   "page_start": 599, "page_end": 600, "rukus": 1,  "sajdahs": 0, "popular": False},
    101: {"difficulty": "easy",   "page_start": 600, "page_end": 600, "rukus": 1,  "sajdahs": 0, "popular": True},
    102: {"difficulty": "easy",   "page_start": 600, "page_end": 600, "rukus": 1,  "sajdahs": 0, "popular": True},
    103: {"difficulty": "easy",   "page_start": 601, "page_end": 601, "rukus": 1,  "sajdahs": 0, "popular": True},
    104: {"difficulty": "easy",   "page_start": 601, "page_end": 601, "rukus": 1,  "sajdahs": 0, "popular": False},
    105: {"difficulty": "easy",   "page_start": 601, "page_end": 601, "rukus": 1,  "sajdahs": 0, "popular": True},
    106: {"difficulty": "easy",   "page_start": 602, "page_end": 602, "rukus": 1,  "sajdahs": 0, "popular": False},
    107: {"difficulty": "easy",   "page_start": 602, "page_end": 602, "rukus": 1,  "sajdahs": 0, "popular": True},
    108: {"difficulty": "easy",   "page_start": 602, "page_end": 602, "rukus": 1,  "sajdahs": 0, "popular": True},
    109: {"difficulty": "easy",   "page_start": 603, "page_end": 603, "rukus": 1,  "sajdahs": 0, "popular": True},
    110: {"difficulty": "easy",   "page_start": 603, "page_end": 603, "rukus": 1,  "sajdahs": 0, "popular": True},
    111: {"difficulty": "easy",   "page_start": 603, "page_end": 603, "rukus": 1,  "sajdahs": 0, "popular": False},
    112: {"difficulty": "easy",   "page_start": 604, "page_end": 604, "rukus": 1,  "sajdahs": 0, "popular": True},
    113: {"difficulty": "easy",   "page_start": 604, "page_end": 604, "rukus": 1,  "sajdahs": 0, "popular": True},
    114: {"difficulty": "easy",   "page_start": 604, "page_end": 604, "rukus": 1,  "sajdahs": 0, "popular": True},
}

# --- Surah-level philosophy tags ---------------------------------------------
SURAH_PHILOSOPHY_TAGS = {
    1:   ["monotheism", "worship", "guidance"],
    2:   ["law", "ethics", "monotheism", "eschatology", "prophethood"],
    3:   ["prophethood", "monotheism", "kalam", "falsafa", "epistemology"],
    4:   ["law", "ethics"],
    5:   ["law", "ethics", "prophethood"],
    6:   ["monotheism", "cosmology", "prophethood", "causality"],
    7:   ["prophethood", "eschatology", "history"],
    8:   ["causality", "law", "ethics"],
    9:   ["law", "politics", "history"],
    10:  ["prophethood", "monotheism", "eschatology"],
    11:  ["prophethood", "history", "eschatology"],
    12:  ["prophethood", "history", "ethics"],
    13:  ["cosmology", "monotheism", "causality"],
    14:  ["prophethood", "monotheism", "eschatology"],
    15:  ["prophethood", "history", "cosmology"],
    16:  ["cosmology", "monotheism", "law"],
    17:  ["monotheism", "ethics", "prophethood"],
    18:  ["epistemology", "history", "eschatology", "prophethood"],
    19:  ["prophethood", "monotheism"],
    20:  ["prophethood", "monotheism", "ethics"],
    21:  ["prophethood", "monotheism", "eschatology"],
    22:  ["worship", "eschatology", "law"],
    23:  ["monotheism", "eschatology", "ethics"],
    24:  ["law", "ethics", "ishraq"],
    25:  ["prophethood", "eschatology", "monotheism"],
    26:  ["prophethood", "history"],
    27:  ["prophethood", "history", "cosmology"],
    28:  ["prophethood", "history", "ethics"],
    29:  ["monotheism", "prophethood", "cosmology"],
    30:  ["history", "cosmology", "prophethood"],
    31:  ["wisdom", "monotheism", "ethics"],
    32:  ["cosmology", "eschatology", "monotheism"],
    33:  ["law", "prophethood", "ethics"],
    34:  ["monotheism", "eschatology", "history"],
    35:  ["cosmology", "monotheism", "eschatology"],
    36:  ["prophethood", "eschatology", "monotheism"],
    37:  ["prophethood", "monotheism", "eschatology"],
    38:  ["prophethood", "eschatology"],
    39:  ["monotheism", "eschatology", "tasawwuf"],
    40:  ["monotheism", "eschatology", "prophethood"],
    41:  ["cosmology", "prophethood", "eschatology"],
    42:  ["law", "monotheism", "prophethood"],
    43:  ["prophethood", "monotheism", "history"],
    44:  ["eschatology", "history"],
    45:  ["cosmology", "eschatology", "law"],
    46:  ["prophethood", "history", "eschatology"],
    47:  ["law", "ethics", "politics"],
    48:  ["law", "politics", "history"],
    49:  ["ethics", "law"],
    50:  ["cosmology", "eschatology", "monotheism"],
    51:  ["cosmology", "prophethood", "eschatology"],
    52:  ["cosmology", "eschatology"],
    53:  ["prophethood", "cosmology", "epistemology"],
    54:  ["prophethood", "history", "eschatology"],
    55:  ["cosmology", "monotheism", "eschatology"],
    56:  ["eschatology", "cosmology"],
    57:  ["ontology", "cosmology", "monotheism", "tasawwuf"],
    58:  ["law", "ethics"],
    59:  ["monotheism", "law", "ethics"],
    60:  ["law", "ethics", "politics"],
    61:  ["prophethood", "monotheism", "law"],
    62:  ["law", "worship"],
    63:  ["ethics", "law"],
    64:  ["eschatology", "monotheism"],
    65:  ["law"],
    66:  ["law", "ethics"],
    67:  ["cosmology", "monotheism", "epistemology"],
    68:  ["ethics", "prophethood"],
    69:  ["eschatology"],
    70:  ["eschatology", "ethics"],
    71:  ["prophethood", "history"],
    72:  ["monotheism"],
    73:  ["worship", "prophethood"],
    74:  ["prophethood", "ethics"],
    75:  ["eschatology", "cosmology"],
    76:  ["ethics", "eschatology", "worship"],
    77:  ["eschatology", "cosmology"],
    78:  ["eschatology", "cosmology"],
    79:  ["eschatology", "prophethood"],
    80:  ["ethics", "prophethood"],
    81:  ["eschatology", "prophethood"],
    82:  ["eschatology"],
    83:  ["ethics", "eschatology"],
    84:  ["eschatology", "cosmology"],
    85:  ["prophethood", "history", "eschatology"],
    86:  ["cosmology"],
    87:  ["worship", "monotheism"],
    88:  ["eschatology"],
    89:  ["eschatology", "history"],
    90:  ["ethics"],
    91:  ["ethics", "psychology"],
    92:  ["ethics", "eschatology"],
    93:  ["prophethood", "ethics"],
    94:  ["prophethood", "ethics"],
    95:  ["eschatology", "monotheism"],
    96:  ["prophethood", "epistemology"],
    97:  ["worship"],
    98:  ["prophethood", "law"],
    99:  ["eschatology"],
    100: ["eschatology", "ethics"],
    101: ["eschatology"],
    102: ["ethics", "eschatology"],
    103: ["ethics", "eschatology"],
    104: ["ethics", "eschatology"],
    105: ["history"],
    106: ["monotheism", "history"],
    107: ["ethics", "worship"],
    108: ["worship", "prophethood"],
    109: ["monotheism"],
    110: ["prophethood", "history"],
    111: ["history", "eschatology"],
    112: ["monotheism", "kalam", "athari"],
    113: ["worship"],
    114: ["worship"],
}

# --- Verse-level extras: sparse dict {chapter: {verse: extra_fields}} -------
# Only add entries for verses that have specific custom data.
# exegesis_key must match a key in exegesis-data.json / the DB exegesis store.
VERSE_EXTRAS = {
    2: {
        115: {
            "philosophy_tags": ["ontology", "tasawwuf"],
            "exegesis_key": "2:115",
            "seerah_context": {"event": None, "period": "medinan", "asbab_al_nuzul":
                "Revealed regarding the direction of prayer (qibla) during early Muslim migration."}
        },
        255: {
            "hifz_notes": {"similar_to": [], "key_word": "Ayat al-Kursi", "recitation_note":
                "Most memorised single verse in Islam. High reward upon recitation."},
        }
    },
    3: {
        190: {
            "philosophy_tags": ["cosmology", "falsafa", "epistemology"],
            "exegesis_key": "3:190",
        }
    },
    8: {
        17: {
            "philosophy_tags": ["causality", "kalam"],
            "exegesis_key": "8:17",
        }
    },
    20: {
        5: {
            "philosophy_tags": ["kalam", "athari", "ontology"],
            "exegesis_key": "20:5",
        }
    },
    24: {
        35: {
            "philosophy_tags": ["ishraq", "tasawwuf", "ontology"],
            "exegesis_key": "24:35",
        }
    },
    28: {
        88: {
            "philosophy_tags": ["ontology", "falsafa", "tasawwuf"],
            "exegesis_key": "28:88",
        }
    },
    34: {
        3: {
            "philosophy_tags": ["kalam", "cosmology", "epistemology"],
            "exegesis_key": "34:3",
        }
    },
    42: {
        11: {
            "philosophy_tags": ["kalam", "athari", "monotheism"],
            "exegesis_key": "42:11",
        }
    },
    48: {
        10: {
            "philosophy_tags": ["kalam", "athari"],
            "exegesis_key": "48:10",
        }
    },
    57: {
        3: {
            "philosophy_tags": ["ontology", "tasawwuf", "ishraq"],
            "exegesis_key": "57:3",
        }
    },
    59: {
        2: {
            "philosophy_tags": ["epistemology", "falsafa"],
            "exegesis_key": "59:2",
        }
    },
    89: {
        27: {
            "philosophy_tags": ["psychology", "tasawwuf"],
            "exegesis_key": "89:27",
        }
    },
}

# ──────────────────────────────────────────────────────────────────────────────
# 2.  HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def load_json(path):
    """Load a JSON file and return parsed data, or None on failure."""
    if not os.path.exists(path):
        print(f"  [WARN] File not found: {path}")
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_surahs_py():
    """Import SURAHS list from surahs.py without executing other code."""
    sys.path.insert(0, BASE)
    try:
        from surahs import SURAHS
        return SURAHS
    except ImportError as e:
        print(f"  [ERROR] Could not import surahs.py: {e}")
        return []


# ──────────────────────────────────────────────────────────────────────────────
# 3.  BUILD FUNCTIONS
# ──────────────────────────────────────────────────────────────────────────────

def build_verse_index(quran_flat):
    """
    Convert the flat quran-data.json list into a nested dict:
      { chapter: { verse: {"arabic": ..., "english": ...} } }
    """
    index = {}
    for v in quran_flat:
        ch  = v["chapter"]
        ver = v["verse"]
        index.setdefault(ch, {})[ver] = {
            "arabic":  v.get("arabic", ""),
            "english": v.get("english") or v.get("text", ""),
        }
    return index


def build_surahs(surahs_meta, verse_index, wbw_data):
    """
    Merge surah metadata, verse text, word-by-word, and all custom fields.
    """
    result = []
    for s in surahs_meta:
        sid = s["id"]
        h   = HIFZ_DATA.get(sid, {})

        surah_obj = {
            # ── Identity ──
            "id":               sid,
            "name":             s["name"],
            "english":          s["english"],
            "verse_count":      s["verses"],
            "aliases":          s["aliases"],

            # ── Quran science ──
            "revelation_order": REVELATION_ORDER.get(sid, None),
            "revelation_place": get_revelation_place(sid),
            "juz_start":        JUZ_START.get(sid, None),

            # ── Seerah period ──
            "seerah_period":    SEERAH_PERIOD.get(sid, "meccan"),

            # ── Hifz ──
            "hifz": {
                "difficulty":               h.get("difficulty", "medium"),
                "page_start":               h.get("page_start"),
                "page_end":                 h.get("page_end"),
                "rukus":                    h.get("rukus", 1),
                "sajdahs":                  h.get("sajdahs", 0),
                "popular_for_memorisation": h.get("popular", False),
            },

            # ── Philosophy tags ──
            "philosophy_tags": SURAH_PHILOSOPHY_TAGS.get(sid, []),

            # ── Verses ──
            "verses": build_verses(sid, s["verses"], verse_index, wbw_data),
        }
        result.append(surah_obj)
        print(f"  ✓ Surah {sid:>3} {s['name']} — {s['verses']} verses")

    return result


def build_verses(chapter, verse_count, verse_index, wbw_data):
    """Build verse list for one surah."""
    ch_verses  = verse_index.get(chapter, {})
    ch_wbw     = wbw_data.get(str(chapter), {})
    ch_extras  = VERSE_EXTRAS.get(chapter, {})

    verses = []
    for v_num in range(1, verse_count + 1):
        text = ch_verses.get(v_num, {})
        wbw  = ch_wbw.get(str(v_num), [])
        ex   = ch_extras.get(v_num, {})

        verse_obj = {
            "verse":   v_num,
            "arabic":  text.get("arabic", ""),
            "english": text.get("english", ""),

            # Word-by-word (already in correct format from quran-wbw.json)
            "wbw": wbw,

            # Hifz notes — default blank; populated from VERSE_EXTRAS
            "hifz_notes": ex.get("hifz_notes", {
                "similar_to":      [],
                "key_word":        None,
                "recitation_note": None,
            }),

            # Seerah context
            "seerah_context": ex.get("seerah_context", {
                "event":           None,
                "period":          None,
                "asbab_al_nuzul":  None,
            }),

            # Philosophy
            "philosophy_tags": ex.get("philosophy_tags", []),
            "exegesis_key":    ex.get("exegesis_key", None),
        }
        verses.append(verse_obj)

    return verses


def enrich_hadiths(hadiths):
    """Keep existing hadith structure; no auto-tagging for now."""
    # Philosophy tags are left empty by default — add to VERSE_EXTRAS-style
    # dict if you want to annotate specific hadiths later.
    for h in hadiths:
        h.setdefault("philosophy_tags", [])
    return hadiths


def enrich_duas(duas):
    """Extract chapter/verse from dua source strings where possible."""
    import re
    for d in duas:
        d.setdefault("chapter", None)
        d.setdefault("verse",   None)
        # Try to parse "Surah X Y:Z" or "Y:Z" from source string
        src = d.get("source", "")
        m = re.search(r'(\d+):(\d+)', src)
        if m:
            d["chapter"] = int(m.group(1))
            d["verse"]   = int(m.group(2))
    return duas


def enrich_exegesis(exegesis):
    """Add philosophy_tags to each exegesis verse."""
    TAG_MAP = {
        "3:190":  ["falsafa", "cosmology", "epistemology"],
        "24:35":  ["ishraq", "tasawwuf", "ontology"],
        "28:88":  ["falsafa", "tasawwuf", "ontology"],
        "42:11":  ["kalam", "athari", "monotheism"],
        "2:115":  ["tasawwuf", "ontology"],
        "8:17":   ["kalam", "causality"],
        "89:27":  ["tasawwuf", "psychology"],
        "59:2":   ["falsafa", "epistemology"],
        "48:10":  ["kalam", "athari"],
        "20:5":   ["kalam", "athari", "ontology"],
        "34:3":   ["kalam", "cosmology", "epistemology"],
        "57:3":   ["tasawwuf", "ontology"],
    }
    for key, val in exegesis.items():
        val["philosophy_tags"] = TAG_MAP.get(key, [])
    return exegesis


def enrich_sources(sources):
    """Add philosophy_tags to each primary source."""
    TAG_MAP = {
        "ibn_sina_floating_man":    ["falsafa", "psychology", "epistemology"],
        "al_ghazali_causality":     ["kalam", "causality"],
        "ibn_rushd_decisive":       ["falsafa", "epistemology", "law"],
        "ibn_khaldun_asabiyyah":    ["history", "politics", "ethics"],
        "mulla_sadra_existence":    ["ishraq", "ontology", "tasawwuf"],
    }
    for key, val in sources.items():
        val["philosophy_tags"] = TAG_MAP.get(key, [])
    return sources


# ──────────────────────────────────────────────────────────────────────────────
# 4.  MAIN
# ──────────────────────────────────────────────────────────────────────────────

def main():
    print("\n══════════════════════════════════════════════════")
    print("  Quranopedia Database Builder")
    print("══════════════════════════════════════════════════\n")

    out_dir = os.path.join(BASE, "db")
    os.makedirs(out_dir, exist_ok=True)

    # ── Load source files ────────────────────────────────────────────────────

    print("► Loading source files …")
    quran_flat = load_json(os.path.join(BASE, "wiki", "quran-data.json"))
    wbw_raw    = load_json(os.path.join(BASE, "wiki", "quran-wbw.json"))
    hadith_raw = load_json(os.path.join(BASE, "wiki", "hadith-data.json"))
    dua_raw    = load_json(os.path.join(BASE, "wiki", "dua-data.json"))
    exegesis   = load_json(os.path.join(BASE, "philosophy", "exegesis-data.json"))
    sources    = load_json(os.path.join(BASE, "philosophy", "sources-data.json"))
    philo_data = load_json(os.path.join(BASE, "philosophy", "philosophy-data.json"))

    surahs_meta = load_surahs_py()

    if not quran_flat or not quran_flat.get("quran"):
        print("[ERROR] Could not load quran-data.json — aborting.")
        sys.exit(1)

    # ── Index verses ─────────────────────────────────────────────────────────

    print("\n► Indexing verse text …")
    verse_index = build_verse_index(quran_flat["quran"])
    print(f"  Indexed {sum(len(v) for v in verse_index.values())} verses across "
          f"{len(verse_index)} chapters.")

    wbw_data = wbw_raw or {}

    # ── Build surahs ─────────────────────────────────────────────────────────

    print("\n► Building surah + verse objects …")
    surahs = build_surahs(surahs_meta, verse_index, wbw_data)

    # ── Enrich supporting datasets ───────────────────────────────────────────

    print("\n► Enriching hadiths …")
    hadiths = enrich_hadiths(hadith_raw.get("hadiths", []) if hadith_raw else [])
    print(f"  {len(hadiths)} hadiths processed.")

    print("► Enriching duas …")
    duas = enrich_duas(dua_raw.get("duas", []) if dua_raw else [])
    print(f"  {len(duas)} duas processed.")

    print("► Enriching exegesis verses …")
    exegesis = enrich_exegesis(exegesis or {})
    print(f"  {len(exegesis)} exegesis entries tagged.")

    print("► Enriching primary sources …")
    sources = enrich_sources(sources or {})
    print(f"  {len(sources)} primary sources tagged.")

    # Philosophy articles: pass-through (philosophy-data.json is built by build_db.py)
    # If not present on disk, leave as empty dict.
    philosophy_articles = philo_data or {}

    # ── Assemble final DB ────────────────────────────────────────────────────

    total_verses = sum(len(s["verses"]) for s in surahs)

    db = {
        "meta": {
            "version":        "1.0.0",
            "build_date":     datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'),
            "surah_count":    len(surahs),
            "verse_count":    total_verses,
            "hadith_count":   len(hadiths),
            "dua_count":      len(duas),
            "description":    "Quranopedia unified local database. No live API calls required.",
            "seerah_periods": [
                "early_meccan", "middle_meccan", "late_meccan", "medinan", "mixed"
            ],
            "philosophy_tags": [
                "monotheism", "prophethood", "eschatology", "law", "ethics",
                "kalam", "falsafa", "ishraq", "tasawwuf", "athari",
                "cosmology", "causality", "ontology", "psychology",
                "epistemology", "politics", "history", "guidance", "worship", "afterlife"
            ],
        },
        "surahs":               surahs,
        "hadiths":              hadiths,
        "duas":                 duas,
        "philosophy_articles":  philosophy_articles,
        "exegesis_verses":      exegesis,
        "primary_sources":      sources,
    }

    # ── Write outputs ────────────────────────────────────────────────────────

    out_path      = os.path.join(out_dir, "quranopedia.json")
    out_min_path  = os.path.join(out_dir, "quranopedia.min.json")
    # Also deploy into wiki/ so it's served by Netlify (deploy dir = wiki/)
    wiki_min_path = os.path.join(BASE, "wiki", "quranopedia.min.json")

    print(f"\n► Writing {out_path} …")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"  ✓ Wrote {size_mb:.1f} MB (pretty-printed)")

    minified_str = json.dumps(db, ensure_ascii=False, separators=(',', ':'))

    print(f"► Writing {out_min_path} …")
    with open(out_min_path, "w", encoding="utf-8") as f:
        f.write(minified_str)

    size_mb_min = os.path.getsize(out_min_path) / (1024 * 1024)
    print(f"  ✓ Wrote {size_mb_min:.1f} MB (minified, db/)")

    print(f"► Copying to {wiki_min_path} …")
    with open(wiki_min_path, "w", encoding="utf-8") as f:
        f.write(minified_str)
    print(f"  ✓ Copied to wiki/ (deploy target)")

    # ── Summary ──────────────────────────────────────────────────────────────

    print("\n══════════════════════════════════════════════════")
    print("  Build complete!")
    print(f"  Surahs:    {db['meta']['surah_count']}")
    print(f"  Verses:    {db['meta']['verse_count']}")
    print(f"  Hadiths:   {db['meta']['hadith_count']}")
    print(f"  Duas:      {db['meta']['dua_count']}")
    print(f"  Exegesis:  {len(exegesis)} verses annotated")
    print(f"  Sources:   {len(sources)} scholar texts")
    print(f"\n  Output: db/quranopedia.json        ({size_mb:.1f} MB)")
    print(f"          db/quranopedia.min.json    ({size_mb_min:.1f} MB)")
    print("══════════════════════════════════════════════════\n")


if __name__ == "__main__":
    main()
