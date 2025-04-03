// Capability Statement Generator
function initCapabilityStatement() {
    const generatePDFBtn = document.getElementById('generate-pdf');
    const templateSource = document.getElementById('capability-statement-template');

    // Ensure necessary libraries and elements are present
    if (!generatePDFBtn || !templateSource || typeof Handlebars === 'undefined' || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        if (generatePDFBtn) {
            generatePDFBtn.disabled = true;
            generatePDFBtn.style.opacity = '0.5';
            generatePDFBtn.style.cursor = 'not-allowed';
            generatePDFBtn.title = "PDF Generation requires external libraries (Handlebars, html2canvas, jsPDF).";
        }
        console.warn("PDF Generator dependencies missing (Handlebars, html2canvas, jsPDF) or template element not found.");
        return;
    }

    // Make sure Font Awesome is loaded before attempting to generate PDF
    // This simple check might not be foolproof if FA loads very slowly,
    // but it's better than nothing. A more robust solution might involve
    // waiting for a specific event or using Font Awesome's JS API if available.
    const faLoaded = document.querySelector('link[href*="font-awesome"]');
    if (!faLoaded) {
         console.warn("Font Awesome CSS not detected. PDF icons might not render correctly.");
         // Optionally disable the button if icons are critical
         // generatePDFBtn.disabled = true;
         // generatePDFBtn.title = "Font Awesome required for PDF icons.";
    }

    generatePDFBtn.addEventListener('click', async function() {
        this.disabled = true;
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        // Create a temporary element to render the template
        const tempRenderDiv = document.createElement('div');
        tempRenderDiv.style.position = 'absolute';
        tempRenderDiv.style.left = '-9999px';
        tempRenderDiv.style.width = '842px'; // A4 width in pixels
        tempRenderDiv.style.background = '#ffffff';
        tempRenderDiv.style.padding = '20px';
        document.body.appendChild(tempRenderDiv);

        try {
            // Compile the Handlebars template
            const template = Handlebars.compile(templateSource.innerHTML);

            // Prepare data for the template
            const computedAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
            const currentYear = new Date().getFullYear();

            const capabilityData = {
                accentColor: computedAccentColor || '#FF6600',
                contactName: "Adam Falconer-West",
                contactEmail: "adam@franmarine.com.au",
                contactPhone: "+61 427 430 001",
                contactAddress: "13 Possner Way, Henderson, WA 6166, Australia",
                currentYear: currentYear
            };

            // Render the HTML content
            const renderedHtml = template(capabilityData);
            tempRenderDiv.innerHTML = renderedHtml;

            // Wait for images and fonts to load
            await new Promise(resolve => setTimeout(resolve, 500));

            // Generate PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Convert HTML to canvas
            const canvas = await html2canvas(tempRenderDiv, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: tempRenderDiv.offsetWidth,
                height: tempRenderDiv.scrollHeight
            });

            // Calculate dimensions
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pageHeight = 297; // A4 height in mm

            // Split content into pages based on height
            const pageCount = Math.ceil(imgHeight / pageHeight);
            const pages = [];

            for (let i = 0; i < pageCount; i++) {
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.min(canvas.height - (i * pageHeight * canvas.width / imgWidth), pageHeight * canvas.width / imgWidth);
                const ctx = pageCanvas.getContext('2d');
                
                // Draw the portion of the original canvas for this page
                ctx.drawImage(
                    canvas,
                    0, i * pageHeight * canvas.width / imgWidth,
                    canvas.width, pageCanvas.height,
                    0, 0,
                    canvas.width, pageCanvas.height
                );
                
                pages.push(pageCanvas);
            }

            // Add each page to the PDF
            pages.forEach((pageCanvas, index) => {
                if (index > 0) {
                    pdf.addPage();
                }
                const imgData = pageCanvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, (pageCanvas.height * imgWidth) / pageCanvas.width);
            });

            // Save the PDF
            pdf.save('MarineStream_Capability_Statement.pdf');

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again or contact support if the issue persists.");
        } finally {
            // Cleanup
            if (tempRenderDiv && document.body.contains(tempRenderDiv)) {
                document.body.removeChild(tempRenderDiv);
            }
            generatePDFBtn.disabled = false;
            generatePDFBtn.innerHTML = originalText;
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCapabilityStatement);