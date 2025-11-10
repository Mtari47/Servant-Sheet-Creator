from PySide6.QtWidgets import (QDialog, QVBoxLayout, QLabel, QListWidget, QPushButton, QHBoxLayout)
from .resources import list_card_list_images

class CardListDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle('Select Card List')
        self.selected = ''
        self._build_ui()

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.addWidget(QLabel('Choose a Card List image'))
        self.listw = QListWidget()
        for fname in list_card_list_images():
            self.listw.addItem(fname)
        layout.addWidget(self.listw)
        actions = QHBoxLayout()
        ok_btn = QPushButton('Select')
        cancel_btn = QPushButton('Cancel')
        ok_btn.clicked.connect(self._select)
        cancel_btn.clicked.connect(self.reject)
        actions.addWidget(ok_btn)
        actions.addWidget(cancel_btn)
        layout.addLayout(actions)

    def _select(self):
        item = self.listw.currentItem()
        if item:
            self.selected = item.text()
            self.accept()

    def get_selected(self) -> str:
        if self.exec() == QDialog.Accepted:
            return self.selected
        return ''
