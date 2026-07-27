// ============================================================
// ಕನ್ನಡ ಅಕ್ಷರರೂಪ ಪರಿವರ್ತಕ - Node server for self-hosted deployments.
// Proudly built by Sanchaya with ❤ for Kannada.
// https://converter.sanchaya.net | https://sanchaya.org
// Licensed under GPL-3.0-or-later - see LICENSE. If you're running this
// from a downloaded copy or your own fork, please keep this notice and
// the footer attribution in index.html intact.
//
// See DEPLOYMENT.md for setup, environment variables, and reverse-proxy
// examples.
// ============================================================
// Load .env (if present) BEFORE anything reads process.env below - without
// this, a .env file sitting right next to server.js is silently ignored
// and every var (PORT, SAVE_SUBMISSIONS, ...) just falls back to its
// default. require('dotenv').config() never throws if no .env exists, so
// this is safe whether or not you're using one.
//
// Explicitly pointed at THIS file's own directory (__dirname), not left to
// dotenv's default (which looks in process.cwd() instead) - otherwise
// whether your .env is found at all silently depends on what directory
// you happened to launch `node`/pm2/systemd from, which can easily differ
// from where server.js and its .env actually live.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const vm = require('vm');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4500;

// ============================================================
// CONVERSION ENGINE
//
// Rather than maintaining a second copy of the Nudi/pivot-font conversion
// logic in this file (which is exactly how the old version of this file
// silently drifted out of sync with js/app.js - missing font support and
// several retain-English bug fixes), this loads js/app.js itself into a
// sandboxed VM context and calls the SAME `convert()` function the browser
// uses. That guarantees the server can never fall behind the client again;
// every fix ever made to js/app.js applies here automatically.
//
// This is the identical stub technique test/permutations.js already uses
// to run js/app.js headlessly - js/app.js's top-level code only ever
// touches `document`/`window`/`navigator` behind `if (el)` guards or
// inside `document.addEventListener('DOMContentLoaded', ...)` callbacks
// that a no-op addEventListener stub simply never invokes, so nothing at
// module-load time can throw.
// ============================================================
function loadConversionEngine() {
    const stubEl = new Proxy({}, {
        get(target, prop) {
            if (prop === 'addEventListener') return () => {};
            if (prop === 'style') return { setProperty() {} };
            if (prop === 'classList') return { add() {}, remove() {}, toggle() {} };
            if (prop === 'value') return '';
            return () => {};
        }
    });
    const sandbox = {
        document: {
            addEventListener() {},
            getElementById() { return stubEl; },
            querySelector() { return null; },
            querySelectorAll() { return []; }
        },
        navigator: { userAgent: 'kanconvert-server' },
        console
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    const code = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
    vm.runInContext(code, sandbox, { filename: 'js/app.js' });
    if (typeof sandbox.convert !== 'function') {
        throw new Error('js/app.js did not expose convert() - conversion engine failed to load');
    }
    return sandbox;
}

const engine = loadConversionEngine();

const SUPPORTED_FONTS = new Set([
    'nudi', 'shree', 'prakashak', 'akruti', 'surabhi', 'ismkntt', 'dharma',
    'janna', 'srilipi850', 'shreedeccan', 'surabhikn', 'suchikan',
    'ismknbtt', 'akrutibi', 'winkey'
]);

function detectDirection(text) {
    const unicodeCount = (text.match(/[ಀ-೿]/g) || []).length;
    const asciiKnCount = (text.match(/[À-ÿøñð]/g) || []).length;
    return unicodeCount > asciiKnCount ? 'u2a' : 'a2u';
}

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// ============================================================
// IN-MEMORY CONVERSION CACHE (bounded)
//
// Backs /api/history and /api/convert/:id. Capped at MAX_CONVERSIONS_CACHE
// entries (default 500) so long-running deployments can't grow this
// unboundedly in memory - oldest entries are evicted first (Map iterates
// in insertion order, so the first key is always the oldest).
// ============================================================
const MAX_CONVERSIONS_CACHE = parseInt(process.env.MAX_CONVERSIONS_CACHE, 10) || 500;
const conversions = new Map();

function rememberConversion(id, conversion) {
    conversions.set(id, conversion);
    while (conversions.size > MAX_CONVERSIONS_CACHE) {
        const oldestKey = conversions.keys().next().value;
        conversions.delete(oldestKey);
    }
}

// ============================================================
// OPTIONAL SUBMISSION LOGGING (off by default)
//
// Appends each conversion request to a local JSONL file, for later offline
// review when improving the font tables/heuristics. This is OFF unless you
// explicitly opt in - it persists whatever text people submit, so only
// enable it if you understand and accept that privacy tradeoff (and tell
// your users, if this isn't just for your own local use). See
// DEPLOYMENT.md for the full explanation.
//
//   SAVE_SUBMISSIONS=true          enable logging (default: disabled)
//   SUBMISSIONS_LOG_PATH=<path>    where to write the JSONL log
//                                  (default: ./data/submissions.jsonl)
//
// A *relative* SUBMISSIONS_LOG_PATH is resolved against this file's own
// directory (__dirname), not the process's current working directory -
// otherwise the effective location silently depends on whatever directory
// you happened to launch `node`/pm2/systemd from, which can easily differ
// from the project directory you're looking in afterward. An absolute
// path in SUBMISSIONS_LOG_PATH is used as-is.
//
// Deliberately does NOT record the requester's IP address in the log file
// (unlike the transient in-memory `conversions` cache above) - the goal is
// improving conversion quality, not tracking who submitted what.
// ============================================================
const SAVE_SUBMISSIONS = process.env.SAVE_SUBMISSIONS === 'true';
const SUBMISSIONS_LOG_PATH = path.resolve(
    __dirname,
    process.env.SUBMISSIONS_LOG_PATH || path.join('data', 'submissions.jsonl')
);

if (SAVE_SUBMISSIONS) {
    console.log(`Submission logging enabled -> ${SUBMISSIONS_LOG_PATH}`);
}

function logSubmission(entry) {
    if (!SAVE_SUBMISSIONS) return;
    try {
        fs.mkdirSync(path.dirname(SUBMISSIONS_LOG_PATH), { recursive: true });
        fs.appendFileSync(SUBMISSIONS_LOG_PATH, JSON.stringify(entry) + '\n');
    } catch (e) {
        console.error('Failed to log submission:', e.message);
    }
}

// ============================================================
// API ROUTES
// ============================================================

// Convert text API
app.post('/api/convert', (req, res) => {
    try {
        const {
            text,
            numFormat = 'keep',
            direction = 'auto',
            retainEnglish = false,
            font = 'nudi'
        } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Invalid text input' });
        }

        const fontType = SUPPORTED_FONTS.has(font) ? font : 'nudi';
        const dir = direction === 'auto' ? detectDirection(text) : direction;

        const result = engine.convert(text, numFormat, dir, !!retainEnglish, fontType);

        const id = uuidv4();
        const timestamp = new Date().toISOString();

        rememberConversion(id, {
            id,
            originalText: text,
            convertedText: result,
            direction: dir,
            font: fontType,
            numFormat,
            timestamp,
            ip: req.ip
        });

        logSubmission({
            id,
            timestamp,
            direction: dir,
            font: fontType,
            numFormat,
            retainEnglish: !!retainEnglish,
            inputText: text,
            outputText: result
        });

        res.json({
            success: true,
            result,
            direction: dir,
            font: fontType,
            conversionId: id
        });
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Conversion failed' });
    }
});

// Get conversion history
app.get('/api/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const history = Array.from(conversions.values())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)
        .map(c => ({
            id: c.id,
            direction: c.direction,
            font: c.font,
            timestamp: c.timestamp,
            textLength: c.originalText.length
        }));
    res.json({ history });
});

// Get single conversion
app.get('/api/convert/:id', (req, res) => {
    const conversion = conversions.get(req.params.id);
    if (!conversion) {
        return res.status(404).json({ error: 'Conversion not found' });
    }
    res.json(conversion);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        submissionLogging: SAVE_SUBMISSIONS
    });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

module.exports = app;
