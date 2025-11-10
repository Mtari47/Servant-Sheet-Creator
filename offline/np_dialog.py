from PySide6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QTextEdit, QPushButton,
                                 QTableWidget, QTableWidgetItem, QComboBox, QScrollArea, QWidget)
from PySide6.QtCore import Qt
from .models import NoblePhantasm

class NPDialog(QDialog):
    def __init__(self, parent=None, fgo_mode: bool=False):
        super().__init__(parent)
        self.setWindowTitle('Add Noble Phantasm')
        self.fgo_mode = fgo_mode
        self.np = None
        self._build_ui()

    def _build_ui(self):
        layout = QVBoxLayout(self)
        self.title_edit = QLineEdit()
        self.rank_edit = QLineEdit()
        layout.addWidget(QLabel('Title'))
        layout.addWidget(self.title_edit)
        layout.addWidget(QLabel('Rank'))
        layout.addWidget(self.rank_edit)

        # NP Type
        self.type_combo = QComboBox()
        self.type_combo.addItems(['', 'Anti-Unit', 'Anti-Unit (Self)', 'Anti-Army', 'Anti-Fortress', 'Anti-World', 'Barrier', 'Other'])
        self.type_custom = QLineEdit()
        self.type_custom.setPlaceholderText('Custom Type')
        layout.addWidget(QLabel('Type'))
        layout.addWidget(self.type_combo)
        layout.addWidget(self.type_custom)

        # Description
        self.desc_edit = QTextEdit()
        layout.addWidget(QLabel('Description'))
        desc_scroll = QScrollArea(); desc_scroll.setWidgetResizable(True)
        dwrap = QWidget(); dvl = QVBoxLayout(dwrap); dvl.addWidget(self.desc_edit); desc_scroll.setWidget(dwrap)
        layout.addWidget(desc_scroll)

        # Effects (FGO only)
        self.effects_edit = QTextEdit()
        if self.fgo_mode:
            layout.addWidget(QLabel('NP Effects (FGO)'))
            layout.addWidget(self.effects_edit)

        # Scaling table (dynamic pre / overcharge / post)
        self.pre_table = QTableWidget(1, 6)
        self.pre_table.setHorizontalHeaderLabels(['Label', '1','2','3','4','5'])
        self.pre_table.setItem(0,0, QTableWidgetItem('Values'))
        self.overcharge_edit = QLineEdit()
        self.post_table = QTableWidget(0, 6)

        layout.addWidget(QLabel('Scaling Above Overcharge'))
        pre_scroll = QScrollArea(); pre_scroll.setWidgetResizable(True)
        pwrap = QWidget(); pvl = QVBoxLayout(pwrap); pvl.addWidget(self.pre_table); pre_scroll.setWidget(pwrap)
        layout.addWidget(pre_scroll)
        add_pre = QPushButton('Add Line Above')
        add_pre.clicked.connect(lambda: self._add_row(self.pre_table))
        layout.addWidget(add_pre)

        layout.addWidget(QLabel('Overcharge Effect'))
        layout.addWidget(self.overcharge_edit)

        layout.addWidget(QLabel('Scaling Below Overcharge'))
        post_scroll = QScrollArea(); post_scroll.setWidgetResizable(True)
        poswrap = QWidget(); posvl = QVBoxLayout(poswrap); posvl.addWidget(self.post_table); post_scroll.setWidget(poswrap)
        layout.addWidget(post_scroll)
        add_post = QPushButton('Add Line Below')
        add_post.clicked.connect(lambda: self._add_row(self.post_table))
        layout.addWidget(add_post)

        # Actions
        actions = QHBoxLayout()
        save_btn = QPushButton('Save')
        cancel_btn = QPushButton('Cancel')
        save_btn.clicked.connect(self.accept)
        cancel_btn.clicked.connect(self.reject)
        actions.addWidget(save_btn)
        actions.addWidget(cancel_btn)
        layout.addLayout(actions)

    def _add_row(self, table: QTableWidget):
        r = table.rowCount()
        table.insertRow(r)
        table.setItem(r, 0, QTableWidgetItem('Values'))

    def _collect_rows(self, table: QTableWidget):
        rows = []
        for r in range(table.rowCount()):
            label_item = table.item(r, 0)
            label = label_item.text() if label_item else 'Values'
            values = []
            for c in range(1,6):
                item = table.item(r, c)
                values.append(item.text() if item else '')
            rows.append({'label': label, 'values': values})
        return rows

    def get_np(self) -> NoblePhantasm:
        if self.exec() == QDialog.Accepted:
            t = self.type_combo.currentText().strip()
            if t == 'Other':
                t = self.type_custom.text().strip()
            np = NoblePhantasm(
                title=self.title_edit.text().strip(),
                rank=self.rank_edit.text().strip(),
                np_type=t,
                description=self.desc_edit.toPlainText().strip(),
                effects=self.effects_edit.toPlainText().strip() if self.fgo_mode else ''
            )
            np.levels = {
                'pre': self._collect_rows(self.pre_table),
                'overcharge': self.overcharge_edit.text().strip(),
                'post': self._collect_rows(self.post_table)
            }
            self.np = np
        return self.np
