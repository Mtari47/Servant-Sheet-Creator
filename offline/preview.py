from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QHBoxLayout, QTableWidget, QTableWidgetItem, QGroupBox
from PySide6.QtGui import QPixmap
from PySide6.QtCore import Qt
from .models import Servant
from .resources import skill_icon_path, card_list_path

class PreviewWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._servant = None
        self._layout = QVBoxLayout(self)
        self._layout.setAlignment(Qt.AlignTop)

    def set_servant(self, servant: Servant):
        self._servant = servant
        self._rebuild()

    def _clear(self):
        while self._layout.count():
            item = self._layout.takeAt(0)
            w = item.widget()
            if w:
                w.deleteLater()

    def _rebuild(self):
        self._clear()
        s = self._servant
        if not s:
            return
        # Header with image and basic info
        header = QHBoxLayout()
        if s.image_url:
            img = QLabel()
            pm = QPixmap(s.image_url)
            if not pm.isNull():
                img.setPixmap(pm.scaledToWidth(220, Qt.SmoothTransformation))
            header.addWidget(img)
        info_box = QVBoxLayout()
        info_box.addWidget(QLabel(f"<h2>{s.name or 'Unnamed Servant'}</h2>"))
        meta = QLabel(f"Gender: {s.gender} | Class: {s.servant_class} | Alignment: {s.alignment} | Hidden: {s.hidden_attribute}")
        info_box.addWidget(meta)
        header_wrap = QWidget(); header_wrap.setLayout(header)
        header.addLayout(info_box)
        self._layout.addWidget(header_wrap)

        # Biography
        bio_group = QGroupBox('Biography')
        bio_v = QVBoxLayout(bio_group)
        bio_v.addWidget(QLabel(s.biography))
        self._layout.addWidget(bio_group)

        # Parameters
        param_group = QGroupBox('Parameters')
        p_v = QVBoxLayout(param_group)
        table = QTableWidget(1,6)
        table.setHorizontalHeaderLabels(['STR','END','AGI','MANA','LUCK','NP'])
        vals = [s.parameters.strength, s.parameters.endurance, s.parameters.agility, s.parameters.mana, s.parameters.luck, s.parameters.np]
        for i,v in enumerate(vals):
            table.setItem(0,i,QTableWidgetItem(v))
        p_v.addWidget(table)
        self._layout.addWidget(param_group)

        # FGO Stats
        if s.fgo_mode:
            fgo_group = QGroupBox('FGO Stats')
            f_v = QVBoxLayout(fgo_group)
            f_v.addWidget(QLabel(f"ATK: {s.fgo.atk_min} - {s.fgo.atk_max} | HP: {s.fgo.hp_min} - {s.fgo.hp_max}"))
            f_v.addWidget(QLabel(f"Lv100: {s.fgo.grail_100_atk} / {s.fgo.grail_100_hp} | Lv120: {s.fgo.grail_120_atk} / {s.fgo.grail_120_hp}"))
            f_v.addWidget(QLabel(f"Star Abs: {s.fgo.star_absorption} | Star Gen %: {s.fgo.star_generation} | NP Chg Atk %: {s.fgo.np_charge_attack} | NP Chg Def %: {s.fgo.np_charge_def}"))
            f_v.addWidget(QLabel(f"Death Chance %: {s.fgo.death_chance}"))
            if s.fgo.traits:
                f_v.addWidget(QLabel(f"Traits: {s.fgo.traits}"))
            if s.fgo.card_list:
                path = card_list_path(s.fgo.card_list)
                if path:
                    cl = QLabel(); pm = QPixmap(path)
                    if not pm.isNull():
                        cl.setPixmap(pm)
                    f_v.addWidget(cl)
            f_v.addWidget(QLabel(f"Hits: Q {s.fgo.hits.get('quick','')} / A {s.fgo.hits.get('arts','')} / B {s.fgo.hits.get('buster','')} / Ex {s.fgo.hits.get('extra','')}"))
            self._layout.addWidget(fgo_group)

        # Conversation
        if s.conversation_lines:
            conv_group = QGroupBox('Conversation Lines')
            c_v = QVBoxLayout(conv_group)
            for pair in s.conversation_lines:
                c_v.addWidget(QLabel(f"<b>{pair.get('title','')}</b>"))
                c_v.addWidget(QLabel(pair.get('text','')))
            self._layout.addWidget(conv_group)

        # Class skills
        if s.class_skills:
            cs_group = QGroupBox('Passive Skills' if s.fgo_mode else 'Class Skills')
            cs_v = QVBoxLayout(cs_group)
            for sk in s.class_skills:
                line = QHBoxLayout()
                if sk.image:
                    p = skill_icon_path(sk.image)
                    if p:
                        icon = QLabel(); pm = QPixmap(p)
                        if not pm.isNull():
                            icon.setPixmap(pm.scaled(48,48,Qt.KeepAspectRatio, Qt.SmoothTransformation))
                        line.addWidget(icon)
                text = QVBoxLayout(); text.addWidget(QLabel(f"<b>{sk.title}</b>")); text.addWidget(QLabel(sk.description))
                if s.fgo_mode and sk.gameplay:
                    text.addWidget(QLabel(f"<i>{sk.gameplay}</i>"))
                wrap = QWidget(); wrap.setLayout(line)
                line.addLayout(text)
                cs_v.addWidget(wrap)
            self._layout.addWidget(cs_group)

        # Personal skills
        if s.personal_skills:
            ps_group = QGroupBox('Active Skills' if s.fgo_mode else 'Personal Skills')
            ps_v = QVBoxLayout(ps_group)
            for sk in s.personal_skills:
                line = QHBoxLayout()
                if sk.image:
                    p = skill_icon_path(sk.image)
                    if p:
                        icon = QLabel(); pm = QPixmap(p)
                        if not pm.isNull():
                            icon.setPixmap(pm.scaled(48,48,Qt.KeepAspectRatio, Qt.SmoothTransformation))
                        line.addWidget(icon)
                text = QVBoxLayout(); text.addWidget(QLabel(f"<b>{sk.title}</b>")); text.addWidget(QLabel(sk.description))
                if s.fgo_mode and sk.gameplay:
                    text.addWidget(QLabel(f"<i>{sk.gameplay}</i>"))
                # Scaling table
                if s.fgo_mode and sk.levels:
                    tbl = QTableWidget()
                    # detect structured rows
                    if isinstance(sk.levels, list) and sk.levels and isinstance(sk.levels[0], dict) and 'values' in sk.levels[0]:
                        tbl.setColumnCount(11); tbl.setHorizontalHeaderLabels(['Lvl'] + [str(i) for i in range(1,11)])
                        tbl.setRowCount(len(sk.levels))
                        for r, row in enumerate(sk.levels):
                            tbl.setItem(r,0,QTableWidgetItem(row.get('label','Values')))
                            for c, v in enumerate(row.get('values', []), start=1):
                                tbl.setItem(r,c,QTableWidgetItem(v))
                    elif isinstance(sk.levels, list):
                        tbl.setColumnCount(11); tbl.setHorizontalHeaderLabels(['Lvl'] + [str(i) for i in range(1,11)])
                        tbl.setRowCount(1)
                        tbl.setItem(0,0,QTableWidgetItem('Values'))
                        for c, v in enumerate(sk.levels, start=1):
                            tbl.setItem(0,c,QTableWidgetItem(str(v)))
                    text.addWidget(tbl)
                wrap = QWidget(); wrap.setLayout(line)
                line.addLayout(text)
                ps_v.addWidget(wrap)
            self._layout.addWidget(ps_group)

        # Noble Phantasms
        if s.noble_phantasms:
            np_group = QGroupBox('Noble Phantasm(s)')
            np_v = QVBoxLayout(np_group)
            for np in s.noble_phantasms:
                line = QVBoxLayout()
                title = f"<b>{np.title}</b>"
                if np.rank:
                    title += f" <span>({np.rank})</span>"
                if np.np_type:
                    title += f" <span>[{np.np_type}]</span>"
                line.addWidget(QLabel(title))
                if np.description:
                    line.addWidget(QLabel(np.description))
                if s.fgo_mode and np.effects:
                    line.addWidget(QLabel(f"<i>{np.effects}</i>"))
                if np.levels:
                    tbl = QTableWidget()
                    tbl.setColumnCount(6); tbl.setHorizontalHeaderLabels(['Label','1','2','3','4','5'])
                    pre = np.levels.get('pre', []) if isinstance(np.levels, dict) else []
                    post = np.levels.get('post', []) if isinstance(np.levels, dict) else []
                    rows = pre + post
                    tbl.setRowCount(len(rows) + 1)
                    # Overcharge centered row
                    orow = 0
                    for r, row in enumerate(pre):
                        tbl.setItem(orow,0,QTableWidgetItem(row.get('label','Values')))
                        for c, v in enumerate(row.get('values', []), start=1):
                            tbl.setItem(orow,c,QTableWidgetItem(v))
                        orow += 1
                    # overcharge row text only
                    oc = np.levels.get('overcharge','') if isinstance(np.levels, dict) else ''
                    tbl.setSpan(orow,0,1,6)
                    tbl.setItem(orow,0,QTableWidgetItem(f"Overcharge Effect: {oc}"))
                    orow += 1
                    for row in post:
                        tbl.setItem(orow,0,QTableWidgetItem(row.get('label','Values')))
                        for c, v in enumerate(row.get('values', []), start=1):
                            tbl.setItem(orow,c,QTableWidgetItem(v))
                        orow += 1
                    line.addWidget(tbl)
                box = QWidget(); box.setLayout(line)
                np_v.addWidget(box)
            self._layout.addWidget(np_group)
