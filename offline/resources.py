import os, sys
from pathlib import Path

APP_ROOT = Path(getattr(sys, '_MEIPASS', Path(__file__).resolve().parent.parent))
USER_DATA = Path.home() / 'ServantSheetCreator_offline'
IMAGES_DIR = APP_ROOT / 'images'
CARD_LIST_DIR = APP_ROOT / 'FGO Mode' / 'QAB Card Lists'
UPLOADS_DIR = USER_DATA / 'uploads'

for p in (USER_DATA, UPLOADS_DIR):
    p.mkdir(parents=True, exist_ok=True)

def list_skill_images():
    if IMAGES_DIR.is_dir():
        return sorted([f for f in os.listdir(IMAGES_DIR) if f.lower().endswith(('.png','.jpg','.jpeg','.gif','.webp'))])
    return []

def list_card_list_images():
    if CARD_LIST_DIR.is_dir():
        return sorted([f for f in os.listdir(CARD_LIST_DIR) if f.lower().endswith(('.png','.jpg','.jpeg','.gif','.webp'))])
    return []

def skill_icon_path(filename: str) -> str:
    p = IMAGES_DIR / filename
    return str(p) if p.exists() else ''

def card_list_path(filename: str) -> str:
    p = CARD_LIST_DIR / filename
    return str(p) if p.exists() else ''
