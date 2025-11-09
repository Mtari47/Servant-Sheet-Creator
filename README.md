# Servant Sheet Creator

A small Flask + HTML5 web app to compose and export Fate-style Servant profile sheets.

## Features
- Enter core info (Name, Gender, Class, Alignment, Hidden Attribute)
- Biography text
- Parameters (STR, END, AGI, MANA, LUCK, NP)
- Dynamic repeatable lists: Conversation Lines, Class Skills, Personal Skills, Noble Phantasms
 - Conversation Lines (title + dialog pairs)
 - Class & Personal Skills via modal (Title, Icon, Description)
- Image by URL or local upload
- Export generated sheet to PDF, PNG, or JPEG (client-side via html2canvas + jsPDF)
- Print-friendly stylesheet (use browser print dialog)
 - Light/Dark mode toggle (top-right button, persists across sessions)

## Setup (Windows PowerShell)
```powershell
# (Optional) Create & activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run app
python app.py
```
App runs at http://127.0.0.1:5000/

## Usage
1. Fill out the form fields. Use the + buttons to add list items.
2. Choose image source (URL or Upload).
3. Add Class/Personal Skills with the modal (+ button) selecting an icon from the grid.
4. Submit to generate sheet.
5. Use Export buttons for PDF/PNG/JPEG.
6. Or use your browser's print dialog for paper.

## Notes
- Uploaded images stored under `uploads/` with random UUID filenames.
- No persistence of sheets yet; consider adding JSON save/load later.
- Max upload size: 5MB; allowed types: png, jpg, jpeg, gif, webp.

## Future Ideas
- Save/load servant sheets (JSON files)
- Authentication for multi-user usage
- Theme customization (dark/light for sheet)
- Parameter validation & rank suggestions

## License
You may adapt this freely for personal use.
