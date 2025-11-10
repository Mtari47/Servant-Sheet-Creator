from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any
import json

@dataclass
class Parameters:
    strength: str = ''
    endurance: str = ''
    agility: str = ''
    mana: str = ''
    luck: str = ''
    np: str = ''

@dataclass
class Skill:
    title: str = ''
    image: str = ''  # filename or path
    description: str = ''
    gameplay: str = ''
    # levels can be list of rows: [{label: str, values: [10 entries]}] or simple list
    levels: Any = field(default_factory=list)
    scope: str = 'personal'  # 'personal' or 'class'

@dataclass
class NPRow:
    label: str
    values: List[str]

@dataclass
class NoblePhantasm:
    title: str = ''
    rank: str = ''
    np_type: str = ''
    image_path: str = ''
    description: str = ''
    effects: str = ''
    levels: Dict[str, Any] = field(default_factory=lambda: { 'pre': [], 'overcharge': '', 'post': [] })

@dataclass
class FGOInfo:
    atk_min: str = ''
    atk_max: str = ''
    hp_min: str = ''
    hp_max: str = ''
    grail_100_atk: str = ''
    grail_100_hp: str = ''
    grail_120_atk: str = ''
    grail_120_hp: str = ''
    star_absorption: str = ''
    star_generation: str = ''
    np_charge_attack: str = ''
    np_charge_def: str = ''
    death_chance: str = ''
    traits: str = ''
    card_list: str = ''
    hits: Dict[str, str] = field(default_factory=lambda: { 'quick':'', 'arts':'', 'buster':'', 'extra':'' })

@dataclass
class Servant:
    name: str = ''
    gender: str = ''
    servant_class: str = ''
    alignment: str = ''
    hidden_attribute: str = ''
    biography: str = ''
    image_url: str = ''  # for offline, this can be a file path
    image_mode: str = 'url'  # 'url' or 'file'

    parameters: Parameters = field(default_factory=Parameters)
    conversation_lines: List[Dict[str,str]] = field(default_factory=list)
    class_skills: List[Skill] = field(default_factory=list)
    personal_skills: List[Skill] = field(default_factory=list)
    noble_phantasms: List[NoblePhantasm] = field(default_factory=list)

    fgo_mode: bool = False
    fgo: FGOInfo = field(default_factory=FGOInfo)

    def to_json(self) -> str:
        def transform(obj):
            if isinstance(obj, Servant):
                d = asdict(obj)
                return d
            return obj
        return json.dumps(transform(self), ensure_ascii=False, indent=2)

    @staticmethod
    def from_json(s: str) -> 'Servant':
        data = json.loads(s)
        srv = Servant()
        srv.__dict__.update({k:v for k,v in data.items() if k in srv.__dict__})
        # parameters
        srv.parameters = Parameters(**data.get('parameters', {}))
        # skills
        srv.class_skills = [Skill(**sk, scope='class') for sk in data.get('class_skills', [])]
        srv.personal_skills = [Skill(**sk, scope='personal') for sk in data.get('personal_skills', [])]
        # nps
        srv.noble_phantasms = [NoblePhantasm(**npd) for npd in data.get('noble_phantasms', [])]
        # fgo
        fgo = data.get('fgo', {})
        srv.fgo = FGOInfo(**fgo)
        return srv
