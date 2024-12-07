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

    // Rest des bestehenden Codes...

    loadStoredData();
});