document.addEventListener('DOMContentLoaded', function() {
    // ... [vorherige Variablen-Deklarationen bleiben gleich] ...

    // Vereinfachte SVG-Lade-Funktion
    async function loadSVG() {
        try {
            const response = await fetch('./GIG_LogoText.svg');
            if (!response.ok) throw new Error('SVG konnte nicht geladen werden');
            
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            
            // Prüfen auf Parse-Fehler
            const parserError = svgDoc.querySelector('parsererror');
            if (parserError) throw new Error('SVG Parse Fehler');

            const svgElement = svgDoc.documentElement;
            let width, height;

            // Dimensionen in dieser Reihenfolge prüfen: viewBox > width/height > default
            const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number);
            if (viewBox?.length === 4) {
                width = viewBox[2];
                height = viewBox[3];
            } else {
                width = parseFloat(svgElement.getAttribute('width')) || 400;
                height = parseFloat(svgElement.getAttribute('height')) || 100;
            }

            return {
                svgText,
                width,
                height,
                aspectRatio: height / width
            };
        } catch (error) {
            console.error('SVG Lade-Fehler:', error);
            return null;
        }
    }

    // PDF Export mit verbessertem SVG-Handling
    exportPdfBtn.addEventListener('click', async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        try {
            // SVG laden und vorbereiten
            const svgData = await loadSVG();
            if (svgData) {
                const logoWidth = 40;  // mm
                const logoHeight = logoWidth * svgData.aspectRatio;
                
                // UTF-8 Kodierung sicherstellen
                const svgBase64 = btoa(unescape(encodeURIComponent(svgData.svgText)));
                doc.addImage(
                    'data:image/svg+xml;base64,' + svgBase64,
                    'SVG',
                    20,  // x-Position
                    10,  // y-Position
                    logoWidth,
                    logoHeight
                );
            }
        } catch (error) {
            console.warn('Logo-Integration fehlgeschlagen:', error);
            // Fahre ohne Logo fort
        }

        // Rest des PDF-Exports bleibt unverändert...
        doc.setFontSize(18);
        doc.text('MFA Interview-Bewertung', 70, 20);
        // ... [Rest des Codes bleibt unverändert] ...
    });

    // ... [Rest des Codes bleibt unverändert] ...
});