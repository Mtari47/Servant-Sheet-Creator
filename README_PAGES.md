# Servant Sheet Creator (GitHub Pages Static Version)

This repository now includes a fully client-side (static) version of the Servant Sheet Creator that runs directly on GitHub Pages without any server. All processing (form handling, sheet rendering, export to PNG/PDF) is executed in the browser.

## Live Site
Visit the GitHub Pages deployment (gh-pages branch) to use the tool immediately.

## Features
- Basic servant info entry
- FGO Mode toggle (stats, traits, card list image URL, hit counts)
- Dynamic conversation line additions
- Class vs Personal skills with optional gameplay notes and scaling tables (levels 1–10)
- Noble Phantasms with dynamic pre/post scaling rows, centered Overcharge effect, NP Type (including custom)
- Portrait via URL or local file (file is never uploaded; browser Object URL used)
- Export to PNG or PDF via html2canvas + jsPDF

## Differences vs Flask Version
| Aspect | Flask Version | Static (Pages) Version |
|--------|---------------|------------------------|
| Image uploads | Stored on server /uploads | Local file reference only (Object URL) |
| Skill / Card List image listing | Enumerated from server directories | Provide URLs manually or add assets directly |
| Persistence | Could be added server-side | Use browser save (Export PNG/PDF) or manually copy JSON (future) |
| Rendering | Jinja2 templates | Client-side DOM builder (pages_app.js) |
| Packaging | PyInstaller EXE (web/offline) | Pure static, no build step |

## Local Development
You can open `index.html` directly in a browser (no server needed). For local edits:
1. Clone repo.
2. Open `index.html` in your browser or serve with a simple static server if needed.
3. Modify `static/js/pages_app.js` for logic changes; adjust `static/css/style.css` for styling.

## Adding Built-In Asset Lists
If you want thumbnails for skills or card lists like the Flask version, add an assets JSON and fetch it on load, or hardcode arrays inside `pages_app.js`. Example stub:
```js
const SKILL_ICONS = [ 'static/skills/icon1.png', 'static/skills/icon2.png' ];
```
Then render selectable icons similar to the dynamic dialog patterns.

## Future Enhancements
- JSON import/export (allow reloading a saved sheet state)
- LocalStorage autosave/recovery
- Multi-page PDF slicing (for very tall sheets)
- Embedded asset gallery for skills/card lists

## Offline Desktop Version
The PySide6 offline GUI remains available (not used by GitHub Pages). Run:
```powershell
python -m offline.offline_main
```

## License / Attribution
Ensure any third-party assets (icons, card list images) you add are licensed appropriately. The core code uses html2canvas and jsPDF via CDN.

---
*Static version implemented to remove dependency on a server so users can generate sheets directly from the GitHub Pages site.*
