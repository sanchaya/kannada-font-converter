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

vowelMaps.forEach(m => A2U_MAP[m[0]] = m[1]);
consonantMaps.forEach(m => A2U_MAP[m[0]] = m[1]);

const A2U_KEYS = Object.keys(A2U_MAP).sort((a, b) => b.length - a.length);

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

function _isEnglishToken(token, fullText, tokenStart) {
    if (!/^[a-zA-Z'-]+$/.test(token)) return false;
    if (token.length === 1) return false;
    if (/[À-ÿøñð]/.test(token)) return false;
    if (/^[ABCDEFGHJKLMNQRTVXYacdfklnprtwyj]+$/.test(token)) return false;
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
    if (direction === 'a2u' || direction === 'auto') {
        result = asciiToUnicode(text, retainEnglish);
    } else if (direction === 'u2a') {
        result = unicodeToASCII(text);
    } else {
        result = text;
    }
    result = convertNumbers(result, numFormat);
    return result;
}

// Unicode to ASCII conversion
function unicodeToASCII(text) {
    let result = text;
    
    // Special compound characters
    result = result.replace(/ಕ್ಷ/g, 'x').replace(/ಜ್ಞ/g, 'Y');
    
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

        // Auto-detect direction
        if (direction === 'auto') {
            const unicodeCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
            const asciiKnCount = (text.match(/[À-ÿøñð]/g) || []).length;
            direction = (unicodeCount > asciiKnCount) ? 'u2a' : 'a2u';
        }

        convertedText = convert(text, numFormat, direction, retainEnglish);
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
document.getElementById('input-text').addEventListener('input', function() {
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
            mammoth.extractRawText({ arrayBuffer: e.target.result })
                .then(function(result) {
                    fileText = result.value;
                    showFileInfo();
                })
                .catch(function() {
                    showToast('DOCX ಓದುವುದು ವಿಫಲ', 'error');
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

function extractTextWithFontInfo(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const scriptsAndStyles = temp.querySelectorAll('script, style, noscript');
    scriptsAndStyles.forEach(el => el.remove());
    
    const styles = temp.querySelectorAll('style');
    let allCSS = '';
    styles.forEach(style => {
        allCSS += style.textContent || '';
    });
    
    const detectedFonts = detectFontsFromCSS(allCSS);
    
    let text = temp.textContent || temp.innerText || '';
    text = text.replace(/\s+/g, ' ').trim();
    
    return { text, fonts: detectedFonts };
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
    
    try {
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(corsProxy + encodeURIComponent(url));
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const html = await response.text();
        
        const { text, fonts } = extractTextWithFontInfo(html);
        
        document.getElementById('url-source-text').value = text;
        document.getElementById('detected-fonts').textContent = fonts.length > 0 ? fonts.join(', ') : 'ಯಾವುದೇ ಫಾಂಟ್ ಪತ್ತೆ ಆಗಿಲ್ಲ';
        
        const numFormat = document.getElementById('number-format').value;
        const retainEl = document.getElementById('retain-english');
        const retainEnglish = retainEl ? retainEl.checked : false;
        let direction = document.getElementById('convert-direction').value;
        
        if (direction === 'auto') {
            const unicodeCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
            const asciiKnCount = (text.match(/[À-ÿøñð]/g) || []).length;
            direction = (unicodeCount > asciiKnCount) ? 'u2a' : 'a2u';
        }
        
        const converted = convert(text, numFormat, direction, retainEnglish);
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