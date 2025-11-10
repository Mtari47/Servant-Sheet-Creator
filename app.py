from flask import Flask, render_template, request, redirect, url_for, send_from_directory, flash
from werkzeug.utils import secure_filename
import os
import uuid
import json

app = Flask(__name__)
app.secret_key = "dev-secret-key"  # replace for production

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
IMAGES_FOLDER = os.path.join(os.path.dirname(__file__), 'images')
PRIMARY_QAB_FOLDER = os.path.join(os.path.dirname(__file__), 'FGO Mode', 'QAB Card Lists')
# Use the existing folder inside FGO Mode as the authoritative source; keep secondary fallbacks if user migrates later.
CARD_LIST_FALLBACKS = [
    PRIMARY_QAB_FOLDER,
    os.path.join(os.path.dirname(__file__), 'QAB Card Lists'),  # legacy root-level
    os.path.join(os.path.dirname(__file__), 'static', 'QAB Card Lists'),
    os.path.join(os.path.dirname(__file__), 'QAB_Card_Lists'),
]
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
# Do not create a new root-level folder; rely on existing structure. Create primary only if absent.
if not os.path.exists(PRIMARY_QAB_FOLDER):
    os.makedirs(PRIMARY_QAB_FOLDER)

# Jinja filter to safely parse JSON strings in templates (used for FGO dynamic scaling)
@app.template_filter('fromjson')
def fromjson_filter(value):
    if not value:
        return None
    try:
        return json.loads(value)
    except Exception:
        return None

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return redirect(url_for('create_servant'))

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/skill-images/<path:filename>')
def skill_image(filename):
    # Serve images from the local images folder (provided by user)
    return send_from_directory(IMAGES_FOLDER, filename)

@app.route('/card-list-images/<path:filename>')
def card_list_image(filename):
    for folder in CARD_LIST_FALLBACKS:
        path = os.path.join(folder, filename)
        if os.path.isfile(path):
            return send_from_directory(folder, filename)
    # 404 fallback: serve from primary (will fail if missing)
    return send_from_directory(PRIMARY_QAB_FOLDER, filename)

def list_skill_images():
    files = []
    if os.path.isdir(IMAGES_FOLDER):
        for fname in os.listdir(IMAGES_FOLDER):
            if allowed_file(fname):
                files.append(fname)
    files.sort(key=lambda s: s.lower())
    return files

def list_card_list_images():
    """Aggregate card list images from primary folder and fallbacks.
    This makes the system more forgiving if the user placed files in a different location.
    """
    seen = set()
    files = []
    for folder in CARD_LIST_FALLBACKS:
        if os.path.isdir(folder):
            for fname in os.listdir(folder):
                if allowed_file(fname) and fname not in seen:
                    seen.add(fname)
                    files.append(fname)
    files.sort(key=lambda s: s.lower())
    return files

@app.route('/create', methods=['GET', 'POST'])
def create_servant():
    if request.method == 'POST':
        # Collect form data
        form = request.form
        servant = {
            'name': form.get('name', '').strip(),
            'gender': form.get('gender', '').strip(),
            'servant_class': form.get('servant_class', '').strip(),
            'alignment': form.get('alignment', '').strip(),
            'hidden_attribute': form.get('hidden_attribute', '').strip(),
            'biography': form.get('biography', '').strip(),
            'parameters': {
                'strength': form.get('param_strength', '').strip(),
                'endurance': form.get('param_endurance', '').strip(),
                'agility': form.get('param_agility', '').strip(),
                'mana': form.get('param_mana', '').strip(),
                'luck': form.get('param_luck', '').strip(),
                'np': form.get('param_np', '').strip(),
            },
            # conversation_lines will be populated below as list of {title, text}
            'conversation_lines': [],
            # structured below
            'class_skills': [],
            'personal_skills': [],
            'noble_phantasms': [],
            'image_mode': form.get('image_mode', 'url'),
            'image_url': '',
            # FGO Mode and extras
            'fgo_mode': form.get('fgo_mode', '0') == '1',
            'fgo': {}
        }

        # Build conversation lines as pairs
        titles = [t.strip() for t in form.getlist('conversation_title[]')]
        texts = [t.strip() for t in form.getlist('conversation_text[]')]
        max_len = max(len(titles), len(texts)) if (titles or texts) else 0
        conv = []
        for i in range(max_len):
            title = titles[i] if i < len(titles) else ''
            text = texts[i] if i < len(texts) else ''
            if title or text:
                conv.append({'title': title, 'text': text})
        servant['conversation_lines'] = conv

        image_file_path = None
        if servant['image_mode'] == 'url':
            servant['image_url'] = form.get('image_url', '').strip()
        else:
            # Handle upload
            if 'image_file' in request.files:
                f = request.files['image_file']
                if f and f.filename:
                    if allowed_file(f.filename):
                        ext = f.filename.rsplit('.', 1)[1].lower()
                        filename = secure_filename(f"{uuid.uuid4().hex}.{ext}")
                        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        f.save(save_path)
                        image_file_path = filename
                        servant['image_url'] = url_for('uploaded_file', filename=filename)
                    else:
                        flash('Unsupported image file type.', 'error')
                else:
                    flash('No image file selected.', 'warning')

        # Build Class Skills
        cs_titles = [t.strip() for t in form.getlist('class_skill_title[]')]
        cs_imgs = [t.strip() for t in form.getlist('class_skill_image[]')]
        cs_descs = [t.strip() for t in form.getlist('class_skill_description[]')]
        for i in range(max(len(cs_titles), len(cs_imgs), len(cs_descs))):
            title = cs_titles[i] if i < len(cs_titles) else ''
            img = cs_imgs[i] if i < len(cs_imgs) else ''
            desc = cs_descs[i] if i < len(cs_descs) else ''
            if title or img or desc:
                img_url = url_for('skill_image', filename=img) if img else ''
                servant['class_skills'].append({
                    'title': title, 'image': img, 'image_url': img_url, 'description': desc
                })

        # Build Personal Skills
        ps_titles = [t.strip() for t in form.getlist('personal_skill_title[]')]
        ps_imgs = [t.strip() for t in form.getlist('personal_skill_image[]')]
        ps_descs = [t.strip() for t in form.getlist('personal_skill_description[]')]
        for i in range(max(len(ps_titles), len(ps_imgs), len(ps_descs))):
            title = ps_titles[i] if i < len(ps_titles) else ''
            img = ps_imgs[i] if i < len(ps_imgs) else ''
            desc = ps_descs[i] if i < len(ps_descs) else ''
            if title or img or desc:
                img_url = url_for('skill_image', filename=img) if img else ''
                servant['personal_skills'].append({
                    'title': title, 'image': img, 'image_url': img_url, 'description': desc
                })

        # Build Noble Phantasms (Title, Rank, Type, Image (url or upload), Description)
        np_titles = [t.strip() for t in form.getlist('np_title[]')]
        np_ranks = [t.strip() for t in form.getlist('np_rank[]')]
        np_modes = [t.strip() for t in form.getlist('np_image_mode[]')]
        np_urls = [t.strip() for t in form.getlist('np_image_url[]')]
        np_descs = [t.strip() for t in form.getlist('np_description[]')]
        np_types = [t.strip() for t in form.getlist('np_type[]')]

        max_len_np = max(len(np_titles), len(np_ranks), len(np_modes), len(np_urls), len(np_descs), len(np_types)) if (np_titles or np_ranks or np_modes or np_urls or np_descs or np_types) else 0
        for i in range(max_len_np):
            title = np_titles[i] if i < len(np_titles) else ''
            rank = np_ranks[i] if i < len(np_ranks) else ''
            mode = np_modes[i] if i < len(np_modes) else 'url'
            url_val = np_urls[i] if i < len(np_urls) else ''
            desc = np_descs[i] if i < len(np_descs) else ''
            np_type = np_types[i] if i < len(np_types) else ''

            image_url = ''
            if mode == 'url' and url_val:
                image_url = url_val
            elif mode == 'upload':
                fkey = f'np_image_file_{i}'
                f = request.files.get(fkey)
                if f and f.filename:
                    if allowed_file(f.filename):
                        ext = f.filename.rsplit('.', 1)[1].lower()
                        filename = secure_filename(f"np_{uuid.uuid4().hex}.{ext}")
                        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        f.save(save_path)
                        image_url = url_for('uploaded_file', filename=filename)
                    else:
                        flash(f'Unsupported NP image file type for item {i+1}', 'error')

            if title or rank or image_url or desc or np_type:
                servant['noble_phantasms'].append({
                    'title': title,
                    'rank': rank,
                    'np_type': np_type,
                    'image_url': image_url,
                    'description': desc,
                })

        # FGO fields
        if servant['fgo_mode']:
            # Basic stats
            servant['fgo'] = {
                'atk_min': form.get('fgo_atk_min', '').strip(),
                'atk_max': form.get('fgo_atk_max', '').strip(),
                'hp_min': form.get('fgo_hp_min', '').strip(),
                'hp_max': form.get('fgo_hp_max', '').strip(),
                'grail_100_atk': form.get('fgo_grail_100_atk', '').strip(),
                'grail_100_hp': form.get('fgo_grail_100_hp', '').strip(),
                'grail_120_atk': form.get('fgo_grail_120_atk', '').strip(),
                'grail_120_hp': form.get('fgo_grail_120_hp', '').strip(),
                'star_absorption': form.get('fgo_star_absorption', '').strip(),
                'star_generation': form.get('fgo_star_generation', '').strip(),
                'np_charge_attack': form.get('fgo_np_charge_attack', '').strip(),
                'np_charge_def': form.get('fgo_np_charge_def', '').strip(),
                'death_chance': form.get('fgo_death_chance', '').strip(),
                'traits': form.get('fgo_traits', '').strip(),
                'card_list': form.get('fgo_card_list', '').strip(),
                'hits': {
                    'quick': form.get('fgo_hits_quick', '').strip(),
                    'arts': form.get('fgo_hits_arts', '').strip(),
                    'buster': form.get('fgo_hits_buster', '').strip(),
                    'extra': form.get('fgo_hits_extra', '').strip(),
                },
            }

            # Enhance Skills (gameplay info and levels for active skills)
            ps_gameplays = [t.strip() for t in form.getlist('personal_skill_gameplay[]')]
            ps_levels = [t.strip() for t in form.getlist('personal_skill_levels[]')]  # JSON arrays
            for idx, s in enumerate(servant['personal_skills']):
                s['gameplay'] = ps_gameplays[idx] if idx < len(ps_gameplays) else ''
                s['levels'] = ps_levels[idx] if idx < len(ps_levels) else ''

            cs_gameplays = [t.strip() for t in form.getlist('class_skill_gameplay[]')]
            for idx, s in enumerate(servant['class_skills']):
                s['gameplay'] = cs_gameplays[idx] if idx < len(cs_gameplays) else ''

            # Enhance NPs
            np_effects = [t.strip() for t in form.getlist('np_effects[]')]
            np_levels = [t.strip() for t in form.getlist('np_levels[]')]  # JSON arrays (length 5)
            np_over = [t.strip() for t in form.getlist('np_overcharge[]')]
            for idx, np in enumerate(servant['noble_phantasms']):
                np['effects'] = np_effects[idx] if idx < len(np_effects) else ''
                np['levels'] = np_levels[idx] if idx < len(np_levels) else ''
                np['overcharge'] = np_over[idx] if idx < len(np_over) else ''

        return render_template('sheet.html', servant=servant)

    # GET: provide sorted list of available skill images
    images = list_skill_images()
    skill_images = [ {'filename': f, 'url': url_for('skill_image', filename=f)} for f in images ]
    # Card list images
    cl_images = list_card_list_images()
    card_list_images = [ {'filename': f, 'url': url_for('card_list_image', filename=f)} for f in cl_images ]
    return render_template('create.html', skill_images=skill_images, card_list_images=card_list_images)

# No persistence yet; could add saving to JSON later.

if __name__ == '__main__':
    app.run(debug=True)
