# Testing & Conversion Accuracy

Conversion accuracy is tracked per font via round-trip testing (Unicode ->
ASCII -> Unicode) against every consonant x vowel-sign syllable, halant form,
anusvara/visarga form, and two-consonant conjunct. Results feed `test/stats.json`,
which `status.html` renders live.

Current status:

| Font | Round-trip pass rate | Notes |
|------|---------------------|-------|
| Nudi / Baraha | 2077 / 2077 | Full pass. The vowel byte codes for ಎ/ಏ/ಐ/ಒ/ಓ/ಔ were corrected (J/K/L/M/N/O) after cross-checking against the KGP macro's own Nudi->Unicode table - the previous map used digit `2` for ಎ, which doesn't appear anywhere in the authoritative encoding and was ambiguous with real numerals |
| ShreeLipi | 1929 / 2077 | Pivot-ported (KAN-850). Remaining gaps are mostly u2a for conjunct/vattakshara forms |
| Prakashak | 1802 / 2077 | Pivot-ported (Praja). Conjunct/vattakshara forms still fail on the u2a side |
| Akruti | 1913 / 2077 | Pivot-ported (Mono) |
| Surabhi (KND) | 1851 / 2077 | Pivot-ported - not previously supported at all |
| ISM (KNTT-Nandi) | 1785 / 2077 | Pivot-ported - new font family |
| Dharma ILs | 1642 / 2077 | Pivot-ported - new font family |
| Janna Mono | 1823 / 2077 | Pivot-ported - new font family |
| SriLipi 850 | 1929 / 2077 | Pivot-ported - second ShreeLipi variant |
| Shree Deccan | 2077 / 2077 | Pivot-ported - newspaper variant, full pass, matching Nudi itself |
| Surabhi KN | 1534 / 2077 | Pivot-ported - second Surabhi variant |
| Suchi Kan | 1463 / 2077 | Pivot-ported via Nudi Bi (extra hop through the macros' own Nudi Mono<->Bi tables) |
| ISM (KNB TT-Nandi) | 1093 / 2077 | Pivot-ported via Nudi Bi - bilingual variant, sparsest source table (100/117 bytes mapped) |
| Akruti Bi | 1771 / 2077 | Pivot-ported via Nudi Bi |
| WinKey KanEng | 1129 / 2077 | Pivot-ported via Nudi Bi |

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

- **Most reliable**: Nudi/Baraha and Shree Deccan (both 100%), ShreeLipi
  and SriLipi 850 (93% each), Akruti (92%), Surabhi KND (89%). Failures on
  these are almost entirely two-consonant conjuncts (ಕ್ಷ-style clusters)
  and are being worked down font by font - see `status.html` for the
  live, current pass rate and a category breakdown per font.
- **Usable with more conjunct gaps**: Janna Mono (88%), ISM KNTT-Nandi (86%),
  Prakashak (87%), Dharma ILs (79%). Same conjunct-heavy failure pattern,
  just more of it.
- **Partial support**: Surabhi KN (74%) - conjuncts and some base syllables
  (mostly aspirated consonants and a few ambiguous byte codes) still fail.
- **Improving, most now usable**: Akruti Bi (85%), WinKey KanEng (54%),
  Suchi Kan (70%), ISM KNB TT-Nandi (53%). These route through an extra
  Nudi Mono<->Bi hop and have sparser source tables. Several rounds of
  resolver fixes this session (see fix history) took them from
  10-26% at the start of the day to their current pass rates - Akruti Bi
  in particular is now solidly in the "usable" tier. The remaining gaps
  are, as far as this session traced them, genuine multi-keystroke
  combining forms in these fonts' own keyboard designs (see fix history) -
  not further bugs, but still worth hand-checking real conversions in
  these four fonts rather than trusting them blindly.

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

**Missing 'ç' (double-vattakshara ra) byte broke ASCII->Unicode for
ಶಾಸ್ತ್ರ-style triple conjuncts (fixed)**: reported via a direct repro -
"¥ÁætÂ±Á¸ÀÛç" should convert to "ಪ್ರಾಣಿಶಾಸ್ತ್ರ" but the trailing "ç" byte
came through untranslated instead of becoming the final ್ರ. Root cause:
Nudi ASCII uses two different bytes for a subjoined ra-vattakshara
depending on what it stacks under - 'æ' when it subjoins directly under a
base consonant (already mapped, e.g. ¥Áæ -> ಪ್ರಾ), and 'ç' when it stacks
under a consonant that's *already* subjoined by another vattakshara,
forming a triple conjunct (base + vattu + vattu) like ಸ್ತ್ರ. 'ç' had no
entry at all in `VATTAKSHARA_MAP`, so it fell through every mapping stage
untouched and was emitted raw. Fixed by adding `'ç': 'ರ್'` to
`VATTAKSHARA_MAP` (same target as 'æ' - both mean "subjoin ra here";
`_fix_conjuncts`'s chained-marker loop already handles reordering multiple
stacked vattakshara markers into the correct triple conjunct) and adding
'ç' to the `ASCII_VATTAKSHARA` character-class string for consistency.
Verified against ಶಾಸ್ತ್ರ (the reported case) plus ಪಾತ್ರ, ಮಂತ್ರ, ಸೂತ್ರ (other
common ತ್ರ-conjunct words). Zero regressions (`node test/permutations.js`
unchanged - nudi and shreedeccan both still 2077/2077).

**Casing-implausibility check (the "MAn" fix) wrongly Nudi-decoded real
compound-capitalized English words (fixed)**: reported via a very concrete
repro - pasting this app's own live-editor help text, which mentions the
"InScript" keyboard by name, produced "IಟಿSಛಿಡಿiಠಿಣ" instead of leaving
"InScript" alone, even with retain-English on. Root cause: the
`_hasPlausibleEnglishCasing` check added for the earlier "MAn" fix (which
correctly rejects short non-standard-case tokens like "MAn" as Nudi
encoding, not English) had no length bound, so it also rejected every
ordinary compound-capitalized brand/product word - confirmed broken:
InScript, JavaScript, PowerPoint, YouTube, GitHub, PayPal, iPhone,
MacBook. None of these are plausible as raw Nudi ASCII in the first place -
a genuine multi-letter Nudi sequence beyond a couple of standalone-mapped
units almost always needs extended-Latin marks for proper consonant+matra
conjuncts (already filtered out earlier in `_isEnglishToken` via
`LATIN_EXT_RE`), so there was no reason for the casing check to apply
beyond short tokens in the first place. Fixed by scoping
`_hasPlausibleEnglishCasing`'s rejection to `token.length <= 4` - the same
bound the all-uppercase/`NUDI_A2U_STANDALONE` check just above it already
uses - leaving every longer token to fall through as English by default,
as it always did before the original "MAn" fix. Re-verified "MAn" and
"KNB" both still resolve correctly after the length bound was added. Zero
regressions (`node test/permutations.js` unchanged).

**Input-type detect badge misfired "ASCII" on Kannada Unicode + English
mixed text (fixed)**: reported as "there is an automatic indicator on top of
the left text area which says the type of text pasted - that indication
seems wrong." Root cause in the `#detect-badge`/`#detect-text` indicator's
input listener: it used `hasUnicode && !hasASCII` / `else if (hasASCII)`
(plain "does it contain any of these characters" booleans), where `hasASCII`
matches ANY single character in `[À-ÿøñð]`. That range also covers ordinary
accented letters common in English loanwords and proper nouns (café, résumé,
jalapeño, Zürich, ...), so a document that's overwhelmingly real Kannada
Unicode with a bit of English mixed in got mislabeled "ASCII ನುಡಿ/ಬರಹ" the
moment it contained even one such word - confirmed with a 40-Kannada-char /
2-accented-char test string. This was also inconsistent with the *actual*
auto-direction logic used at convert time (`convertText()`), which already
compares character counts (`unicodeCount > asciiKnCount`) rather than doing a
boolean "contains any" check - so the badge could show "ASCII" right above a
textarea that Convert would correctly treat as Unicode. Fixed by making the
badge use the identical count-comparison, so it now accurately previews what
"auto" direction will do. Zero regressions (pure UI-label logic, not touched
by `test/permutations.js`).

**Literal "u2a"/"a2u" direction shorthand got Nudi-decoded despite
retain-English (fixed)**: reported as "(u2a)" becoming "(u೨ಚಿ)" and "(a2u)"
becoming "(ಚಿ೨u)" even with retain-English on. This app's own direction-code
shorthand is a single-letter + digit + single-letter run, and single-character
letter tokens are never eligible for English retention by design (see the
`token.length === 1` branch in `_isEnglishToken` - a lone ASCII letter is
almost always a genuine Nudi consonant/vowel byte). So the character-scanning
loop split "u2a" into 'u' and 'a' (each decoded as a literal Nudi byte) plus a
lone "2" (kept convertible since digits next to letters are treated as part
of the encoding). Fixed with a small dedicated check
(`_matchDirectionCodeAt`), wired into both the base Nudi retainEnglish loop
and `_extractEnglishTokens` (so every pivot font gets it too), that recognizes
"a2u"/"u2a" as a literal unit at the start of a scan position and retains it
outright - it deliberately only matches when not preceded by another letter,
so it can't misfire on a real word that happens to contain the substring
(e.g. "seea2u", "au2a" are left alone). Zero regressions
(`node test/permutations.js` unchanged).

**Retain-English heuristic got both directions wrong on short mixed/upper-case
tokens (fixed)**: reported as "MAn" not decoding to ಒಂಟಿ, and "KNB" (typically
seen inside parenthetical English glosses, e.g. `ಕನ್ನಡ (KNB)`) decoding to
ಏಓಃ instead of staying English even with retain-English on. Two distinct bugs
in `_isEnglishToken`, both in shared code so the fixes apply to every font,
not just Nudi:
1. *All-uppercase short acronyms were too eagerly assumed to be Nudi
   encoding.* The existing "all-uppercase token where every letter has a
   standalone Nudi a2u mapping" override treated any such token as Nudi
   ASCII unless it was in the hardcoded `EN_UPPER_NUDI_CONFLICT` list - but
   19 of 26 letters have a standalone mapping, so most random 2-4 letter
   acronyms (KNB, RBI, GST, ...) matched by pure chance. Fixed by requiring
   the decoded fragment to actually contain a Kannada consonant
   (`_hasKannadaConsonant`) before accepting the override - genuine Nudi
   syllables built from standalone letters produce a consonant somewhere;
   acronyms like KNB decode to a vowel/anusvara/visarga-only string
   (ಏ+ಓ+ಃ) with no consonant at all.
2. *Mixed-case tokens with non-standard capitalization defaulted to
   "English."* The function's final fallback assumed anything not caught by
   an earlier rule was English, but that's wrong for tokens like "MAn"
   (upper-upper-lower) - a pattern real English prose never produces (only
   all-lowercase, Title Case, or ALL-CAPS occur naturally), but which is
   exactly how Nudi's case-sensitive per-letter scheme spells real words
   (M=ಒ, A=ಂ, n=ಟಿ -> ಒಂಟಿ, "alone"). Fixed by adding
   `_hasPlausibleEnglishCasing`, a purely structural check (no decoding) that
   rejects tokens whose segments don't match `[a-z]+`, `[A-Z][a-z]*`, or
   `[A-Z]+`. Deliberately *not* decode-check-based like fix #1 above - an
   earlier version of this fix used a decode check here too, but that wrongly
   forced genuine English words to decode whenever they happened to produce a
   consonant somewhere by coincidence (e.g. "Kannada" itself decodes to a
   consonant-containing string via the Nudi map, but is perfectly normal
   Title Case and should stay English). The casing-only check has no such
   false-positive risk since it never inspects the decode result.
Zero regressions: `node test/permutations.js` produces byte-identical
pass/fail counts before and after (this only touches the retain-English
placeholder-extraction path, not core conversion).

**Nudi Mono<->Bi hop tables silently corrupted bytes in the 0x80-0x9F range
(fixed)**: the four Bi-hop fonts (Suchi Kan, ISM KNB TT-Nandi, Akruti Bi,
WinKey KanEng) all pass through two shared tables, `NUDIBI2MONO` and
`NUDIMONO2BI`, generated the same way as every other font's pivot table:
parsing each rule's `Selection.Text = Chr(N)` and turning `N` into a JS
string character. For `N > 127` the generator ran that character through a
cp1252 decode (on the theory that VBA's `Chr()` reflects what the macro
author saw under the Windows ANSI codepage) - but the entire rest of the
pivot engine assumes the opposite convention: that a fragment character's
own `charCode` *is* its byte value (looked up everywhere via
`text.charCodeAt(i)`). cp1252 only agrees with that "identity" convention
for bytes 0xA0-0xFF; for 0x80-0x9F it diverges (byte 0x91 decodes to U+2018
"'", not U+0091), and for 5 specific bytes in that range (0x81, 0x8D, 0x8F,
0x90, 0x9D) cp1252 has no character defined at all - all five decoded to
the same placeholder, U+FFFD, making otherwise-distinct source bytes
indistinguishable. Confirmed as the root cause of Suchi Kan's ಒ/ಓ/ಔ all
colliding (their corresponding Mono bytes all mapped to U+FFFD in
`NUDIMONO2BI`, so the inverse lookup for all three landed on the same,
mostly-arbitrary Suchi Kan byte or none at all). Fixed by dropping the
cp1252 step entirely - `Chr(N)` is now always just `chr(N)`, matching the
byte-identity convention used everywhere else. Zero regressions (Nudi and
all 9 direct-to-Mono fonts unchanged - this only touches the Bi-hop
tables): Suchi Kan 530->1297, ISM KNB TT-Nandi 459->992, Akruti Bi
246->848, WinKey KanEng 321->699.

**Missing implicit-vowel marker, ported to the Bi-hop path (fixed)**: the
same class of bug fixed earlier for Prakashak/Dharma/Janna (a bare
base-consonant byte needing an explicit "À" inherent-vowel marker appended,
see below) also affects the Bi-hop fonts, but the original fix
(`_normalizeBareNudiConsonants`/the drop-side of `pivotUnicodeToAscii`) was
only wired into the two direct-to-Mono pivot functions. Ported it to
`pivotAsciiToUnicodeViaBi`/`pivotUnicodeToAsciiViaBi` by composing each
font's byte through its own Bi fragment and then through `NUDIBI2MONO`
(`_composedX2Mono`, cached) to get an equivalent "byte -> Mono fragment"
map, so the existing `_hasBareAByte` check can be reused unchanged instead
of duplicating the logic. Fixed Akruti Bi specifically (848->848 already
counted above includes this - net from both fixes together); the other
three already had a dedicated byte for the marker so this step was a
no-op for them (correctly gated off).

**Correction to the paragraph above in an earlier draft of this section**:
this initially looked like a bigger, more foundational problem than it is.
Investigating a remaining Suchi Kan failure (ಠ failing to convert), the
first hypothesis was that the macros' own "Nudi Mono" byte numbering
doesn't match this app's Nudi Mono convention at all - `NUDIBI2MONO`'s
entry for Bi byte 194 resolves to Mono byte 172 (`¬`), which this app's
Nudi engine doesn't recognize as anything on its own. That looked like a
systemic scheme mismatch. Cross-checking against `Nudi_Conversions.vba`
directly (the authoritative macro this app's own Nudi tables were already
verified against) disproved it: byte 172 IS a legitimate Nudi Mono
fragment - just for part of ಯ's construction, not ಠ - so `NUDIBI2MONO` is
internally correct there, not using some parallel numbering scheme.

Re-auditing all 34 base consonants against all four fonts' actual composed
byte->Mono values (correctly accounting for fonts that already carry a
separate bare-"À" byte, i.e. checking for the bare consonant letter as well
as the letter+À form) shows real coverage is much better than the first,
flawed audit suggested: 18-25 of 34 consonants already resolve correctly
per font. The genuine remaining gaps cluster in familiar, already-documented
categories - ಝ/ಮ/ಯ's halant-compound "i" companion, ಢ/ಧ's "consonant+s"
digraph, ಫ/ಭ's aspirate "ü"-style continuation - plus a handful of
single consonants (ಠ/ಗ/ಡ/ದ/ರ/ಷ/ಸ/ಪ/ಥ, varying by font) where no byte in
that font's own source table composes to the needed Mono value at all.
Suchi Kan's ಠ specifically: byte 111 in `SUCHI_X2NUDIBI` maps to Bi
fragment "o" (an identity/passthrough entry, not a resolved rule), and
`NUDIBI2MONO` has no entry for Bi byte 111 either - so it round-trips
unchanged rather than reaching Mono's real byte for ಠ. Whether that's a
genuine missing rule in Suchi Kan's own macro or a gap in the shared hop
table needs the original VBA checked case by case, which is slow, manual
work best done encoding-by-encoding rather than assumed to be one big
systemic bug. Flagging this as the accurate next step for these four
fonts, replacing the earlier (incorrect) "one big rearchitecture" framing.

**`resolve-complex.py` couldn't see through If/Else default branches
(fixed)**: doing that case-by-case check turned up a resolver gap, not a
missing macro rule. Suchi Kan's byte 190 (needed for ಡ) has this shape:
`If Chukke = 1 Then <delete the previous 2 chars, write a combined
Chr(174) & Chr(176)> Else Selection.Text = Chr(174) End If`. `Chukke` is
only ever set to 1 by a *different* byte's rule (a preceding keystroke
"arming" a combine, the same mechanism behind vattu/subjoined-consonant
forms) - so on a normal, standalone keystroke the Else branch is exactly
what happens, and it's a plain, resolvable `Chr(174)`. The resolver had no
way to see this: a flat scan of the whole rule body either bails on the
bare `If ... Then` line, or - worse - finds the Else branch's assignment
as the rule's *last* assignment overall and wrongly reads the If branch's
`MoveLeft`/`MoveRight` (which precede it in the raw text) as disqualifying
"real reordering", even though that reordering only happens when the flag
is set. Added `try_else_default()`: recognizes a single flat (non-nested,
no ElseIf, exactly one Else) `If/Else/End If` spanning the whole rule body
(tolerating a trailing flag-reset line like `Chukke = 0` after `End If`),
and resolves the Else branch on its own using the same rules as every
other simple rule - deliberately narrow, bailing rather than guessing on
anything nested or with more than one Else. This pattern turned out to be
common across several macros, not just the Bi-hop ones: 143 newly resolved
rules total (up from 120 with the comment-stripping fix alone), with 0
regressions across all 15 fonts. Notable gains: Prakashak 1312->1802 (the
biggest single jump this session), Shree Deccan 1983->2077 (now a full
pass, matching Nudi itself), WinKey KanEng 699->834, ISM KNB TT-Nandi
992->1093, Suchi Kan 1297->1380, plus smaller gains on ShreeLipi, SriLipi
850, ISM KNTT-Nandi, Dharma ILs, and Janna Mono.

**ISM (KNB TT-Nandi) was missing identity coverage for its entire core
alphabet (fixed)**: continuing the per-byte check, ISM KNB TT-Nandi looked
far worse than the other three Bi-hop fonts - 9 of 13 standalone vowels
missing outright, not just a handful of consonants. Traced to the actual
macro sub (`KNBTTNandi2NudiBi`) wrapping its per-byte `Select Case` in an
outer `If/ElseIf`: bytes 32-128 and 131-140 short-circuit to a plain
identity mapping (`Selection.Text = Chr(Asc(Selection.Text))` - "this byte
already IS Nudi Bi's own byte, no translation needed") before falling
through to `Else Select Case ...` for the special high bytes that
actually need translating. `extract-macros.py` only looks for `Case N:`
labels inside a `Select Case` block, so it never saw this outer shortcut
at all - silently losing identity coverage for the entire core Nudi Mono
consonant/vowel range (roughly bytes 65-122), which is most of the
alphabet. Added an `IDENTITY_RANGES` table to `generate-pivot-maps.py`
that fills in `Chr(N) -> Chr(N)` for exactly this font's two ranges
(verified no overlap with the 117 explicitly-extracted byte codes first).
Note: this specific gap didn't move ISM KNB TT-Nandi's own round-trip
count on its own (the existing "no match -> pass character through
literally" fallback already produced the same result for most of these
bytes by coincidence) - but it's still a genuine correctness fix, since
the underlying pivot map is now complete and accurate rather than working
by accident, and it matters for any byte that would otherwise collide
with an unrelated real entry.

**`try_else_default` generalized to `If/ElseIf/ElseIf.../Else` chains
(fixed)**: the first version only handled a single `If/Else`, bailing on
anything with an `ElseIf`. Several macros use exactly that shape though -
e.g. Suchi Kan's byte 161 is `If ChukkeGeetu = 1 Then <combine> ElseIf
Chukke = 1 Then <different combine> Else Selection.Text = Chr(184) End
If`. Since every branch's flag is only set by some other byte's rule, the
same logic applies regardless of how many `ElseIf`s precede the final
`Else` - skip over all of them and resolve just the trailing default.
Rewrote the branch-detection to find the *last* `ElseIf`/`Else` marker in
the body and only extract a default when that last marker is a bare
`Else` (if the chain ends on an `ElseIf` with no final `Else`, there
genuinely is no unconditional default - confirmed on Suchi Kan's byte 139,
`If Qa = 1 Then ... ElseIf Qi = 1 Then ... End If` with no `Else` at all,
correctly still left unresolved). 158 total newly resolved (up from 143),
0 regressions. Biggest gains: **Akruti Bi 848->1771** (41%->85%, by far
the largest single-font jump of the whole session), WinKey KanEng
834->1129, Suchi Kan 1380->1463; Nudi, Shree Deccan, and ISM KNB TT-Nandi
were unaffected (no matching pattern in their remaining unresolved rules).

**What's left in the four Bi-hop fonts is mostly genuine multi-keystroke
combining, not further bugs.** Checking the still-failing base consonants
one by one (ಠ/ಗ/ಝ/ಢ/ಥ/ಧ/ಪ/ಫ/ಭ/ಷ/ಸ, varying by font) against the raw VBA:
Suchi Kan's ಠ needs byte 139, whose *only* logic is `If Qa = 1 Then
<combine> ElseIf Qi = 1 Then <different combine> End If` - no default
branch at all, meaning the byte has literally no meaning when typed
without a specific preceding "arming" keystroke. ISM KNB TT-Nandi's ಗ is
even more explicit: its Chr(150) output lives in a block gated behind
`If ga = 1 And Geetu = 1 Then` positioned *after* the main `Select Case`
closes entirely - a genuine two-keystroke combine (two separate prior
bytes each need to set their own flag) that isn't tied to a single `Case`
label at all. Both are the same class of limitation already documented
for conjuncts/vattakshara forms project-wide: real cursor-context-aware
state machines in the original macros that a per-byte substitution model
fundamentally can't represent. Not chasing further "fixes" for these -
they're honest gaps, not bugs.

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
