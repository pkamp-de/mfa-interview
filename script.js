document.addEventListener('DOMContentLoaded', function() {
    // Elemente auswählen (vorherige Deklarationen bleiben)
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

    // Daten laden und speichern
    function loadStoredData() {
        // Ratings laden
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

    // Daten speichern
    function saveData() {
        localStorage.setItem('ratings', JSON.stringify(ratings));
    }

    // Initial gespeicherte Daten laden
    loadStoredData();

    // Event Listener hier...
});
