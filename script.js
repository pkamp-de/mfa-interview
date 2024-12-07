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
});