from PySide6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QTextEdit, QPushButton,
                                 QScrollArea, QWidget, QGridLayout, QTableWidget, QTableWidgetItem)
from PySide6.QtCore import Qt
from .models import Skill
from .resources import list_skill_images, IMAGES_DIR

class SkillDialog(QDialog):
    def __init__(self, parent=None, fgo_mode: bool=False, scope: str='personal'):
        super().__init__(parent)
        self.setWindowTitle('Add Skill')
        self.scope = scope
        self.fgo_mode = fgo_mode
        self.skill = None
        self._build_ui()

    def _build_ui(self):
        layout = QVBoxLayout(self)
        self.title_edit = QLineEdit()
        self.desc_edit = QTextEdit()
        layout.addWidget(QLabel('Title'))
        layout.addWidget(self.title_edit)
        layout.addWidget(QLabel('Description'))
        desc_scroll = QScrollArea(); desc_scroll.setWidgetResizable(True)
        desc_wrap = QWidget(); dvl = QVBoxLayout(desc_wrap); dvl.addWidget(self.desc_edit); desc_scroll.setWidget(desc_wrap)
        layout.addWidget(desc_scroll)

        # Image grid
        imgs = list_skill_images()
        grid_container = QWidget()
        grid = QGridLayout(grid_container)
        self.image_buttons = []
        for i, fname in enumerate(imgs):
            btn = QPushButton(fname)
            btn.setCheckable(True)
            btn.clicked.connect(lambda checked, b=btn: self._select_image(b))
            grid.addWidget(btn, i//4, i%4)
            self.image_buttons.append(btn)
        scroll = QScrollArea()
        scroll.setWidget(grid_container)
        scroll.setWidgetResizable(True)
        scroll.setMinimumHeight(180)
        layout.addWidget(QLabel('Choose Icon'))
        layout.addWidget(scroll)

        # Gameplay (FGO only)
        self.gameplay_edit = QTextEdit()
        if self.scope == 'personal' and self.fgo_mode:
            layout.addWidget(QLabel('Gameplay Info (FGO)'))
            layout.addWidget(self.gameplay_edit)

        # Levels table (personal + fgo)
        self.levels_table = None
        if self.scope == 'personal' and self.fgo_mode:
            self.levels_table = QTableWidget(1, 11)
            headers = ['Label'] + [str(i) for i in range(1,11)]
            self.levels_table.setHorizontalHeaderLabels(headers)
            self.levels_table.setItem(0,0, QTableWidgetItem('Values'))
            layout.addWidget(QLabel('Scaling (Levels 1-10)'))
            level_scroll = QScrollArea(); level_scroll.setWidgetResizable(True)
            level_wrap = QWidget(); lvl = QVBoxLayout(level_wrap); lvl.addWidget(self.levels_table); level_scroll.setWidget(level_wrap)
            layout.addWidget(level_scroll)
            add_row_btn = QPushButton('Add Line')
            add_row_btn.clicked.connect(self._add_row)
            layout.addWidget(add_row_btn)

        # Actions
        actions = QHBoxLayout()
        save_btn = QPushButton('Save')
        cancel_btn = QPushButton('Cancel')
        save_btn.clicked.connect(self.accept)
        cancel_btn.clicked.connect(self.reject)
        actions.addWidget(save_btn)
        actions.addWidget(cancel_btn)
        layout.addLayout(actions)

    def _select_image(self, btn):
        for b in self.image_buttons:
            if b is btn:
                b.setChecked(True)
            else:
                b.setChecked(False)

    def _add_row(self):
        r = self.levels_table.rowCount()
        self.levels_table.insertRow(r)
        self.levels_table.setItem(r, 0, QTableWidgetItem('Values'))

    def get_skill(self) -> Skill:
        if self.exec() == QDialog.Accepted:
            image = ''
            for b in self.image_buttons:
                if b.isChecked():
                    image = b.text()
                    break
            levels = []
            if self.levels_table:
                for r in range(self.levels_table.rowCount()):
                    label_item = self.levels_table.item(r,0)
                    label = label_item.text() if label_item else 'Values'
                    values = []
                    for c in range(1,11):
                        item = self.levels_table.item(r,c)
                        values.append(item.text() if item else '')
                    levels.append({'label': label, 'values': values})
            self.skill = Skill(title=self.title_edit.text().strip(),
                               image=image,
                               description=self.desc_edit.toPlainText().strip(),
                               gameplay=self.gameplay_edit.toPlainText().strip() if (self.scope=='personal' and self.fgo_mode) else '',
                               levels=levels if levels else [],
                               scope=self.scope)
        return self.skill
