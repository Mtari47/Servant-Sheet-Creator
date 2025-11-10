// FGO Mode toggle logic: shows/hides sections annotated with data-fgo-section and data-fgo-only
(function(){
	const btn = document.getElementById('fgo-toggle');
	if (!btn) return;
	let active = false;

	function apply(){
		const sections = document.querySelectorAll('[data-fgo-section]');
		sections.forEach(el => { el.style.display = active ? '' : 'none'; });
		const only = document.querySelectorAll('[data-fgo-only]');
		only.forEach(el => { el.style.display = active ? '' : 'none'; });
		btn.textContent = 'FGO: ' + (active ? 'On' : 'Off');
		btn.classList.toggle('active', active);
		// Hidden form flag if needed
		let flag = document.querySelector('input[name="fgo_mode"]');
		if (!flag){
			flag = document.createElement('input');
			flag.type = 'hidden';
			flag.name = 'fgo_mode';
			const form = document.getElementById('servant-form');
			form && form.appendChild(flag);
		}
		flag.value = active ? '1' : '0';
	}

	btn.addEventListener('click', () => { active = !active; apply(); });
	// Initialize once (off by default)
	apply();
})();

