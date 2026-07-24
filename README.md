# ಕನ್ನಡ ಅಕ್ಷರರೂಪ ಪರಿವರ್ತಕ

Kannada Font Converter - Convert between Legacy ASCII (Nudi/Baraha, ShreeLipi, Prakashak, Akruti, Surabhi, ISM Nandi, Dharma ILs, Janna, SriLipi 850, Shree Deccan, Suchi Kan, WinKey) and Unicode.

Live at **[converter.sanchaya.net](https://converter.sanchaya.net)** (GitHub Pages, fully client-side).

## Pages

| Page | Description |
|------|-------------|
| `index.html` | The converter - five sections: ಪಠ್ಯ (text), ಫೈಲ್ (file), ಮಿಶ್ರಿತ ಪಠ್ಯ ಪತ್ತೆ (mixed-text detection), URL, ಲೈವ್ ಸಂಪಾದಕ (live editor) |
| `keyboards.html` | Kannada keyboard layout reference - KGP/Nudi, InScript, Transliteration |
| `mappings.html` | ASCII ↔ Unicode character mapping tables for all 15 fonts, rendered live from the converter's own data (with search) |
| `status.html` | Conversion accuracy dashboard - per-font pass rates from the automated test suite, split by direction (a2u / u2a) |
| `about.html` | About the project |

## Features

- **Text Conversion**: ASCII ↔ Unicode (a2u / u2a / auto-detect) across 15 encodings: Nudi/Baraha plus 14 pivot-based fonts - ShreeLipi (KAN-850), Prakashak (Praja), Akruti (Mono), Surabhi (KND-series), ISM (KNTT-Nandi), Dharma ILs, Janna Mono, SriLipi 850, Shree Deccan, Surabhi KN, and four that pivot through Nudi Bi - Suchi Kan, ISM (KNB TT-Nandi), Akruti Bi, and WinKey KanEng. Every non-Nudi font is pivot-based: each source encoding is converted to Nudi (Mono, or Bi then Mono) ASCII first, then routed through the Nudi engine
- **English & number retention**: Latin text passes through unchanged; standalone numbers (including decimals) are preserved - digits that are part of the ASCII encoding still convert correctly
- **Live Editor** - a dual-pane editor that works in both directions:
  - *ASCII simulator mode*: behaves like a legacy Nudi editor - anything typed (including Kannada via IME) is normalized to ASCII on the left, with live Unicode on the right and a preview of how the ASCII renders in a legacy-font editor
  - *Unicode → ASCII mode*: type Unicode on the left, get the ASCII encoding on the right
  - **Bidirectional editing**: both panes are editable; editing either side updates the other live
  - **Editor toolbars** on both panes: file open (TXT/DOCX), font selection, font size, copy, download, expand, clear
  - **File upload**: TXT (UTF-8 with windows-1252 fallback for legacy files) and DOCX (text extracted; embedded images are detected and reported as skipped); conversion direction auto-adjusts to the file's format
  - **Downloads**: one-click ASCII / Unicode / both (labeled sections in a single file)
  - **Keyboard dropdown**: KGP/ನುಡಿ (default), InScript, ಲಿಪ್ಯಂತರಣ, or plain English typing - the single control for jquery.ime on the live panes (the floating IME selector is disabled there to avoid conflicts)
- **Guided tours**: the ಮಾರ್ಗದರ್ಶಿ button walks through the active section step by step (driver.js)
- **Status dashboard**: per-font conversion accuracy from 2,077 automated round-trip tests, split by direction (see `status.html`)
- **One-click bug reports**: the ದೋಷ ವರದಿ button opens a GitHub issue prefilled with the current text, output, font, and direction
- **Mixed-text detection**: highlights which parts of a document are ASCII vs Unicode
- **URL conversion**: fetch a legacy-font web page and convert it (CORS proxy fallback chain)
- **Number formats**: Kannada (೦೧೨), English (012), or keep original

## Quick Start (static)

Everything runs client-side. Serve the directory with any static server:

```bash
npx serve .
```

or just open `index.html`. This is how the GitHub Pages deployment works.

Want to run it yourself via Node instead (e.g. on your own server, with a
JSON API and optional submission logging for future improvements)? See
**[DEPLOYMENT.md](DEPLOYMENT.md)**.

## Live Editor Usage

1. Open the **ಲೈವ್ ಸಂಪಾದಕ** tab - KGP keyboard activates automatically
2. Pick a direction: ASCII ಸಿಮ್ಯುಲೇಟರ್ → Unicode (default) or Unicode → ASCII
3. Type in either pane, or load a TXT/DOCX file from a pane's toolbar - both formats stay in sync as you edit
4. Download ASCII, Unicode, or both from the settings bar

**KGP key reference**: consonants map to lowercase (`k`→ಕ, `r`→ರ), vowel signs follow consonants (`kA`→ಕಾ), `f` after a consonant gives halant (್). Full layouts on the [keyboards page](https://converter.sanchaya.net/keyboards.html); complete mapping tables on the [mappings page](https://converter.sanchaya.net/mappings.html).

## Project Structure

```
├── index.html          # Converter UI (5 sections)
├── keyboards.html      # Keyboard layout reference
├── mappings.html       # Font mapping tables (rendered from app.js data)
├── status.html         # Conversion accuracy dashboard (reads test/stats.json)
├── about.html          # About page
├── css/style.css       # Shared styles
├── js/app.js           # Conversion engine + UI logic
├── js/tour.js          # Guided tours (driver.js)
├── test/stats.json     # Conversion accuracy stats (feeds status.html)
├── img/                # Branding + keyboard images
└── .github/            # Issue template for bug reports
```

## Testing

Conversion accuracy is tracked per font via automated round-trip testing
(2,077 cases per font) and rendered live at `status.html`. Current
pass rates, known per-font limitations, and a full history of conversion
bug fixes with root-cause writeups live in **[TESTING.md](TESTING.md)**.

## Reporting bugs

Use the ದೋಷ ವರದಿ button in the app (prefills the GitHub issue with the current
text, output, font, and direction) or the footer link on any page. The issue
form collects the original text, the authoring font, the conversion direction,
and expected vs actual output.

## Adding an embedded legacy font (future)

The live editor's font menu is driven by the `LIVE_EDITOR_FONTS` registry in `js/app.js`. To render the ASCII pane in an actual legacy font: add an `@font-face` rule in `css/style.css`, then add one entry to the registry and a matching `<option>` in the toolbar selects.

## Domains

- **converter.sanchaya.net** - primary (GitHub Pages custom domain)
- **parivartaka.sanchaya.net** - alias (DNS-level; GitHub Pages reads only the first CNAME line)

## Supported Formats

- **Input**: Nudi ASCII, Baraha ASCII, ShreeLipi ASCII (KAN-850 and 850), Prakashak ASCII, Akruti ASCII (Mono and Bi),
  Surabhi ASCII (KND-series and KN), ISM ASCII (KNTT-Nandi and KNB TT-Nandi), Dharma ILs ASCII, Janna Mono ASCII,
  Shree Deccan ASCII, Suchi Kan ASCII, WinKey KanEng ASCII, Unicode Kannada
- **Output**: Unicode Kannada or ASCII (per selected font)
- **Files**: TXT, DOCX (read; images skipped), TXT (write)

All 14 source encodings identified from the reviewed KGP macros are now ported (see `tools/MACRO-REVIEW.md`).

## Dependencies (CDN)

- [jQuery IME](https://github.com/wikimedia/jquery.ime) - Kannada input methods (KGP, InScript, Transliteration)
- [driver.js](https://github.com/kamranahmedse/driver.js) - guided tours (MIT)
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) - DOCX text extraction
- Bootstrap 5.3, Font Awesome 6.4, Google Fonts (Anek Kannada, IBM Plex Sans)

## License

GPL-3.0 (or any later version) - see [LICENSE](LICENSE). Prior versions of
this project were released under the MIT license; from this version onward,
new work is licensed under the GNU GPLv3.

Proudly built at [sanchaya.org](https://sanchaya.org) with love for Kannada.
If you download or fork this project, please keep that attribution (the
footer credit in `index.html`, and the header comments in `js/app.js` /
`server.js`) intact.
