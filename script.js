document.addEventListener('DOMContentLoaded', function() {
    // Elemente auswählen
    const ratingSliders = document.querySelectorAll('.rating-slider');
    const ratingValues = document.querySelectorAll('.rating-value');
    const totalPercentage = document.getElementById('total-percentage');
    const interviewNotes = document.getElementById('interview-notes');
    const exportTxtBtn = document.getElementById('export-txt');
    const applicantName = document.getElementById('applicant-name');
    const interviewDate = document.getElementById('interview-date');
    const collapseBtns = document.querySelectorAll('.collapse-btn');

    // Ratings im localStorage speichern
    let ratings = {};

    // Collapse Funktionalität
    collapseBtns.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const collapsible = this.closest('.collapsible');
            collapsible.classList.toggle('active');
        });
    });

    // Vorhandene Bewertungen laden
    loadStoredData();

    // Event Listener für alle Slider
    ratingSliders.forEach((slider, index) => {
        slider.addEventListener('input', function() {
            // Wert anzeigen
            const valueDisplay = ratingValues[index];
            valueDisplay.textContent = this.value;
            
            // Rating speichern
            const sectionId = this.dataset.section;
            ratings[sectionId] = parseInt(this.value);
            
            // Gesamtwertung aktualisieren
            updateTotalScore();
            
            // Daten speichern
            saveData();
        });
    });

    // Notizen speichern
    interviewNotes.addEventListener('input', debounce(function() {
        localStorage.setItem('interviewNotes', this.value);
    }, 500));

    // Bewerberdaten speichern
    applicantName.addEventListener('input', debounce(function() {
        localStorage.setItem('applicantName', this.value);
    }, 500));

    interviewDate.addEventListener('input', function() {
        localStorage.setItem('interviewDate', this.value);
    });

    // Export-Funktionalität
    exportTxtBtn.addEventListener('click', function() {
        // Erstelle den Textinhalt für die Exportdatei
        let exportContent = `MFA Interview-Bewertung\n`;
        exportContent += `===============================\n\n`;
        
        // Bewerberdaten
        exportContent += `Name der Bewerberin: ${applicantName.value || '[Nicht angegeben]'}\n`;
        exportContent += `Datum des Gesprächs: ${interviewDate.value || '[Nicht angegeben]'}\n\n`;

        // Bewertungen für jeden Bereich
        document.querySelectorAll('.interview-section').forEach(section => {
            const title = section.querySelector('h2').textContent;
            const rating = section.querySelector('.rating-value').textContent;
            exportContent += `${title}\n`;
            exportContent += `Bewertung: ${rating}/10\n\n`;
        });

        // Gesamtbewertung
        exportContent += `Gesamtbewertung: ${totalPercentage.textContent}\n\n`;

        // Notizen
        exportContent += `Notizen:\n${interviewNotes.value || '[Keine Notizen]'}\n`;

        // Erstelle und triggere den Download
        const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
        const fileName = `MFA_Interview_${(applicantName.value || 'Unbenannt').replace(/\s+/g, '_')}_${interviewDate.value || 'kein_datum'}.txt`;
        
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, fileName);
        } else {
            const elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = fileName;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
    });

    // Gesamtwertung berechnen und anzeigen
    function updateTotalScore() {
        const values = Object.values(ratings);
        if (values.length === 0) return;

        // Berechnung: Summe aller Werte / (Anzahl der Bereiche * maximale Punktzahl) * 100
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

    // Gespeicherte Daten laden
    function loadStoredData() {
        // Ratings laden
        const storedRatings = localStorage.getItem('ratings');
        if (storedRatings) {
            ratings = JSON.parse(storedRatings);
            
            // Slider auf gespeicherte Werte setzen
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

        // Notizen laden
        const storedNotes = localStorage.getItem('interviewNotes');
        if (storedNotes) {
            interviewNotes.value = storedNotes;
        }

        // Bewerberdaten laden
        const storedName = localStorage.getItem('applicantName');
        if (storedName) {
            applicantName.value = storedName;
        }

        const storedDate = localStorage.getItem('interviewDate');
        if (storedDate) {
            interviewDate.value = storedDate;
        }
    }

    // Daten speichern
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