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

    // Collapse Button Funktionalität
    collapseBtns.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const collapsible = this.closest('.collapsible');
            collapsible.classList.toggle('active');
            
            // Icon drehen
            const icon = this.querySelector('.collapse-icon');
            if (collapsible.classList.contains('active')) {
                icon.textContent = '▲';
            } else {
                icon.textContent = '▼';
            }
        });
    });

    // Rest der Funktionen...
});