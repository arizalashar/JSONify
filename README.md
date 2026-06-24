# JSONify

[![Live Demo](https://img.shields.io/badge/demo-live--demo-blue?label=Live%20Demo&style=for-the-badge)](https://example.com)
[![Built with Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

⚡ Fast, minimal JSON formatter & validator — runs in browser, no backend needed.

---

```markdown
Preview
```

![Preview](assets/preview.png)

---

## Features

- Paste raw JSON → auto detect and auto-format (2-space indent)
- Beautify / Format JSON (Ctrl+Enter)
- Validate JSON — shows success or error message with line & column when available
- Minify JSON — compress into a single line
- Copy to clipboard (uses Clipboard API with fallback)
- Clear editor
- Line numbers on the left side of the editor
- Error highlighting — shows the offending line when position information is available
- Responsive layout: split view on desktop, stacked on mobile

## Tech Stack

- HTML (vanilla)
- Tailwind CSS (CDN)
- JavaScript (vanilla)
- No backend, no npm — just open `index.html`

## Quick Start

1. Clone or download this repository.
2. Open `index.html` in your browser (Chrome, Firefox, Edge, Safari).

That's it — the app runs completely in the browser.

## Usage

- Paste JSON into the left editor. If the pasted content begins with `{` or `[` and is valid JSON it will be auto-formatted.
- Click "Format" or press `Ctrl+Enter` (or `Cmd+Enter` on macOS) to format the current content.
- Click "Minify" to collapse JSON into a single line.
- Click "Copy" to copy the formatted JSON to clipboard.
- Click "Clear" to empty the editor.
- The status bar below the editor shows `✅ Valid JSON` or `❌ Error: ...` with line/column details when available.

## File Structure

JSONify/
├── index.html
├── style.css
├── app.js
└── README.md

## Notes & Limitations

- Error line highlighting depends on the browser-provided JSON parser error message. Some browsers include the error position (character offset), which we convert to line/column; if not available we still display the parser message but cannot highlight exact line.
- Clipboard write requires a secure context (HTTPS) or `localhost`.

## Contributing

This is intentionally small and dependency-free. Contributions are welcome — open issues or PRs for enhancements.

## License

MIT License

Copyright (c) 2026 arizalashar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
