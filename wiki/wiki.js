// Quran Encyclopedia - Client Application Logic

// 1. Top-Level Error Boundary to capture and display any browser-specific runtime exceptions
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Quran Encyclopedia Error caught:", message, "at", source, ":", lineno);
    try {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.backgroundColor = '#ffdddd';
        errorDiv.style.color = '#990000';
        errorDiv.style.padding = '15px';
        errorDiv.style.zIndex = '99999';
        errorDiv.style.borderBottom = '2px solid #ff9999';
        errorDiv.style.fontFamily = 'monospace';
        errorDiv.style.fontSize = '12px';
        errorDiv.innerHTML = `<b>JavaScript Error Detected:</b> ${message}<br>File: ${source.split('/').pop()}:${lineno}:${colno}`;
        document.body.appendChild(errorDiv);
    } catch (e) {
        alert(`Uncaught JS Error: ${message} at line ${lineno}`);
    }
    return false;
};

// Global State
let currentSurahs = [];
let activePage = 'main_page';
let quranDatabase = {}; // Indexed by chapter -> verse -> text
let tafsirCache = {}; // Exegesis text cache
let localQuranScripture = {}; // Indexed by chapter -> verse -> {arabic, english}
let localWordByWordData = {}; // Indexed by chapter -> verse -> [words]

// Helper to convert standard digits to Arabic-Indic digits
function toArabicDigits(num) {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => {
        const parsed = parseInt(digit);
        return isNaN(parsed) ? digit : arabicDigits[parsed];
    }).join('');
}

// Format Arabic verse text to append the end of ayah ornament with the verse number inside it
function formatArabicVerseText(text, verseNum) {
    if (!text) return '';
    // Use Unicode End of Ayah marker (\u06dd) with Arabic-Indic digits
    return text.trim() + ' ۝' + toArabicDigits(verseNum);
}

// Surah Metadata List
const SURAH_METADATA = [
    {"id": 1, "name": "Al-Fatihah", "english": "The Opening", "verses": 7, "type": "Meccan", "aliases": ["fatihah", "opening", "theopening", "alfatihah"]},
    {"id": 2, "name": "Al-Baqarah", "english": "The Cow", "verses": 286, "type": "Medinan", "aliases": ["baqarah", "cow", "thecow", "albaqarah"]},
    {"id": 3, "name": "Ali 'Imran", "english": "Family of Imran", "verses": 200, "type": "Medinan", "aliases": ["imran", "familyofimran", "aliimran", "aalimran", "ali-imran"]},
    {"id": 4, "name": "An-Nisa", "english": "The Women", "verses": 176, "type": "Medinan", "aliases": ["nisa", "women", "thewomen", "annisa"]},
    {"id": 5, "name": "Al-Ma'idah", "english": "The Table Spread", "verses": 120, "type": "Medinan", "aliases": ["maidah", "table", "tablespread", "thetablespread", "almaidah"]},
    {"id": 6, "name": "Al-An'am", "english": "The Cattle", "verses": 165, "type": "Meccan", "aliases": ["anam", "cattle", "thecattle", "alanam"]},
    {"id": 7, "name": "Al-A'raf", "english": "The Heights", "verses": 206, "type": "Meccan", "aliases": ["araf", "heights", "theheights", "alaraf"]},
    {"id": 8, "name": "Al-Anfal", "english": "The Spoils of War", "verses": 75, "type": "Medinan", "aliases": ["anfal", "spoils", "spoilsofwar", "thespoilsofwar", "alanfal"]},
    {"id": 9, "name": "At-Tawbah", "english": "The Repentance", "verses": 129, "type": "Medinan", "aliases": ["tawbah", "repentance", "therepentance", "attawbah", "baraah"]},
    {"id": 10, "name": "Yunus", "english": "Jonah", "verses": 109, "type": "Meccan", "aliases": ["yunus", "jonah"]},
    {"id": 11, "name": "Hud", "english": "Hud", "verses": 123, "type": "Meccan", "aliases": ["hud"]},
    {"id": 12, "name": "Yusuf", "english": "Joseph", "verses": 111, "type": "Meccan", "aliases": ["yusuf", "joseph"]},
    {"id": 13, "name": "Ar-Ra'd", "english": "The Thunder", "verses": 43, "type": "Medinan", "aliases": ["rad", "thunder", "thethunder", "arrad"]},
    {"id": 14, "name": "Ibrahim", "english": "Abraham", "verses": 52, "type": "Meccan", "aliases": ["ibrahim", "abraham"]},
    {"id": 15, "name": "Al-Hijr", "english": "The Rocky Tract", "verses": 99, "type": "Meccan", "aliases": ["hijr", "rocky", "rockytract", "stoneland", "thestoneland", "alhijr"]},
    {"id": 16, "name": "An-Nahl", "english": "The Bee", "verses": 128, "type": "Meccan", "aliases": ["nahl", "bee", "thebee", "annahl"]},
    {"id": 17, "name": "Al-Isra", "english": "The Night Journey", "verses": 111, "type": "Meccan", "aliases": ["isra", "nightjourney", "thenightjourney", "alisra", "subhan", "baniisrail", "childrenofisrael"]},
    {"id": 18, "name": "Al-Kahf", "english": "The Cave", "verses": 110, "type": "Meccan", "aliases": ["kahf", "cave", "thecave", "alkahf"]},
    {"id": 19, "name": "Maryam", "english": "Mary", "verses": 98, "type": "Meccan", "aliases": ["maryam", "mary"]},
    {"id": 20, "name": "Ta-Ha", "english": "Ta-Ha", "verses": 135, "type": "Meccan", "aliases": ["taha"]},
    {"id": 21, "name": "Al-Anbiya", "english": "The Prophets", "verses": 112, "type": "Meccan", "aliases": ["anbiya", "prophets", "theprophets", "alanbiya"]},
    {"id": 22, "name": "Al-Hajj", "english": "The Pilgrimage", "verses": 78, "type": "Medinan", "aliases": ["hajj", "pilgrimage", "thepilgrimage", "alhajj"]},
    {"id": 23, "name": "Al-Mu'minun", "english": "The Believers", "verses": 118, "type": "Meccan", "aliases": ["muminun", "believers", "thebelievers", "almuminun"]},
    {"id": 24, "name": "An-Nur", "english": "The Light", "verses": 64, "type": "Medinan", "aliases": ["nur", "light", "thelight", "annur"]},
    {"id": 25, "name": "Al-Furqan", "english": "The Criterion", "verses": 77, "type": "Meccan", "aliases": ["furqan", "criterion", "thecriterion", "alfurqan"]},
    {"id": 26, "name": "Ash-Shu'ara", "english": "The Poets", "verses": 227, "type": "Meccan", "aliases": ["shuara", "poets", "thepoets", "ashshuara"]},
    {"id": 27, "name": "An-Naml", "english": "The Ant", "verses": 93, "type": "Meccan", "aliases": ["naml", "ant", "theant", "annaml"]},
    {"id": 28, "name": "Al-Qasas", "english": "The Stories", "verses": 88, "type": "Meccan", "aliases": ["qasas", "stories", "thestories", "alqasas"]},
    {"id": 29, "name": "Al-Ankabut", "english": "The Spider", "verses": 69, "type": "Meccan", "aliases": ["ankabut", "spider", "thespider", "alankabut"]},
    {"id": 30, "name": "Ar-Rum", "english": "The Romans", "verses": 60, "type": "Meccan", "aliases": ["rum", "romans", "theromans", "arrum", "rome", "therome"]},
    {"id": 31, "name": "Luqman", "english": "Luqman", "verses": 34, "type": "Meccan", "aliases": ["luqman"]},
    {"id": 32, "name": "As-Sajdah", "english": "The Prostration", "verses": 30, "type": "Meccan", "aliases": ["sajdah", "prostration", "theprostration", "assajdah"]},
    {"id": 33, "name": "Al-Ahzab", "english": "The Combined Forces", "verses": 73, "type": "Medinan", "aliases": ["ahzab", "combinedforces", "thecombinedforces", "allies", "theallies", "clans", "theclans", "alahzab"]},
    {"id": 34, "name": "Saba", "english": "Sheba", "verses": 54, "type": "Meccan", "aliases": ["saba", "sheba"]},
    {"id": 35, "name": "Fatir", "english": "Originator", "verses": 45, "type": "Meccan", "aliases": ["fatir", "originator", "creator", "thecreator", "malaikah", "angels", "theangels"]},
    {"id": 36, "name": "Ya-Sin", "english": "Ya-Sin", "verses": 83, "type": "Meccan", "aliases": ["yasin", "yasheen"]},
    {"id": 37, "name": "As-Saffat", "english": "Those who set the Ranks", "verses": 182, "type": "Meccan", "aliases": ["saffat", "ranks", "thosewhosettheranks", "thosearrangedinranks", "assaffat"]},
    {"id": 38, "name": "Sad", "english": "The Letter Sad", "verses": 88, "type": "Meccan", "aliases": ["sad"]},
    {"id": 39, "name": "Az-Zumar", "english": "The Troops", "verses": 75, "type": "Meccan", "aliases": ["zumar", "troops", "thetroops", "crowds", "thecrowds", "groups", "thegroups", "azzumar"]},
    {"id": 40, "name": "Ghafir", "english": "The Forgiver", "verses": 85, "type": "Meccan", "aliases": ["ghafir", "forgiver", "theforgiver", "mumin", "believer", "thebeliever"]},
    {"id": 41, "name": "Fussilat", "english": "Explained in Detail", "verses": 54, "type": "Meccan", "aliases": ["fussilat", "explainedindetail", "hamimsajdah"]},
    {"id": 42, "name": "Ash-Shura", "english": "The Consultation", "verses": 53, "type": "Meccan", "aliases": ["shura", "consultation", "theconsultation", "council", "thecouncil", "ashshura"]},
    {"id": 43, "name": "Az-Zukhruf", "english": "The Ornaments of Gold", "verses": 89, "type": "Meccan", "aliases": ["zukhruf", "ornaments", "ornamentsofgold", "goldornaments", "azzukhruf"]},
    {"id": 44, "name": "Ad-Dukhan", "english": "The Smoke", "verses": 59, "type": "Meccan", "aliases": ["dukhan", "smoke", "thesmoke", "addukhan"]},
    {"id": 45, "name": "Al-Jathiyah", "english": "The Crouching", "verses": 37, "type": "Meccan", "aliases": ["jathiyah", "crouching", "thecrouching", "kneeling", "thekneeling", "aljathiyah"]},
    {"id": 46, "name": "Al-Ahqaf", "english": "The Wind-Curved Sandhills", "verses": 35, "type": "Meccan", "aliases": ["ahqaf", "windcurvedsandhills", "sandhills", "thesandhills", "alahqaf"]},
    {"id": 47, "name": "Muhammad", "english": "Muhammad", "verses": 38, "type": "Medinan", "aliases": ["muhammad"]},
    {"id": 48, "name": "Al-Fath", "english": "The Victory", "verses": 29, "type": "Medinan", "aliases": ["fath", "victory", "thevictory", "alfath"]},
    {"id": 49, "name": "Al-Hujurat", "english": "The Dwellings", "verses": 18, "type": "Medinan", "aliases": ["hujurat", "dwellings", "thedwellings", "chambers", "thechambers", "privatechambers", "alhujurat"]},
    {"id": 50, "name": "Qaf", "english": "The Letter Qaf", "verses": 45, "type": "Meccan", "aliases": ["qaf"]},
    {"id": 51, "name": "Adh-Dhariyat", "english": "The Winnowing Winds", "verses": 60, "type": "Meccan", "aliases": ["dhariyat", "winnowingwinds", "winds", "thedustscatteringwinds", "adhdhariyat"]},
    {"id": 52, "name": "At-Tur", "english": "The Mount", "verses": 49, "type": "Meccan", "aliases": ["tur", "mount", "themount", "attur"]},
    {"id": 53, "name": "An-Najm", "english": "The Star", "verses": 62, "type": "Meccan", "aliases": ["najm", "star", "thestar", "annajm"]},
    {"id": 54, "name": "Al-Qamar", "english": "The Moon", "verses": 55, "type": "Meccan", "aliases": ["qamar", "moon", "themoon", "alqamar"]},
    {"id": 55, "name": "Ar-Rahman", "english": "The Beneficent", "verses": 78, "type": "Medinan", "aliases": ["rahman", "beneficent", "merciful", "themerciful", "theentirelymerciful", "thebeneficent", "arrahman"]},
    {"id": 56, "name": "Al-Waqi'ah", "english": "The Inevitable", "verses": 96, "type": "Meccan", "aliases": ["waqiah", "inevitable", "theinevitable", "theevent", "alwaqiah"]},
    {"id": 57, "name": "Al-Hadid", "english": "The Iron", "verses": 29, "type": "Medinan", "aliases": ["hadid", "iron", "theiron", "alhadid"]},
    {"id": 58, "name": "Al-Mujadilah", "english": "The Pleading Woman", "verses": 22, "type": "Medinan", "aliases": ["mujadilah", "pleading", "pleadingwoman", "shethatdisputes", "thepleadingwoman", "almujadilah"]},
    {"id": 59, "name": "Al-Hashr", "english": "The Exile", "verses": 24, "type": "Medinan", "aliases": ["hashr", "exile", "banishment", "gathering", "thegathering", "theexile", "alhashr"]},
    {"id": 60, "name": "Al-Mumtahanah", "english": "She that is to be examined", "verses": 13, "type": "Medinan", "aliases": ["mumtahanah", "shethatistobeexamined", "examined", "thewomanexamined", "almumtahanah"]},
    {"id": 61, "name": "As-Saff", "english": "The Ranks", "verses": 14, "type": "Medinan", "aliases": ["saff", "ranks", "battlearray", "theranks", "assaff"]},
    {"id": 62, "name": "Al-Jumu'ah", "english": "The Congregation", "verses": 11, "type": "Medinan", "aliases": ["jumuah", "congregation", "friday", "thecongregation", "aljumuah"]},
    {"id": 63, "name": "Al-Munafiqun", "english": "The Hypocrites", "verses": 11, "type": "Medinan", "aliases": ["munafiqun", "hypocrites", "thehypocrites", "almunafiqun"]},
    {"id": 64, "name": "At-Taghabun", "english": "The Mutual Disillusion", "verses": 18, "type": "Medinan", "aliases": ["taghabun", "mutualdisillusion", "mutualdeprivation", "lossandgain", "attaghabun"]},
    {"id": 65, "name": "At-Talaq", "english": "The Divorce", "verses": 12, "type": "Medinan", "aliases": ["talaq", "divorce", "thedivorce", "attalaq"]},
    {"id": 66, "name": "At-Tahrim", "english": "The Prohibition", "verses": 12, "type": "Medinan", "aliases": ["tahrim", "prohibition", "theprohibition", "attahrim"]},
    {"id": 67, "name": "Al-Mulk", "english": "The Sovereignty", "verses": 30, "type": "Meccan", "aliases": ["mulk", "sovereignty", "dominion", "thedominion", "kingdom", "thekingdom", "control", "almulk"]},
    {"id": 68, "name": "Al-Qalam", "english": "The Pen", "verses": 52, "type": "Meccan", "aliases": ["qalam", "pen", "thepen", "alqalam", "nun"]},
    {"id": 69, "name": "Al-Haqqah", "english": "The Reality", "verses": 52, "type": "Meccan", "aliases": ["haqqah", "reality", "theinevitablereality", "thetruth", "theindubitabletruth", "alhaqqah"]},
    {"id": 70, "name": "Al-Ma'arij", "english": "The Ascending Stairways", "verses": 44, "type": "Meccan", "aliases": ["maarij", "ascendingstairways", "waysofascent", "theascendingstairways", "almaarij"]},
    {"id": 71, "name": "Nuh", "english": "Noah", "verses": 28, "type": "Meccan", "aliases": ["nuh", "noah"]},
    {"id": 72, "name": "Al-Jinn", "english": "The Jinn", "verses": 28, "type": "Meccan", "aliases": ["jinn", "thejinn", "aljinn"]},
    {"id": 73, "name": "Al-Muzzammil", "english": "The Enshrouded One", "verses": 20, "type": "Meccan", "aliases": ["muzzammil", "enshroudedone", "wrappedingarments", "theenshroudedone", "almuzzammil"]},
    {"id": 74, "name": "Al-Muddaththir", "english": "The Cloaked One", "verses": 56, "type": "Meccan", "aliases": ["muddaththir", "cloakedone", "thecloakedone", "theoneenwrapped", "almuddaththir"]},
    {"id": 75, "name": "Al-Qiyamah", "english": "The Resurrection", "verses": 40, "type": "Meccan", "aliases": ["qiyamah", "resurrection", "theresurrection", "alqiyamah"]},
    {"id": 76, "name": "Al-Insan", "english": "The Man", "verses": 31, "type": "Medinan", "aliases": ["insan", "man", "human", "time", "theman", "alinsan", "dahr"]},
    {"id": 77, "name": "Al-Mursalat", "english": "Those Sent Forth", "verses": 50, "type": "Meccan", "aliases": ["mursalat", "thosesentforth", "theemissaries", "almursalat"]},
    {"id": 78, "name": "An-Naba", "english": "The Tidings", "verses": 40, "type": "Meccan", "aliases": ["naba", "tidings", "greatnews", "thenews", "annaba"]},
    {"id": 79, "name": "An-Nazi'at", "english": "Those who drag forth", "verses": 46, "type": "Meccan", "aliases": ["naziat", "thosewhodragforth", "thesnatchers", "thosewhoyankout", "annaziat"]},
    {"id": 80, "name": "'Abasa", "english": "He Frowned", "verses": 42, "type": "Meccan", "aliases": ["abasa", "hefrowned", "frowned"]},
    {"id": 81, "name": "At-Takwir", "english": "The Overthrowing", "verses": 29, "type": "Meccan", "aliases": ["takwir", "overthrowing", "foldingup", "theshrouding", "thefoldingup", "attakwir"]},
    {"id": 82, "name": "Al-Infitar", "english": "The Cleaving", "verses": 19, "type": "Meccan", "aliases": ["infitar", "cleaving", "splitting", "thecleavingasunder", "alinfitar"]},
    {"id": 83, "name": "Al-Mutaffifin", "english": "The Defrauders", "verses": 36, "type": "Meccan", "aliases": ["mutaffifin", "defrauders", "thosewhogiveshortmeasure", "almutaffifin"]},
    {"id": 84, "name": "Al-Inshiqaq", "english": "The Sundering", "verses": 25, "type": "Meccan", "aliases": ["inshiqaq", "sundering", "splittingasunder", "thesplittingasunder", "alinshiqaq"]},
    {"id": 85, "name": "Al-Buruj", "english": "The Mansions of the Stars", "verses": 22, "type": "Meccan", "aliases": ["buruj", "mansions", "constellations", "greatstars", "thestars", "alburuj"]},
    {"id": 86, "name": "At-Tariq", "english": "The Night-Comer", "verses": 17, "type": "Meccan", "aliases": ["tariq", "nightcomer", "morningstar", "thenightcomer", "attariq"]},
    {"id": 87, "name": "Al-A'la", "english": "The Most High", "verses": 19, "type": "Meccan", "aliases": ["ala", "mosthigh", "themosthigh", "alala"]},
    {"id": 88, "name": "Al-Ghashiyah", "english": "The Overwhelming", "verses": 26, "type": "Meccan", "aliases": ["ghashiyah", "overwhelming", "theoverwhelming", "thepall", "alghashiyah"]},
    {"id": 89, "name": "Al-Fajr", "english": "The Dawn", "verses": 30, "type": "Meccan", "aliases": ["fajr", "dawn", "thedawn", "alfajr"]},
    {"id": 90, "name": "Al-Balad", "english": "The City", "verses": 20, "type": "Meccan", "aliases": ["balad", "city", "thecity", "theland", "albalad"]},
    {"id": 91, "name": "Ash-Shams", "english": "The Sun", "verses": 15, "type": "Meccan", "aliases": ["shams", "sun", "thesun", "ashshams"]},
    {"id": 92, "name": "Al-Layl", "english": "The Night", "verses": 21, "type": "Meccan", "aliases": ["layl", "night", "thenight", "allayl"]},
    {"id": 93, "name": "Ad-Duha", "english": "The Morning Hours", "verses": 11, "type": "Meccan", "aliases": ["duha", "morninghours", "forenoon", "themorninghours", "adduha"]},
    {"id": 94, "name": "Ash-Sharh", "english": "The Relief", "verses": 8, "type": "Meccan", "aliases": ["sharh", "relief", "solace", "openingup", "expansion", "ashsharh", "inshirah"]},
    {"id": 95, "name": "At-Tin", "english": "The Fig", "verses": 8, "type": "Meccan", "aliases": ["tin", "fig", "thefig", "attin"]},
    {"id": 96, "name": "Al-'Alaq", "english": "The Clot", "verses": 19, "type": "Meccan", "aliases": ["alaq", "clot", "germcell", "clingingspot", "read", "alalaq", "iqra"]},
    {"id": 97, "name": "Al-Qadr", "english": "The Power", "verses": 5, "type": "Meccan", "aliases": ["qadr", "power", "decree", "nightofpower", "destiny", "alqadr"]},
    {"id": 98, "name": "Al-Bayyinah", "english": "The Clear Proof", "verses": 8, "type": "Madinan", "aliases": ["bayyinah", "clearproof", "evidence", "theclearproof", "albayyinah"]},
    {"id": 99, "name": "Az-Zalzalah", "english": "The Earthquake", "verses": 8, "type": "Madinan", "aliases": ["zalzalah", "earthquake", "theearthquake", "azzalzalah", "zilzal"]},
    {"id": 100, "name": "Al-'Adiyat", "english": "The Courser", "verses": 11, "type": "Meccan", "aliases": ["adiyat", "courser", "chargers", "therunners", "aladiyat"]},
    {"id": 101, "name": "Al-Qari'ah", "english": "The Calamity", "verses": 11, "type": "Meccan", "aliases": ["qariah", "calamity", "strikinghour", "disaster", "thestrikinghour", "alqariah"]},
    {"id": 102, "name": "At-Takathur", "english": "The Rivalry in World Increase", "verses": 8, "type": "Meccan", "aliases": ["takathur", "rivalry", "worldincrease", "competition", "pilingup", "attakathur"]},
    {"id": 103, "name": "Al-'Asr", "english": "The Declining Day", "verses": 3, "type": "Meccan", "aliases": ["asr", "decliningday", "time", "theafternoon", "alasr"]},
    {"id": 104, "name": "Al-Humazah", "english": "The Traducer", "verses": 9, "type": "Meccan", "aliases": ["humazah", "traducer", "slanderer", "theslanderer", "alhumazah"]},
    {"id": 105, "name": "Al-Fil", "english": "The Elephant", "verses": 5, "type": "Meccan", "aliases": ["fil", "elephant", "theelephant", "alfil"]},
    {"id": 106, "name": "Quraysh", "english": "Quraysh", "verses": 4, "type": "Meccan", "aliases": ["quraysh", "koreish"]},
    {"id": 107, "name": "Al-Ma'un", "english": "The Small Kindnesses", "verses": 7, "type": "Meccan", "aliases": ["maun", "smallkindnesses", "almsgiving", "assistance", "almaun"]},
    {"id": 108, "name": "Al-Kauthar", "english": "The Abundance", "verses": 3, "type": "Meccan", "aliases": ["kauthar", "abundance", "plenty", "alkauthar"]},
    {"id": 109, "name": "Al-Kafirun", "english": "The Disbelievers", "verses": 6, "type": "Meccan", "aliases": ["kafirun", "disbelievers", "theunbelievers", "alkafirun"]},
    {"id": 110, "name": "An-Nasr", "english": "The Divine Support", "verses": 3, "type": "Madinan", "aliases": ["nasr", "support", "victory", "help", "annasr"]},
    {"id": 111, "name": "Al-Masad", "english": "The Palm Fiber", "verses": 5, "type": "Meccan", "aliases": ["masad", "palmfiber", "lahab", "flame", "almasad"]},
    {"id": 112, "name": "Al-Ikhlas", "english": "The Sincerity", "verses": 4, "type": "Meccan", "aliases": ["ikhlas", "sincerity", "purity", "monotheism", "alikhlas", "tauhid"]},
    {"id": 113, "name": "Al-Falaq", "english": "The Daybreak", "verses": 5, "type": "Meccan", "aliases": ["falaq", "daybreak", "risingdawn", "alfalaq"]},
    {"id": 114, "name": "An-Nas", "english": "Mankind", "verses": 6, "type": "Meccan", "aliases": ["nas", "mankind", "men", "people", "annas"]}
];

let hadithDatabase = [];
let duaDatabase = [];

// Initialize application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    setupTheme();
    populateSidebarSurahs();
    loadQuranDatabase();
    loadHadithDatabase();
    loadDuaDatabase();
    setupEventListeners();
    setupShareEventListeners();

    // Initial routing based on hash or default to main_page
    let initialPage = 'main_page';
    if (window.location.hash) {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        if (hash) {
            initialPage = hash;
        }
    }
    navigateTo(initialPage, false);
}

// Event Listeners setup
function setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const wikiSidebar = document.getElementById('wiki-sidebar');
    if (sidebarToggle && wikiSidebar) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                wikiSidebar.classList.toggle('active');
                wikiSidebar.classList.remove('collapsed');
            } else {
                wikiSidebar.classList.toggle('collapsed');
                wikiSidebar.classList.remove('active');
            }
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Surah list filtering
    const surahFilter = document.getElementById('surah-filter');
    if (surahFilter) {
        surahFilter.addEventListener('input', (e) => {
            filterSidebarSurahs(e.target.value);
        });
    }

    // Portal switcher event listeners
    const portalQuranBtn = document.getElementById('portal-quran-btn');
    const portalHadithBtn = document.getElementById('portal-hadith-btn');
    const quranNavSection = document.getElementById('quran-nav-section');
    const hadithNavSection = document.getElementById('hadith-nav-section');

    if (portalQuranBtn && portalHadithBtn && quranNavSection && hadithNavSection) {
        portalQuranBtn.addEventListener('click', () => {
            portalQuranBtn.classList.add('active');
            portalHadithBtn.classList.remove('active');
            quranNavSection.style.display = 'block';
            hadithNavSection.style.display = 'none';
        });

        portalHadithBtn.addEventListener('click', () => {
            portalHadithBtn.classList.add('active');
            portalQuranBtn.classList.remove('active');
            hadithNavSection.style.display = 'block';
            quranNavSection.style.display = 'none';
            populateSidebarHadiths();
        });
    }

    // Hadith/Dua list filtering
    const hadithFilter = document.getElementById('hadith-filter');
    if (hadithFilter) {
        hadithFilter.addEventListener('input', (e) => {
            filterSidebarHadiths(e.target.value);
        });
    }

    // Search bar functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const suggestionsBox = document.getElementById('search-suggestions');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            showSearchSuggestions(e.target.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeSearch(searchInput.value);
            }
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            executeSearch(searchInput.value);
        });
    }

    // Hide search suggestions on click outside
    document.addEventListener('click', (e) => {
        if (suggestionsBox && !e.target.closest('.search-container')) {
            suggestionsBox.style.display = 'none';
        }
    });

    // Hash change event listener
    window.addEventListener('hashchange', () => {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        const target = hash || 'main_page';
        if (target !== activePage) {
            navigateTo(target, false);
        }
    });

    // TOC show/hide toggle
    const tocToggle = document.getElementById('toc-toggle');
    if (tocToggle) {
        tocToggle.addEventListener('click', (e) => {
            const tocList = document.getElementById('toc-list');
            if (tocList) {
                if (tocList.style.display === 'none') {
                    tocList.style.display = 'block';
                    e.target.innerText = '[hide]';
                } else {
                    tocList.style.display = 'none';
                    e.target.innerText = '[show]';
                }
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // 1. Focus search with '/' key, but not when inside input/textarea
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        // 2. Escape to close share modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('share-modal');
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 200);
            }
        }
    });
}

// Light / Dark mode management with safety catch
function setupTheme() {
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('theme') || 'light';
    } catch (e) {}

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    if (document.body.classList.contains('light-mode')) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        try {
            localStorage.setItem('theme', 'dark');
        } catch (e) {}
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        try {
            localStorage.setItem('theme', 'light');
        } catch (e) {}
    }
}

// Populate Surah index in Left Sidebar
function populateSidebarSurahs() {
    const list = document.getElementById('sidebar-surah-list');
    if (!list) return;

    list.innerHTML = '';
    SURAH_METADATA.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#surah_${s.id}" id="nav-surah_${s.id}">
                <span>${s.name}</span>
                <span class="surah-list-num">${s.id}</span>
            </a>
        `;
        list.appendChild(li);
    });
}

function filterSidebarSurahs(query) {
    const q = query.toLowerCase().trim();
    SURAH_METADATA.forEach(s => {
        const linkEl = document.getElementById(`nav-surah_${s.id}`);
        if (!linkEl) return;
        
        const el = linkEl.parentElement;
        if (!el) return;

        const matchesName = s.name.toLowerCase().includes(q) || s.english.toLowerCase().includes(q);
        const matchesId = s.id.toString() === q;
        const matchesAlias = s.aliases.some(a => a.includes(q));
        if (matchesName || matchesId || matchesAlias) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

// Load Quran translation JSON database
function loadQuranDatabase() {
    fetch('quran-data.json?v=' + Date.now())
        .then(response => response.json())
        .then(data => {
            const verses = data.quran || [];
            verses.forEach(v => {
                const ch = v.chapter;
                const ver = v.verse;
                // Support both new consolidated database format (v.english) and old format (v.text) as fallback
                const txt = v.english || v.text;
                if (!quranDatabase[ch]) {
                    quranDatabase[ch] = {};
                }
                quranDatabase[ch][ver] = txt;
                
                // Store Arabic scripture locally
                if (v.arabic) {
                    if (!localQuranScripture[ch]) {
                        localQuranScripture[ch] = {};
                    }
                    localQuranScripture[ch][ver] = {
                        arabic: formatArabicVerseText(v.arabic, ver),
                        english: txt
                    };
                }
            });
            console.log(`Quran database loaded successfully: ${verses.length} verses indexed.`);
            
            // Fetch word-by-word database
            loadWordByWordDatabase();

            if (activePage.startsWith('surah_') || activePage === 'main_page' || activePage.startsWith('search_')) {
                navigateTo(activePage, false);
            }
        })
        .catch(err => {
            console.error("Error loading Quran data JSON:", err);
        });
}

function loadWordByWordDatabase() {
    fetch('quran-wbw.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            localWordByWordData = data;
            console.log("Local Word-by-Word database loaded successfully.");
        })
        .catch(err => console.error("Error loading local Word-by-Word database:", err));
}

// Search Suggestions logic
function showSearchSuggestions(query) {
    const q = query.toLowerCase().trim();
    const suggestionsBox = document.getElementById('search-suggestions');
    if (!suggestionsBox) return;

    if (!q) {
        suggestionsBox.style.display = 'none';
        return;
    }

    const suggestions = [];

    // Search Seerah Articles
    Object.keys(SEERAH_ARTICLES).forEach(key => {
        const article = SEERAH_ARTICLES[key];
        if (article.title.toLowerCase().includes(q)) {
            suggestions.push({
                type: 'article',
                id: key,
                title: article.title,
                meta: 'Encyclopedic Article'
            });
        }
    });

    // Search Quran Chapters
    SURAH_METADATA.forEach(s => {
        const matchesName = s.name.toLowerCase().includes(q) || s.english.toLowerCase().includes(q);
        const matchesId = s.id.toString() === q;
        const matchesAlias = s.aliases.some(a => a.includes(q));
        
        if (matchesName || matchesId || matchesAlias) {
            suggestions.push({
                type: 'surah',
                id: `surah_${s.id}`,
                title: `Surah ${s.name} (${s.english})`,
                meta: `Quran Chapter ${s.id} — ${s.verses} Verses`
            });
        }
    });

    // Match verse pattern
    const verseMatch = q.match(/^(\d+)(?:\s*:\s*|\s+)(\d+)$/);
    if (verseMatch) {
        const ch = parseInt(verseMatch[1]);
        const ver = parseInt(verseMatch[2]);
        const surah = SURAH_METADATA.find(s => s.id === ch);
        if (surah && ver <= surah.verses) {
            suggestions.push({
                type: 'verse',
                id: `surah_${ch}:${ver}`,
                title: `Surah ${surah.name} — Verse ${ch}:${ver}`,
                meta: `Read Translation and Tafsir`
            });
        }
    }

    // Add text search option
    suggestions.push({
        type: 'search',
        id: `search_${encodeURIComponent(q)}`,
        title: `🔍 Search text for "${query}"`,
        meta: `Find all occurrences in the translation`
    });

    if (suggestions.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }

    // Populate box
    suggestionsBox.innerHTML = '';
    suggestions.slice(0, 8).forEach(s => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <div class="suggestion-title">${s.title}</div>
            <div class="suggestion-meta">${s.meta}</div>
        `;
        div.addEventListener('click', () => {
            navigateTo(s.id);
            suggestionsBox.style.display = 'none';
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
        });
        suggestionsBox.appendChild(div);
    });
    suggestionsBox.style.display = 'block';
}

// Main navigation router with safe layout calls
function navigateTo(pageId, updateHistory = true) {
    pageId = decodeURIComponent(pageId);
    let highlightVerse = null;
    let targetPage = pageId;
    if (pageId.includes(':')) {
        const parts = pageId.split(':');
        targetPage = parts[0];
        highlightVerse = parseInt(parts[1]);
    }

    activePage = pageId;

    // Reset sidebar highlights
    document.querySelectorAll('.wiki-sidebar a').forEach(a => {
        a.classList.remove('active');
    });

    // Sync portal switcher tab state
    if (targetPage.startsWith('hadith_') || targetPage.startsWith('dua_') || targetPage.startsWith('topic_')) {
        const portalQuranBtn = document.getElementById('portal-quran-btn');
        const portalHadithBtn = document.getElementById('portal-hadith-btn');
        const quranNavSection = document.getElementById('quran-nav-section');
        const hadithNavSection = document.getElementById('hadith-nav-section');
        if (portalQuranBtn && portalHadithBtn && quranNavSection && hadithNavSection) {
            portalHadithBtn.classList.add('active');
            portalQuranBtn.classList.remove('active');
            hadithNavSection.style.display = 'block';
            quranNavSection.style.display = 'none';
            populateSidebarHadiths();
        }
    } else if (targetPage.startsWith('surah_') || targetPage === 'main_page' || targetPage === 'hifz_helper' || SEERAH_ARTICLES[targetPage]) {
        const portalQuranBtn = document.getElementById('portal-quran-btn');
        const portalHadithBtn = document.getElementById('portal-hadith-btn');
        const quranNavSection = document.getElementById('quran-nav-section');
        const hadithNavSection = document.getElementById('hadith-nav-section');
        if (portalQuranBtn && portalHadithBtn && quranNavSection && hadithNavSection) {
            portalQuranBtn.classList.add('active');
            portalHadithBtn.classList.remove('active');
            quranNavSection.style.display = 'block';
            hadithNavSection.style.display = 'none';
        }
    }

    // Update highlights
    const activeLink = document.getElementById(`nav-${targetPage}`);
    if (activeLink) {
        activeLink.classList.add('active');
        try {
            activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } catch (e) {
            try {
                activeLink.scrollIntoView();
            } catch (err) {}
        }
    }

    // Load content
    if (SEERAH_ARTICLES[targetPage]) {
        renderSeerahArticle(SEERAH_ARTICLES[targetPage]);
    } else if (targetPage === 'hifz_helper') {
        renderHifzHelper();
    } else if (targetPage.startsWith('surah_')) {
        const surahId = parseInt(targetPage.replace('surah_', ''));
        renderQuranChapter(surahId, highlightVerse);
    } else if (targetPage.startsWith('hadith_') || targetPage.startsWith('dua_') || targetPage.startsWith('topic_')) {
        renderHadithOrDuaPage(targetPage);
    } else if (targetPage.startsWith('search_')) {
        const query = targetPage.replace('search_', '');
        renderSearchResults(query);
    }

    // Update browser tab title
    const titleEl = document.getElementById('article-title');
    if (titleEl) {
        document.title = `${titleEl.innerText} | Quran Encyclopedia`;
    }

    // Scroll main body to top if not highlighting a verse
    if (!highlightVerse) {
        const contentEl = document.querySelector('.wiki-content');
        if (contentEl) {
            try { contentEl.scrollTop = 0; } catch (e) {}
        }
    }
    
    // Close mobile sidebar
    const sidebarEl = document.getElementById('wiki-sidebar');
    if (sidebarEl) {
        sidebarEl.classList.remove('active');
    }

    // Update URL hash
    if (updateHistory) {
        window.location.hash = pageId;
    }
}

// Render normal Encyclopedia article with element safety guards
function renderSeerahArticle(article) {
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.innerText = article.title;
    
    const bodyEl = document.getElementById('article-body');
    if (bodyEl) {
        bodyEl.innerHTML = article.content;
        if (article.title === 'Main Page') {
            renderVerseOfTheDay(bodyEl);
        }
        // Load and setup the interactive map if loading the global Islam map
        if (article.title === 'Spread and Global Presence of Islam') {
            loadGlobalIslamMap();
        }
    }

    renderInfobox(article.infobox);
    generateTOC();
}

// Render Quran Chapter with element safety guards
function renderQuranChapter(surahId, highlightVerse) {
    const surah = SURAH_METADATA.find(s => s.id === surahId);
    if (!surah) return;

    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.innerText = `Surah ${surah.name} (سورة ${surah.name})`;

    // Infobox properties
    const infoboxData = {
        "title": `Surah ${surah.name}`,
        "image": "📖",
        "number": `${surah.id} of 114`,
        "meaning": surah.english,
        "revelation_period": surah.type,
        "verses": `${surah.verses} Ayahs`,
        "aliases": surah.aliases.join(', ')
    };
    renderInfobox(infoboxData);

    // Build Chapter Body HTML
    let bodyHtml = `
        <p><b>Surah ${surah.name}</b> (Arabic: سورة ${surah.name}, "${surah.english}") is the ${surah.id} chapter (<i>surah</i>) of the Qur'an, containing ${surah.verses} verses (<i>ayahs</i>). It is classified as a <b>${surah.type} Surah</b>, meaning it is historically understood to have been revealed during the ${surah.type === 'Meccan' ? 'Meccan Period (610–622 CE)' : 'Medinan Period (622–632 CE)'} of the prophecy.</p>
        
        <h2>Introduction</h2>
        <p>The chapter begins with its unique themes focusing on classical teachings. Scholars recommend reading the detailed verse-by-verse Tafsir below to understand the full context of the messages.</p>

        <h2>Text and Translation</h2>
    `;

    if (surah.id !== 9) {
        bodyHtml += `
            <div class="bismillah-banner" style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary);">
                <span style="font-family: 'Amiri', serif; font-size: 28px; color: var(--arabic-color);">بِسْمِ اللَّهِ الرَّحْمَـنِ الرَّحِيمِ</span>
                <span class="action-link" onclick="window.playVerseAudio(${surah.id}, 0)" style="font-size: 13px; font-weight: 500;">🔊 Listen</span>
            </div>
        `;
    }

    bodyHtml += `<div class="quran-container">`;

    const chData = quranDatabase[surah.id] || {};
    const isFatihah = (surah.id === 1);
    
    for (let v = 1; v <= surah.verses; v++) {
        let translation, arabicText;
        if (isFatihah) {
            const fatihahVerse = FATIHAH_SHIFTED[v - 1];
            translation = fatihahVerse.english;
            arabicText = formatArabicVerseText(fatihahVerse.arabic, v);
        } else {
            translation = chData[v] || `<span style="color: var(--text-muted); font-style: italic;">[Loading translation...]</span>`;
            arabicText = getArabicVersePlaceholder(surah.id, v);
        }
        const rowId = `verse-${surah.id}-${v}`;
        const isHighlighted = (v === highlightVerse) ? 'style="border-color: var(--accent-color); box-shadow: var(--shadow-md);"' : '';

        bodyHtml += `
            <div class="verse-row" id="${rowId}" ${isHighlighted}>
                <div class="verse-top">
                    <span class="verse-num">Verse ${surah.id}:${v}</span>
                    <div class="verse-actions">
                        <span class="action-link" onclick="window.playVerseAudio(${surah.id}, ${v})">🔊 Listen</span>
                        <span class="action-link" onclick="toggleTafsir(${surah.id}, ${v})">📖 Tafsir</span>
                        <span class="action-link" onclick="shareVerse(${surah.id}, ${v})">🔗 Share</span>
                    </div>
                </div>
                <div class="verse-arabic" id="arabic-${surah.id}-${v}">${arabicText}</div>
                <div class="verse-translation">${translation}</div>
                
                <div class="verse-tafsir-box" id="tafsir-box-${surah.id}-${v}">
                    <div class="verse-tafsir-header">
                        <div class="tafsir-tabs">
                            <button class="tafsir-tab active" data-tafsir-id="817" onclick="switchTafsirTab(event, ${surah.id}, ${v}, 817)">Tazkirul Quran</button>
                            <button class="tafsir-tab" data-tafsir-id="169" onclick="switchTafsirTab(event, ${surah.id}, ${v}, 169)">Ibn Kathir</button>
                            <button class="tafsir-tab" data-tafsir-id="168" onclick="switchTafsirTab(event, ${surah.id}, ${v}, 168)">Ma'arif al-Qur'an</button>
                        </div>
                        <span style="cursor: pointer; font-weight: bold; font-size: 16px; color: var(--text-muted);" onclick="toggleTafsir(${surah.id}, ${v})">&times;</span>
                    </div>
                    <div class="verse-tafsir-body" id="tafsir-body-${surah.id}-${v}">
                        <span style="color: var(--text-muted); font-style: italic;">Fetching exegesis...</span>
                    </div>
                </div>
            </div>
        `;
    }

    bodyHtml += `</div>`;
    bodyHtml += `
        <h2>Scholarly Interpretations</h2>
        <p>Scholarly exegeses (Tafsir) from multiple sources (Tazkirul Quran, Ibn Kathir, and Ma'arif al-Qur'an) are integrated directly into the verse-by-verse view above. Click the <b>📖 Tafsir</b> button on any verse to slide open and switch between the commentaries.</p>
    `;

    const bodyEl = document.getElementById('article-body');
    if (bodyEl) bodyEl.innerHTML = bodyHtml;

    fetchArabicText(surah.id);
    generateTOC();

    if (highlightVerse) {
        setTimeout(() => {
            const el = document.getElementById(`verse-${surah.id}-${highlightVerse}`);
            if (el) {
                try {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } catch (e) {
                    try { el.scrollIntoView(); } catch (err) {}
                }
            }
        }, 500);
    }
}

// Arabic Text placeholder
function getArabicVersePlaceholder(chapter, verse) {
    return `... Loading Arabic text ...`;
}

function fetchArabicText(chapterId) {
    if (chapterId === 1) return; // Fatihah uses static shifted text
    
    // Check local database first
    if (localQuranScripture[chapterId]) {
        for (const v in localQuranScripture[chapterId]) {
            const text = localQuranScripture[chapterId][v].arabic;
            const el = document.getElementById(`arabic-${chapterId}-${v}`);
            if (el) {
                el.innerText = text;
            }
        }
        return;
    }

    const url = `https://api.quran.com/api/v4/quran/verses/indopak?chapter_number=${chapterId}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const verses = data.verses || [];
            verses.forEach(v => {
                const parts = v.verse_key.split(':');
                const ch = parseInt(parts[0]);
                const ver = parseInt(parts[1]);
                const text = formatArabicVerseText(v.text_indopak, ver);
                const el = document.getElementById(`arabic-${ch}-${ver}`);
                if (el) {
                    el.innerText = text;
                }
            });
        })
        .catch(err => {
            console.error("Error loading Arabic text from API fallback:", err);
            SURAH_METADATA.forEach(s => {
                if (s.id === chapterId) {
                    for(let v=1; v<=s.verses; v++) {
                        const el = document.getElementById(`arabic-${chapterId}-${v}`);
                        if(el && el.innerText.includes("Loading")) {
                            el.innerText = "[Arabic text requires internet connection]";
                        }
                    }
                }
            });
        });
}

// Tafsir Toggle and fetcher
function toggleTafsir(chapter, verse) {
    const box = document.getElementById(`tafsir-box-${chapter}-${verse}`);
    if (!box) return;

    if (box.style.display === 'block') {
        box.style.display = 'none';
        return;
    }

    box.style.display = 'block';

    // Find active tab and load its content
    const activeTab = box.querySelector('.tafsir-tab.active');
    let tafsirId = 817;
    if (activeTab) {
        tafsirId = parseInt(activeTab.getAttribute('data-tafsir-id')) || 817;
    }

    loadTafsirContent(chapter, verse, tafsirId);
}

function switchTafsirTab(event, chapter, verse, tafsirId) {
    event.stopPropagation();
    const box = document.getElementById(`tafsir-box-${chapter}-${verse}`);
    if (!box) return;

    const tabs = box.querySelectorAll('.tafsir-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const targetTab = event.currentTarget;
    if (targetTab) {
        targetTab.classList.add('active');
    }

    loadTafsirContent(chapter, verse, tafsirId);
}

function loadTafsirContent(chapter, verse, tafsirId) {
    const body = document.getElementById(`tafsir-body-${chapter}-${verse}`);
    if (!body) return;

    const cacheKey = `${chapter}:${verse}:${tafsirId}`;
    if (tafsirCache[cacheKey]) {
        body.innerHTML = tafsirCache[cacheKey];
        return;
    }

    body.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Fetching exegesis...</span>`;

    const apiVerse = getApiVerse(chapter, verse);
    const url = `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${chapter}:${apiVerse}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const rawHtml = data.tafsir ? data.tafsir.text : '<p>[No Tafsir content returned]</p>';
            const cleanText = cleanHtmlTafsir(rawHtml);
            tafsirCache[cacheKey] = cleanText;
            body.innerHTML = cleanText;
        })
        .catch(err => {
            console.error("Error fetching Tafsir:", err);
            body.innerHTML = `<span style="color: var(--tafsir-border); font-weight: 500;">Failed to fetch Tafsir. Please check your internet connection and try again.</span>`;
        });
}

// HTML tag stripper
function cleanHtmlTafsir(htmlText) {
    let text = htmlText;
    text = text.replace(/<\/?(p|h1|h2|h3|h4|div|br|li|ul|ol)[^>]*>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    const parser = new DOMParser();
    const decoded = parser.parseFromString(text, 'text/html').body.textContent;
    const paragraphs = decoded.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}

// Render Infobox safely
function renderInfobox(info) {
    const box = document.getElementById('wiki-infobox');
    const container = document.querySelector('.wiki-infobox-container');
    if (!box || !container) return;
    
    if (!info) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    let tableHtml = `
        <div class="wiki-infobox-header">${info.title}</div>
        <div class="wiki-infobox-image">${info.image}</div>
        <table class="wiki-infobox-table">
    `;

    Object.keys(info).forEach(key => {
        if (key !== 'title' && key !== 'image') {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            tableHtml += `
                <tr>
                    <td class="wiki-infobox-label">${label}</td>
                    <td class="wiki-infobox-value">${info[key]}</td>
                </tr>
            `;
        }
    });

    tableHtml += `</table>`;
    box.innerHTML = tableHtml;
}

// Generate dynamic Table of Contents
function generateTOC() {
    const bodyEl = document.getElementById('article-body');
    if (!bodyEl) return;

    const headings = bodyEl.querySelectorAll('h2, h3');
    const tocBox = document.getElementById('toc-box');
    const tocList = document.getElementById('toc-list');
    if (!tocBox || !tocList) return;
    
    if (headings.length === 0) {
        tocBox.style.display = 'none';
        return;
    }

    tocBox.style.display = 'block';
    tocList.innerHTML = '';

    headings.forEach((h, index) => {
        const id = `heading-${index}`;
        h.setAttribute('id', id);
        
        const li = document.createElement('li');
        const levelClass = h.tagName.toLowerCase() === 'h3' ? 'style="padding-left: 15px;"' : '';
        li.innerHTML = `
            <div ${levelClass}>
                <span style="color: var(--text-muted); font-size: 11px; margin-right: 4px;">${index + 1}</span>
                <a href="#${id}" onclick="scrollToHeading(event, '${id}')">${h.innerText}</a>
            </div>
        `;
        tocList.appendChild(li);
    });
}

function scrollToHeading(event, id) {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
        try {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
            try { el.scrollIntoView(); } catch (err) {}
        }
    }
}

// Search parser
function executeSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) return;

    // 1. Match verse pattern
    const verseMatch = q.match(/^(.+?)(?:\s*:\s*|\s+)(\d+)$/);
    if (verseMatch) {
        const surahQuery = verseMatch[1].trim();
        const verseNum = parseInt(verseMatch[2]);
        const surah = findSurahMetadata(surahQuery);
        if (surah) {
            if (verseNum <= surah.verses) {
                navigateTo(`surah_${surah.id}:${verseNum}`);
                return;
            } else {
                showNotification(`Error: Surah ${surah.name} only has ${surah.verses} verses. You requested verse ${verseNum}.`, 'error');
                return;
            }
        }
    }

    // 2. Match Surah direct name
    const surah = findSurahMetadata(q);
    if (surah) {
        navigateTo(`surah_${surah.id}`);
        return;
    }

    // 3. Match Seerah key
    if (SEERAH_ARTICLES[q]) {
        navigateTo(q);
        return;
    }

    // 4. Match exact Seerah title
    const articleKey = Object.keys(SEERAH_ARTICLES).find(key => 
        SEERAH_ARTICLES[key].title.toLowerCase() === q
    );
    if (articleKey) {
        navigateTo(articleKey);
        return;
    }

    // 5. Match suggestions
    const suggestions = [];
    SURAH_METADATA.forEach(s => {
        if (s.name.toLowerCase().includes(q) || s.english.toLowerCase().includes(q)) {
            suggestions.push(s);
        }
    });

    if (suggestions.length === 1) {
        navigateTo(`surah_${suggestions[0].id}`);
    } else if (suggestions.length > 1) {
        let msg = `Multiple chapters matched your query:\n`;
        suggestions.forEach(s => {
            msg += `  - Surah ${s.name} (${s.english})\n`;
        });
        showNotification(msg + `\nPlease search specifically by name or number.`, 'info');
    } else {
        navigateTo(`search_${encodeURIComponent(q)}`);
    }
}

// Metadata resolution helper
function findSurahMetadata(query) {
    if (!isNaN(query)) {
        const id = parseInt(query);
        return SURAH_METADATA.find(s => s.id === id);
    }
    const qNorm = query.toLowerCase().replace(/^(al|an|ash|ar|at|ad|az|el|as|the)\b/g, '').replace(/[^a-z0-9]/g, '');
    return SURAH_METADATA.find(s => {
        const nameNorm = s.name.toLowerCase().replace(/^(al|an|ash|ar|at|ad|az|el|as|the)\b/g, '').replace(/[^a-z0-9]/g, '');
        const engNorm = s.english.toLowerCase().replace(/^(al|an|ash|ar|at|ad|az|el|as|the)\b/g, '').replace(/[^a-z0-9]/g, '');
        if (nameNorm === qNorm || engNorm === qNorm) return true;
        return s.aliases.some(a => a.toLowerCase().replace(/[^a-z0-9]/g, '') === qNorm);
    });
}

// ==========================================
// Shareable Verses with Meaning Logic
// ==========================================

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
        return Promise.resolve();
    }
}

let activeShareType = null;
let activeShareChapter = null;
let activeShareVerse = null;
let activeShareId = null;
let activeStoryTheme = 'light';

function shareVerse(chapter, verse) {
    activeShareType = 'verse';
    activeShareChapter = chapter;
    activeShareVerse = verse;
    const surah = SURAH_METADATA.find(s => s.id === chapter);
    if (!surah) return;

    let translation = '';
    let arabicText = '';
    
    if (chapter === 1) {
        const fv = FATIHAH_SHIFTED[verse - 1];
        translation = fv.english;
        const arabicEl = document.getElementById(`arabic-${chapter}-${verse}`);
        arabicText = arabicEl ? arabicEl.innerText : fv.arabic;
    } else {
        translation = (quranDatabase[chapter] && quranDatabase[chapter][verse]) || '';
        const arabicEl = document.getElementById(`arabic-${chapter}-${verse}`);
        arabicText = arabicEl ? arabicEl.innerText : '';
    }

    // Set preview card
    const previewArabic = document.getElementById('share-preview-arabic');
    const previewTranslation = document.getElementById('share-preview-translation');
    const previewRef = document.getElementById('share-preview-ref');

    if (previewArabic) previewArabic.innerText = arabicText;
    if (previewTranslation) previewTranslation.innerHTML = translation;
    if (previewRef) previewRef.innerText = `Surah ${surah.name} ${chapter}:${verse}`;

    // Set up link (using canonical domain in production, local origin for testing)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? (window.location.origin + window.location.pathname) : 'https://quranopedia.org/';
    const shareUrl = `${baseUrl}#surah_${chapter}:${verse}`;

    const urlInput = document.getElementById('share-url-input');
    if (urlInput) urlInput.value = shareUrl;

    // Set up full text shareable
    const plainTextTranslation = translation.replace(/<[^>]+>/g, '').trim();
    const fullText = `"${plainTextTranslation}"\n\n— Surah ${surah.name} ${chapter}:${verse}\nRead meaning and Tafsir: ${shareUrl}`;
    const textInput = document.getElementById('share-text-input');
    if (textInput) textInput.value = arabicText ? `${arabicText}\n\n${fullText}` : fullText;

    // Social links
    const shareWa = document.getElementById('share-wa');
    const shareTg = document.getElementById('share-tg');
    const shareTw = document.getElementById('share-tw');
    const shareEmail = document.getElementById('share-email');

    // For messaging clients, let's share the text with meaning
    const waText = `"${plainTextTranslation}" — Surah ${surah.name} ${chapter}:${verse}\n\nRead more: ${shareUrl}`;
    const tgText = `Surah ${surah.name} ${chapter}:${verse}`;
    const twText = `"${plainTextTranslation}" — Surah ${surah.name} ${chapter}:${verse} ${shareUrl}`;

    if (shareWa) shareWa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    if (shareTg) shareTg.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(tgText)}`;
    if (shareTw) shareTw.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twText)}`;
    if (shareEmail) shareEmail.href = `mailto:?subject=${encodeURIComponent(`Quran Verse: Surah ${surah.name} ${chapter}:${verse}`)}&body=${encodeURIComponent(waText)}`;

    // Show modal
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Force reflow
        modal.offsetHeight;
        modal.classList.add('active');
    }
}

function setupShareEventListeners() {
    const modal = document.getElementById('share-modal');
    const closeBtn = document.getElementById('close-share-modal');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const copyFullBtn = document.getElementById('copy-full-btn');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 200);
        });

        // Close on clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 200);
            }
        });
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const urlInput = document.getElementById('share-url-input');
            if (urlInput) {
                copyTextToClipboard(urlInput.value).then(() => {
                    const originalText = copyLinkBtn.innerText;
                    copyLinkBtn.innerText = 'Copied! ✓';
                    copyLinkBtn.style.backgroundColor = '#2ecc71';
                    copyLinkBtn.style.borderColor = '#2ecc71';
                    setTimeout(() => {
                        copyLinkBtn.innerText = originalText;
                        copyLinkBtn.style.backgroundColor = '';
                        copyLinkBtn.style.borderColor = '';
                    }, 2000);
                });
            }
        });
    }

    if (copyFullBtn) {
        copyFullBtn.addEventListener('click', () => {
            const textInput = document.getElementById('share-text-input');
            if (textInput) {
                copyTextToClipboard(textInput.value).then(() => {
                    const originalText = copyFullBtn.innerText;
                    copyFullBtn.innerText = 'Copied! ✓';
                    copyFullBtn.style.backgroundColor = '#2ecc71';
                    copyFullBtn.style.borderColor = '#2ecc71';
                    copyFullBtn.style.color = '#ffffff';
                    setTimeout(() => {
                        copyFullBtn.innerText = originalText;
                        copyFullBtn.style.backgroundColor = '';
                        copyFullBtn.style.borderColor = '';
                        copyFullBtn.style.color = '';
                    }, 2000);
                });
            }
        });
    }

    const lightBtn = document.getElementById('story-theme-light');
    const darkBtn = document.getElementById('story-theme-dark');
    if (lightBtn && darkBtn) {
        lightBtn.addEventListener('click', () => {
            lightBtn.classList.add('active');
            darkBtn.classList.remove('active');
            activeStoryTheme = 'light';
        });
        darkBtn.addEventListener('click', () => {
            darkBtn.classList.add('active');
            lightBtn.classList.remove('active');
            activeStoryTheme = 'dark';
        });
    }

    const instagramBtn = document.getElementById('share-instagram');
    if (instagramBtn) {
        instagramBtn.addEventListener('click', () => {
            if (activeShareType) {
                generateInstagramStoryCard(activeShareType, activeShareType === 'verse' ? activeShareChapter : activeShareId, activeShareVerse, activeStoryTheme);
            }
        });
    }
}

// ==========================================
// Verse of the Day Implementation
// ==========================================

const CURATED_DAILY_VERSES = [
    { ch: 2, v: 255 }, // Ayat al-Kursi
    { ch: 2, v: 186 }, // "Indeed I am near..."
    { ch: 2, v: 286 }, // "Allah does not burden a soul..."
    { ch: 3, v: 139 }, // "Do not weaken and do not grieve..."
    { ch: 3, v: 191 }, // "Our Lord, You did not create this aimlessly..."
    { ch: 8, v: 2 },   // "The believers are only those who..."
    { ch: 9, v: 40 },  // "Do not grieve; indeed Allah is with us."
    { ch: 13, v: 28 }, // "Unquestionably, by the remembrance of Allah hearts are assured."
    { ch: 14, v: 7 },  // "If you are grateful, I will surely increase you..."
    { ch: 20, v: 114 },// "My Lord, increase me in knowledge."
    { ch: 25, v: 63 }, // "And the servants of the Most Merciful..."
    { ch: 29, v: 69 }, // "And those who strive for Us - We will surely guide them to Our ways."
    { ch: 39, v: 53 }, // "O My servants who have transgressed... do not despair of the mercy of Allah."
    { ch: 40, v: 60 }, // "Call upon Me; I will respond to you."
    { ch: 49, v: 10 }, // "The believers are but brothers..."
    { ch: 49, v: 13 }, // "O mankind, indeed We have created you from male and female..."
    { ch: 55, v: 60 }, // "Is the reward for good [anything] but good?"
    { ch: 65, v: 3 },  // "And He will provide for him from where he does not expect..."
    { ch: 94, v: 5 },  // "For indeed, with hardship [will be] ease."
    { ch: 94, v: 6 },  // "Indeed, with hardship [will be] ease."
    { ch: 103, v: 3 }  // Al-Asr
];

function renderVerseOfTheDay(container) {
    const today = new Date();
    const todayDateString = today.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Create daily wisdom element
    const dailyCard = document.createElement('div');
    dailyCard.className = 'daily-verse-card';
    
    dailyCard.innerHTML = `
        <div class="daily-verse-header">
            <span class="daily-verse-badge">✨ Daily Wisdom</span>
            <span class="daily-verse-date">${todayDateString}</span>
        </div>
        <div class="daily-wisdom-tabs">
            <button class="wisdom-tab-btn active" id="tab-verse-btn">Verse</button>
            <button class="wisdom-tab-btn" id="tab-hadith-btn">Hadith</button>
            <button class="wisdom-tab-btn" id="tab-dua-btn">Dua</button>
        </div>
        <div class="daily-verse-body" id="daily-wisdom-body">
            <!-- Populated dynamically -->
        </div>
    `;

    // Prepend to container so it sits at the top of the main page
    container.insertBefore(dailyCard, container.firstChild);

    // Setup Tab click listeners
    const tabVerseBtn = document.getElementById('tab-verse-btn');
    const tabHadithBtn = document.getElementById('tab-hadith-btn');
    const tabDuaBtn = document.getElementById('tab-dua-btn');

    if (tabVerseBtn && tabHadithBtn && tabDuaBtn) {
        tabVerseBtn.addEventListener('click', () => { activateWisdomTab('verse'); });
        tabHadithBtn.addEventListener('click', () => { activateWisdomTab('hadith'); });
        tabDuaBtn.addEventListener('click', () => { activateWisdomTab('dua'); });
    }

    // Default to displaying Verse of the Day
    activateWisdomTab('verse');
}

function fetchDailyVerseArabic(chapterId, verseId) {
    // Check local database first
    if (localQuranScripture[chapterId] && localQuranScripture[chapterId][verseId]) {
        const el = document.getElementById('daily-arabic');
        if (el) {
            el.innerText = localQuranScripture[chapterId][verseId].arabic;
        }
        return;
    }

    const apiVerse = getApiVerse(chapterId, verseId);
    const url = `https://api.quran.com/api/v4/quran/verses/indopak?verse_key=${chapterId}:${apiVerse}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const verses = data.verses || [];
            if (verses.length > 0) {
                const el = document.getElementById('daily-arabic');
                if (el) {
                    el.innerText = formatArabicVerseText(verses[0].text_indopak, verseId);
                }
            }
        })
        .catch(err => {
            console.error("Error loading daily Arabic text from API fallback:", err);
            const el = document.getElementById('daily-arabic');
            if (el) {
                el.innerText = "[Arabic text requires internet connection]";
            }
        });
}

// ==========================================
// Instagram Story Card Generator
// ==========================================

function generateInstagramStoryCard(type, arg1, arg2, theme = 'light') {
    const surah = (type === 'verse') ? SURAH_METADATA.find(s => s.id === arg1) : null;
    if (type === 'verse' && !surah) return;

    const isDark = (theme === 'dark');
    
    // Theme colors mapping
    const colors = {
        bg: isDark ? '#161b22' : '#ffffff',
        borderOuter: isDark ? '#21262d' : '#eaecf0',
        borderInner: isDark ? '#30363d' : '#a2a9b1',
        emblemBg: isDark ? '#c9d1d9' : '#202122',
        emblemText: isDark ? '#161b22' : '#ffffff',
        title: isDark ? '#ffffff' : '#202122',
        subtitle: isDark ? '#8b949e' : '#54595d',
        divider: isDark ? '#30363d' : '#eaecf0',
        arabic: isDark ? '#58a6ff' : '#ffffff', // Uthmani text color
        translation: isDark ? '#c9d1d9' : '#202122',
        reference: isDark ? '#58a6ff' : '#3366bb',
        watermark: isDark ? '#8b949e' : '#54595d'
    };

    // If light mode, make Arabic text classic black
    if (!isDark) {
        colors.arabic = '#000000';
    }

    let titleText = 'QURANOPEDIA';
    let subtitleText = 'The Free Quran Encyclopedia';
    let emblemLetter = 'Q';
    let arabicText = '';
    let translationText = '';
    let referenceText = '';
    let filename = '';

    if (type === 'verse') {
        const chapter = arg1;
        const verse = arg2;
        emblemLetter = 'Q';
        titleText = 'QURANOPEDIA';
        subtitleText = 'The Free Quran Encyclopedia';
        referenceText = `Surah ${surah.name} ${chapter}:${verse}`;
        filename = `quran_story_${chapter}_${verse}_${theme}.png`;

        if (chapter === 1) {
            const fv = FATIHAH_SHIFTED[verse - 1];
            translationText = fv.english;
            const arabicEl = document.getElementById(`arabic-${chapter}-${verse}`);
            arabicText = arabicEl ? arabicEl.innerText.trim() : formatArabicVerseText(fv.arabic, verse);
        } else {
            translationText = (quranDatabase[chapter] && quranDatabase[chapter][verse]) || '';
            const arabicEl = document.getElementById(`arabic-${chapter}-${verse}`) || document.getElementById('daily-arabic');
            arabicText = arabicEl ? arabicEl.innerText.trim() : '';
        }
    } else if (type === 'hadith') {
        const id = arg1;
        const h = hadithDatabase.find(item => item.id === id);
        if (!h) return;

        emblemLetter = 'H';
        titleText = 'HADITH ENCYCLOPEDIA';
        subtitleText = 'Prophetic Traditions & Sayings';
        arabicText = h.arabic;
        translationText = `"${h.english}"`;
        referenceText = `${h.book} (Narrated by ${h.narrator})`;
        filename = `hadith_story_${id}_${theme}.png`;
    } else if (type === 'dua') {
        const id = arg1;
        const d = duaDatabase.find(item => item.id === id);
        if (!d) return;

        emblemLetter = 'D';
        titleText = 'DUA ENCYCLOPEDIA';
        subtitleText = 'Supplications from Quran & Sunnah';
        arabicText = d.arabic;
        translationText = `"${d.english}"`;
        referenceText = `${d.source} (${d.context})`;
        filename = `dua_story_${id}_${theme}.png`;
    }

    const plainTextTranslation = translationText.replace(/<[^>]+>/g, '').trim();

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // 1. Minimalist Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Border Layout
    ctx.strokeStyle = colors.borderOuter;
    ctx.lineWidth = 20; // Thick clean outer edge
    ctx.strokeRect(10, 10, 1060, 1900);

    ctx.strokeStyle = colors.borderInner;
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 1000, 1840);

    // 3. Logo Emblem (Emblem Letter inside a rounded box)
    const logoSize = 100;
    const logoX = 540 - (logoSize / 2);
    const logoY = 220;
    ctx.fillStyle = colors.emblemBg;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 16);
    ctx.fill();

    ctx.fillStyle = colors.emblemText;
    ctx.font = 'bold 64px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(emblemLetter, 540, 295);

    // 4. Header Titles (Wikipedia Typography)
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillStyle = colors.title;
    ctx.textAlign = 'center';
    ctx.fillText(titleText, 540, 390);

    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = colors.subtitle;
    ctx.fillText(subtitleText, 540, 430);

    // Header Horizontal Rule
    ctx.strokeStyle = colors.divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(340, 480);
    ctx.lineTo(740, 480);
    ctx.stroke();

    // 5. Arabic Text (Bold Amiri Serif Calligraphy)
    ctx.font = '56px Amiri, Georgia, serif';
    ctx.fillStyle = colors.arabic;
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    const arabicLines = wrapCanvasText(ctx, arabicText, 850);
    let startArabicY = 720 - ((arabicLines.length - 1) * 45);
    arabicLines.forEach((line, index) => {
        ctx.fillText(line, 540, startArabicY + index * 90);
    });

    // 6. Section Divider
    ctx.strokeStyle = colors.divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(440, 1050);
    ctx.lineTo(640, 1050);
    ctx.stroke();

    // 7. English Translation (Georgia Body Text)
    ctx.font = '28px Georgia, serif';
    ctx.fillStyle = colors.translation;
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    const translationLines = wrapCanvasText(ctx, plainTextTranslation, 820);
    let startTranslationY = 1200 - ((translationLines.length - 1) * 25);
    translationLines.forEach((line, index) => {
        ctx.fillText(line, 540, startTranslationY + index * 55);
    });

    // 8. Reference Link (Wikipedia Blue Link Style)
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillStyle = colors.reference;
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    if (ctx.measureText(referenceText).width > 900) {
        ctx.font = 'bold 24px Georgia, serif';
    }
    ctx.fillText(referenceText, 540, 1580);

    // 9. Footer Watermark (quranopedia.org)
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillStyle = colors.watermark;
    ctx.fillText('quranopedia.org', 540, 1780);

    // Convert canvas synchronously to preserve user activation state/gesture for Web Share API
    try {
        const dataurl = canvas.toDataURL('image/png');
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        const file = new File([u8arr], filename, { type: mime });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: referenceText,
                text: plainTextTranslation
            }).catch(err => {
                console.log("Share failed:", err);
                // Only download if it's not a user cancellation or abort (e.g. dismissed native share sheet)
                if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                    const blob = new Blob([u8arr], { type: mime });
                    downloadBlob(blob, filename);
                }
            });
        } else {
            const blob = new Blob([u8arr], { type: mime });
            downloadBlob(blob, filename);
        }
    } catch (e) {
        console.error("Synchronous canvas share preparation failed, falling back to async blob...", e);
        canvas.toBlob((blob) => {
            const file = new File([blob], filename, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: referenceText,
                    text: plainTextTranslation
                }).catch(err => {
                    console.log("Fallback share failed:", err);
                    if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                        downloadBlob(blob, filename);
                    }
                });
            } else {
                downloadBlob(blob, filename);
            }
        }, 'image/png');
    }
}

function wrapCanvasText(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';
    for (let n = 0; n < words.length; n++) {
        let testLine = currentLine ? currentLine + ' ' + words[n] : words[n];
        let testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(currentLine);
            currentLine = words[n];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================
// Fatihah Verse Shift Definitions
// ==========================================

const FATIHAH_SHIFTED = [
    {
        v: 1,
        arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        english: "[All] praise is [due] to Allah, Lord of the worlds -"
    },
    {
        v: 2,
        arabic: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        english: "The Entirely Merciful, the Especially Merciful,"
    },
    {
        v: 3,
        arabic: "مَـٰلِكِ يَوْمِ ٱلدِّينِ",
        english: "Sovereign of the Day of Recompense."
    },
    {
        v: 4,
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        english: "It is You we worship and You we ask for help."
    },
    {
        v: 5,
        arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        english: "Guide us to the straight path -"
    },
    {
        v: 6,
        arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
        english: "The path of those upon whom You have bestowed favor,"
    },
    {
        v: 7,
        arabic: "غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        english: "not of those who have evoked [Your] anger or of those who are astray."
    }
];

function getApiVerse(chapter, verse) {
    if (chapter === 1) {
        if (verse === 6 || verse === 7) return 7;
        return verse + 1;
    }
    return verse;
}

// ==========================================
// Hadith and Dua Integration
// ==========================================

function loadHadithDatabase() {
    fetch('hadith-data.json')
        .then(res => res.json())
        .then(data => {
            hadithDatabase = data.hadiths || [];
            console.log(`Hadith database loaded successfully: ${hadithDatabase.length} entries.`);
            populateSidebarHadiths();
            if (activePage.startsWith('hadith_') || activePage.startsWith('search_')) {
                navigateTo(activePage, false);
            }
        })
        .catch(err => console.error("Error loading Hadith data:", err));
}

function loadDuaDatabase() {
    fetch('dua-data.json')
        .then(res => res.json())
        .then(data => {
            duaDatabase = data.duas || [];
            console.log(`Dua database loaded successfully: ${duaDatabase.length} entries.`);
            populateSidebarHadiths();
            if (activePage.startsWith('dua_') || activePage.startsWith('search_')) {
                navigateTo(activePage, false);
            }
        })
        .catch(err => console.error("Error loading Dua data:", err));
}

function populateSidebarHadiths() {
    const list = document.getElementById('sidebar-hadith-list');
    if (!list) return;

    list.innerHTML = '';
    
    // Group all unique topics from both databases
    const topics = new Set();
    hadithDatabase.forEach(h => { if (h.topic) topics.add(h.topic); });
    duaDatabase.forEach(d => { if (d.topic) topics.add(d.topic); });
    
    // Add categorized topics
    Array.from(topics).sort().forEach(topic => {
        const hash = `topic_${topic.toLowerCase().replace(/\s+/g, '_')}`;
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#${hash}" id="nav-${hash}">
                <span>${topic}</span>
            </a>
        `;
        list.appendChild(li);
    });
}

function filterSidebarHadiths(query) {
    const q = query.toLowerCase().trim();
    const listItems = document.querySelectorAll('#sidebar-hadith-list li');
    listItems.forEach(li => {
        const text = li.textContent.toLowerCase();
        if (text.includes(q)) {
            li.style.display = 'block';
        } else {
            li.style.display = 'none';
        }
    });
}

function renderHadithOrDuaPage(pageId) {
    const titleEl = document.getElementById('article-title');
    const bodyEl = document.getElementById('article-body');
    
    if (!titleEl || !bodyEl) return;

    let title = "";
    let html = "";
    let infoboxData = null;

    if (pageId === 'hadith_all') {
        title = "Hadith Collection";
        infoboxData = {
            "title": "Al-Hadith",
            "image": "📜",
            "number": "Sayings of the Prophet",
            "meaning": "Prophetic Traditions",
            "revelation_period": "Sunnah",
            "verses": `${hadithDatabase.length} Selected Hadiths`,
            "aliases": "Bukhari, Muslim, Nawawi"
        };

        html = `<p>The <b>Hadith</b> (Arabic: حديث, "discourse") refers to the record of the words, actions, and silent approval of the Islamic prophet Muhammad.</p>
                <h2>Prophetic Traditions</h2>
                <div class="hadith-container">`;
                
        hadithDatabase.forEach(h => {
            html += getHadithHtmlSnippet(h);
        });
        html += `</div>`;
    } 
    else if (pageId === 'dua_all') {
        title = "Supplications (Duas)";
        infoboxData = {
            "title": "Ad-Dua",
            "image": "🤲",
            "number": "Calling upon Allah",
            "meaning": "Supplications",
            "revelation_period": "Quran & Sunnah",
            "verses": `${duaDatabase.length} Selected Duas`,
            "aliases": "Adhkar, Prayers"
        };

        html = `<p><b>Dua</b> (Arabic: دعاء, "invocation") is a prayer of supplication or request, directed exclusively to Allah.</p>
                <h2>Selected Supplications</h2>
                <div class="dua-container">`;
                
        duaDatabase.forEach(d => {
            html += getDuaHtmlSnippet(d);
        });
        html += `</div>`;
    }
    else if (pageId.startsWith('topic_')) {
        const topicName = pageId.replace('topic_', '').replace(/_/g, ' ');
        const matchedHadith = hadithDatabase.find(h => h.topic.toLowerCase() === topicName);
        const matchedDua = duaDatabase.find(d => d.topic.toLowerCase() === topicName);
        const capitalizedTopic = (matchedHadith && matchedHadith.topic) || (matchedDua && matchedDua.topic) || topicName;

        title = `${capitalizedTopic}`;
        infoboxData = {
            "title": capitalizedTopic,
            "image": "🗂️",
            "number": "Subject Category",
            "meaning": "Thematic Index",
            "revelation_period": "Ethical Theme",
            "verses": "Quran & Sunnah",
            "aliases": "Category"
        };

        html = `<p>This page indexes all Hadiths and Duas related to the theme of <b>${capitalizedTopic}</b>.</p>`;

        const filteredHadiths = hadithDatabase.filter(h => h.topic.toLowerCase() === topicName);
        if (filteredHadiths.length > 0) {
            html += `<h2>Hadiths on ${capitalizedTopic}</h2><div class="hadith-container">`;
            filteredHadiths.forEach(h => { html += getHadithHtmlSnippet(h); });
            html += `</div>`;
        }

        const filteredDuas = duaDatabase.filter(d => d.topic.toLowerCase() === topicName);
        if (filteredDuas.length > 0) {
            html += `<h2>Duas on ${capitalizedTopic}</h2><div class="dua-container">`;
            filteredDuas.forEach(d => { html += getDuaHtmlSnippet(d); });
            html += `</div>`;
        }
    }

    titleEl.innerText = title;
    bodyEl.innerHTML = html;
    renderInfobox(infoboxData);
    generateTOC();
}

function getHadithHtmlSnippet(h) {
    return `
        <div class="hadith-row" id="hadith-entry-${h.id}">
            <div class="verse-top">
                <span class="verse-num">${h.book}</span>
                <div class="verse-actions">
                    <span class="action-link" onclick="shareHadith(${h.id})">🔗 Share</span>
                </div>
            </div>
            <div class="verse-arabic" style="font-size: 24px; line-height: 1.8; margin-bottom: 12px; text-align: center;">${h.arabic}</div>
            <div class="verse-translation" style="font-size: 15px; line-height: 1.6;">"${h.english}"</div>
            <div class="badge-group">
                <span class="wisdom-badge sahih">Sahih</span>
                <span class="wisdom-badge">Narrated by: ${h.narrator}</span>
                <span class="wisdom-badge" onclick="navigateTo('topic_${h.topic.toLowerCase().replace(/\s+/g, '_')}')" style="cursor: pointer; text-decoration: underline;">Topic: ${h.topic}</span>
            </div>
        </div>
    `;
}

// Helper for dynamic tab content rendering
function activateWisdomTab(tab) {
    const body = document.getElementById('daily-wisdom-body');
    if (!body) return;

    // Update active tab buttons
    document.querySelectorAll('.wisdom-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`tab-${tab}-btn`);
    if (activeBtn) activeBtn.classList.add('active');

    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    if (tab === 'verse') {
        const verseIndex = dayOfYear % CURATED_DAILY_VERSES.length;
        const dailyRef = CURATED_DAILY_VERSES[verseIndex];
        const surah = SURAH_METADATA.find(s => s.id === dailyRef.ch);
        if (!surah) return;

        let translation = '';
        if (dailyRef.ch === 1) {
            translation = FATIHAH_SHIFTED[dailyRef.v - 1] ? FATIHAH_SHIFTED[dailyRef.v - 1].english : '';
        } else {
            translation = (quranDatabase[dailyRef.ch] && quranDatabase[dailyRef.ch][dailyRef.v]) || `<span style="color: var(--text-muted); font-style: italic;">[Loading translation...]</span>`;
        }

        body.innerHTML = `
            <div id="daily-arabic" class="verse-arabic">... Loading Arabic text ...</div>
            <div id="daily-translation" class="verse-translation">${translation}</div>
            <div class="daily-verse-footer" style="padding-top: 15px; margin-top: 15px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <a href="#surah_${dailyRef.ch}:${dailyRef.v}" class="verse-num">Surah ${surah.name} ${dailyRef.ch}:${dailyRef.v}</a>
                <div class="verse-actions">
                    <span class="action-link" onclick="window.playVerseAudio(${dailyRef.ch}, ${dailyRef.v})">🔊 Listen</span>
                    <span class="action-link" onclick="navigateTo('surah_${dailyRef.ch}:${dailyRef.v}')">📖 Read & Tafsir</span>
                    <span class="action-link" onclick="shareVerse(${dailyRef.ch}, ${dailyRef.v})">🔗 Share</span>
                </div>
            </div>
        `;
        fetchDailyVerseArabic(dailyRef.ch, dailyRef.v);
    } 
    else if (tab === 'hadith') {
        if (hadithDatabase.length === 0) {
            body.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Loading daily Hadith...</span>`;
            return;
        }
        const hadithIndex = dayOfYear % hadithDatabase.length;
        const h = hadithDatabase[hadithIndex];

        body.innerHTML = `
            <div class="verse-arabic" style="text-align: center; margin-bottom: 15px; font-size: 24px;">${h.arabic}</div>
            <div class="verse-translation">"${h.english}"</div>
            <div class="daily-verse-footer" style="padding-top: 15px; margin-top: 15px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <span class="verse-num">${h.book}</span>
                <div class="verse-actions">
                    <span class="action-link" onclick="navigateTo('hadith_all')">📖 View All</span>
                    <span class="action-link" onclick="shareHadith(${h.id})">🔗 Share</span>
                </div>
            </div>
        `;
    } 
    else if (tab === 'dua') {
        if (duaDatabase.length === 0) {
            body.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Loading daily Dua...</span>`;
            return;
        }
        const duaIndex = dayOfYear % duaDatabase.length;
        const d = duaDatabase[duaIndex];

        body.innerHTML = `
            <div class="verse-arabic" style="text-align: center; margin-bottom: 15px; font-size: 24px;">${d.arabic}</div>
            <div class="verse-translation">"${d.english}"</div>
            <div class="daily-verse-footer" style="padding-top: 15px; margin-top: 15px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <span class="verse-num">${d.source}</span>
                <div class="verse-actions">
                    <span class="action-link" onclick="navigateTo('dua_all')">📖 View All</span>
                    <span class="action-link" onclick="shareDua(${d.id})">🔗 Share</span>
                </div>
            </div>
        `;
    }
}

function getDuaHtmlSnippet(d) {
    return `
        <div class="dua-row" id="dua-entry-${d.id}">
            <div class="verse-top">
                <span class="verse-num">${d.source}</span>
                <div class="verse-actions">
                    <span class="action-link" onclick="shareDua(${d.id})">🔗 Share</span>
                </div>
            </div>
            <div class="verse-arabic" style="font-size: 24px; line-height: 1.8; margin-bottom: 12px; text-align: center;">${d.arabic}</div>
            <div class="verse-translation" style="font-size: 15px; line-height: 1.6;">"${d.english}"</div>
            <div class="badge-group">
                <span class="wisdom-badge" style="background-color: rgba(220, 160, 40, 0.08); color: #d0a028; border-color: rgba(220,160,40,0.2);">${d.context}</span>
                <span class="wisdom-badge" onclick="navigateTo('topic_${d.topic.toLowerCase().replace(/\s+/g, '_')}')" style="cursor: pointer; text-decoration: underline;">Topic: ${d.topic}</span>
            </div>
        </div>
    `;
}

function shareHadith(id) {
    const h = hadithDatabase.find(item => item.id === id);
    if (!h) return;

    activeShareType = 'hadith';
    activeShareId = id;
    activeShareChapter = null;
    activeShareVerse = null;
    
    const previewArabic = document.getElementById('share-preview-arabic');
    const previewTranslation = document.getElementById('share-preview-translation');
    const previewRef = document.getElementById('share-preview-ref');

    if (previewArabic) previewArabic.innerText = h.arabic;
    if (previewTranslation) previewTranslation.innerText = `"${h.english}"`;
    if (previewRef) previewRef.innerText = `${h.book}`;

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? (window.location.origin + window.location.pathname) : 'https://quranopedia.org/';
    const shareUrl = `${baseUrl}#hadith_all`;

    const urlInput = document.getElementById('share-url-input');
    if (urlInput) urlInput.value = shareUrl;

    const fullText = `"${h.english}"\n\n— ${h.book}\nRead more: ${shareUrl}`;
    const textInput = document.getElementById('share-text-input');
    if (textInput) textInput.value = `${h.arabic}\n\n${fullText}`;

    setupSocialShareLinks(h.book, h.english, shareUrl);
    openShareModal();
}

function shareDua(id) {
    const d = duaDatabase.find(item => item.id === id);
    if (!d) return;

    activeShareType = 'dua';
    activeShareId = id;
    activeShareChapter = null;
    activeShareVerse = null;
    
    const previewArabic = document.getElementById('share-preview-arabic');
    const previewTranslation = document.getElementById('share-preview-translation');
    const previewRef = document.getElementById('share-preview-ref');

    if (previewArabic) previewArabic.innerText = d.arabic;
    if (previewTranslation) previewTranslation.innerText = `"${d.english}"`;
    if (previewRef) previewRef.innerText = `${d.source}`;

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? (window.location.origin + window.location.pathname) : 'https://quranopedia.org/';
    const shareUrl = `${baseUrl}#dua_all`;

    const urlInput = document.getElementById('share-url-input');
    if (urlInput) urlInput.value = shareUrl;

    const fullText = `"${d.english}"\n\n— ${d.source}\nRead more: ${shareUrl}`;
    const textInput = document.getElementById('share-text-input');
    if (textInput) textInput.value = `${d.arabic}\n\n${fullText}`;

    setupSocialShareLinks(d.source, d.english, shareUrl);
    openShareModal();
}

function setupSocialShareLinks(ref, translation, shareUrl) {
    const shareWa = document.getElementById('share-wa');
    const shareTg = document.getElementById('share-tg');
    const shareTw = document.getElementById('share-tw');
    const shareEmail = document.getElementById('share-email');

    const waText = `"${translation}" — ${ref}\n\nRead more: ${shareUrl}`;
    const tgText = ref;
    const twText = `"${translation}" — ${ref} ${shareUrl}`;

    if (shareWa) shareWa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    if (shareTg) shareTg.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(tgText)}`;
    if (shareTw) shareTw.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twText)}`;
    if (shareEmail) shareEmail.href = `mailto:?subject=${encodeURIComponent(`Islamic Wisdom: ${ref}`)}&body=${encodeURIComponent(waText)}`;
}

function openShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        // Pre-select card theme based on website active theme
        const isDarkMode = document.body.classList.contains('dark-mode');
        const lightBtn = document.getElementById('story-theme-light');
        const darkBtn = document.getElementById('story-theme-dark');
        if (lightBtn && darkBtn) {
            if (isDarkMode) {
                lightBtn.classList.remove('active');
                darkBtn.classList.add('active');
                activeStoryTheme = 'dark';
            } else {
                darkBtn.classList.remove('active');
                lightBtn.classList.add('active');
                activeStoryTheme = 'light';
            }
        }

        modal.style.display = 'flex';
        modal.offsetHeight;
        modal.classList.add('active');
    }
}

// Render dynamic search results page in the main panel
function renderSearchResults(query) {
    const q = decodeURIComponent(query).toLowerCase().trim();
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.innerText = `Search Results: "${decodeURIComponent(query)}"`;

    const bodyEl = document.getElementById('article-body');
    if (!bodyEl) return;

    // Reset infobox
    const container = document.querySelector('.wiki-infobox-container');
    if (container) container.style.display = 'none';

    // Hide TOC
    const tocBox = document.getElementById('toc-box');
    if (tocBox) tocBox.style.display = 'none';

    if (!q) {
        bodyEl.innerHTML = `<p>Please enter a search term.</p>`;
        return;
    }

    // 1. Search Quran
    const quranMatches = [];
    Object.keys(quranDatabase).forEach(ch => {
        Object.keys(quranDatabase[ch]).forEach(ver => {
            const text = quranDatabase[ch][ver];
            if (text.toLowerCase().includes(q)) {
                quranMatches.push({
                    ch: parseInt(ch),
                    ver: parseInt(ver),
                    text: text
                });
            }
        });
    });

    // 2. Search Hadiths
    const hadithMatches = [];
    hadithDatabase.forEach(h => {
        const matchText = `${h.english} ${h.arabic} ${h.book} ${h.narrator} ${h.topic}`.toLowerCase();
        if (matchText.includes(q)) {
            hadithMatches.push(h);
        }
    });

    // 3. Search Duas
    const duaMatches = [];
    duaDatabase.forEach(d => {
        const matchText = `${d.english} ${d.arabic} ${d.source} ${d.context} ${d.topic}`.toLowerCase();
        if (matchText.includes(q)) {
            duaMatches.push(d);
        }
    });

    // 4. Search Seerah Articles
    const seerahMatches = [];
    Object.keys(SEERAH_ARTICLES).forEach(key => {
        const article = SEERAH_ARTICLES[key];
        const cleanContent = article.content.replace(/<[^>]+>/g, ' ');
        const matchText = `${article.title} ${cleanContent}`.toLowerCase();
        if (matchText.includes(q)) {
            seerahMatches.push({
                key: key,
                title: article.title,
                snippet: getSnippet(cleanContent, q)
            });
        }
    });

    const totalMatches = quranMatches.length + hadithMatches.length + duaMatches.length + seerahMatches.length;

    if (totalMatches === 0) {
        bodyEl.innerHTML = `
            <div class="search-no-results">
                <span style="font-size: 48px; display: block; margin-bottom: 15px;">🔍</span>
                <h3>No results found for "${decodeURIComponent(query)}"</h3>
                <p style="margin-top: 10px;">Check spelling or try common keywords like "mercy", "justice", "day of judgment", "moses".</p>
            </div>
        `;
        return;
    }

    // Build the results page HTML with Tabs
    let html = `
        <p style="margin-bottom: 20px; color: var(--text-muted); font-size: 13px;">
            Found <b>${totalMatches}</b> matches for "${decodeURIComponent(query)}" across all categories.
        </p>
        
        <div class="search-tabs">
            <button class="search-tab active" onclick="switchSearchTab(event, 'quran')">Quran (${quranMatches.length})</button>
            <button class="search-tab" onclick="switchSearchTab(event, 'hadith')">Hadith (${hadithMatches.length})</button>
            <button class="search-tab" onclick="switchSearchTab(event, 'dua')">Duas (${duaMatches.length})</button>
            <button class="search-tab" onclick="switchSearchTab(event, 'seerah')">Articles (${seerahMatches.length})</button>
        </div>
    `;

    // 1. Quran matches tab content
    let quranHtml = `<div class="search-tab-content active" id="search-tab-content-quran"><div class="search-results-list">`;
    if (quranMatches.length === 0) {
        quranHtml += `<p style="color: var(--text-muted); font-style: italic; padding: 20px 0;">No matching Quran verses found.</p>`;
    } else {
        quranMatches.forEach(m => {
            const surah = SURAH_METADATA.find(s => s.id === m.ch);
            const surahName = surah ? surah.name : `Chapter ${m.ch}`;
            quranHtml += `
                <div class="search-result-card">
                    <div class="search-result-meta">
                        <a href="#surah_${m.ch}:${m.ver}">Surah ${surahName} (${m.ch}:${m.ver})</a>
                    </div>
                    <div class="search-result-text">${highlightText(m.text, q)}</div>
                </div>
            `;
        });
    }
    quranHtml += `</div></div>`;

    // 2. Hadith matches tab content
    let hadithHtml = `<div class="search-tab-content" id="search-tab-content-hadith"><div class="search-results-list">`;
    if (hadithMatches.length === 0) {
        hadithHtml += `<p style="color: var(--text-muted); font-style: italic; padding: 20px 0;">No matching Hadiths found.</p>`;
    } else {
        hadithMatches.forEach(h => {
            hadithHtml += `
                <div class="search-result-card">
                    <div class="search-result-meta">
                        <a href="#hadith_all" onclick="navigateTo('hadith_all')">${h.book}</a> &bull; Narrated by ${h.narrator}
                    </div>
                    <div class="search-result-arabic">${highlightText(h.arabic, q)}</div>
                    <div class="search-result-text">"${highlightText(h.english, q)}"</div>
                    <div class="badge-group">
                        <span class="wisdom-badge sahih">Sahih</span>
                        <span class="wisdom-badge" onclick="navigateTo('topic_${h.topic.toLowerCase().replace(/\s+/g, '_')}')" style="cursor: pointer;">Topic: ${h.topic}</span>
                    </div>
                </div>
            `;
        });
    }
    hadithHtml += `</div></div>`;

    // 3. Dua matches tab content
    let duaHtml = `<div class="search-tab-content" id="search-tab-content-dua"><div class="search-results-list">`;
    if (duaMatches.length === 0) {
        duaHtml += `<p style="color: var(--text-muted); font-style: italic; padding: 20px 0;">No matching Duas found.</p>`;
    } else {
        duaMatches.forEach(d => {
            duaHtml += `
                <div class="search-result-card">
                    <div class="search-result-meta">
                        <a href="#dua_all" onclick="navigateTo('dua_all')">${d.source}</a> &bull; ${d.context}
                    </div>
                    <div class="search-result-arabic">${highlightText(d.arabic, q)}</div>
                    <div class="search-result-text">"${highlightText(d.english, q)}"</div>
                    <div class="badge-group">
                        <span class="wisdom-badge" onclick="navigateTo('topic_${d.topic.toLowerCase().replace(/\s+/g, '_')}')" style="cursor: pointer;">Topic: ${d.topic}</span>
                    </div>
                </div>
            `;
        });
    }
    duaHtml += `</div></div>`;

    // 4. Seerah matches tab content
    let seerahHtml = `<div class="search-tab-content" id="search-tab-content-seerah"><div class="search-results-list">`;
    if (seerahMatches.length === 0) {
        seerahHtml += `<p style="color: var(--text-muted); font-style: italic; padding: 20px 0;">No matching historical articles found.</p>`;
    } else {
        seerahMatches.forEach(s => {
            seerahHtml += `
                <div class="search-result-card">
                    <div class="search-result-meta">
                        <a href="#${s.key}" onclick="navigateTo('${s.key}')">${s.title}</a>
                    </div>
                    <div class="search-result-text">${highlightText(s.snippet, q)}</div>
                </div>
            `;
        });
    }
    seerahHtml += `</div></div>`;

    html += quranHtml + hadithHtml + duaHtml + seerahHtml;
    bodyEl.innerHTML = html;
}

function getSnippet(text, query, length = 150) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) {
        return text.slice(0, length) + (text.length > length ? '...' : '');
    }
    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + query.length + 90);
    let snippet = text.slice(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    return snippet;
}

function highlightText(text, query) {
    if (!text) return '';
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, `<mark style="background-color: #ffe066; padding: 2px 4px; border-radius: 2px;">$1</mark>`);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Global hook for search tabs switching
window.switchSearchTab = function(event, tabId) {
    const btn = event.currentTarget;
    const container = btn.parentElement;
    if (!container) return;

    // Toggle active class on tab buttons
    container.querySelectorAll('.search-tab').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');

    // Toggle active class on content sections
    const parentNode = container.parentElement;
    if (parentNode) {
        parentNode.querySelectorAll('.search-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetContent = parentNode.querySelector(`#search-tab-content-${tabId}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }
};

// =========================================================================
// Hifz Helper & Audio Integration
// =========================================================================

const AudioController = {
    audioElement: null,
    currentSurah: 1,
    currentVerse: 1,
    startVerse: 1,
    endVerse: 7,
    loopCountRemaining: 1,
    isPlaying: false,
    initialized: false,

    init() {
        if (this.initialized) return;
        this.audioElement = document.getElementById('hifz-native-audio');
        if (!this.audioElement) return;

        // Set up audio events
        this.audioElement.addEventListener('ended', () => this.handleVerseEnded());
        this.audioElement.addEventListener('error', (e) => {
            console.error("Audio playback error, trying remote fallback...", e);
        });

        // Connect button listeners
        const playBtn = document.getElementById('player-play-btn');
        const prevBtn = document.getElementById('player-prev-btn');
        const nextBtn = document.getElementById('player-next-btn');
        const reciterSelect = document.getElementById('player-reciter-select');
        const speedSelect = document.getElementById('player-speed');

        if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
        if (prevBtn) prevBtn.addEventListener('click', () => this.playPrevious());
        if (nextBtn) nextBtn.addEventListener('click', () => this.playNext());
        if (reciterSelect) reciterSelect.addEventListener('change', () => this.reloadAudioSource());
        if (speedSelect) {
            speedSelect.addEventListener('change', (e) => {
                this.audioElement.playbackRate = parseFloat(e.target.value);
            });
        }
        this.initialized = true;
    },

    setTrack(surah, verse, start = null, end = null) {
        this.currentSurah = surah;
        this.currentVerse = verse;
        this.startVerse = (start !== null) ? start : verse;
        this.endVerse = (end !== null) ? end : verse;

        const loopInput = document.getElementById('player-loop');
        this.loopCountRemaining = loopInput ? parseInt(loopInput.value) : 1;

        this.reloadAudioSource();
        this.updateUI();
    },

    reloadAudioSource() {
        const reciterSelect = document.getElementById('player-reciter-select');
        const reciter = reciterSelect ? reciterSelect.value : 'Alafasy_128kbps';
        
        let sStr, vStr;
        if (this.currentVerse === 0) {
            sStr = '001';
            vStr = '001';
        } else {
            const apiVerse = getApiVerse(this.currentSurah, this.currentVerse);
            sStr = String(this.currentSurah).padStart(3, '0');
            vStr = String(apiVerse).padStart(3, '0');
        }
        
        const localPath = `audio/${reciter}/${sStr}${vStr}.mp3`;
        const remoteUrl = `https://everyayah.com/data/${reciter}/${sStr}${vStr}.mp3`;

        // Check if local file exists via a quick local fetch
        fetch(localPath, { method: 'HEAD' })
            .then(res => {
                if (res.ok) {
                    console.log("Local audio file found:", localPath);
                    this.audioElement.src = localPath;
                } else {
                    console.log("Local audio not found (404), using remote mirror:", remoteUrl);
                    this.audioElement.src = remoteUrl;
                }
                this.audioElement.load();
                if (this.isPlaying) {
                    this.audioElement.play().catch(e => console.error("Error playing audio after load:", e));
                }
            })
            .catch(err => {
                // If fetch fails (e.g. CORS block on file:// protocol or other reasons), default to remote mirror
                console.log("Local audio check failed, using remote mirror:", remoteUrl, err);
                this.audioElement.src = remoteUrl;
                this.audioElement.load();
                if (this.isPlaying) {
                    this.audioElement.play().catch(e => console.error("Error playing remote audio after load:", e));
                }
            });
    },

    togglePlay() {
        if (!this.audioElement.src) {
            this.setTrack(this.currentSurah, this.currentVerse);
        }

        const playBtn = document.getElementById('player-play-btn');
        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
            if (playBtn) playBtn.innerText = '▶';
        } else {
            this.isPlaying = true;
            if (playBtn) playBtn.innerText = '⏸';
            this.audioElement.play()
                .catch(err => {
                    console.error("Error playing audio:", err);
                    // If it was a loading state issue, let reloadAudioSource handle playback
                });
        }
    },

    handleVerseEnded() {
        this.loopCountRemaining--;
        if (this.loopCountRemaining > 0) {
            // Re-play same verse for repetition
            this.audioElement.currentTime = 0;
            this.audioElement.play().catch(e => console.error(e));
        } else {
            // Apply configured inter-verse delay before moving next
            const delayInput = document.getElementById('player-delay');
            const delayVal = delayInput ? (parseInt(delayInput.value) || 0) : 0;
            if (delayVal > 0) {
                this.audioElement.pause();
                setTimeout(() => this.playNext(), delayVal * 1000);
            } else {
                this.playNext();
            }
        }
    },

    playNext() {
        if (this.currentVerse < this.endVerse) {
            this.setTrack(this.currentSurah, this.currentVerse + 1, this.startVerse, this.endVerse);
            this.audioElement.play().then(() => {
                this.isPlaying = true;
                const playBtn = document.getElementById('player-play-btn');
                if (playBtn) playBtn.innerText = '⏸';
            }).catch(e => console.error(e));
        } else {
            // Finished playlist loop range
            this.isPlaying = false;
            const playBtn = document.getElementById('player-play-btn');
            if (playBtn) playBtn.innerText = '▶';
        }
    },

    playPrevious() {
        if (this.currentVerse > this.startVerse) {
            this.setTrack(this.currentSurah, this.currentVerse - 1, this.startVerse, this.endVerse);
            this.audioElement.play().catch(e => console.error(e));
        }
    },

    updateUI() {
        const refEl = document.getElementById('player-verse-ref');
        if (refEl) {
            if (this.currentVerse === 0) {
                refEl.innerText = `Bismillah (Surah ${this.currentSurah})`;
            } else {
                refEl.innerText = `Surah ${this.currentSurah}:${this.currentVerse}`;
            }
        }
        
        // Highlight active verse in reader view if applicable
        document.querySelectorAll('.verse-row').forEach(row => {
            row.classList.remove('audio-playing');
        });
        document.querySelectorAll('.bismillah-banner').forEach(banner => {
            banner.classList.remove('audio-playing');
        });
        if (this.currentVerse === 0) {
            document.querySelectorAll('.bismillah-banner').forEach(banner => {
                banner.classList.add('audio-playing');
            });
        }
        const activeRow = document.getElementById(`verse-${this.currentSurah}-${this.currentVerse}`);
        if (activeRow) {
            activeRow.classList.add('audio-playing');
        }
        const activeHifzRow = document.getElementById(`hifz-verse-row-${this.currentVerse}`);
        if (activeHifzRow) {
            activeHifzRow.classList.add('audio-playing');
        }
    }
};

// Premium Toast Notification System
function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: var(--content-bg);
        color: var(--text-color);
        border: 1px solid var(--border-color);
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: auto;
        min-width: 300px;
        max-width: 450px;
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        gap: 14px;
        white-space: pre-wrap;
        font-family: inherit;
    `;
    
    if (type === 'success') {
        notification.style.borderLeft = '4px solid var(--accent-color)';
        notification.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center; background: rgba(51, 102, 187, 0.1); width: 28px; height: 28px; border-radius: 50%; color: var(--accent-color); font-size: 14px; font-weight: bold; flex-shrink: 0;">✓</span>
            <span style="flex: 1; line-height: 1.4;">${message}</span>
        `;
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid #ef4444';
        notification.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); width: 28px; height: 28px; border-radius: 50%; color: #ef4444; font-size: 14px; font-weight: bold; flex-shrink: 0;">!</span>
            <span style="flex: 1; line-height: 1.4;">${message}</span>
        `;
    } else {
        notification.style.borderLeft = '4px solid var(--accent-color)';
        notification.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center; background: rgba(51, 102, 187, 0.1); width: 28px; height: 28px; border-radius: 50%; color: var(--accent-color); font-size: 14px; font-weight: bold; flex-shrink: 0;">i</span>
            <span style="flex: 1; line-height: 1.4;">${message}</span>
        `;
    }
    
    container.appendChild(notification);
    
    // Trigger slide-in/fade-in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3500);
}

// Global Interactive Map Regions Data
const MAP_REGIONS_DATA = {
    mena: {
        name: "Middle East & North Africa (MENA)",
        stats: "~370 Million Muslims (~93% of region)",
        history: "The cradle of Islamic civilization. Revelations began in Makkah and Madinah in the early 7th century. From here, Islam spread rapidly across North Africa and the Levant, creating early centers of trade, culture, and philosophy in cities like Baghdad, Cairo, and Damascus.",
        quranQuote: "I swear by this city [Makkah] - and you, [O Muhammad], are free of restriction in this city...",
        quranRef: "Surah Al-Balad (90:1-2)",
        quranLink: "surah_90:1",
        landmark: "The Holy Ka'bah in Makkah, Saudi Arabia."
    },
    central_south_asia: {
        name: "Central & South Asia",
        stats: "~700 Million Muslims (Home to the largest population)",
        history: "Islam integrated into South Asia through spiritual scholars (Sufism) and trade routes, creating syncretic cultural traditions. Central Asia became a core intellectual hub of the Islamic Golden Age; Bukhara and Samarkand produced foundational scholars of mathematics, medicine, and Hadith sciences.",
        quranQuote: "And We have not sent you, [O Muhammad], except as a mercy to the worlds.",
        quranRef: "Surah Al-Anbiya (21:107)",
        quranLink: "surah_21:107",
        landmark: "The Registan of Samarkand, Uzbekistan / Badshahi Mosque in Lahore."
    },
    southeast_asia: {
        name: "Southeast Asia & Pacific",
        stats: "~300 Million Muslims (Indonesia is the largest Muslim country)",
        history: "Spread completely peacefully via maritime merchants and trade. Arab and Indian Muslim traders introduced Islam to the ports of Sumatra, Java, and the Malay Peninsula starting in the 11th century. The local populations voluntarily accepted the faith due to the high ethical standards of the merchants.",
        quranQuote: "Invite to the way of your Lord with wisdom and good instruction, and argue with them in a way that is best...",
        quranRef: "Surah An-Nahl (16:125)",
        quranLink: "surah_16:125",
        landmark: "Istiqlal Mosque in Jakarta, Indonesia (the largest mosque in Southeast Asia)."
    },
    sub_saharan_africa: {
        name: "Sub-Saharan Africa",
        stats: "~320 Million Muslims",
        history: "Africa was the first refuge for Muslims during the First Hijrah to Abyssinia (Ethiopia) in 615 CE. Islam spread peacefully through trans-Saharan trade routes. Empires like Mali, Songhai, and Kanem-Bornu flourished as epicenters of commerce, literature, and Islamic law.",
        quranQuote: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another...",
        quranRef: "Surah Al-Hujurat (49:13)",
        quranLink: "surah_49:13",
        landmark: "The Great Djinguereber Mosque in Timbuktu, Mali (built in 1327 CE)."
    },
    europe: {
        name: "Europe & the Balkans",
        stats: "~50 Million Muslims",
        history: "Islam's history in Europe spans over 1,300 years, beginning with the Golden Age of Al-Andalus (Spain) in 711 CE, which acted as a scientific bridge to the Western world. Later, in the 14th century, Islam was introduced to the Balkans (Bosnia, Albania, Kosovo) where it remains an indigenous culture.",
        quranQuote: "Indeed, the earth belongs to Allah. He causes to inherit it whom He wills of His servants...",
        quranRef: "Surah Al-A'raf (7:128)",
        quranLink: "surah_7:128",
        landmark: "The Alhambra Palace in Granada, Spain / Gazi Husrev-beg Mosque in Sarajevo, Bosnia."
    },
    americas: {
        name: "The Americas",
        stats: "~7 Million Muslims",
        history: "Historical records suggest early West African Muslim explorers crossed the Atlantic prior to Columbus. Later, enslaved West African Muslims brought their faith under captivity, maintaining their scriptures from memory. In the late 19th/20th centuries, waves of migration created modern, diverse hubs across North and South America.",
        quranQuote: "And of His signs is the creation of the heavens and the earth and the diversity of your languages and your colors...",
        quranRef: "Surah Ar-Rum (30:22)",
        quranLink: "surah_30:22",
        landmark: "The Islamic Center of Washington D.C., USA."
    }
};

// Map Regions and Countries Code Mapping
const REGIONS_MAPPING = {
    mena: ["ma", "dz", "tn", "ly", "eg", "sd", "eh", "sa", "ye", "om", "ae", "qa", "bh", "kw", "iq", "jo", "il", "ps", "lb", "sy", "tr", "ir", "ge", "am", "az"],
    europe: ["is", "no", "se", "fi", "gb", "ie", "fr", "es", "pt", "it", "ch", "de", "be", "nl", "lu", "dk", "pl", "cz", "sk", "at", "hu", "si", "hr", "ba", "rs", "me", "al", "mk", "gr", "bg", "ro", "ua", "by", "lt", "lv", "ee", "md"],
    sub_saharan_africa: ["mr", "sn", "gm", "gw", "gn", "sl", "lr", "ci", "gh", "tg", "bj", "ng", "ne", "td", "ml", "bf", "cm", "cf", "gq", "ga", "cg", "cd", "ao", "na", "za", "ls", "sz", "bw", "zw", "mz", "mw", "zm", "tz", "ke", "ug", "rw", "bi", "so", "et", "er", "dj", "mg", "_somaliland"],
    central_south_asia: ["af", "pk", "in", "bd", "np", "bt", "lk", "mv", "kz", "uz", "tm", "kg", "tj", "ru", "cn", "mn", "jp", "kp", "kr", "tw"],
    southeast_asia: ["mm", "th", "la", "kh", "vn", "my", "sg", "id", "ph", "bn", "tl", "au", "nz", "pg"],
    americas: ["ca", "us", "mx", "gt", "bz", "hn", "sv", "ni", "cr", "pa", "cu", "ht", "do", "jm", "pr", "co", "ve", "gy", "sr", "gf", "ec", "pe", "br", "bo", "py", "uy", "ar", "cl", "gl", "bs"]
};

let activeMapRegion = 'mena';

// Highlight all countries in a region
window.highlightRegion = function(regionId) {
    document.querySelectorAll('.map-country').forEach(el => {
        el.classList.remove('highlighted');
    });
    
    const codes = REGIONS_MAPPING[regionId];
    if (codes) {
        codes.forEach(code => {
            const el = document.getElementById(code);
            if (el) {
                // Highlight borders and inside the borders
                const paths = el.tagName.toLowerCase() === 'path' ? [el] : el.querySelectorAll('path');
                paths.forEach(p => {
                    p.classList.add('highlighted');
                });
            }
        });
    }
};

window.clearRegionHighlight = function() {
    window.highlightRegion(activeMapRegion);
};

// Global Interactive Map Selection Handler
window.showMapRegion = function(regionId) {
    activeMapRegion = regionId;
    window.highlightRegion(regionId);
    
    const data = MAP_REGIONS_DATA[regionId];
    if (!data) return;
    
    // Update details panel
    const panel = document.getElementById('map-details-panel');
    if (panel) {
        panel.innerHTML = `
            <div style="animation: slideDown 0.3s ease; padding: 22px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--sidebar-bg); border-left: 4px solid var(--accent-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 10px; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="margin: 0; color: var(--text-color); font-size: 18px; font-weight: 700;">${data.name}</h3>
                    <span style="background: var(--accent-color); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        ${data.stats}
                    </span>
                </div>
                <p style="margin-bottom: 15px; line-height: 1.6; color: var(--text-color); font-size: 14.5px;">${data.history}</p>
                <div style="background: var(--content-bg); border: 1px solid var(--border-light); border-radius: 6px; padding: 15px; margin: 15px 0; font-style: italic; color: var(--text-color);">
                    <div style="font-weight: bold; font-style: normal; font-size: 13px; color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Quranic Foundation</div>
                    "${data.quranQuote}" 
                    <br><a href="#${data.quranLink}" onclick="navigateTo('${data.quranLink}'); return false;" style="color: var(--accent-color); font-weight: 600; font-style: normal; display: inline-block; margin-top: 5px; text-decoration: none; cursor: pointer; transition: opacity var(--transition-speed);" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">— ${data.quranRef} 📖</a>
                </div>
                <div style="font-size: 13.5px; color: var(--text-muted); margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                    <span>📍</span> <span><b>Key Historical Landmark:</b> ${data.landmark}</span>
                </div>
            </div>
        `;
    }
};

// Programmatic world-map.svg loader and event binder
function loadGlobalIslamMap() {
    const container = document.getElementById('world-map-container');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align: center; padding: 30px;"><span style="color: var(--accent-color);">Loading interactive atlas...</span></div>';
    
    fetch('world-map.svg')
        .then(res => res.text())
        .then(svgText => {
            const cleanSvg = svgText.substring(svgText.indexOf('<svg'));
            container.innerHTML = cleanSvg;
            
            const svgEl = container.querySelector('svg');
            if (svgEl) {
                svgEl.removeAttribute('width');
                svgEl.removeAttribute('height');
                
                // Bind hover/click event listeners to each country path
                svgEl.querySelectorAll('path').forEach(path => {
                    path.classList.add('map-country');
                    
                    const countryId = path.id || path.parentElement.id;
                    if (countryId) {
                        let matchedRegion = null;
                        for (const region in REGIONS_MAPPING) {
                            if (REGIONS_MAPPING[region].includes(countryId.toLowerCase())) {
                                matchedRegion = region;
                                break;
                            }
                        }
                        
                        if (matchedRegion) {
                            path.addEventListener('click', () => window.showMapRegion(matchedRegion));
                            path.addEventListener('mouseenter', () => window.highlightRegion(matchedRegion));
                            path.addEventListener('mouseleave', () => window.clearRegionHighlight());
                        }
                    }
                });
            }
            
            // Set default active region selection
            setTimeout(() => {
                window.showMapRegion(activeMapRegion);
            }, 50);
        })
        .catch(err => {
            console.error("Error loading SVG world map:", err);
            container.innerHTML = '<div style="color: var(--error-color); padding: 20px;">Error loading map visualization. Please try refreshing.</div>';
        });
}

// 6-4-4-6 Trainer State Machine
const HifzTrainer6446 = {
    active: false,
    surahId: 1,
    verseNum: 1,
    currentStep: 1, // 1: Read (6x), 2: Recite (4x), 3: Read (4x), 4: Recite (6x)
    currentRepetition: 1,
    isPeeking: false,
    
    stepsConfig: [
        { id: 1, name: "Read Look-In (Open)", targetReps: 6, maskText: false },
        { id: 2, name: "Recite from Memory (Closed)", targetReps: 4, maskText: true },
        { id: 3, name: "Re-Read Look-In (Open)", targetReps: 4, maskText: false },
        { id: 4, name: "Final Recitation (Closed)", targetReps: 6, maskText: true }
    ],

    start(surahId, verseNum) {
        this.active = true;
        this.surahId = surahId;
        this.verseNum = verseNum;
        this.currentStep = 1;
        this.currentRepetition = 1;
        this.isPeeking = false;
        this.render();

        // Auto-play the first repetition if Step 1 (open loop) is active and checked
        setTimeout(() => {
            const stepDef = this.stepsConfig[this.currentStep - 1];
            const audioCheck = document.getElementById('trainer-audio-loop-check');
            if (audioCheck && audioCheck.checked && !stepDef.maskText) {
                AudioController.setTrack(this.surahId, this.verseNum);
                if (!AudioController.isPlaying) {
                    AudioController.togglePlay();
                }
            }
        }, 50);
    },

    nextRepetition() {
        const stepDef = this.stepsConfig[this.currentStep - 1];
        if (this.currentRepetition < stepDef.targetReps) {
            this.currentRepetition++;
            // Optional: Auto-trigger audio loop play on each repetition (only for open-loop steps)
            const audioCheck = document.getElementById('trainer-audio-loop-check');
            if (audioCheck && audioCheck.checked && !stepDef.maskText) {
                AudioController.setTrack(this.surahId, this.verseNum);
                if (!AudioController.isPlaying) {
                    AudioController.togglePlay();
                }
            } else {
                // If it is a closed step, make sure audio is paused so the user recites from memory
                if (AudioController.isPlaying) {
                    AudioController.togglePlay();
                }
            }
        } else {
            // Move to next step in the cycle
            if (this.currentStep < 4) {
                this.currentStep++;
                this.currentRepetition = 1;
                this.isPeeking = false;

                // When transitioning to a new step, check if it should auto-play (open-loop only)
                const nextStepDef = this.stepsConfig[this.currentStep - 1];
                const audioCheck = document.getElementById('trainer-audio-loop-check');
                if (audioCheck && audioCheck.checked && !nextStepDef.maskText) {
                    AudioController.setTrack(this.surahId, this.verseNum);
                    if (!AudioController.isPlaying) {
                        AudioController.togglePlay();
                    }
                } else {
                    // Pause/stop the audio if moving to a masked/closed step
                    if (AudioController.isPlaying) {
                        AudioController.togglePlay();
                    }
                }
            } else {
                showNotification(`Excellent! Verse ${this.surahId}:${this.verseNum} completed using the 6-4-4-6 method!`, 'success');
                // Move to next verse automatically
                const surah = SURAH_METADATA.find(s => s.id === this.surahId);
                if (surah && this.verseNum < surah.verses) {
                    this.start(this.surahId, this.verseNum + 1);
                    return;
                } else {
                    this.active = false;
                    showNotification("Completed all verses in the selected range!", 'success');
                    renderHifzHelper();
                    return;
                }
            }
        }
        this.render();
    },

    togglePeek() {
        this.isPeeking = !this.isPeeking;
        this.render();
    },

    skipStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.currentRepetition = 1;
            this.isPeeking = false;
            this.render();
        }
    },

    render() {
        const container = document.getElementById('hifz-workspace-body');
        if (!container) return;

        let verseData;
        if (this.surahId === 1) {
            const fv = FATIHAH_SHIFTED[this.verseNum - 1];
            verseData = fv ? { arabic: fv.arabic, english: fv.english } : { arabic: "", english: "" };
        } else {
            verseData = localQuranScripture[this.surahId]?.[this.verseNum] || { arabic: "... Loading Arabic Text ...", english: "" };
        }
        const stepDef = this.stepsConfig[this.currentStep - 1];
        
        // Check if text should be masked
        const shouldMask = stepDef.maskText && !this.isPeeking;
        
        let arabicContent = '';
        if (shouldMask) {
            // Render text hidden as blank squares for active recall
            arabicContent = `
                <div class="hifz-mushaf-masked" style="text-align:center; padding: 35px; border: 2px dashed var(--border-color); border-radius: 8px; font-style: italic; color: var(--text-muted); background: var(--bg-secondary);">
                    Text is hidden. Recite this verse from memory.
                </div>
            `;
        } else {
            arabicContent = `
                <div class="verse-arabic" style="text-align: right; line-height: 2.2; font-size: 28px; font-family: 'Amiri', serif; color: var(--arabic-color);">
                    ${verseData.arabic}
                </div>
            `;
        }

        container.innerHTML = `
            <div class="card" style="padding: 25px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--content-bg);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: var(--text-color);">Verse ${this.surahId}:${this.verseNum}</h3>
                    <span style="background: var(--accent-color); color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                        6-4-4-6 Trainer Mode
                    </span>
                </div>

                <div class="trainer-step-header" style="background: var(--bg-secondary); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <div style="font-weight: 700; color: var(--text-color); font-size: 16px;">
                        Step ${this.currentStep} of 4: ${stepDef.name}
                    </div>
                    <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                        Objective: Repeat this step <b>${stepDef.targetReps} times</b>.
                    </div>
                </div>

                <!-- Repetition Progress Bar -->
                <div class="trainer-progress-bar" style="margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: var(--text-color);">
                        <span>Progress: <b>Repetition ${this.currentRepetition} of ${stepDef.targetReps}</b></span>
                        <span>${Math.round((this.currentRepetition / stepDef.targetReps) * 100)}%</span>
                    </div>
                    <div style="background: var(--border-light); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${(this.currentRepetition / stepDef.targetReps) * 100}%; background: var(--accent-color); height: 100%; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <!-- Arabic Verse Area -->
                <div style="margin: 25px 0;">
                    ${arabicContent}
                </div>

                <!-- Translation Area -->
                <div class="verse-translation" style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 15px; font-style: italic; color: var(--text-muted);">
                    Meaning: "${verseData.english}"
                </div>

                <!-- Controller Actions -->
                <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div style="display:flex; gap:10px;">
                        <button class="theme-select-btn active" onclick="HifzTrainer6446.nextRepetition()" style="padding: 10px 20px; font-weight: 600;">
                            ✓ Completed Repetition (${this.currentRepetition}/${stepDef.targetReps})
                        </button>
                        ${stepDef.maskText ? `
                            <button class="theme-select-btn" onclick="HifzTrainer6446.togglePeek()">
                                ${this.isPeeking ? 'Hide' : '👁 Peek at Text'}
                            </button>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <label style="font-size: 13px; color: var(--text-muted); cursor:pointer;">
                            <input type="checkbox" id="trainer-audio-loop-check" checked> Play audio loop
                        </label>
                        <button class="text-btn" onclick="HifzTrainer6446.skipStep()">Skip Step</button>
                    </div>
                </div>
            </div>
        `;
    }
};

// Render Hifz Helper Module
function renderHifzHelper() {
    HifzTrainer6446.active = false;
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.innerText = "🎯 Interactive Hifz Helper";

    renderInfobox({
        "title": "Hifz Assistant",
        "image": "🎯",
        "purpose": "Acoustic repetition & active recall tools",
        "saved_sessions": "Local Offline Mode"
    });

    let html = `
        <p>The <b>Hifz Helper</b> is designed to speed up scripture retention through <i>spaced repetition</i>, <i>acoustic looping</i>, and <i>active translation recall</i>.</p>
        
        <div class="hifz-setup-card card" style="padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border-color); background: var(--content-bg);">
            <h3 style="color: var(--text-color); margin-top:0;">Configure Workspace</h3>
            <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px;">
                <div style="flex: 1; min-width: 200px;">
                    <label style="display:block; margin-bottom: 5px; font-weight: 600; color: var(--text-color);">Surah</label>
                    <select id="hifz-surah-select" style="width: 100%; padding: 8px;" class="player-select">
                        ${SURAH_METADATA.map(s => `<option value="${s.id}">Surah ${s.name} (${s.english})</option>`).join('')}
                    </select>
                </div>
                <div style="width: 100px;">
                    <label style="display:block; margin-bottom: 5px; font-weight: 600; color: var(--text-color);">Start Verse</label>
                    <input type="number" id="hifz-start-v" value="1" min="1" style="width: 100%; padding: 7px;" class="player-number-input">
                </div>
                <div style="width: 100px;">
                    <label style="display:block; margin-bottom: 5px; font-weight: 600; color: var(--text-color);">End Verse</label>
                    <input type="number" id="hifz-end-v" value="5" min="1" style="width: 100%; padding: 7px;" class="player-number-input">
                </div>
                <div style="align-self: flex-end;">
                    <button id="hifz-load-btn" class="theme-select-btn active" style="padding: 8px 15px;">Load Range</button>
                </div>
            </div>
            
            <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap; padding-top: 15px; border-top: 1px solid var(--border-color);">
                <div style="color: var(--text-color);">
                    <b>Mode:</b>
                    <label style="margin-left: 10px; cursor:pointer;"><input type="radio" name="hifz-mode" value="arabic"> Memorize Arabic</label>
                    <label style="margin-left: 10px; cursor:pointer;"><input type="radio" name="hifz-mode" value="meaning"> Memorize Meaning</label>
                    <label style="margin-left: 10px; cursor:pointer;"><input type="radio" name="hifz-mode" value="teach"> Teach Vocabulary</label>
                    <label style="margin-left: 10px; cursor:pointer;"><input type="radio" name="hifz-mode" value="6446" checked> 6-4-4-6 Trainer</label>
                </div>
                
                <div id="hifz-presets-container" style="display:none; color: var(--text-color);">
                    <b>Masking:</b>
                    <button class="text-btn" onclick="applyMaskPreset('show')">Show All</button> |
                    <button class="text-btn" onclick="applyMaskPreset('hide')">Hide All</button> |
                    <button class="text-btn" onclick="applyMaskPreset('even')">Mask Even</button> |
                    <button class="text-btn" onclick="applyMaskPreset('odd')">Mask Odd</button>
                </div>
            </div>
        </div>

        <div id="hifz-workspace-body">
            <div style="text-align: center; padding: 40px; color: var(--text-muted); font-style: italic;">
                Select a Surah and range above to start memorizing.
            </div>
        </div>
    `;

    const bodyEl = document.getElementById('article-body');
    if (bodyEl) bodyEl.innerHTML = html;

    // Load handlers
    document.getElementById('hifz-load-btn').addEventListener('click', () => loadHifzWorkspace());
    
    document.querySelectorAll('input[name="hifz-mode"]').forEach(input => {
        input.addEventListener('change', () => renderSelectedHifzMode());
    });
}

function loadHifzWorkspace() {
    const surahId = parseInt(document.getElementById('hifz-surah-select').value);
    const startV = parseInt(document.getElementById('hifz-start-v').value);
    const endV = parseInt(document.getElementById('hifz-end-v').value);
    
    const workspaceBody = document.getElementById('hifz-workspace-body');
    if (workspaceBody) {
        workspaceBody.innerHTML = `<div style="text-align: center; padding: 30px;"><span style="color: var(--accent-color);">Setting up workspace...</span></div>`;
    }

    // Preload Audio element reference bar
    const bar = document.getElementById('hifz-audio-player-bar');
    if (bar) bar.style.display = 'block';
    
    AudioController.init();
    AudioController.setTrack(surahId, startV, startV, endV);

    renderSelectedHifzMode();
}

function renderSelectedHifzMode() {
    const surahId = parseInt(document.getElementById('hifz-surah-select').value);
    const startV = parseInt(document.getElementById('hifz-start-v').value);
    const endV = parseInt(document.getElementById('hifz-end-v').value);
    const mode = document.querySelector('input[name="hifz-mode"]:checked').value;
    
    const presetsDiv = document.getElementById('hifz-presets-container');
    if (presetsDiv) {
        presetsDiv.style.display = (mode === 'arabic') ? 'block' : 'none';
    }

    if (mode === '6446') {
        HifzTrainer6446.start(surahId, startV);
        return;
    }
    
    HifzTrainer6446.active = false;
    const workspaceBody = document.getElementById('hifz-workspace-body');
    if (!workspaceBody) return;

    let html = `
        <div class="hifz-playlist-controls" style="margin-bottom: 15px; display:flex; gap: 10px; justify-content: flex-end;">
            <button class="theme-select-btn active" onclick="AudioController.togglePlay()" style="padding: 8px 12px; font-size:13px;">🔊 Play Selection Audio</button>
        </div>
    `;

    // Render Bismillah banner for Hifz Helper too if not Surah 9 (At-Tawbah) and startV is 1
    if (surahId !== 9 && startV === 1) {
        html += `
            <div class="bismillah-banner" style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary);">
                <span style="font-family: 'Amiri', serif; font-size: 28px; color: var(--arabic-color);">بِسْمِ اللَّهِ الرَّحْمَـنِ الرَّحِيمِ</span>
                <span class="action-link" onclick="window.playVerseAudio(${surahId}, 0)" style="font-size: 13px; font-weight: 500;">🔊 Listen</span>
            </div>
        `;
    }

    html += `<div class="quran-container">`;

    for (let v = startV; v <= endV; v++) {
        const rowId = `hifz-verse-row-${v}`;
        
        let verseData;
        if (surahId === 1) {
            const fv = FATIHAH_SHIFTED[v - 1];
            verseData = fv ? { arabic: fv.arabic, english: fv.english } : { arabic: "", english: "" };
        } else {
            verseData = localQuranScripture[surahId]?.[v] || { arabic: "", english: "[Translation loading...]" };
        }

        const wbwWords = localWordByWordData[surahId]?.[surahId === 1 ? v + 1 : v] || [];
        
        let arabicContentHtml = '';

        if (mode === 'teach' && wbwWords.length > 0) {
            arabicContentHtml = `<div style="display: flex; flex-wrap: wrap; gap: 8px; direction: rtl; justify-content: flex-start;">`;
            wbwWords.forEach(word => {
                arabicContentHtml += `
                    <div class="hifz-word-card" style="border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; text-align: center; min-width: 70px; background: var(--content-bg);">
                        <div style="font-size: 24px; font-family: 'Amiri', serif; margin-bottom: 4px; color: var(--arabic-color);">${word.arabic}</div>
                        <div style="font-size: 11px; color: var(--accent-color); font-weight: 500;">${word.transliteration}</div>
                        <div class="word-meaning-popup">${word.translation}</div>
                    </div>
                `;
            });
            arabicContentHtml += `</div>`;
        } else if (mode === 'arabic' && wbwWords.length > 0) {
            arabicContentHtml = `<div style="direction: rtl; text-align: right; line-height: 2.2;">`;
            wbwWords.forEach((word, index) => {
                arabicContentHtml += `
                    <span class="hifz-word" id="word-${v}-${index}" onclick="this.classList.toggle('masked')">
                        ${word.arabic}
                    </span>
                `;
            });
            arabicContentHtml += `</div>`;
        } else {
            arabicContentHtml = `<div class="verse-arabic" style="text-align: right; color: var(--arabic-color);">${verseData.arabic}</div>`;
        }

        html += `
            <div class="verse-row" id="${rowId}" style="margin-bottom: 20px; border: 1px solid var(--border-color); padding: 15px; border-radius:8px;">
                <div class="verse-top">
                    <span class="verse-num">Verse ${surahId}:${v}</span>
                    <div class="verse-actions">
                        <span class="action-link" onclick="AudioController.setTrack(${surahId}, ${v}, ${startV}, ${endV}); AudioController.togglePlay();">🔊 Listen</span>
                    </div>
                </div>
                
                <div style="margin: 15px 0;">
                    ${arabicContentHtml}
                </div>
                
                <div class="verse-translation" style="${mode === 'meaning' ? 'background: var(--bg-secondary); padding: 12px; border-radius:6px; cursor: pointer; color: transparent; border: 1px dashed var(--border-color);' : ''}" 
                     onclick="${mode === 'meaning' ? "this.style.color = 'var(--text-color)'; this.style.background = 'transparent'; this.style.borderStyle = 'solid';" : ''}">
                    ${mode === 'meaning' ? '👁️ Click to reveal meaning: <br><br>' + verseData.english : verseData.english}
                </div>
            </div>
        `;
    }

    html += `</div>`;
    workspaceBody.innerHTML = html;
}

function applyMaskPreset(type) {
    const words = document.querySelectorAll('.hifz-word');
    words.forEach((word, index) => {
        if (type === 'show') {
            word.classList.remove('masked');
        } else if (type === 'hide') {
            word.classList.add('masked');
        } else if (type === 'even') {
            if (index % 2 === 0) word.classList.add('masked');
            else word.classList.remove('masked');
        } else if (type === 'odd') {
            if (index % 2 !== 0) word.classList.add('masked');
            else word.classList.remove('masked');
        }
    });
}

// Global listen trigger from normal Quran Surah view
window.playVerseAudio = function(surahId, verseVal) {
    const bar = document.getElementById('hifz-audio-player-bar');
    if (bar) bar.style.display = 'block';
    AudioController.init();
    AudioController.setTrack(surahId, verseVal, verseVal, verseVal);
    
    // Ensure we start playing
    if (!AudioController.isPlaying) {
        AudioController.togglePlay();
    } else {
        AudioController.reloadAudioSource();
        AudioController.audioElement.play().catch(e => console.log(e));
    }
};

// Bind to window for global access
window.AudioController = AudioController;
window.HifzTrainer6446 = HifzTrainer6446;
window.applyMaskPreset = applyMaskPreset;
window.renderHifzHelper = renderHifzHelper;
window.loadHifzWorkspace = loadHifzWorkspace;
window.renderSelectedHifzMode = renderSelectedHifzMode;

