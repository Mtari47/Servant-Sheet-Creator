(function(){
  const docEl = document.documentElement;
  const btn = document.getElementById('theme-toggle');

  function setTheme(mode) {
    docEl.setAttribute('data-theme', mode);
    try { localStorage.setItem('theme', mode); } catch(e) {}
    if (btn) {
      if (mode === 'dark') {
        btn.textContent = '🌙 Dark';
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.textContent = '☀️ Light';
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem('theme');
    } catch(e) { return null; }
  }

  // Initialize based on saved theme or default applied in inline script
  const saved = getSavedTheme();
  setTheme(saved || docEl.getAttribute('data-theme') || 'dark');

  btn && btn.addEventListener('click', function(){
    const current = docEl.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
})();
