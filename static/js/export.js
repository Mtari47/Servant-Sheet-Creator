// Export the sheet as PDF/PNG/JPEG using html2canvas + jsPDF
// Hardened export logic with readiness checks, error diagnostics, and multi-page PDF fallback
(function(){
	function log(msg){ console.log('[export]', msg); }
	function error(msg){ console.error('[export]', msg); }

	function ready(fn){
		if (document.readyState === 'complete' || document.readyState === 'interactive') {
			setTimeout(fn,0);
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	}

	ready(() => {
		const sheet = document.getElementById('sheet');
		if (!sheet){ error('Sheet element not found.'); return; }
		const btnPDF = document.getElementById('download-pdf');
		const btnPNG = document.getElementById('download-png');
		const btnJPEG = document.getElementById('download-jpeg');
		const btnCreateAnother = document.getElementById('create-another');

		// Library presence checks
		if (typeof html2canvas !== 'function') error('html2canvas not loaded');
		if (!window.jspdf || !window.jspdf.jsPDF) error('jsPDF not loaded');

		async function renderCanvas(){
			if (typeof html2canvas !== 'function'){ throw new Error('html2canvas missing'); }
			await new Promise(r => setTimeout(r, 50)); // short delay for final layout
			return await html2canvas(sheet, {
				backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--sheet-bg') || '#ffffff',
				scale: Math.min(2, (window.devicePixelRatio || 1) * 1.2),
				useCORS: true,
				logging: false
			});
		}

		function filenameBase(){
			const name = document.querySelector('.servant-name')?.textContent?.trim() || 'servant-sheet';
			return name.replace(/\s+/g,'_').slice(0,80);
		}

		function triggerDownload(dataUrl, filename){
			const a = document.createElement('a');
			a.href = dataUrl; a.download = filename;
			document.body.appendChild(a); a.click(); a.remove();
		}

		async function downloadPNG(){
			try {
				log('PNG export starting');
				const canvas = await renderCanvas();
				triggerDownload(canvas.toDataURL('image/png'), filenameBase()+'.png');
				log('PNG export done');
			} catch(e){ error(e.message); }
		}

		async function downloadJPEG(){
			try {
				log('JPEG export starting');
				const canvas = await renderCanvas();
				triggerDownload(canvas.toDataURL('image/jpeg', 0.92), filenameBase()+'.jpg');
				log('JPEG export done');
			} catch(e){ error(e.message); }
		}

		async function downloadPDF(){
			try {
				if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('jsPDF missing');
				log('PDF export starting');
				const canvas = await renderCanvas();
				const imgData = canvas.toDataURL('image/png');
				const { jsPDF } = window.jspdf;
				const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
				const pageW = pdf.internal.pageSize.getWidth();
				const pageH = pdf.internal.pageSize.getHeight();
				let ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
				let imgW = canvas.width * ratio;
				let imgH = canvas.height * ratio;
				// Multi-page handling if height exceeds page
				if (imgH > pageH){
					ratio = pageW / canvas.width;
					imgW = canvas.width * ratio;
					imgH = canvas.height * ratio;
					let y = 0;
					const sliceHeight = Math.floor(canvas.height * (pageH / imgH));
					while (y < canvas.height){
						const slice = document.createElement('canvas');
						slice.width = canvas.width;
						slice.height = Math.min(sliceHeight, canvas.height - y);
						const ctx = slice.getContext('2d');
						ctx.drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
						const sliceData = slice.toDataURL('image/png');
						pdf.addImage(sliceData, 'PNG', 0, 0, pageW, pageH);
						y += sliceHeight;
						if (y < canvas.height) pdf.addPage();
					}
				} else {
					const x = (pageW - imgW) / 2;
					const y = (pageH - imgH) / 2;
					pdf.addImage(imgData, 'PNG', x, y, imgW, imgH);
				}
				pdf.save(filenameBase()+'.pdf');
				log('PDF export done');
			} catch(e){ error(e.message); }
		}

		btnPNG && btnPNG.addEventListener('click', (e)=>{ e.preventDefault(); downloadPNG(); });
		btnJPEG && btnJPEG.addEventListener('click', (e)=>{ e.preventDefault(); downloadJPEG(); });
		btnPDF && btnPDF.addEventListener('click', (e)=>{ e.preventDefault(); downloadPDF(); });
		btnCreateAnother && btnCreateAnother.addEventListener('click', ()=>{ window.location.href = '/create'; });
		log('Export controls initialized');
	});
})();

