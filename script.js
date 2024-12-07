document.addEventListener('DOMContentLoaded', function() {
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

    // Slider Event Listener
    ratingSliders.forEach((slider, index) => {
        slider.addEventListener('input', function() {
            const valueDisplay = ratingValues[index];
            valueDisplay.textContent = this.value;
            const sectionId = this.dataset.section;
            ratings[sectionId] = parseInt(this.value);
            updateTotalScore();
            saveData();
        });
    });

    // Gesamtwertung berechnen und anzeigen
    function updateTotalScore() {
        const values = Object.values(ratings);
        if (values.length === 0) return;

        const sum = values.reduce((acc, val) => acc + val, 0);
        const maxPossibleScore = 7 * 10; // 7 Bereiche, max. 10 Punkte
        const percentage = (sum / maxPossibleScore) * 100;
        const roundedPercentage = Math.round(percentage);

        totalPercentage.textContent = roundedPercentage + '%';
        
        // Farbe basierend auf Prozentsatz
        if (roundedPercentage >= 80) {
            totalPercentage.className = 'score-green';
        } else if (roundedPercentage < 60) {
            totalPercentage.className = 'score-red';
        } else {
            totalPercentage.className = '';
        }
    }

    // Daten speichern
    function saveData() {
        localStorage.setItem('ratings', JSON.stringify(ratings));
    }

    // Gespeicherte Daten laden
    function loadStoredData() {
        const storedRatings = localStorage.getItem('ratings');
        if (storedRatings) {
            ratings = JSON.parse(storedRatings);
            ratingSliders.forEach(slider => {
                const sectionId = slider.dataset.section;
                if (ratings[sectionId]) {
                    slider.value = ratings[sectionId];
                    const index = Array.from(ratingSliders).indexOf(slider);
                    ratingValues[index].textContent = ratings[sectionId];
                }
            });
            updateTotalScore();
        }
    }

    // PDF Export Funktionalität
    exportPdfBtn.addEventListener('click', async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        try {
            // Logo laden und einfügen
            const response = await fetch('./GIG_LogoText.svg');
            const svgData = await response.text();
            const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
            doc.addImage('data:image/svg+xml;base64,' + svgBase64, 'SVG', 20, 10, 40, 15);
        } catch (error) {
            console.warn('Logo konnte nicht geladen werden:', error);
        }

        // Überschriften
        doc.setFontSize(18);
        doc.text('MFA Interview-Bewertung', 70, 20);
        doc.setFontSize(12);
        doc.text('Kardiologische Praxis', 70, 27);

        // Trennlinie
        doc.setDrawColor(22, 65, 148); // GIG-Blau
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Bewerberdaten
        doc.text(`Name der Bewerberin: ${applicantName.value || '[Nicht angegeben]'}`, 20, 45);
        doc.text(`Datum des Gesprächs: ${interviewDate.value || '[Nicht angegeben]'}`, 20, 52);

        // Bewertungen
        let yPos = 65;
        document.querySelectorAll('.interview-section').forEach((section) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            const title = section.querySelector('h2').textContent;
            const rating = section.querySelector('.rating-value').textContent;

            doc.setFontSize(11);
            doc.text(title, 20, yPos);
            doc.text(`${rating}/10`, 150, yPos);

            yPos += 10;
        });

        // Gesamtbewertung
        yPos += 10;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.text('Gesamtbewertung:', 20, yPos);
        doc.text(totalPercentage.textContent, 150, yPos);

        // Notizen
        yPos += 15;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.text('Notizen:', 20, yPos);
        doc.setFontSize(11);
        const notesText = interviewNotes.value || '[Keine Notizen]';
        const splitNotes = doc.splitTextToSize(notesText, 150);
        doc.text(splitNotes, 20, yPos + 8);

        // PDF speichern
        const fileName = `MFA_Interview_${(applicantName.value || 'Unbenannt').replace(/\s+/g, '_')}_${interviewDate.value || 'kein_datum'}.pdf`;
        doc.save(fileName);
    });

    // Initial load
    loadStoredData();
});