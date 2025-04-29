// Fixed capability statement generator - no modal, just popup window
document.addEventListener('DOMContentLoaded', function() {
    // Find the generate PDF button
    const generateBtn = document.getElementById('generate-pdf');
    if (!generateBtn) return;

    // Replace original text, but keep styling
    generateBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Generate Capability Statement';
    
    // Remove any existing click handlers and add our new one
    generateBtn.onclick = function(e) {
        // Prevent default action and stop propagation to prevent modal
        e.preventDefault();
        e.stopPropagation();
        
        // Generate the capability statement in a new window
        generateCapabilityStatement();
        
        // Prevent other handlers from running
        return false;
    };
    
    // Also handle the DOWNLOAD PDF button in any existing modal
    const downloadPdfBtns = document.querySelectorAll('[id="download-capability-pdf"]');
    if (downloadPdfBtns.length > 0) {
        downloadPdfBtns.forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close modal if it exists
                const modal = document.getElementById('capability-preview-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // Generate the capability statement in a new window
                generateCapabilityStatement();
                
                return false;
            };
        });
    }
});

// Generate and open the capability statement
function generateCapabilityStatement() {
    // Get the accent color from CSS
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#FF6600';
    const currentYear = new Date().getFullYear();
    
    // Create a new window (no modal)
    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) {
        alert('Please allow pop-ups to generate the capability statement');
        return;
    }
    
    // Write the document to the new window
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>MarineStream Capability Statement</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <style>
                /* Base styles */
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #333;
                    font-size: 11pt;
                    line-height: 1.3;
                    background-color: white;
                }
                
                /* Print-specific styles */
                @page {
                    size: A4;
                    margin: 1.5cm 1.5cm 1.5cm 1.5cm;
                }
                
                .page {
                    width: 100%;
                    box-sizing: border-box;
                }
                
                .page-content {
                    max-width: 100%;
                }
                
                .page-break {
                    page-break-after: always;
                    height: 0;
                    margin: 0;
                    border: 0;
                }
                
                h1 { font-size: 18pt; font-weight: 700; margin: 0 0 5px 0; }
                h2 { font-size: 14pt; font-weight: 600; margin: 0 0 10px 0; }
                h3 { font-size: 12pt; font-weight: 600; margin: 0 0 8px 0; }
                p { margin: 0 0 8px 0; }
                ul { margin: 0; padding-left: 15px; }
                li { margin-bottom: 4px; }
                img { max-width: 100%; height: auto; }
                
                .columns {
                    display: flex;
                    gap: 15px;
                }
                
                .column {
                    flex: 1;
                }
                
                /* Print button */
                .print-button {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: ${accentColor};
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Inter', Arial, sans-serif;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 1000;
                    font-size: 14px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                
                .print-button:hover {
                    background-color: #E05A00;
                }
                
                @media print {
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <!-- First Page -->
            <div class="page">
                <div class="page-content">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid ${accentColor}; padding-bottom: 8px; margin-bottom: 12px;">
                        <img src="./assets/marinestream_logo_colour.png" alt="MarineStream Logo" style="height: 45px;">
                        <div style="text-align: right;">
                            <h1 style="color: #1a1a1a;">Capability Statement</h1>
                            <p style="color: ${accentColor}; font-size: 12pt; font-weight: 600; margin: 0;">Integrated Biofouling & Asset Management</p>
                        </div>
                    </div>

                    <!-- Introduction -->
                    <p style="margin-bottom: 12px; font-size: 10pt;"><strong>MarineStream™</strong>, a Franmarine technology, provides a revolutionary integrated system for proactive biofouling management and underwater asset sustainment. We merge Australia's only regulatory-compliant in-water cleaning (IWC) technology with a state-of-the-art, blockchain-secured data platform, delivering unparalleled compliance assurance, operational efficiency, and asset performance intelligence for the global maritime industry.</p>

                    <!-- Challenge & Solution -->
                    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                        <div style="flex: 1; background-color: #f8f9fa; padding: 10px; border-radius: 6px; border: 1px solid #e9ecef;">
                            <h2 style="color: #1a1a1a; font-size: 12pt; border-bottom: 2px solid ${accentColor}; padding-bottom: 3px;">The Challenge</h2>
                            <p style="font-size: 9pt; margin: 0;">Ineffective biofouling management leads to increased fuel consumption, higher emissions, invasive species transfer, regulatory penalties, and compromised asset integrity. Traditional methods often lack verifiable data, transparency, and proactive insights.</p>
                        </div>
                        <div style="flex: 1; background-color: #f8f9fa; padding: 10px; border-radius: 6px; border: 1px solid #e9ecef;">
                            <h2 style="color: #1a1a1a; font-size: 12pt; border-bottom: 2px solid ${accentColor}; padding-bottom: 3px;">The MarineStream™ Solution</h2>
                            <p style="font-size: 9pt; margin: 0;">An integrated ecosystem combining compliant hardware and an immutable digital platform to transform underwater sustainment in to a data-driven capability.</p>
                        </div>
                    </div>

                    <!-- Core System Components -->
                    <h2 style="color: ${accentColor}; font-size: 13pt; border-bottom: 1px solid #eeeeee; padding-bottom: 3px; margin-bottom: 10px;">Core System Components</h2>
                    <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                        <!-- Platform -->
                        <div style="flex: 1; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
                            <h3 style="background-color: #343a40; color: #ffffff; font-size: 11pt; margin: 0; padding: 6px 10px;">MarineStream™ Management Platform</h3>
                            <div style="padding: 8px;">
                                <ul style="margin: 0; padding-left: 15px; font-size: 9pt;">
                                    <li><strong>Blockchain Foundation:</strong> Ensures immutable, auditable records for compliance and data integrity across all operations.</li>
                                    <li><strong>Digitised BMP & Workflows:</strong> Manages Biofouling Management Plans, Record Books, multi-party inspection, cleaning, and repair processes.</li>
                                    <li><strong>Integrated Data Fusion:</strong> Captures live data directly from ROV, CCTV, and cleaning hardware for a 'single source of truth'.</li>
                                    <li><strong>Secure Live Streaming:</strong> Secure, real-time access for authorised stakeholders (Class, Regulators, Owners) to live operations and historical data.</li>
                                    <li><strong>Actionable Intelligence:</strong> Provides instant insights into asset readiness, compliance status, and maintenance requirements.</li>
                                </ul>
                            </div>
                        </div>
                        <!-- Cleaning System -->
                        <div style="flex: 1; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
                            <h3 style="background-color: #343a40; color: #ffffff; font-size: 11pt; margin: 0; padding: 6px 10px;">Compliant In-Water Cleaning System</h3>
                            <div style="padding: 8px;">
                                <ul style="margin: 0; padding-left: 15px; font-size: 9pt;">
                                    <li><strong>Australian IWCS Compliant:</strong> Our IWC system fully compliant with Australia's stringent standards, mitigating biosecurity risks.</li>
                                    <li><strong>Advanced Filtration & Treatment:</strong> Containerised 10µ filtration with UV sterilisation ensures effluent meets environmental regulations.</li>
                                    <li><strong>Full Biofouling Capture:</strong> Using a combination of divers and ROV we can clean with full capture, vessel hulls and complex niche areas.</li>
                                    <li><strong>Rapid & Versatile Deployment:</strong> Self-contained system deployable from wharf or vessel for maximum operational flexibility.</li>
                                    <li><strong>Defence & International Approval:</strong> Trusted by the Royal Australian Navy; Approved for use in Canada (RCN/CCG); Approved for use in UK by the Royal Navy.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Graph - ENLARGED -->
                    <div style="margin-top: 10px; text-align: center;">
                        <img src="./assets/graphCapStat.png" alt="Performance Graph" style="max-width: 100%; height: auto;">
                    </div>
                </div>
            </div>

            <!-- Page Break -->
            <div class="page-break"></div>

            <!-- Second Page -->
            <div class="page">
                <div class="page-content">
                    <!-- Key Capabilities -->
                    <h2 style="color: ${accentColor}; font-size: 13pt; border-bottom: 1px solid #eeeeee; padding-bottom: 3px; margin-bottom: 10px;">Key Capabilities & Value Proposition</h2>
                    
                    <div style="margin-bottom: 15px; font-size: 9.5pt;">
                        <div style="display: flex; gap: 15px; margin-bottom: 5px;">
                            <div style="flex: 1;">
                                <p style="margin: 0;"><strong>Unmatched Compliance:</strong> De-risk operations with verifiable adherence to biosecurity (IMO, AU IWCS) and Class requirements.</p>
                            </div>
                            <div style="flex: 1;">
                                <p style="margin: 0;"><strong>Data-Driven Decisions:</strong> Leverage objective, verifiable data for predictive maintenance and lifecycle asset management.</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-bottom: 5px;">
                            <div style="flex: 1;">
                                <p style="margin: 0;"><strong>Operational Efficiency:</strong> Reduce vessel downtime, optimise maintenance schedules, and streamline port entry processes.</p>
                            </div>
                            <div style="flex: 1;">
                                <p style="margin: 0;"><strong>Sovereign & Allied Capability:</strong> Australian-developed technology providing critical underwater sustainment support domestically and internationally (AUKUS).</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-bottom: 5px;">
                            <div style="flex: 1;">
                                <p style="margin: 0;"><strong>Performance Enhancement:</strong> Maintain optimal hull condition for improved fuel economy, reduced emissions, and enhanced acoustic performance.</p>
                            </div>
                            <div style="flex: 1;">
                                <p style="margin: 0;"><strong>Environmental Stewardship:</strong> Prevent translocation of invasive marine species through compliant cleaning and effluent treatment.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Certifications -->
                    <div style="background-color: #f8f9fa; padding: 8px; border-radius: 6px; border: 1px solid #e9ecef; margin-bottom: 15px; text-align: center;">
                        <h3 style="color: #1a1a1a; font-size: 11pt; margin: 0 0 3px 0;">Certified Management Systems</h3>
                        <p style="font-size: 9pt; margin: 0; color: #555;">
                            ISO 9001:2015 (Quality)   •   ISO 14001:2015 (Environmental)   •   ISO 45001:2018 (OH&S)
                        </p>
                    </div>
                    
                    <!-- Client Logos Section -->
                    <div style="margin-bottom: 15px;">
                        <h3 style="color: #1a1a1a; font-size: 11pt; margin: 0 0 5px 0;">Clients and Industry Partners</h3>
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 15px; padding: 8px; border-radius: 6px; border: 1px solid #e9ecef;">
                            <img src="./assets/AMC.jpg" alt="AMC Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/ame.jpg" alt="AME Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/AscLogo150x.jpg" alt="ASC Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/austal.jpg" alt="Austal Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/babcock.png" alt="Babcock Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/bae.jpg" alt="BAE Systems Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/bp.jpg" alt="BP Shipping Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/carnival.jpg" alt="Carnival Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/cma.jpg" alt="CMA CGM Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/cock.jpg" alt="City of Cockburn Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/dept_trans.jpg" alt="Department of Transport Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/echo.jpg" alt="Echo Marine Group Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/icm.jpg" alt="ICM Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/IKAD-Gold-Black-Smol.png" alt="IKAD Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/jfd.jpg" alt="JFD Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/maersk.jpg" alt="Maersk Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/inchscape.jpg" alt="Inchcape Shipping Services Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/nsm.jpg" alt="NSM Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/oldendorff.jpg" alt="Oldendorff Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/pta.jpg" alt="PTA Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/ran.jpg" alt="RAN Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/rio.jpg" alt="Rio Tinto Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/rotto.jpg" alt="Rottnest Island Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/scamp.jpg" alt="Scamp Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/Seatech-Logo.png" alt="SeaTec Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/silver.jpg" alt="Silver Yachts Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/subsea.jpg" alt="Subsea Global Solutions Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/svitzer.jpg" alt="Svitzer Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/swire.jpg" alt="Swire Shipping Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/teekay.jpg" alt="Teekay Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/wilhelmsen.jpg" alt="Wilhelmsen Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                            <img src="./assets/freoports.jpg" alt="Fremantle Ports Logo" style="height: 30px; object-fit: contain; max-width: 100px;">
                        </div>
                    </div>
                    
                    <!-- Contact Information -->
                    <div style="border-top: 2px solid ${accentColor}; padding-top: 10px; margin-top: 10px;">
                        <h2 style="color: #1a1a1a; font-size: 12pt; margin-top: 0; margin-bottom: 8px;">Partner with MarineStream</h2>
                        <p style="margin-bottom: 10px; font-size: 9pt;">Contact us to discuss how MarineStream can optimise your fleet's performance, ensure compliance, and enhance your underwater asset management strategy.</p>
                        
                        <!-- Contact details with logo -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <p style="margin: 0 0 3px 0; font-size: 9pt;"><strong>Mathew Harvey</strong></p>
                                <p style="margin: 0 0 3px 0; font-size: 9pt;"><strong>Phone:</strong> +61 408 930 300</p>
                                <p style="margin: 0 0 3px 0; font-size: 9pt;"><strong>Email:</strong> <a href="mailto:mharvey@franmarine.com.au" style="color: ${accentColor}; text-decoration: none;">mharvey@marinestream.com.au</a></p>
                                <p style="margin: 0 0 3px 0; font-size: 9pt;"><strong>Web:</strong> <a href="https://www.marinestream.com.au" target="_blank" style="color: ${accentColor}; text-decoration: none;">www.marinestream.com.au</a></p>
                                <p style="margin: 0 0 3px 0; font-size: 9pt;"><strong>Address:</strong> 13 Possner Way, Henderson, WA 6166, Australia</p>
                            </div>
                            <img src="./assets/logo.png" alt="MarineStream Logo" style="height: 50px; margin-left: 20px;">
                        </div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; margin-top: 15px; padding-top: 5px; color: #777777; font-size: 8pt; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0;">© ${currentYear} MarineStream™ | A Franmarine Company | Providing Practical Solutions</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Print button -->
            <button class="print-button" onclick="window.print()">
                <i class="fas fa-print"></i> Print to PDF
            </button>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}