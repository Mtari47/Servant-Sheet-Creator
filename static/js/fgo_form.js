(function(){
  // Card list modal handling
  const modal = document.getElementById('card-list-modal');
  if (!modal) return;
  const grid = document.getElementById('card-list-grid');
  const saveBtn = document.getElementById('card-list-save');
  const selectedPreview = document.getElementById('selected-card-list');
  const form = document.getElementById('servant-form');

  // Ensure hidden input to store selection
  let hidden = form.querySelector('input[name="fgo_card_list"]');
  if (!hidden){ hidden = document.createElement('input'); hidden.type='hidden'; hidden.name='fgo_card_list'; form.appendChild(hidden); }

  // Parse images
  let images = [];
  try {
    const jsonTag = document.getElementById('card-list-images-data');
    images = JSON.parse(jsonTag.textContent || '[]');
  } catch(e){ images = []; }

  let selectedIndex = -1;
  function buildGrid(){
    grid.innerHTML = '';
    images.forEach((img, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'image-option';
      btn.setAttribute('aria-label', 'Card list image');
      btn.innerHTML = `<img src="${img.url}" alt="">`;
      btn.addEventListener('click', () => { selectedIndex = idx; updateSelection(); });
      grid.appendChild(btn);
    });
  }
  function updateSelection(){
    grid.querySelectorAll('.image-option').forEach((el, i) => {
      el.classList.toggle('selected', i === selectedIndex);
    });
  }

  function ensureGridBuilt(){
    if (!grid.dataset.built){
      buildGrid();
      grid.dataset.built = '1';
    }
  }

  function open(){
    ensureGridBuilt();
    if (images.length === 0){
      grid.innerHTML = '<div style="font-size:0.75rem; opacity:0.7;">No card list images found. Place files in \'QAB Card Lists\'.</div>';
    }
    modal.style.display = '';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function close(){
    modal.classList.add('hidden');
    modal.style.display = '';
    modal.setAttribute('aria-hidden', 'true');
  }

  modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  modal.querySelector('.modal-backdrop').addEventListener('click', close);
  // Use event delegation so this works even if the button is re-rendered/toggled
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('#open-card-list-modal');
    if (btn) {
      e.preventDefault();
      open();
    }
  });

  saveBtn.addEventListener('click', () => {
    if (selectedIndex < 0) { close(); return; }
    const chosen = images[selectedIndex];
    hidden.value = chosen.filename;
    selectedPreview.innerHTML = `<img src="${chosen.url}" alt="" style="max-height:60px;">`;
    close();
  });

  // defer grid build until first open

  // Skill modal enhancements: integration with fgo.js visibility for gameplay/tables handled by CSS via [data-fgo-only].
  // Capture gameplay and levels when saving in skills.js by reading DOM fields if present.
})();
