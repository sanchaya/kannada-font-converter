// ============================================================
// FRONTEND APPLICATION - Client-side conversion for GitHub Pages
// ============================================================

let convertedText = '';
let fileText = '';
let fileName = '';

// ============================================================
// NUDI/BARAHA ASCII TO UNICODE MAPPING (Client-side)
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

// ============================================================
// APPLY MAPPINGS
// ============================================================

vowelMaps.forEach(m => A2U_MAP[m[0]] = m[1]);
consonantMaps.forEach(m => A2U_MAP[m[0]] = m[1]);

const A2U_KEYS = Object.keys(A2U_MAP).sort((a, b) => b.length - a.length);

// ShreeLipi, Prakashak, Akruti, and Surabhi are handled by the pivot-based
// engine further below (ported from the KGP macro tables - see
// tools/MACRO-REVIEW.md), not by flat maps here.

const VATTAKSHARA_MAP = {
    'Ì': 'ಕ್', 'Í': 'ಖ್', 'Î': 'ಗ್', 'Ï': 'ಘ್', 'Ð': 'ಙ್',
    'Ñ': 'ಚ್', 'Ò': 'ಛ್', 'Ó': 'ಜ್', 'Ô': 'ಝ್', 'Õ': 'ಞ್',
    'Ö': 'ಟ್', '×': 'ಠ್', 'Ø': 'ಡ್', 'Ù': 'ಢ್', 'Ú': 'ಣ್',
    'Û': 'ತ್', 'Ü': 'ಥ್', 'Ý': 'ದ್', 'Þ': 'ಧ್', 'ß': 'ನ್',
    'à': 'ಪ್', 'á': 'ಫ್', 'â': 'ಬ್', 'ã': 'ಭ್', 'ä': 'ಮ್',
    'å': 'ಯ್', 'æ': 'ರ್', 'è': 'ಲ್', 'é': 'ವ್', 'ê': 'ಶ್',
    'ë': 'ಷ್', 'ì': 'ಸ್', 'í': 'ಹ್', 'î': 'ಳ್'
};

const VATT_MARKER = '\u0001';

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
    // Lowercase consonant code + anusvara/visarga code (dA=ಜಂ, kB=ಞಃ, ...)
    // is Nudi encoding, not an English word.
    if (/^[a-z][AB]$/.test(token)) return false;
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
    // Subjoined (vattakshara) consonants are emitted with a U+0001 marker
    // instead of a bare halant so _fix_conjuncts can reorder them into
    // proper conjuncts (base + ್ + consonant) without touching genuine
    // word-final halants like ನನ್.
    Object.entries(VATTAKSHARA_MAP).forEach(([k, v]) => {
        const baseConsonant = v.slice(0, -1);
        txt = txt.split(k).join(VATT_MARKER + baseConsonant);
    });
    Object.entries(OTHER_MAP).forEach(([k, v]) => {
        txt = txt.split(k).join(v);
    });
    return txt;
}

function _fix_conjuncts(txt) {
    let result = txt;
    // Reorder vattakshara markers into conjuncts. In Nudi the subscript
    // consonant is typed after the base akshara (including its vowel sign):
    //   PÀå  = ಕ + [ya-vattu]      -> ಕ್ಯ
    //   QÌ   = ಕಿ + [ka-vattu]     -> ಕ್ಕಿ
    // i.e. base + matra? + C  ->  base + ್ + C + matra
    // Repeated to resolve chains (base + two vattus -> triple conjunct).
    const re = new RegExp('([ಕ-ಹೞ])([ಾಿೀುೂೃೄೆೇೈೊೋೌ]?)' + VATT_MARKER + '([ಕ-ಹೞ])');
    while (re.test(result)) {
        result = result.replace(new RegExp(re.source, 'g'), '$1್$3$2');
    }
    // Any marker left without a preceding base falls back to a plain halant
    result = result.replace(new RegExp(VATT_MARKER, 'g'), '್');
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

// ============================================================
// PIVOT-BASED FONT MAPPINGS
// Ported from the KGP Word-macro rule tables (tools/macro-extracts/*.json;
// see tools/MACRO-REVIEW.md). Each source encoding is substituted
// byte-by-byte into Nudi ASCII fragments, then run through the existing,
// well-tested Nudi <-> Unicode engine defined in this file:
//   a2u:  X --charmap-->                Nudi ASCII --asciiToUnicode(nudi)--> Unicode
//   u2a:  Unicode --unicodeToASCII(nudi)--> Nudi ASCII --charmap(inverse)--> X
// A handful of macro rules performed true cursor-based reordering rather
// than a per-byte substitution; those byte codes are intentionally left
// out of the maps below (pass through unchanged) - see tools/pivot-maps.generated.js
// for full per-font coverage notes (regenerate with tools/generate-pivot-maps.py).
// ============================================================

const PRAKASH2_X2NUDI = {33:"C",34:"\u00c4",35:"E",36:"F",37:"G",38:"H",39:"\u00a5",40:"J",41:"K",42:"L",43:"M",44:"\u00e1",45:"\u00f6",46:"\u00d4",47:"B",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",58:"v",59:"z",60:"\u00a3",61:"\u00a5",63:"\u00af",64:"t\u00c2",65:"\u00aa",66:"\u00b1",67:"\u00b5",68:"\u00b8",69:"\u00ba",70:"e\u00d5",71:"R",72:"Y",73:"d",74:"k",75:"l",76:"t",77:"I",78:"\u00a7",79:"Ai\u00c0",80:"\u00ae",81:"d\u00d5",82:"Q",83:"T",84:"V",85:"a",86:"\u00bf",87:"f",88:"n",89:"j",90:"r",91:"\u00fe",92:"w",93:"\u00a2",94:"\u00a4",95:"\u00a6",96:"\u00c9\u00c3",97:"\u00ab",98:"\u00b0",99:"\u00b6",100:"\u00b9",101:"\u00bb",102:"\u00bd",103:"f\u00a9",104:"\u00ac",105:"\u00b2",108:"s",110:"\u2039",111:"\u00c1",112:"\u00c2",113:"D",114:"\u00c6",115:"h",116:"i\u00c1",117:"\u00c9",118:"\u00a9",119:"\u00f5\u00c9",120:"\u00cc",121:"\u00f1",122:"\u00cb",123:"i",124:"\u00c3",125:"\u00ef",126:"\u00f0",127:"\u007f",128:"\u20ac",129:"\ufffd",130:"\u201a",131:"\u0192",132:"\u00f6",133:"\u00f6",134:"\u00d8",136:"\u02c6",137:"\u00db",138:"\u00dd",139:"\u00df",140:"\u00e0",141:"\ufffd",142:"\u017d",143:"\ufffd",144:"\ufffd",145:"\u00e1",146:"\u00e2",147:"\u00f9",148:"\u00fa",149:"\u2022",150:"\u00bf",151:"\u00be",152:"\u02dc",153:"\u2122",154:"\u00e8",155:"\u00eb",156:"\u00ec",157:"\ufffd",158:"\u017e",159:"\u0178",160:"\u00c9\u00c6",161:"\u00cd",162:"\u00ce",163:"\u00cf",164:"\u00d0",165:"\u00d1",166:"\u00f6",167:"\u00d3",168:"\u00f6",169:"\u00d5",170:"\u00d6",171:"\u00d7",172:"\u00ad",173:"\u00ad",174:"\u00da",175:"\u00f6",176:"\u00dc",177:"\u00f9",178:"\u00fa",179:"\u00bf",180:"\u00be",181:"\u00f6",182:"\u00e4",183:"\u00db\u00e5",184:"\u00db\u00e6",185:"\u00f6",186:"\u00e9",187:"\u00ea",188:"\u00f6",189:"\u00f6",190:"\u00f6",191:"\u00ee",192:"\u00ed",194:"\u00cc\u00f8",195:"\u00e2\u00ca",196:"\u00d6\u00e6",197:"\u00db\u00c8",198:"\u00db\u00ca",199:"\u00e5",200:"\u00e7",201:"\u00e0\u00e6",202:"\u00e6\u00c8",203:"\u00ec\u00e6",204:"\u00cc\u00eb",205:"\u00cc\u00e6",206:"\u00c9",207:"A\u00c9hi",208:"\u00f6",210:"Ai\u00c9",211:"P",212:"U",213:"W",214:"Z",215:"\u00f6",216:"e",217:"m",218:"g",219:"q",220:"u",221:"\u00f6",222:"\u00f6",223:"\u00f6",224:"A",225:"\u00b2\u00e6",226:"\u00c8",227:"\u00ca",228:",",229:".",230:"\u00a8",231:"\u00f2",232:"\u00bc",233:"\u00db\u00e6",234:"\u00db\u00e5",235:"\u00eb",237:"\u00a5s",238:"S",239:"\u00f7",240:"\u00f7",241:"\u00f7",242:"O",243:"\u00f6",244:"\u00f7",245:"\u00f6",246:"X",247:"\u00f6",248:"N",249:"P\u00c0",250:"P\u00c9",252:"b",253:"\u00f6",254:"\u00fe"};
const AKRUTI2_X2NUDI = {32:" ",33:"!",34:"\u00cc",35:"\u00cd",36:"\u00ce",37:"C",38:"\u00cf",39:"'",40:"(",41:")",42:"\u00d0",43:"\u00d1",44:",",46:".",47:"/",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",58:":",59:";",60:"\u00f7",61:"=",62:"\u00f7",63:"?",64:"\u00d3",65:"D",66:"\u00d4",67:"\u00d5",68:"\u00d6",69:"E",70:"\u00d7",71:"\u00d8",72:"\u00d9",73:"L",74:"\u00da",75:"\u00db",76:"\u00dc",77:"\u00dd",78:"H",79:"K",80:"\u00de",81:"\u00df",82:"\u00e0",83:"\u00e1",84:"\u00e2",85:"J",86:"\u00e3",87:"\u00e4",88:"\u00e5",89:"L",90:"\u00e6",91:"\u00e8",92:"\u00ee",93:"\u00e9",94:"\u00ea",95:"\u00eb",96:"`",97:"M",98:"\u00ec",99:"\u00ed",100:"P",101:"N",102:"S",103:"U",104:"W",105:"O",106:"Y",107:"Z",108:"b",109:"d",110:"I",111:"F",112:"g",113:"k",114:"l",115:"n",116:"o",117:"e",118:"q",120:"t",121:"v",122:"x",123:"z",125:"\u00a3",126:"\u00a5",160:"\u00a0",161:"\u00bf",162:"\u00be",163:"\u00f5",165:"\u0160",166:"\u00db\u00e5",167:"\u00db\u00c8",168:"\u00db\u00e5",169:"\u00c3",170:"0",172:"\u00a2",174:"\u00db\u00e9",175:"\u00a6",176:"\u00c4",177:"\u00a7",178:"\u00a9",179:"\u00c6",180:"W",181:"\u00b1",182:"\u00b0",183:"\u00ae",184:"\u00b6",185:"t\u00c2",187:"w",188:"y",190:"\u00a4",191:"\u00f2",192:"\u00aa",194:"m",195:"i",196:"\u00a6",198:"\u00ab",199:"u",200:"\u00af",201:"\u00b8",202:"f",203:"\u00f0",204:"Ai",205:"\u00b5",206:"\u00ac",207:"\u00a8",208:"V",209:"Q",210:"\u00ef",211:"c",212:"\u00bc",214:"\u00c1",215:"a",216:"T",217:"R",218:"r",220:"X",221:"\u00ba",222:"\u00b2\u00e6",223:"\u00e0\u00e7",224:"\u00fa",225:"\u00f9",226:"\u00c0",227:"\u00f1",228:"a",229:"\u00d6\u00e7",230:"\u00e1",231:"\u00db\u00e6",232:"\u00db\u00ca",233:"|",234:"\u00c9",235:"\u00e6\u00f8",236:"\u00cc\u00c8",238:"j",239:"p",240:"\u00f4",241:"\u00cb",242:"\u00c7",243:"\u00c5",244:"\u00ca",245:"\u0160",246:"\u0160",247:"\u00e7",248:"\u00cc",249:"\u00bd",250:"\u00b2",251:"\u00b9",252:"\u00fc",253:"\u00bb",254:"\u00bb"};
const SHREE2_X2NUDI = {32:" ",33:"!",34:"`",36:" ",37:"%",38:"-",39:"'",40:"(",41:")",42:"*",43:"+",44:",",46:".",47:"/",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",58:":",59:";",61:"=",62:"\u2020",63:"?",64:"B",65:"C",66:"D",67:"E",68:"F",69:"G",70:"H",71:"J",72:"K",73:"L",74:"M",75:"N",76:"O",77:"I",78:"W\u00c9",79:"u",80:"P",81:"Q",82:"\u00cc",83:"R",84:"S",85:"T",86:"\u00cd",87:"U",88:"V",89:"\u00ce",90:"W\u00c0",91:"W",92:"X",93:"\u00b2\u00e6",94:"\u00cf",95:"Y",96:"\u00d0",97:"Z",98:"a",99:"\u00d1",100:"b",101:"c",102:"\u00d2",103:"d",104:"e",105:"f",106:"\u00d3",107:"h",108:"\u00d4",109:"k",110:"\u00d5",111:"l",112:"m",113:"n",114:"\u00d6",115:"o",116:"p",117:"\u00d7",118:"q",119:"r",120:"\u00d8",121:"qs",122:"\u00d9",123:"rs",124:"t",125:"\u00f2",126:"t\u00c2",130:"\u00f3",131:"\u00c8",132:"\u00ca",133:"\u00ef",134:"\u00e7",135:"\u2020",136:"\u2021",137:"\u2026",138:"/",139:"\u00e6",141:"*",145:"\u00bf",146:"\u00bf",147:"\u00be",148:"\u00be",149:"\u00f9",150:"\u00e1",151:"\u00a2s",152:"\u201e",153:"\u0152",154:"\u0152",155:"\u00e6",156:"\u00de",159:"\u00a7",160:"\u0152",161:"\u00da",162:"\u00cc\u00c8",163:"w",164:"\u00db",165:"x",166:"y",167:"\u00dc",168:"z",169:"\u00a2",170:"\u00dd",171:"zs",172:"_",174:"\u00a3",175:"\u00a4",176:"\u00df",177:"\u00a5",178:"\u00a6",179:"\u00e0",180:"\u00a5s",181:"\u00a6s",182:"_",184:"\u00a8",185:"\u00a9",186:"\u00e2",187:"\u00a8s",188:"\u00a9s",189:"\u00e3",190:"\u00e4",191:"Ai\u00c0",192:"\u00ac",193:"A\u00c4\u00c9",194:"\u00e5",195:"g",196:"j",197:"\u00e6",198:"\u00ae",199:"\u00af",200:"\u00b0",201:"\u00e8",202:"\u00aa",203:"\u00ab",204:"\u00e9",205:"\u00b1",206:"\u00b2",207:"\u00ea",208:"\u00b5",209:"\u00b6",210:"\u00eb",211:"\u00b8",212:"\u00b9",213:"\u00ec",214:"\u00ba",215:"\u00bb",216:"\u00ed",217:"\u00bc",218:"\u00bd",219:"\u00ee",220:"\u00c0",221:"\u00c1",222:"\u00c4\u00c1",223:"\u00c2",224:"\u00c3",225:"\u00c4",227:"\u00c6",229:"\u00c4",230:"\u00c9",231:"\u00ca",232:"\u00cb",233:"\u00e5",234:"\u00c8",235:"\u00f1",236:"\u00f0",237:"A",238:"\u00f5",239:"\u00f5\u00c9",240:"\u00cc\u00e6",241:"v",242:"\u00d1\u00ca",243:"\u00d6\u00e7",244:"\u00db\u00ca",245:"\u00db\u00f8",246:"\u00db\u00e5",247:"\u00db\u00e6",248:"\u00e0\u00e6",249:"\u00e6\u00ca",250:"\u00ec\u00e6",251:"P\u00eb",252:"Q\u00eb",253:"d\u00d5",254:"e\u00d5"};
const SURABHI_X2NUDI = {32:" ",33:"!",34:"'",35:"#",36:"\u00b2\u00e7",37:"%",38:"&",39:"`",40:"(",41:")",42:"*",43:"+",44:",",45:"-",46:".",47:"/",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:":",58:":",59:";",60:"<",61:"=",62:">",63:"?",64:"0",65:"1",66:"2",67:"3",68:"4",69:"5",70:"6",71:"7",72:"8",73:"9",74:"C",75:"D",76:"E",77:"F",78:"G",79:"H",80:"I",81:"J",82:"K",83:"L",84:"M",85:"N",86:"O",87:"A",88:"B",89:"P",90:"Q",91:"\u00cc",92:"\u00cc\u00e6",93:"R",94:"S",95:"T",96:"\u00cd",97:"U",98:"V",99:"\u00ce",100:"W",101:"X",102:"\u00cf",103:"Y",104:"\u00d0",105:"Z",106:"a",107:"\u00d1",108:"b",109:"c",110:"\u00d2",111:"d",112:"e",113:"f",114:"\u00d3",115:"\u00d4",116:"k",117:"\u00d5",118:"l",119:"m",120:"n",121:"\u00d6",122:"\u00d6\u00e7",123:"o",124:"p",125:"\u00d7",126:"q",160:"\u00f2",161:"r",162:"\u00d8",163:"qs",164:"rs",165:"\u00d9",166:"t",167:"u",168:"t\u00c2",169:"\u00da",170:"\u00db",171:"v",172:"w",174:"\u00db\u00f8",175:"\u00db\u00ca",176:"\u00db\u00e5",177:"\u00db\u00e7",178:"x",179:"y",180:"\u00dc",181:"z",182:"\u00a2",183:"\u00dd",184:"zs",185:"\u00a2s",186:"\u00de",187:"\u00a3",188:"\u00a4",189:"\u00df",190:"\u00a5",191:"\u00a6",192:"\u00e0",193:"\u00e0\u00e6",194:"\u00a5s",195:"\u00a6s",196:"\u00e1",197:"\u00a7",198:"\u00a8",199:"\u00a9",200:"\u00e2",201:"\u00a8s",202:"\u00a9s",203:"\u00e3",204:"\u00e4",205:"A\u00c4",206:"\u00ac",207:"\u00e5",208:"g",209:"j",210:"\u00e7",211:"\u00f0",212:"\u00ae",213:"\u00af",214:"\u00b0",215:"\u00e8",216:"\u00aa",217:"\u00ab",218:"\u00e9",219:"\u00bf",220:"\u00fa",221:"\u00b1",222:"\u00b2",223:"\u00ea",224:"\u00b5",225:"\u00b6",226:"\u00eb",227:"\u00b8",228:"\u00b9",229:"\u00ec",230:"\u00ba",231:"\u00bb",232:"\u00ed",233:"\u00bc",234:"\u00bd",235:"\u00ee",236:"\u00be",237:"\u00f9",238:"\u00fc",239:"\u00c0",240:"\u00c4",241:"\u00f5",242:"\u00c1",243:"\u00c2",244:"\u00c3",245:"\u00c4",246:"\u00c5",247:"\u00c6",248:"\u00c7",249:"\u00c8",250:"\u00f1",251:"\u00c9",252:"\u00ca",253:"\u00cb",254:"\u00ef"};

function _buildNudi2XInverse(x2nudiMap) {
    const inverse = {};
    Object.keys(x2nudiMap).forEach(codeStr => {
        const frag = x2nudiMap[codeStr];
        if (frag && !(frag in inverse)) {
            inverse[frag] = String.fromCharCode(Number(codeStr));
        }
    });
    return { map: inverse, keys: Object.keys(inverse).sort((a, b) => b.length - a.length) };
}

const _nudi2xCache = new Map();
function _nudi2xFor(x2nudiMap) {
    if (!_nudi2xCache.has(x2nudiMap)) {
        _nudi2xCache.set(x2nudiMap, _buildNudi2XInverse(x2nudiMap));
    }
    return _nudi2xCache.get(x2nudiMap);
}

// Extracts Latin-letter/number runs into placeholders (same heuristic as
// the Nudi retainEnglish path) so they skip the pivot substitution and the
// downstream Nudi engine entirely.
function _extractEnglishTokens(text) {
    const englishTexts = [];
    let out = '';
    let i = 0;
    while (i < text.length) {
        if (text[i] === '\uFF62') {
            let j = i + 1;
            while (j < text.length && text[j] !== '\uFF63') j++;
            out += text.slice(i, j + 1);
            i = j + 1;
            continue;
        }
        if (/[a-zA-Z]/.test(text[i])) {
            let j = i;
            while (j < text.length && /[a-zA-Z'-]/.test(text[j])) j++;
            const token = text.slice(i, j);
            if (_isEnglishToken(token, text, i)) {
                const idx = englishTexts.length;
                englishTexts.push(token);
                out += _makePlaceholder(idx);
            } else {
                out += token;
            }
            i = j;
        } else if (/[0-9]/.test(text[i])) {
            let j = i;
            while (j < text.length && /[0-9]/.test(text[j])) {
                j++;
                if (j < text.length - 1 && /[.,:]/.test(text[j]) && /[0-9]/.test(text[j + 1])) j++;
            }
            const numToken = text.slice(i, j);
            const before = i > 0 ? text[i - 1] : '';
            const after = j < text.length ? text[j] : '';
            const adjacentToCode = /[a-zA-ZÀ-ÿĀ-ſ]/.test(before) || /[a-zA-ZÀ-ÿĀ-ſ]/.test(after);
            if (!adjacentToCode) {
                const idx = englishTexts.length;
                englishTexts.push(numToken);
                out += _makePlaceholder(idx);
            } else {
                out += numToken;
            }
            i = j;
        } else {
            out += text[i];
            i++;
        }
    }
    return { text: out, englishTexts };
}

function _restoreEnglishTokens(text, englishTexts) {
    if (!englishTexts.length) return text;
    return text.replace(_placeholderRe, (_, enc) => englishTexts[_decodeIdx(enc)]);
}

function pivotAsciiToUnicode(text, x2nudiMap, retainEnglish) {
    let source = text;
    let englishTexts = [];
    if (retainEnglish) {
        const extracted = _extractEnglishTokens(source);
        source = extracted.text;
        englishTexts = extracted.englishTexts;
    }
    let nudi = '';
    let i = 0;
    while (i < source.length) {
        if (source[i] === '\uFF62') {
            let j = i + 1;
            while (j < source.length && source[j] !== '\uFF63') j++;
            nudi += source.slice(i, j + 1);
            i = j + 1;
            continue;
        }
        const code = source.charCodeAt(i);
        nudi += (code in x2nudiMap) ? x2nudiMap[code] : source[i];
        i++;
    }
    let result = asciiToUnicode(nudi, false, 'nudi');
    if (englishTexts.length) result = _restoreEnglishTokens(result, englishTexts);
    return result;
}

function pivotUnicodeToAscii(text, x2nudiMap) {
    const extracted = _extractEnglishTokens(text);
    const nudiAscii = unicodeToASCII(extracted.text, 'nudi');
    const { map: nudi2x, keys } = _nudi2xFor(x2nudiMap);
    let result = '';
    let i = 0;
    outer:
    while (i < nudiAscii.length) {
        if (nudiAscii[i] === '\uFF62') {
            let j = i + 1;
            while (j < nudiAscii.length && nudiAscii[j] !== '\uFF63') j++;
            result += nudiAscii.slice(i, j + 1);
            i = j + 1;
            continue;
        }
        for (const key of keys) {
            if (key.length && nudiAscii.startsWith(key, i)) {
                result += nudi2x[key];
                i += key.length;
                continue outer;
            }
        }
        result += nudiAscii[i];
        i++;
    }
    if (extracted.englishTexts.length) result = _restoreEnglishTokens(result, extracted.englishTexts);
    return result;
}

function shree2ToUnicode(text, retainEnglish = false) {
    return pivotAsciiToUnicode(text, SHREE2_X2NUDI, retainEnglish);
}
function unicodeToShree2(text) {
    return pivotUnicodeToAscii(text, SHREE2_X2NUDI);
}
function prakashak2ToUnicode(text, retainEnglish = false) {
    return pivotAsciiToUnicode(text, PRAKASH2_X2NUDI, retainEnglish);
}
function unicodeToPrakashak2(text) {
    return pivotUnicodeToAscii(text, PRAKASH2_X2NUDI);
}
function akruti2ToUnicode(text, retainEnglish = false) {
    return pivotAsciiToUnicode(text, AKRUTI2_X2NUDI, retainEnglish);
}
function unicodeToAkruti2(text) {
    return pivotUnicodeToAscii(text, AKRUTI2_X2NUDI);
}
function surabhiToUnicode(text, retainEnglish = false) {
    return pivotAsciiToUnicode(text, SURABHI_X2NUDI, retainEnglish);
}
function unicodeToSurabhi(text) {
    return pivotUnicodeToAscii(text, SURABHI_X2NUDI);
}

function asciiToUnicode(text, retainEnglish = false, fontType = 'nudi') {
    if (fontType === 'shree') {
        return shree2ToUnicode(text, retainEnglish);
    }
    if (fontType === 'prakashak') {
        return prakashak2ToUnicode(text, retainEnglish);
    }
    if (fontType === 'akruti') {
        return akruti2ToUnicode(text, retainEnglish);
    }
    if (fontType === 'surabhi') {
        return surabhiToUnicode(text, retainEnglish);
    }

    // Nudi files decoded from windows-1252 contain MICRO SIGN (U+00B5) for ಷ,
    // while the mapping tables use GREEK SMALL MU (U+03BC). The two glyphs are
    // visually identical; normalize so both convert correctly.
    let result = text.replace(/µ/g, 'μ');
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
            } else if (/[0-9]/.test(result[i])) {
                // Standalone number runs (e.g. "123", "3.14") are kept as-is;
                // digits directly adjacent to encoding bytes/letters are part
                // of the ASCII encoding and stay convertible.
                let j = i;
                while (j < result.length && /[0-9]/.test(result[j])) {
                    j++;
                    if (j < result.length - 1 && /[.,:]/.test(result[j]) && /[0-9]/.test(result[j + 1])) j++;
                }
                const numToken = result.slice(i, j);
                const before = i > 0 ? result[i - 1] : '';
                const after = j < result.length ? result[j] : '';
                const adjacentToCode = /[a-zA-ZÀ-ÿĀ-ſ]/.test(before) ||
                                       /[a-zA-ZÀ-ÿĀ-ſ]/.test(after);
                if (!adjacentToCode) {
                    const idx = englishTexts.length;
                    englishTexts.push(numToken);
                    out += _makePlaceholder(idx);
                } else {
                    out += numToken;
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

function convertNumbers(text, mode) {
    if (mode === 'keep') return text;
    if (mode === 'kn') {
        EN_DIGITS.forEach((d, i) => { text = text.split(d).join(KN_DIGITS[i]); });
    } else if (mode === 'en') {
        KN_DIGITS.forEach((d, i) => { text = text.split(d).join(EN_DIGITS[i]); });
    }
    return text;
}

function convert(text, numFormat, direction, retainEnglish = false, fontType = 'nudi') {
    let result;
    if (direction === 'a2u' || direction === 'auto') {
        result = asciiToUnicode(text, retainEnglish, fontType);
    } else if (direction === 'u2a') {
        result = unicodeToASCII(text, fontType);
    } else {
        result = text;
    }
    result = convertNumbers(result, numFormat);
    return result;
}

// Unicode to ASCII conversion
function unicodeToASCII(text, fontType = 'nudi') {
    let result = text;
    
    if (fontType === 'shree') {
        return unicodeToShree2(text);
    }
    if (fontType === 'prakashak') {
        return unicodeToPrakashak2(text);
    }
    if (fontType === 'akruti') {
        return unicodeToAkruti2(text);
    }
    if (fontType === 'surabhi') {
        return unicodeToSurabhi(text);
    }
    
    const ASCII_DEERGA = "Ã";
    const ASCII_VATT = "ÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæèéêëìíî";
    
    // Handle vowel signs with vattakshara reordering
    result = result.replace(new RegExp(`([ೆೇೊ])([${ASCII_VATT}])`, 'g'), '$2$1');
    
    // Build reverse mapping
    const U2A_MAP = {};
    Object.entries(A2U_MAP).forEach(([k, v]) => U2A_MAP[v] = k);
    
    // Sort by length (longest first) - explicit comparator needed for Unicode
    const U2A_KEYS = Object.keys(U2A_MAP).sort((a, b) => b.length - a.length);
    
    // Replace using regex to handle overlapping matches properly
    for (const key of U2A_KEYS) {
        if (key.length > 0) {
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, U2A_MAP[key]);
        }
    }
    
    // Replace halant
    result = result.split('್').join('ï');

    // Convert numbers
    result = result.replace(/[೦-೯]/g, (c) => EN_DIGITS['೦೧೨೩೪೫೬೭೮೯'.indexOf(c)]);

    // Emit MICRO SIGN (U+00B5, valid windows-1252) instead of GREEK SMALL MU
    // (U+03BC) so the ASCII output is byte-accurate for legacy Nudi tools.
    result = result.replace(/μ/g, 'µ');

    return result;
}

// ============================================================
// TAB SWITCHING
// ============================================================
function switchTab(id, btn) {
    document.querySelectorAll('.tab-pane-custom').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tabs-custom .nav-link').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
    if (id === 'tab-live') {
        setTimeout(function() {
            var el = document.getElementById('live-source');
            if (!el) return;
            el.focus();
            // Apply whichever keyboard is chosen in the visible dropdown
            if (typeof window.applyLiveKeyboard === 'function') {
                window.applyLiveKeyboard();
            }
        }, 250);
    }
}

// ============================================================
// FILE HANDLING
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    
    if (!dropzone || !fileInput) return;
    
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { 
        if (e.target.files.length > 0) handleFile(e.target.files[0]); 
    });
});

// ============================================================
// TEXT CONVERSION (Client-side for GitHub Pages)
// ============================================================
function convertText() {
    try {
        const text = document.getElementById('input-text').value;
        if (!text.trim()) {
            showToast('ದಯವಿಟ್ಟು ಪಠ್ಯವನ್ನು ಅಂಟಿಸಿ', 'error');
            return;
        }

        const numFormat = document.getElementById('number-format').value;
        const retainEl = document.getElementById('retain-english');
        const retainEnglish = retainEl ? retainEl.checked : false;
        let direction = document.getElementById('convert-direction').value;
        let fontType = document.getElementById('font-type').value;

        // Auto-detect font type
        if (fontType === 'auto') {
            const textLower = text.toLowerCase();
            const shreeIndicators = ['pü', 'wü', 'ñü', '±ü', 'êüá'];
            const hasShree = shreeIndicators.some(indicator => text.includes(indicator.toLowerCase()) || text.includes(indicator));
            fontType = hasShree ? 'shree' : 'nudi';
        }

        // Auto-detect direction
        if (direction === 'auto') {
            const unicodeCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
            const asciiKnCount = (text.match(/[À-ÿøñð]/g) || []).length;
            direction = (unicodeCount > asciiKnCount) ? 'u2a' : 'a2u';
        }

        convertedText = convert(text, numFormat, direction, retainEnglish, fontType);
        document.getElementById('output-text').value = convertedText;
        document.getElementById('out-char-count').textContent = convertedText.length + ' ಅಕ್ಷರ';
        showToast('ಪರಿವರ್ತನೆ ಯಶಸ್ವಿಯಾಗಿದೆ', 'success');
    } catch(e) {
        console.error(e);
        showToast('ದೋಷ: ' + e.message, 'error');
    }
}

// ============================================================
// DETECT INPUT TYPE
// ============================================================
var _inputTextEl = document.getElementById('input-text');
if (_inputTextEl) _inputTextEl.addEventListener('input', function() {
    const text = this.value;
    document.getElementById('char-count').textContent = text.length + ' ಅಕ್ಷರ';
    
    if (text.length > 0) {
        const hasUnicode = /[\u0C80-\u0CFF]/.test(text);
        const hasASCII = /[À-ÿøñð]/.test(text);
        
        const badge = document.getElementById('detect-badge');
        const textSpan = document.getElementById('detect-text');
        badge.className = 'info-badge py-1 px-2';
        
        if (hasUnicode && !hasASCII) {
            badge.classList.add('badge-unicode');
            textSpan.textContent = 'Unicode ಕನ್ನಡ';
        } else if (hasASCII) {
            badge.classList.add('badge-ascii');
            textSpan.textContent = 'ASCII ನುಡಿ/ಬರಹ';
        } else {
            badge.classList.add('badge-unknown');
            textSpan.textContent = 'ಪತ್ತೆ ಆಗಿಲ್ಲ';
        }
    } else {
        document.getElementById('detect-badge').className = 'info-badge badge-unknown py-1 px-2';
        document.getElementById('detect-text').textContent = 'ಪತ್ತೆ ಆಗಿಲ್ಲ';
    }
});

function clearText() {
    document.getElementById('input-text').value = '';
    document.getElementById('output-text').value = '';
    document.getElementById('char-count').textContent = '0 ಅಕ್ಷರ';
    document.getElementById('out-char-count').textContent = '';
    convertedText = '';
    document.getElementById('detect-badge').className = 'info-badge badge-unknown py-1 px-2';
    document.getElementById('detect-text').textContent = 'ಪತ್ತೆ ಆಗಿಲ್ಲ';
}

function copyOutput() {
    if (!convertedText) { showToast('ಮೊದಲು ಪರಿವರ್ತಿಸಿ', 'error'); return; }
    navigator.clipboard.writeText(convertedText).then(() => {
        showToast('ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ಕಾಪಿ ಆಗಿದೆ', 'success');
    });
}

function downloadOutput(format) {
    if (!convertedText) {
        showToast('ಮೊದಲು ಪರಿವರ್ತಿಸಿ', 'error');
        return;
    }
    
    const blob = new Blob([convertedText], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'converted.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('ಡೌನ್ಲೋಡ್ ಶುರುವಾಗಿದೆ', 'success');
}

// ============================================================
// FILE HANDLING
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    
    if (!dropzone || !fileInput) return;
    
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { 
        if (e.target.files.length > 0) handleFile(e.target.files[0]); 
    });
});

function handleFile(f) {
    fileName = f.name;
    const ext = f.name.split('.').pop().toLowerCase();
    
    if (!['txt', 'docx'].includes(ext)) {
        showToast('TXT ಅಥವಾ DOCX ಫೈಲ್ ಮಾತ್ರ ಬೆಂಬಲಿತ', 'error');
        return;
    }
    
    document.getElementById('file-name').textContent = f.name;
    document.getElementById('file-size').textContent = formatBytes(f.size);
    
    if (ext === 'docx') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mammothLib = typeof mammoth !== 'undefined' ? mammoth : (typeof window.mammoth !== 'undefined' ? window.mammoth : null);
            console.log('Mammoth available:', !!mammothLib, typeof mammothLib);
            if (!mammothLib) {
                showToast('DOCX library not loaded. Please refresh the page.', 'error');
                return;
            }
            if (typeof mammothLib.extractRawText !== 'function') {
                console.error('extractRawText not found. Available methods:', Object.keys(mammothLib));
                showToast('DOCX library invalid. Please try TXT files or refresh.', 'error');
                return;
            }
            mammothLib.extractRawText({ arrayBuffer: e.target.result })
                .then(function(result) {
                    fileText = result.value;
                    showFileInfo();
                })
                .catch(function(err) {
                    console.error(err);
                    showToast('DOCX ಓದುವುದು ವಿಫಲ: ' + err.message, 'error');
                });
        };
        reader.readAsArrayBuffer(f);
    } else {
        const reader = new FileReader();
        reader.onload = function(e) {
            fileText = e.target.result;
            showFileInfo();
        };
        reader.readAsText(f, 'utf-8');
    }
}

function showFileInfo() {
    const hasUnicode = /[\u0C80-\u0CFF]/.test(fileText);
    const format = hasUnicode ? 'Unicode' : 'ASCII';
    
    document.getElementById('file-info').style.display = 'block';
    document.getElementById('stat-chars').textContent = fileText.length;
    document.getElementById('stat-words').textContent = fileText.trim().split(/\s+/).length;
    document.getElementById('stat-format').textContent = format;
    document.getElementById('dropzone').style.display = 'none';
}

function clearFile() {
    fileText = '';
    fileName = '';
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('dropzone').style.display = 'block';
    fileInput.value = '';
}

function convertFile() {
    try {
        if (!fileText) {
            showToast('ಮೊದಲು ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಿ', 'error');
            return;
        }

        const numFormat = document.getElementById('number-format').value;
        const retainEl = document.getElementById('retain-english');
        const retainEnglish = retainEl ? retainEl.checked : false;
        let direction = document.getElementById('convert-direction').value;

        if (direction === 'auto') {
            const unicodeCount = (fileText.match(/[\u0C80-\u0CFF]/g) || []).length;
            const asciiKnCount = (fileText.match(/[À-ÿøñð]/g) || []).length;
            direction = (unicodeCount > asciiKnCount) ? 'u2a' : 'a2u';
        }

        convertedText = convert(fileText, numFormat, direction, retainEnglish);
        document.getElementById('file-output').textContent = convertedText;
        showToast('ಪರಿವರ್ತನೆ ಯಶಸ್ವಿಯಾಗಿದೆ', 'success');
    } catch(e) {
        console.error(e);
        showToast('ದೋಷ: ' + e.message, 'error');
    }
}

// ============================================================
// MIXED TEXT DETECTION
// ============================================================
function detectMixed() {
    const text = document.getElementById('detect-input').value;
    if (!text.trim()) {
        showToast('ದಯವಿಟ್ಟು ಪಠ್ಯವನ್ನು ಅಂಟಿಸಿ', 'error');
        return;
    }
    
    const resultsDiv = document.getElementById('detect-results');
    const alertDiv = document.getElementById('detect-alert');
    const highlightedDiv = document.getElementById('detect-highlighted');
    
    resultsDiv.style.display = 'block';
    
    let html = '';
    let mixedCount = 0;
    
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        
        if (/[\u0C80-\u0CFF]/.test(ch)) {
            html += '<span style="background: rgba(40, 167, 69, 0.2); padding: 0 2px;">' + escapeHtml(ch) + '</span>';
            mixedCount++;
        } else if (/[A-Za-zÀ-ÿøñð]/.test(ch)) {
            html += '<span style="background: rgba(230, 126, 34, 0.2); padding: 0 2px;">' + escapeHtml(ch) + '</span>';
            mixedCount++;
        } else {
            html += escapeHtml(ch);
        }
    }
    
    highlightedDiv.innerHTML = '<div style="font-family: Anek Kannada, sans-serif; line-height: 2; word-break: break-word;">' + html + '</div>';
    
    if (mixedCount > 0) {
        alertDiv.className = 'alert alert-warning';
        alertDiv.textContent = mixedCount + ' ಮಿಶ್ರಿತ ಪಠ್ಯ ಕಂಡುಬಂದಿದೆ';
    } else {
        alertDiv.className = 'alert alert-success';
        alertDiv.textContent = 'ಮಿಶ್ರಿತ ಪಠ್ಯ ಇಲ್ಲ';
    }
}

// ============================================================
// UTILITIES
// ============================================================
function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast-custom toast-' + type + ' show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Hide history section on static pages
document.addEventListener('DOMContentLoaded', function() {
    const historySection = document.getElementById('history');
    if (historySection) {
        historySection.style.display = 'none';
    }
});

// ============================================================
// URL FETCH AND CONVERT
// ============================================================
function detectFontsFromCSS(cssText) {
    const fonts = new Set();
    const fontFamilyRegex = /font-family:\s*['"]?([^'";]+)['"]?/gi;
    const fontFaceRegex = /@font-face\s*\{[^}]*font-family:\s*['"]?([^'";]+)['"]?/gi;
    
    let match;
    while ((match = fontFamilyRegex.exec(cssText)) !== null) {
        if (match[1] && !match[1].includes('inherit') && !match[1].includes('system')) {
            fonts.add(match[1].trim());
        }
    }
    while ((match = fontFaceRegex.exec(cssText)) !== null) {
        if (match[1]) {
            fonts.add(match[1].trim());
        }
    }
    
    return Array.from(fonts);
}

function extractTextFromHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const scriptsAndStyles = temp.querySelectorAll('script, style, noscript');
    scriptsAndStyles.forEach(el => el.remove());
    
    let text = temp.textContent || temp.innerText || '';
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}

function extractTextWithFontInfo(html, maxWords = 800) {
    if (!html.trim().startsWith('<')) {
        const text = html.replace(/\s+/g, ' ').trim();
        const wordCount = text.split(/\s+/).length;
        const isTruncated = wordCount > maxWords;
        const truncatedText = isTruncated ? text.split(/\s+/).slice(0, maxWords).join(' ') : text;
        return { text: truncatedText, fonts: [], isTruncated, totalWords: wordCount };
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const scriptsAndStyles = doc.querySelectorAll('script, style, noscript');
    scriptsAndStyles.forEach(el => el.remove());
    
    const styles = doc.querySelectorAll('style');
    let allCSS = '';
    styles.forEach(style => {
        allCSS += style.textContent || '';
    });
    
    const detectedFonts = detectFontsFromCSS(allCSS);
    
    let text = doc.body.textContent || doc.body.innerText || '';
    text = text.replace(/\s+/g, ' ').trim();
    
    const wordCount = text.split(/\s+/).length;
    const isTruncated = wordCount > maxWords;
    
    if (isTruncated) {
        const words = text.split(/\s+/);
        text = words.slice(0, maxWords).join(' ');
    }
    
    return { text, fonts: detectedFonts, isTruncated, totalWords: wordCount };
}

async function fetchAndConvertUrl() {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    
    if (!url) {
        showToast('ದಯವಿಟ್ಟು URL ನ್ನು ನಮೂದಿಸಿ', 'error');
        return;
    }
    
    const loadingEl = document.getElementById('url-loading');
    const infoEl = document.getElementById('url-info');
    const fetchBtn = document.getElementById('url-fetch-btn');
    
    loadingEl.style.display = 'flex';
    infoEl.style.display = 'none';
    fetchBtn.disabled = true;
    
    const maxWords = 800;
    
    async function tryFetchWithProxy(proxyUrl) {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Fetch failed');
        return response.text();
    }
    
    async function tryFetchDirect(url) {
        try {
            return await fetch(url);
        } catch (e) {
            return null;
        }
    }
    
    try {
        let html = '';
        let success = false;
        
        const corsProxies = [
            { url: url => `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`, name: 'jina.ai' },
            { url: url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, name: 'allorigins' },
            { url: url => `https://corsproxy.io/?${encodeURIComponent(url)}`, name: 'corsproxy.io' }
        ];
        
        for (const proxy of corsProxies) {
            try {
                const response = await fetch(proxy.url(url));
                if (response.ok) {
                    html = await response.text();
                    success = true;
                    break;
                }
            } catch (e) {
                console.log(`Proxy ${proxy.name} failed:`, e.message);
            }
        }
        
        if (!success) {
            showToast('URL ಪಡೆಯಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ URL ಪ್ರಯತ್ನಿಸಿ', 'error');
            loadingEl.style.display = 'none';
            fetchBtn.disabled = false;
            return;
        }
        
        const { text, fonts, isTruncated, totalWords } = extractTextWithFontInfo(html);
        
        document.getElementById('url-source-text').value = text;
        document.getElementById('detected-fonts').textContent = fonts.length > 0 ? fonts.join(', ') : 'ಯಾವುದೇ ಫಾಂಟ್ ಪತ್ತೆ ಆಗಿಲ್ಲ';
        
        if (isTruncated) {
            showToast(`ಟಿಪ್ಪಣಿ: ${totalWords} ಪದಗಳಲ್ಲಿ ${maxWords} ಪದಗಳು ಮಾತ್ರ ತೋರಿಸಲಾಗಿದೆ`, 'info');
        }
        
        const numFormat = document.getElementById('number-format').value;
        const retainEl = document.getElementById('url-retain-english');
        const retainEnglish = retainEl ? retainEl.checked : true;
        let direction = document.getElementById('url-convert-direction').value;
        let fontType = document.getElementById('url-font-type').value;
        
        if (direction === 'auto') {
            const unicodeCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
            const asciiKnCount = (text.match(/[À-ÿøñð]/g) || []).length;
            direction = (unicodeCount > asciiKnCount) ? 'u2a' : 'a2u';
        }
        
        const converted = convert(text, numFormat, direction, retainEnglish, fontType);
        document.getElementById('url-output-text').value = converted;
        
        loadingEl.style.display = 'none';
        infoEl.style.display = 'block';
        
        showToast('URL ಪರಿವರ್ತನೆ ಯಶಸ್ವಿಯಾಗಿದೆ', 'success');
    } catch (error) {
        console.error(error);
        loadingEl.style.display = 'none';
        showToast('ದೋಷ: ' + error.message, 'error');
    } finally {
        fetchBtn.disabled = false;
    }
}

function copyUrlOutput() {
    const output = document.getElementById('url-output-text').value;
    if (!output) {
        showToast('ಮೊದಲು URL ಪರಿವರ್ತಿಸಿ', 'error');
        return;
    }
    navigator.clipboard.writeText(output).then(() => {
        showToast('ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ಕಾಪಿ ಆಗಿದೆ', 'success');
    });
}

function downloadUrlOutput(format) {
    const output = document.getElementById('url-output-text').value;
    if (!output) {
        showToast('ಮೊದಲು URL ಪರಿವರ್ತಿಸಿ', 'error');
        return;
    }
    
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'converted.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('ಡೌನ್ಲೋಡ್ ಶುರುವಾಗಿದೆ', 'success');
}

// ============================================================
// LIVE EDITOR - Two directions
// a2u (ASCII simulator): left pane always shows ASCII encoding
//   (Unicode typed via IME is auto-converted to ASCII in place),
//   right pane shows Unicode. A preview box shows how the ASCII
//   text looks in a legacy (Nudi-style) editor.
// u2a: left pane keeps Unicode as typed (IME friendly),
//   right pane shows the ASCII encoding for the selected font.
// English/Latin text passes through unchanged in both directions.
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const source = document.getElementById('live-source');
    const result = document.getElementById('live-result');
    const fontType = document.getElementById('live-font-type');
    const retainEnglish = document.getElementById('live-retain-english');
    const directionEl = document.getElementById('live-direction');
    const previewWrap = document.getElementById('live-ascii-preview-wrap');
    const previewBox = document.getElementById('live-ascii-preview');
    if (!source) return;

    var composing = false;
    var converting = false;

    function currentDirection() {
        return directionEl ? directionEl.value : 'a2u';
    }

    function applyDirectionUI() {
        var dir = currentDirection();
        var srcLabel = document.getElementById('live-source-label');
        var resLabel = document.getElementById('live-result-label');
        var help = document.getElementById('live-help-text');
        if (dir === 'u2a') {
            if (srcLabel) srcLabel.innerHTML = '<i class="fas fa-file-import me-1"></i> Unicode ಮೂಲ';
            if (resLabel) resLabel.innerHTML = '<i class="fas fa-file-export me-1"></i> ASCII ಫಲಿತಾಂಶ <small class="text-muted">(ಸಂಪಾದಿಸಬಹುದು)</small>';
            if (help) help.innerHTML = 'ಎಡಭಾಗದಲ್ಲಿ Unicode ಕನ್ನಡ ಟೈಪ್ ಮಾಡಿ — ಮೇಲಿನ <strong>ಕೀಬೋರ್ಡ್</strong> ಆಯ್ಕೆಯಿಂದ KGP, InScript, ಅಥವಾ ಲಿಪ್ಯಂತರಣ ಆರಿಸಿ. ಆಯ್ದ ಫಾಂಟ್‌ನ ASCII ಎನ್ಕೋಡಿಂಗ್ ಬಲಭಾಗದಲ್ಲಿ ಲೈವ್ ಆಗಿ ಕಾಣಿಸುತ್ತದೆ. ಇಂಗ್ಲಿಷ್ ಪಠ್ಯ ಇದ್ದಂತೆಯೇ ಉಳಿಯುತ್ತದೆ.';
            source.placeholder = 'ಇಲ್ಲಿ Unicode ಕನ್ನಡ ಟೈಪ್ ಮಾಡಿ...';
            if (previewWrap) previewWrap.style.display = 'none';
            if (retainEnglish) retainEnglish.disabled = true;
        } else {
            if (srcLabel) srcLabel.innerHTML = '<i class="fas fa-file-import me-1"></i> ASCII ಮೂಲ';
            if (resLabel) resLabel.innerHTML = '<i class="fas fa-file-export me-1"></i> Unicode ಫಲಿತಾಂಶ <small class="text-muted">(ಸಂಪಾದಿಸಬಹುದು)</small>';
            if (help) help.innerHTML = 'ಎಡಭಾಗದಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ — ಅದರ ASCII ಎನ್ಕೋಡಿಂಗ್ ಎಡಭಾಗದಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ ಮತ್ತು Unicode ಪರಿವರ್ತನೆ ಬಲಭಾಗದಲ್ಲಿ ಲೈವ್ ಆಗಿ ಕಾಣಿಸುತ್ತದೆ. ಕನ್ನಡ ಟೈಪ್ ಮಾಡಲು ಮೇಲಿನ <strong>ಕೀಬೋರ್ಡ್</strong> ಆಯ್ಕೆಯಿಂದ KGP, InScript, ಅಥವಾ ಲಿಪ್ಯಂತರಣ ಆರಿಸಿ. ಇಂಗ್ಲಿಷ್ ಪಠ್ಯ ಇದ್ದಂತೆಯೇ ಉಳಿಯುತ್ತದೆ.';
            source.placeholder = 'ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ — ASCII ಎನ್ಕೋಡಿಂಗ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೋರಿಸಲ್ಪಡುತ್ತದೆ...';
            if (previewWrap) previewWrap.style.display = '';
            if (retainEnglish) retainEnglish.disabled = false;
        }
        if (typeof liveApplyEditorFont === 'function') liveApplyEditorFont();
        if (typeof window.applyLiveKeyboard === 'function') window.applyLiveKeyboard();
    }

    function toAscii(text, font) {
        if (!text) return text;
        var hasUnicode = /[\u0C80-\u0CFF]/.test(text);
        if (!hasUnicode) return text;
        return unicodeToASCII(text, font);
    }

    function update() {
        if (composing || converting) return;
        var text = source.value;
        var font = fontType.value;
        var retain = retainEnglish.checked;
        var dir = currentDirection();
        document.getElementById('live-source-count').textContent = text.length + ' ಅಕ್ಷರ';

        if (!text.trim()) {
            result.value = '';
            if (previewBox) previewBox.textContent = '';
            document.getElementById('live-result-count').textContent = '0 ಅಕ್ಷರ';
            return;
        }

        try {
            if (dir === 'u2a') {
                // Left pane keeps Unicode as typed; right pane shows ASCII.
                // Latin/English text passes through the u2a maps untouched.
                var ascii = convert(text, 'keep', 'u2a', true, font);
                result.value = ascii;
                document.getElementById('live-result-count').textContent = ascii.length + ' ಅಕ್ಷರ';
            } else {
                // ASCII simulator: normalize Unicode typed via IME into ASCII in place
                var asciiText = toAscii(text, font);
                if (asciiText !== text) {
                    var pos = source.selectionStart + (asciiText.length - text.length);
                    converting = true;
                    source.value = asciiText;
                    try { source.setSelectionRange(pos, pos); } catch(e2) {}
                    converting = false;
                    text = asciiText;
                    document.getElementById('live-source-count').textContent = text.length + ' ಅಕ್ಷರ';
                }
                var converted = convert(text, 'keep', 'a2u', retain, font);
                result.value = converted;
                document.getElementById('live-result-count').textContent = converted.length + ' ಅಕ್ಷರ';
                // Preview: how this ASCII text renders inside a legacy-font editor
                if (previewBox) previewBox.textContent = converted;
            }
        } catch(e) {
            result.value = 'ದೋಷ: ' + e.message;
        }
    }

    function onDirectionChange() {
        var dir = currentDirection();
        // Carry the text across the mode switch so nothing is lost
        var text = source.value;
        if (text.trim()) {
            try {
                converting = true;
                if (dir === 'u2a') {
                    // Coming from ASCII mode: left pane becomes Unicode
                    if (!/[ಀ-೿]/.test(text)) {
                        source.value = convert(text, 'keep', 'a2u', true, fontType.value);
                    }
                } else {
                    // Coming from Unicode mode: left pane becomes ASCII
                    source.value = toAscii(text, fontType.value);
                }
                converting = false;
            } catch(e) { converting = false; }
        }
        applyDirectionUI();
        update();
    }

    // Reverse editing: typing in the result pane updates the source pane
    function updateFromResult() {
        if (composing || converting) return;
        var text = result.value;
        var font = fontType.value;
        var dir = currentDirection();
        document.getElementById('live-result-count').textContent = text.length + ' ಅಕ್ಷರ';

        try {
            converting = true;
            if (!text.trim()) {
                source.value = '';
                if (previewBox) previewBox.textContent = '';
            } else if (dir === 'u2a') {
                // Right pane holds ASCII -> left pane gets Unicode
                source.value = convert(text, 'keep', 'a2u', true, font);
            } else {
                // Right pane holds Unicode -> left pane gets ASCII
                source.value = convert(text, 'keep', 'u2a', true, font);
                if (previewBox) previewBox.textContent = text;
            }
            document.getElementById('live-source-count').textContent = source.value.length + ' ಅಕ್ಷರ';
            converting = false;
        } catch(e) {
            converting = false;
        }
    }

    source.addEventListener('compositionstart', function() { composing = true; });
    source.addEventListener('compositionend', function() { composing = false; update(); });
    source.addEventListener('input', update);
    result.addEventListener('compositionstart', function() { composing = true; });
    result.addEventListener('compositionend', function() { composing = false; updateFromResult(); });
    result.addEventListener('input', updateFromResult);
    fontType.addEventListener('change', update);
    retainEnglish.addEventListener('change', update);
    if (directionEl) directionEl.addEventListener('change', onDirectionChange);

    applyDirectionUI();
    if (source.value.trim()) update();
});

// ============================================================
// LIVE EDITOR TOOLBARS - both panes: file open, font, copy,
// download, expand, clear
// ============================================================
var liveEditorPrefs = {
    source: { size: 0 },  // 0 = use pane default
    result: { size: 0 }
};
var liveFileTarget = 'source';

// Editor font registry. To embed a legacy ASCII font later:
// 1. add @font-face in css/style.css, 2. add an entry + <option> here.
var LIVE_EDITOR_FONTS = {
    mono: "'Courier New', 'IBM Plex Mono', 'Menlo', monospace",
    plex: "'IBM Plex Sans', sans-serif",
    anek: "'Anek Kannada', sans-serif"
};

// Which format a pane currently holds ('unicode' or 'ascii')
function livePaneFormat(side) {
    var dirEl = document.getElementById('live-direction');
    var isU2a = dirEl && dirEl.value === 'u2a';
    var holdsUnicode = (side === 'source') ? isU2a : !isU2a;
    return holdsUnicode ? 'unicode' : 'ascii';
}

function liveApplyEditorFont(side) {
    (side ? [side] : ['source', 'result']).forEach(function(s) {
        var el = document.getElementById('live-' + s);
        if (!el) return;
        var sel = document.getElementById('live-editor-font-' + s);
        var choice = sel ? sel.value : 'auto';
        var holdsUnicode = livePaneFormat(s) === 'unicode';
        var family, size;
        if (choice === 'auto') {
            family = holdsUnicode ? LIVE_EDITOR_FONTS.anek : LIVE_EDITOR_FONTS.mono;
            size = liveEditorPrefs[s].size || (holdsUnicode ? 17 : 13);
        } else {
            family = LIVE_EDITOR_FONTS[choice] || LIVE_EDITOR_FONTS.mono;
            size = liveEditorPrefs[s].size || (choice === 'anek' ? 17 : 13);
        }
        el.style.setProperty('font-family', family, 'important');
        el.style.setProperty('font-size', size + 'px', 'important');
    });
}

function liveFontSizeFor(side, delta) {
    var el = document.getElementById('live-' + side);
    var current = liveEditorPrefs[side].size ||
        (el ? parseInt(getComputedStyle(el).fontSize, 10) : 13) || 13;
    liveEditorPrefs[side].size = Math.min(28, Math.max(10, current + delta));
    liveApplyEditorFont(side);
}

function liveCopy(side) {
    var el = document.getElementById('live-' + side);
    if (!el || !el.value) { showToast('ಪಠ್ಯ ಖಾಲಿ ಇದೆ', 'error'); return; }
    navigator.clipboard.writeText(el.value).then(function() {
        showToast('ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ಕಾಪಿ ಆಗಿದೆ', 'success');
    });
}

function liveDownload(side) {
    var el = document.getElementById('live-' + side);
    if (!el || !el.value) { showToast('ಪಠ್ಯ ಖಾಲಿ ಇದೆ', 'error'); return; }
    downloadBlob(el.value, 'kannada-' + livePaneFormat(side) + '.txt');
    showToast('ಡೌನ್‌ಲೋಡ್ ಶುರುವಾಗಿದೆ', 'success');
}

// Format-based downloads (ascii / unicode / both), independent of which
// pane currently holds which format
function liveFormats() {
    var dirEl = document.getElementById('live-direction');
    var isU2a = dirEl && dirEl.value === 'u2a';
    var src = document.getElementById('live-source');
    var res = document.getElementById('live-result');
    return {
        ascii: (isU2a ? res : src) ? (isU2a ? res.value : src.value) : '',
        unicode: (isU2a ? src : res) ? (isU2a ? src.value : res.value) : ''
    };
}

function liveDownloadFormat(fmt) {
    var f = liveFormats();
    if (fmt === 'ascii') {
        if (!f.ascii) { showToast('ASCII ಪಠ್ಯ ಖಾಲಿ ಇದೆ', 'error'); return; }
        downloadBlob(f.ascii, 'kannada-ascii.txt');
    } else if (fmt === 'unicode') {
        if (!f.unicode) { showToast('Unicode ಪಠ್ಯ ಖಾಲಿ ಇದೆ', 'error'); return; }
        downloadBlob(f.unicode, 'kannada-unicode.txt');
    } else {
        if (!f.ascii && !f.unicode) { showToast('ಪಠ್ಯ ಖಾಲಿ ಇದೆ', 'error'); return; }
        var font = document.getElementById('live-font-type');
        var label = font && font.value !== 'nudi'
            ? font.value.charAt(0).toUpperCase() + font.value.slice(1)
            : 'Nudi / Baraha';
        downloadBlob(
            '=== ASCII (' + label + ') ===\n' + f.ascii + '\n\n=== Unicode ===\n' + f.unicode,
            'kannada-both.txt'
        );
    }
    showToast('ಡೌನ್‌ಲೋಡ್ ಶುರುವಾಗಿದೆ', 'success');
}

function liveExpand(side) {
    var el = document.getElementById('live-' + side);
    if (el) el.classList.toggle('pane-expanded');
}

function liveClearPane(side) {
    var el = document.getElementById('live-' + side);
    if (!el) return;
    el.value = '';
    el.dispatchEvent(new Event('input'));
    el.focus();
}

function liveOpenFileFor(side) {
    liveFileTarget = side || 'source';
    var inp = document.getElementById('live-file-input');
    if (inp) inp.click();
}

document.addEventListener('DOMContentLoaded', function() {
    var inp = document.getElementById('live-file-input');
    if (!inp) return;

    function loadIntoEditor(text, name, note) {
        var side = liveFileTarget;
        var el = document.getElementById('live-' + side);
        var dirSel = document.getElementById('live-direction');
        if (!el) return;
        if (!text || !text.trim()) {
            showToast('ಫೈಲ್‌ನಲ್ಲಿ ಪಠ್ಯ ಸಿಗಲಿಲ್ಲ' + (note ? ' (' + note + ')' : ''), 'error');
            return;
        }
        // Pick the direction that makes this pane match the file's format:
        // source holds Unicode in u2a; result holds Unicode in a2u.
        var isUnicode = /[ಀ-೿]/.test(text);
        var wanted = (side === 'source')
            ? (isUnicode ? 'u2a' : 'a2u')
            : (isUnicode ? 'a2u' : 'u2a');
        if (dirSel && dirSel.value !== wanted) {
            dirSel.value = wanted;
            dirSel.dispatchEvent(new Event('change'));
        }
        el.value = text;
        el.dispatchEvent(new Event('input'));
        showToast('ಫೈಲ್ ಲೋಡ್ ಆಗಿದೆ: ' + name + (note ? ' — ' + note : ''), 'success');
    }

    // DOCX is a zip; embedded images live under word/media/. A latin1 decode
    // of the raw bytes lets us check for that path cheaply without unzipping.
    function docxHasImages(arrayBuffer) {
        try {
            return new TextDecoder('latin1').decode(arrayBuffer).indexOf('word/media/') !== -1;
        } catch (e) { return false; }
    }

    inp.addEventListener('change', function() {
        var f = inp.files[0];
        if (!f) return;
        var ext = f.name.split('.').pop().toLowerCase();
        if (ext === 'docx') {
            var r = new FileReader();
            r.onload = function(e) {
                var m = (typeof mammoth !== 'undefined') ? mammoth : window.mammoth;
                if (!m || typeof m.extractRawText !== 'function') {
                    showToast('DOCX ಲೈಬ್ರರಿ ಲಭ್ಯವಿಲ್ಲ — ಪುಟ ರಿಫ್ರೆಶ್ ಮಾಡಿ', 'error');
                    return;
                }
                var note = docxHasImages(e.target.result)
                    ? 'ಚಿತ್ರಗಳನ್ನು ಬಿಡಲಾಗಿದೆ (ಪಠ್ಯ ಮಾತ್ರ)'
                    : '';
                m.extractRawText({ arrayBuffer: e.target.result })
                    .then(function(res) { loadIntoEditor(res.value, f.name, note); })
                    .catch(function(err) { showToast('DOCX ಓದುವುದು ವಿಫಲ: ' + err.message, 'error'); });
            };
            r.readAsArrayBuffer(f);
        } else {
            var r2 = new FileReader();
            r2.onload = function(e) {
                var text;
                try {
                    // Unicode files decode cleanly as UTF-8; legacy Nudi/ASCII
                    // files contain high-bytes that fail strict UTF-8 and are
                    // decoded as windows-1252 instead.
                    text = new TextDecoder('utf-8', { fatal: true }).decode(e.target.result);
                } catch (err) {
                    text = new TextDecoder('windows-1252').decode(e.target.result);
                }
                loadIntoEditor(text, f.name);
            };
            r2.readAsArrayBuffer(f);
        }
        inp.value = '';
    });
});

// ============================================================
// BUG REPORTING - opens the GitHub issue form prefilled with
// the current conversion state (text, output, font, direction)
// ============================================================
function reportBug() {
    var REPO = 'https://github.com/sanchaya/kannada-font-converter/issues/new';
    var LIMIT = 400; // keep the URL well under browser/GitHub limits
    function clip(s) {
        s = (s || '').trim();
        return s.length > LIMIT ? s.slice(0, LIMIT) + '\n... (truncated)' : s;
    }
    function val(id) {
        var el = document.getElementById(id);
        return el ? el.value : '';
    }

    var active = document.querySelector('.tab-pane-custom.active');
    var tab = active ? active.id : 'tab-text';
    var input = '', output = '', section = 'ಪಠ್ಯ (Text)', font = '', dir = '';

    if (tab === 'tab-live') {
        section = 'ಲೈವ್ ಸಂಪಾದಕ (Live editor)';
        var d = val('live-direction');
        dir = d === 'u2a' ? 'Unicode → ASCII' : 'ASCII → Unicode';
        input = val('live-source');
        output = val('live-result');
        font = val('live-font-type');
    } else if (tab === 'tab-url') {
        section = 'URL';
        input = val('url-source-text') || val('url-input');
        output = val('url-output-text');
        font = val('url-font-type');
        dir = val('url-convert-direction') === 'u2a' ? 'Unicode → ASCII' : 'ASCII → Unicode';
    } else if (tab === 'tab-detect') {
        section = 'ಮಿಶ್ರಿತ ಪಠ್ಯ ಪತ್ತೆ (Mixed-text detection)';
        input = val('detect-input');
    } else if (tab === 'tab-file') {
        section = 'ಫೈಲ್ (File)';
        input = typeof fileText === 'string' ? fileText : '';
        var out = document.getElementById('file-output');
        output = out ? out.textContent : '';
        font = val('font-type');
    } else {
        input = val('input-text');
        output = val('output-text');
        font = val('font-type');
        var cd = val('convert-direction');
        dir = cd === 'u2a' ? 'Unicode → ASCII' : (cd === 'a2u' ? 'ASCII → Unicode' : '');
    }

    var FONT_LABELS = {
        nudi: 'Nudi / Baraha', shree: 'ShreeLipi',
        prakashak: 'Prakashak', akruti: 'Akruti', surabhi: 'Surabhi (KND)',
        auto: 'ಸ್ವಯಂಚಾಲಿತ / Auto'
    };

    var params = new URLSearchParams();
    params.set('template', 'bug_report.yml');
    params.set('section', section);
    if (input) params.set('input-text', clip(input));
    if (output) params.set('actual', clip(output));
    if (FONT_LABELS[font]) params.set('font', FONT_LABELS[font]);
    if (dir) params.set('direction', dir);
    params.set('browser', navigator.userAgent);

    window.open(REPO + '?' + params.toString(), '_blank', 'noopener');
}

function downloadBlob(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}