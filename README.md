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

Conversion accuracy is tracked per font via round-trip testing (Unicode ->
ASCII -> Unicode) against every consonant x vowel-sign syllable, halant form,
anusvara/visarga form, and two-consonant conjunct. Results feed `test/stats.json`,
which `status.html` renders live.

Current status:

| Font | Round-trip pass rate | Notes |
|------|---------------------|-------|
| Nudi / Baraha | 2077 / 2077 | Full pass. The vowel byte codes for ಎ/ಏ/ಐ/ಒ/ಓ/ಔ were corrected (J/K/L/M/N/O) after cross-checking against the KGP macro's own Nudi->Unicode table - the previous map used digit `2` for ಎ, which doesn't appear anywhere in the authoritative encoding and was ambiguous with real numerals |
| ShreeLipi | 1911 / 2077 | Pivot-ported (KAN-850). Remaining gaps are mostly u2a for conjunct/vattakshara forms |
| Prakashak | 1277 / 2077 | Pivot-ported (Praja). Conjunct/vattakshara forms still fail on the u2a side |
| Akruti | 1913 / 2077 | Pivot-ported (Mono) |
| Surabhi (KND) | 1842 / 2077 | Pivot-ported - not previously supported at all |
| ISM (KNTT-Nandi) | 1768 / 2077 | Pivot-ported - new font family |
| Dharma ILs | 1612 / 2077 | Pivot-ported - new font family |
| Janna Mono | 1772 / 2077 | Pivot-ported - new font family |
| SriLipi 850 | 1911 / 2077 | Pivot-ported - second ShreeLipi variant |
| Shree Deccan | 1983 / 2077 | Pivot-ported - newspaper variant, strongest of the ported fonts |
| Surabhi KN | 963 / 2077 | Pivot-ported - second Surabhi variant |
| Suchi Kan | 530 / 2077 | Pivot-ported via Nudi Bi (extra hop through the macros' own Nudi Mono<->Bi tables) |
| ISM (KNB TT-Nandi) | 459 / 2077 | Pivot-ported via Nudi Bi - bilingual variant, sparsest source table (100/117 bytes mapped) |
| Akruti Bi | 246 / 2077 | Pivot-ported via Nudi Bi - weakest of all ported fonts |
| WinKey KanEng | 321 / 2077 | Pivot-ported via Nudi Bi |

ShreeLipi, Prakashak, Akruti, Surabhi, and the 10 fonts below them are
pivot-based: each source byte substitutes into a Nudi ASCII fragment (Mono
directly, or Bi first for the last four), then the existing, well-tested
Nudi engine does the Nudi <-> Unicode conversion. A small number of source
byte codes involved true cursor-based reordering in the original encoding
logic rather than a per-byte substitution and are left as pass-through for
now. Most remaining failures are u2a (Unicode -> ASCII) round-trips for
conjunct/vattakshara forms specifically, since the Nudi engine's own ASCII
output for complex syllables doesn't always match the literal per-byte
fragment shapes assumed by the pivot tables. The four Nudi-Bi-targeting
fonts (Suchi Kan, ISM KNB TT-Nandi, Akruti Bi, WinKey KanEng) score
noticeably lower: they route through an extra hop (the macros' own Nudi
Mono<->Bi pivot tables, reused as-is rather than mathematically inverted)
and their own source tables have more unresolved/unmapped byte codes to
begin with.

### Known limitations by font (what to expect)

- **Most reliable**: Nudi/Baraha (100%), Shree Deccan (95%), ShreeLipi and
  SriLipi 850 (92% each), Akruti (92%), Surabhi KND (89%). Failures on
  these are almost entirely two-consonant conjuncts (ಕ್ಷ-style clusters)
  and are being worked down font by font - see `status.html` for the
  live, current pass rate and a category breakdown per font.
- **Usable with more conjunct gaps**: Janna Mono and ISM KNTT-Nandi (85%
  each), Dharma ILs (78%). Same conjunct-heavy failure pattern, just more
  of it.
- **Partial support**: Prakashak (61%) and Surabhi KN (46%) - both had
  major fixes this session and more are planned; conjuncts and, for
  Surabhi KN, some base syllables still fail.
- **Early/experimental**: Suchi Kan, ISM KNB TT-Nandi, Akruti Bi, WinKey
  KanEng (10-26%). These route through an extra Nudi Mono<->Bi hop and
  have sparser source tables; even some standalone vowels don't convert
  correctly yet. Treat conversions in these four fonts as a starting
  point to hand-check, not a finished result, until this is addressed.

If a specific word or phrase converts incorrectly, the most useful thing
you can do is report it (ದೋಷ ವರದಿ button in the app, or the link below) -
real examples are what let us verify fixes like the ones described in this
section actually generalize, rather than just passing the synthetic test
suite.

Other recent conversion fixes: MICRO SIGN vs GREEK MU normalization for ಷ (windows-1252
files now convert), vattakshara conjunct reordering (PÀå -> ಕ್ಯ, QÌ -> ಕ್ಕಿ,
while final halants like ನನ್ stay intact), standalone number preservation, and
anusvara/visarga codes (dA, kB, ...) no longer mistaken for English tokens.

**English-retention false positive (fixed)**: a Nudi ASCII fragment like
`Dj` (= ಆ + ರ, the start of common words like ಆರಿಸಬಹುದು) could be wrongly
classified as a standalone English word and left unconverted on the way
back to Unicode - `ಆರಿಸಬಹುದು` round-tripped to `Djಸಬಹುದು`. The English-token
detector only recognized a token as "touching" Nudi encoding if the
adjacent byte was in the U+00C0-00FF range; Nudi ASCII output actually
uses the whole U+00A1-00FF block (¸, ¥, §, ©, ...), so adjacency to those
went undetected. Widened the check to any non-ASCII character. This runs
unconditionally on the u2a side of every pivot font (not just when
"retain English" is checked), so several pivot fonts' permutation counts
improved too: ShreeLipi 1910->1911, Surabhi 1840->1842, Dharma 1611->1612,
Janna 1731->1772, Shree Deccan 1982->1983, Surabhi KN 814->849.

**Vattu + lengthened-vowel bug (fixed)**: a vattakshara (subjoined-consonant)
cluster whose base carried a short i/e/o/u vowel sign, followed by a byte
that lengthens that vowel (e.g. ಕ+ಿ+ರ-vattu+lengthen), decoded to
`ಶ್ರಿÃ`/`ಕ್ರುÆ` instead of `ಶ್ರೀ`/`ಕ್ರೂ` - the lengthen byte was left
dangling as literal Latin text. `_fix_conjuncts` correctly moves the vowel
sign to the end of the reordered cluster (base + ್ + subjoined + vowel),
which puts it back next to the lengthen byte, but the merge step
(`_a2u_deerga_handle`) only handled `ೆ`/`ೊ` + `Ã` -> `ೇ`/`ೋ`, missing
`ಿ` + `Ã` -> `ೀ` and `ು` + `Æ` -> `ೂ` entirely. Fixed by extending that
function to cover all four. Not caught by the round-trip permutation suite
(it only decodes ASCII generated by our own encoder, which happens to
never emit this particular byte pattern for these forms) - added 7
dedicated raw-ASCII-decode regression cases (`raw-a2u` in the test output)
to guard it going forward.

**Dropped-comment resolver bug (fixed)**: `tools/resolve-complex.py` (local
build tool, not committed) turns "complex" macro rules - ones with extra
state-flag bookkeeping around the real `Chr()` output - into plain pivot
entries. It fed each line's raw text, including trailing VBA comments
(`'or 115`, `'doubt`, ...), straight into the `Chr()` parser, so any rule
whose comment didn't happen to look like a bare integer failed to parse and
was left unresolved even though the actual code was trivially resolvable.
Stripping comments before parsing recovered 83 previously-unresolved rules
across several fonts, concentrated in Akruti Mono (+11 byte codes) and ISM
KNTT-Nandi (+7). Regenerating and re-swapping the pivot tables raised Akruti
1549->1879 and ISM (KNTT-Nandi) 1524->1768 with no change to any other font.

A handful of the newly-recovered rules carried an `'or N'` comment - the
macro author flagging genuine uncertainty between two `Chr()` values for
that byte. Applying those blindly regressed Surabhi KN (849->728): several
of its bytes resolved to a fragment with no defined meaning anywhere in the
Nudi ASCII tables (e.g. `zü`, `qü`), while the *commented* alternative
matched an established pattern (`zs`, `qs`, matching the "consonant+s"
digraph Nudi uses for ಧ/ಢ/ಫ/ಭ's base forms). Cross-checking each ambiguous
byte's coded value and commented alternative against the real
`A2U_MAP`/`VATTAKSHARA_MAP`/`OTHER_MAP` (exact key or valid prefix of one)
resolved the ambiguity per byte rather than guessing: 4 of Surabhi KN's 9
ambiguous bytes needed the commented alternative (180, 195, 210, 239 - the
rest were already correct as coded, including byte 215 which has no clear
winner either way and was left alone). This override lives in
`generate-pivot-maps.py`'s `OVERRIDES` table. Net result: Surabhi KN
849->963, with no regressions elsewhere.

**Missing implicit-vowel marker (fixed)**: Prakashak (and, to a lesser
extent, Dharma ILs and Janna Mono) emitted only the *bare* base-consonant
letter for ~10 consonants (ಕ,ಗ,ಘ,ಚ,ಛ,ಠ,ಡ,ತ,ದ,ರ) instead of the letter plus
the explicit inherent-vowel marker "À" that Nudi's own decoder requires -
`ÔÀ` (meant to be ಗ) instead decoded as `U್ಹ`. The other 6 direct-to-Mono
fonts (Akruti, ShreeLipi, Surabhi, ISM KNTT, SriLipi 850, Shree Deccan,
Surabhi KN) already have a dedicated byte that types "À" on its own, so
they weren't affected. Root cause: the source macros likely inserted "À"
via a separate, context-aware finalization step our per-byte pivot model
can't capture. Fixed with a normalization pass in the shared pivot engine
(`pivotAsciiToUnicode`/`pivotUnicodeToAscii` in `js/app.js`) that inserts
or drops "À" around these letters based on what legitimately follows them
in Nudi's own encoding (derived from `consonantMaps`, not hand-guessed -
an earlier hand-written whitelist missed the "consonant+s" digraph used
for ಢ/ಧ and had to be corrected). Gated to only the 3 fonts that actually
lack a dedicated À byte, so the other 6 are provably unaffected. Net:
Prakashak 912->1277 (44%->61%), Dharma and Janna unchanged (the few
consonants they were missing this for turned out to already be covered by
other rules), 0 regressions across all 15 fonts.

**Visarga byte mis-resolved as "reorder" (fixed)**: `tools/resolve-complex.py`
bailed out of resolving a rule the moment ANY line in its raw VBA matched a
cursor-movement statement (`Selection.MoveRight`, `.Delete`, etc.), even if
that statement came *after* the rule's own `Selection.Text = Chr(...)`
assignment. Byte 255 - almost always visarga - is typically the last case
in each macro's `Select Case` block, and extraction had captured the
shared loop-advance epilogue that runs after the whole block, not anything
specific to that byte. Changed the resolver to only treat a movement
statement as real reordering if it occurs at or before the last text
assignment; anything after is cleanup and gets ignored. This fixed 26
buried "visarga" (and a couple of related hop-table) rules across almost
every pivot font at once - Akruti Mono 1879->1913 (visarga 34/34 fails
down to 1/34) and Akruti Bi 214->246, both with 0 regressions. A related
edge case (a handful of "dead key" rules like `Selection.Text = ""` then
`GoTo` to re-read the next keystroke - not real output, just state setup)
had to be explicitly excluded, since an empty-string pivot entry would
silently swallow whatever the user typed next instead of doing nothing.

Anusvara turned out to be a different, deeper problem: for Akruti Mono
specifically, there is no `Chr()` rule anywhere in the source macro that
produces Nudi's anusvara marker ("A") - not even one resolvable via either
fix above. That's a genuine gap in the source data, not a resolver bug,
so it's left as a follow-up item (see `.autopilot/state.md` for the
current investigation state) rather than papered over with a guess.

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
