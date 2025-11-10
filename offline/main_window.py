from PySide6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QTextEdit,
                                 QPushButton, QTabWidget, QCheckBox, QListWidget, QSpinBox, QFileDialog, QMessageBox,
                                 QTableWidget, QTableWidgetItem)
from PySide6.QtCore import Qt
from .models import Servant, Parameters, Skill, NoblePhantasm
from .skill_dialog import SkillDialog
from .np_dialog import NPDialog
from .card_list_dialog import CardListDialog
from .resources import IMAGES_DIR, CARD_LIST_DIR
from .preview import PreviewWidget

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('Servant Sheet Creator (Offline)')
        self.servant = Servant()
        self._build_ui()

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        tabs = QTabWidget()
        layout.addWidget(tabs)

        # Basic Info tab
        info = QWidget(); info_l = QVBoxLayout(info)
        self.name_edit = QLineEdit(); self.gender_edit = QLineEdit(); self.class_edit = QLineEdit(); self.align_edit = QLineEdit(); self.hidden_edit = QLineEdit()
        self.bio_edit = QTextEdit()
        for label, widget in [('Name', self.name_edit), ('Gender', self.gender_edit), ('Class', self.class_edit), ('Alignment', self.align_edit), ('Hidden Attribute', self.hidden_edit)]:
            info_l.addWidget(QLabel(label))
            info_l.addWidget(widget)
        info_l.addWidget(QLabel('Biography'))
        info_l.addWidget(self.bio_edit)
        tabs.addTab(info, 'Basic Info')

        # Parameters tab
        params = QWidget(); p_l = QVBoxLayout(params)
        self.param_edits = { 'strength': QLineEdit(), 'endurance': QLineEdit(), 'agility': QLineEdit(), 'mana': QLineEdit(), 'luck': QLineEdit(), 'np': QLineEdit() }
        for label, key in [('STR','strength'),('END','endurance'),('AGI','agility'),('MANA','mana'),('LUCK','luck'),('NP','np')]:
            p_l.addWidget(QLabel(label)); p_l.addWidget(self.param_edits[key])
        tabs.addTab(params, 'Parameters')

        # FGO Mode toggle
        self.fgo_check = QCheckBox('FGO Mode')
        layout.addWidget(self.fgo_check)
        self.fgo_check.toggled.connect(lambda state: (setattr(self.servant, 'fgo_mode', state), self.preview.set_servant(self.servant)))

        # Conversation tab
        conv = QWidget(); c_l = QVBoxLayout(conv)
        self.conv_list = QListWidget()
        add_conv = QPushButton('Add Conversation Pair')
        add_conv.clicked.connect(self._add_conversation)
        c_l.addWidget(self.conv_list)
        c_l.addWidget(add_conv)
        tabs.addTab(conv, 'Conversation')

        # Skills tab
        skills = QWidget(); s_l = QVBoxLayout(skills)
        self.class_list = QListWidget(); self.personal_list = QListWidget()
        add_class = QPushButton('Add Class Skill')
        add_class.clicked.connect(lambda: self._add_skill('class'))
        add_personal = QPushButton('Add Personal Skill')
        add_personal.clicked.connect(lambda: self._add_skill('personal'))
        s_l.addWidget(QLabel('Class Skills'))
        s_l.addWidget(self.class_list)
        s_l.addWidget(add_class)
        s_l.addWidget(QLabel('Personal Skills'))
        s_l.addWidget(self.personal_list)
        s_l.addWidget(add_personal)
        tabs.addTab(skills, 'Skills')

        # NPs tab
        nps = QWidget(); n_l = QVBoxLayout(nps)
        self.np_list = QListWidget()
        add_np = QPushButton('Add Noble Phantasm')
        add_np.clicked.connect(self._add_np)
        n_l.addWidget(self.np_list)
        n_l.addWidget(add_np)
        tabs.addTab(nps, 'NPs')

        # FGO tab (stats)
        fgop = QWidget(); f_l = QVBoxLayout(fgop)
        self.fgo_edits = {k: QLineEdit() for k in ['atk_min','atk_max','hp_min','hp_max','grail_100_atk','grail_100_hp','grail_120_atk','grail_120_hp','star_absorption','star_generation','np_charge_attack','np_charge_def','death_chance']}
        for k in self.fgo_edits:
            f_l.addWidget(QLabel(k.replace('_',' ').title())); f_l.addWidget(self.fgo_edits[k])
        self.card_list_btn = QPushButton('Select Card List')
        self.card_list_btn.clicked.connect(self._select_card_list)
        f_l.addWidget(self.card_list_btn)
        self.hit_quick = QLineEdit(); self.hit_arts = QLineEdit(); self.hit_buster = QLineEdit(); self.hit_extra = QLineEdit()
        for label, w in [('Quick Hits', self.hit_quick), ('Arts Hits', self.hit_arts), ('Buster Hits', self.hit_buster), ('Extra Hits', self.hit_extra)]:
            f_l.addWidget(QLabel(label)); f_l.addWidget(w)
        tabs.addTab(fgop, 'FGO Stats')

        # Preview (live)
        self.preview = PreviewWidget()
        layout.addWidget(self.preview)

        # Actions
        actions = QHBoxLayout()
        export_png = QPushButton('Export PNG'); export_pdf = QPushButton('Export PDF')
        save_btn = QPushButton('Save Sheet'); load_btn = QPushButton('Load Sheet')
        export_png.clicked.connect(self._export_png)
        export_pdf.clicked.connect(self._export_pdf)
        save_btn.clicked.connect(self._save)
        load_btn.clicked.connect(self._load)
        actions.addWidget(export_png); actions.addWidget(export_pdf); actions.addWidget(save_btn); actions.addWidget(load_btn)
        layout.addLayout(actions)

    def _add_conversation(self):
        # Simple input sequence
        from PySide6.QtWidgets import QInputDialog
        title, ok = QInputDialog.getText(self, 'Conversation Title', 'Title:')
        if not ok: return
        text, ok = QInputDialog.getMultiLineText(self, 'Conversation Text', 'Text:')
        if not ok: return
        # Add to list and model then refresh preview
        self.conv_list.addItem(f"{title}: {text[:30]}...")
        self.servant.conversation_lines.append({'title': title, 'text': text})
        self.preview.set_servant(self.servant)

    def _add_skill(self, scope: str):
        dlg = SkillDialog(self, fgo_mode=self.fgo_check.isChecked(), scope=scope)
        sk = dlg.get_skill()
        if sk:
            if scope == 'class':
                self.class_list.addItem(sk.title)
                self.servant.class_skills.append(sk)
            else:
                self.personal_list.addItem(sk.title)
                self.servant.personal_skills.append(sk)
            self.preview.set_servant(self.servant)

    def _add_np(self):
        dlg = NPDialog(self, fgo_mode=self.fgo_check.isChecked())
        np = dlg.get_np()
        if np:
            self.np_list.addItem(np.title)
            self.servant.noble_phantasms.append(np)
            self.preview.set_servant(self.servant)

    def _select_card_list(self):
        dlg = CardListDialog(self)
        sel = dlg.get_selected()
        if sel:
            self.card_list_btn.setText(f'Card List: {sel}')
            self.servant.fgo.card_list = sel
            self.preview.set_servant(self.servant)

    def _export_png(self):
        from .export import Exporter
        from PySide6.QtWidgets import QFileDialog
        path, _ = QFileDialog.getSaveFileName(self, 'Save PNG', filter='PNG Files (*.png)')
        if path:
            Exporter.to_image(self.centralWidget(), path, 'PNG')

    def _export_pdf(self):
        from .export import Exporter
        from PySide6.QtWidgets import QFileDialog
        path, _ = QFileDialog.getSaveFileName(self, 'Save PDF', filter='PDF Files (*.pdf)')
        if path:
            Exporter.to_pdf(self.centralWidget(), path)

    def _save(self):
        from .storage import Storage
        from pathlib import Path
        from PySide6.QtWidgets import QFileDialog
        # Collect from UI into self.servant
        self.servant.name = self.name_edit.text().strip()
        self.servant.gender = self.gender_edit.text().strip()
        self.servant.servant_class = self.class_edit.text().strip()
        self.servant.alignment = self.align_edit.text().strip()
        self.servant.hidden_attribute = self.hidden_edit.text().strip()
        self.servant.biography = self.bio_edit.toPlainText().strip()
        self.servant.fgo_mode = self.fgo_check.isChecked()
        for k, w in self.param_edits.items():
            setattr(self.servant.parameters, k, w.text().strip())
        for k, w in self.fgo_edits.items():
            setattr(self.servant.fgo, k, w.text().strip())
        self.servant.fgo.card_list = self.card_list_btn.text().replace('Card List: ','') if 'Card List:' in self.card_list_btn.text() else ''
        self.servant.fgo.hits = {'quick': self.hit_quick.text().strip(), 'arts': self.hit_arts.text().strip(), 'buster': self.hit_buster.text().strip(), 'extra': self.hit_extra.text().strip()}
        # Update preview model and save to JSON
        self.preview.set_servant(self.servant)
        path, _ = QFileDialog.getSaveFileName(self, 'Save Sheet JSON', filter='JSON Files (*.json)')
        if path:
            Storage(Path.home()/ 'ServantSheetCreator_offline').save(self.servant, Path(path))

    def _load(self):
        from .storage import Storage
        from pathlib import Path
        from PySide6.QtWidgets import QFileDialog
        path, _ = QFileDialog.getOpenFileName(self, 'Open Sheet JSON', filter='JSON Files (*.json)')
        if path:
            srv = Storage(Path.home()/ 'ServantSheetCreator_offline').load(Path(path))
            self.servant = srv
            # Minimal UI population (extend as needed)
            self.name_edit.setText(srv.name)
            self.gender_edit.setText(srv.gender)
            self.class_edit.setText(srv.servant_class)
            self.align_edit.setText(srv.alignment)
            self.hidden_edit.setText(srv.hidden_attribute)
            self.bio_edit.setPlainText(srv.biography)
            self.fgo_check.setChecked(srv.fgo_mode)
            for k, w in self.param_edits.items():
                w.setText(getattr(srv.parameters, k))
            for k, w in self.fgo_edits.items():
                w.setText(getattr(srv.fgo, k))
            if srv.fgo.card_list:
                self.card_list_btn.setText(f'Card List: {srv.fgo.card_list}')
            self.hit_quick.setText(srv.fgo.hits.get('quick',''))
            self.hit_arts.setText(srv.fgo.hits.get('arts',''))
            self.hit_buster.setText(srv.fgo.hits.get('buster',''))
            self.hit_extra.setText(srv.fgo.hits.get('extra',''))
            # Repopulate lists
            self.conv_list.clear()
            for pair in srv.conversation_lines:
                self.conv_list.addItem(f"{pair.get('title','')}: {pair.get('text','')[:30]}...")
            self.class_list.clear(); self.personal_list.clear(); self.np_list.clear()
            for sk in srv.class_skills:
                self.class_list.addItem(sk.title)
            for sk in srv.personal_skills:
                self.personal_list.addItem(sk.title)
            for np in srv.noble_phantasms:
                self.np_list.addItem(np.title)
            self.preview.set_servant(srv)
