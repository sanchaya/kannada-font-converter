# Self-Hosted Node Server Deployment

The converter is fully client-side and runs as a static site (that's how
`converter.sanchaya.net` is deployed, via GitHub Pages). This document is
for the alternative: running it yourself via `server.js`, e.g. on your own
VPS, behind your own domain, or just on `localhost` for local/offline use.

`server.js` serves the same static files as GitHub Pages *and* exposes a
small JSON API (`/api/convert`) that runs the identical conversion engine
from `js/app.js` server-side, so a client can call it directly instead of
converting in the browser.

> `server.js`, `package.json`, and `package-lock.json` are intentionally
> **not** part of the public GitHub Pages repo (see `.gitignore`) - they're
> kept local to whichever machine you're deploying from.

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

By default this starts the server on `http://localhost:3000`. Open that URL
in a browser - you'll see the exact same UI as the live site, now backed by
your own server.

## Environment variables

All are optional; sensible defaults apply if you don't set any of them.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `MAX_CONVERSIONS_CACHE` | `500` | Max entries kept in the in-memory `/api/history` cache before the oldest are evicted |
| `SAVE_SUBMISSIONS` | `false` | Set to `true` to persist every conversion request to a local JSONL log file - see **Submission logging** below before enabling |
| `SUBMISSIONS_LOG_PATH` | `./data/submissions.jsonl` | Where the submission log is written, if enabled |

Example:

```bash
PORT=8080 MAX_CONVERSIONS_CACHE=1000 npm start
```

Or via a `.env` file loaded by your process manager (see below) - `.env` is
already gitignored, so it's safe to put real values there.

## Submission logging (optional, off by default)

If you set `SAVE_SUBMISSIONS=true`, every call to `/api/convert` appends one
JSON line to `data/submissions.jsonl` (or wherever `SUBMISSIONS_LOG_PATH`
points) recording: timestamp, direction, font, number format, whether
retain-English was on, and **the full input and output text**. The idea is
to build up a corpus of real-world conversions you can review later to spot
patterns the automated test suite doesn't cover - fonts/edge cases people
actually hit, English-retention misses, etc. - and use that to prioritize
what to fix next in `js/app.js`.

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
Environment=PORT=3000
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
        proxy_pass http://localhost:3000;
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
`GET /api/health`.

## Attribution

If you deploy this yourself, please keep the "Proudly built at sanchaya.org
with love for Kannada" footer credit and the license headers in
`index.html`/`js/app.js`/`server.js` intact - see [LICENSE](LICENSE)
(GPL-3.0-or-later).
