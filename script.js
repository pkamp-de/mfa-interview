document.addEventListener('DOMContentLoaded', function() {
    // Elemente auswählen
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

    // Event Listener für Slider
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

    // Gesamtwertung berechnen und anzeigen
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

    // Daten speichern
    function saveData() {
        localStorage.setItem('ratings', JSON.stringify(ratings));
    }

    // Helper function for debouncing
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

    // Initial load
    loadStoredData();

    // Rest der Funktionen bleibt gleich...
});