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

    // Hilfsfunktion zum sicheren Laden des Logos
    async function loadLogo() {
        return new Promise((resolve, reject) => {
            const logoImg = document.querySelector('.logo img');
            if (!logoImg) {
                reject('Kein Logo-Element gefunden');
                return;
            }

            if (logoImg.complete) {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = logoImg.naturalWidth;
                    canvas.height = logoImg.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(logoImg, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch (error) {
                    reject(error);
                }
            } else {
                logoImg.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = logoImg.naturalWidth;
                        canvas.height = logoImg.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(logoImg, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    } catch (error) {
                        reject(error);
                    }
                };
                logoImg.onerror = () => reject('Logo konnte nicht geladen werden');
            }
        });
    }

    // PDF Export Funktionalität
    exportPdfBtn.addEventListener('click', async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        try {
            // Logo laden und einfügen
            const logoData = await loadLogo();
            const logoImg = document.querySelector('.logo img');
            const logoWidth = 40;
            const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
            const logoHeight = logoWidth * aspectRatio;
            doc.addImage(logoData, 'PNG', 20, 10, logoWidth, logoHeight);
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

        // Rest des PDF-Exports wie gehabt...
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

    // Text Export Funktionalität bleibt unverändert
    exportTxtBtn.addEventListener('click', function() {
        let exportContent = `MFA Interview-Bewertung\n`;
        exportContent += `===============================\n\n`;
        exportContent += `Name der Bewerberin: ${applicantName.value || '[Nicht angegeben]'}\n`;
        exportContent += `Datum des Gesprächs: ${interviewDate.value || '[Nicht angegeben]'}\n\n`;

        document.querySelectorAll('.interview-section').forEach(section => {
            const title = section.querySelector('h2').textContent;
            const rating = section.querySelector('.rating-value').textContent;
            exportContent += `${title}\n`;
            exportContent += `Bewertung: ${rating}/10\n\n`;
        });

        exportContent += `Gesamtbewertung: ${totalPercentage.textContent}\n\n`;
        exportContent += `Notizen:\n${interviewNotes.value || '[Keine Notizen]'}\n`;

        const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
        const fileName = `MFA_Interview_${(applicantName.value || 'Unbenannt').replace(/\\s+/g, '_')}_${interviewDate.value || 'kein_datum'}.txt`;
        
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