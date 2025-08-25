# Terminal Portfolio

An interactive terminal-style portfolio website built with HTML, CSS, and JavaScript.

## Performance test

- **Lighting fast and stable**: Most resources load from memory or disk cache, ensuring near-instant page loads

## Features

- **Terminal Interface**: `ls`, `cd`, `cat`, history, autocomplete
- **Absolute paths**: `cat ~/about/about.txt` and (from home only) `cat about/about.txt`
- **Downloads**: `wget` supports any `.pdf` path or URL, e.g. `wget ~/about/text_resume.pdf`
- **Markdown rendering**: `cat` on `.md` files (e.g., `cat ~/README.md`) renders safely
- **Sanitized HTML output**: All HTML is sanitized to prevent XSS
- **Theme**: `theme dark|light|auto` with system preference support
- **Zoom**: Cmd/Ctrl `+` / `-` / `0` magnifies text (persists)

## File Structure

```
terminal_portfolia/
├── index.html
├── styles.css
├── js/
│   ├── core/
│   │   └── terminal.js          # Core terminal (history, output, safe HTML)
│   ├── commands/
│   │   └── commandProcessor.js  # All commands + path resolution
│   ├── features/
│   │   └── autocomplete.js      # Tab completion
│   ├── data/
│   │   └── dataManager.js       # Loads split data + Ajv validation
│   ├── ui/
│   │   └── uiManager.js         # UI caret, etc.
│   ├── utils/
│   │   ├── sanitize.js          # Safe HTML sanitizer
│   │   └── markdown.js          # Minimal safe Markdown renderer
│   └── app.js                   # App boot (theme, zoom, wiring)
├── data/
│   ├── about.json
│   ├── skills.json
│   ├── contact.json
│   ├── projects.json
│   ├── education.json
│   ├── experience.json
│   ├── directories.json         # Virtual filesystem map
│   └── schema.json              # JSON Schema for validation (Ajv)
└── README.md
```

## Customization

- Edit content in `data/*.json`. Top-level navigation comes from `data/directories.json`.
- Data is validated against `data/schema.json` via Ajv at load.
- Add PDFs (e.g., `text_resume.pdf`) to the project; they can be downloaded via `wget <path>.pdf` with no code changes.
- Add Markdown files anywhere and view with `cat <path>.md`.

## Available Commands

- `help` — Show commands
- `welcome` — Show welcome
- `ls` — List files/sections
- `cd [section]` — Change section
- `pwd` — Print working dir
- `cat [file|path]` — View `.txt` or `.md`. Examples:
  - From home: `cat about/about.txt` or `cat ~/about/about.txt`
  - From other dirs: use `~/about/about.txt`
- `wget <file|path>` — Download `.pdf` by relative or absolute path, or full URL
- `theme [dark|light|auto]` — Set/toggle theme
- `social` — Show social links
- `open <url|alias>` — Open URL/alias (`github`, `linkedin`, `email`)
- `history [clear]` — Show/clear command history
- `sudo su` — Gain root (enables `nano`, `rm`, `touch`)

### Keyboard shortcuts

- Arrow Up/Down: navigate command history
- Tab: autocomplete commands/args
- Cmd/Ctrl + / - / 0: zoom text in/out/reset (persists)

---
