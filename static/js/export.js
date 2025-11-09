(function(){
  const sheetEl = document.getElementById('sheet');
  const btnPdf = document.getElementById('download-pdf');
  const btnPng = document.getElementById('download-png');
  const btnJpeg = document.getElementById('download-jpeg');
  const btnCreateAnother = document.getElementById('create-another');

  async function renderCanvas() {
    const canvas = await html2canvas(sheetEl, { scale: 2, backgroundColor: '#ffffff' });
    return canvas;
  }

  function downloadURI(uri, name) {
    const a = document.createElement('a');
    a.href = uri;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  btnPng && btnPng.addEventListener('click', async () => {
    const canvas = await renderCanvas();
    downloadURI(canvas.toDataURL('image/png'), 'servant-sheet.png');
  });

  btnJpeg && btnJpeg.addEventListener('click', async () => {
    const canvas = await renderCanvas();
    downloadURI(canvas.toDataURL('image/jpeg', 0.95), 'servant-sheet.jpg');
  });

  btnPdf && btnPdf.addEventListener('click', async () => {
    const canvas = await renderCanvas();
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    // A4 dimensions in pt at 72dpi: 595 x 842
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 40; // margins
    const imgHeight = canvas.height * imgWidth / canvas.width;

    let y = 20;
    if (imgHeight <= pageHeight - 40) {
      pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
    } else {
      // If content taller than a single page, split
      let position = 0;
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      const scale = imgWidth / canvas.width;
      const sliceHeight = Math.floor((pageHeight - 40) / scale);
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      while (position < canvas.height) {
        pageCtx.clearRect(0,0,pageCanvas.width,pageCanvas.height);
        pageCtx.drawImage(canvas, 0, position, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        const pageData = pageCanvas.toDataURL('image/png');
        const h = Math.min(sliceHeight, canvas.height - position) * scale;
        pdf.addImage(pageData, 'PNG', 20, 20, imgWidth, h);
        position += sliceHeight;
        if (position < canvas.height) pdf.addPage();
      }
    }

    pdf.save('servant-sheet.pdf');
  });

  btnCreateAnother && btnCreateAnother.addEventListener('click', () => {
    window.location = '/create';
  });
})();
