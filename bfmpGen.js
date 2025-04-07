// Biofouling Management Plan Generator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Show intro modal when page loads
    const introModal = document.getElementById('intro-modal');
    if (introModal) {
        introModal.style.display = 'flex';
        
        // Add listener to the start button
        const startButton = document.getElementById('start-generator');
        if (startButton) {
            startButton.addEventListener('click', function() {
                introModal.style.display = 'none';
                const planGeneratorModal = document.getElementById('plan-generator-modal');
                if (planGeneratorModal) {
                    planGeneratorModal.style.display = 'flex';
                }
            });
        }
    }

    // Close modals when clicking on X button
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    initBiofoulingPlanGenerator();
});

// Initialize the Biofouling Management Plan Generator
function initBiofoulingPlanGenerator() {
    const modal = document.getElementById('plan-generator-modal');
    if (!modal) {
        console.error('Plan Generator Modal not found');
        return;
    }
    console.log('Initializing Biofouling Plan Generator...');

    // Initialize progress indicator
    function updateProgressIndicator() {
        const tabs = modal.querySelectorAll('.tab-btn');
        const progressSteps = modal.querySelectorAll('.progress-step');

        // Find the active tab
        const activeTab = modal.querySelector('.tab-btn.active');
        if (!activeTab) return;

        // Calculate the active tab index (1-based)
        let activeIndex = 1;
        tabs.forEach((tab, index) => {
            if (tab === activeTab) {
                activeIndex = index + 1;
            }
        });

        // Update progress steps
        progressSteps.forEach((step, index) => {
            const stepIndex = parseInt(step.dataset.step);

            if (stepIndex < activeIndex) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepIndex === activeIndex) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    // Get all tabs and tab panes
    const tabButtons = modal.querySelectorAll('.tab-btn');
    const tabPanes = modal.querySelectorAll('.tab-pane');

    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Update progress indicator
            updateProgressIndicator();
        });
    });

    // Next/Previous tab navigation
    const nextButtons = modal.querySelectorAll('.next-tab');
    const prevButtons = modal.querySelectorAll('.prev-tab');

    nextButtons.forEach(button => {
        button.addEventListener('click', function () {
            const nextTabId = this.getAttribute('data-next');
            if (nextTabId) {
                // Find and click the corresponding tab button
                const nextTabButton = modal.querySelector(`.tab-btn[data-tab="${nextTabId}"]`);
                if (nextTabButton) {
                    nextTabButton.click();
                }
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', function () {
            const prevTabId = this.getAttribute('data-prev');
            if (prevTabId) {
                // Find and click the corresponding tab button
                const prevTabButton = modal.querySelector(`.tab-btn[data-tab="${prevTabId}"]`);
                if (prevTabButton) {
                    prevTabButton.click();
                }
            }
        });
    });

    // Initialize signature pad
    const signaturePad = document.getElementById('signaturePad');
    let signature = null;
    
    if (signaturePad) {
        const canvas = signaturePad;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Canvas state
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        
        // Drawing functions
        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = getMousePosition(canvas, e);
        }
        
        function draw(e) {
            if (!isDrawing) return;
            
            const [x, y] = getMousePosition(canvas, e);
            
            context.strokeStyle = '#000';
            context.lineWidth = 2;
            context.lineJoin = 'round';
            context.lineCap = 'round';
            
            context.beginPath();
            context.moveTo(lastX, lastY);
            context.lineTo(x, y);
            context.stroke();
            
            [lastX, lastY] = [x, y];
        }
        
        function stopDrawing() {
            isDrawing = false;
            // Save signature data
            signature = canvas.toDataURL();
        }
        
        function getMousePosition(canvas, e) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
            const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
            return [x, y];
        }
        
        // Event listeners for mouse and touch
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
        
        // Clear signature
        const clearSignatureButton = document.getElementById('clearSignature');
        if (clearSignatureButton) {
            clearSignatureButton.addEventListener('click', function() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                signature = null;
            });
        }
    }

    // Handling file uploads with previews
    function setupFileUploadPreview(inputId, previewId) {
        const fileInput = document.getElementById(inputId);
        const previewContainer = document.getElementById(previewId);
        
        if (fileInput && previewContainer) {
            fileInput.addEventListener('change', function(e) {
                const files = e.target.files;
                previewContainer.innerHTML = ''; // Clear previous previews
                
                if (files && files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const reader = new FileReader();
                        
                        reader.onload = function(event) {
                            const photoDiv = document.createElement('div');
                            photoDiv.className = 'photo-preview';
                            
                            const img = document.createElement('img');
                            img.src = event.target.result;
                            img.className = 'preview-img';
                            
                            const deleteButton = document.createElement('button');
                            deleteButton.className = 'photo-delete-btn';
                            deleteButton.innerHTML = '<i class="fas fa-times"></i>';
                            deleteButton.addEventListener('click', function() {
                                photoDiv.remove();
                            });
                            
                            photoDiv.appendChild(img);
                            photoDiv.appendChild(deleteButton);
                            previewContainer.appendChild(photoDiv);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                }
            });
        }
    }

    // Set up file upload previews
    setupFileUploadPreview('diagramFiles', 'diagrams-preview');
    setupFileUploadPreview('coverPhoto', 'cover-preview');
    setupFileUploadPreview('companyLogo', 'logo-preview');

    // Dynamic AFC (Anti-fouling Coating) Items
    const addAfcButton = document.getElementById('add-afc');
    const afcContainer = document.getElementById('afc-container');
    let afcCounter = 1;

    if (addAfcButton && afcContainer) {
        addAfcButton.addEventListener('click', function() {
            afcCounter++;
            
            // Clone the first AFC item and update IDs
            const firstAfcItem = afcContainer.querySelector('.afc-item');
            const newAfcItem = firstAfcItem.cloneNode(true);
            
            newAfcItem.dataset.afcId = afcCounter;
            
            // Update all input IDs and labels within the new item
            const inputs = newAfcItem.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                const oldId = input.id;
                const newId = oldId.replace(/\d+$/, afcCounter);
                input.id = newId;
                
                // Find and update corresponding label
                const label = newAfcItem.querySelector(`label[for="${oldId}"]`);
                if (label) {
                    label.setAttribute('for', newId);
                }
                
                // Clear input values
                input.value = '';
                if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                }
            });
            
            // Show remove button
            const removeButton = newAfcItem.querySelector('.remove-afc');
            if (removeButton) {
                removeButton.style.display = 'inline-block';
                removeButton.addEventListener('click', function() {
                    newAfcItem.remove();
                });
            }
            
            afcContainer.appendChild(newAfcItem);
        });
        
        // Enable the remove button on the first item if there's more than one
        const updateRemoveButtons = () => {
            const afcItems = afcContainer.querySelectorAll('.afc-item');
            afcItems.forEach(item => {
                const btn = item.querySelector('.remove-afc');
                if (btn) {
                    btn.style.display = afcItems.length > 1 ? 'inline-block' : 'none';
                }
            });
        };
        
        // Initial setup for the first AFC item's remove button
        const firstRemoveButton = afcContainer.querySelector('.afc-item .remove-afc');
        if (firstRemoveButton) {
            firstRemoveButton.addEventListener('click', function() {
                if (afcContainer.querySelectorAll('.afc-item').length > 1) {
                    this.closest('.afc-item').remove();
                    updateRemoveButtons();
                }
            });
        }
    }

    // Dynamic MGPS (Marine Growth Prevention System) Items
    const addMgpsButton = document.getElementById('add-mgps');
    const mgpsContainer = document.getElementById('mgps-container');
    let mgpsCounter = 1;

    if (addMgpsButton && mgpsContainer) {
        addMgpsButton.addEventListener('click', function() {
            mgpsCounter++;
            
            // Clone the first MGPS item and update IDs
            const firstMgpsItem = mgpsContainer.querySelector('.mgps-item');
            const newMgpsItem = firstMgpsItem.cloneNode(true);
            
            newMgpsItem.dataset.mgpsId = mgpsCounter;
            
            // Update all input IDs and labels within the new item
            const inputs = newMgpsItem.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                const oldId = input.id;
                const newId = oldId.replace(/\d+$/, mgpsCounter);
                input.id = newId;
                
                // Find and update corresponding label
                const label = newMgpsItem.querySelector(`label[for="${oldId}"]`);
                if (label) {
                    label.setAttribute('for', newId);
                }
                
                // Clear input values
                input.value = '';
                if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                }
            });
            
            // Show remove button
            const removeButton = newMgpsItem.querySelector('.remove-mgps');
            if (removeButton) {
                removeButton.style.display = 'inline-block';
                removeButton.addEventListener('click', function() {
                    newMgpsItem.remove();
                });
            }
            
            mgpsContainer.appendChild(newMgpsItem);
        });
        
        // Enable the remove button on the first item if there's more than one
        const updateRemoveButtons = () => {
            const mgpsItems = mgpsContainer.querySelectorAll('.mgps-item');
            mgpsItems.forEach(item => {
                const btn = item.querySelector('.remove-mgps');
                if (btn) {
                    btn.style.display = mgpsItems.length > 1 ? 'inline-block' : 'none';
                }
            });
        };
        
        // Initial setup for the first MGPS item's remove button
        const firstRemoveButton = mgpsContainer.querySelector('.mgps-item .remove-mgps');
        if (firstRemoveButton) {
            firstRemoveButton.addEventListener('click', function() {
                if (mgpsContainer.querySelectorAll('.mgps-item').length > 1) {
                    this.closest('.mgps-item').remove();
                    updateRemoveButtons();
                }
            });
        }
    }

    // Preview and Generate Plan
    const previewButton = document.getElementById('preview-plan');
    const generateButton = document.getElementById('generate-plan');
    const planPreviewContainer = document.getElementById('plan-preview-container');
    const planPreviewModal = document.getElementById('plan-preview-modal');

    // Collect all data from the form
    function collectPlanData() {
        const data = {
            // Vessel Details
            vessel: {
                name: getValue('vesselName'),
                imo: getValue('imoNumber'),
                constructionDate: getValue('constructionDate'),
                type: getValue('vesselType'),
                grossTonnage: getValue('grossTonnage'),
                beam: getValue('beam'),
                length: getValue('length'),
                maxDraft: getValue('maxDraft'),
                minDraft: getValue('minDraft'),
                flag: getValue('flag')
            },
            // BFMP Revision Info
            revision: {
                lastDrydock: getValue('lastDrydock'),
                nextDrydock: getValue('nextDrydock'),
                number: getValue('revisionNumber'),
                date: getValue('revisionDate'),
                responsiblePerson: getValue('responsiblePerson'),
                responsiblePosition: getValue('responsiblePosition')
            },
            // Operating Profile
            operatingProfile: {
                speed: getValue('operatingSpeed'),
                inServicePeriod: getValue('inServicePeriod'),
                tradingRoutes: getValue('tradingRoutes'),
                operatingArea: getValue('operatingArea'),
                climateZones: getValue('climateZones'),
                afsSuitability: getValue('afsSuitability')
            },
            // Hull & Niche Areas
            nicheAreas: {
                description: getValue('nicheAreaDescription'),
                diagrams: getFileDataUrls('diagramFiles')
            },
            // Anti-fouling Coatings
            afc: collectAfcData(),
            // IAFS Certificate
            iafs: {
                number: getValue('iafsNumber'),
                issueDate: getValue('iafsIssueDate'),
                file: getFileDataUrl('iafsFile')
            },
            // Marine Growth Prevention Systems
            mgps: collectMgpsData(),
            // AFS Installation
            afsInstallation: getValue('afsInstallation'),
            // Inspection & Cleaning
            maintenance: {
                inspectionSchedule: getValue('inspectionSchedule'),
                cleaningSchedule: getValue('cleaningSchedule')
            },
            // Risk Monitoring
            riskManagement: {
                parameters: getValue('riskParameters'),
                deviationLimits: getValue('deviationLimits'),
                contingencyActions: getValue('contingencyActions'),
                longTermActions: getValue('longTermActions')
            },
            // Waste & Safety
            procedures: {
                wasteManagement: getValue('wasteManagement'),
                safetyProcedures: getValue('safetyProcedures')
            },
            // Crew Training
            crewTraining: getValue('crewTraining'),
            // Document Settings
            document: {
                title: getValue('planTitle'),
                number: getValue('documentNumber'),
                revision: getValue('documentRevision'),
                format: getValue('planFormat'),
                coverPhoto: getFileDataUrl('coverPhoto'),
                companyLogo: getFileDataUrl('companyLogo')
            }
        };

        // Check for required fields, but don't stop generation if missing
        const requiredFields = validateRequiredFields();
        if (!requiredFields.valid) {
            // Just warn the user but don't prevent generation
            if (confirm(`Some recommended fields are missing in: ${requiredFields.sections.join(', ')}. Do you want to continue with placeholders for these fields?`)) {
                return data;
            } else {
                return null;
            }
        }

        return data;
    }

    // Helper function to get input value by ID
    function getValue(id) {
        const element = document.getElementById(id);
        if (!element) return '';
        
        if (element.type === 'checkbox') {
            return element.checked;
        }
        
        return element.value;
    }

    // Helper function to get file data URL
    function getFileDataUrl(id) {
        const fileInput = document.getElementById(id);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            return null;
        }
        
        const previewDiv = fileInput.parentElement.querySelector('.preview-img');
        return previewDiv ? previewDiv.src : null;
    }

    // Helper function to get all file data URLs from multiple file input
    function getFileDataUrls(id) {
        const fileInput = document.getElementById(id);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            return [];
        }
        
        const previewContainer = document.getElementById(id.replace('Files', '-preview'));
        if (!previewContainer) return [];
        
        const previewImgs = previewContainer.querySelectorAll('.preview-img');
        return Array.from(previewImgs).map(img => img.src);
    }

    // Collect Anti-fouling Coating data
    function collectAfcData() {
        const afcItems = document.querySelectorAll('.afc-item');
        const afcData = [];
        
        afcItems.forEach(item => {
            const afcId = item.dataset.afcId;
            
            afcData.push({
                productName: getValue(`afcProductName${afcId}`),
                manufacturer: getValue(`afcManufacturer${afcId}`),
                type: getValue(`afcType${afcId}`),
                serviceLife: getValue(`afcServiceLife${afcId}`),
                locations: getValue(`afcLocations${afcId}`),
                suitableProfile: getValue(`afcSuitableProfile${afcId}`),
                maintenance: getValue(`afcMaintenance${afcId}`)
            });
        });
        
        return afcData;
    }

    // Collect Marine Growth Prevention System data
    function collectMgpsData() {
        const mgpsItems = document.querySelectorAll('.mgps-item');
        const mgpsData = [];
        
        mgpsItems.forEach(item => {
            const mgpsId = item.dataset.mgpsId;
            
            mgpsData.push({
                manufacturer: getValue(`mgpsManufacturer${mgpsId}`),
                model: getValue(`mgpsModel${mgpsId}`),
                type: getValue(`mgpsType${mgpsId}`),
                serviceLife: getValue(`mgpsServiceLife${mgpsId}`),
                locations: getValue(`mgpsLocations${mgpsId}`),
                manual: getValue(`mgpsManual${mgpsId}`)
            });
        });
        
        return mgpsData;
    }

    // Validate that all required fields are filled
    function validateRequiredFields() {
        const sections = {
            'vessel-details': 'Vessel Details',
            'operating-profile': 'Operating Profile',
            'anti-fouling': 'Anti-fouling Systems',
            'management': 'Management Procedures',
            'generate': 'Generate Plan'
        };
        
        const missingSections = [];
        
        // Check each section for required fields
        for (const [tabId, sectionName] of Object.entries(sections)) {
            const tab = document.getElementById(tabId);
            const requiredFields = tab.querySelectorAll('[required]');
            
            for (const field of requiredFields) {
                if (!field.value) {
                    missingSections.push(sectionName);
                    break;
                }
            }
        }
        
        return {
            valid: missingSections.length === 0,
            sections: missingSections
        };
    }

    if (previewButton) {
        previewButton.addEventListener('click', function () {
            try {
                const planData = collectPlanData();
                if (planData) {
                    const planHtml = generatePlanHtml(planData);

                    // Show loading indicator while rendering preview
                    const loadingIndicator = document.createElement('div');
                    loadingIndicator.classList.add('loading-indicator');
                    loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Preview...';
                    document.body.appendChild(loadingIndicator);

                    setTimeout(() => {
                        // Remove loading indicator
                        document.body.removeChild(loadingIndicator);
                        
                        if (planPreviewContainer) {
                            planPreviewContainer.innerHTML = planHtml;
                            
                            // Add custom styles to the preview for better rendering
                            const previewStyles = document.createElement('style');
                            previewStyles.textContent = `
                                .report-preview {
                                    font-family: Arial, sans-serif;
                                    padding: 20px;
                                    background-color: white;
                                    color: #333;
                                    max-width: 100%;
                                    margin: 0 auto;
                                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                                }
                                .report-header {
                                    text-align: center;
                                    margin-bottom: 20px;
                                    padding-bottom: 15px;
                                    border-bottom: 2px solid #ddd;
                                }
                                .report-preview h1 {
                                    font-size: 24px;
                                    color: #333;
                                    margin-bottom: 10px;
                                }
                                .report-preview h2 {
                                    font-size: 20px;
                                    color: #ff6600;
                                    margin-top: 20px;
                                    margin-bottom: 10px;
                                    padding-bottom: 5px;
                                    border-bottom: 1px solid #ddd;
                                }
                                .report-preview h3 {
                                    font-size: 16px;
                                    color: #444;
                                    margin-top: 15px;
                                    margin-bottom: 8px;
                                }
                                .report-preview p {
                                    margin-bottom: 10px;
                                    line-height: 1.5;
                                }
                                .details-table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin-bottom: 15px;
                                }
                                .details-table th,
                                .details-table td {
                                    border: 1px solid #ddd;
                                    padding: 8px 12px;
                                }
                                .details-table th {
                                    background-color: #f5f5f5;
                                    font-weight: 600;
                                    text-align: left;
                                }
                                .placeholder-text {
                                    color: #666;
                                    font-style: italic;
                                    background-color: rgba(255, 102, 0, 0.05);
                                    padding: 2px 5px;
                                    border-left: 2px solid #ff6600;
                                }
                                .placeholder-section {
                                    background-color: rgba(255, 102, 0, 0.05);
                                    border-left: 3px solid #ff6600;
                                    padding: 10px 15px;
                                    margin: 10px 0;
                                    font-style: italic;
                                    color: #666;
                                }
                            `;
                            planPreviewContainer.appendChild(previewStyles);
                        }

                        if (planPreviewModal) {
                            // Show the preview modal
                            planPreviewModal.style.display = 'flex';
                        }
                    }, 800); // Short delay to allow browser to render
                }
            } catch (error) {
                console.error('Error generating preview:', error);
                alert('An error occurred while generating the preview. Please try again.');
            }
        });
    }

    if (generateButton) {
        generateButton.addEventListener('click', function () {
            try {
                const planData = collectPlanData();
                if (planData) {
                    const planHtml = generatePlanHtml(planData);

                    // Generate PDF
                    if (typeof html2pdf !== 'undefined') {
                        const element = document.createElement('div');
                        element.innerHTML = planHtml;
                        document.body.appendChild(element);

                        const options = {
                            margin: 10,
                            filename: `${planData.vessel.name || 'Vessel'}_BFMP_${new Date().toISOString().slice(0, 10)}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2, useCORS: true },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        };

                        // Show loading indicator
                        const loadingIndicator = document.createElement('div');
                        loadingIndicator.classList.add('loading-indicator');
                        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
                        document.body.appendChild(loadingIndicator);

                        html2pdf().set(options).from(element).save().then(() => {
                            // Remove temporary elements
                            document.body.removeChild(element);
                            document.body.removeChild(loadingIndicator);
                            
                            // Show success message
                            alert('BFMP successfully generated and downloaded!');
                        }).catch(error => {
                            console.error('Error generating PDF:', error);
                            document.body.removeChild(loadingIndicator);
                            alert('An error occurred while generating the PDF. Please try again.');
                        });
                    } else {
                        // Fallback to downloading as HTML
                        console.warn('html2pdf.js not available, falling back to HTML download');
                        const blob = new Blob([planHtml], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${planData.vessel.name || 'Vessel'}_BFMP_${new Date().toISOString().slice(0, 10)}.html`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                }
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('An error occurred while generating the PDF. Please try again.');
            }
        });
    }

    // Close preview modal button
    const closePreviewButton = document.getElementById('close-preview');
    if (closePreviewButton && planPreviewModal) {
        closePreviewButton.addEventListener('click', function () {
            planPreviewModal.style.display = 'none';
        });
    }

    // Download from preview button
    const downloadPlanButton = document.getElementById('download-plan');
    if (downloadPlanButton && planPreviewContainer) {
        downloadPlanButton.addEventListener('click', function () {
            try {
                const planData = collectPlanData();
                if (planData) {
                    // Generate PDF using html2pdf if available
                    if (typeof html2pdf !== 'undefined') {
                        // Show loading indicator
                        const loadingIndicator = document.createElement('div');
                        loadingIndicator.classList.add('loading-indicator');
                        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
                        document.body.appendChild(loadingIndicator);

                        const options = {
                            margin: 10,
                            filename: `${planData.vessel.name || 'Vessel'}_BFMP_${new Date().toISOString().slice(0, 10)}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2, useCORS: true },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        };

                        html2pdf().set(options).from(planPreviewContainer).save().then(() => {
                            document.body.removeChild(loadingIndicator);
                            // Close preview modal
                            const planPreviewModal = document.getElementById('plan-preview-modal');
                            if (planPreviewModal) {
                                planPreviewModal.style.display = 'none';
                            }
                            
                            // Show success message
                            alert('BFMP successfully generated and downloaded!');
                        }).catch(error => {
                            console.error('Error generating PDF:', error);
                            document.body.removeChild(loadingIndicator);
                            alert('An error occurred while generating the PDF. Please try again.');
                        });
                    } else {
                        // Fallback to downloading as HTML
                        const blob = new Blob([planPreviewContainer.innerHTML], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${planData.vessel.name || 'Vessel'}_BFMP_${new Date().toISOString().slice(0, 10)}.html`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                }
            } catch (error) {
                console.error('Error downloading plan:', error);
                alert('An error occurred while downloading the plan. Please try again.');
            }
        });
    }

    // Close modals when clicking on the overlay
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Initialize first tab
    updateProgressIndicator();
}

// Generate HTML for BFMP
function generatePlanHtml(data) {
    // Format date strings
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    }

    // Function to handle potentially empty fields with placeholders
    function getFieldValueOrPlaceholder(value, placeholder) {
        if (!value || value === 'N/A' || value === '') {
            return `<span class="placeholder-text">${placeholder}</span>`;
        }
        return value;
    }

    // Create table of contents
    const tocHtml = `
        <h2>Index</h2>
        <div class="toc">
            <ol>
                <li><a href="#intro">Introduction / Plan Overview</a></li>
                <li><a href="#vessel">Vessel Particulars</a></li>
                <li><a href="#revision">Record of Revision</a></li>
                <li><a href="#operating">Operating Profile</a></li>
                <li><a href="#niche">Hull and Niche Areas</a></li>
                <li><a href="#afs">Anti-fouling Systems (AFS)</a></li>
                <li><a href="#installation">Installation of Anti-fouling Systems</a></li>
                <li><a href="#inspection">Inspection Schedule</a></li>
                <li><a href="#cleaning">Cleaning Schedule</a></li>
                <li><a href="#monitoring">Monitoring of Biofouling Risk Parameters</a></li>
                <li><a href="#waste">Capture and Disposal of Waste</a></li>
                <li><a href="#safety">Safety Procedures</a></li>
                <li><a href="#training">Crew Training and Familiarisation</a></li>
                <li><a href="#recordbook">Biofouling Record Book</a></li>
            </ol>
        </div>
    `;

    // Create AFC section HTML with placeholders
    let afcHtml = '';
    if (data.afc && data.afc.length > 0) {
        data.afc.forEach((afc, index) => {
            afcHtml += `
                <div class="afs-section">
                    <h4>Anti-fouling Coating ${index + 1}: ${afc.productName || 'Unspecified Coating'}</h4>
                    <table class="details-table">
                        <tr>
                            <th>Product Name</th>
                            <td>${getFieldValueOrPlaceholder(afc.productName, 'Enter the specific anti-fouling coating product name as per manufacturer specification.')}</td>
                            <th>Manufacturer</th>
                            <td>${getFieldValueOrPlaceholder(afc.manufacturer, 'Specify the manufacturer of the anti-fouling coating system.')}</td>
                        </tr>
                        <tr>
                            <th>Type of AFC</th>
                            <td>${getFieldValueOrPlaceholder(afc.type, 'Indicate coating type (e.g., Self-Polishing Copolymer, Hard Coating, etc.)')}</td>
                            <th>Intended Service Life</th>
                            <td>${getFieldValueOrPlaceholder(afc.serviceLife, 'Specify expected service life in years based on manufacturer recommendations.')} ${afc.serviceLife ? 'years' : ''}</td>
                        </tr>
                        <tr>
                            <th>Locations Applied</th>
                            <td colspan="3">${getFieldValueOrPlaceholder(afc.locations, 'Identify specific areas of the vessel where this coating is applied (hull areas, niche areas, etc.)')}</td>
                        </tr>
                        <tr>
                            <th>Suitable Operating Profiles</th>
                            <td colspan="3">${getFieldValueOrPlaceholder(afc.suitableProfile, 'Document operating conditions for which this coating is suitable (speed, activity/inactivity periods).')}</td>
                        </tr>
                        <tr>
                            <th>Maintenance Regime</th>
                            <td colspan="3">${getFieldValueOrPlaceholder(afc.maintenance, 'Detail the recommended maintenance procedures and schedule for this coating system.')}</td>
                        </tr>
                    </table>
                </div>
            `;
        });
    } else {
        afcHtml = `
            <div class="placeholder-section">
                <p>No anti-fouling coating information has been provided. Anti-fouling coatings are critical for managing biofouling accumulation on the vessel's hull and other wetted surfaces. Please add information about all anti-fouling systems used on the vessel including product names, manufacturers, types, service life, and application areas.</p>
            </div>
        `;
    }

    // Create MGPS section HTML with placeholders
    let mgpsHtml = '';
    if (data.mgps && data.mgps.length > 0) {
        data.mgps.forEach((mgps, index) => {
            mgpsHtml += `
                <div class="mgps-section">
                    <h4>Marine Growth Prevention System ${index + 1}: ${mgps.model || 'Unspecified System'}</h4>
                    <table class="details-table">
                        <tr>
                            <th>Manufacturer</th>
                            <td>${getFieldValueOrPlaceholder(mgps.manufacturer, 'Enter the manufacturer of the MGPS system.')}</td>
                            <th>Model</th>
                            <td>${getFieldValueOrPlaceholder(mgps.model, 'Specify the model name/number of the MGPS.')}</td>
                        </tr>
                        <tr>
                            <th>Type of MGPS</th>
                            <td>${getFieldValueOrPlaceholder(mgps.type, 'Indicate the type of system (Anodic, Impressed Current, Ultrasonic, etc.)')}</td>
                            <th>Service Life</th>
                            <td>${getFieldValueOrPlaceholder(mgps.serviceLife, 'Specify expected service life in years.')} ${mgps.serviceLife ? 'years' : ''}</td>
                        </tr>
                        <tr>
                            <th>Locations Installed</th>
                            <td colspan="3">${getFieldValueOrPlaceholder(mgps.locations, 'Detail where this MGPS is installed on the vessel (sea chests, internal piping, etc.)')}</td>
                        </tr>
                        <tr>
                            <th>Operating Manual Available</th>
                            <td colspan="3">${getFieldValueOrPlaceholder(mgps.manual, 'Indicate if operating manual is available and where it is kept.')}</td>
                        </tr>
                    </table>
                </div>
            `;
        });
    } else {
        mgpsHtml = `
            <div class="placeholder-section">
                <p>No Marine Growth Prevention System (MGPS) information has been provided. MGPS are important for protecting internal seawater systems from biofouling. If your vessel has MGPS installed, please provide details including manufacturer, model, type, and installation locations.</p>
            </div>
        `;
    }

    // Generate diagram images HTML with placeholders
    let diagramsHtml = '';
    if (data.nicheAreas.diagrams && data.nicheAreas.diagrams.length > 0) {
        data.nicheAreas.diagrams.forEach((diagram, index) => {
            diagramsHtml += `
                <div class="diagram-image">
                    <img src="${diagram}" alt="Vessel Diagram ${index + 1}" style="max-width: 100%; margin-bottom: 15px;">
                    <p><strong>Diagram ${index + 1}:</strong> Showing areas where biofouling is likely to accumulate</p>
                </div>
            `;
        });
    } else {
        diagramsHtml = '<p class="placeholder-section">No diagrams provided. Diagrams of the vessel showing hull and niche areas should be inserted here. These diagrams are important for identifying high-risk areas for biofouling accumulation and for planning inspection and cleaning activities.</p>';
    }

    // Create the full BFMP HTML with placeholders for all sections
    return `
        <div class="report-preview">
            <div class="report-header">
                <h1>${data.document.title || 'Biofouling Management Plan'}</h1>
                <p><strong>Document Number:</strong> ${getFieldValueOrPlaceholder(data.document.number, 'Enter a document identifier for reference')} <span class="rev-marker">Rev ${data.document.revision || '0'}</span></p>
                <p><strong>Vessel Name:</strong> ${getFieldValueOrPlaceholder(data.vessel.name, 'Enter vessel name')}</p>
                <p><strong>IMO Number:</strong> ${getFieldValueOrPlaceholder(data.vessel.imo, 'Enter IMO number')}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                ${data.document.companyLogo ? `<img src="${data.document.companyLogo}" alt="Company Logo" style="max-height: 60px; max-width: 200px; margin-top: 10px;">` : ''}
            </div>

            ${tocHtml}

            <h2 id="intro">1. Introduction / Plan Overview</h2>
            <div class="section">
                <p>This Biofouling Management Plan has been developed to comply with the International Maritime Organization's Guidelines for the Control and Management of Ships' Biofouling to Minimise the Transfer of Invasive Aquatic Species (IMO Resolution MEPC.207(62)) and Australian national guidelines based on the Biosecurity Act 2015.</p>
                
                <p>Biofouling is the accumulation of aquatic organisms such as microorganisms, plants, and animals on surfaces and structures immersed in or exposed to the aquatic environment. Biofouling represents a significant pathway for the introduction and spread of invasive aquatic species, which can harm local ecosystems, impact human health, and cause economic damage.</p>
                
                <p>The purpose of this plan is to provide guidance on vessel-specific biofouling management measures to minimise the transfer of invasive aquatic species. This plan details operational practices and measures to be implemented to manage biofouling risks for the vessel.</p>
                
                <h3>1.1 Vessel Applicability</h3>
                <p>This Biofouling Management Plan applies specifically to the vessel ${getFieldValueOrPlaceholder(data.vessel.name, 'Vessel name must be entered in the Vessel Details section')}, IMO ${getFieldValueOrPlaceholder(data.vessel.imo, 'IMO number must be entered in the Vessel Details section')}.</p>
                
                <h3>1.2 Plan Review Schedule</h3>
                <p>This Biofouling Management Plan shall be reviewed and updated at intervals not exceeding five years, following major modifications to underwater surfaces, or when there is a significant change in the vessel's operational profile. The ${getFieldValueOrPlaceholder(data.revision.responsiblePosition, 'responsible person')} is responsible for ensuring reviews are conducted.</p>
            </div>

            <h2 id="vessel">2. Vessel Particulars</h2>
            <div class="section">
                <table class="details-table">
                    <tr>
                        <th>Vessel Name</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.name, 'Enter the full name of the vessel as shown on registration documents.')}</td>
                        <th>IMO Number</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.imo, 'Enter the unique IMO ship identification number.')}</td>
                    </tr>
                    <tr>
                        <th>Date of Construction</th>
                        <td>${formatDate(data.vessel.constructionDate) === 'N/A' ? getFieldValueOrPlaceholder('', 'Enter the date when the vessel was built.') : formatDate(data.vessel.constructionDate)}</td>
                        <th>Vessel Type</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.type, 'Indicate the vessel type (e.g., Cargo Ship, Tanker, etc.)')}</td>
                    </tr>
                    <tr>
                        <th>Gross Tonnage</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.grossTonnage, 'Enter the vessel\'s gross tonnage.')}</td>
                        <th>Beam (m)</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.beam, 'Enter the vessel\'s maximum width in meters.')}</td>
                    </tr>
                    <tr>
                        <th>Length Overall (m)</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.length, 'Enter the vessel\'s total length in meters.')}</td>
                        <th>Flag State</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.flag, 'Enter the country of vessel registration.')}</td>
                    </tr>
                    <tr>
                        <th>Maximum Draft (m)</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.maxDraft, 'Enter the vessel\'s maximum operating draft in meters.')}</td>
                        <th>Minimum Draft (m)</th>
                        <td>${getFieldValueOrPlaceholder(data.vessel.minDraft, 'Enter the vessel\'s minimum operating draft in meters.')}</td>
                    </tr>
                </table>
            </div>

            <h2 id="revision">3. Record of Revision of the BFMP</h2>
            <div class="section">
                <table class="details-table">
                    <tr>
                        <th>Date of Last Dry-docking</th>
                        <td>${formatDate(data.revision.lastDrydock) === 'N/A' ? getFieldValueOrPlaceholder('', 'Enter the date of the vessel\'s most recent dry-dock.') : formatDate(data.revision.lastDrydock)}</td>
                        <th>Date of Next Scheduled Dry-docking</th>
                        <td>${formatDate(data.revision.nextDrydock) === 'N/A' ? getFieldValueOrPlaceholder('', 'Enter the date of the vessel\'s next planned dry-dock.') : formatDate(data.revision.nextDrydock)}</td>
                    </tr>
                    <tr>
                        <th>Revision Number</th>
                        <td>${getFieldValueOrPlaceholder(data.revision.number, 'Enter the BFMP revision identifier (e.g., Rev. 1).')}</td>
                        <th>Revision Date</th>
                        <td>${formatDate(data.revision.date) === 'N/A' ? getFieldValueOrPlaceholder('', 'Enter the date of this BFMP revision.') : formatDate(data.revision.date)}</td>
                    </tr>
                    <tr>
                        <th>Responsible Person</th>
                        <td>${getFieldValueOrPlaceholder(data.revision.responsiblePerson, 'Enter the name of the person responsible for BFMP implementation.')}</td>
                        <th>Position/Role</th>
                        <td>${getFieldValueOrPlaceholder(data.revision.responsiblePosition, 'Enter the role/position of the responsible person (e.g., Chief Officer).')}</td>
                    </tr>
                </table>
            </div>

            <h2 id="operating">4. Operating Profile</h2>
            <div class="section">
                <table class="details-table">
                    <tr>
                        <th>Typical Operating Speed</th>
                        <td>${getFieldValueOrPlaceholder(data.operatingProfile.speed, 'Enter the vessel\'s typical operating speed in knots.')} ${data.operatingProfile.speed ? 'knots' : ''}</td>
                        <th>In-service Period</th>
                        <td>${getFieldValueOrPlaceholder(data.operatingProfile.inServicePeriod, 'Enter the typical duration between dry-dockings in months.')} ${data.operatingProfile.inServicePeriod ? 'months' : ''}</td>
                    </tr>
                    <tr>
                        <th>Primary Operating Area</th>
                        <td>${getFieldValueOrPlaceholder(data.operatingProfile.operatingArea, 'Specify the primary geographical region(s) where the vessel operates.')}</td>
                        <th>AFS Suitable for Operating Profile</th>
                        <td>${getFieldValueOrPlaceholder(data.operatingProfile.afsSuitability, 'Indicate whether the current anti-fouling systems are appropriate for the vessel\'s operating profile.')}</td>
                    </tr>
                </table>
                
                <h3>4.1 Typical Trading Routes</h3>
                <p>${getFieldValueOrPlaceholder(data.operatingProfile.tradingRoutes, 'Detail the vessel\'s regular trading routes, including common ports of call. This information is essential for biofouling risk assessment as different regions present varying levels of biofouling pressure and species profiles.')}</p>
                
                <h3>4.2 Climate Zones</h3>
                <p>${getFieldValueOrPlaceholder(data.operatingProfile.climateZones, 'Specify the climate zones where the vessel operates (e.g., tropical, temperate, polar). Climate zones significantly affect biofouling accumulation rates and must be considered when selecting anti-fouling systems and scheduling inspections.')}</p>
            </div>

            <h2 id="niche">5. Hull and Niche Areas Where Biofouling is Most Likely to Accumulate</h2>
            <div class="section">
                <h3>5.1 Description of Hull and Niche Areas</h3>
                <p>${getFieldValueOrPlaceholder(data.nicheAreas.description, 'Provide a detailed inventory of the vessel\'s hull and niche areas where biofouling can accumulate. Include specific information about sea chests, bow thrusters, propellers, rudders, and other niche areas. This information is critical for inspection and cleaning planning.')}</p>
                
                <h3>5.2 Location of Areas Where Biofouling is Most Likely to Accumulate</h3>
                ${diagramsHtml}
            </div>

            <h2 id="afs">6. Description of the Anti-fouling Systems (AFS)</h2>
            <div class="section">
                <h3>6.1 Anti-fouling Coatings</h3>
                ${afcHtml}
                
                <h3>6.2 IAFS Certificate</h3>
                <p><strong>Certificate Number:</strong> ${getFieldValueOrPlaceholder(data.iafs.number, 'Enter the International Anti-fouling System Certificate number if applicable.')}</p>
                <p><strong>Issue Date:</strong> ${formatDate(data.iafs.issueDate) === 'N/A' ? getFieldValueOrPlaceholder('', 'Enter the IAFS certificate issue date.') : formatDate(data.iafs.issueDate)}</p>
                ${data.iafs.file ? `<p><img src="${data.iafs.file}" alt="IAFS Certificate" style="max-width: 100%;"></p>` : '<p class="placeholder-text">Upload a copy of the IAFS certificate to include here. This document certifies compliance with the AFS Convention prohibiting harmful anti-fouling systems.</p>'}
                
                <h3>6.3 Marine Growth Prevention Systems</h3>
                ${mgpsHtml}
            </div>

            <h2 id="installation">7. Installation of Anti-fouling Systems</h2>
            <div class="section">
                <p>${getFieldValueOrPlaceholder(data.afsInstallation, 'Provide comprehensive details about the installation of all anti-fouling systems on the vessel. Include information about which specific systems are applied to different areas of the vessel, coverage extent, and any areas without anti-fouling protection. This section should document the vessel\'s complete anti-fouling protection scheme.')}</p>
            </div>

            <h2 id="inspection">8. Inspection Schedule</h2>
            <div class="section">
                <p>${getFieldValueOrPlaceholder(data.maintenance.inspectionSchedule, 'Document the vessel\'s planned inspection schedule for monitoring biofouling. Specify areas to be inspected, inspection frequency (based on vessel risk and operational profile), inspection methods, and recordkeeping requirements. Regular inspections are essential for early detection of biofouling issues and for triggering contingency actions when necessary.')}</p>
            </div>

            <h2 id="cleaning">9. Cleaning Schedule</h2>
            <div class="section">
                <p>${getFieldValueOrPlaceholder(data.maintenance.cleaningSchedule, 'Detail the vessel\'s proactive cleaning schedule, including routine cleaning activities and methods used for different vessel areas. Specify which cleaning methods are approved for each area, appropriate timing of cleaning activities, and requirements for waste capture and disposal during cleaning operations.')}</p>
            </div>

            <h2 id="monitoring">10. Monitoring of Biofouling Risk Parameters and Contingency Actions</h2>
            <div class="section">
                <h3>10.1 Biofouling Risk Parameters</h3>
                <p>${getFieldValueOrPlaceholder(data.riskManagement.parameters, 'List the specific parameters that indicate increased biofouling risk (e.g., extended port stays, reduced speed operations, warm waters, freshwater exposure). These parameters should be monitored during vessel operations to identify when increased biofouling risk might occur.')}</p>
                
                <h3>10.2 Evaluation Deviations and Deviation Limits</h3>
                <p>${getFieldValueOrPlaceholder(data.riskManagement.deviationLimits, 'Define the specific limits for each risk parameter that would trigger contingency actions (e.g., stays > 14 days in a single port, speed < 6 knots for > 7 consecutive days). Setting clear thresholds ensures consistent application of the biofouling management plan.')}</p>
                
                <h3>10.3 Contingency Actions</h3>
                <p>${getFieldValueOrPlaceholder(data.riskManagement.contingencyActions, 'Specify actions to be taken when parameters exceed defined limits (e.g., inspection at next port of call, in-water cleaning if appropriate). Include decision criteria, responsible parties, and action timelines.')}</p>
                
                <h3>10.4 Long-term Actions</h3>
                <p>${getFieldValueOrPlaceholder(data.riskManagement.longTermActions, 'Detail longer-term management responses following repeated or significant deviations (e.g., increase inspection frequency, update anti-fouling systems at next dry-dock, revise the BFMP). This section addresses systemic biofouling risk factors.')}</p>
            </div>

            <h2 id="waste">11. Capture and Disposal of Waste</h2>
            <div class="section">
                <p>${getFieldValueOrPlaceholder(data.procedures.wasteManagement, 'Document procedures for the capture, treatment, and disposal of biofouling waste in accordance with local and international regulations. Include methods for handling waste from in-water cleaning operations, requirements for waste filtration, and containment measures to prevent environmental contamination.')}</p>
            </div>

            <h2 id="safety">12. Safety Procedures for the Vessel and Crew</h2>
            <div class="section">
                <p>${getFieldValueOrPlaceholder(data.procedures.safetyProcedures, 'Detail safety procedures related to the operation and maintenance of anti-fouling systems and cleaning equipment. Include information on personal protective equipment requirements, operational safety restrictions, hazard identification, and emergency procedures for anti-fouling system accidents or failures.')}</p>
            </div>

            <h2 id="training">13. Crew Training and Familiarisation</h2>
            <div class="section">
                <p>${getFieldValueOrPlaceholder(data.crewTraining, 'Outline the training program for crew members involved in biofouling management activities. Specify training content, frequency, who delivers the training, and which crew members require training. Include information about recordkeeping for training completion and how new crew members are introduced to vessel-specific procedures.')}</p>
                
                <h3>13.1 Training Register</h3>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>Crew Member Name</th>
                            <th>Position</th>
                            <th>Training Date</th>
                            <th>Trainer</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="4">Training register to be maintained by vessel's management</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 id="recordbook">14. Biofouling Record Book</h2>
            <div class="section">
                <p>The Biofouling Record Book (BFRB) must be used in conjunction with this Biofouling Management Plan. The BFRB demonstrates that the BFMP has been implemented through records of relevant biofouling activities.</p>
                
                <p>The BFRB must be maintained from the date of BFMP implementation and retained for the entire service life of the vessel. Entries in the BFRB must be signed and dated by the officer or officers in charge.</p>
                
                <h3>Record Book Template</h3>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Activity Type</th>
                            <th>Location</th>
                            <th>Details</th>
                            <th>Person in Charge</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="5">Record of activities to be maintained here</td>
                        </tr>
                    </tbody>
                </table>
                
                <p><strong>Activities to be recorded include:</strong></p>
                <ul>
                    <li>Cleaning activities</li>
                    <li>Inspections</li>
                    <li>Operation outside expected profile</li>
                    <li>AFC maintenance/service/damage</li>
                    <li>MGPS maintenance/service/downtime</li>
                </ul>
            </div>

            <div class="footer">
                <p>This Biofouling Management Plan was generated using the MarineStream BFMP Generator</p>
                <p>&copy; ${new Date().getFullYear()} MarineStream - All Rights Reserved</p>
            </div>
        </div>
    `;
}