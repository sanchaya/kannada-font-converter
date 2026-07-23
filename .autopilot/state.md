# Autopilot State - kanconvert

## Last run: 2026-07-23

## Session 2026-07-22/23 (interactive) - major changes
- Multi-page app: keyboards.html, mappings.html, about.html added; #keyboards section removed from index
- Branding aligned with fonts.sanchaya.net (favicons, horizontal wordmark logo)
- Live editor rebuilt: bidirectional editing (both panes editable, live sync),
  per-pane editor toolbars (file open TXT/DOCX, font, size, copy, download, expand, clear),
  direction toggle (ASCII simulator / u2a), format-based downloads (ascii/unicode/both),
  DOCX image detection (text-only notice), UTF-8→windows-1252 decode fallback
- IME: fixed activation (proper setLanguage/load/setIM/enable API - the old
  'setInputMethod' trigger does not exist in jquery.ime); visible ಕೀಬೋರ್ಡ್ dropdown is the
  single IME control on live panes (floating selector disabled there to avoid clashes)
- Retain-English fix: standalone digit runs protected in all four decoders
  ('123' no longer becomes '೧ಎ೩'; digits adjacent to encoding bytes still convert)
- Guided tours per section via driver.js (js/tour.js), ಮಾರ್ಗದರ್ಶಿ button
- Design: flat card headers (gradient bars removed), wider layout (1280/1400px)
- Deleted broken images (HTML error pages saved as .png/.svg from failed Wikimedia fetches)

## Project type
Static HTML + JS app (client-side conversion) with an optional Express server for history/API.
Hosted on GitHub Pages at converter.sanchaya.net. Node server is secondary.

## Build/test commands
- `node test/permutations.js` - 2,077-case round-trip suite per font; writes test/ISSUES.md.
  RUN AFTER EVERY CONVERSION CHANGE (guards against regression loops).
- Static smoke: open index.html in browser
- Server: `PORT=3001 node server.js`

## KGP macro adoption (see tools/MACRO-REVIEW.md) - PORTED 2026-07-23
Six KGP Word macro templates reviewed; rule tables extracted to tools/macro-extracts/*.json,
then tools/resolve-complex.py recovered output for most "complex" (state-flag) rules and
tools/generate-pivot-maps.py generated charCode->NudiASCII tables (tools/pivot-maps.generated.js).
Ported into js/app.js as a generic pivot engine (pivotAsciiToUnicode/pivotUnicodeToAscii +
PRAKASH2_X2NUDI/AKRUTI2_X2NUDI/SHREE2_X2NUDI/SURABHI_X2NUDI), replacing the old weak
shree/prakashak/akruti maps and adding Surabhi (KND) as a new font. Wired into index.html
dropdowns, mappings.html (live-rendered), test/permutations.js, bug_report.yml, and README.
server.js was NOT extended (already lacked shree/prakashak/akruti; documented as secondary path).
Still not ported: ISM/KNTT-Nandi, WinKey, Dharma ILs, Janna, Suchi, ShreeDeccan, and a second
SriLipi/Surabhi/Akruti variant each (7 more source encodings, see tools/MACRO-REVIEW.md).

## Conversion status (from test/ISSUES.md, 2026-07-23, post-port)
- nudi: 2076/2077 pass. Only bare standalone ಎ (code '2', ambiguous with numeral). Accepted limitation.
- shree: 1909/2077 (was 699) - remaining fails mostly u2a conjunct/vattakshara forms
- prakashak: 911/2077 (was 257) - weakest of the ported fonts, same u2a conjunct gap
- akruti: 1548/2077 (was 338)
- surabhi: 1839/2077 - new font, not previously supported
Root cause of remaining gaps: u2a pivot inverts Nudi-ASCII-fragment->source-char, but the
Nudi engine's own ASCII output for conjunct/vattakshara forms doesn't always match the
literal per-byte fragment shapes the macros assumed. a2u (the documented priority direction)
is comparatively strong. Re-run test/permutations.js after any further change.

## Do not touch
_(nothing flagged yet)_

---

## What was done this run

**Tier A fix applied:**
- `js/app.js` line 1262–1268: Removed two redundant CORS proxy entries in `corsProxies` array.
  - Entry 2 was byte-for-byte identical to entry 1 (both `jina.ai` with `replace(/^https?:\/\//, '')`).
  - Entry 3 (`jina.ai full`) would produce malformed URLs for https:// inputs (double-prefix: `http://https://example.com`). Removed.
  - Remaining proxies: jina.ai (correct), allorigins, corsproxy.io.

---

## Open proposals - needs your call

### B1: jquery.ime CDN pinned to @master (fragile)
`index.html` loads 7 jquery.ime scripts from `cdn.jsdelivr.net/gh/wikimedia/jquery.ime@master/...`.
Using `@master` means a breaking upstream commit could silently break the IME overnight.
**Suggestion:** Pin to a specific commit SHA, e.g. `@3d7b9c2` (latest stable as of mid-2025).
Risk if not fixed: rare but possible silent IME breakage.

### B2: Unbounded in-memory conversions Map (server.js)
`server.js` line 19: `const conversions = new Map();` - grows forever, no eviction.
Comment already says "use Redis in production." If the server runs long-term, this leaks memory.
**Suggestion:** Add a size cap: if `conversions.size > 1000`, delete the oldest 100 entries before inserting.
Risk: low if server is restarted regularly; real leak if left running for weeks.

### B3: Conversion maps duplicated between server.js and app.js
The entire A2U_MAP, vowelMaps, consonantMaps, VATTAKSHARA_MAP, conversion functions (~400 lines)
are copy-pasted between `server.js` and `js/app.js`. Any bug fix or mapping addition must be
applied in both files manually.
**Suggestion:** Extract to `js/converter-core.js`, import in server.js via `require()` and load
via `<script>` in index.html before app.js.
Risk: medium - divergence already exists (app.js has Shree/Prakashak/Akruti functions that server.js lacks).

### B4: CNAME file has two domain entries
`CNAME` contains two lines: `converter.sanchaya.net` and `parivarthaka.sanchaya.net`.
GitHub Pages CNAME only reads the first line; the second is ignored (not an active GH Pages domain).
README lists parivarthaka as an "alternate domain" - if it's supposed to work, it needs a separate
DNS CNAME + GH Pages custom domain config, which can't be done via this file.
**Suggestion:** Either remove the second line (keep file clean) or document that parivarthaka
is a DNS alias handled outside GitHub Pages.

### B5: No automated tests
No test suite exists. Converting a few known Nudi→Unicode pairs would catch regressions.
**Suggestion:** Add a `test/smoke.js` with ~20 reference conversions using Node's built-in `assert`.
Run with `node test/smoke.js`. Low effort, high value given the complexity of the mapping logic.

---

## Conventions observed
- Client-side conversion is the primary path (GitHub Pages friendly)
- Server is supplementary (history, API) - can be ignored for static deploys
- Bootstrap 5.3 + jQuery 3.7.1 for UI
- Kannada Unicode block: U+0C80–U+0CFF
- Font type selector covers: Nudi, Baraha, ShreeLipi, Prakashak, Akruti
