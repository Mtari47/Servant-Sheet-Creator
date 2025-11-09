(function(){
  const modal = document.getElementById('np-modal');
  if (!modal) return;
  const backdrop = modal.querySelector('.modal-backdrop');
  const closeButtons = modal.querySelectorAll('[data-close]');
  const saveBtn = document.getElementById('np-save');
  const titleInput = document.getElementById('np-title');
  const rankInput = document.getElementById('np-rank');
  const descInput = document.getElementById('np-description');
  const effectsInput = document.getElementById('np-effects');
  const levelsTable = document.getElementById('np-levels-table');
  const urlWrapper = document.getElementById('np-image-url-wrapper');
  const fileWrapper = document.getElementById('np-image-file-wrapper');
  const urlInput = document.getElementById('np-image-url');
  const fileInput = document.getElementById('np-image-file');
  const preview = document.getElementById('np-image-preview');
  const modeRadios = modal.querySelectorAll('input[name="np_image_mode"]');

  const panel = document.getElementById('noble-phantasms');
  const openBtn = panel.querySelector('.open-np-modal');
  const itemsWrap = panel.querySelector('.np-items');
  const hiddenWrap = panel.querySelector('.hidden-inputs');

  let counter = 0; // index for NP items

  function openModal(){
    titleInput.value = '';
    rankInput.value = '';
    descInput.value = '';
    urlInput.value = '';
    fileInput.value = '';
    preview.style.display = 'none';
    if (effectsInput) effectsInput.value='';
    if (levelsTable){
      levelsTable.querySelectorAll('tbody td').forEach(td => td.textContent='');
      const over = levelsTable.querySelector('tfoot td');
      if (over) over.textContent='';
    }
    modeRadios.forEach(r => { if (r.value === 'url') r.checked = true; });
    updateMode();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
  }

  function updateMode(){
    const mode = modal.querySelector('input[name="np_image_mode"]:checked').value;
    if (mode === 'url') { urlWrapper.style.display=''; fileWrapper.style.display='none'; preview.style.display=''; updatePreview(); }
    else { urlWrapper.style.display='none'; fileWrapper.style.display=''; preview.style.display='none'; }
  }

  modeRadios.forEach(r => r.addEventListener('change', updateMode));

  function updatePreview(){
    const val = urlInput.value.trim();
    if (val){ preview.src = val; preview.style.display='block'; } else { preview.style.display='none'; }
  }
  urlInput.addEventListener('input', updatePreview);

  openBtn.addEventListener('click', openModal);
  backdrop.addEventListener('click', closeModal);
  closeButtons.forEach(b => b.addEventListener('click', closeModal));

  function escHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escAttr(s){ return (s||'').replace(/"/g,'&quot;'); }

  saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const rank = rankInput.value.trim();
    const desc = descInput.value.trim();
    const effects = effectsInput ? effectsInput.value.trim() : '';
    let levelsJSON = '';
    let overchargeValue = '';
    if (levelsTable){
      const tds = Array.from(levelsTable.querySelectorAll('tbody td'));
      const values = tds.map(td => td.textContent.trim());
      levelsJSON = JSON.stringify(values); // length 5
      const over = levelsTable.querySelector('tfoot td');
      overchargeValue = over ? over.textContent.trim() : '';
    }
    const mode = modal.querySelector('input[name="np_image_mode"]:checked').value;
    const urlVal = urlInput.value.trim();
    let imagePreviewHTML = '';
    let imageUrlHiddenValue = '';

    let fileFieldName = '';
    if (mode === 'url') {
      if (urlVal){ imagePreviewHTML = `<img src="${escAttr(urlVal)}" alt="">`; imageUrlHiddenValue = urlVal; }
    } else {
      // upload: we create a unique file input appended to hiddenWrap so it submits with form
      const idx = counter;
      fileFieldName = `np_image_file_${idx}`;
      const clone = document.createElement('input');
      clone.type = 'file';
      clone.accept = 'image/*';
      clone.name = fileFieldName;
      // We cannot programmatically set FileList, so ensure user picked a file
      if (!fileInput.files || fileInput.files.length === 0){
        alert('Please choose a file for the NP image.');
        return;
      }
      // Move original file input (with chosen file) into hiddenWrap, create new blank one for next time
      const original = fileInput;
      original.name = fileFieldName;
      hiddenWrap.appendChild(original);
      // Create replacement file input for modal reuse
      const replacement = document.createElement('input');
      replacement.type = 'file';
      replacement.accept = 'image/*';
      replacement.id = 'np-image-file';
      fileWrapper.appendChild(replacement);
      // Update ref
      fileInput = replacement;
      imagePreviewHTML = '<span class="uploaded-placeholder">(Uploaded)</span>';
      imageUrlHiddenValue = ''; // server will set actual URL after save
    }

    const item = document.createElement('div');
    item.className = 'np-item';
    item.innerHTML = `
      <div class="np-icon">${imagePreviewHTML}</div>
      <div class="np-text">
        <div class="np-title-rank"><strong>${escHtml(title || '(Untitled NP)')}</strong> ${rank ? '('+escHtml(rank)+')' : ''}</div>
        <div class="np-desc">${escHtml(desc)}</div>
        ${effects ? `<div class="np-effects"><em>${escHtml(effects)}</em></div>` : ''}
      </div>
      <button type="button" class="remove" aria-label="Remove">×</button>
      <input type="hidden" name="np_title[]" value="${escAttr(title)}">
      <input type="hidden" name="np_rank[]" value="${escAttr(rank)}">
      <input type="hidden" name="np_image_mode[]" value="${escAttr(mode)}">
      <input type="hidden" name="np_image_url[]" value="${escAttr(imageUrlHiddenValue)}">
      <input type="hidden" name="np_description[]" value="${escAttr(desc)}">
      <input type="hidden" name="np_effects[]" value="${escAttr(effects)}">
      <input type="hidden" name="np_levels[]" value='${levelsJSON.replace(/'/g,"&#39;")}' >
      <input type="hidden" name="np_overcharge[]" value="${escAttr(overchargeValue)}">
    `;

    item.querySelector('.remove').addEventListener('click', () => {
      // If upload mode, also remove moved file input
      if (mode === 'upload'){
        const fi = hiddenWrap.querySelector(`input[name='${fileFieldName}']`);
        fi && fi.remove();
      }
      item.remove();
    });

    itemsWrap.appendChild(item);
    counter++;
    closeModal();
  });
})();
