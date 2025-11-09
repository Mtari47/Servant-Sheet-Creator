(function(){
  // Fresh, robust implementation for the Card List picker modal
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('servant-form');
    const openBtnSelector = '#open-card-list-modal';
    const modal = document.getElementById('card-list-modal');
    const grid = document.getElementById('card-list-grid');
    const saveBtn = document.getElementById('card-list-save');
    const selectedPreview = document.getElementById('selected-card-list');
    const dataTag = document.getElementById('card-list-images-data');

    if (!form || !modal || !grid || !saveBtn || !selectedPreview || !dataTag) return;

    // Ensure the hidden input exists near the preview for clarity
    let hidden = form.querySelector('input[name="fgo_card_list"]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'fgo_card_list';
      // append near the card list picker area if possible
      const picker = document.querySelector('.card-list-picker');
      (picker || form).appendChild(hidden);
    }

    let images = [];
    try {
      images = JSON.parse(dataTag.textContent || '[]');
    } catch (e) {
      images = [];
    }

    let selectedIndex = -1;

    function renderGrid(){
      grid.innerHTML = '';
      if (!images.length){
        grid.innerHTML = '<div style="font-size:0.8rem; opacity:0.7; padding:0.25rem;">No card list images found. Put image files in the "QAB Card Lists" folder.</div>';
        return;
      }
      images.forEach((img, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'image-option';
        btn.innerHTML = `<img src="${img.url}" alt="Card list ${idx+1}">`;
        btn.addEventListener('click', () => {
          selectedIndex = idx;
          updateSelectionStyles();
        });
        // basic keyboard support
        btn.addEventListener('keydown', (ev) => {
          const cols = Math.max(1, Math.floor(grid.clientWidth / 60));
          if (ev.key === 'ArrowRight') { ev.preventDefault(); focusIndex(Math.min(images.length-1, idx+1)); }
          if (ev.key === 'ArrowLeft')  { ev.preventDefault(); focusIndex(Math.max(0, idx-1)); }
          if (ev.key === 'ArrowDown')  { ev.preventDefault(); focusIndex(Math.min(images.length-1, idx+cols)); }
          if (ev.key === 'ArrowUp')    { ev.preventDefault(); focusIndex(Math.max(0, idx-cols)); }
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectedIndex = idx; updateSelectionStyles(); }
        });
        grid.appendChild(btn);
      });
    }

    function updateSelectionStyles(){
      const options = grid.querySelectorAll('.image-option');
      options.forEach((el, i) => el.classList.toggle('selected', i === selectedIndex));
    }

    function focusIndex(i){
      const options = grid.querySelectorAll('.image-option');
      if (options[i]) options[i].focus();
    }

    function openModal(){
      if (!grid.dataset.initialized){
        renderGrid();
        grid.dataset.initialized = '1';
      }
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden','false');
      // focus the first option if available
      setTimeout(() => {
        const first = grid.querySelector('.image-option');
        if (first) first.focus();
      }, 0);
      document.addEventListener('keydown', onEscClose);
    }

    function closeModal(){
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden','true');
      document.removeEventListener('keydown', onEscClose);
    }

    function onEscClose(e){ if (e.key === 'Escape') closeModal(); }

    // Close handlers (backdrop or any [data-close])
    modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]') || e.target.closest('[data-close]')) { closeModal(); }
      if (e.target.classList.contains('modal-backdrop')) { closeModal(); }
    });

    // Open using delegation so it works regardless of FGO mode toggling
    document.addEventListener('click', (e) => {
      const btn = e.target.closest(openBtnSelector);
      if (btn) { e.preventDefault(); openModal(); }
    });

    // Save selection
    saveBtn.addEventListener('click', () => {
      if (selectedIndex < 0 || !images[selectedIndex]) { closeModal(); return; }
      const chosen = images[selectedIndex];
      hidden.value = chosen.filename;
      renderPreview(chosen);
      closeModal();
    });

    function renderPreview(chosen){
      selectedPreview.innerHTML = '';
      const img = document.createElement('img');
      img.src = chosen.url;
      img.alt = 'Selected card list';
      img.style.maxHeight = '60px';
      selectedPreview.appendChild(img);

      const clr = document.createElement('button');
      clr.type = 'button';
      clr.className = 'btn';
      clr.style.marginLeft = '0.5rem';
      clr.textContent = 'Clear';
      clr.addEventListener('click', () => {
        hidden.value = '';
        selectedPreview.innerHTML = '';
        selectedIndex = -1;
        updateSelectionStyles();
      });
      selectedPreview.appendChild(clr);
    }

    // If we already have a value (e.g., back navigation), show it
    if (hidden.value) {
      const idx = images.findIndex(x => x.filename === hidden.value);
      if (idx >= 0) {
        selectedIndex = idx;
        // Ensure grid so styles match after open
        renderGrid();
        updateSelectionStyles();
        renderPreview(images[idx]);
      }
    }
  });
})();
