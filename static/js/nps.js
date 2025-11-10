// Dynamic NP modal with editable rows above and below a single Overcharge row
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
  const typeSelect = document.getElementById('np-type-select');
  const typeOtherLabel = document.getElementById('np-type-other-label');
  const typeOtherInput = document.getElementById('np-type-other');
  const preBody = document.getElementById('np-levels-pre');
  const postBody = document.getElementById('np-levels-post');
  const overchargeCell = document.getElementById('np-overcharge-cell');
  const addRowPreBtn = document.getElementById('np-add-row-pre');
  const addRowPostBtn = document.getElementById('np-add-row-post');
  const urlWrapper = document.getElementById('np-image-url-wrapper');
  const fileWrapper = document.getElementById('np-image-file-wrapper');
  let urlInput = document.getElementById('np-image-url');
  let fileInput = document.getElementById('np-image-file');
  const preview = document.getElementById('np-image-preview');
  const modeRadios = modal.querySelectorAll('input[name="np_image_mode"]');

  const panel = document.getElementById('noble-phantasms');
  const openBtn = panel.querySelector('.open-np-modal');
  const itemsWrap = panel.querySelector('.np-items');
  const hiddenWrap = panel.querySelector('.hidden-inputs');
  let counter = 0;

  function buildRow(){
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.contentEditable = 'true';
    th.textContent = 'Values';
    tr.appendChild(th);
    for (let i=0;i<5;i++){
      const td = document.createElement('td');
      td.contentEditable = 'true';
      tr.appendChild(td);
    }
    return tr;
  }

  function openModal(){
    titleInput.value='';
    rankInput.value='';
    descInput.value='';
    if (effectsInput) effectsInput.value='';
  if (typeSelect) typeSelect.value='';
  if (typeOtherInput) typeOtherInput.value='';
  if (typeOtherLabel) typeOtherLabel.style.display='none';
    urlInput.value='';
    fileInput.value='';
    preview.style.display='none';
    if (preBody){ preBody.innerHTML=''; preBody.appendChild(buildRow()); }
    if (postBody){ postBody.innerHTML=''; }
    if (overchargeCell){ overchargeCell.textContent=''; }
    modeRadios.forEach(r => { if (r.value==='url') r.checked=true; });
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

  if (addRowPreBtn) addRowPreBtn.addEventListener('click', () => preBody && preBody.appendChild(buildRow()));
  if (addRowPostBtn) addRowPostBtn.addEventListener('click', () => postBody && postBody.appendChild(buildRow()));

  // NP Type selection logic
  if (typeSelect){
    typeSelect.addEventListener('change', () => {
      const show = typeSelect.value === 'Other';
      if (typeOtherLabel) typeOtherLabel.style.display = show ? '' : 'none';
    });
  }

  openBtn.addEventListener('click', openModal);
  backdrop.addEventListener('click', closeModal);
  closeButtons.forEach(b => b.addEventListener('click', closeModal));

  function escHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escAttr(s){ return (s||'').replace(/"/g,'&quot;'); }

  function collectRows(tbody){
    const rows = [];
    if (!tbody) return rows;
    tbody.querySelectorAll('tr').forEach(tr => {
      const th = tr.querySelector('th');
      const label = th ? th.textContent.trim() : '';
      const values = [];
      tr.querySelectorAll('td').forEach(td => values.push(td.textContent.trim()));
      rows.push({ label, values });
    });
    return rows;
  }

  saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const rank = rankInput.value.trim();
    const desc = descInput.value.trim();
    const effects = effectsInput ? effectsInput.value.trim() : '';
  const typeVal = typeSelect ? typeSelect.value.trim() : '';
  const typeResolved = (typeVal === 'Other') ? (typeOtherInput ? typeOtherInput.value.trim() : '') : typeVal;
    const preRows = collectRows(preBody);
    const postRows = collectRows(postBody);
    const overText = overchargeCell ? overchargeCell.textContent.trim() : '';
    const levelsObj = { pre: preRows, overcharge: overText, post: postRows };
    const levelsJSON = JSON.stringify(levelsObj).replace(/'/g,"&#39;");

    const mode = modal.querySelector('input[name="np_image_mode"]:checked').value;
    const urlVal = urlInput.value.trim();
    let imagePreviewHTML = '';
    let imageUrlHiddenValue = '';
    let fileFieldName = '';

    if (mode === 'url') {
      if (urlVal){ imagePreviewHTML = `<img src="${escAttr(urlVal)}" alt="">`; imageUrlHiddenValue = urlVal; }
    } else {
      const idx = counter;
      fileFieldName = `np_image_file_${idx}`;
      if (!fileInput.files || fileInput.files.length === 0){
        alert('Please choose a file for the NP image.');
        return;
      }
      const original = fileInput;
      original.name = fileFieldName;
      hiddenWrap.appendChild(original);
      const replacement = document.createElement('input');
      replacement.type = 'file';
      replacement.accept = 'image/*';
      replacement.id = 'np-image-file';
      fileWrapper.appendChild(replacement);
      fileInput = replacement;
      imagePreviewHTML = '<span class="uploaded-placeholder">(Uploaded)</span>';
      imageUrlHiddenValue = '';
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
  <input type="hidden" name="np_type[]" value="${escAttr(typeResolved)}">
      <input type="hidden" name="np_levels[]" value='${levelsJSON}'>
      <input type="hidden" name="np_overcharge[]" value="${escAttr(overText)}">
    `;

    item.querySelector('.remove').addEventListener('click', () => {
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
