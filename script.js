document.addEventListener('DOMContentLoaded', function() {
    // Bestehende Variablen-Deklarationen bleiben unverändert
    const ratingSliders = document.querySelectorAll('.rating-slider');
    const ratingValues = document.querySelectorAll('.rating-value');
    const totalPercentage = document.getElementById('total-percentage');
    const interviewNotes = document.getElementById('interview-notes');
    const exportTxtBtn = document.getElementById('export-txt');
    const exportPdfBtn = document.getElementById('export-pdf');
    const applicantName = document.getElementById('applicant-name');
    const interviewDate = document.getElementById('interview-date');
    const collapseBtns = document.querySelectorAll('.collapse-btn');

    let ratings = {};

    // Funktion zum Konvertieren eines Bildes in Base64
    function getBase64Image(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
    }

    // PDF Export Funktionalität
    exportPdfBtn.addEventListener('click', async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Logo laden und einfügen
        const logoImg = document.querySelector('.logo img');
        if (logoImg && logoImg.complete) {
            try {
                const logoBase64 = getBase64Image(logoImg);
                // Logo proportional skaliert einfügen
                const logoWidth = 40;
                const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
                const logoHeight = logoWidth * aspectRatio;
                doc.addImage(logoBase64, 'PNG', 20, 10, logoWidth, logoHeight);
            } catch (error) {
                console.error('Logo konnte nicht geladen werden:', error);
            }
        }

        // Überschrift und Kopfzeile
        doc.setFont('helvetica');
        doc.setFontSize(18);
        doc.text('MFA Interview-Bewertung', 70, 20);
        doc.setFontSize(12);
        doc.text('Kardiologische Praxis', 70, 30);

        // Trennlinie unter der Kopfzeile
        doc.setDrawColor(20, 65, 148); // GIG-Blau
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Hier folgt der Rest des bestehenden PDF-Export-Codes
        // ... (Rest des Codes bleibt zunächst unverändert)

    });

    // Restlicher bestehender Code bleibt unverändert
    // ...
});