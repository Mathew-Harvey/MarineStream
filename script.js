// MarineStream Main JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Initialize core website functionality
    initWebsiteFunctions(); // Includes theme toggles, nav, etc.

    // Set up Cost Calculator Modal
    const openCostCalculatorBtn = document.getElementById('open-cost-calculator');
    if (openCostCalculatorBtn && !openCostCalculatorBtn._eventHandlerAttached) {
        openCostCalculatorBtn.addEventListener('click', function() {
            const costCalculatorModal = document.getElementById('cost-calculator-modal');
            if (costCalculatorModal) {
                costCalculatorModal.style.display = 'flex';
                document.body.classList.add('modal-open');

                // Initialize calculator if not already done
                if (!window.calculatorInitialized && typeof initHullFoulingCalculator === 'function') {
        initHullFoulingCalculator();
                }
            }
        });
        openCostCalculatorBtn._eventHandlerAttached = true;
    }
    
    // Close Cost Calculator Modal
    const costCalculatorModal = document.getElementById('cost-calculator-modal');
    if (costCalculatorModal && !costCalculatorModal._eventHandlerAttached) {
        // Close when clicking outside modal content
        costCalculatorModal.addEventListener('click', function(event) {
            if (event.target === costCalculatorModal) {
                costCalculatorModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
        
        // Close button
        const closeBtn = costCalculatorModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                costCalculatorModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
        
        costCalculatorModal._eventHandlerAttached = true;
    }
    
    // Initialize the Plan Generator button to load bfmpGen.html
    const openPlanGeneratorBtn = document.getElementById('open-plan-generator');
    if (openPlanGeneratorBtn) {
        openPlanGeneratorBtn.addEventListener('click', function() {
            // Show BFMP info modal first
            const bfmpInfoModal = document.getElementById('bfmp-info-modal');
            if (bfmpInfoModal) {
                bfmpInfoModal.style.display = 'flex';
                document.body.classList.add('modal-open');
            } else {
                // If modal doesn't exist, redirect directly
            window.location.href = 'bfmpGen.html';
            }
        });
    }

    // Initialize BFMP Generator Button
    const openBfmpBtn = document.getElementById('open-bfmp-generator');
    if (openBfmpBtn && !openBfmpBtn._eventHandlerAttached) {
        openBfmpBtn.addEventListener('click', function() {
            const bfmpModal = document.getElementById('bfmp-info-modal');
            if (bfmpModal) {
                bfmpModal.style.display = 'flex';
                document.body.classList.add('modal-open');
            }
        });
        openBfmpBtn._eventHandlerAttached = true;
    }
    
    // Close BFMP modal if clicked outside
    const bfmpModal = document.getElementById('bfmp-info-modal');
    if (bfmpModal && !bfmpModal._eventHandlerAttached) {
        bfmpModal.addEventListener('click', function(event) {
            if (event.target === bfmpModal) {
                bfmpModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
        
        // Set up close button handler for the BFMP modal
        const closeBtn = bfmpModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                bfmpModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
        
        bfmpModal._eventHandlerAttached = true;
    }
    
    // Handle the "Start Creating Your BFMP" button
    const bfmpStartBtn = document.getElementById('bfmp-start-btn');
    if (bfmpStartBtn && !bfmpStartBtn._eventHandlerAttached) {
        bfmpStartBtn.addEventListener('click', function() {
            // Close the info modal first
            const bfmpModal = document.getElementById('bfmp-info-modal');
            if (bfmpModal) {
                bfmpModal.style.display = 'none';
            }
            
            // Open the BFMP generator modal instead of redirecting
            const bfmpGeneratorModal = document.getElementById('bfmp-generator-modal');
            if (bfmpGeneratorModal) {
                bfmpGeneratorModal.style.display = 'flex';
                document.body.classList.add('modal-open');
            } else {
                console.error('BFMP Generator modal not found in the document.');
            }
        });
        bfmpStartBtn._eventHandlerAttached = true;
    }

    // Initialize videos with autoplay
    if (document.getElementById('rov-video') || document.getElementById('crawler-video')) {
        initVideos();
    }

    // Initialize hero carousel
    initHeroCarousel();
    
    // Initialize custom buttons
    initCustomButtons();
});

// === Core Website Functionality ===
function initWebsiteFunctions() {
    // Mobile nav toggle
    const navToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70, // Offset for fixed header
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (navToggle) navToggle.classList.remove('active');
                }
            }
        });
    });
    
    // Initialize modals
    initModals();
    
    // Theme switcher
    const themeSwitcher = document.querySelector('.theme-switcher');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    if (themeSwitcher && themeOptions.length) {
        // Check for saved theme in localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeOptions.forEach(option => {
                if (option.getAttribute('data-theme') === savedTheme) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
        
        themeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                
                themeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

// Initialize modals
function initModals() {
    const modalButtons = document.querySelectorAll('[data-modal]');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    modalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                document.body.classList.add('modal-open');
            }
        });
    });
    
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = modalId ? document.getElementById(modalId) : this.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            event.target.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
}

// === Video Initialization (with Autoplay) ===
function initVideos() {
    function setupVideo(videoId, buttonId) {
        const video = document.getElementById(videoId);
        const playBtn = document.getElementById(buttonId);
        const videoContainer = video ? video.closest('.video-container') : null; // Get container

        if (!video || !playBtn || !videoContainer) {
            return;
        }

        // Set up play button
        playBtn.addEventListener('click', function () {
            if (video.paused) {
                video.play();
                this.classList.add('playing');
                this.innerHTML = '<i class="fas fa-pause"></i>'; // Switch to pause icon
                videoContainer.classList.add('video-playing');
            } else {
                video.pause();
                this.classList.remove('playing');
                this.innerHTML = '<i class="fas fa-play"></i>'; // Switch to play icon
                videoContainer.classList.remove('video-playing');
            }
        });

        // Video ended event
        video.addEventListener('ended', function () {
            playBtn.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i>'; // Switch back to play icon
            videoContainer.classList.remove('video-playing');
            video.currentTime = 0; // Reset video
        });

        // Initialize autoplay if data attribute is set
        if (video.dataset.autoplay === 'true') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.play();
                        playBtn.classList.add('playing');
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        videoContainer.classList.add('video-playing');
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(videoContainer);
        }
    }

    // Set up the two main videos
    setupVideo('rov-video', 'rov-play-btn');
    setupVideo('crawler-video', 'crawler-play-btn');
}

// Initialize hero carousel
function initHeroCarousel() {
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;
    
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicators = carousel.querySelectorAll('.indicator');
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');
    
    if (!track || slides.length === 0) return;
    
    let currentSlide = 0;
    let autoplayInterval;
    
    // Set initial slide
    setActiveSlide(0);
    
    // Set up indicators if they exist
    if (indicators.length > 0) {
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                setActiveSlide(index);
                resetAutoplay();
            });
        });
    }
    
    // Set up prev/next buttons if they exist
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            const newIndex = (currentSlide - 1 + slides.length) % slides.length;
            setActiveSlide(newIndex);
            resetAutoplay();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const newIndex = (currentSlide + 1) % slides.length;
            setActiveSlide(newIndex);
            resetAutoplay();
        });
    }
    
    // Function to set active slide
    function setActiveSlide(index) {
        // Update currentSlide index
            currentSlide = index;
        
        // Update slide position
        track.style.transform = `translateX(-${index * 100}%)`;
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            
            // Optional: handle aria-attributes for accessibility
            slide.setAttribute('aria-hidden', i !== index);
        });
    }
    
    // Function to reset autoplay
    function resetAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
        
        autoplayInterval = setInterval(() => {
            const newIndex = (currentSlide + 1) % slides.length;
            setActiveSlide(newIndex);
        }, 5000); // 5 second interval
    }
    
    // Start autoplay
    resetAutoplay();
    
    // Pause autoplay when the user hovers over the carousel
    carousel.addEventListener('mouseenter', () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    });
    
    // Resume autoplay when the user stops hovering
    carousel.addEventListener('mouseleave', resetAutoplay);
}

// === Custom button functionality ===
function initCustomButtons() {
    // Get all the buttons
    const rovInspectionBtn = document.getElementById('rov-inspection-btn');
    const cleaningDemoBtn = document.getElementById('cleaning-demo-btn');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    
    // ROV Inspection Button
    if (rovInspectionBtn) {
        rovInspectionBtn.addEventListener('click', function() {
            const emailSubject = encodeURIComponent("ROV Inspection Services Inquiry");
            const emailBody = encodeURIComponent("I'd like to learn more about your ROV inspection services.");
            const mailtoLink = `mailto:info@marinetream.com.au?subject=${emailSubject}&body=${emailBody}`;
            
            // Try to open email client
            const mailtoAttempt = window.open(mailtoLink, '_self');
            
            // If couldn't open email client, show fallback
            setTimeout(function() {
                if (!mailtoAttempt || mailtoAttempt.closed || typeof mailtoAttempt.closed === 'undefined') {
                    showEmailFallback("I'd like to learn more about your ROV inspection services.");
                }
            }, 500);
        });
    }
    
    // Cleaning Demo Button
    if (cleaningDemoBtn) {
        cleaningDemoBtn.addEventListener('click', function() {
            const emailSubject = encodeURIComponent("Cleaning Demonstration Request");
            const emailBody = encodeURIComponent("I'd like to request a cleaning demonstration.");
            const mailtoLink = `mailto:info@marinetream.com.au?subject=${emailSubject}&body=${emailBody}`;
            
            // Try to open email client
            const mailtoAttempt = window.open(mailtoLink, '_self');
            
            // If couldn't open email client, show fallback
            setTimeout(function() {
                if (!mailtoAttempt || mailtoAttempt.closed || typeof mailtoAttempt.closed === 'undefined') {
                    showEmailFallback("I'd like to request a cleaning demonstration.");
                }
            }, 500);
        });
    }
    
    // Learn More Button
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            if (typeof showCapabilityStatement === 'function') {
                showCapabilityStatement();
            }
        });
    }
    
    // Initialize social media links
    initSocialMediaLinks();
}

// Social media links
function initSocialMediaLinks() {
    // Get all social media link containers
    const socialContainers = document.querySelectorAll('.social-links');
    
    socialContainers.forEach(container => {
        // LinkedIn Link
        const linkedInLink = container.querySelector('a[data-platform="linkedin"]');
        if (linkedInLink) {
            linkedInLink.href = "https://www.linkedin.com/company/marinetream/posts/?feedView=all";
            linkedInLink.target = "_blank";
            linkedInLink.rel = "noopener noreferrer";
        }
        
        // Facebook Link
        const facebookLink = container.querySelector('a[data-platform="facebook"]');
        if (facebookLink) {
            facebookLink.href = "https://www.facebook.com/profile.php?id=100029694686734";
            facebookLink.target = "_blank";
            facebookLink.rel = "noopener noreferrer";
        }
        
        // YouTube Link
        const youtubeLink = container.querySelector('a[data-platform="youtube"]');
        if (youtubeLink) {
            youtubeLink.href = "https://www.youtube.com/@franmarine5117";
            youtubeLink.target = "_blank";
            youtubeLink.rel = "noopener noreferrer";
        }
    });
}

// Email fallback functionality
function showEmailFallback(messageBody) {
    const fallbackModal = document.getElementById('emailFallback');
    const emailContentDiv = document.getElementById('emailContent');
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    
    if (fallbackModal && emailContentDiv) {
        emailContentDiv.textContent = messageBody;
        fallbackModal.style.display = 'flex';
        
        if (copyEmailBtn) {
            copyEmailBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(messageBody).then(() => {
                    alert('Email content copied to clipboard!');
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            });
        }
    }
}

// Helper function to format dates
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (error) {
        return dateString;
    }
}

// Handle BFMP form submission
document.addEventListener('DOMContentLoaded', function() {
    const bfmpForm = document.getElementById('bfmp-form');
    const bfmpResetBtn = document.getElementById('bfmp-reset-btn');
    
    // Reset form handler
    if (bfmpResetBtn) {
        bfmpResetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
                bfmpForm.reset();
            }
        });
    }
    
    // Handle vessel image upload and preview
    const vesselImageUpload = document.getElementById('vesselImageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const vesselImagePreview = document.getElementById('vesselImagePreview');
    
    if (vesselImageUpload) {
        vesselImageUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file && file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    vesselImagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
                vesselImagePreview.src = '';
            }
        });
    }
    
    // Form submission handler
    if (bfmpForm) {
        bfmpForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Validate form
            const requiredFields = bfmpForm.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Collect form data
            const formData = new FormData(bfmpForm);
            const bfmpData = {};
            
            // Handle regular form fields
            formData.forEach((value, key) => {
                // Handle multiple checkbox values (like nicheAreas)
                if (bfmpData[key] && Array.isArray(bfmpData[key])) {
                    bfmpData[key].push(value);
                } else if (bfmpData[key]) {
                    bfmpData[key] = [bfmpData[key], value];
                } else {
                    bfmpData[key] = value;
                }
            });
            
            // Handle the vessel image if provided
            const vesselImageInput = document.getElementById('vesselImageUpload');
            if (vesselImageInput && vesselImageInput.files && vesselImageInput.files[0]) {
                // Use the preview image's data URL
                bfmpData.vesselImage = vesselImagePreview.src;
            }
            
            // Generate BFMP document
            generateBFMP(bfmpData);
        });
    }
});

// Function to generate BFMP document
function generateBFMP(data) {
    try {
        // Create a new window for the generated BFMP
        const bfmpWindow = window.open('', '_blank');
        
        // Make sure the window was created successfully
        if (!bfmpWindow) {
            alert('Pop-up blocked! Please allow pop-ups for this site to generate the BFMP.');
            return;
        }
        
        // Write the HTML content to the new window
        bfmpWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Biofouling Management Plan - ${data.vesselName}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                    }
                    .bfmp-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #ff6600;
                    }
                    h1 {
                        color: #ff6600;
                        margin-bottom: 5px;
                    }
                    .section {
                        margin-bottom: 30px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #eee;
                    }
                    h2 {
                        color: #ff6600;
                        margin-bottom: 15px;
                    }
                    h3 {
                        color: #333;
                        margin-bottom: 10px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th, td {
                        padding: 10px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 0.9em;
                        color: #777;
                    }
                    .print-btn {
                        display: block;
                        margin: 30px auto;
                        padding: 10px 20px;
                        background-color: #ff6600;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                    }
                    .logo {
                        max-width: 200px;
                        margin-bottom: 20px;
                    }
                    .vessel-image {
                        max-width: 100%;
                        height: auto;
                        margin: 15px 0;
                        border: 1px solid #ddd;
                    }
                    @media print {
                        .print-btn {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="bfmp-header">
                    <img src="./assets/logo.png" alt="MarineStream Logo" class="logo">
                    <h1>Biofouling Management Plan</h1>
                    <p><strong>${data.vesselName}</strong> - ${data.vesselType}</p>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                    ${data.vesselImage ? `<img src="${data.vesselImage}" alt="${data.vesselName}" class="vessel-image">` : ''}
                </div>
                
                <div class="section">
                    <h2>1. Vessel Information</h2>
                    <table>
                        <tr>
                            <th>Vessel Name</th>
                            <td>${data.vesselName}</td>
                        </tr>
                        <tr>
                            <th>IMO Number</th>
                            <td>${data.imoNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Flag State</th>
                            <td>${data.flagState}</td>
                        </tr>
                        <tr>
                            <th>Vessel Type</th>
                            <td>${data.vesselType}</td>
                        </tr>
                        <tr>
                            <th>Length Overall</th>
                            <td>${data.vesselLength} meters</td>
                        </tr>
                        <tr>
                            <th>Gross Tonnage</th>
                            <td>${data.grossTonnage || 'N/A'}</td>
                        </tr>
                        ${data.yearBuilt ? `
                        <tr>
                            <th>Year Built</th>
                            <td>${data.yearBuilt}</td>
                        </tr>` : ''}
                        ${data.callSign ? `
                        <tr>
                            <th>Call Sign</th>
                            <td>${data.callSign}</td>
                        </tr>` : ''}
                        ${data.homePort ? `
                        <tr>
                            <th>Home Port</th>
                            <td>${data.homePort}</td>
                        </tr>` : ''}
                        ${data.owner ? `
                        <tr>
                            <th>Owner/Operator</th>
                            <td>${data.owner}</td>
                        </tr>` : ''}
                    </table>
                </div>
                
                <div class="section">
                    <h2>2. Antifouling System</h2>
                    <table>
                        <tr>
                            <th>System Type</th>
                            <td>${data.afSystem}</td>
                        </tr>
                        <tr>
                            <th>Application Date</th>
                            <td>${data.afApplication || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Valid Until</th>
                            <td>${data.afValidity || 'N/A'}</td>
                        </tr>
                        ${data.afManufacturer ? `
                        <tr>
                            <th>Manufacturer</th>
                            <td>${data.afManufacturer}</td>
                        </tr>` : ''}
                        ${data.afProduct ? `
                        <tr>
                            <th>Product Name</th>
                            <td>${data.afProduct}</td>
                        </tr>` : ''}
                        ${data.afColor ? `
                        <tr>
                            <th>Color</th>
                            <td>${data.afColor}</td>
                        </tr>` : ''}
                    </table>
                    
                    <h3>System Details</h3>
                    <p>${data.afDetails || 'No additional details provided.'}</p>
                    
                    <h3>Antifouling System Maintenance Strategy</h3>
                    <p>Regular inspection and maintenance of the antifouling system is essential to minimize biofouling accumulation. The vessel will follow the maintenance schedule detailed in this plan.</p>
                </div>
                
                <div class="section">
                    <h2>3. Inspection and Maintenance Procedures</h2>
                    <h3>Inspection Schedule</h3>
                    <p>Regular inspections will be conducted ${data.inspectionFrequency.toLowerCase()} to detect and assess biofouling on the vessel hull and niche areas.</p>
                    
                    <h3>Cleaning Method</h3>
                    <p>Primary cleaning method: ${data.cleaningMethod}</p>
                    
                    <h3>Maintenance Strategy</h3>
                    <p>${data.maintenanceDetails || 'Standard maintenance procedures will be followed according to industry best practices and manufacturer recommendations.'}</p>
                    
                    <h3>Niche Areas Management</h3>
                    <p>Special attention will be given to the following niche areas:</p>
                    <ul>
                        ${data.nicheAreas ? data.nicheAreas.map(area => `<li>${area}</li>`).join('') : `
                        <li>Sea chests and internal seawater cooling systems</li>
                        <li>Rudder hinges and stabilizer fins</li>
                        <li>Propellers, shafts, and associated components</li>
                        <li>Bow/stern thrusters and thruster tunnels</li>
                        <li>Gratings, chain lockers, and anchor chains</li>`}
                    </ul>
                </div>
                
                <div class="section">
                    <h2>4. Operational Profile</h2>
                    <p><strong>Primary Operating Regions:</strong> ${Array.isArray(data.operatingRegions) ? data.operatingRegions.join(', ') : data.operatingRegions}</p>
                    <p><strong>Average Annual Port Calls:</strong> ${data.portCalls}</p>
                    <p><strong>Typical Layup Periods:</strong> ${data.layupPeriods || 'None specified'}</p>
                    ${data.tradingPattern ? `<p><strong>Trading Pattern:</strong> ${data.tradingPattern}</p>` : ''}
                    ${data.avgSpeed ? `<p><strong>Average Operating Speed:</strong> ${data.avgSpeed} knots</p>` : ''}
                    
                    <h3>Voyage Planning Considerations</h3>
                    <p>When planning voyages, the following biofouling risk factors will be considered:</p>
                    <ul>
                        <li>Duration of stay in ports</li>
                        <li>Sailing speeds and patterns</li>
                        <li>Water temperature and salinity changes</li>
                        <li>Regulatory requirements of destination ports</li>
                    </ul>
                </div>
                
                <div class="section">
                    <h2>5. Biofouling Management Procedures</h2>
                    <h3>Contingency Measures</h3>
                    <p>If significant biofouling is detected during inspections, the following actions will be taken:</p>
                    <ol>
                        <li>Assess the extent and type of biofouling</li>
                        <li>Determine if immediate cleaning is required</li>
                        <li>Select appropriate cleaning method based on location, regulations, and fouling severity</li>
                        <li>Document all actions in the Biofouling Record Book</li>
                    </ol>
                    
                    <h3>Emergency Response</h3>
                    <p>In case of emergency situations affecting biofouling management (e.g., equipment failure, unexpected hull damage):</p>
                    <ol>
                        <li>Notify the vessel's management company</li>
                        <li>Assess the potential impact on planned voyages</li>
                        <li>Develop and implement appropriate action plan</li>
                        <li>Document all actions and decisions</li>
                    </ol>
                </div>
                
                <div class="section">
                    <h2>6. Recordkeeping</h2>
                    <p>All biofouling management activities will be recorded in the vessel's Biofouling Record Book, including:</p>
                    <ul>
                        <li>Inspection dates and results</li>
                        <li>Cleaning activities and methods used</li>
                        <li>Maintenance of the antifouling system</li>
                        <li>Any contingency measures implemented</li>
                    </ul>
                    <p>Records will be maintained for a minimum of three years and will be available for inspection by relevant authorities.</p>
                </div>
                
                <div class="section">
                    <h2>7. Staff Training and Familiarization</h2>
                    <p>Relevant crew members will receive training on:</p>
                    <ul>
                        <li>Understanding biofouling and its impacts</li>
                        <li>Implementation of this Biofouling Management Plan</li>
                        <li>Inspection procedures and documentation requirements</li>
                        <li>Emergency and contingency procedures</li>
                        ${data.trainingDetails ? `<li>${data.trainingDetails}</li>` : ''}
                    </ul>
                </div>
                
                <div class="section">
                    <h2>8. Plan Review and Update Procedures</h2>
                    <p>This Biofouling Management Plan will be reviewed and updated:</p>
                    <ul>
                        <li>At least annually</li>
                        <li>Following any significant changes to the vessel's operating profile</li>
                        <li>After major hull maintenance or antifouling system renewal</li>
                        <li>When new regulations affecting biofouling management come into effect</li>
                    </ul>
                    <p><strong>Plan Approval:</strong> ${data.approvalAuthority || 'Ship Management'}</p>
                </div>
                
                <div class="footer">
                    <p>This Biofouling Management Plan was generated by MarineStream™</p>
                    <p>For assistance with implementation, please contact: info@marinestream.com.au</p>
                </div>
                
                <button class="print-btn" onclick="window.print()">Print BFMP</button>
                
                <script>
                    // Add any necessary JavaScript here
                    document.querySelector('.print-btn').addEventListener('click', function() {
                        window.print();
                    });
                </script>
            </body>
            </html>
        `);
        bfmpWindow.document.close();
        
        // Close the generator modal
        const bfmpGeneratorModal = document.getElementById('bfmp-generator-modal');
        if (bfmpGeneratorModal) {
            bfmpGeneratorModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    } catch (error) {
        console.error('Error generating BFMP:', error);
        alert('An error occurred while generating the BFMP. Please try again.');
    }
}