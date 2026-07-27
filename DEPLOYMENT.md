# Self-Hosted Node Server Deployment

The converter is fully client-side and runs as a static site (that's how
`converter.sanchaya.net` is deployed, via GitHub Pages). This document is
for the alternative: running it yourself via `server.js`, e.g. on your own
VPS, behind your own domain, or just on `localhost` for local/offline use.

`server.js` serves the same static files as GitHub Pages *and* exposes a
small JSON API (`/api/convert`) that runs the identical conversion engine
from `js/app.js` server-side, so a client can call it directly instead of
converting in the browser.

> `server.js`, `package.json`, and `package-lock.json` are tracked in the
> same repo as the static site (GitHub Pages itself just ignores them,
> since it only serves plain files) - so a plain `git clone` gets you
> everything needed for either deployment style. A few genuinely dev-only
> files (`tools/`, `test/permutations.js`, `.autopilot/`, ...) are still
> excluded via `.gitignore` - see the comment there for the full list.

## Prerequisites

- Node.js >= 14 (check with `node -v`)
- npm (ships with Node)

## Install

```bash
cd kanconvert
npm install
```

## Run

```bash
npm start
# or: node server.js
```

By default this starts the server on `http://localhost:4500`. Open that URL
in a browser - you'll see the exact same UI as the live site, now backed by
your own server.

## Environment variables

All are optional; sensible defaults apply if you don't set any of them.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4500` | Port the server listens on |
| `MAX_CONVERSIONS_CACHE` | `500` | Max entries kept in the in-memory `/api/history` cache before the oldest are evicted |
| `SAVE_SUBMISSIONS` | `false` | Set to `true` to persist every conversion request to a local JSONL log file - see **Submission logging** below before enabling |
| `SUBMISSIONS_LOG_PATH` | `./data/submissions.jsonl` | Where the submission log is written, if enabled |

Example:

```bash
PORT=8080 MAX_CONVERSIONS_CACHE=1000 npm start
```

Or via a `.env` file placed right next to `server.js` - it's loaded
automatically (via `dotenv`) regardless of what directory you launch the
process from (pm2, systemd, a plain shell, etc.), so you don't need your
process manager to inject anything itself. `.env` is already gitignored,
so it's safe to put real values there.

```bash
# .env
SAVE_SUBMISSIONS=true
SUBMISSIONS_LOG_PATH=./data/submissions.jsonl
```

A relative `SUBMISSIONS_LOG_PATH` (like the one above) is resolved against
`server.js`'s own directory too, not wherever the process happened to be
launched from - so the file always ends up where you'd expect, next to the
project, no matter how your process manager is configured.

## Submission logging (optional, off by default)

If you set `SAVE_SUBMISSIONS=true`, conversions get appended as JSON lines
to `data/submissions.jsonl` (or wherever `SUBMISSIONS_LOG_PATH` points),
recording: timestamp, direction, font, number format, whether retain-English
was on, and **the full input and output text**. The idea is to build up a
corpus of real-world conversions you can review later to spot patterns the
automated test suite doesn't cover - fonts/edge cases people actually hit,
English-retention misses, etc. - and use that to prioritize what to fix next
in `js/app.js`.

This captures two kinds of activity:

- Direct calls to `POST /api/convert` (e.g. your own scripts/tools hitting
  the API), and
- **Real usage of the website itself.** Conversion always happens
  client-side in the browser first (this app works fully offline and on
  GitHub Pages, which has no backend at all) - but `js/app.js` also does a
  one-time `GET /api/health` check on page load, and if that succeeds
  (meaning this page is being served by *your* server.js, not GitHub
  Pages), it fires a background `POST /api/log-submission` after each
  explicit conversion (main text box and file upload) so real visitor
  activity ends up in the log too, not just direct API callers. This never
  blocks or slows down the UI, and silently does nothing at all when
  served statically (the health check just fails, so nothing is ever
  sent) - GitHub Pages itself is completely unaffected by any of this.

Two things worth being deliberate about before you turn this on:

1. **This stores whatever text people submit, verbatim.** If you're running
   this only for yourself, that's your own data. If other people will use
   your instance, you're now persisting their input on your server - treat
   it like you would any other user-submitted content (don't commit
   `data/` to a repo - it's already gitignored - and consider adding a short
   notice in the UI if it isn't just for personal use).
2. The requester's IP address is **not** included in this log (unlike the
   transient in-memory `/api/history` cache, which does keep IP for the
   short-lived cache only) - the log is meant for improving conversion
   quality, not tracking who submitted what.

The log directory is created automatically the first time a conversion
happens with logging enabled. Rotate/prune it yourself if it grows large -
there's no automatic rotation.

## Keeping it running (process managers)

`npm start` runs in the foreground. For a real deployment, use a process
manager so it restarts on crash/reboot.

**pm2**

```bash
npm install -g pm2
pm2 start server.js --name kanconvert
pm2 save
pm2 startup   # prints a command to enable pm2 on boot - run what it prints
```

**systemd** (e.g. `/etc/systemd/system/kanconvert.service`)

```ini
[Unit]
Description=Kannada Font Converter
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/kanconvert
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=PORT=4500
# Environment=SAVE_SUBMISSIONS=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now kanconvert
```

## Reverse proxy (nginx)

If you want this behind your own domain with TLS, put nginx (or Caddy/etc.)
in front rather than exposing Node directly:

```nginx
server {
    listen 80;
    server_name your-domain.example;

    location / {
        proxy_pass http://localhost:4500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then get a certificate (e.g. `sudo certbot --nginx -d your-domain.example`)
for HTTPS.

## API reference

`POST /api/convert`

```json
{
  "text": "PÀ£ÀÝ",
  "direction": "auto",
  "font": "nudi",
  "numFormat": "keep",
  "retainEnglish": true
}
```

- `direction`: `"auto"` (default) | `"a2u"` | `"u2a"`
- `font`: one of `nudi`, `shree`, `prakashak`, `akruti`, `surabhi`,
  `ismkntt`, `dharma`, `janna`, `srilipi850`, `shreedeccan`, `surabhikn`,
  `suchikan`, `ismknbtt`, `akrutibi`, `winkey` (default `nudi`; unrecognized
  values fall back to `nudi`)
- `numFormat`: `"keep"` (default) | `"kn"` | `"en"`
- `retainEnglish`: boolean, default `false`

Response:

```json
{
  "success": true,
  "result": "ಕನ್ನಡ",
  "direction": "a2u",
  "font": "nudi",
  "conversionId": "..."
}
```

Other endpoints: `GET /api/history?limit=10`, `GET /api/convert/:id`,
`GET /api/health` (also reports `submissionLogging: true/false`).

`POST /api/log-submission` - internal, used by the front-end's own
fire-and-forget call after it's already computed a conversion client-side
(see **Submission logging** above); not something you'd normally call
directly. Body: `{ text, result, direction, font, numFormat,
retainEnglish }`. Always responds `204` and never recomputes anything -
it only feeds the optional submissions log.

## Attribution

If you deploy this yourself, please keep the "Proudly built by Sanchaya
with ❤ for Kannada" footer credit and the license headers in
`index.html`/`js/app.js`/`server.js` intact - see [LICENSE](LICENSE)
(GPL-3.0-or-later).
