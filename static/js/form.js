// Dynamic form behaviors
(function() {
  const modeRadios = document.querySelectorAll('input[name="image_mode"]');
  const urlInputWrap = document.getElementById('image-url-input');
  const fileInputWrap = document.getElementById('image-file-input');
  const imageUrlInput = document.querySelector('input[name="image_url"]');
  const imageFileInput = document.querySelector('input[name="image_file"]');
  const preview = document.getElementById('image-preview');

  function updateMode() {
    const value = document.querySelector('input[name="image_mode"]:checked').value;
    if (value === 'url') {
      urlInputWrap.style.display = '';
      fileInputWrap.style.display = 'none';
      updatePreviewFromURL();
    } else {
      urlInputWrap.style.display = 'none';
      fileInputWrap.style.display = '';
      preview.style.display = 'none';
    }
  }

  modeRadios.forEach(r => r.addEventListener('change', updateMode));

  function updatePreviewFromURL() {
    const val = imageUrlInput.value.trim();
    if (val) {
      preview.src = val;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  }
  imageUrlInput && imageUrlInput.addEventListener('input', updatePreviewFromURL);

  // Repeater sections (supports single input or pair: title + dialog)
  document.querySelectorAll('.repeater').forEach(rep => {
    const items = rep.querySelector('.items');
    const addBtn = rep.querySelector('.add-item');
    const isPair = rep.hasAttribute('data-pair');
    const inputName = rep.getAttribute('data-name');
    const titleName = rep.getAttribute('data-title-name');
    const textName = rep.getAttribute('data-text-name');

    function esc(v){ return String(v).replace(/"/g,'&quot;'); }

    function addItemSingle(initialValue='') {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<input type="text" name="${inputName}" value="${esc(initialValue)}" placeholder="Enter text"> <button type="button" class="remove" aria-label="Remove">×</button>`;
      items.appendChild(div);
      div.querySelector('.remove').addEventListener('click', () => div.remove());
    }

    function addItemPair(initTitle='', initText='') {
      const div = document.createElement('div');
      div.className = 'item pair';
      div.innerHTML = `
        <input type="text" class="conv-title" name="${titleName}" value="${esc(initTitle)}" placeholder="Title" style="min-width:180px"> 
        <textarea class="conv-text" name="${textName}" rows="2" placeholder="Dialog text" style="flex:1">${(initText||'').replace(/</g,'&lt;')}</textarea>
        <button type="button" class="remove" aria-label="Remove">×</button>`;
      items.appendChild(div);
      div.querySelector('.remove').addEventListener('click', () => div.remove());
    }

    addBtn.addEventListener('click', () => {
      if (isPair) addItemPair(); else addItemSingle();
    });

    // Add one starter item
    if (isPair) addItemPair(); else addItemSingle();
  });

  updateMode();
})();
