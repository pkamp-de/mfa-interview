document.addEventListener('DOMContentLoaded', function() {
    // ... [vorherige Variablen-Deklarationen bleiben gleich]
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

    // Neue Funktion zum Laden des SVG als Text
    async function loadSVG() {
        try {
            const response = await fetch('./GIG_LogoText.svg');
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;

            // SVG Dimensionen extrahieren
            const viewBox = svgElement.getAttribute('viewBox')?.split(' ') || [];
            const svgWidth = parseFloat(viewBox[2]) || svgElement.width?.baseVal?.value || 400;
            const svgHeight = parseFloat(viewBox[3]) || svgElement.height?.baseVal?.value || 100;

            return {
                svg: svgText,
                width: svgWidth,
                height: svgHeight,
                aspectRatio: svgHeight / svgWidth
            };
        } catch (error) {
            console.error('Fehler beim Laden des SVG:', error);
            return null;
        }
    }

    // PDF Export Funktionalität
    exportPdfBtn.addEventListener('click', async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        try {
            // SVG laden
            const svgData = await loadSVG();
            if (svgData) {
                // SVG für PDF vorbereiten
                const logoWidth = 40; // gewünschte Breite in mm
                const logoHeight = logoWidth * svgData.aspectRatio;
                
                // SVG als Base64 konvertieren
                const svgBase64 = btoa(unescape(encodeURIComponent(svgData.svg)));
                doc.addImage('data:image/svg+xml;base64,' + svgBase64, 'SVG', 20, 10, logoWidth, logoHeight);
            }
        } catch (error) {
            console.warn('Logo konnte nicht in PDF eingefügt werden:', error);
        }

        // Kopfzeile
        doc.setFontSize(18);
        doc.text('MFA Interview-Bewertung', 70, 20);
        doc.setFontSize(12);
        doc.text('Kardiologische Praxis', 70, 30);
        
        // Trennlinie
        doc.setDrawColor(22, 65, 148); // GIG-Blau
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Bewerberdaten
        doc.setFontSize(12);
        doc.text(`Name der Bewerberin: ${applicantName.value || '[Nicht angegeben]'}`, 20, 45);
        doc.text(`Datum des Gesprächs: ${interviewDate.value || '[Nicht angegeben]'}`, 20, 55);

        // Rest des PDF-Exports...
        let yPosition = 70;
        document.querySelectorAll('.interview-section').forEach(section => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            const title = section.querySelector('h2').textContent;
            const rating = section.querySelector('.rating-value').textContent;
            
            doc.setFontSize(11);
            doc.text(title, 20, yPosition);
            doc.text(`Bewertung: ${rating}/10`, 20, yPosition + 7);
            
            yPosition += 20;
        });

        // Gesamtbewertung
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Gesamtbewertung:', 20, yPosition);
        doc.setFontSize(12);
        doc.text(totalPercentage.textContent, 20, yPosition + 7);

        // Notizen
        yPosition += 20;
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Notizen:', 20, yPosition);
        doc.setFontSize(12);
        
        const splitNotes = doc.splitTextToSize(interviewNotes.value || '[Keine Notizen]', 170);
        doc.text(splitNotes, 20, yPosition + 7);

        // PDF speichern
        const fileName = `MFA_Interview_${(applicantName.value || 'Unbenannt').replace(/\\s+/g, '_')}_${interviewDate.value || 'kein_datum'}.pdf`;
        doc.save(fileName);
    });

    // Der Rest des Codes bleibt unverändert...
    // [Text-Export, UpdateTotalScore, etc.]

    // Collapse Funktionalität
    collapseBtns.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const collapsible = this.closest('.collapsible');
            collapsible.classList.toggle('active');
        });
    });

    // Event Listener für alle Slider
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

    // Basis-Funktionalität wie zuvor...
    loadStoredData();

    function updateTotalScore() {
        const values = Object.values(ratings);
        if (values.length === 0) return;

        const sum = values.reduce((acc, val) => acc + val, 0);
        const maxPossibleScore = 7 * 10;
        const percentage = (sum / maxPossibleScore) * 100;
        const roundedPercentage = Math.round(percentage);

        totalPercentage.textContent = roundedPercentage + '%';
        
        if (roundedPercentage >= 80) {
            totalPercentage.className = 'score-green';
        } else if (roundedPercentage < 60) {
            totalPercentage.className = 'score-red';
        } else {
            totalPercentage.className = '';
        }
    }

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

        // Load stored data
        const storedNotes = localStorage.getItem('interviewNotes');
        if (storedNotes) {
            interviewNotes.value = storedNotes;
        }

        const storedName = localStorage.getItem('applicantName');
        if (storedName) {
            applicantName.value = storedName;
        }

        const storedDate = localStorage.getItem('interviewDate');
        if (storedDate) {
            interviewDate.value = storedDate;
        }
    }

    function saveData() {
        localStorage.setItem('ratings', JSON.stringify(ratings));
    }

    // Hilfsfunktion für Debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});