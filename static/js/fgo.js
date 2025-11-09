(function(){
  const btn = document.getElementById('fgo-toggle');
  if (!btn) return;

  // Default off when page loads; allow persistence optional
  let fgo = false;
  try {
    const saved = sessionStorage.getItem('fgo-mode');
    fgo = saved === 'true' ? true : false; // default false for new sheet
  } catch(e) { fgo = false; }

  function updateUI(){
    btn.textContent = fgo ? 'FGO: On' : 'FGO: Off';
    btn.classList.toggle('active', fgo);
    document.documentElement.classList.toggle('fgo-mode', fgo);
    // Ensure a hidden input exists on create page
    const form = document.getElementById('servant-form');
    if (form){
      let hidden = form.querySelector('input[name="fgo_mode"]');
      if (!hidden){
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'fgo_mode';
        form.appendChild(hidden);
      }
      hidden.value = fgo ? '1' : '0';
      // Toggle FGO sections visibility
      document.querySelectorAll('[data-fgo-section]')
        .forEach(el => el.style.display = fgo ? '' : 'none');
      // Rename skill headings
      const classHeader = document.querySelector('#class-skills h2');
      const personalHeader = document.querySelector('#personal-skills h2');
      if (classHeader) classHeader.textContent = fgo ? 'Passive Skills' : 'Class Skills';
      if (personalHeader) personalHeader.textContent = fgo ? 'Active Skills' : 'Personal Skills';
      // Show extra gameplay fields in modals
      document.querySelectorAll('[data-fgo-only]')
        .forEach(el => el.style.display = fgo ? '' : 'none');
    }
  }

  btn.addEventListener('click', () => {
    fgo = !fgo;
    try { sessionStorage.setItem('fgo-mode', fgo ? 'true' : 'false'); } catch(e) {}
    updateUI();
  });

  // Initialize
  updateUI();
})();
