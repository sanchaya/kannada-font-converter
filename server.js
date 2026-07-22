const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// In-memory store for conversions (use Redis in production)
const conversions = new Map();

// ============================================================
// NUDI/BARAHA ASCII TO UNICODE MAPPING
// Based on sanka project (aravindavk/sanka)
// ============================================================

const A2U_MAP = {};

const vowelMaps = [
    ['A', 'ಂ'], ['B', 'ಃ'], ['CA', 'ಅಂ'], ['CB', 'ಅಃ'],
    ['C', 'ಅ'], ['D', 'ಆ'], ['E', 'ಇ'], ['F', 'ಈ'],
    ['G', 'ಉ'], ['H', 'ಊ'], ['IÄ', 'ಋ'], ['IÆ', 'ೠ'],
    ['2', 'ಎ'], ['J', 'ಏ'], ['K', 'ಐ'], ['L', 'ಒ'],
    ['M', 'ಓ'], ['N', 'ಔ'],
    ['x', 'ಕ್ಷ'], ['GY', 'ಜ್ಞ']
];

const consonantMaps = [
    ['Pï', 'ಕ್'], ['PÀ', 'ಕ'], ['PÁ', 'ಕಾ'], ['Q', 'ಕಿ'], ['QÃ', 'ಕೀ'],
    ['PÀÄ', 'ಕು'], ['PÀÆ', 'ಕೂ'], ['PÀÈ', 'ಕೃ'], ['PÉ', 'ಕೆ'], ['PÉÃ', 'ಕೇ'],
    ['PÉÊ', 'ಕೈ'], ['PÉÆ', 'ಕೊ'], ['PÉÆÃ', 'ಕೋ'], ['PË', 'ಕೌ'],
    ['Sï', 'ಖ್'], ['R', 'ಖ'], ['SÁ', 'ಖಾ'], ['T', 'ಖಿ'], ['TÃ', 'ಖೀ'],
    ['RÄ', 'ಖು'], ['RÆ', 'ಖೂ'], ['RÈ', 'ಖೃ'], ['SÉ', 'ಖೆ'], ['SÉÃ', 'ಖೇ'],
    ['SÉÊ', 'ಖೈ'], ['SÉÆ', 'ಖೊ'], ['SÉÆÃ', 'ಖೋ'], ['SË', 'ಖೌ'],
    ['Uï', 'ಗ್'], ['UÀ', 'ಗ'], ['UÁ', 'ಗಾ'], ['V', 'ಗಿ'], ['VÃ', 'ಗೀ'],
    ['UÀÄ', 'ಗು'], ['UÀÆ', 'ಗೂ'], ['UÀÈ', 'ಗೃ'], ['UÉ', 'ಗೆ'], ['UÉÃ', 'ಗೇ'],
    ['UÉÊ', 'ಗೈ'], ['UÉÆ', 'ಗೊ'], ['UÉÆÃ', 'ಗೋ'], ['UË', 'ಗೌ'],
    ['Wï', 'ಘ್'], ['WÀ', 'ಘ'], ['WÁ', 'ಘಾ'], ['X', 'ಘಿ'], ['XÃ', 'ಘೀ'],
    ['WÀÄ', 'ಘು'], ['WÀÆ', 'ಘೂ'], ['WÀÈ', 'ಘೃ'], ['WÉ', 'ಘೆ'], ['WÉÃ', 'ಘೇ'],
    ['WÉÊ', 'ಘೈ'], ['WÉÆ', 'ಘೊ'], ['WÉÆÃ', 'ಘೋ'], ['WË', 'ಘೌ'],
    ['Yï', 'ಙ್'], ['Y', 'ಙ'],
    ['Zï', 'ಚ್'], ['ZÀ', 'ಚ'], ['ZÁ', 'ಚಾ'], ['a', 'ಚಿ'], ['aÃ', 'ಚೀ'],
    ['ZÀÄ', 'ಚು'], ['ZÀÆ', 'ಚೂ'], ['ZÀÈ', 'ಚೃ'], ['ZÉ', 'ಚೆ'], ['ZÉÃ', 'ಚೇ'],
    ['ZÉÊ', 'ಚೈ'], ['ZÉÆ', 'ಚೊ'], ['ZÉÆÃ', 'ಚೋ'], ['ZË', 'ಚೌ'],
    ['bï', 'ಛ್'], ['bÀ', 'ಛ'], ['bÁ', 'ಛಾ'], ['c', 'ಛಿ'], ['cÃ', 'ಛೀ'],
    ['bÀÄ', 'ಛು'], ['bÀÆ', 'ಛೂ'], ['bÀÈ', 'ಛೃ'], ['bÉ', 'ಛೆ'], ['bÉÃ', 'ಛೇ'],
    ['bÉÊ', 'ಛೈ'], ['bÉÆ', 'ಛೊ'], ['bÉÆÃ', 'ಛೋ'], ['bË', 'ಛೌ'],
    ['eï', 'ಜ್'], ['d', 'ಜ'], ['eÁ', 'ಜಾ'], ['f', 'ಜಿ'], ['fÃ', 'ಜೀ'],
    ['dÄ', 'ಜು'], ['dÆ', 'ಜೂ'], ['dÈ', 'ಜೃ'], ['eÉ', 'ಜೆ'], ['eÉÃ', 'ಜೇ'],
    ['eÉÊ', 'ಜೈ'], ['eÉÆ', 'ಜೊ'], ['eÉÆÃ', 'ಜೋ'], ['eË', 'ಜೌ'],
    ['gÀhiï', 'ಝ್'], ['gÀhÄ', 'ಝ'], ['gÀhiÁ', 'ಝಾ'], ['jhÄ', 'ಝಿ'], ['jhÄÃ', 'ಝೀ'],
    ['gÀhÄÄ', 'ಝು'], ['gÀhÄÆ', 'ಝೂ'], ['gÀhÄÈ', 'ಝೃ'], ['gÉhÄ', 'ಝೆ'], ['gÉhÄÃ', 'ಝೇ'],
    ['gÉhÄÊ', 'ಝೈ'], ['gÉhÆ', 'ಝೊ'], ['gÉhÆÃ', 'ಝೋ'], ['gÀhiË', 'ಝೌ'],
    ['kï', 'ಞ್'], ['k', 'ಞ'],
    ['mï', 'ಟ್'], ['l', 'ಟ'], ['mÁ', 'ಟಾ'], ['n', 'ಟಿ'], ['nÃ', 'ಟೀ'],
    ['lÄ', 'ಟು'], ['lÆ', 'ಟೂ'], ['lÈ', 'ಟೃ'], ['mÉ', 'ಟೆ'], ['mÉÃ', 'ಟೇ'],
    ['mÉÊ', 'ಟೈ'], ['mÉÆ', 'ಟೊ'], ['mÉÆÃ', 'ಟೋ'], ['mË', 'ಟೌ'],
    ['oï', 'ಠ್'], ['oÀ', 'ಠ'], ['oÁ', 'ಠಾ'], ['p', 'ಠಿ'], ['pÃ', 'ಠೀ'],
    ['oÀÄ', 'ಠು'], ['oÀÆ', 'ಠೂ'], ['oÀÈ', 'ಠೃ'], ['oÉ', 'ಠೆ'], ['oÉÃ', 'ಠೇ'],
    ['oÉÊ', 'ಠೈ'], ['oÉÆ', 'ಠೊ'], ['oÉÆÃ', 'ಠೋ'], ['oË', 'ಠೌ'],
    ['qï', 'ಡ್'], ['qÀ', 'ಡ'], ['qÁ', 'ಡಾ'], ['r', 'ಡಿ'], ['rÃ', 'ಡೀ'],
    ['qÀÄ', 'ಡು'], ['qÀÆ', 'ಡೂ'], ['qÀÈ', 'ಡೃ'], ['qÉ', 'ಡೆ'], ['qÉÃ', 'ಡೇ'],
    ['qÉÊ', 'ಡೈ'], ['qÉÆ', 'ಡೊ'], ['qÉÆÃ', 'ಡೋ'], ['qË', 'ಡೌ'],
    ['qsï', 'ಢ್'], ['qsÀ', 'ಢ'], ['qsÁ', 'ಢಾ'], ['rü', 'ಢಿ'], ['rüÃ', 'ಢೀ'],
    ['qsÀÄ', 'ಢು'], ['qsÀÆ', 'ಢೂ'], ['qsÀÈ', 'ಢೃ'], ['qsÉ', 'ಢೆ'], ['qsÉÃ', 'ಢೇ'],
    ['qsÉÊ', 'ಢೈ'], ['qsÉÆ', 'ಢೊ'], ['qsÉÆÃ', 'ಢೋ'], ['qsË', 'ಢೌ'],
    ['uï', 'ಣ್'], ['t', 'ಣ'], ['uÁ', 'ಣಾ'], ['tÂ', 'ಣಿ'], ['tÂÃ', 'ಣೀ'],
    ['tÄ', 'ಣು'], ['tÆ', 'ಣೂ'], ['tÈ', 'ಣೃ'], ['uÉ', 'ಣೆ'], ['uÉÃ', 'ಣೇ'],
    ['uÉÊ', 'ಣೈ'], ['uÉÆ', 'ಣೊ'], ['uÉÆÃ', 'ಣೋ'], ['uË', 'ಣೌ'],
    ['vï', 'ತ್'], ['vÀ', 'ತ'], ['vÁ', 'ತಾ'], ['w', 'ತಿ'], ['wÃ', 'ತೀ'],
    ['vÀÄ', 'ತು'], ['vÀÆ', 'ತೂ'], ['vÀÈ', 'ತೃ'], ['vÉ', 'ತೆ'], ['vÉÃ', 'ತೇ'],
    ['vÉÊ', 'ತೈ'], ['vÉÆ', 'ತೊ'], ['vÉÆÃ', 'ತೋ'], ['vË', 'ತೌ'],
    ['xï', 'ಥ್'], ['xÀ', 'ಥ'], ['xÁ', 'ಥಾ'], ['y', 'ಥಿ'], ['yÃ', 'ಥೀ'],
    ['xÀÄ', 'ಥು'], ['xÀÆ', 'ಥೂ'], ['xÀÈ', 'ಥೃ'], ['xÉ', 'ಥೆ'], ['xÉÃ', 'ಥೇ'],
    ['xÉÊ', 'ಥೈ'], ['xÉÆ', 'ಥೊ'], ['xÉÆÃ', 'ಥೋ'], ['xË', 'ಥೌ'],
    ['zï', 'ದ್'], ['zÀ', 'ದ'], ['zÁ', 'ದಾ'], ['¢', 'ದಿ'], ['¢Ã', 'ದೀ'],
    ['zÀÄ', 'ದು'], ['zÀÆ', 'ದೂ'], ['zÀÈ', 'ದೃ'], ['zÉ', 'ದೆ'], ['zÉÃ', 'ದೇ'],
    ['zÉÊ', 'ದೈ'], ['zÉÆ', 'ದೊ'], ['zÉÆÃ', 'ದೋ'], ['zË', 'ದೌ'],
    ['zsï', 'ಧ್'], ['zsÀ', 'ಧ'], ['zsÁ', 'ಧಾ'], ['¢ü', 'ಧಿ'], ['¢üÃ', 'ಧೀ'],
    ['zsÀÄ', 'ಧು'], ['zsÀÆ', 'ಧೂ'], ['zsÀÈ', 'ಧೃ'], ['zsÉ', 'ಧೆ'], ['zsÉÃ', 'ಧೇ'],
    ['zsÉÊ', 'ಧೈ'], ['zsÉÆ', 'ಧೊ'], ['zsÉÆÃ', 'ಧೋ'], ['zsË', 'ಧೌ'],
    ['£ï', 'ನ್'], ['£À', 'ನ'], ['£Á', 'ನಾ'], ['¤', 'ನಿ'], ['¤Ã', 'ನೀ'],
    ['£ÀÄ', 'ನು'], ['£ÀÆ', 'ನೂ'], ['£ÀÈ', 'ನೃ'], ['£É', 'ನೆ'], ['£ÉÃ', 'ನೇ'],
    ['£ÉÊ', 'ನೈ'], ['£ÉÆ', 'ನೊ'], ['£ÉÆÃ', 'ನೋ'], ['£Ë', 'ನೌ'],
    ['¥ï', 'ಪ್'], ['¥À', 'ಪ'], ['¥Á', 'ಪಾ'], ['¦', 'ಪಿ'], ['¦Ã', 'ಪೀ'],
    ['¥ÀÅ', 'ಪು'], ['¥ÀÇ', 'ಪೂ'], ['¥ÀÈ', 'ಪೃ'], ['¥É', 'ಪೆ'], ['¥ÉÃ', 'ಪೇ'],
    ['¥ÉÊ', 'ಪೈ'], ['¥ÉÇ', 'ಪೊ'], ['¥ÉÇÃ', 'ಪೋ'], ['¥Ë', 'ಪೌ'],
    ['¥sï', 'ಫ್'], ['¥sÀ', 'ಫ'], ['¥sÁ', 'ಫಾ'], ['¦ü', 'ಫಿ'], ['¦üÃ', 'ಫೀ'],
    ['¥sÀÅ', 'ಫು'], ['¥sÀÇ', 'ಫೂ'], ['¥sÀÈ', 'ಫೃ'], ['¥sÉ', 'ಫೆ'], ['¥sÉÃ', 'ಫೇ'],
    ['¥sÉÊ', 'ಫೈ'], ['¥sÉÇ', 'ಫೊ'], ['¥sÉÇÃ', 'ಫೋ'], ['¥sË', 'ಫೌ'],
    ['¨ï', 'ಬ್'], ['§', 'ಬ'], ['¨Á', 'ಬಾ'], ['©', 'ಬಿ'], ['©Ã', 'ಬೀ'],
    ['§Ä', 'ಬು'], ['§Æ', 'ಬೂ'], ['§È', 'ಬೃ'], ['¨É', 'ಬೆ'], ['¨ÉÃ', 'ಬೇ'],
    ['¨ÉÊ', 'ಬೈ'], ['¨ÉÆ', 'ಬೊ'], ['¨ÉÆÃ', 'ಬೋ'], ['¨Ë', 'ಬೌ'],
    ['¨sï', 'ಭ್'], ['¨sÀ', 'ಭ'], ['¨sÁ', 'ಭಾ'], ['©ü', 'ಭಿ'], ['©üÃ', 'ಭೀ'],
    ['¨sÀÄ', 'ಭು'], ['¨sÀÆ', 'ಭೂ'], ['¨sÀÈ', 'ಭೃ'], ['¨sÉ', 'ಭೆ'], ['¨sÉÃ', 'ಭೇ'],
    ['¨sÉÊ', 'ಭೈ'], ['¨sÉÆ', 'ಭೊ'], ['¨sÉÆÃ', 'ಭೋ'], ['¨sË', 'ಭೌ'],
    ['ªÀiï', 'ಮ್'], ['ªÀÄ', 'ಮ'], ['ªÀiÁ', 'ಮಾ'], ['«Ä', 'ಮಿ'], ['«ÄÃ', 'ಮೀ'],
    ['ªÀÄÄ', 'ಮು'], ['ªÀÄÆ', 'ಮೂ'], ['ªÀÄÈ', 'ಮೃ'], ['ªÉÄ', 'ಮೆ'], ['ªÉÄÃ', 'ಮೇ'],
    ['ªÉÄÊ', 'ಮೈ'], ['ªÉÆ', 'ಮೊ'], ['ªÉÆÃ', 'ಮೋ'], ['ªÀiË', 'ಮೌ'],
    ['AiÀiï', 'ಯ್'], ['AiÀÄ', 'ಯ'], ['AiÀiÁ', 'ಯಾ'], ['¬Ä', 'ಯಿ'], ['¬ÄÃ', 'ಯೀ'],
    ['AiÀÄÄ', 'ಯು'], ['AiÀÄÆ', 'ಯೂ'], ['AiÀÄÈ', 'ಯೃ'], ['AiÉÄ', 'ಯೆ'], ['AiÉÄÃ', 'ಯೇ'],
    ['AiÉÄÊ', 'ಯೈ'], ['AiÉÆ', 'ಯೊ'], ['AiÉÆÃ', 'ಯೋ'], ['AiÀiË', 'ಯೌ'],
    ['gï', 'ರ್'], ['gÀ', 'ರ'], ['gÁ', 'ರಾ'], ['j', 'ರಿ'], ['jÃ', 'ರೀ'],
    ['gÀÄ', 'ರು'], ['gÀÆ', 'ರೂ'], ['gÀÈ', 'ರೃ'], ['gÉ', 'ರೆ'], ['gÉÃ', 'ರೇ'],
    ['gÉÊ', 'ರೈ'], ['gÉÆ', 'ರೊ'], ['gÉÆÃ', 'ರೋ'], ['gË', 'ರೌ'],
    ['¯ï', 'ಲ್'], ['®', 'ಲ'], ['¯Á', 'ಲಾ'], ['°', 'ಲಿ'], ['°Ã', 'ಲೀ'],
    ['®Ä', 'ಲು'], ['®Æ', 'ಲೂ'], ['®È', 'ಲೃ'], ['¯É', 'ಲೆ'], ['¯ÉÃ', 'ಲೇ'],
    ['¯ÉÊ', 'ಲೈ'], ['¯ÉÆ', 'ಲೊ'], ['¯ÉÆÃ', 'ಲೋ'], ['¯Ë', 'ಲೌ'],
    ['ªï', 'ವ್'], ['ªÀ', 'ವ'], ['ªÁ', 'ವಾ'], ['«', 'ವಿ'], ['«Ã', 'ವೀ'],
    ['ªÀÅ', 'ವು'], ['ªÀÇ', 'ವೂ'], ['ªÀÈ', 'ವೃ'], ['ªÉ', 'ವೆ'], ['ªÉÃ', 'ವೇ'],
    ['ªÉÊ', 'ವೈ'], ['ªÉÇ', 'ವೊ'], ['ªÉÇÃ', 'ವೋ'], ['ªË', 'ವೌ'],
    ['±ï', 'ಶ್'], ['±À', 'ಶ'], ['±Á', 'ಶಾ'], ['²', 'ಶಿ'], ['²Ã', 'ಶೀ'],
    ['±ÀÄ', 'ಶು'], ['±ÀÆ', 'ಶೂ'], ['±ÀÈ', 'ಶೃ'], ['±É', 'ಶೆ'], ['±ÉÃ', 'ಶೇ'],
    ['±ÉÊ', 'ಶೈ'], ['±ÉÆ', 'ಶೊ'], ['±ÉÆÃ', 'ಶೋ'], ['±Ë', 'ಶೌ'],
    ['μï', 'ಷ್'], ['μÀ', 'ಷ'], ['μÁ', 'ಷಾ'], ['¶', 'ಷಿ'], ['¶Ã', 'ಷೀ'],
    ['μÀÄ', 'ಷು'], ['μÀÆ', 'ಷೂ'], ['μÀÈ', 'ಷೃ'], ['μÉ', 'ಷೆ'], ['μÉÃ', 'ಷೇ'],
    ['μÉÊ', 'ಷೈ'], ['μÉÆ', 'ಷೊ'], ['μÉÆÃ', 'ಷೋ'], ['μË', 'ಷೌ'],
    ['¸ï', 'ಸ್'], ['¸À', 'ಸ'], ['¸Á', 'ಸಾ'], ['¹', 'ಸಿ'], ['¹Ã', 'ಸೀ'],
    ['¸ÀÄ', 'ಸು'], ['¸ÀÆ', 'ಸೂ'], ['¸ÀÈ', 'ಸೃ'], ['¸É', 'ಸೆ'], ['¸ÉÃ', 'ಸೇ'],
    ['¸ÉÊ', 'ಸೈ'], ['¸ÉÆ', 'ಸೊ'], ['¸ÉÆÃ', 'ಸೋ'], ['¸Ë', 'ಸೌ'],
    ['ºï', 'ಹ್'], ['ºÀ', 'ಹ'], ['ºÁ', 'ಹಾ'], ['»', 'ಹಿ'], ['»Ã', 'ಹೀ'],
    ['ºÀÄ', 'ಹು'], ['ºÀÆ', 'ಹೂ'], ['ºÀÈ', 'ಹೃ'], ['ºÉ', 'ಹೆ'], ['ºÉÃ', 'ಹೇ'],
    ['ºÉÊ', 'ಹೈ'], ['ºÉÆ', 'ಹೊ'], ['ºÉÆÃ', 'ಹೋ'], ['ºË', 'ಹೌ'],
    ['¼ï', 'ಳ್'], ['¼À', 'ಳ'], ['¼Á', 'ಳಾ'], ['½', 'ಳಿ'], ['½Ã', 'ಳೀ'],
    ['¼ÀÄ', 'ಳು'], ['¼ÀÆ', 'ಳೂ'], ['¼ÀÈ', 'ಳೃ'], ['¼É', 'ಳೆ'], ['¼ÉÃ', 'ಳೇ'],
    ['¼ÉÊ', 'ಳೈ'], ['¼ÉÆ', 'ಳೊ'], ['¼ÉÆÃ', 'ಳೋ'], ['¼Ë', 'ಳೌ']
];

vowelMaps.forEach(m => A2U_MAP[m[0]] = m[1]);
consonantMaps.forEach(m => A2U_MAP[m[0]] = m[1]);

const A2U_KEYS = Object.keys(A2U_MAP).sort((a, b) => b.length - a.length);

const U2A_MAP = {};
Object.entries(A2U_MAP).forEach(([k, v]) => U2A_MAP[v] = k);

const VATTAKSHARA_MAP = {
    'Ì': 'ಕ್', 'Í': 'ಖ್', 'Î': 'ಗ್', 'Ï': 'ಘ್', 'Ð': 'ಙ್',
    'Ñ': 'ಚ್', 'Ò': 'ಛ್', 'Ó': 'ಜ್', 'Ô': 'ಝ್', 'Õ': 'ಞ್',
    'Ö': 'ಟ್', '×': 'ಠ್', 'Ø': 'ಡ್', 'Ù': 'ಢ್', 'Ú': 'ಣ್',
    'Û': 'ತ್', 'Ü': 'ಥ್', 'Ý': 'ದ್', 'Þ': 'ಧ್', 'ß': 'ನ್',
    'à': 'ಪ್', 'á': 'ಫ್', 'â': 'ಬ್', 'ã': 'ಭ್', 'ä': 'ಮ್',
    'å': 'ಯ್', 'æ': 'ರ್', 'è': 'ಲ್', 'é': 'ವ್', 'ê': 'ಶ್',
    'ë': 'ಷ್', 'ì': 'ಸ್', 'í': 'ಹ್', 'î': 'ಳ್'
};

const OTHER_MAP = {
    'ø': 'ೃ',
    'ñ': 'ೄ',
    '„': 'ಽ',
    'ó': '಼',
    'ð': 'ರ',
    'ï': '್'
};

const KN_DIGITS = ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'];
const EN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ASCII_VATTAKSHARA = "ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî";
const DEP_VOWELS = "್ಾಿೀುೂೃೆೇೈೊೋೌ";

function _encodeIdx(n) {
    let s = '';
    do { s = String.fromCharCode(97 + (n % 26)) + s; n = Math.floor(n / 26); } while (n > 0);
    return s;
}

function _decodeIdx(s) {
    let n = 0;
    for (const c of s) n = n * 26 + (c.charCodeAt(0) - 97);
    return n;
}

function _makePlaceholder(idx) {
    return '\uFF62' + _encodeIdx(idx) + '\uFF63';
}
const _placeholderRe = /\uFF62([a-z]+)\uFF63/g;

const LATIN_EXT_RE = /[\u00C0-\u00FF]/;
const PURE_ASCII_WORD_RE = /^[a-zA-Z'-]+$/;
const NUDI_SINGLE_UPPER = new Set(['A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z']);
const NUDI_SINGLE_LOWER = new Set(['a','b','c','d','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']);

// Uppercase letters that have standalone Nudi a2u mappings (not needing À/ï/É etc.)
const NUDI_A2U_STANDALONE = new Set(['A','B','C','D','E','F','G','H','J','K','L','M','N','Q','R','T','V','X','Y']);

// Common English uppercase words where every letter has a standalone Nudi a2u mapping.
// These should be retained as English rather than converted as Nudi.
const EN_UPPER_NUDI_CONFLICT = new Set([
    'AM','AN','AT','BE','BY','HE','MY',
    'AND','BAD','BAT','BED','BET','CAB','CAN','CAR','CAT','DAD',
    'EAT','ERA','FAR','FAT','FED','GAG','GAL','GET','HAD','HAT',
    'HEN','HER','JAB','JAG','JAM','JAR','JET','LAB','LAD','LAG',
    'LET','MAD','MAN','MAT','MEN','MET','NAG','NET','RAG','RAM',
    'RAN','RAT','RED','TAB','TAG','TAN','TAR','TAX','TED','TEN',
    'THE','VAN','VAT','VET','YAM','YEN','YET',
    'HTML','XML'
]);

function _isEnglishToken(token, fullText, tokenStart) {
    if (!PURE_ASCII_WORD_RE.test(token)) return false;
    if (LATIN_EXT_RE.test(token)) return false;
    if (token.length === 1) {
        if (NUDI_SINGLE_UPPER.has(token) || NUDI_SINGLE_LOWER.has(token)) return false;
        return false;
    }
    const charBefore = tokenStart > 0 ? fullText[tokenStart - 1] : '';
    const charAfter = tokenStart + token.length < fullText.length ? fullText[tokenStart + token.length] : '';
    if (LATIN_EXT_RE.test(charBefore) || LATIN_EXT_RE.test(charAfter)) return false;
    // All-uppercase short tokens where every char is a valid standalone Nudi a2u key
    // are likely Nudi ASCII encoding, not English words.
    if (token.length >= 2 && token.length <= 4 && token === token.toUpperCase()) {
        let allNudiStandalone = true;
        for (let i = 0; i < token.length; i++) {
            if (!NUDI_A2U_STANDALONE.has(token[i])) {
                allNudiStandalone = false;
                break;
            }
        }
        if (allNudiStandalone && !EN_UPPER_NUDI_CONFLICT.has(token)) {
            return false;
        }
    }
    return true;
}

function _replace_vattakshara(txt) {
    Object.entries(VATTAKSHARA_MAP).forEach(([k, v]) => {
        const baseConsonant = v.slice(0, -1);
        txt = txt.split(k).join(baseConsonant + '್');
    });
    Object.entries(OTHER_MAP).forEach(([k, v]) => {
        txt = txt.split(k).join(v);
    });
    return txt;
}

function _fix_conjuncts(txt) {
    let result = txt;
    result = result.replace(/([ಕ-ಹ])(್){2,}/g, '$1$2');
    return result;
}

function _a2u_deerga_handle(txt) {
    const ASCII_DEERGA = "Ã";
    return txt.replace(new RegExp(`([ೆೇೊ])([${ASCII_DEERGA}])`, 'g'), (match, g1, g2) => {
        const UNI_DEERGA_MAP = {'ೆ': 'ೇ', 'ೊ': 'ೋ'};
        return UNI_DEERGA_MAP[g1] || g1;
    });
}

function _replace_from_map(txt) {
    let result = txt;
    A2U_KEYS.forEach(key => {
        if (key.length > 0 && key !== 'ï') {
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, A2U_MAP[key]);
        }
    });
    return result;
}

function _a2u_post_process(txt) {
    return txt.replace(/É/g, 'ೆ');
}

function _replace_a2u_anuswara_visarga(txt) {
    return txt.replace(/A/g, 'ಂ').replace(/B/g, 'ಃ');
}

function asciiToUnicode(text, retainEnglish = false) {
    let result = text;
    const englishTexts = [];

    if (retainEnglish) {
        let out = '';
        let i = 0;
        while (i < result.length) {
            if (result[i] === '\uFF62') {
                let j = i + 1;
                while (j < result.length && result[j] !== '\uFF63') j++;
                out += result.slice(i, j + 1);
                i = j + 1;
                continue;
            }
            if (/[a-zA-Z]/.test(result[i])) {
                let j = i;
                while (j < result.length && /[a-zA-Z'-]/.test(result[j])) j++;
                const token = result.slice(i, j);
                if (_isEnglishToken(token, result, i)) {
                    const idx = englishTexts.length;
                    englishTexts.push(token);
                    out += _makePlaceholder(idx);
                } else {
                    out += token;
                }
                i = j;
            } else {
                out += result[i];
                i++;
            }
        }
        result = out;
    }

    const PLACEHOLDER_SPLIT = /(\uFF62[a-z]+\uFF63)/;
    const words = result.split(' ');
    const convertedWords = words.map(word => {
        if (word.length === 0) return word;
        const parts = word.split(PLACEHOLDER_SPLIT);
        const convertedParts = parts.map(part => {
            if (part.startsWith('\uFF62') && part.endsWith('\uFF63')) return part;
            if (part.length === 0) return part;
            let converted = part;
            
            converted = converted.replace(/([ೆೇೊ])([ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî])([ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî])([ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî])/g, '$2$3$4$1');
            converted = converted.replace(/([ೆೇೊ])([ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî])([ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî])/g, '$2$3$1');
            converted = converted.replace(/([ೆೇೊ])([ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî])/g, '$2$1');
            
            converted = _replace_from_map(converted);
            converted = _replace_vattakshara(converted);
            converted = _fix_conjuncts(converted);
            converted = converted.replace(/[0-9]/g, (d) => KN_DIGITS[parseInt(d)]);
            converted = _replace_a2u_anuswara_visarga(converted);
            converted = _a2u_deerga_handle(converted);
            converted = _a2u_post_process(converted);
            return converted;
        });
        return convertedParts.join('');
    });
    result = convertedWords.join(' ');

    if (retainEnglish && englishTexts.length > 0) {
        result = result.replace(_placeholderRe, (_, enc) => englishTexts[_decodeIdx(enc)]);
    }
    return result;
}

function unicodeToASCII(text) {
    let result = text;
    
    const ASCII_DEERGA = "Ã";
    const ASCII_VATT = "ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî";
    
    result = result.replace(new RegExp(`([ೆೇೊ])([${ASCII_VATT}])`, 'g'), '$2$1');
    
    const U2A_KEYS = Object.keys(U2A_MAP).sort((a, b) => b.length - a.length);
    U2A_KEYS.forEach(key => {
        if (key.length > 0) {
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, U2A_MAP[key]);
        }
    });
    
    result = result.split('್').join('ï');
    result = result.replace(/[೦-೯]/g, (c) => EN_DIGITS['೦೧೨೩೪೫೬೭೮೯'.indexOf(c)]);
    
    return result;
}

function convertNumbers(text, mode) {
    if (mode === 'keep') return text;
    if (mode === 'kn') {
        EN_DIGITS.forEach((d, i) => { text = text.split(d).join(KN_DIGITS[i]); });
    } else if (mode === 'en') {
        KN_DIGITS.forEach((d, i) => { text = text.split(d).join(EN_DIGITS[i]); });
    }
    return text;
}

function convert(text, numFormat, direction, retainEnglish = false) {
    let result;
    if (direction === 'a2u') {
        result = asciiToUnicode(text, retainEnglish);
    } else {
        result = unicodeToASCII(text);
    }
    result = convertNumbers(result, numFormat);
    return result;
}

// ============================================================
// API ROUTES
// ============================================================

// Convert text API
app.post('/api/convert', (req, res) => {
    try {
        const { text, numFormat = 'keep', direction = 'auto', retainEnglish = false } = req.body;
        
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Invalid text input' });
        }

        let dir = direction;
        if (direction === 'auto') {
            const unicodeCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
            const asciiKnCount = (text.match(/[À-ÿøñð]/g) || []).length;
            dir = (unicodeCount > asciiKnCount) ? 'u2a' : 'a2u';
        }

        const result = convert(text, numFormat, dir, retainEnglish);

        // Store conversion in memory
        const id = uuidv4();
        const conversion = {
            id,
            originalText: text,
            convertedText: result,
            direction: dir,
            numFormat,
            timestamp: new Date().toISOString(),
            ip: req.ip
        };
        conversions.set(id, conversion);

        res.json({
            success: true,
            result,
            direction: dir,
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
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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