# Quran Encyclopedia & CLI 📖

A premium, offline-first command-line application and interactive Web Portal to read the Quran English translation (Sahih International), explore scholarly exegeses (Tafsirs) from three distinct sources, and read historical context articles (Seerah).

```
      ___  _   _ ____    _    _   _ 
     / _ \| | | |  _ \  / \  | \ | |
    | | | | | | | |_) |/ _ \ |  \| |
    | |_| | |_| |  _ < / ___ \| |\  |
     \__\_\\___/|_| \_/_/   \_\_| \_|

       The Holy Qur'an - CLI Translation
```

---

## Features ✨

### 💻 Command Line Interface (CLI)
* **Offline First**: Automatically resolves the Quran translation locally. If the database is missing, it automatically downloads it on the first run.
* **Robust Query Parsing**:
  * Entire chapters: `quran 1`, `quran fatihah`, `quran "the opening"`
  * Specific verses: `quran 2:255`, `quran baqarah 255`
  * Verse ranges: `quran 114:1-6`, `quran nas 1-3`
* **Fuzzy & Substring Name Search**: Handles minor spelling errors (e.g., `baqaraa`) or partial searches (e.g., `imran`) to suggest matches.
* **Scholarly Tafsir Integration**: Supplying `-t` or `--tafsir` prints three distinct commentaries sequentially with color-coded headers and custom column wrapping:
  1. **Tazkirul Quran** (Modern, beginner-friendly - Yellow)
  2. **Tafsir Ibn Kathir** (Classical - Magenta)
  3. **Ma'arif al-Qur'an** (Traditional/Legal - Blue)
* **Respectful Formatting**: Centers and prints the *Bismillah* before starting any chapter (except Surah At-Tawbah and Surah Al-Fatihah, where it is already integrated).
* **Terminal Pager**: Supports an interactive screen-by-screen pager for long passages to prevent terminal overflow.

### 🌐 Interactive Web Portal (Encyclopedia)
* **Left-side Search & Navigation**: Toggle between historical articles and select any of the 114 Surahs.
* **Tabbed Scholarly Commentaries**: Click on `📖 Tafsir` on any verse to slide open a tabbed drawer containing three commentaries, prioritizing **Tazkirul Quran** first, followed by **Ibn Kathir** and **Ma'arif al-Qur'an**.
* **Seerah Portal**: Encyclopedic, Wikipedia-style articles detailing:
  * The Meccan Period (610–622 CE)
  * The Medinan Period (622–632 CE)
  * Compilation & Standardization of the Quranic text
* **🌗 Theme Customization**: Saved dark and light mode stylesheet toggle.

---

## Data Accuracy & Verifiability 🛡️

When using software to study religious texts, accuracy is critical. **This application does not use AI generation or LLMs to write translations, commentaries, or Arabic text.**

You can verify the accuracy of the data through the following details:
1. **Quranic Translations**: Sourced from a local static file `eng-ummmuhammad.json`, which represents the widely accepted **Sahih International** English translation. 
2. **Arabic Scripture**: Fetched in real-time from the official [Quran.com API](https://api.quran.com) using the standardized Uthmani script (`quran/verses/uthmani`).
3. **Scholarly Interpretations (Tafsir)**: Sourced directly from the official Quran.com API exegesis databases:
   - **Tazkirul Quran** (API Resource ID: `817`)
   - **Tafsir Ibn Kathir** (API Resource ID: `169`)
   - **Ma'arif al-Qur'an** (API Resource ID: `168`)
   *The script only applies basic formatting rules to strip HTML styling, which can be verified in [quran](file:///home/razim/quran-app/quran#L338) and [wiki.js](file:///home/razim/quran-app/wiki/wiki.js#L644).*
4. **Historical Articles (Seerah)**: These are static text pages pre-written in [seerah.js](file:///home/razim/quran-app/wiki/seerah.js). You can review every line of history manually to verify the dates and events.

---

## Installation 🚀

Since the application is built using standard Python and vanilla JS/CSS, installation requires zero external library dependencies.

### 1. Run the Installer
Run the helper script in the repository:
```bash
./setup.sh
```
The script will:
* Set up standard local paths (`~/.local/bin` and `~/.local/share/quran`).
* Copy the translation database locally for offline speed.
* Install and make executable the `quran` command.

### 2. Add to PATH (If Needed)
If `~/.local/bin` is not already in your path, add it by appending it to your shell profile:
* **Bash**:
  ```bash
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
  ```
* **Zsh**:
  ```bash
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
  ```

---

## Usage Guide 💡

### Command Line examples
```bash
quran list                  # List all 114 Surahs
quran fatihah               # Read Surah Al-Fatihah
quran 2:255                 # Read Ayat al-Kursi
quran nas 1-3               # Read Surah An-Nas verses 1-3
quran 108:1 -t              # Read Surah Al-Kauthar verse 1 with Tafsirs
```

### Launching the Web Portal
1. Run the local Python server:
   ```bash
   python3 wiki/server.py
   ```
2. Open in your browser:
   [http://localhost:8000](http://localhost:8000)

---

## Project Structure 📂

* **[quran](file:///home/razim/quran-app/quran)**: Python CLI entry point.
* **[eng-ummmuhammad.json](file:///home/razim/quran-app/eng-ummmuhammad.json)**: Offline English translation database.
* **[setup.sh](file:///home/razim/quran-app/setup.sh)**: Installation helper script.
* **[wiki/](file:///home/razim/quran-app/wiki)**: Directory containing the HTML, CSS, client logic, and Seerah database.
