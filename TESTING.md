# Testing & Conversion Accuracy

Conversion accuracy is tracked per font via round-trip testing (Unicode ->
ASCII -> Unicode) against every consonant x vowel-sign syllable, halant form,
anusvara/visarga form, and two-consonant conjunct. Results feed `test/stats.json`,
which `status.html` renders live.

Current status:

| Font | Round-trip pass rate | Notes |
|------|---------------------|-------|
| Nudi / Baraha | 2077 / 2077 | Full pass. The vowel byte codes for ಎ/ಏ/ಐ/ಒ/ಓ/ಔ were corrected (J/K/L/M/N/O) after cross-checking against the KGP macro's own Nudi->Unicode table - the previous map used digit `2` for ಎ, which doesn't appear anywhere in the authoritative encoding and was ambiguous with real numerals |
| ShreeLipi | 1911 / 2077 | Pivot-ported (KAN-850). Remaining gaps are mostly u2a for conjunct/vattakshara forms |
| Prakashak | 1312 / 2077 | Pivot-ported (Praja). Conjunct/vattakshara forms still fail on the u2a side |
| Akruti | 1913 / 2077 | Pivot-ported (Mono) |
| Surabhi (KND) | 1851 / 2077 | Pivot-ported - not previously supported at all |
| ISM (KNTT-Nandi) | 1776 / 2077 | Pivot-ported - new font family |
| Dharma ILs | 1630 / 2077 | Pivot-ported - new font family |
| Janna Mono | 1805 / 2077 | Pivot-ported - new font family |
| SriLipi 850 | 1911 / 2077 | Pivot-ported - second ShreeLipi variant |
| Shree Deccan | 1983 / 2077 | Pivot-ported - newspaper variant, strongest of the ported fonts |
| Surabhi KN | 1534 / 2077 | Pivot-ported - second Surabhi variant |
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

## Known limitations by font (what to expect)

- **Most reliable**: Nudi/Baraha (100%), Shree Deccan (95%), ShreeLipi and
  SriLipi 850 (92% each), Akruti (92%), Surabhi KND (89%). Failures on
  these are almost entirely two-consonant conjuncts (ಕ್ಷ-style clusters)
  and are being worked down font by font - see `status.html` for the
  live, current pass rate and a category breakdown per font.
- **Usable with more conjunct gaps**: Janna Mono (87%), ISM KNTT-Nandi (85%),
  Dharma ILs (78%). Same conjunct-heavy failure pattern, just more of it.
- **Partial support**: Prakashak (63%) and Surabhi KN (74%) - both had
  major fixes this session and more are planned; conjuncts and, for
  Surabhi KN, some base syllables (mostly aspirated consonants and a few
  ambiguous byte codes) still fail.
- **Early/experimental**: Suchi Kan, ISM KNB TT-Nandi, Akruti Bi, WinKey
  KanEng (10-26%). These route through an extra Nudi Mono<->Bi hop and
  have sparser source tables; even some standalone vowels don't convert
  correctly yet. Treat conversions in these four fonts as a starting
  point to hand-check, not a finished result, until this is addressed.

If a specific word or phrase converts incorrectly, the most useful thing
you can do is report it (ದೋಷ ವರದಿ button in the app, or the link in the
main README) - real examples are what let us verify fixes like the ones
described below actually generalize, rather than just passing the
synthetic test suite.

Other recent conversion fixes: MICRO SIGN vs GREEK MU normalization for ಷ (windows-1252
files now convert), vattakshara conjunct reordering (PÀå -> ಕ್ಯ, QÌ -> ಕ್ಕಿ,
while final halants like ನನ್ stay intact), standalone number preservation, and
anusvara/visarga codes (dA, kB, ...) no longer mistaken for English tokens.

## Fix history

**English-token detection was Nudi-specific, wrongly swallowing pivot fonts'
own encoded text (fixed)**: on the ASCII -> Unicode side of every pivot font,
"retain English" runs an English-word detector on the raw source-font ASCII
*before* pivoting it to Nudi. That detector (`_isEnglishToken`) was written
entirely around Nudi's own byte conventions - it recognizes Nudi-encoded text
by checking for extended Latin-1 characters (¸, ¥, §, ...) that real English
words never contain. Several pivot fonts don't follow that convention:
Surabhi KN, and the four Nudi-Bi-hop fonts (Suchi Kan, ISM KNB TT-Nandi,
Akruti Bi, WinKey KanEng), encode many consonants as plain lowercase a-z
letters. A run like `ky` (Surabhi KN's ಕ) has no extended-Latin character
anywhere nearby, so the Nudi-tuned heuristic fell through to its default
"this is English" verdict and left it un-pivoted - `asciiToUnicode('ky',
false, 'surabhikn')` correctly gave ಕ, but the full retain-English path
(`convert('ky', 'keep', 'a2u', true, 'surabhikn')`, the default used by both
the UI and the test harness) returned `ky` untouched. Fixed by giving the
English-token extractor an optional, font-aware "does this token actually
decode to real Kannada via this font's own pivot chain" check
(`_looksLikeEncodedKannada` / `_looksLikeEncodedKannadaBi` in `js/app.js`) -
when the Nudi-tuned heuristic says "English" but the token demonstrably
decodes to valid Kannada through the current font's own map, the decode
check wins. Wired up only on the two decode-direction pivot functions
(`pivotAsciiToUnicode`, `pivotAsciiToUnicodeViaBi`) where the ambiguity
exists; the encode-direction functions already start from clean Unicode and
were left untouched. Net result, 0 regressions anywhere (Nudi itself stayed
at 2077/2077): Surabhi KN 963->1534 (the big one - this heuristic was
responsible for the majority of its remaining failures), Prakashak
1277->1312, Janna Mono 1772->1805, Dharma ILs 1612->1630, ISM KNTT-Nandi
1768->1776, Surabhi KND 1842->1851. The four Nudi-Bi-hop fonts were
unaffected - their remaining failures are a different, deeper class of bug
(wrong/missing byte-level mappings, not English misclassification) and are
the next planned investigation.

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

**Conjunct failures are mostly genuine missing bytes, not fixable bugs**:
investigated why "conjunct" is the largest failure category for almost
every pivot font. For ShreeLipi specifically, all 102 conjunct failures
traced to exactly 3 broken standalone forms - ಝ್, ಮ್, ಯ್ (each failing
against all 34 possible second-consonant partners) - because Nudi's own
encoding needs a companion character these 3 consonants' halant/short-i
forms specifically (a bare "i" for ಝ/ಮ/ಯ's halant compound, an aspirate
marker "ü" for ಢಿ/ಧಿ/ಫಿ/ಭಿ), and ShreeLipi's source macro never had a key
that produces that companion character on its own. Confirmed this is a
genuine data gap, not a bug: ISM (KNTT-Nandi) and Shree Deccan both have a
dedicated byte for the same "i" character, so their ಝ್/ಮ್/ಯ್ forms work
fine - it's specific to which macros happened to include that key.
Without the original VBA source, this can't be synthesized.

What *was* fixable: when the u2a encoder hits one of these gaps, it used
to fall back to passing the untranslatable character through literally -
and since a "byte" is just a JS string character throughout this
codebase, that literal character sometimes happened to coincide with an
unrelated real byte in the same font, corrupting whatever text followed
it too (e.g. ಝ್ಕ decoded back as `ರhಜಿ್ಕ` - the extra `ಜಿ` bleeding in
from an unrelated byte, not just the ಝ part being wrong). Added a check
(`_isClaimedChar`) that drops an unencodable character instead of passing
it through when doing so would collide with a real byte. This doesn't
turn any of these cases into a pass - the data to encode them correctly
doesn't exist - but it keeps the failure contained to the syllable that's
actually missing data instead of corrupting adjacent, correct text. No
change to pass counts; 0 regressions.
