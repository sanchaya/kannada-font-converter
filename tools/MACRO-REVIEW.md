# KGP macro review and adoption plan

Source: six Word macro templates (.dot) authored by KGP (Kannada Ganaka
Parishat), 2003-2009, provided by Sanchaya. Extracted rule tables live in
`tools/macro-extracts/*.json` (regenerate with `tools/extract-macros.py`).

## Architecture of the macros

Every converter is a character-at-a-time `Select Case` state machine over the
source bytes, with a handful of state flags (`Chukke` = anusvara dot pending,
`Baottu` = vattakshara pending, `Pa`/`Ha`/`Qa`/`Di`/`Geetu` = glyph-context
flags) that handle reordering. All converters target **Nudi** (Mono or Bi)
as the pivot encoding, and a shared pair of tables converts
NudiMono <-> NudiBi and NudiBi -> Unicode.

**Adoption strategy: keep the pivot.** For each new font X, port the
X -> NudiMono table to JS and chain it through our existing (well-tested)
Nudi -> Unicode engine:

    X  --ported table-->  Nudi ASCII  --existing a2u-->  Unicode

This reuses the 2076/2077-passing Nudi engine and means each new font is
one table + a few state rules, not a full converter. The macros are one-way
(X -> Nudi), so new fonts start as a2u only; u2a can be added later by
inverting the tables where unambiguous.

## Converter inventory (rules: simple/complex)

| Source encoding | Sub | Rules | Notes |
|---|---|---|---|
| SriLipi KAN-850 (SHREE-KAN fonts) | SriLipiKAN850ToNudiMono | 207/4 | Improves our weak `shree` support |
| SriLipi 850 | SriLipi850ToNudiMono | 200/3 | Second ShreeLipi variant |
| Shree Deccan | ShreeDeccan2NudiMono | 205/6 | Newspaper variant |
| Suchi Kan | SuchiKanToNudiBi | 195/17 | Targets NudiBi directly |
| ISM (KNTT-Nandi) | KNTTNandi2NudiMono | 178/12 | **New font family** |
| ISM (KNB TT-Nandi) | KNBTTNandi2NudiBi | 100/16 | Bilingual variant |
| Surabhi KND-series | SurabhiKNDSeriesToNudiMono | 189/1 | **New**; almost no complex rules |
| Surabhi KN | SurubhiKNToNudiMono | 189/10 | **New** |
| WinKey KanEng | WinKeyKanEngToNudiBi | 187/31 | **New**; most complex rules |
| Dharma ILs | DharmaILsToNudiMono | 218/5 | **New** |
| Prakashak (Praja) | PrakashakPrajaToNudiMono | 209/12 | Should replace our weak `prakashak` maps |
| Janna Mono | JannaMonoToNudiMono | 218/6 | **New** |
| Akruti Mono / Bi | AkrutiMono2NudiMono, AkrutiBiToNudiBi | 175/14, 106/19 | Should replace our weak `akruti` maps |
| Nudi Mono <-> Bi | NudiMonoToNudiBi, NudiBI2NudiMono | 171/9, 156/1 | The pivot tables |
| Nudi Bi -> Unicode | NudiMonoToNudiBi_Uni + CheckWord | 996-entry array | Cross-check against our A2U_MAP |

"Simple" rules are direct byte -> string substitutions already captured in the
JSON. "Complex" rules carry their raw VBA in the JSON for manual porting
(mostly vattu/anusvara reordering, which our marker-based `_fix_conjuncts`
already generalizes).

## Porting order (one at a time; run `node test/permutations.js` after each)

1. **Prakashak (Praja)** - replaces our 12.4%-pass maps; biggest win
2. **Akruti Mono** - replaces our 16.3%-pass maps
3. **SriLipi KAN-850** - replaces/augments our 33.7%-pass shree maps
4. **Surabhi KND** - new font, cleanest table (1 complex rule)
5. ISM KNTT-Nandi, Janna, Dharma ILs, WinKey, Suchi, ShreeDeccan
6. Cross-check our Nudi A2U_MAP against the 996-entry macro array
   (may explain remaining real-world edge cases)

Each port: generate JS map from JSON -> hand-port complex rules -> add font
option to UI + mappings page -> extend the permutation suite -> update
status page stats.

## Provenance note

Original .dot files kept outside the repo (binary, macro-bearing). The
extracted VBA is reproducible from them via `olevba`; the JSON extracts in
`tools/macro-extracts/` are the working reference.
