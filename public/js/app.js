// ============================================================
// FRONTEND APPLICATION
// ============================================================

let convertedText = '';
let fileText = '';
let fileName = '';

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
// TEXT CONVERSION (API CALL)
// ============================================================
async function convertText() {
    try {
        const text = document.getElementById('input-text').value;
        if (!text.trim()) {
            showToast('ದಯವಿಟ್ಟು ಪಠ್ಯವನ್ನು ಅಂಟಿಸಿ', 'error');
            return;
        }

        const numFormat = document.getElementById('number-format').value;
        const retainEl = document.getElementById('retain-english');
        const retainEnglish = retainEl ? retainEl.checked : false;
        const direction = document.getElementById('convert-direction').value;

        // Call the API
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, numFormat, direction, retainEnglish })
        });

        const data = await response.json();

        if (data.success) {
            convertedText = data.result;
            document.getElementById('output-text').value = convertedText;
            document.getElementById('out-char-count').textContent = convertedText.length + ' ಅಕ್ಷರ';
            showToast('ಪರಿವರ್ತನೆ ಯಶಸ್ವಿಯಾಗಿದೆ', 'success');
            
            // Refresh history after successful conversion
            loadHistory();
        } else {
            showToast(data.error || 'ಪರಿವರ್ತನೆ ವಿಫಲವಾಗಿದೆ', 'error');
        }
    } catch(e) {
        console.error(e);
        showToast('ದೋಷ: ' + e.message, 'error');
    }
}

// ============================================================
// LOCAL FUNCTIONS (FALLBACK FOR OFFLINE)
// ============================================================

// Detect input type
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
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); });

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
            mammoth.convertToRawText({ arrayBuffer: e.target.result })
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

async function convertFile() {
    try {
        if (!fileText) {
            showToast('ಮೊದಲು ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಿ', 'error');
            return;
        }

        const numFormat = document.getElementById('number-format').value;
        const retainEl = document.getElementById('retain-english');
        const retainEnglish = retainEl ? retainEl.checked : false;
        const direction = document.getElementById('convert-direction').value;

        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: fileText, numFormat, direction, retainEnglish })
        });

        const data = await response.json();

        if (data.success) {
            convertedText = data.result;
            document.getElementById('file-output').textContent = convertedText;
            showToast('ಪರಿವರ್ತನೆ ಯಶಸ್ವಿಯಾಗಿದೆ', 'success');
            loadHistory();
        } else {
            showToast(data.error || 'ಪರಿವರ್ತನೆ ವಿಫಲ', 'error');
        }
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
// HISTORY (API CALL)
// ============================================================
async function loadHistory() {
    try {
        const response = await fetch('/api/history?limit=10');
        const data = await response.json();
        
        document.getElementById('history-loading').style.display = 'none';
        
        if (data.history && data.history.length > 0) {
            document.getElementById('history-list').style.display = 'block';
            document.getElementById('history-empty').style.display = 'none';
            
            const tbody = document.getElementById('history-tbody');
            tbody.innerHTML = data.history.map(h => `
                <tr>
                    <td><code>${h.id.substring(0, 8)}</code></td>
                    <td>${h.direction === 'a2u' ? 'ASCII → Unicode' : 'Unicode → ASCII'}</td>
                    <td>${h.textLength}</td>
                    <td>${new Date(h.timestamp).toLocaleString('kn-IN')}</td>
                </tr>
            `).join('');
        } else {
            document.getElementById('history-list').style.display = 'none';
            document.getElementById('history-empty').style.display = 'block';
        }
    } catch(e) {
        console.error('Failed to load history:', e);
        document.getElementById('history-loading').style.display = 'none';
        document.getElementById('history-empty').style.display = 'block';
        document.getElementById('history-empty').textContent = 'ಇತಿಹಾಸ ಲೋಡ್ ಆಗಲಿಲ್ಲ';
    }
}

// Load history on page load
document.addEventListener('DOMContentLoaded', loadHistory);

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