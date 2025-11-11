// Static SPA for GitHub Pages
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Theme toggle
  const toggleThemeBtn = $('#toggle-theme');
  if (toggleThemeBtn){
    toggleThemeBtn.addEventListener('click', () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
    });
  }

  // Class select: show custom input when "Other"
  const classSelect = $('#servant_class');
  const classOtherWrap = $('#servant_class_other_wrap');
  const classOtherInput = $('#servant_class_other');
  if (classSelect){
    const updateClassOther = () => {
      const isOther = (classSelect.value || '').trim() === 'Other';
      if (classOtherWrap) classOtherWrap.style.display = isOther ? '' : 'none';
    };
    classSelect.addEventListener('change', updateClassOther);
    updateClassOther();
  }

  // Hidden Attribute select (no custom option now)
  const hiddenAttrSelect = $('#hidden_attribute');

  // FGO toggle
  const fgoBtn = $('#toggle-fgo');
  const fgoSection = $('#fgo-section');
  // Card list modal elements
  const cardListModal = $('#card-list-modal');
  const cardListGrid = $('#card-list-grid');
  const cardListSelectBtn = $('#card-list-select');
  const cardListInput = $('#fgo_card_list');
  const cardListPreview = $('#card-list-preview');
  let selectedCardListIndex = -1;
  let fgoMode = false;
  function setFgoMode(on){
    fgoMode = !!on;
    fgoSection.style.display = on ? '' : 'none';
    fgoBtn.textContent = on ? 'FGO Mode On' : 'FGO Mode Off';
    fgoBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    $$("[data-fgo-only]").forEach(el => el.style.display = on ? '' : 'none');
    if (on && ASSETS.card_lists.length && cardListGrid && !cardListGrid.hasChildNodes()) {
      buildCardListGrid();
    }
  }
  if (fgoBtn){ fgoBtn.addEventListener('click', () => setFgoMode(!fgoMode)); }
  setFgoMode(false);

  // Portrait image mode
  // Card list selection modal logic
  function openCardListModal(){
    if (!ASSETS.card_lists.length) {
      alert('No card list images available.');
      return;
    }
    buildCardListGrid();
    cardListModal.classList.remove('hidden');
    cardListModal.setAttribute('aria-hidden','false');
  }
  function closeCardListModal(){
    cardListModal.classList.add('hidden');
    cardListModal.setAttribute('aria-hidden','true');
  }
  function buildCardListGrid(){
    if (!cardListGrid) return;
    cardListGrid.innerHTML = '';
    ASSETS.card_lists.forEach((path, idx) => {
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='image-option';
      btn.innerHTML = `<img src="${escAttr(path)}" alt="Card List">`;
      btn.addEventListener('click', () => { selectedCardListIndex = idx; updateCardListSel(); });
      cardListGrid.appendChild(btn);
    });
    updateCardListSel();
  }
  function updateCardListSel(){
    cardListGrid.querySelectorAll('.image-option').forEach((el,i)=> el.classList.toggle('selected', i===selectedCardListIndex));
  }
  if (cardListGrid){
    // Replace plain URL input with button + retained input if user wants custom URL
    const pickerBtn = document.createElement('button');
    pickerBtn.type='button';
    pickerBtn.textContent='Open Card List Gallery';
    pickerBtn.className='add-item';
    cardListInput.insertAdjacentElement('afterend', pickerBtn);
    pickerBtn.addEventListener('click', openCardListModal);
  }
  cardListModal?.querySelectorAll('[data-close]')?.forEach(b=> b.addEventListener('click', closeCardListModal));
  cardListSelectBtn?.addEventListener('click', () => {
    if (selectedCardListIndex>=0){
      const path = ASSETS.card_lists[selectedCardListIndex];
      cardListInput.value = path; // store path
      cardListPreview.innerHTML = `<img src="${escAttr(path)}" alt="Selected Card List" class="card-list-img">`;
    }
    closeCardListModal();
  });
  cardListModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeCardListModal);
  const portraitUrl = $('#portrait-url');
  const portraitFile = $('#portrait-file');
  const portraitPreview = $('#portrait-preview');
  const portraitUrlWrap = $('#portrait-url-wrapper');
  const portraitFileWrap = $('#portrait-file-wrapper');
  // Keep a base64 data URL for portrait file uploads so export can embed the image reliably
  let portraitDataUrl = '';
  $$("input[name='portrait_mode']").forEach(r => r.addEventListener('change', () => {
    const mode = $(`input[name='portrait_mode']:checked`).value;
    if (mode === 'url'){
      portraitUrlWrap.style.display='';
      portraitFileWrap.style.display='none';
      updatePortraitPreview();
    } else {
      portraitUrlWrap.style.display='none';
      portraitFileWrap.style.display='';
      if (portraitDataUrl){
        portraitPreview.src = portraitDataUrl;
        portraitPreview.style.display='inline-block';
      } else {
        portraitPreview.style.display='none';
      }
    }
  }));
  function updatePortraitPreview(){
    const v = (portraitUrl.value||'').trim();
    if (v){ portraitPreview.src=v; portraitPreview.style.display='inline-block'; }
    else { portraitPreview.style.display='none'; }
  }
  portraitUrl && portraitUrl.addEventListener('input', updatePortraitPreview);
  // Read local portrait file as data URL
  portraitFile && portraitFile.addEventListener('change', () => {
    portraitDataUrl = '';
    const f = portraitFile.files && portraitFile.files[0];
    if (!f){ portraitPreview.style.display='none'; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      portraitDataUrl = e.target.result;
      portraitPreview.src = portraitDataUrl;
      portraitPreview.style.display='inline-block';
    };
    reader.readAsDataURL(f);
  });

  // Conversation lines
  const convWrap = $('#conversation-items');
  $('#add-conversation').addEventListener('click', () => addConversation());
  function addConversation(title='', text=''){
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.innerHTML = `
      <div style="display:flex; gap:.5rem; align-items:flex-start;">
        <input type="text" class="conv-title" placeholder="Title" value="${escAttr(title)}" style="flex:0 0 220px;">
        <textarea class="conv-text" rows="2" placeholder="Dialog text" style="flex:1">${escText(text)}</textarea>
        <button type="button" class="remove" aria-label="Remove">×</button>
      </div>`;
    item.querySelector('.remove').addEventListener('click', () => item.remove());
    convWrap.appendChild(item);
  }
  // one starter item
  addConversation();

  // Skills + asset manifest
  const classList = $('#class-skills-list');
  const personalList = $('#personal-skills-list');
  let ASSETS = { skill_icons: [], card_lists: [] };
  fetch('assets_manifest.json')
    .then(r => r.ok ? r.json() : ASSETS)
    .then(data => { ASSETS = data || ASSETS; })
    .catch(()=>{});
  $('#add-class-skill').addEventListener('click', () => openSkillModal('class'));
  $('#add-personal-skill').addEventListener('click', () => openSkillModal('personal'));

  function openSkillModal(scope){
    const dlg = buildSkillDialog(scope);
    document.body.appendChild(dlg.backdrop);
  }
  function buildSkillDialog(scope){
    const backdrop = document.createElement('div');
    backdrop.className = 'modal';
    backdrop.innerHTML = `
      <div class="modal-backdrop" data-close="true"></div>
      <div class="modal-dialog" role="dialog">
        <div class="modal-header"><h3>Add ${scope==='class'?'Class':'Personal'} Skill</h3><button type="button" class="modal-close" data-close="true">×</button></div>
        <div class="modal-body">
          <label>Title<br><input type="text" class="inp-title"></label>
          <label>Description<br><textarea rows="4" class="inp-desc"></textarea></label>
          <div class="image-picker"><div class="image-picker-header">Choose an icon</div><div class="image-grid icon-grid"></div></div>
          <div class="fgo-gameplay-field" data-fgo-only style="${fgoMode?'':'display:none;'}">
            <label>Gameplay Info<br><textarea rows="3" class="inp-gameplay"></textarea></label>
          </div>
          <div class="fgo-levels-field" data-fgo-only style="${(fgoMode && scope==='personal')?'':'display:none;'}">
            <h4>Scaling (Levels 1–10)</h4>
            <table class="levels-table">
              <thead><tr><th>Level</th>${Array.from({length:10},(_,i)=>`<th>${i+1}</th>`).join('')}</tr></thead>
              <tbody class="levels-body"><tr><th contenteditable="true">Values</th>${Array.from({length:10},()=>`<td contenteditable="true"></td>`).join('')}</tr></tbody>
            </table>
            <div style="margin-top:.5rem;"><button type="button" class="btn-add-row add-item">+ Add Line</button></div>
          </div>
        </div>
        <div class="modal-actions"><button type="button" class="btn" data-close="true">Cancel</button><button type="button" class="btn primary btn-save">Save Skill</button></div>
      </div>`;
    const dialog = backdrop.querySelector('.modal-dialog');
    const body = dialog.querySelector('.modal-body');
  const addRowBtn = dialog.querySelector('.btn-add-row');
  const levelsBody = dialog.querySelector('.levels-body');
  const iconGrid = dialog.querySelector('.icon-grid');
  let selectedIcon = -1;
    addRowBtn && addRowBtn.addEventListener('click', ()=>{
      const tr=document.createElement('tr');
      const th=document.createElement('th'); th.contentEditable='true'; tr.appendChild(th);
      for(let i=0;i<10;i++){ const td=document.createElement('td'); td.contentEditable='true'; tr.appendChild(td);} 
      levelsBody.appendChild(tr);
    });
    // Build icon grid
    if (iconGrid && ASSETS.skill_icons && ASSETS.skill_icons.length){
      ASSETS.skill_icons.forEach((path, idx) => {
        const btn = document.createElement('button');
        btn.type='button';
        btn.className='image-option';
        btn.innerHTML = `<img src="${escAttr(path)}" alt="">`;
        btn.addEventListener('click', () => { selectedIcon = idx; updateIconSel(); });
        iconGrid.appendChild(btn);
      });
      function updateIconSel(){
        iconGrid.querySelectorAll('.image-option').forEach((el,i)=> el.classList.toggle('selected', i===selectedIcon));
      }
    }
    function close(){ backdrop.remove(); }
    backdrop.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', close));
    backdrop.querySelector('.modal-backdrop').addEventListener('click', close);
    backdrop.querySelector('.btn-save').addEventListener('click', () => {
      const title = dialog.querySelector('.inp-title').value.trim();
      const desc = dialog.querySelector('.inp-desc').value.trim();
      const gameplay = dialog.querySelector('.inp-gameplay')?.value.trim() || '';
      let rows = [];
      if (fgoMode && scope==='personal'){
        rows = Array.from(levelsBody.querySelectorAll('tr')).map(tr=>{
          const [labelCell, ...cells] = Array.from(tr.children);
          const label = (labelCell?.textContent||'').trim();
          const values = cells.map(td => (td.textContent||'').trim());
          return { label, values };
        });
      }
      const item=document.createElement('div');
      item.className='skill-item';
      const iconHtml = (selectedIcon>=0 && ASSETS.skill_icons[selectedIcon])?`<img src="${escAttr(ASSETS.skill_icons[selectedIcon])}" alt="">`:'';
      item.innerHTML = `
        <div class="icon">${iconHtml}</div>
        <div class="text">
          <div class="title">${escHtml(title||'(Untitled)')}</div>
          <div class="desc">${escHtml(desc)}</div>
          ${fgoMode && gameplay?`<div class="gameplay"><em>${escHtml(gameplay)}</em></div>`:''}
        </div>
        <button type="button" class="remove" aria-label="Remove">×</button>`;
      item.querySelector('.remove').addEventListener('click', ()=> item.remove());
      if (scope==='class') classList.appendChild(item); else personalList.appendChild(item);
      item.__data = { title, description: desc, gameplay, levels: rows, image_url: (selectedIcon>=0?ASSETS.skill_icons[selectedIcon]:'') };
      close();
    });
    return { backdrop };
  }

  // NP Modal
  $('#add-np').addEventListener('click', openNpModal);
  const npList = $('#np-list');
  function openNpModal(){
    const backdrop = document.createElement('div');
    backdrop.className='modal';
    backdrop.innerHTML = `
      <div class="modal-backdrop" data-close="true"></div>
      <div class="modal-dialog">
        <div class="modal-header"><h3>Add Noble Phantasm</h3><button type="button" class="modal-close" data-close="true">×</button></div>
        <div class="modal-body">
          <label>Title<br><input type="text" class="inp-title"></label>
          <label>Rank<br><input type="text" class="inp-rank" placeholder="EX / A+ / B"></label>
          <label>Type<br>
            <select class="inp-type">
              <option value="">-- Select Type --</option>
              <option>Anti-Unit</option>
              <option>Anti-Unit (Self)</option>
              <option>Anti-Army</option>
              <option>Anti-Fortress</option>
              <option>Anti-World</option>
              <option>Barrier</option>
              <option>Other</option>
            </select>
          </label>
          <label class="type-other" style="display:none;">Custom Type<br><input type="text" class="inp-type-other"></label>
          <div class="image-mode np-image-mode"><label><input type="radio" name="np_image_mode" value="url" checked> From URL</label> <label><input type="radio" name="np_image_mode" value="file"> Upload</label></div>
          <div class="np-url"><input type="url" class="inp-url" placeholder="https://.../np.png" style="width:100%"></div>
          <div class="np-file" style="display:none;"><input type="file" class="inp-file" accept="image/*"></div>
          <div class="np-preview" style="display:none; margin-top:.5rem;"></div>
          <label>Description<br><textarea rows="4" class="inp-desc"></textarea></label>
          <div class="fgo-np-effects" data-fgo-only style="${fgoMode?'':'display:none;'}">
            <label>NP Effects<br><textarea rows="3" class="inp-effects"></textarea></label>
            <h4>NP Scaling</h4>
            <table class="levels-table">
              <thead><tr><th>Label</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead>
              <tbody class="pre"><tr><th contenteditable="true">Values</th>${Array.from({length:5},()=>`<td contenteditable=\"true\"></td>`).join('')}</tr></tbody>
              <tbody class="over"><tr><td colspan="6" class="np-overcharge-row">Overcharge Effect: <span class="over-cell" contenteditable="true"></span></td></tr></tbody>
              <tbody class="post"></tbody>
            </table>
            <div class="np-scaling-actions" style="margin-top:.5rem; display:flex; gap:.5rem; flex-wrap:wrap;">
              <button type="button" class="btn-add-pre add-item">+ Add Line Above Overcharge</button>
              <button type="button" class="btn-add-post add-item">+ Add Line Below Overcharge</button>
            </div>
          </div>
        </div>
        <div class="modal-actions"><button type="button" class="btn" data-close="true">Cancel</button><button type="button" class="btn primary btn-save">Save NP</button></div>
      </div>`;
    function close(){ backdrop.remove(); }
    backdrop.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', close));
    backdrop.querySelector('.modal-backdrop').addEventListener('click', close);

    const dialog = backdrop.querySelector('.modal-dialog');
    const typeSel = dialog.querySelector('.inp-type');
    const typeOtherWrap = dialog.querySelector('.type-other');
    typeSel.addEventListener('change', ()=>{ typeOtherWrap.style.display = (typeSel.value==='Other')?'':'none'; });

    // NP image mode logic (URL or File) with live preview
    const npModeRadios = dialog.querySelectorAll("input[name='np_image_mode']");
    const npUrlWrap = dialog.querySelector('.np-url');
    const npFileWrap = dialog.querySelector('.np-file');
    const npUrlInput = dialog.querySelector('.inp-url');
    const npFileInput = dialog.querySelector('.inp-file');
    const npPreview = dialog.querySelector('.np-preview');
    let npFileDataUrl = '';
    function clearNpFile(){ npFileDataUrl=''; }
    function updateNpPreview(){
      const mode = dialog.querySelector("input[name='np_image_mode']:checked").value;
      if (mode==='url'){
        clearNpFile();
        const v = (npUrlInput.value||'').trim();
        if (v){ npPreview.innerHTML = `<img src="${escAttr(v)}" alt="NP Image" style="max-width:160px; border:1px solid var(--panel-border); border-radius:4px;"/>`; npPreview.style.display='block'; }
        else { npPreview.style.display='none'; npPreview.innerHTML=''; }
      } else {
        const f = npFileInput.files && npFileInput.files[0];
        if (f){
          const reader = new FileReader();
          reader.onload = (e) => {
            npFileDataUrl = e.target.result;
            npPreview.innerHTML = `<img src="${escAttr(npFileDataUrl)}" alt="NP Image" style="max-width:160px; border:1px solid var(--panel-border); border-radius:4px;"/>`;
            npPreview.style.display='block';
          };
          reader.readAsDataURL(f);
        } else { npPreview.style.display='none'; npPreview.innerHTML=''; npFileDataUrl=''; }
      }
    }
    npModeRadios.forEach(r=> r.addEventListener('change', ()=>{
      const mode = r.value;
      const isUrl = dialog.querySelector("input[name='np_image_mode']:checked").value === 'url';
      npUrlWrap.style.display = isUrl ? '' : 'none';
      npFileWrap.style.display = isUrl ? 'none' : '';
      updateNpPreview();
    }));
    npUrlInput && npUrlInput.addEventListener('input', updateNpPreview);
    npFileInput && npFileInput.addEventListener('change', updateNpPreview);

    const pre = dialog.querySelector('tbody.pre');
    const post = dialog.querySelector('tbody.post');
    dialog.querySelector('.btn-add-pre')?.addEventListener('click', ()=> pre.appendChild(buildNpRow()));
    dialog.querySelector('.btn-add-post')?.addEventListener('click', ()=> post.appendChild(buildNpRow()));

    function buildNpRow(){
      const tr=document.createElement('tr');
      const th=document.createElement('th'); th.contentEditable='true'; th.textContent=''; tr.appendChild(th);
      for(let i=0;i<5;i++){const td=document.createElement('td'); td.contentEditable='true'; tr.appendChild(td);} 
      return tr;
    }

    dialog.querySelector('.btn-save').addEventListener('click', ()=>{
      const title = dialog.querySelector('.inp-title').value.trim();
      const rank = dialog.querySelector('.inp-rank').value.trim();
      const type = typeSel.value==='Other' ? (dialog.querySelector('.inp-type-other').value.trim()) : typeSel.value.trim();
      const mode = dialog.querySelector("input[name='np_image_mode']:checked").value;
      const url = dialog.querySelector('.inp-url').value.trim();
      const file = dialog.querySelector('.inp-file');
      const desc = dialog.querySelector('.inp-desc').value.trim();
      const effects = dialog.querySelector('.inp-effects')?.value.trim() || '';
      const over = dialog.querySelector('.over-cell')?.textContent.trim() || '';
      const preRows = Array.from(pre.querySelectorAll('tr')).map(tr=>rowFromTr(tr));
      const postRows = Array.from(post.querySelectorAll('tr')).map(tr=>rowFromTr(tr));
      function rowFromTr(tr){
        const [labelCell, ...cells] = Array.from(tr.children);
        return { label: (labelCell?.textContent||'').trim(), values: cells.map(td => (td.textContent||'').trim()) };
      }

  const el = document.createElement('div');
  el.className='np-card';
  const imgSrc = (mode==='url' && url) ? url : (mode==='file' && file.files && file.files[0]) ? (npFileDataUrl || '') : '';
  const imgHtml = imgSrc ? `<div class=\"np-icon\"><img src=\"${escAttr(imgSrc)}\" alt=\"\"></div>` : '';
      el.innerHTML = `${imgHtml}<div class=\"np-info\"><div class=\"np-title-rank\"><strong>${escHtml(title||'(Untitled NP)')}</strong> ${rank?`<span class=\"rank\">(${escHtml(rank)})</span>`:''} ${type?`<span class=\"np-type\">[${escHtml(type)}]</span>`:''}</div><div class=\"np-desc\">${escHtml(desc)}</div>${fgoMode && effects?`<div class=\"np-effects\"><em>${escHtml(effects)}</em></div>`:''}</div>`;
      const rm=document.createElement('button'); rm.type='button'; rm.className='remove'; rm.textContent='×'; rm.addEventListener('click', ()=> el.remove()); el.appendChild(rm);
      el.__data = { title, rank, np_type: type, description: desc, effects, levels: { pre: preRows, overcharge: over, post: postRows }, image_url: imgSrc };
      npList.appendChild(el);
      close();
    });

    document.body.appendChild(backdrop);
  }

  // Generate Preview
  $('#generate-sheet').addEventListener('click', renderPreview);
  function renderPreview(){
    const servant = collectData();
    const out = $('#sheet');
    out.innerHTML = renderSheet(servant);
  }

  // Export
  $('#export-png').addEventListener('click', () => exportImage('png'));
  $('#export-pdf').addEventListener('click', () => exportPdf());

  async function exportImage(type){
    const el = $('#sheet');
    await ensureImagesReady(el);
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true });
    const mime = type==='jpeg'?'image/jpeg':'image/png';
    const data = canvas.toDataURL(mime);
    const a = document.createElement('a');
    a.href = data;
    a.download = `servant-sheet.${type}`;
    a.click();
  }
  async function exportPdf(){
    const el = $('#sheet');
    await ensureImagesReady(el);
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40; // margins
    const imgHeight = canvas.height * (imgWidth / canvas.width);

    let y = 20;
    let remaining = imgHeight;
    const sliceHeight = pageHeight - 40;

    while (remaining > 0){
      pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
      remaining = 0; // simple single-page for now; can implement slicing later if needed
      break;
    }
    pdf.save('servant-sheet.pdf');
  }

  // Ensure all images in the sheet are fully loaded before capture
  function ensureImagesReady(root){
    const imgs = Array.from(root.querySelectorAll('img'));
    const pending = imgs.filter(img => !img.complete || img.naturalWidth === 0);
    if (!pending.length) return Promise.resolve();
    return Promise.all(pending.map(img => img.decode ? img.decode().catch(()=>{}) : new Promise(res => {
      if (img.complete) return res();
      img.addEventListener('load', res, { once: true });
      img.addEventListener('error', res, { once: true });
    })));
  }

  // Clear
  $('#clear-all').addEventListener('click', () => {
    if (!confirm('Clear all inputs and preview?')) return;
    window.location.reload();
  });

  // Data collection
  function collectData(){
    // Basic
    const servant = {
      name: $('#name').value.trim(),
      gender: $('#gender').value.trim(),
  servant_class: (()=>{ const v=(classSelect?.value||'').trim(); return v==='Other' ? (classOtherInput?.value||'').trim() : v; })(),
  alignment: $('#alignment').value.trim(),
  hidden_attribute: (hiddenAttrSelect?.value||'').trim(),
      rarity: $('#rarity')?.value.trim() || '',
      biography: $('#biography').value.trim(),
      image_url: collectPortraitUrl(),
      parameters: {
        strength: $('#param_strength').value.trim(),
        endurance: $('#param_endurance').value.trim(),
        agility: $('#param_agility').value.trim(),
        mana: $('#param_mana').value.trim(),
        luck: $('#param_luck').value.trim(),
        np: $('#param_np').value.trim(),
      },
      conversation_lines: collectConversations(),
      class_skills: collectSkills(classList),
      personal_skills: collectSkills(personalList),
      noble_phantasms: collectNPs(),
      fgo_mode: fgoMode,
      fgo: fgoMode ? collectFgo() : {}
    };
    return servant;
  }
  function collectPortraitUrl(){
    const mode = $(`input[name='portrait_mode']:checked`).value;
    if (mode==='url'){ return $('#portrait-url').value.trim(); }
    return portraitDataUrl || '';
  }
  function collectConversations(){
    return $$('#conversation-items .conversation-item').map(it => ({
      title: it.querySelector('.conv-title').value.trim(),
      text: it.querySelector('.conv-text').value.trim(),
    })).filter(p => p.title || p.text);
  }
  function collectSkills(container){
    return $$('.skill-item', container).map(it => it.__data || { title:'', description:'', gameplay:'', levels:[] });
  }
  function collectNPs(){
    return $$('.np-card', npList).map(it => it.__data || {});
  }
  function collectFgo(){
    return {
      atk_min: $('#fgo_atk_min').value.trim(),
      atk_max: $('#fgo_atk_max').value.trim(),
      hp_min: $('#fgo_hp_min').value.trim(),
      hp_max: $('#fgo_hp_max').value.trim(),
      grail_100_atk: $('#fgo_grail_100_atk').value.trim(),
      grail_100_hp: $('#fgo_grail_100_hp').value.trim(),
      grail_120_atk: $('#fgo_grail_120_atk').value.trim(),
      grail_120_hp: $('#fgo_grail_120_hp').value.trim(),
      star_absorption: $('#fgo_star_absorption').value.trim(),
      star_generation: $('#fgo_star_generation').value.trim(),
      np_charge_attack: $('#fgo_np_charge_attack').value.trim(),
      np_charge_def: $('#fgo_np_charge_def').value.trim(),
      death_chance: $('#fgo_death_chance').value.trim(),
      traits: $('#fgo_traits').value.trim(),
      card_list: $('#fgo_card_list').value.trim(),
      hits: {
        quick: $('#fgo_hits_quick').value.trim(),
        arts: $('#fgo_hits_arts').value.trim(),
        buster: $('#fgo_hits_buster').value.trim(),
        extra: $('#fgo_hits_extra').value.trim(),
      }
    };
  }

  // Renderer (HTML) – mirrors templates/sheet.html structure
  function renderSheet(s){
    function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function sectionIf(cond, html){ return cond?html:''; }
    function tableRow(cells, header=false){
      const tag = header?'th':'td';
      return `<tr>${cells.map(c=>`<${tag}>${c}</${tag}>`).join('')}</tr>`;
    }

    const header = `
      <div class="sheet-header">
  ${s.image_url?`<div class="sheet-image"><img src="${escAttr(s.image_url)}" alt="Servant Image" crossOrigin="anonymous"/></div>`:''}
        <div class="sheet-basic">
          <h2 class="servant-name">${esc(s.name||'Unnamed Servant')}</h2>
          <div class="meta grid three">
            <div><strong>Gender:</strong> ${esc(s.gender)}</div>
            <div><strong>Class:</strong> ${esc(s.servant_class)}</div>
            <div><strong>Alignment:</strong> ${esc(s.alignment)}</div>
            <div><strong>Hidden Attribute:</strong> ${esc(s.hidden_attribute)}</div>
            ${s.rarity?`<div><strong>Rarity:</strong> ${esc(s.rarity)}</div>`:''}
          </div>
        </div>
      </div>`;

    const biography = `<section><h3>Biography</h3><p class="biography">${esc(s.biography)}</p></section>`;

    const params = `
      <section class="parameters">
        <h3>Parameters</h3>
        <table class="param-table"><thead>${tableRow(['STR','END','AGI','MANA','LUCK','NP'], true)}</thead>
          <tbody>${tableRow([s.parameters.strength,s.parameters.endurance,s.parameters.agility,s.parameters.mana,s.parameters.luck,s.parameters.np])}</tbody>
        </table>
        ${sectionIf(s.fgo_mode, renderFgo(s))}
      </section>`;

    const conv = sectionIf(s.conversation_lines && s.conversation_lines.length, `
      <section class="conversation-section"><h3>Conversation Lines</h3>
        <div class="conversation-list">
          ${s.conversation_lines.map(p=>`<div class="conversation-item"><div class="conversation-title"><strong>${esc(p.title)}</strong></div><div class="conversation-text">${esc(p.text)}</div></div>`).join('')}
        </div>
      </section>`);

    const classSkills = sectionIf(s.class_skills && s.class_skills.length, `
      <section><h3>${s.fgo_mode?'Passive Skills':'Class Skills'}</h3>
        <div class="skills-list">${s.class_skills.map(sk=>renderSkill(sk, s.fgo_mode)).join('')}</div>
      </section>`);

    const personalSkills = sectionIf(s.personal_skills && s.personal_skills.length, `
      <section><h3>${s.fgo_mode?'Active Skills':'Personal Skills'}</h3>
        <div class="skills-list">${s.personal_skills.map(sk=>renderSkill(sk, s.fgo_mode,true)).join('')}</div>
      </section>`);

    const nps = sectionIf(s.noble_phantasms && s.noble_phantasms.length, `
      <section><h3>Noble Phantasm(s)</h3>
        <div class="nps-list">${s.noble_phantasms.map(np=>renderNp(np, s.fgo_mode)).join('')}</div>
      </section>`);

    return `${header}${biography}${params}${conv}${classSkills}${personalSkills}${nps}`;

    function renderSkill(sk, fgo, isPersonal=false){
      const gameplay = fgo && sk.gameplay ? `<div class="gameplay"><em>${esc(sk.gameplay)}</em></div>` : '';
      const levels = fgo && isPersonal && sk.levels && sk.levels.length ? renderSkillLevels(sk.levels) : '';
  const icon = sk.image_url?`<div class="icon"><img src="${escAttr(sk.image_url)}" alt="" crossOrigin="anonymous"></div>`:'<div class="icon"></div>';
      return `<div class="skill-card">${icon}<div class="info"><div class="title"><strong>${esc(sk.title)}</strong></div><div class="desc">${esc(sk.description)}</div>${gameplay}${levels}</div></div>`;
    }
    function renderSkillLevels(rows){
      return `<table class="skill-levels"><thead><tr><th colspan="11">Scaling</th></tr><tr><th>Lvl</th>${Array.from({length:10},(_,i)=>`<th>${i+1}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th>${esc(r.label)}</th>${r.values.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    }
    function renderNp(np, fgo){
      const pre = np.levels?.pre||[]; const post = np.levels?.post||[]; const over = np.levels?.overcharge||'';
      const scaling = fgo && (pre.length || post.length || over)?
        `<table class="np-levels"><thead><tr><th colspan="6">NP Scaling</th></tr><tr><th>Label</th>${Array.from({length:5},(_,i)=>`<th>${i+1}</th>`).join('')}</tr></thead>`+
        `${pre.length?`<tbody>${pre.map(r=>`<tr><th>${esc(r.label)}</th>${r.values.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody>`:''}`+
        `<tbody><tr><td colspan="6"><strong>Overcharge Effect:</strong> ${esc(over)}</td></tr></tbody>`+
        `${post.length?`<tbody>${post.map(r=>`<tr><th>${esc(r.label)}</th>${r.values.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody>`:''}`+
        `</table>`
        : '';
  return `<div class="np-card">${np.image_url?`<div class=\"np-icon\"><img src=\"${escAttr(np.image_url)}\" alt=\"\" crossOrigin=\"anonymous\"></div>`:''}<div class="np-info"><div class="np-title-rank"><strong>${esc(np.title)}</strong>${np.rank?` <span class=\"rank\">(${esc(np.rank)})</span>`:''}${np.np_type?` <span class=\"np-type\">[${esc(np.np_type)}]</span>`:''}</div><div class="np-desc">${esc(np.description)}</div>${fgo && np.effects?`<div class=\"np-effects\"><em>${esc(np.effects)}</em></div>`:''}${scaling}</div></div>`;
    }
    function renderFgo(s){
      const g=s.fgo||{}; const hits=g.hits||{};
      return `<div class="fgo-stats-block"><h4>FGO Stats</h4>
        <table class="fgo-stats-table"><tbody>
          <tr><th>ATK</th><td>${esc(g.atk_min)} - ${esc(g.atk_max)}</td><th>HP</th><td>${esc(g.hp_min)} - ${esc(g.hp_max)}</td></tr>
          <tr><th>Lv.100 Grail</th><td>${esc(g.grail_100_atk)} / ${esc(g.grail_100_hp)}</td><th>Lv.120 Grail</th><td>${esc(g.grail_120_atk)} / ${esc(g.grail_120_hp)}</td></tr>
          <tr><th>Star Absorption</th><td>${esc(g.star_absorption)}</td><th>Star Generation %</th><td>${esc(g.star_generation)}</td></tr>
          <tr><th>NP Charge Attack %</th><td>${esc(g.np_charge_attack)}</td><th>NP Charge DEF %</th><td>${esc(g.np_charge_def)}</td></tr>
          <tr><th>Death Chance %</th><td colspan="3">${esc(g.death_chance)}</td></tr>
        </tbody></table>
        ${g.traits?`<div class="fgo-traits"><strong>Traits:</strong> ${esc(g.traits)}</div>`:''}
  ${g.card_list?`<div class="fgo-card-list"><strong>Card List:</strong> <img src="${escAttr(g.card_list)}" alt="Card List" class="card-list-img" crossOrigin="anonymous"/></div>`:''}
        <div class="fgo-hits"><strong>Hit Counts:</strong> Q ${esc(hits.quick)} / A ${esc(hits.arts)} / B ${esc(hits.buster)} / Ex ${esc(hits.extra)}</div>
      </div>`;
    }
    function escAttr(s){ return (s||'').replace(/"/g,'&quot;'); }
  }

  function escHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escAttr(s){ return (s||'').replace(/"/g,'&quot;'); }
  function escText(s){ return (s||'').replace(/</g,'&lt;'); }
})();
