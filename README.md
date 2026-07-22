# ಕನ್ನಡ ಅಕ್ಷರರೂಪ ಪರಿವರ್ತಕ

Kannada Font Converter — Convert between Legacy ASCII (Nudi/Baraha/ShreeLipi/Prakashak/Akruti) and Unicode.

Live at **[converter.sanchaya.net](https://converter.sanchaya.net)** (GitHub Pages, fully client-side).

## Pages

| Page | Description |
|------|-------------|
| `index.html` | The converter — five sections: ಪಠ್ಯ (text), ಫೈಲ್ (file), ಮಿಶ್ರಿತ ಪಠ್ಯ ಪತ್ತೆ (mixed-text detection), URL, ಲೈವ್ ಸಂಪಾದಕ (live editor) |
| `keyboards.html` | Kannada keyboard layout reference — KGP/Nudi, InScript, Transliteration |
| `mappings.html` | ASCII ↔ Unicode character mapping tables for all four fonts, rendered live from the converter's own data (with search) |
| `about.html` | About the project |

## Features

- **Text Conversion**: ASCII ↔ Unicode (a2u / u2a / auto-detect) for Nudi/Baraha, ShreeLipi, Prakashak, and Akruti encodings
- **English & number retention**: Latin text passes through unchanged; standalone numbers (including decimals) are preserved — digits that are part of the ASCII encoding still convert correctly
- **Live Editor** — a dual-pane editor that works in both directions:
  - *ASCII simulator mode*: behaves like a legacy Nudi editor — anything typed (including Kannada via IME) is normalized to ASCII on the left, with live Unicode on the right and a preview of how the ASCII renders in a legacy-font editor
  - *Unicode → ASCII mode*: type Unicode on the left, get the ASCII encoding on the right
  - **Bidirectional editing**: both panes are editable; editing either side updates the other live
  - **Editor toolbars** on both panes: file open (TXT/DOCX), font selection, font size, copy, download, expand, clear
  - **File upload**: TXT (UTF-8 with windows-1252 fallback for legacy files) and DOCX (text extracted; embedded images are detected and reported as skipped); conversion direction auto-adjusts to the file's format
  - **Downloads**: one-click ASCII / Unicode / both (labeled sections in a single file)
  - **Keyboard dropdown**: KGP/ನುಡಿ (default), InScript, ಲಿಪ್ಯಂತರಣ, or plain English typing — the single control for jquery.ime on the live panes (the floating IME selector is disabled there to avoid conflicts)
- **Guided tours**: the ಮಾರ್ಗದರ್ಶಿ button walks through the active section step by step (driver.js)
- **Mixed-text detection**: highlights which parts of a document are ASCII vs Unicode
- **URL conversion**: fetch a legacy-font web page and convert it (CORS proxy fallback chain)
- **Number formats**: Kannada (೦೧೨), English (012), or keep original

## Quick Start (static)

Everything runs client-side. Serve the directory with any static server:

```bash
npx serve .
```

or just open `index.html`. This is how the GitHub Pages deployment works.

## Optional Node server

An Express server provides a REST API and conversion history:

```bash
npm install
PORT=3001 npm start
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/convert | Convert text |
| GET | /api/history | Get conversion history |
| GET | /api/convert/:id | Get specific conversion |
| GET | /api/health | Health check |

```bash
curl -X POST http://localhost:3001/api/convert \
  -H "Content-Type: application/json" \
  -d '{ "text": "ನಮಸ್ಕಾರ", "direction": "auto", "numFormat": "keep" }'
```

## Live Editor Usage

1. Open the **ಲೈವ್ ಸಂಪಾದಕ** tab — KGP keyboard activates automatically
2. Pick a direction: ASCII ಸಿಮ್ಯುಲೇಟರ್ → Unicode (default) or Unicode → ASCII
3. Type in either pane, or load a TXT/DOCX file from a pane's toolbar — both formats stay in sync as you edit
4. Download ASCII, Unicode, or both from the settings bar

**KGP key reference**: consonants map to lowercase (`k`→ಕ, `r`→ರ), vowel signs follow consonants (`kA`→ಕಾ), `f` after a consonant gives halant (್). Full layouts on the [keyboards page](https://converter.sanchaya.net/keyboards.html); complete mapping tables on the [mappings page](https://converter.sanchaya.net/mappings.html).

## Project Structure

```
├── index.html          # Converter UI (5 sections)
├── keyboards.html      # Keyboard layout reference
├── mappings.html       # Font mapping tables (rendered from app.js data)
├── about.html          # About page
├── css/style.css       # Shared styles
├── js/app.js           # Conversion engine + UI logic
├── js/tour.js          # Guided tours (driver.js)
├── server.js           # Optional Express server (API/history)
├── img/                # Branding + keyboard images
└── .autopilot/         # Maintenance notes
```

## Adding an embedded legacy font (future)

The live editor's font menu is driven by the `LIVE_EDITOR_FONTS` registry in `js/app.js`. To render the ASCII pane in an actual legacy font: add an `@font-face` rule in `css/style.css`, then add one entry to the registry and a matching `<option>` in the toolbar selects.

## Domains

- **converter.sanchaya.net** — primary (GitHub Pages custom domain)
- **parivarthaka.sanchaya.net** — alias (DNS-level; GitHub Pages reads only the first CNAME line)

## Supported Formats

- **Input**: Nudi ASCII, Baraha ASCII, ShreeLipi ASCII, Prakashak ASCII, Akruti ASCII, Unicode Kannada
- **Output**: Unicode Kannada or ASCII (per selected font)
- **Files**: TXT, DOCX (read; images skipped), TXT (write)

## Dependencies (CDN)

- [jQuery IME](https://github.com/wikimedia/jquery.ime) — Kannada input methods (KGP, InScript, Transliteration)
- [driver.js](https://github.com/kamranahmedse/driver.js) — guided tours (MIT)
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) — DOCX text extraction
- Bootstrap 5.3, Font Awesome 6.4, Google Fonts (Anek Kannada, IBM Plex Sans)

## License

MIT
