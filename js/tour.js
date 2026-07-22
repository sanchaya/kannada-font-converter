// ============================================================
// GUIDED TOURS - one tour per section, launched with the
// ಮಾರ್ಗದರ್ಶಿ button. Uses driver.js (loaded from CDN).
// ============================================================

var TOURS = {
    'tab-text': [
        { element: '.nav-tabs-custom', popover: { title: 'ವಿಭಾಗಗಳು', description: 'ಪಠ್ಯ, ಫೈಲ್, ಮಿಶ್ರಿತ ಪಠ್ಯ ಪತ್ತೆ, URL ಮತ್ತು ಲೈವ್ ಸಂಪಾದಕ — ಪ್ರತಿ ವಿಭಾಗಕ್ಕೂ ಪ್ರತ್ಯೇಕ ಮಾರ್ಗದರ್ಶಿ ಇದೆ. ಆ ವಿಭಾಗ ತೆರೆದು ಮಾರ್ಗದರ್ಶಿ ಒತ್ತಿ.' } },
        { element: '#convert-direction', popover: { title: 'ಪರಿವರ್ತನೆ ದಿಕ್ಕು', description: 'ASCII → Unicode ಅಥವಾ Unicode → ASCII — ಯಾವ ಕಡೆಗೆ ಪರಿವರ್ತಿಸಬೇಕು ಎಂದು ಆರಿಸಿ. "ಸ್ವಯಂ" ಆಯ್ಕೆ ಪಠ್ಯವನ್ನು ನೋಡಿ ತಾನಾಗಿಯೇ ನಿರ್ಧರಿಸುತ್ತದೆ.' } },
        { element: '#font-type', popover: { title: 'ಫಾಂಟ್ ಆಯ್ಕೆ', description: 'ಮೂಲ ಪಠ್ಯದ ಫಾಂಟ್: Nudi/Baraha, ShreeLipi, Prakashak ಅಥವಾ Akruti.' } },
        { element: '#number-format', popover: { title: 'ಅಂಕಿ ರೂಪ', description: 'ಫಲಿತಾಂಶದಲ್ಲಿ ಅಂಕಿಗಳು ಕನ್ನಡ (೧೨೩) ಅಥವಾ ಇಂಗ್ಲಿಷ್ (123) ರೂಪದಲ್ಲಿ ಬೇಕೆ ಎಂದು ಆರಿಸಿ.' } },
        { element: '#retain-english', popover: { title: 'ಇಂಗ್ಲಿಷ್ ಉಳಿಸಿ', description: 'ಗುರುತು ಹಾಕಿದರೆ ಪಠ್ಯದಲ್ಲಿರುವ ಇಂಗ್ಲಿಷ್ ಪದಗಳು ಮತ್ತು ಸಂಖ್ಯೆಗಳು ಇದ್ದಂತೆಯೇ ಉಳಿಯುತ್ತವೆ.' } },
        { element: '#input-text', popover: { title: 'ಮೂಲ ಪಠ್ಯ', description: 'ಇಲ್ಲಿ ಪಠ್ಯ ಅಂಟಿಸಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ. ಪಠ್ಯದ ಸ್ವರೂಪ (ASCII / Unicode) ಮೇಲೆ ತಾನಾಗಿಯೇ ಪತ್ತೆಯಾಗಿ ತೋರಿಸುತ್ತದೆ.' } },
        { element: '#tab-text .btn-convert', popover: { title: 'ಪರಿವರ್ತಿಸಿ', description: 'ಈ ಗುಂಡಿ ಒತ್ತಿದರೆ ಪರಿವರ್ತನೆ ನಡೆಯುತ್ತದೆ.' } },
        { element: '#output-text', popover: { title: 'ಫಲಿತಾಂಶ', description: 'ಪರಿವರ್ತಿತ ಪಠ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ — ಕೆಳಗಿನ ಗುಂಡಿಗಳಿಂದ ಕಾಪಿ ಅಥವಾ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದು.' } }
    ],
    'tab-file': [
        { element: '#dropzone', popover: { title: 'ಫೈಲ್ ಹಾಕಿ', description: 'TXT ಅಥವಾ DOCX ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ ಆರಿಸಿ. ಫೈಲ್‌ನ ಸ್ವರೂಪ ತಾನಾಗಿಯೇ ಪತ್ತೆಯಾಗುತ್ತದೆ.' } },
        { element: '#tab-file .btn-convert', popover: { title: 'ಪರಿವರ್ತಿಸಿ', description: 'ಫೈಲ್ ಲೋಡ್ ಆದ ಮೇಲೆ ಈ ಗುಂಡಿಯಿಂದ ಪರಿವರ್ತಿಸಿ ಫಲಿತಾಂಶವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.' } }
    ],
    'tab-detect': [
        { element: '#detect-input', popover: { title: 'ಮಿಶ್ರಿತ ಪಠ್ಯ', description: 'ಒಂದೇ ದಾಖಲೆಯಲ್ಲಿ ASCII ಮತ್ತು Unicode ಎರಡೂ ಬೆರೆತಿದ್ದರೆ ಆ ಪಠ್ಯವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ.' } },
        { element: '#tab-detect .btn-convert', popover: { title: 'ಪತ್ತೆ ಮಾಡಿ', description: 'ಯಾವ ಭಾಗ ಯಾವ ಎನ್ಕೋಡಿಂಗ್‌ನಲ್ಲಿದೆ ಎಂದು ಬಣ್ಣಗಳಿಂದ ಗುರುತಿಸಿ ತೋರಿಸುತ್ತದೆ.' } }
    ],
    'tab-url': [
        { element: '#url-input', popover: { title: 'ವೆಬ್ ವಿಳಾಸ', description: 'ಹಳೆಯ ASCII ಫಾಂಟ್ ಬಳಸುವ ವೆಬ್ ಪುಟದ URL ಇಲ್ಲಿ ಹಾಕಿ.' } },
        { element: '#url-convert-direction', popover: { title: 'ದಿಕ್ಕು ಮತ್ತು ಫಾಂಟ್', description: 'ಪುಟದ ಫಾಂಟ್ ಮತ್ತು ಪರಿವರ್ತನೆಯ ದಿಕ್ಕನ್ನು ಆರಿಸಿ.' } },
        { element: '#url-fetch-btn', popover: { title: 'ತನ್ನಿ ಮತ್ತು ಪರಿವರ್ತಿಸಿ', description: 'ಪುಟದ ಪಠ್ಯವನ್ನು ತಂದು ಒಂದೇ ಹಂತದಲ್ಲಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.' } },
        { element: '#url-output-text', popover: { title: 'ಫಲಿತಾಂಶ', description: 'ಪರಿವರ್ತಿತ ಪಠ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.' } }
    ],
    'tab-live': [
        { element: '#live-direction', popover: { title: 'ದಿಕ್ಕು', description: '"ASCII ಸಿಮ್ಯುಲೇಟರ್" — ಹಳೆಯ ನುಡಿ ಎಡಿಟರ್‌ನಂತೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ; "Unicode → ASCII" — Unicode ಟೈಪ್ ಮಾಡಿ ASCII ಪಡೆಯಿರಿ.' } },
        { element: '#live-font-type', popover: { title: 'ಫಾಂಟ್', description: 'ASCII ಎನ್ಕೋಡಿಂಗ್ ಯಾವ ಫಾಂಟ್‌ನದು — Nudi/Baraha, ShreeLipi, Prakashak ಅಥವಾ Akruti.' } },
        { element: '#live-keyboard', popover: { title: 'ಕೀಬೋರ್ಡ್', description: 'ಕನ್ನಡ ಟೈಪ್ ಮಾಡಲು KGP/ನುಡಿ, InScript ಅಥವಾ ಲಿಪ್ಯಂತರಣ ಆರಿಸಿ. English ಆರಿಸಿದರೆ ಸಾಮಾನ್ಯ ಟೈಪಿಂಗ್.' } },
        { element: '#live-download-group', popover: { title: 'ಡೌನ್‌ಲೋಡ್', description: 'ASCII, Unicode ಅಥವಾ ಎರಡೂ ರೂಪಗಳನ್ನು ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.' } },
        { element: '#tab-live .editor-toolbar', popover: { title: 'ಎಡಿಟರ್ ಪಟ್ಟಿ', description: 'ಫೈಲ್ ತೆರೆಯುವುದು (TXT/DOCX), ಫಾಂಟ್ ಬದಲಾವಣೆ, ಗಾತ್ರ, ಕಾಪಿ, ಡೌನ್‌ಲೋಡ್, ವಿಸ್ತರಣೆ ಮತ್ತು ಅಳಿಸುವಿಕೆ — ಎರಡೂ ಕಡೆ ಇವೆ.' } },
        { element: '#live-source', popover: { title: 'ಎಡ ಸಂಪಾದಕ', description: 'ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಫೈಲ್ ಲೋಡ್ ಮಾಡಿ. ಬದಲಾವಣೆಗಳು ತಕ್ಷಣ ಬಲಭಾಗದಲ್ಲಿ ಪ್ರತಿಫಲಿಸುತ್ತವೆ.' } },
        { element: '#live-ascii-preview-wrap', popover: { title: 'ನುಡಿ ನೋಟ', description: 'ASCII ಪಠ್ಯ ಹಳೆಯ ನುಡಿ ಎಡಿಟರ್‌ನಲ್ಲಿ ಹೇಗೆ ಕಾಣುತ್ತದೆ ಎಂಬ ಪೂರ್ವವೀಕ್ಷಣೆ.' } },
        { element: '#live-result', popover: { title: 'ಬಲ ಸಂಪಾದಕ', description: 'ಫಲಿತಾಂಶ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ — ಇಲ್ಲಿಯೂ ಸಂಪಾದಿಸಬಹುದು! ಇಲ್ಲಿನ ಬದಲಾವಣೆಗಳು ಎಡಭಾಗಕ್ಕೆ ಹಿಂತಿರುಗಿ ಪರಿವರ್ತನೆಯಾಗುತ್ತವೆ.' } }
    ]
};

function startTour() {
    if (!window.driver || !window.driver.js || typeof window.driver.js.driver !== 'function') {
        if (typeof showToast === 'function') showToast('ಮಾರ್ಗದರ್ಶಿ ಲೈಬ್ರರಿ ಲೋಡ್ ಆಗಿಲ್ಲ', 'error');
        return;
    }
    var active = document.querySelector('.tab-pane-custom.active');
    var steps = (TOURS[active ? active.id : 'tab-text'] || []).filter(function(s) {
        var el = document.querySelector(s.element);
        return el && (el.offsetWidth || el.offsetHeight || el.offsetParent !== null);
    });
    if (!steps.length) return;
    window.driver.js.driver({
        showProgress: true,
        progressText: '{{current}} / {{total}}',
        nextBtnText: 'ಮುಂದೆ →',
        prevBtnText: '← ಹಿಂದೆ',
        doneBtnText: 'ಮುಗಿಯಿತು',
        steps: steps
    }).drive();
}
