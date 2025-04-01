// MarineStream Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize core website functionality
    initWebsiteFunctions(); // This now includes theme toggle

    // Initialize tools if elements exist
    if (document.getElementById('cost-calculator-modal')) {
        initHullFoulingCalculator();
    }
    if (document.getElementById('plan-generator-modal')) {
        initBiofoulingPlanGenerator();
    }

    // Initialize videos if elements exist
    if (document.getElementById('rov-video') || document.getElementById('crawler-video')) {
        initVideos();
    }

    // Initialize PDF Generator if button exists
    if (document.getElementById('generate-pdf')) {
        initPDFGenerator();
    }
});

// === Core Website Functions ===
function initWebsiteFunctions() {
    // Theme Toggling (Consolidated)
    initThemeToggle();

    // Mobile Navigation
    initMobileNavigation();

    // Animations (Check if GSAP is loaded)
    if (typeof gsap !== 'undefined') {
        initAnimations();
    } else {
        console.warn("GSAP not loaded, animations disabled.");
    }

    // Smooth Scrolling for Anchor Links
    initSmoothScroll();

    // Theme Switcher Color Picker
    initThemeSwitcher(); // Handles the color theme options

    // Initialize Tool Modal Buttons
    const costCalcButton = document.getElementById('open-cost-calculator');
    const planGenButton = document.getElementById('open-plan-generator');
    const costCalcModal = document.getElementById('cost-calculator-modal');
    const planGenModal = document.getElementById('plan-generator-modal');

    if (costCalcButton && costCalcModal) {
        costCalcButton.addEventListener('click', function() {
            costCalcModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        });
    }

    if (planGenButton && planGenModal) {
        planGenButton.addEventListener('click', function() {
            planGenModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        });
    }

    // Close modals functionality
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = document.getElementById(this.dataset.modal);
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = ''; // Restore scroll
            }
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            // Close only if clicking the overlay itself, not the content
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = ''; // Restore scroll
            }
        });
    });

     // Close modal with Escape key
     document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                    document.body.style.overflow = ''; // Restore scroll
                }
            });
        }
    });
}

// Consolidated Theme Toggle Functionality (Dark/Light Mode)
function initThemeToggle() {
    const darkModeToggleBtn = document.getElementById('dark-mode-toggle'); // In switcher
    const headerThemeToggleBtn = document.getElementById('header-theme-toggle'); // In header
    const htmlElement = document.documentElement;

    // Function to update button icons based on mode
    function updateIcons(isDarkMode) {
        const iconClass = isDarkMode ? 'fa-sun' : 'fa-moon';
        if (darkModeToggleBtn) darkModeToggleBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;
        if (headerThemeToggleBtn) headerThemeToggleBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;
    }

    // Check for saved theme mode preference or system preference
    const savedThemeMode = localStorage.getItem('themeMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentMode = savedThemeMode || (prefersDark ? 'dark' : 'light');

    // Apply initial theme mode
    if (currentMode === 'dark') {
        htmlElement.setAttribute('data-theme-mode', 'dark');
    } else {
        htmlElement.removeAttribute('data-theme-mode'); // Default is light
    }
    updateIcons(currentMode === 'dark');

    // Combined toggle logic
    function toggleDarkMode() {
        const isCurrentlyDark = htmlElement.hasAttribute('data-theme-mode');
        if (isCurrentlyDark) {
            htmlElement.removeAttribute('data-theme-mode');
            localStorage.setItem('themeMode', 'light');
            updateIcons(false);
        } else {
            htmlElement.setAttribute('data-theme-mode', 'dark');
            localStorage.setItem('themeMode', 'dark');
            updateIcons(true);
        }
    }

    // Add click event listeners
    if (darkModeToggleBtn) {
        darkModeToggleBtn.addEventListener('click', toggleDarkMode);
    }
    if (headerThemeToggleBtn) {
        headerThemeToggleBtn.addEventListener('click', toggleDarkMode);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // Only change if no explicit preference is saved
        if (!localStorage.getItem('themeMode')) {
            currentMode = event.matches ? 'dark' : 'light';
            if (currentMode === 'dark') {
                htmlElement.setAttribute('data-theme-mode', 'dark');
            } else {
                htmlElement.removeAttribute('data-theme-mode');
            }
            updateIcons(currentMode === 'dark');
        }
    });
}


// Mobile Navigation
function initMobileNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links-container');
    const navLinks = document.querySelectorAll('.nav-link'); // Include all links inside

    if (!mobileMenuToggle || !navLinksContainer) return; // Exit if elements don't exist

    mobileMenuToggle.addEventListener('click', () => {
        const isActive = navLinksContainer.classList.toggle('active');
        mobileMenuToggle.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        mobileMenuToggle.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : ''; // Prevent/restore scrolling
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    });

    // Close mobile menu when clicking outside (optional but good UX)
    document.addEventListener('click', (e) => {
        if (navLinksContainer.classList.contains('active') &&
            !navLinksContainer.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)) {
            navLinksContainer.classList.remove('active');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

// GSAP Animations
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero section animations
    gsap.from(".hero-title", { y: 50, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2 });
    gsap.from(".hero-subtitle", { y: 30, opacity: 0, duration: 1, delay: 0.5, ease: "power3.out" });
    gsap.from(".hero-cta", { y: 30, opacity: 0, duration: 1, delay: 0.8, ease: "power3.out" });
    gsap.from(".floating-image", { y: 100, opacity: 0, duration: 1.2, delay: 0.6, ease: "power3.out" });

    // Section heading animations
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: { trigger: title, start: "top 85%", toggleActions: "play none none none" },
            y: 30, opacity: 0, duration: 0.8, ease: "power2.out"
        });
    });
     // Section description animations
     gsap.utils.toArray('.section-description').forEach(desc => {
        gsap.from(desc, {
            scrollTrigger: { trigger: desc, start: "top 85%", toggleActions: "play none none none" },
            y: 20, opacity: 0, duration: 0.8, delay: 0.1, ease: "power2.out"
        });
    });


    // Feature card animations with stagger
    const featureCards = gsap.utils.toArray('.feature-card');
    if (featureCards.length) {
        gsap.from(featureCards, {
            scrollTrigger: { trigger: '.feature-grid', start: "top 80%" },
            y: 50, opacity: 0, duration: 0.6, stagger: 0.15, ease: "power2.out"
        });
    }

     // Staggered animation for list items (e.g., tech features, dashboard features)
     gsap.utils.toArray('.tech-features li, .dashboard-feature, .feature-list li').forEach(item => {
        gsap.from(item, {
            scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none none" },
            x: -30, opacity: 0, duration: 0.5, ease: "power1.out"
        });
    });

    // Tech Showcase Content/Image
    gsap.from(".tech-content", { scrollTrigger: ".tech-content", x: -50, opacity: 0, duration: 1, ease: "power3.out"});
    gsap.from(".tech-image-container", { scrollTrigger: ".tech-image-container", x: 50, opacity: 0, duration: 1, ease: "power3.out"});

    // Video Showcase Sections
    gsap.utils.toArray('.video-showcase').forEach(vid => {
        gsap.from(vid, { scrollTrigger: { trigger: vid, start: "top 80%" }, scale: 0.9, opacity: 0, duration: 0.8, ease: "power2.out"});
    });
     gsap.utils.toArray('.monitoring-content').forEach(cont => {
        gsap.from(cont, { scrollTrigger: { trigger: cont, start: "top 80%" }, y: 30, opacity: 0, duration: 0.8, ease: "power2.out"});
    });
}


// Theme Switcher (Color Options)
function initThemeSwitcher() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const htmlElement = document.documentElement;

    // Check for saved theme color preference
    const savedTheme = localStorage.getItem('themeColor') || 'green'; // Default to green

    // Apply initial theme color
    htmlElement.setAttribute('data-theme', savedTheme);

    // Set active class on current theme option
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === savedTheme);
    });

    // Add click event to theme options
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;

            // Update active class
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Update theme attribute and save preference
            htmlElement.setAttribute('data-theme', theme);
            localStorage.setItem('themeColor', theme);
        });
    });
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.startsWith('#!') ) return; // Ignore empty or special hashes

            try {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 80; // Height of the fixed header
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                     // Optional: Update active nav link based on scroll
                     // (More complex, involves tracking scroll position)
                }
            } catch (error) {
                console.warn(`Smooth scroll target not found or invalid selector: ${href}`, error);
            }
        });
    });
}


// PDF Generator
function initPDFGenerator() {
    const generatePDFBtn = document.getElementById('generate-pdf');
    const templateSource = document.getElementById('capability-statement-template');

    // Check if all necessary libraries and elements are present
    if (!generatePDFBtn || !templateSource || typeof Handlebars === 'undefined' || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
         if(generatePDFBtn) generatePDFBtn.disabled = true; // Disable button if dependencies missing
         console.warn("PDF Generator dependencies missing (Handlebars, html2canvas, jsPDF) or template not found.");
        return;
    }

    generatePDFBtn.addEventListener('click', function() {
        this.disabled = true; // Prevent double clicks
        this.textContent = "Generating...";

        try {
            // Compile the template
            const template = Handlebars.compile(templateSource.innerHTML);

            // Data for the template (Consider fetching dynamic data if needed)
             const data = {
                about: "MarineStream is dedicated to solving biofouling challenges through innovative hardware and blockchain technology, built on Rise-X's robust SaaS platform. We are the only organisation in Australia delivering a complete marine biosecurity compliance and biofouling management service.",
                capabilities: [
                    "Fleet wide marine biosecurity compliance and biofouling management solutions",
                    "In-water hull cleaning, niche area cleaning and invasive marine species treatments",
                    "Corrosion management, material preservation, underwater blast and surface treatments",
                    "Marine infrastructure remediation, structural upgrades, and new construction support",
                    "Mooring design, installation, inspection and maintenance",
                    "Class approved ROV survey and inspection",
                    "Marine and logistical vessel support"
                ],
                technology: "The MarineStream™ In-water Cleaning System is the only in-water cleaning system compliant with the Australian In-Water Cleaning Standards, designed to enhance the hydrodynamic and acoustic performance of naval platforms.",
                techFeatures: [
                    "A single 20\" container with 10μ filtration and water processing unit with UV treatment capability",
                    "Designed for rapid deployment from wharf side or suitable support vessel",
                    "A multifaceted system with tailored compatible tooling capable of complete clean to biosecurity specification",
                    "The MarineStream™ Biofouling and Underwater Asset Management Platform holds the asset for instant operational readiness"
                ],
                certifications: [
                    "ISO 9001:2015 - Quality Management System",
                    "ISO 14001:2015 - Environmental Management System",
                    "ISO 45001:2018 - Occupational Health and Safety Management",
                    "Compliant with ABS, Lloyds, DNV, BV, NK Class specifications"
                ],
                contactEmail: "info@marinestream.com",
                contactPhone: "+61 8 9437 3900",
                contactAddress: "13 Possner Way, Henderson, WA 6166, Australia"
            };

            // Apply the template to the data
            const htmlContent = template(data);

            // Create a temporary div to render the content off-screen
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '800px'; // Set a fixed width for rendering consistency
            document.body.appendChild(tempDiv);

            // Use html2canvas to convert the div to an image
             html2canvas(tempDiv, { scale: 2, useCORS: true }).then(canvas => { // Increase scale for better quality
                // Create PDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ // Use object constructor
                    orientation: 'p',
                    unit: 'pt',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pdfWidth; // Use full width
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                 pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                 heightLeft -= pdfHeight;

                // Add new pages if content exceeds one page
                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }

                pdf.save('MarineStream_Capability_Statement.pdf');

            }).catch(error => {
                console.error("Error generating PDF with html2canvas:", error);
                alert("Failed to generate PDF. Please try again.");
            }).finally(() => {
                // Cleanup: Remove the temporary div and re-enable button
                if (document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
                }
                generatePDFBtn.disabled = false;
                generatePDFBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Generate PDF';
            });

        } catch (error) {
            console.error("Error setting up PDF generation:", error);
            alert("An error occurred while preparing the PDF.");
            generatePDFBtn.disabled = false;
            generatePDFBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Generate PDF';
        }
    });
}


// === Hull Fouling Cost Calculator ===
function initHullFoulingCalculator() {
    // Elements
    const modal = document.getElementById('cost-calculator-modal');
    if (!modal) return; // Don't run if modal not found

    const vesselTypeSelect = modal.querySelector("#vesselTypeCalc"); // Use specific ID
    const costEcoInput = modal.querySelector("#costEco");
    const costFullInput = modal.querySelector("#costFull");
    const frSlider = modal.querySelector("#frSlider");
    const currencySelect = modal.querySelector("#currencySelect");
    const resultsText = modal.querySelector('#resultsText');
    const chartCanvas = modal.querySelector("#myChart");
    const rangeTicks = modal.querySelectorAll('.range-tick');

    // Check if all required elements exist
    if (!vesselTypeSelect || !costEcoInput || !costFullInput || !frSlider || !currencySelect || !resultsText || !chartCanvas) {
        console.error("One or more elements missing in Hull Fouling Cost Calculator.");
        return;
    }

    // Currency conversion rates & symbols (keep as before)
    const conversionRates = { AUD: 1, USD: 0.67, EUR: 0.63, GBP: 0.52 };
    const currencySymbols = { AUD: '$', USD: '$', EUR: '€', GBP: '£' };
    let currentCurrency = 'AUD';

    // Vessel type configurations (keep as before)
    const vesselConfigs = {
        tug: { name: "Harbor Tug (32m)", ecoSpeed: 8, fullSpeed: 13, costEco: 600, costFull: 2160, waveExp: 4.5 },
        cruiseShip: { name: "Passenger Cruise Ship (93m)", ecoSpeed: 10, fullSpeed: 13.8, costEco: 1600, costFull: 4200, waveExp: 4.6 },
        osv: { name: "Offshore Supply Vessel (50m)", ecoSpeed: 10, fullSpeed: 14, costEco: 850, costFull: 3200, waveExp: 4.5 },
        coaster: { name: "Coastal Freighter (80m)", ecoSpeed: 11, fullSpeed: 15, costEco: 1200, costFull: 4800, waveExp: 4.6 }
    };

    // FR data (keep as before)
    const frData = {
        0: { pct: 0, desc: "Clean hull" }, 1: { pct: 15, desc: "Light slime" }, 2: { pct: 35, desc: "Medium slime" },
        3: { pct: 60, desc: "Heavy slime" }, 4: { pct: 95, desc: "Light calcareous" }, 5: { pct: 193, desc: "Heavy calcareous" }
    };

    let myChart = null; // Chart instance

    // --- Helper Functions --- (Keep convertCurrency, solveAlphaBeta, formatCurrency, calculateExtraCO2, getValidationStatus as before)
    function convertCurrency(amount, fromCurrency, toCurrency) {
        const amountInAUD = fromCurrency === 'AUD' ? amount : amount / conversionRates[fromCurrency];
        return amountInAUD * conversionRates[toCurrency];
    }
    function solveAlphaBeta(costEco, costFull, ecoSpeed, fullSpeed, waveExp = 4.5) {
        const s1 = ecoSpeed, s2 = fullSpeed;
        const x1 = Math.pow(s1, 3), y1 = Math.pow(s1, waveExp);
        const x2 = Math.pow(s2, 3), y2 = Math.pow(s2, waveExp);
        const det = x1*y2 - x2*y1;
        if (Math.abs(det) < 1e-6) return { alpha: 0, beta: 0 }; // Avoid division by zero
        const alpha = (costEco*y2 - costFull*y1) / det;
        const beta  = (costFull*x1 - costEco*x2) / det;
        return { alpha, beta };
    }
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentCurrency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    }
    function calculateExtraCO2(extraCost, vesselTypeKey) {
        const extraCostAUD = currentCurrency === 'AUD' ? extraCost : convertCurrency(extraCost, currentCurrency, 'AUD');
        let emissionFactor = 1.45; // Default kg CO2 per $AUD extra fuel
        if (vesselTypeKey === 'cruiseShip') emissionFactor = 1800 / 1273;
        else if (vesselTypeKey === 'tug') emissionFactor = 1300 / 955;
        return extraCostAUD * emissionFactor;
    }
     function getValidationStatus(vesselTypeKey, frLevel, speed) {
        const vessel = vesselConfigs[vesselTypeKey];
        if (!vessel) return { validated: false, message: "" };

        if (vesselTypeKey === 'cruiseShip' && frLevel === 5 && Math.abs(speed - vessel.fullSpeed) < 0.5) {
            return { validated: true, message: "Values validated by University of Melbourne Coral Adventurer study" };
        } else if (vesselTypeKey === 'tug' && frLevel === 4 && Math.abs(speed - vessel.fullSpeed) < 0.5) {
            return { validated: true, message: "Values validated by University of Melbourne Rio Tinto tugboat study" };
        }
        return { validated: false, message: "" };
    }
    // --- Main Update Function ---
    function updateCalculator() {
        const vesselTypeKey = vesselTypeSelect.value;
        const vessel = vesselConfigs[vesselTypeKey];
        if (!vessel) return; // Should not happen if select is populated correctly

        let costEcoInputVal = parseFloat(costEcoInput.value) || vessel.costEco;
        let costFullInputVal = parseFloat(costFullInput.value) || vessel.costFull;

        // Convert input costs to AUD for internal calculations
        let costEcoAUD = currentCurrency === 'AUD' ? costEcoInputVal : convertCurrency(costEcoInputVal, currentCurrency, 'AUD');
        let costFullAUD = currentCurrency === 'AUD' ? costFullInputVal : convertCurrency(costFullInputVal, currentCurrency, 'AUD');

        const frLevel = parseInt(frSlider.value) || 0;
        const { pct: frPct } = frData[frLevel];
        const frLabel = `FR${frLevel}`;
        modal.querySelector("#frLabel").textContent = frLabel;

        const minSpeed = Math.max(vessel.ecoSpeed - 4, 4);
        const maxSpeed = vessel.fullSpeed + 2;
        const { alpha, beta } = solveAlphaBeta(costEcoAUD, costFullAUD, vessel.ecoSpeed, vessel.fullSpeed, vessel.waveExp);

        const speeds = [];
        const cleanCosts = [];
        const fouledCosts = [];
        const co2Emissions = [];
        const stepSize = (maxSpeed - minSpeed) > 8 ? 0.5 : 0.25;

        for (let s = minSpeed; s <= maxSpeed; s += stepSize) {
            const frictionAUD = alpha * Math.pow(s, 3);
            const waveAUD = beta * Math.pow(s, vessel.waveExp);
            const costCleanAUD = Math.max(0, frictionAUD + waveAUD); // Ensure non-negative cost

            const frictionFouledAUD = frictionAUD * (1 + frPct / 100);
            const costFouledAUD = Math.max(0, frictionFouledAUD + waveAUD); // Ensure non-negative cost

            const extraCostAUD = costFouledAUD - costCleanAUD;
            const extraCO2 = calculateExtraCO2(extraCostAUD, vesselTypeKey);

            speeds.push(s.toFixed(1));
            cleanCosts.push(currentCurrency === 'AUD' ? costCleanAUD : convertCurrency(costCleanAUD, 'AUD', currentCurrency));
            fouledCosts.push(currentCurrency === 'AUD' ? costFouledAUD : convertCurrency(costFouledAUD, 'AUD', currentCurrency));
            co2Emissions.push(extraCO2);
        }

        // Update Chart
        if (myChart) myChart.destroy();
        const ctx = chartCanvas.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: speeds,
                datasets: [
                    { label: 'Clean Hull (FR0)', data: cleanCosts, borderColor: 'rgba(30, 77, 120, 1)', backgroundColor: 'rgba(30, 77, 120, 0.1)', fill: false, tension: 0.1, yAxisID: 'y', borderWidth: 2 },
                    { label: `Fouled Hull (${frLabel})`, data: fouledCosts, borderColor: 'rgba(232, 119, 34, 1)', backgroundColor: 'rgba(232, 119, 34, 0.1)', fill: false, tension: 0.1, yAxisID: 'y', borderWidth: 2 },
                    { label: 'Additional CO₂ Emissions', data: co2Emissions, borderColor: 'rgba(16, 133, 101, 1)', fill: false, tension: 0.1, yAxisID: 'y1', borderDash: [5, 5], borderWidth: 2 }
                ]
            },
            options: { // Keep options as before, ensure responsiveness and scales
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { position: 'top', labels: { padding: 15, usePointStyle: true } }, tooltip: { callbacks: { label: ctx => ctx.dataset.yAxisID === 'y1' ? `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kg/hr` : `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}/hr` }}},
                scales: {
                    x: { title: { display: true, text: 'Speed (knots)', padding: { top: 10 } }, ticks: { padding: 5 }},
                    y: { type: 'linear', display: true, position: 'left', title: { display: true, text: `Operating Cost (${currencySymbols[currentCurrency]}/hr)`, padding: { bottom: 10 } }, beginAtZero: true, ticks: { padding: 5, callback: value => formatCurrency(value) }}, // Format Y axis
                    y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Additional CO₂ (kg/hr)', padding: { bottom: 10 } }, beginAtZero: true, grid: { drawOnChartArea: false }, ticks: { padding: 5 }}
                }
            }
        });

        // Calculate costs at specific speeds
        function costAt(speed) {
            const frictionAUD = alpha * Math.pow(speed, 3);
            const waveAUD = beta * Math.pow(speed, vessel.waveExp);
            const cleanAUD = Math.max(0, frictionAUD + waveAUD);
            const fouledAUD = Math.max(0, frictionAUD * (1 + frPct/100) + waveAUD);
            const validation = getValidationStatus(vesselTypeKey, frLevel, speed);
            return {
                clean: currentCurrency === 'AUD' ? cleanAUD : convertCurrency(cleanAUD, 'AUD', currentCurrency),
                fouled: currentCurrency === 'AUD' ? fouledAUD : convertCurrency(fouledAUD, 'AUD', currentCurrency),
                validation: validation
            };
        }
        const cEco = costAt(vessel.ecoSpeed);
        const cFull = costAt(vessel.fullSpeed);
        const increaseEco = cEco.clean > 0 ? ((cEco.fouled - cEco.clean) / cEco.clean * 100).toFixed(1) : 'N/A';
        const increaseFull = cFull.clean > 0 ? ((cFull.fouled - cFull.clean) / cFull.clean * 100).toFixed(1) : 'N/A';
        const extraCostFull = cFull.fouled - cFull.clean;
        const extraCO2Full = calculateExtraCO2(extraCostFull, vesselTypeKey);

        // Annual impact (keep as before)
        const annualHours = 12 * 200;
        const annualExtraCost = extraCostFull * annualHours;
        const annualExtraCO2 = extraCO2Full * annualHours / 1000; // Tonnes

        // Update Results Text (keep structure, ensure formatting)
        resultsText.innerHTML = `
            <div class="result-item"><span class="result-label">Vessel Type:</span><span class="result-value">${vessel.name}</span></div>
            <div class="result-group">
                <div class="result-group-header"><i class="fas fa-tachometer-alt"></i><h4>At ${vessel.ecoSpeed} knots (Economic)</h4></div>
                <div class="result-item"><span class="result-label">Clean Hull:</span><span class="result-value">${formatCurrency(cEco.clean)}/hr</span></div>
                <div class="result-item"><span class="result-label">Fouled (${frLabel}):</span><span class="result-value">${formatCurrency(cEco.fouled)}/hr</span></div>
                <div class="result-item"><span class="result-label">Cost Increase:</span><span class="result-value">${increaseEco}%</span></div>
            </div>
            <div class="result-group">
                 <div class="result-group-header"><i class="fas fa-rocket"></i><h4>At ${vessel.fullSpeed} knots (Full)</h4></div>
                <div class="result-item"><span class="result-label">Clean Hull:</span><span class="result-value">${formatCurrency(cFull.clean)}/hr</span></div>
                <div class="result-item"><span class="result-label">Fouled (${frLabel}):</span><span class="result-value">${formatCurrency(cFull.fouled)}/hr</span></div>
                <div class="result-item"><span class="result-label">Cost Increase:</span><span class="result-value">${increaseFull}%</span></div>
                 ${cFull.validation.validated ? `<div class="validation-badge"><i class="fas fa-check-circle"></i><span>${cFull.validation.message}</span></div>` : ''}
            </div>
             <div class="result-group">
                 <div class="result-group-header"><i class="fas fa-leaf"></i><h4>Environmental Impact (Full Speed)</h4></div>
                 <div class="result-item"><span class="result-label">Add. CO₂:</span><span class="result-value">${extraCO2Full.toFixed(1)} kg/hr</span></div>
            </div>
             <div class="result-group">
                 <div class="result-group-header"><i class="fas fa-calendar-alt"></i><h4>Estimated Annual Impact</h4></div>
                 <div class="result-item"><span class="result-label">Schedule:</span><span class="result-value">12 hrs/day, 200 days/yr</span></div>
                 <div class="result-item"><span class="result-label">Add. Fuel Cost:</span><span class="result-value">${formatCurrency(annualExtraCost)}</span></div>
                 <div class="result-item"><span class="result-label">Add. CO₂:</span><span class="result-value">${annualExtraCO2.toFixed(1)} tonnes</span></div>
            </div>
        `;


        // Highlight active tick
        rangeTicks.forEach(tick => {
            const tickValue = parseInt(tick.dataset.value);
            const tickDot = tick.querySelector('.tick-dot');
            const isActive = (tickValue === frLevel);
            tickDot.style.backgroundColor = isActive ? 'var(--accent-color)' : 'var(--text-tertiary)';
            tickDot.style.transform = isActive ? 'scale(1.5)' : 'scale(1)';
        });
    }

    // Initialize vessel fields based on selection and currency
    function initializeVesselFields() {
        const vesselTypeKey = vesselTypeSelect.value;
        const vessel = vesselConfigs[vesselTypeKey];
        if (!vessel) return;
        costEcoInput.value = Math.round(currentCurrency === 'AUD' ? vessel.costEco : convertCurrency(vessel.costEco, 'AUD', currentCurrency));
        costFullInput.value = Math.round(currentCurrency === 'AUD' ? vessel.costFull : convertCurrency(vessel.costFull, 'AUD', currentCurrency));
    }

    // --- Event Listeners ---
    vesselTypeSelect.addEventListener("change", () => {
        initializeVesselFields();
        updateCalculator();
    });
    costEcoInput.addEventListener("input", updateCalculator);
    costFullInput.addEventListener("input", updateCalculator);
    frSlider.addEventListener("input", updateCalculator);

    currencySelect.addEventListener("change", function() {
        const newCurrency = this.value;
        if (newCurrency === currentCurrency) return;

        // Get current values before changing currency
        const costEcoCurrent = parseFloat(costEcoInput.value) || 0;
        const costFullCurrent = parseFloat(costFullInput.value) || 0;

        // Convert current values from OLD currency to AUD
        const costEcoAUD = currentCurrency === 'AUD' ? costEcoCurrent : convertCurrency(costEcoCurrent, currentCurrency, 'AUD');
        const costFullAUD = currentCurrency === 'AUD' ? costFullCurrent : convertCurrency(costFullCurrent, currentCurrency, 'AUD');

        // Update current currency
        currentCurrency = newCurrency;

        // Convert AUD values to NEW currency for display
        costEcoInput.value = Math.round(currentCurrency === 'AUD' ? costEcoAUD : convertCurrency(costEcoAUD, 'AUD', currentCurrency));
        costFullInput.value = Math.round(currentCurrency === 'AUD' ? costFullAUD : convertCurrency(costFullAUD, 'AUD', currentCurrency));

        updateCalculator(); // Recalculate with new currency display
    });

    rangeTicks.forEach(tick => {
        tick.addEventListener('click', function() {
            frSlider.value = this.dataset.value;
            updateCalculator();
        });
    });

    // Initial Setup
    initializeVesselFields();
    updateCalculator();
}


// === Biofouling Management Plan Generator ===
function initBiofoulingPlanGenerator() {
     // Elements
    const modal = document.getElementById('plan-generator-modal');
    if (!modal) return;

    const tabButtons = modal.querySelectorAll('.tab-btn');
    const tabPanes = modal.querySelectorAll('.tab-pane');
    const nextButtons = modal.querySelectorAll('.next-tab');
    const prevButtons = modal.querySelectorAll('.prev-tab');
    const diverCountSelect = modal.querySelector('#diverCount');
    const diverFieldsContainer = modal.querySelector('#diverFields');
    const componentItems = modal.querySelectorAll('.component-item');
    const componentDetailsContainer = modal.querySelector('#component-details');
    const componentForm = componentDetailsContainer?.querySelector('.component-form');
    const selectComponentMsg = componentDetailsContainer?.querySelector('.select-component-message');
    const saveComponentButton = modal.querySelector('#save-component');
    const signatureCanvas = modal.querySelector('#signaturePad');
    const clearSignatureButton = modal.querySelector('#clearSignature');
    const coverPhotoInput = modal.querySelector('#coverPhoto');
    const coverPreviewContainer = modal.querySelector('#cover-preview');
    const previewReportButton = modal.querySelector('#preview-report');
    const generateReportButton = modal.querySelector('#generate-report');
    const reportPreviewModal = document.getElementById('report-preview-modal'); // Separate modal
    const reportPreviewContainer = reportPreviewModal?.querySelector('#report-preview-container');
    const downloadReportButton = reportPreviewModal?.querySelector('#download-report');
    const closePreviewButton = reportPreviewModal?.querySelector('#close-preview');

     // Basic check for essential elements
     if (!tabButtons.length || !tabPanes.length || !componentItems.length || !componentForm || !signatureCanvas) {
        console.error("One or more critical elements missing in Plan Generator modal.");
        return;
    }


    let componentData = {}; // Store component details
    let signaturePadInstance = null;

    // --- Tab Navigation ---
    function switchTab(targetTabId) {
        tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === targetTabId));
        tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === targetTabId));
    }
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    nextButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.next));
    });
    prevButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.prev));
    });

    // --- Diver Fields ---
    function updateDiverFields() {
        if (!diverCountSelect || !diverFieldsContainer) return;
        const count = parseInt(diverCountSelect.value) || 0;
        diverFieldsContainer.innerHTML = ''; // Clear existing
        for (let i = 1; i <= count; i++) {
            const field = document.createElement('div');
            field.className = 'form-group';
            field.innerHTML = `<label for="diver${i}">Diver ${i}:</label><input type="text" id="diver${i}" class="form-control">`;
            diverFieldsContainer.appendChild(field);
        }
    }
    if (diverCountSelect) {
        diverCountSelect.addEventListener('change', updateDiverFields);
        updateDiverFields(); // Initial call
    }

    // --- Component Selection & Data Handling ---
    function loadComponentDetails(componentId) {
        if (!componentDetailsContainer || !componentForm || !selectComponentMsg) return;

        selectComponentMsg.style.display = 'none';
        componentForm.style.display = 'block';

        const componentItem = modal.querySelector(`.component-item[data-id="${componentId}"]`);
        const componentName = componentItem?.querySelector('.component-name')?.textContent || componentId;
        componentForm.querySelector('#component-title').textContent = componentName;

        const data = componentData[componentId] || {}; // Get existing data or empty object
        modal.querySelector('#component-comments').value = data.comments || '';
        modal.querySelector('#fouling-rating').value = data.foulingRating || 'FR0';
        modal.querySelector('#fouling-coverage').value = data.foulingCoverage || '0%';
        modal.querySelector('#pdr-rating').value = data.pdrRating || 'PDR10';
        modal.querySelector('#component-photo').value = ''; // Clear file input

        const photoPreview = modal.querySelector('#photo-preview');
        photoPreview.innerHTML = ''; // Clear preview
        if (data.photos && data.photos.length > 0) {
            data.photos.forEach(photoSrc => {
                const img = document.createElement('img');
                img.src = photoSrc;
                img.alt = `${componentName} photo`;
                photoPreview.appendChild(img);
            });
        }

        if (saveComponentButton) saveComponentButton.dataset.id = componentId; // Set ID for saving
    }

    componentItems.forEach(item => {
        item.addEventListener('click', function() {
            componentItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            loadComponentDetails(this.dataset.id);
        });
    });

    if (saveComponentButton) {
        saveComponentButton.addEventListener('click', function() {
            const componentId = this.dataset.id;
            if (!componentId) return;

            if (!componentData[componentId]) componentData[componentId] = {};

            componentData[componentId].comments = modal.querySelector('#component-comments').value;
            componentData[componentId].foulingRating = modal.querySelector('#fouling-rating').value;
            componentData[componentId].foulingCoverage = modal.querySelector('#fouling-coverage').value;
            componentData[componentId].pdrRating = modal.querySelector('#pdr-rating').value;

            const photoInput = modal.querySelector('#component-photo');
            const photoPreview = modal.querySelector('#photo-preview');

            if (photoInput.files && photoInput.files[0]) {
                const file = photoInput.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (!componentData[componentId].photos) componentData[componentId].photos = [];
                    componentData[componentId].photos.push(e.target.result); // Add new photo data URL
                    // Update preview immediately
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = `New photo for ${componentId}`;
                    photoPreview.appendChild(img);
                    photoInput.value = ''; // Reset file input
                     // Indicate success (optional)
                     saveComponentButton.textContent = "Saved!";
                     setTimeout(() => saveComponentButton.textContent = "Save Component", 1500);
                };
                 reader.onerror = () => alert("Error reading photo file.");
                reader.readAsDataURL(file);
            } else {
                 // Indicate success (optional) - even if no photo added
                 saveComponentButton.textContent = "Saved!";
                 setTimeout(() => saveComponentButton.textContent = "Save Component", 1500);
            }
        });
    }

    // --- Signature Pad ---
    function initSignaturePadLib(canvasElement) {
         // Basic Canvas 2D drawing setup
        const ctx = canvasElement.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Set canvas background (important for toDataURL)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';

        function getCoords(e) {
            const rect = canvasElement.getBoundingClientRect();
            const scaleX = canvasElement.width / rect.width;
            const scaleY = canvasElement.height / rect.height;
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
            if (clientX === undefined || clientY === undefined) return null;
            return {
                 x: (clientX - rect.left) * scaleX,
                 y: (clientY - rect.top) * scaleY
             };
        }

        function startDrawing(e) {
             e.preventDefault();
             const coords = getCoords(e);
             if (!coords) return;
             isDrawing = true;
             [lastX, lastY] = [coords.x, coords.y];
         }

         function draw(e) {
             if (!isDrawing) return;
             e.preventDefault();
             const coords = getCoords(e);
             if (!coords) return;

             ctx.beginPath();
             ctx.moveTo(lastX, lastY);
             ctx.lineTo(coords.x, coords.y);
             ctx.stroke();
             [lastX, lastY] = [coords.x, coords.y];
         }

         function stopDrawing(e) {
             if (!isDrawing) return;
             e.preventDefault();
             isDrawing = false;
         }

        // Mouse events
        canvasElement.addEventListener('mousedown', startDrawing);
        canvasElement.addEventListener('mousemove', draw);
        canvasElement.addEventListener('mouseup', stopDrawing);
        canvasElement.addEventListener('mouseout', stopDrawing); // Stop if mouse leaves canvas

        // Touch events
        canvasElement.addEventListener('touchstart', startDrawing);
        canvasElement.addEventListener('touchmove', draw);
        canvasElement.addEventListener('touchend', stopDrawing);
        canvasElement.addEventListener('touchcancel', stopDrawing);


        // Return the canvas context or a custom object if needed
        return {
            clear: () => {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
            },
            toDataURL: (type = 'image/png', quality) => canvasElement.toDataURL(type, quality),
            isEmpty: () => {
                // A simple check: see if it's all white pixels (can be slow for large pads)
                 const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvasElement.width, canvasElement.height).data.buffer);
                 return !pixelBuffer.some(color => color !== 0xFFFFFFFF); // Check for non-white pixels
            }
        };
    }
    if (signatureCanvas) {
        signaturePadInstance = initSignaturePadLib(signatureCanvas);
    }
    if (clearSignatureButton && signaturePadInstance) {
        clearSignatureButton.addEventListener('click', () => signaturePadInstance.clear());
    }


    // --- Cover Photo Preview ---
    if (coverPhotoInput && coverPreviewContainer) {
        coverPhotoInput.addEventListener('change', function() {
            coverPreviewContainer.innerHTML = ''; // Clear preview
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = "Cover photo preview";
                    coverPreviewContainer.appendChild(img);
                };
                reader.onerror = () => alert("Error reading cover photo file.");
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Report Generation & Preview ---
    function collectReportData() {
         // Helper to get value or default
        const getValue = (id, defaultValue = 'N/A') => modal.querySelector(`#${id}`)?.value || defaultValue;
        const getSelectText = (id, defaultValue = 'N/A') => {
            const select = modal.querySelector(`#${id}`);
            return select ? select.options[select.selectedIndex]?.text : defaultValue;
        };

        let signatureDataURL = null;
        if (signaturePadInstance && !signaturePadInstance.isEmpty()) {
             try {
                 signatureDataURL = signaturePadInstance.toDataURL();
             } catch (e) { console.error("Error getting signature data URL:", e); }
         }

         let coverPhotoDataURL = null;
         const coverPreviewImg = coverPreviewContainer?.querySelector('img');
         if (coverPreviewImg) coverPhotoDataURL = coverPreviewImg.src;


        return {
            vesselName: getValue('vesselName', 'Unnamed Vessel'),
            imo: getValue('imo'),
            vesselType: getSelectText('vesselTypeGen'), // Use specific ID
            commissioned: getValue('vesselCommissioned'),
            grossTonnage: getValue('grossTonnage'),
            length: getValue('length'),
            beam: getValue('beam'),
            draft: getValue('vesselDraft'),
            operationalArea: getSelectText('operatingArea'),
            lastAntifouling: getValue('antifoulingDate', 'Not Specified'),

            inspectionDate: getValue('inspectionDate', new Date().toISOString().slice(0, 10)),
            inspectionLocation: getValue('inspectionLocation'),
            visibility: getValue('visibility'),
            inspector: getValue('inspector'),
            clientDetails: getValue('clientDetails'),
            clientRep: getValue('clientRep'),
            supervisor: getValue('supervisor'),
            divers: Array.from({ length: parseInt(diverCountSelect?.value || 0) }, (_, i) => getValue(`diver${i+1}`)),
            methodology: modal.querySelector('#methodologyText')?.value || 'Standard inspection methodology.',

            components: componentData, // Use the stored object

            summary: modal.querySelector('#summaryText')?.value || 'No summary provided.',
            recommendations: modal.querySelector('#recommendationsText')?.value || 'No recommendations provided.',
            declaration: modal.querySelector('#declaration')?.value || '',
            signature: signatureDataURL,

            title: getValue('reportTitle', 'Marine Inspection Report'),
            coverPhoto: coverPhotoDataURL,
            documentNumber: getValue('documentNumber', 'MS-RPT-YYYY-NNNN'),
            documentRevision: getValue('documentRevision', '0'),
            reportFormat: getSelectText('reportFormat', 'Full Report') // Get selected format text
        };
    }

    function generateComponentsHTMLPreview(components) { // Simplified HTML for preview
        if (!components || Object.keys(components).length === 0) return '<p>No component data.</p>';
        let html = '<ul>';
        for (const id in components) {
            const data = components[id];
            const name = modal.querySelector(`.component-item[data-id="${id}"] .component-name`)?.textContent || id;
            html += `<li><strong>${name}:</strong> ${data.comments || 'No comments.'} (FR: ${data.foulingRating || 'N/A'})</li>`;
        }
        html += '</ul>';
        return html;
    }

     function generateReportPreviewContent() {
        if (!reportPreviewModal || !reportPreviewContainer) return;
        const data = collectReportData();

        // Basic HTML structure for preview
        reportPreviewContainer.innerHTML = `
            <h1>${data.title}</h1>
            <h2>Vessel: ${data.vesselName} (IMO: ${data.imo})</h2>
            ${data.coverPhoto ? `<img src="${data.coverPhoto}" alt="Cover Photo" style="max-width: 100%; margin-bottom: 1em;">` : ''}
            <p><strong>Inspection Date:</strong> ${formatDate(data.inspectionDate)}</p>
            <hr>
            <h3>Summary</h3>
            <p>${data.summary.replace(/\n/g, '<br>')}</p>
             <h3>Components Overview</h3>
             ${generateComponentsHTMLPreview(data.components)}
            <h3>Recommendations</h3>
            <p>${data.recommendations.replace(/\n/g, '<br>')}</p>
            ${data.signature ? `<h3>Signature</h3><img src="${data.signature}" alt="Signature" style="max-height: 100px; border: 1px solid #ccc;">` : ''}
        `;
        reportPreviewModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Hide body scroll for preview modal
    }


     function generateFinalReportHTML() { // More detailed HTML for download
        const data = collectReportData();

        const componentsHTML = Object.entries(data.components).map(([id, compData]) => {
             const name = modal.querySelector(`.component-item[data-id="${id}"] .component-name`)?.textContent || id;
             const photosHTML = (compData.photos || [])
                 .map(src => `<img src="${src}" alt="${name} photo" style="width: 150px; height: auto; margin: 5px; border: 1px solid #eee;">`)
                 .join('');
             return `
                 <div class="component" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 15px; page-break-inside: avoid;">
                     <h4 style="margin: 0 0 5px 0; font-size: 1.1em;">${name}</h4>
                     <p style="margin: 0 0 5px 0;"><strong>Observations:</strong> ${compData.comments || 'N/A'}</p>
                     <p style="margin: 0 0 5px 0;"><strong>Fouling:</strong> ${compData.foulingRating || 'N/A'} (${compData.foulingCoverage || 'N/A'})</p>
                     <p style="margin: 0 0 10px 0;"><strong>Paint:</strong> ${compData.pdrRating || 'N/A'}</p>
                     ${photosHTML ? `<div><strong>Photos:</strong><br>${photosHTML}</div>` : ''}
                 </div>`;
         }).join('');


        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${data.title} - ${data.vesselName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 30px; font-size: 10pt; line-height: 1.4; color: #333; }
                    h1, h2, h3 { color: #111; margin: 1.5em 0 0.5em 0; }
                    h1 { font-size: 18pt; text-align: center; }
                    h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 3px;}
                    h3 { font-size: 12pt; }
                    p { margin: 0 0 0.8em 0; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 1em; font-size: 9pt; }
                    th, td { border: 1px solid #ccc; padding: 5px; text-align: left; vertical-align: top;}
                    th { background-color: #f0f0f0; font-weight: bold; }
                    .page-break { page-break-after: always; }
                    .cover-photo { text-align: center; margin-bottom: 2em; }
                    .cover-photo img { max-width: 80%; max-height: 300px; border: 1px solid #ccc; }
                    .signature-block { margin-top: 2em; }
                    .signature-block img { max-height: 80px; border-bottom: 1px solid #555; margin-bottom: 5px;}
                </style>
            </head>
            <body>
                <h1>${data.title}</h1>
                <div class="cover-photo">
                     ${data.coverPhoto ? `<img src="${data.coverPhoto}" alt="Cover Photo"><br>` : ''}
                     <h2>${data.vesselName} (IMO: ${data.imo})</h2>
                     <p><strong>Inspection Date:</strong> ${formatDate(data.inspectionDate)}</p>
                     <p><strong>Location:</strong> ${data.inspectionLocation}</p>
                     <p><strong>Document:</strong> ${data.documentNumber} Rev ${data.documentRevision}</p>
                </div>

                <div class="page-break"></div>

                 <h2>Executive Summary</h2>
                 <p>${data.summary.replace(/\n/g, '<br>')}</p>

                 <h2>Vessel Details</h2>
                 <table>
                     <tr><th>Vessel Name</th><td>${data.vesselName}</td><th>IMO Number</th><td>${data.imo}</td></tr>
                     <tr><th>Vessel Type</th><td>${data.vesselType}</td><th>Commissioned</th><td>${data.commissioned}</td></tr>
                     <tr><th>Gross Tonnage</th><td>${data.grossTonnage} t</td><th>Length Overall</th><td>${data.length} m</td></tr>
                     <tr><th>Beam</th><td>${data.beam} m</td><th>Draft</th><td>${data.draft} m</td></tr>
                     <tr><th>Operating Area</th><td>${data.operationalArea}</td><th>Last Antifouling</th><td>${formatDate(data.lastAntifouling)}</td></tr>
                 </table>

                 <h2>Inspection Details</h2>
                  <table>
                     <tr><th>Inspection Date</th><td>${formatDate(data.inspectionDate)}</td><th>Location</th><td>${data.inspectionLocation}</td></tr>
                     <tr><th>Visibility</th><td>${data.visibility}</td><th>Inspector</th><td>${data.inspector}</td></tr>
                     <tr><th>Client</th><td>${data.clientDetails}</td><th>Client Rep.</th><td>${data.clientRep}</td></tr>
                     <tr><th>Supervisor</th><td>${data.supervisor}</td><th>Divers</th><td>${data.divers.join(', ') || 'N/A'}</td></tr>
                     <tr><th colspan="4">Methodology</th></tr>
                     <tr><td colspan="4">${data.methodology.replace(/\n/g, '<br>')}</td></tr>
                 </table>

                 <div class="page-break"></div>

                 <h2>Component Assessment</h2>
                 ${componentsHTML}

                 <div class="page-break"></div>

                 <h2>Recommendations</h2>
                 <p>${data.recommendations.replace(/\n/g, '<br>')}</p>

                 <h2>Declaration</h2>
                 <p>${data.declaration.replace('[Inspector Name]', data.inspector).replace(/\n/g, '<br>')}</p>
                  <div class="signature-block">
                     ${data.signature ? `<img src="${data.signature}" alt="Signature"><br>` : ''}
                     <span>${data.inspector}</span><br>
                     <span>Date: ${formatDate(data.inspectionDate)}</span>
                 </div>

            </body>
            </html>
        `;
    }

    if (previewReportButton) {
        previewReportButton.addEventListener('click', generateReportPreviewContent);
    }

     if (generateReportButton) {
        generateReportButton.addEventListener('click', () => {
             const htmlContent = generateFinalReportHTML();
             const blob = new Blob([htmlContent], { type: 'text/html' });
             const url = URL.createObjectURL(blob);
             const link = document.createElement('a');
             const vesselName = modal.querySelector('#vesselName')?.value || 'Vessel';
             link.href = url;
             link.download = `MarineStream_Report_${vesselName.replace(/[^a-z0-9]/gi, '_')}.html`;
             document.body.appendChild(link); // Required for Firefox
             link.click();
             document.body.removeChild(link);
             URL.revokeObjectURL(url);
         });
     }

     // Close/Download from Preview Modal
     if (closePreviewButton && reportPreviewModal) {
         closePreviewButton.addEventListener('click', () => {
             reportPreviewModal.style.display = 'none';
             document.body.style.overflow = ''; // Restore scroll
         });
     }
     if (downloadReportButton) {
         downloadReportButton.addEventListener('click', () => {
             // Use the same generation logic as the main button
             const htmlContent = generateFinalReportHTML();
             const blob = new Blob([htmlContent], { type: 'text/html' });
             const url = URL.createObjectURL(blob);
             const link = document.createElement('a');
             const vesselName = modal.querySelector('#vesselName')?.value || 'Vessel';
             link.href = url;
             link.download = `MarineStream_Report_${vesselName.replace(/[^a-z0-9]/gi, '_')}.html`;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             URL.revokeObjectURL(url);
         });
     }
}


// === Video Initialization ===
function initVideos() {
    function setupVideo(videoId, buttonId) {
        const video = document.getElementById(videoId);
        const playBtn = document.getElementById(buttonId);

        if (!video || !playBtn) return; // Exit if elements not found

        function togglePlay() {
            if (video.paused || video.ended) {
                video.play().catch(e => console.error(`Error playing ${videoId}:`, e));
            } else {
                video.pause();
            }
        }

         function updateButton() {
            const icon = video.paused || video.ended ? 'fa-play' : 'fa-pause';
            playBtn.innerHTML = `<i class="fas ${icon}"></i>`;
            playBtn.setAttribute('aria-label', video.paused || video.ended ? `Play ${videoId}` : `Pause ${videoId}`);
         }


        playBtn.addEventListener('click', togglePlay);
        video.addEventListener('play', updateButton);
        video.addEventListener('pause', updateButton);
        video.addEventListener('ended', updateButton);

        // Initial button state
        updateButton();

         // Show native controls if JS fails or for accessibility
         // video.controls = true; // Optionally force controls always visible
    }

    setupVideo('rov-video', 'rov-play-btn');
    setupVideo('crawler-video', 'crawler-play-btn');
}


// === Helper Functions ===
function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        const date = new Date(dateString + 'T00:00:00'); // Assume local time if no timezone
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        // Adjust formatting as needed
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-AU', options); // Example: Australian format
    } catch (e) {
        return dateString; // Return original string if Date parsing fails
    }
}