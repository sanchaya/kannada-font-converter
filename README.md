# ಕನ್ನಡ ಅಕ್ಷರರೂಪ ಪರಿವರ್ತಕ

Enterprise Kannada Font Converter - Convert between Legacy ASCII (Nudi/Baraha/ShreeLipi) and Unicode

## Features

- **Text Conversion**: Paste and convert Kannada text between ASCII and Unicode
- **File Support**: Upload and convert `.txt` and `.docx` files
- **Stray Detection**: Detect mixed ASCII/Unicode characters
- **Number Formats**: Convert numbers to Kannada (೦೧೨), English (012), or keep original
- **Auto-detect**: Automatically detect input format
- **Conversion History**: Stored on server for tracking
- **API**: RESTful API for programmatic access

## Quick Start

```bash
# Install dependencies
npm install

# Run server
npm start
```

Open http://localhost:3000 in your browser.

## Project Structure

```
├── server.js          # Express server with API
├── package.json       # Node dependencies
├── public/
│   ├── index.html     # Main UI
│   ├── css/style.css  # Styles
│   ├── js/app.js      # Frontend JavaScript
│   └── img/logo.png   # Logo
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/convert | Convert text |
| GET | /api/history | Get conversion history |
| GET | /api/convert/:id | Get specific conversion |
| GET | /api/health | Health check |

### Example API Usage

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "text": "ನಮಸ್ಕಾರ",
    "direction": "auto",
    "numFormat": "keep"
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |

## GitHub Pages Deployment

For static hosting (without API/history):

1. Use the static `public/index.html` directly
2. All conversion happens client-side

## Domains

- **converter.sanchaya.net** - Main converter
- **parivarthaka.sanchaya.net** - Alternate domain

## Supported Formats

- **Input**: Nudi ASCII, Baraha ASCII, ShreeLipi ASCII, Unicode Kannada
- **Output**: Unicode Kannada or ASCII (Nudi style)
- **Files**: TXT, DOCX (read), TXT (write)

## License

MIT