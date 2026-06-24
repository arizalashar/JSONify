// app.js — JSONify behavior (format, validate, minify, copy, clear)
// - No external libraries
// - Works in-browser by opening index.html

/*
Features implemented:
- Format (2-space indent)
- Validate JSON and show success or error with line number
- Minify
- Copy to clipboard
- Clear editor
- Line numbers synced with textarea (updates on input, paste, and resize)
- Error highlighting: marks the offending line when JSON invalid (if position is available)
- Keyboard shortcut: Ctrl+Enter (Cmd+Enter on macOS) to format
- Auto-detect & auto-format on paste when pasted content is valid JSON
*/

(function () {
  // DOM elements
  const editor = document.getElementById('editor');
  const lineNumbers = document.getElementById('lineNumbers');
  const formatBtn = document.getElementById('formatBtn');
  const minifyBtn = document.getElementById('minifyBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const output = document.getElementById('output');
  const statusBar = document.getElementById('statusBar');
  const statusIcon = document.getElementById('statusIcon');
  const statusMessage = document.getElementById('statusMessage');
  const editorSection = editor.closest('section'); // used for positioning highlight

  // Create highlight overlay element (reused)
  let highlightEl = document.createElement('div');
  highlightEl.className = 'highlight-line';
  highlightEl.style.display = 'none';
  editorSection.appendChild(highlightEl);

  // Utility: set status bar message and style
  function setStatus(valid, message) {
    statusBar.classList.remove('status-valid', 'status-error');
    if (valid) {
      statusBar.classList.add('status-valid');
      statusIcon.textContent = '✅';
    } else {
      statusBar.classList.add('status-error');
      statusIcon.textContent = '❌';
    }
    statusMessage.textContent = message;
  }

  // Utility: compute line number and column from a character index
  function getLineColFromIndex(text, index) {
    const before = text.slice(0, index);
    const lines = before.split('\n');
    const line = lines.length; // 1-based
    const col = lines[lines.length - 1].length + 1; // 1-based
    return { line, col };
  }

  // Try to extract error position from SyntaxError message
  function extractPositionFromError(err) {
    if (!err || !err.message) return null;
    // Common V8 message: "Unexpected token } in JSON at position 123"
    const m = err.message.match(/at position (\d+)/i) || err.message.match(/position (\d+)/i);
    if (m) return parseInt(m[1], 10);
    // Some browsers include "char 123"
    const m2 = err.message.match(/char (\d+)/i);
    if (m2) return parseInt(m2[1], 10);
    return null;
  }

  // Show highlight for a 1-based line number
  function showHighlightForLine(lineNumber) {
    if (!lineNumber || isNaN(lineNumber) || lineNumber < 1) {
      highlightEl.style.display = 'none';
      return;
    }

    // Compute line height and paddings
    const style = getComputedStyle(editor);
    const lineHeight = parseFloat(style.lineHeight) || 18; // fallback
    const paddingTop = parseFloat(style.paddingTop) || 0;

    // Editor position relative to section
    const editorRect = editor.getBoundingClientRect();
    const sectionRect = editorSection.getBoundingClientRect();
    const offsetTop = editor.offsetTop; // distance from section top to editor's top (includes p-3 padding of section)

    // Compute top position inside section
    const top = offsetTop + paddingTop + (lineNumber - 1) * lineHeight - editor.scrollTop;

    highlightEl.style.top = top + 'px';
    highlightEl.style.height = (lineHeight + 4) + 'px';
    highlightEl.style.display = 'block';
  }

  function hideHighlight() {
    highlightEl.style.display = 'none';
  }

  // Update line numbers based on the editor content
  function updateLineNumbers() {
    const value = editor.value || '';
    const lines = value.split('\n').length || 1;
    // Build a string with numbers separated by newlines
    let out = '';
    for (let i = 1; i <= lines; i++) {
      out += i + (i === lines ? '' : '\n');
    }
    lineNumbers.textContent = out;
  }

  // Sync scrolling between textarea and lineNumbers and reposition highlight
  function syncScroll() {
    lineNumbers.scrollTop = editor.scrollTop;
    // reposition highlight if visible
    if (highlightEl.style.display !== 'none') {
      // preserve currently shown line by recomputing from status message if possible
      const msg = statusMessage.textContent || '';
      const m = msg.match(/line (\d+)/i);
      if (m) showHighlightForLine(parseInt(m[1], 10));
      else {
        // nothing
      }
    }
  }

  // Attempt to parse JSON and return {ok, value, error, pos, line, col}
  function tryParseJSON(text) {
    try {
      const parsed = JSON.parse(text);
      return { ok: true, value: parsed };
    } catch (err) {
      // Try to extract position
      const pos = extractPositionFromError(err);
      if (pos !== null) {
        const lc = getLineColFromIndex(text, pos);
        return { ok: false, error: err, pos, line: lc.line, col: lc.col };
      }
      // Fallback: return error without position
      return { ok: false, error: err };
    }
  }

  // Update the preview/output and status based on current editor content
  function validateAndUpdate(showValidMessage = true) {
    const text = editor.value.trim();
    if (text === '') {
      output.textContent = '';
      setStatus(false, 'Paste JSON to validate and format.');
      hideHighlight();
      return;
    }

    const res = tryParseJSON(text);
    if (res.ok) {
      // Pretty-print with 2 spaces
      const formatted = JSON.stringify(res.value, null, 2);
      output.textContent = formatted;
      if (showValidMessage) setStatus(true, 'Valid JSON');
      hideHighlight();
      return { valid: true, formatted };
    } else {
      // Error — show raw output or partial
      output.textContent = text;
      // If we have a line number, show it and highlight
      if (res.line) {
        setStatus(false, `Error: ${res.error.message} — line ${res.line}, column ${res.col}`);
        showHighlightForLine(res.line);
      } else {
        setStatus(false, `Error: ${res.error.message}`);
        hideHighlight();
      }
      return { valid: false, error: res.error };
    }
  }

  // Handlers for buttons
  function handleFormat() {
    const text = editor.value;
    if (!text.trim()) return;
    const res = tryParseJSON(text);
    if (res.ok) {
      const formatted = JSON.stringify(res.value, null, 2);
      editor.value = formatted;
      updateLineNumbers();
      output.textContent = formatted;
      setStatus(true, '✅ Valid JSON');
      hideHighlight();
    } else {
      // show error and highlight if possible
      if (res.line) {
        setStatus(false, `❌ Error: ${res.error.message} — line ${res.line}, column ${res.col}`);
        showHighlightForLine(res.line);
      } else {
        setStatus(false, `❌ Error: ${res.error.message}`);
        hideHighlight();
      }
      output.textContent = text;
    }
  }

  function handleMinify() {
    const text = editor.value;
    if (!text.trim()) return;
    const res = tryParseJSON(text);
    if (res.ok) {
      const minified = JSON.stringify(res.value);
      editor.value = minified;
      updateLineNumbers();
      output.textContent = minified;
      setStatus(true, '✅ Valid JSON (minified)');
      hideHighlight();
    } else {
      if (res.line) {
        setStatus(false, `❌ Error: ${res.error.message} — line ${res.line}, column ${res.col}`);
        showHighlightForLine(res.line);
      } else {
        setStatus(false, `❌ Error: ${res.error.message}`);
        hideHighlight();
      }
      output.textContent = text;
    }
  }

  async function handleCopy() {
    // prefer copying formatted output if valid
    const current = validateAndUpdate(false);
    let toCopy = editor.value;
    if (current && current.valid && current.formatted) toCopy = current.formatted;

    try {
      await navigator.clipboard.writeText(toCopy);
      setStatus(true, 'Copied to clipboard');
      setTimeout(() => validateAndUpdate(false), 1200); // restore status
    } catch (err) {
      // Fallback for older browsers
      try {
        const ta = document.createElement('textarea');
        ta.value = toCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setStatus(true, 'Copied to clipboard');
      } catch (e) {
        setStatus(false, 'Failed to copy to clipboard');
      }
    }
  }

  function handleClear() {
    editor.value = '';
    updateLineNumbers();
    output.textContent = '';
    setStatus(false, 'Editor cleared');
    hideHighlight();
  }

  // Event listeners
  editor.addEventListener('input', () => {
    updateLineNumbers();
    // Live validate but don't spam success messages — showValidMessage false
    validateAndUpdate(false);
  });

  editor.addEventListener('scroll', () => {
    syncScroll();
  });

  // Paste: attempt to auto-format if pasted content is valid JSON
  editor.addEventListener('paste', (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!text) return;
    // If clipboard text looks like JSON (starts with { or [), try to parse and format
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const res = tryParseJSON(trimmed);
      if (res.ok) {
        e.preventDefault();
        // Insert formatted text at cursor position
        const formatted = JSON.stringify(res.value, null, 2);
        // Insert manually to maintain cursor
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const before = editor.value.slice(0, start);
        const after = editor.value.slice(end);
        editor.value = before + formatted + after;
        // Move cursor to end of inserted
        const pos = before.length + formatted.length;
        editor.setSelectionRange(pos, pos);
        updateLineNumbers();
        validateAndUpdate();
      } else {
        // let paste happen; then error will show via input listener
      }
    }
  });

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter
  editor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleFormat();
    }
  });

  // Buttons
  formatBtn.addEventListener('click', handleFormat);
  minifyBtn.addEventListener('click', handleMinify);
  copyBtn.addEventListener('click', handleCopy);
  clearBtn.addEventListener('click', handleClear);

  // Resize observer: if editor font or container changes, recompute line numbers/placement
  const ro = new ResizeObserver(() => {
    updateLineNumbers();
    syncScroll();
  });
  ro.observe(editor);

  // Initial setup
  updateLineNumbers();
  validateAndUpdate(false);

  // Expose some functions for debugging (optional)
  window.JSONify = {
    updateLineNumbers,
    validateAndUpdate,
    showHighlightForLine,
    hideHighlight,
  };
})();
