# Servant Sheet Creator (Desktop Packaging)

This document covers building and running the desktop (executable) version of the Servant Sheet Creator.

## Features Parity
The desktop executable launches the same Flask web application locally:
- Create Servant form with all panels (Basic Info, Image, Parameters, Conversation Lines, Class Skills, Personal Skills, Noble Phantasms)
- Modals: Skill modal (icon picker, gameplay & scaling when FGO Mode), NP modal (dynamic pre/post scaling rows + centered Overcharge + NP Type), Card List modal
- FGO Mode toggle with hidden form flag; gating of gameplay/scaling sections
- Dynamic JSON scaling for skills and Noble Phantasms
- NP Type selection including custom "Other" input
- Export bar: PDF / PNG / JPEG (html2canvas + jsPDF)
- Local images & card list fallbacks

## Running from Source
```powershell
python run_app.py
```
This finds a free port (5000-6000), starts the server, and opens your browser to `/create`.

## Building the Executable (Windows)
```powershell
# Optional: create virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Build with PyInstaller
powershell -ExecutionPolicy Bypass -File build_exe.ps1
```
Result: `dist/ServantSheetCreator.exe`

## Running the Executable
Double-click `ServantSheetCreator.exe` or launch via PowerShell:
```powershell
./dist/ServantSheetCreator.exe
```
It will open your default browser automatically.

Uploads are stored in your user directory at `~/ServantSheetCreator_uploads` when running the frozen executable.

## Notes
- If CDN scripts fail to load (offline), consider vendoring `html2canvas` and `jspdf` into `static/vendor` and updating the template includes.
- For very large sheets the PDF export uses multi-page slicing.
- Traits and NP scaling rely on JSON serialization in hidden inputs; legacy NP arrays remain supported.

## Next Improvements
- Add local vendor fallback for export libraries automatically.
- NP Type badge in the creation preview.
- Persistent storage (save/export servant JSON, reopen later).

## Troubleshooting
| Issue | Fix |
|-------|-----|
| Browser doesn't open | Manually navigate to printed URL in console |
| Export buttons do nothing | Check console for missing libraries; ensure network access or vendor locally |
| Images missing | Place skill images in `images/` before build or supply URLs |
| Card list image 404 | Ensure file exists in `FGO Mode/QAB Card Lists/` or root fallbacks |

## License
Internal use / personal project. Provide attribution if redistributed.
