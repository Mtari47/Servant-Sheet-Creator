from pathlib import Path
from typing import Optional
from .models import Servant

class Storage:
    def __init__(self, base: Path):
        self.base = base
        self.base.mkdir(parents=True, exist_ok=True)

    def save(self, servant: Servant, file: Path) -> None:
        file.write_text(servant.to_json(), encoding='utf-8')

    def load(self, file: Path) -> Servant:
        return Servant.from_json(file.read_text(encoding='utf-8'))
