(function(){
  const modal = document.getElementById('skill-modal');
  const backdrop = modal.querySelector('.modal-backdrop');
  const closeButtons = modal.querySelectorAll('[data-close]');
  const saveBtn = document.getElementById('skill-save');
  const titleInput = document.getElementById('skill-title');
  const descInput = document.getElementById('skill-description');
  const grid = document.getElementById('skill-image-grid');
  const gameplayField = document.getElementById('skill-gameplay');
  const levelsTable = document.getElementById('skill-levels-table');
  const levelsTbody = levelsTable ? levelsTable.querySelector('#skill-levels-body') : null;
  const addRowBtn = document.getElementById('skill-add-row');

  // Parse images data from JSON script tag
  let images = [];
  try {
    const jsonTag = document.getElementById('skill-images-data');
    images = JSON.parse(jsonTag.textContent || '[]');
  } catch(e) { images = []; }

  // Build grid (names hidden; sorted already server-side)
  let selectedIndex = -1;
  function buildGrid() {
    grid.innerHTML = '';
    images.forEach((img, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'image-option';
      btn.setAttribute('aria-label', 'Skill icon');
      btn.innerHTML = `<img src="${img.url}" alt="">`;
      btn.addEventListener('click', () => {
        selectedIndex = idx;
        updateGridSelection();
      });
      grid.appendChild(btn);
    });
  }

  function updateGridSelection() {
    grid.querySelectorAll('.image-option').forEach((el, i) => {
      if (i === selectedIndex) el.classList.add('selected'); else el.classList.remove('selected');
    });
  }

  // State: which panel is adding (class or personal)
  let currentPanel = null;
  function openModal(panel) {
    currentPanel = panel;
    titleInput.value = '';
    descInput.value = '';
    selectedIndex = -1;
    updateGridSelection();
    // Determine scope and toggle levels table visibility: only personal (active) uses levels
    const scope = panel.getAttribute('data-scope');
    if (levelsTable) {
      if (scope === 'personal') {
        levelsTable.closest('.fgo-levels-field').style.display = '';
      } else {
        // class skills (passive) should not show scaling table
        levelsTable.closest('.fgo-levels-field').style.display = 'none';
      }
    }
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  closeButtons.forEach(b => b.addEventListener('click', closeModal));
  backdrop.addEventListener('click', closeModal);

  // Wire up open buttons
  document.querySelectorAll('.skills-panel .open-skill-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.skills-panel');
      openModal(panel);
    });
  });

  // Save -> create visible item + hidden inputs
  saveBtn.addEventListener('click', () => {
    if (!currentPanel) return;
    const scope = currentPanel.getAttribute('data-scope'); // 'class' | 'personal'
    const itemsWrap = currentPanel.querySelector('.skill-items');

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const img = (selectedIndex >= 0 ? images[selectedIndex] : null);
    const gameplay = gameplayField ? gameplayField.value.trim() : '';

    // Gather levels from table if present and scope === 'personal'
    let levelsJSON = '';
    if (levelsTable && scope === 'personal') {
      const rows = [];
      const trs = Array.from(levelsTable.querySelectorAll('tbody tr'));
      trs.forEach(tr => {
        const cells = Array.from(tr.children);
        if (!cells.length) return;
        const labelCell = cells[0];
        const label = labelCell.textContent.trim();
        const values = cells.slice(1).map(td => (td.textContent || '').trim());
        // Only push rows that have at least a label or any value
        if (label || values.some(v => v)) {
          rows.push({ label, values });
        }
      });
      levelsJSON = JSON.stringify(rows);
    }

    // Build item
    const item = document.createElement('div');
    item.className = 'skill-item';
    item.innerHTML = `
      <div class="icon">${img ? `<img src="${img.url}" alt="">` : ''}</div>
      <div class="text">
        <div class="title">${escapeHtml(title || '(Untitled)')}</div>
        <div class="desc">${escapeHtml(description)}</div>
        ${gameplay ? `<div class="gameplay"><em>${escapeHtml(gameplay)}</em></div>` : ''}
      </div>
      <button type="button" class="remove" aria-label="Remove">×</button>
      <input type="hidden" name="${scope}_skill_title[]" value="${escapeAttr(title)}">
      <input type="hidden" name="${scope}_skill_image[]" value="${img ? escapeAttr(img.filename) : ''}">
      <input type="hidden" name="${scope}_skill_description[]" value="${escapeAttr(description)}">
      ${scope === 'class' ? `<input type="hidden" name="class_skill_gameplay[]" value="${escapeAttr(gameplay)}">` : ''}
      ${scope === 'personal' ? `<input type="hidden" name="personal_skill_gameplay[]" value="${escapeAttr(gameplay)}">` : ''}
      ${scope === 'personal' ? `<input type="hidden" name="personal_skill_levels[]" value='${levelsJSON.replace(/'/g,"&#39;")}' >` : ''}
    `;

    item.querySelector('.remove').addEventListener('click', () => item.remove());

    itemsWrap.appendChild(item);
    closeModal();
  });

  function escapeHtml(s){
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escapeAttr(s){
    return (s||'').replace(/"/g,'&quot;');
  }

  // Initialize
  buildGrid();

  // Add line handler for personal skills scaling table
  if (addRowBtn && levelsTbody) {
    addRowBtn.addEventListener('click', () => {
      const tr = document.createElement('tr');
      // First cell (label) editable
      const th = document.createElement('th');
      th.contentEditable = 'true';
      th.textContent = '';
      tr.appendChild(th);
      // Ten editable value cells
      for (let i = 0; i < 10; i++) {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        tr.appendChild(td);
      }
      levelsTbody.appendChild(tr);
    });
  }
})();
