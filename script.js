// MarineStream Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize core website functionality
    initWebsiteFunctions(); // Includes theme toggles, nav, etc.

    // Initialize tools if elements exist
    if (document.getElementById('cost-calculator-modal')) {
        initHullFoulingCalculator();
    }
    if (document.getElementById('plan-generator-modal')) {
        initBiofoulingPlanGenerator();
    }

    // Initialize videos with autoplay
    if (document.getElementById('rov-video') || document.getElementById('crawler-video')) {
        initVideos(); // Modified to handle autoplay
    }

    // Initialize PDF Generator if button exists
    if (document.getElementById('generate-pdf')) {
        initPDFGenerator();
    }
});

// === Core Website Functions ===
function initWebsiteFunctions() {
    // Theme Toggling (Color and Dark/Light)
    initThemeSwitcher(); // Handles color themes
    initThemeToggle();   // Handles dark/light mode

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

    // Initialize Tool Modal Buttons & Closing Logic
    initModalControls();

    // Active Nav Link Highlighting on Scroll
    initNavLinkHighlighting();
}

// Initialize Tool Modal Buttons & Closing Logic
function initModalControls() {
    const modalButtons = [
        { buttonId: 'open-cost-calculator', modalId: 'cost-calculator-modal' },
        { buttonId: 'open-plan-generator', modalId: 'plan-generator-modal' }
    ];

    modalButtons.forEach(item => {
        const button = document.getElementById(item.buttonId);
        const modal = document.getElementById(item.modalId);
        if (button && modal) {
            button.addEventListener('click', () => openModal(modal));
        }
    });

    // Close modals functionality
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay'); // Find parent modal
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal by clicking overlay background
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

     // Close modal with Escape key
     document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                if (modal.style.display === 'block' || modal.style.display === 'flex') { // Check if modal is open
                    closeModal(modal);
                }
            });
        }
    });
}

function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.style.display = 'flex'; // Use flex for centering overlay content
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    // Trigger reflow to ensure animation plays
    void modalElement.offsetWidth;
    modalElement.classList.add('modal-visible'); // Add class for potential animation hooks
}

function closeModal(modalElement) {
     if (!modalElement) return;
     modalElement.classList.remove('modal-visible');
     // Wait for fade-out animation before hiding and restoring scroll
     // Adjust timeout based on animation duration
     setTimeout(() => {
        modalElement.style.display = 'none';
        // Check if any other modals are open before restoring scroll
        const anyModalOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(
            modal => modal.style.display === 'flex' || modal.style.display === 'block'
        );
        if (!anyModalOpen) {
            document.body.style.overflow = '';
        }
     }, 400); // Match animation duration (0.4s)
}


// Dark/Light Mode Toggle
function initThemeToggle() {
    const darkModeToggleBtn = document.getElementById('dark-mode-toggle');
    const headerThemeToggleBtn = document.getElementById('header-theme-toggle');
    const htmlElement = document.documentElement;

    function updateIcons(isDarkMode) {
        const iconClass = isDarkMode ? 'fa-sun' : 'fa-moon';
        const ariaLabel = isDarkMode ? 'Activate light mode' : 'Activate dark mode';
        if (darkModeToggleBtn) {
            darkModeToggleBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;
            darkModeToggleBtn.setAttribute('aria-label', ariaLabel);
            darkModeToggleBtn.setAttribute('title', ariaLabel); // Update title too
        }
        if (headerThemeToggleBtn) {
            headerThemeToggleBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;
            headerThemeToggleBtn.setAttribute('aria-label', ariaLabel);
            headerThemeToggleBtn.setAttribute('title', ariaLabel); // Update title too
        }
    }

    // Function to apply the theme mode
    function applyThemeMode(mode) {
        if (mode === 'dark') {
            htmlElement.setAttribute('data-theme-mode', 'dark');
            updateIcons(true);
        } else {
            htmlElement.removeAttribute('data-theme-mode');
            updateIcons(false);
        }
    }

    // Check for saved preference, then system preference
    const savedThemeMode = localStorage.getItem('themeMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    let currentMode = savedThemeMode || (prefersDark.matches ? 'dark' : 'light');

    // Apply initial theme mode
    applyThemeMode(currentMode);

    // Combined toggle logic
    function toggleDarkMode() {
        const isCurrentlyDark = htmlElement.hasAttribute('data-theme-mode');
        currentMode = isCurrentlyDark ? 'light' : 'dark';
        applyThemeMode(currentMode);
        localStorage.setItem('themeMode', currentMode);
    }

    // Add click event listeners
    if (darkModeToggleBtn) darkModeToggleBtn.addEventListener('click', toggleDarkMode);
    if (headerThemeToggleBtn) headerThemeToggleBtn.addEventListener('click', toggleDarkMode);

    // Listen for system preference changes
    prefersDark.addEventListener('change', event => {
        // Only change if no explicit preference is saved
        if (!localStorage.getItem('themeMode')) {
            applyThemeMode(event.matches ? 'dark' : 'light');
        }
    });
}


// Mobile Navigation
function initMobileNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (!mobileMenuToggle || !navLinksContainer) return;

    mobileMenuToggle.addEventListener('click', () => {
        const isActive = navLinksContainer.classList.toggle('active');
        mobileMenuToggle.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        mobileMenuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        body.classList.toggle('menu-open', isActive); // Add class to body
        body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
                body.style.overflow = '';
            }
        });
    });
}

// GSAP Animations - Enhanced
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Smoother default ease
    gsap.defaults({ ease: "power3.out", duration: 1 });

    // Hero section animations
    gsap.from(".hero-title", { y: 60, opacity: 0, delay: 0.3, duration: 1.2 });
    gsap.from(".hero-subtitle", { y: 40, opacity: 0, delay: 0.6, duration: 1.2 });
    // Removed button animation
    gsap.from(".floating-image", { y: 100, opacity: 0, duration: 1.5, delay: 0.7, ease: "elastic.out(1, 0.75)" }); // Elastic entry

    // Section heading animations (Staggered reveal)
    gsap.utils.toArray('.section-header').forEach(header => {
        const tl = gsap.timeline({
            scrollTrigger: { trigger: header, start: "top 85%", toggleActions: "play none none none" }
        });
        tl.from(header.querySelector('.section-title'), { y: 40, opacity: 0, duration: 0.8 })
          .from(header.querySelector('.section-title::after'), { width: 0, duration: 0.6, ease: "power2.inOut" }, "-=0.5") // Animate underline
          .from(header.querySelector('.section-description'), { y: 20, opacity: 0, duration: 0.8 }, "-=0.4");
    });


    // Feature card animations with stagger
    const featureCards = gsap.utils.toArray('.feature-card');
    if (featureCards.length) {
        gsap.from(featureCards, {
            scrollTrigger: { trigger: '.feature-grid', start: "top 80%", end: "bottom 60%", scrub: 1 }, // Subtle scrub effect
            y: 60, opacity: 0, stagger: 0.1
        });
    }

     // Staggered animation for list items (Smoother)
     gsap.utils.toArray('.tech-features li, .dashboard-feature, .feature-list li, .about-features li').forEach(item => {
        gsap.from(item, {
            scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none reset" },
            opacity: 0, duration: 0.5, ease: "power2.out"
        });
    });

    // Image/Video reveals
     gsap.utils.toArray('.tech-image-container, .video-showcase, .dashboard-image').forEach(media => {
        gsap.from(media, {
            scrollTrigger: { trigger: media, start: "top 85%", toggleActions: "play none none none" },
            scale: 0.95, opacity: 0, duration: 1, ease: "power3.out"
        });
    });

    // Content reveals alongside media
     gsap.utils.toArray('.tech-content, .monitoring-content, .dashboard-features').forEach(content => {
         gsap.from(content.children, { // Animate children individually
             scrollTrigger: { trigger: content, start: "top 80%", toggleActions: "play none none none" },
             y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
         });
     });

     // Tool card reveal
     gsap.from(".tool-card", {
         scrollTrigger: { trigger: '.tools-grid', start: "top 80%" },
         y: 50, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power2.out"
     });

     // Partner logo reveal
      gsap.from(".partner-logo", {
         scrollTrigger: { trigger: '.partners-grid', start: "top 85%" },
         y: 30, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power1.out"
     });
}


// Color Theme Switcher
function initThemeSwitcher() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const htmlElement = document.documentElement;
    const defaultTheme = 'orange'; // Set Vibrant Orange as the default

    // Check for saved theme color preference
    const savedTheme = localStorage.getItem('themeColor') || defaultTheme;

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
    const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '85', 10); // Use variable or default

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.startsWith('#!')) return;

            try {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open after clicking link
                     const navLinksContainer = document.querySelector('.nav-links-container');
                     if (navLinksContainer && navLinksContainer.classList.contains('active')) {
                        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                        navLinksContainer.classList.remove('active');
                        if (mobileMenuToggle) mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                        mobileMenuToggle.setAttribute('aria-expanded', 'false');
                        document.body.classList.remove('menu-open');
                        document.body.style.overflow = '';
                     }
                }
            } catch (error) {
                console.warn(`Smooth scroll target not found or invalid selector: ${href}`, error);
            }
        });
    });
}

// Active Nav Link Highlighting on Scroll
function initNavLinkHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a.nav-link');
    const headerOffset = 150; // Adjust offset as needed

    function changeLinkState() {
        let index = sections.length;

        while(--index && window.scrollY + headerOffset < sections[index].offsetTop) {}

        navLinks.forEach((link) => link.classList.remove('active'));
        // Ensure the corresponding link exists before adding class
        if (sections[index] && sections[index].id) {
             const activeLink = document.querySelector(`.nav-links a.nav-link[href="#${sections[index].id}"]`);
             if (activeLink) {
                 activeLink.classList.add('active');
             } else if (window.scrollY < sections[0].offsetTop - headerOffset) {
                 // If above the first section, activate the first link (usually Home)
                  const homeLink = document.querySelector('.nav-links a.nav-link[href="#home"]');
                  if(homeLink) homeLink.classList.add('active');
             }
        } else if (window.scrollY < (sections[0]?.offsetTop || window.innerHeight) - headerOffset) {
             // Fallback for being at the top before the first section
              const homeLink = document.querySelector('.nav-links a.nav-link[href="#home"]');
              if(homeLink) homeLink.classList.add('active');
        }
    }

    // Initial check in case the page loads scrolled
    changeLinkState();

    // Use throttle to limit scroll event frequency
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(changeLinkState, 50); // Adjust throttle delay
    });
}


// PDF Generator (Ensure libraries are loaded in HTML)
function initPDFGenerator() {
    const generatePDFBtn = document.getElementById('generate-pdf');
    const templateSource = document.getElementById('capability-statement-template');

    if (!generatePDFBtn || !templateSource || typeof Handlebars === 'undefined' || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
         if(generatePDFBtn) {
            generatePDFBtn.disabled = true;
            generatePDFBtn.style.opacity = '0.5';
            generatePDFBtn.style.cursor = 'not-allowed';
            generatePDFBtn.title = "PDF Generation requires external libraries.";
         }
         console.warn("PDF Generator dependencies missing (Handlebars, html2canvas, jsPDF) or template not found.");
        return;
    }

    generatePDFBtn.addEventListener('click', async function() {
        this.disabled = true;
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        try {
            // Compile the template
            const template = Handlebars.compile(templateSource.innerHTML);

            // Data (Could be fetched dynamically)
            // (Data from original request remains the same)
             const data = {
                accentColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#FF6600', // Get current accent color
                about: "MarineStream is dedicated to solving biofouling challenges through innovative hardware and blockchain technology, built on Rise-X's robust SaaS platform. We are the only organisation in Australia delivering a complete marine biosecurity compliance and biofouling management service.",
                capabilities: [ /* ... capabilities data ... */ ],
                technology: "The MarineStream™ In-water Cleaning System is the only in-water cleaning system compliant with the Australian In-Water Cleaning Standards, designed to enhance the hydrodynamic and acoustic performance of naval platforms.",
                techFeatures: [ /* ... techFeatures data ... */ ],
                certifications: [ /* ... certifications data ... */ ],
                contactEmail: "info@marinestream.com",
                contactPhone: "+61 8 9437 3900",
                contactAddress: "13 Possner Way, Henderson, WA 6166, Australia"
            };


            // Render HTML
            const htmlContent = template(data);

            // Create temporary div for rendering
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '840px'; // A4-ish width for rendering
            tempDiv.style.background = '#fff'; // Ensure white background
            document.body.appendChild(tempDiv);

            // Wait a moment for styles to apply (optional but can help)
            await new Promise(resolve => setTimeout(resolve, 100));

            // Generate Canvas
            const canvas = await html2canvas(tempDiv, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false, // Reduce console noise
                 backgroundColor: '#ffffff' // Explicit white background
            });

            // Create PDF
            const { jsPDF } = window.jspdf;
            // Use pt as units for better A4 mapping
            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasHeight / canvasWidth;

            const imgWidth = pdfWidth - 40; // Add some margin (20pt each side)
            const imgHeight = imgWidth * ratio;
            let heightLeft = imgHeight;
            let position = 20; // Initial top margin

            // Add image to first page
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 40); // Subtract usable page height

            // Add subsequent pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 20; // Calculate offset for next page's content
                pdf.addPage();
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 40);
            }

            // Save PDF
            pdf.save('MarineStream_Capability_Statement.pdf');

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please check console for details.");
        } finally {
            // Cleanup
            const tempDiv = document.querySelector('div[style*="left: -9999px"]');
             if (tempDiv && document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
             }
            generatePDFBtn.disabled = false;
            generatePDFBtn.innerHTML = originalText;
        }
    });
}


// === Hull Fouling Cost Calculator ===
function initHullFoulingCalculator() {
    const modal = document.getElementById('cost-calculator-modal');
    if (!modal) return;

    // Query elements within the modal context
    const vesselTypeSelect = modal.querySelector("#vesselTypeCalc");
    const costEcoInput = modal.querySelector("#costEco");
    const costFullInput = modal.querySelector("#costFull");
    const frSlider = modal.querySelector("#frSlider");
    const currencySelect = modal.querySelector("#currencySelect");
    const resultsText = modal.querySelector('#resultsText');
    const chartCanvas = modal.querySelector("#myChart");
    const rangeTicks = modal.querySelectorAll('.range-tick');
    const frLabel = modal.querySelector("#frLabel"); // Get FR Label element

    // Element checks
    if (!vesselTypeSelect || !costEcoInput || !costFullInput || !frSlider || !currencySelect || !resultsText || !chartCanvas || !frLabel || !rangeTicks.length) {
        console.error("One or more elements missing in Hull Fouling Cost Calculator.");
        // Optionally disable the calculator trigger button
        const triggerButton = document.getElementById('open-cost-calculator');
        if (triggerButton) {
            triggerButton.disabled = true;
            triggerButton.style.opacity = '0.5';
            triggerButton.title = "Calculator elements missing.";
        }
        return;
    }

    // --- Data & Config (Keep as before) ---
    const conversionRates = { AUD: 1, USD: 0.67, EUR: 0.63, GBP: 0.52 };
    const currencySymbols = { AUD: '$', USD: '$', EUR: '€', GBP: '£' };
    let currentCurrency = currencySelect.value || 'AUD';

    const vesselConfigs = {
        tug: { name: "Harbor Tug (32m)", ecoSpeed: 8, fullSpeed: 13, costEco: 600, costFull: 2160, waveExp: 4.5 },
        cruiseShip: { name: "Passenger Cruise Ship (93m)", ecoSpeed: 10, fullSpeed: 13.8, costEco: 1600, costFull: 4200, waveExp: 4.6 },
        osv: { name: "Offshore Supply Vessel (50m)", ecoSpeed: 10, fullSpeed: 14, costEco: 850, costFull: 3200, waveExp: 4.5 },
        coaster: { name: "Coastal Freighter (80m)", ecoSpeed: 11, fullSpeed: 15, costEco: 1200, costFull: 4800, waveExp: 4.6 }
    };
    const frData = {
        0: { pct: 0, desc: "Clean hull" }, 1: { pct: 15, desc: "Light slime" }, 2: { pct: 35, desc: "Medium slime" },
        3: { pct: 60, desc: "Heavy slime" }, 4: { pct: 95, desc: "Light calcareous" }, 5: { pct: 193, desc: "Heavy calcareous" }
    };
    let myChart = null; // Chart instance

    // --- Helper Functions (Keep as before, ensure robustness) ---
    function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        const rateFrom = conversionRates[fromCurrency];
        const rateTo = conversionRates[toCurrency];
        if (!rateFrom || !rateTo) return amount; // Handle missing rates
        const amountInAUD = amount / rateFrom;
        return amountInAUD * rateTo;
    }
    function solveAlphaBeta(costEco, costFull, ecoSpeed, fullSpeed, waveExp = 4.5) {
        // Ensure speeds are different to avoid division by zero in determinant
        if (Math.abs(ecoSpeed - fullSpeed) < 1e-6) return { alpha: 0, beta: 0 };
        const s1 = ecoSpeed, s2 = fullSpeed;
        const x1 = Math.pow(s1, 3), y1 = Math.pow(s1, waveExp);
        const x2 = Math.pow(s2, 3), y2 = Math.pow(s2, waveExp);
        const det = x1 * y2 - x2 * y1;
        if (Math.abs(det) < 1e-6) return { alpha: 0, beta: 0 };
        const alpha = (costEco * y2 - costFull * y1) / det;
        const beta = (costFull * x1 - costEco * x2) / det;
         // Add sanity check: alpha and beta should generally be non-negative
        return { alpha: Math.max(0, alpha), beta: Math.max(0, beta) };
    }
    function formatCurrency(value) {
         if (isNaN(value)) return 'N/A'; // Handle invalid numbers
         try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentCurrency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
         } catch (e) {
             console.error("Currency formatting error:", e);
             return `${currencySymbols[currentCurrency] || '$'}${Math.round(value)}`; // Fallback
         }
    }
     function calculateExtraCO2(extraCost, vesselTypeKey) {
         const extraCostAUD = convertCurrency(extraCost, currentCurrency, 'AUD');
         // Use vessel specific factors or a default
         let emissionFactor = 1.45; // Default kg CO2 per $AUD extra fuel (Placeholder value)
         if (vesselTypeKey === 'cruiseShip') emissionFactor = 1.41; // Example factor based on Coral Adventurer
         else if (vesselTypeKey === 'tug') emissionFactor = 1.36; // Example factor based on RT Tug
         return extraCostAUD * emissionFactor;
     }
     function getValidationStatus(vesselTypeKey, frLevel, speed) {
        const vessel = vesselConfigs[vesselTypeKey];
        if (!vessel) return { validated: false, message: "" };
        // Example validation conditions
        if (vesselTypeKey === 'cruiseShip' && frLevel === 5 && Math.abs(speed - vessel.fullSpeed) < 0.5) {
            return { validated: true, message: "Values validated by UoM Coral Adventurer study" };
        } else if (vesselTypeKey === 'tug' && frLevel === 4 && Math.abs(speed - vessel.fullSpeed) < 0.5) {
            return { validated: true, message: "Values validated by UoM Rio Tinto tug study" };
        }
        return { validated: false, message: "" };
    }

    // --- Main Update Function ---
    function updateCalculator() {
        const vesselTypeKey = vesselTypeSelect.value;
        const vessel = vesselConfigs[vesselTypeKey];
        if (!vessel) return;

        // Use default if input is invalid or empty
        let costEcoInputVal = parseFloat(costEcoInput.value);
        let costFullInputVal = parseFloat(costFullInput.value);
        if (isNaN(costEcoInputVal) || costEcoInputVal <= 0) costEcoInputVal = convertCurrency(vessel.costEco, 'AUD', currentCurrency);
        if (isNaN(costFullInputVal) || costFullInputVal <= 0) costFullInputVal = convertCurrency(vessel.costFull, 'AUD', currentCurrency);

        // Ensure full speed cost is greater than eco speed cost
        if (costFullInputVal <= costEcoInputVal) {
            // Maybe show a warning, for now just use default ratio if inputs are illogical
             costFullInputVal = costEcoInputVal * (vessel.costFull / vessel.costEco);
        }


        // Convert input costs to AUD for internal calculations
        const costEcoAUD = convertCurrency(costEcoInputVal, currentCurrency, 'AUD');
        const costFullAUD = convertCurrency(costFullInputVal, currentCurrency, 'AUD');

        const frLevel = parseInt(frSlider.value) || 0;
        const { pct: frPct } = frData[frLevel] || frData[0]; // Fallback to FR0 if data missing
        const frLevelText = `FR${frLevel}`;
        if (frLabel) frLabel.textContent = frLevelText;

        // Adjust speed range based on vessel
        const minSpeed = Math.max(vessel.ecoSpeed - 5, 3); // Ensure min speed >= 3
        const maxSpeed = vessel.fullSpeed + 3;
        const stepSize = (maxSpeed - minSpeed) > 10 ? 0.5 : 0.25;

        const { alpha, beta } = solveAlphaBeta(costEcoAUD, costFullAUD, vessel.ecoSpeed, vessel.fullSpeed, vessel.waveExp);

        // Generate data points for chart
        const speeds = [];
        const cleanCosts = [];
        const fouledCosts = [];
        const co2Emissions = [];

        for (let s = minSpeed; s <= maxSpeed; s += stepSize) {
            const frictionAUD = alpha * Math.pow(s, 3);
            const waveAUD = beta * Math.pow(s, vessel.waveExp);
            const costCleanAUD = Math.max(0, frictionAUD + waveAUD);

            const frictionFouledAUD = frictionAUD * (1 + frPct / 100);
            const costFouledAUD = Math.max(0, frictionFouledAUD + waveAUD);

            const extraCostFouled = costFouledAUD - costCleanAUD; // Extra cost in current currency
            const extraCO2 = calculateExtraCO2(convertCurrency(extraCostFouled, currentCurrency, 'AUD'), vesselTypeKey); // Calculate CO2 based on AUD cost

            speeds.push(s.toFixed(1));
            cleanCosts.push(convertCurrency(costCleanAUD, 'AUD', currentCurrency));
            fouledCosts.push(convertCurrency(costFouledAUD, 'AUD', currentCurrency));
            co2Emissions.push(extraCO2 > 0 ? extraCO2 : 0); // Ensure non-negative CO2
        }

        // Update Chart
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        const accentDark = getComputedStyle(document.documentElement).getPropertyValue('--accent-dark').trim();
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

        if (myChart) myChart.destroy();
        const ctx = chartCanvas.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: speeds,
                datasets: [
                    { label: 'Clean Hull (FR0)', data: cleanCosts, borderColor: '#3F87F5', backgroundColor: 'rgba(63, 135, 245, 0.1)', fill: false, tension: 0.2, yAxisID: 'y', borderWidth: 2.5 }, // Blue for clean
                    { label: `Fouled Hull (${frLevelText})`, data: fouledCosts, borderColor: accentColor, backgroundColor: `${accentColor}1A`, fill: false, tension: 0.2, yAxisID: 'y', borderWidth: 2.5 }, // Orange for fouled
                    { label: 'Additional CO₂ Emissions', data: co2Emissions, borderColor: '#1DC9B7', backgroundColor: 'rgba(29, 201, 183, 0.1)', fill: false, tension: 0.2, yAxisID: 'y1', borderDash: [6, 3], borderWidth: 2 } // Green dashed for CO2
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, color: textColor } },
                    tooltip: {
                        mode: 'index', intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { weight: 'bold' }, bodySpacing: 4, padding: 10, cornerRadius: 4,
                        callbacks: {
                             label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) {
                                     if (context.dataset.yAxisID === 'y1') { // CO2
                                         label += `${context.parsed.y.toFixed(1)} kg/hr`;
                                     } else { // Cost
                                         label += formatCurrency(context.parsed.y) + '/hr';
                                     }
                                }
                                return label;
                             }
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Speed (knots)', padding: { top: 10 }, color: textColor, font: { weight: '600' } }, ticks: { padding: 5, color: textColor }, grid: { color: gridColor, drawTicks: false } },
                    y: { // Cost Axis
                         type: 'linear', display: true, position: 'left',
                         title: { display: true, text: `Operating Cost (${currencySymbols[currentCurrency]}/hr)`, padding: { bottom: 10 }, color: textColor, font: { weight: '600' } },
                         beginAtZero: true, ticks: { padding: 5, color: textColor, callback: value => formatCurrency(value) },
                         grid: { color: gridColor, drawTicks: false }
                    },
                    y1: { // CO2 Axis
                        type: 'linear', display: true, position: 'right',
                        title: { display: true, text: 'Additional CO₂ (kg/hr)', padding: { bottom: 10 }, color: textColor, font: { weight: '600' } },
                        beginAtZero: true, ticks: { padding: 5, color: textColor, callback: value => value.toFixed(1) },
                        grid: { drawOnChartArea: false } // Only show ticks for this axis
                    }
                }
            }
        });

        // Calculate costs at specific speeds for results text
        function costAt(speed) {
            const frictionAUD = alpha * Math.pow(speed, 3);
            const waveAUD = beta * Math.pow(speed, vessel.waveExp);
            const cleanAUD = Math.max(0, frictionAUD + waveAUD);
            const fouledAUD = Math.max(0, frictionAUD * (1 + frPct / 100) + waveAUD);
            const validation = getValidationStatus(vesselTypeKey, frLevel, speed);
            const extraCost = convertCurrency(fouledAUD - cleanAUD, 'AUD', currentCurrency);
             const extraCO2 = calculateExtraCO2(convertCurrency(extraCost, currentCurrency, 'AUD'), vesselTypeKey); // Use AUD cost for CO2 calc
            return {
                clean: convertCurrency(cleanAUD, 'AUD', currentCurrency),
                fouled: convertCurrency(fouledAUD, 'AUD', currentCurrency),
                increasePct: cleanAUD > 0 ? ((fouledAUD - cleanAUD) / cleanAUD * 100).toFixed(1) : 0,
                extraCost: extraCost,
                extraCO2: extraCO2 > 0 ? extraCO2 : 0,
                validation: validation
            };
        }

        const cEco = costAt(vessel.ecoSpeed);
        const cFull = costAt(vessel.fullSpeed);

        // Annual impact calculation
        const annualHours = 12 * 200; // Example operational hours
        const annualExtraCost = cFull.extraCost * annualHours;
        const annualExtraCO2 = cFull.extraCO2 * annualHours / 1000; // Convert kg to tonnes

        // Update Results Text
        resultsText.innerHTML = `
            <div class="result-item"><span class="result-label">Vessel Type:</span><span class="result-value">${vessel.name}</span></div>

            <div class="result-group">
                <div class="result-group-header"><i class="fas fa-tachometer-alt"></i>Economic Speed (${vessel.ecoSpeed} kts)</div>
                <div class="result-item"><span class="result-label">Clean Hull Cost:</span><span class="result-value">${formatCurrency(cEco.clean)}/hr</span></div>
                <div class="result-item"><span class="result-label">Fouled (${frLevelText}) Cost:</span><span class="result-value">${formatCurrency(cEco.fouled)}/hr</span></div>
                <div class="result-item"><span class="result-label">Cost Increase (%):</span><span class="result-value">${cEco.increasePct}%</span></div>
                 <div class="result-item"><span class="result-label">Add. CO₂:</span><span class="result-value">${cEco.extraCO2.toFixed(1)} kg/hr</span></div>
            </div>

            <div class="result-group">
                 <div class="result-group-header"><i class="fas fa-rocket"></i>Full Speed (${vessel.fullSpeed} kts)</div>
                <div class="result-item"><span class="result-label">Clean Hull Cost:</span><span class="result-value">${formatCurrency(cFull.clean)}/hr</span></div>
                <div class="result-item"><span class="result-label">Fouled (${frLevelText}) Cost:</span><span class="result-value">${formatCurrency(cFull.fouled)}/hr</span></div>
                <div class="result-item"><span class="result-label">Cost Increase (%):</span><span class="result-value">${cFull.increasePct}%</span></div>
                <div class="result-item"><span class="result-label">Add. CO₂:</span><span class="result-value">${cFull.extraCO2.toFixed(1)} kg/hr</span></div>
                 ${cFull.validation.validated ? `<div class="validation-badge"><i class="fas fa-check-circle"></i><span>${cFull.validation.message}</span></div>` : ''}
            </div>

             <div class="result-group">
                 <div class="result-group-header"><i class="fas fa-calendar-alt"></i>Estimated Annual Impact</div>
                 <div class="result-item"><span class="result-label">Basis:</span><span class="result-value">${annualHours} hrs/yr @ Full Speed</span></div>
                 <div class="result-item"><span class="result-label">Add. Fuel Cost:</span><span class="result-value">${formatCurrency(annualExtraCost)}</span></div>
                 <div class="result-item"><span class="result-label">Add. CO₂ Emissions:</span><span class="result-value">${annualExtraCO2.toFixed(1)} tonnes</span></div>
            </div>
        `;

        // Highlight active tick
        rangeTicks.forEach(tick => {
            tick.classList.toggle('active-tick', parseInt(tick.dataset.value) === frLevel);
        });
    }

    // Initialize vessel fields based on selection and currency
    function initializeVesselFields() {
        const vesselTypeKey = vesselTypeSelect.value;
        const vessel = vesselConfigs[vesselTypeKey];
        if (!vessel) return;
        // Convert default AUD costs to the currently selected currency for display
        costEcoInput.value = Math.round(convertCurrency(vessel.costEco, 'AUD', currentCurrency));
        costFullInput.value = Math.round(convertCurrency(vessel.costFull, 'AUD', currentCurrency));
    }

    // --- Event Listeners ---
    vesselTypeSelect.addEventListener("change", () => {
        initializeVesselFields(); // Reset costs when vessel changes
        updateCalculator();
    });
    // Update on input blur or change for better performance than 'input'
    costEcoInput.addEventListener("change", updateCalculator);
    costFullInput.addEventListener("change", updateCalculator);
    frSlider.addEventListener("input", updateCalculator); // Slider needs 'input' for live update

    currencySelect.addEventListener("change", function() {
        const newCurrency = this.value;
        if (newCurrency === currentCurrency) return;

        // Convert current input values FROM old currency TO new currency
        const costEcoCurrent = parseFloat(costEcoInput.value) || 0;
        const costFullCurrent = parseFloat(costFullInput.value) || 0;
        costEcoInput.value = Math.round(convertCurrency(costEcoCurrent, currentCurrency, newCurrency));
        costFullInput.value = Math.round(convertCurrency(costFullCurrent, currentCurrency, newCurrency));

        // Update global currency state AFTER converting displayed values
        currentCurrency = newCurrency;

        // Recalculate everything with new currency context
        updateCalculator();
    });

    // Make ticks clickable
    rangeTicks.forEach(tick => {
        tick.addEventListener('click', function() {
            frSlider.value = this.dataset.value;
            // Manually trigger input event for slider to update visuals immediately
            frSlider.dispatchEvent(new Event('input', { bubbles: true }));
            // updateCalculator(); // Already called by the input event listener
        });
    });

    // --- Initial Setup ---
    initializeVesselFields(); // Set initial costs based on default vessel and currency
    updateCalculator(); // Perform initial calculation and chart render
}


// === Biofouling Management Plan Generator ===
function initBiofoulingPlanGenerator() {
    const modal = document.getElementById('plan-generator-modal');
    if (!modal) return;

    // --- Element Cache --- (Query within modal context)
    const elements = {
        tabButtons: modal.querySelectorAll('.tab-btn'),
        tabPanes: modal.querySelectorAll('.tab-pane'),
        nextButtons: modal.querySelectorAll('.next-tab'),
        prevButtons: modal.querySelectorAll('.prev-tab'),
        diverCountSelect: modal.querySelector('#diverCount'),
        diverFieldsContainer: modal.querySelector('#diverFields'),
        componentItems: modal.querySelectorAll('.component-item'),
        componentDetailsContainer: modal.querySelector('#component-details'),
        selectComponentMsg: modal.querySelector('.select-component-message'),
        componentForm: modal.querySelector('.component-form'),
        componentTitle: modal.querySelector('#component-title'),
        componentComments: modal.querySelector('#component-comments'),
        foulingRating: modal.querySelector('#fouling-rating'),
        foulingCoverage: modal.querySelector('#fouling-coverage'),
        pdrRating: modal.querySelector('#pdr-rating'),
        componentPhotoInput: modal.querySelector('#component-photo'),
        photoPreview: modal.querySelector('#photo-preview'),
        saveComponentButton: modal.querySelector('#save-component'),
        signatureCanvas: modal.querySelector('#signaturePad'),
        clearSignatureButton: modal.querySelector('#clearSignature'),
        coverPhotoInput: modal.querySelector('#coverPhoto'),
        coverPreviewContainer: modal.querySelector('#cover-preview'),
        previewReportButton: modal.querySelector('#preview-report'),
        generateReportButton: modal.querySelector('#generate-report'),
        // Report Preview Modal Elements
        reportPreviewModal: document.getElementById('report-preview-modal'), // Note: Outside generator modal
        reportPreviewContainer: document.getElementById('report-preview-container'),
        downloadReportButton: document.getElementById('download-report'),
        closePreviewButton: document.getElementById('close-preview'),
         // Generator Form Inputs (for data collection) - Add IDs if missing in HTML
         vesselName: modal.querySelector('#vesselName'),
         imo: modal.querySelector('#imo'),
         vesselTypeGen: modal.querySelector('#vesselTypeGen'),
         vesselCommissioned: modal.querySelector('#vesselCommissioned'),
         grossTonnage: modal.querySelector('#grossTonnage'),
         length: modal.querySelector('#length'),
         beam: modal.querySelector('#beam'),
         vesselDraft: modal.querySelector('#vesselDraft'),
         operatingArea: modal.querySelector('#operatingArea'),
         antifoulingDate: modal.querySelector('#antifoulingDate'),
         inspectionDate: modal.querySelector('#inspectionDate'),
         inspectionLocation: modal.querySelector('#inspectionLocation'),
         visibility: modal.querySelector('#visibility'),
         inspector: modal.querySelector('#inspector'),
         clientDetails: modal.querySelector('#clientDetails'),
         clientRep: modal.querySelector('#clientRep'),
         supervisor: modal.querySelector('#supervisor'),
         methodologyText: modal.querySelector('#methodologyText'),
         summaryText: modal.querySelector('#summaryText'),
         recommendationsText: modal.querySelector('#recommendationsText'),
         declaration: modal.querySelector('#declaration'),
         reportTitle: modal.querySelector('#reportTitle'),
         documentNumber: modal.querySelector('#documentNumber'),
         documentRevision: modal.querySelector('#documentRevision'),
         reportFormat: modal.querySelector('#reportFormat'),
    };

    // Basic check for essential elements
    if (!elements.tabButtons.length || !elements.tabPanes.length || !elements.componentItems.length || !elements.componentForm || !elements.signatureCanvas || !elements.reportPreviewModal) {
        console.error("One or more critical elements missing in Plan Generator modal or preview modal.");
         const triggerButton = document.getElementById('open-plan-generator');
         if (triggerButton) {
             triggerButton.disabled = true;
             triggerButton.style.opacity = '0.5';
             triggerButton.title = "Generator elements missing.";
         }
        return;
    }

    let componentData = {}; // Store component details { id: { comments: '', ..., photos: [dataURL,...] } }
    let signaturePadInstance = null;
    let currentActiveComponent = null; // Track which component is being edited

    // --- Tab Navigation ---
    function switchTab(targetTabId) {
        elements.tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === targetTabId));
        elements.tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === targetTabId));
        // Scroll to top of modal body on tab switch
        const modalBody = modal.querySelector('.modal-body');
        if(modalBody) modalBody.scrollTop = 0;
    }
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    elements.nextButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.next));
    });
    elements.prevButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.prev));
    });

    // --- Diver Fields ---
    function updateDiverFields() {
        if (!elements.diverCountSelect || !elements.diverFieldsContainer) return;
        const count = parseInt(elements.diverCountSelect.value) || 0;
        elements.diverFieldsContainer.innerHTML = ''; // Clear existing
        for (let i = 1; i <= count; i++) {
            // Use unique IDs and labels
            const field = document.createElement('div');
            field.className = 'form-group'; // Reuse form-group styling
            field.innerHTML = `<label for="diver${i}_gen">Diver ${i} Name:</label><input type="text" id="diver${i}_gen" class="form-control">`;
            elements.diverFieldsContainer.appendChild(field);
        }
    }
    if (elements.diverCountSelect) {
        elements.diverCountSelect.addEventListener('change', updateDiverFields);
        updateDiverFields(); // Initial call
    }

    // --- Component Selection & Data Handling ---
    function loadComponentDetails(componentId) {
        if (!elements.componentDetailsContainer || !elements.componentForm || !elements.selectComponentMsg || !elements.componentTitle) return;

        currentActiveComponent = componentId; // Set current component

        elements.selectComponentMsg.style.display = 'none';
        elements.componentForm.style.display = 'block';

        const componentItem = modal.querySelector(`.component-item[data-id="${componentId}"]`);
        const componentName = componentItem?.querySelector('.component-name')?.textContent || componentId;
        elements.componentTitle.textContent = componentName;

        // Load existing data or set defaults
        const data = componentData[componentId] || {};
        elements.componentComments.value = data.comments || '';
        elements.foulingRating.value = data.foulingRating || 'FR0'; // Default value
        elements.foulingCoverage.value = data.foulingCoverage || '0%'; // Default value
        elements.pdrRating.value = data.pdrRating || 'PDR10'; // Default value
        elements.componentPhotoInput.value = ''; // Clear file input always

        // Render photo previews
        elements.photoPreview.innerHTML = '';
        if (data.photos && data.photos.length > 0) {
            data.photos.forEach((photoSrc, index) => {
                const imgContainer = document.createElement('div');
                imgContainer.style.position = 'relative';
                const img = document.createElement('img');
                img.src = photoSrc;
                img.alt = `${componentName} photo ${index + 1}`;
                imgContainer.appendChild(img);

                // Add delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '&times;';
                deleteBtn.style.position = 'absolute';
                deleteBtn.style.top = '2px';
                deleteBtn.style.right = '2px';
                deleteBtn.style.background = 'rgba(255,0,0,0.7)';
                deleteBtn.style.color = 'white';
                deleteBtn.style.border = 'none';
                deleteBtn.style.borderRadius = '50%';
                deleteBtn.style.width = '20px';
                deleteBtn.style.height = '20px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.lineHeight = '20px';
                deleteBtn.style.fontSize = '14px';
                deleteBtn.onclick = () => removeComponentPhoto(componentId, index);
                imgContainer.appendChild(deleteBtn);

                elements.photoPreview.appendChild(imgContainer);
            });
        }
         // Reset save button state
         elements.saveComponentButton.textContent = "Save Component";
         elements.saveComponentButton.disabled = false;
    }

    function saveComponentDetails() {
        if (!currentActiveComponent || !elements.saveComponentButton) return;

        const componentId = currentActiveComponent;
        if (!componentData[componentId]) componentData[componentId] = { photos: [] }; // Ensure photos array exists

        // Update data from form fields
        componentData[componentId].comments = elements.componentComments.value;
        componentData[componentId].foulingRating = elements.foulingRating.value;
        componentData[componentId].foulingCoverage = elements.foulingCoverage.value;
        componentData[componentId].pdrRating = elements.pdrRating.value;

        const photoFiles = elements.componentPhotoInput.files;

        // Handle multiple file uploads using Promise.all for async reading
        const fileReadPromises = [];
        if (photoFiles.length > 0) {
            for (let i = 0; i < photoFiles.length; i++) {
                const file = photoFiles[i];
                // Basic validation (type and size)
                 if (!file.type.startsWith('image/')) {
                     alert(`File "${file.name}" is not a valid image.`);
                     continue;
                 }
                 if (file.size > 5 * 1024 * 1024) { // 5MB limit
                     alert(`File "${file.name}" is too large (max 5MB).`);
                     continue;
                 }

                fileReadPromises.push(new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Check if photo already exists (simple check by data URL length)
                        const newDataUrl = e.target.result;
                        if (!componentData[componentId].photos.some(existing => existing.length === newDataUrl.length)) {
                             componentData[componentId].photos.push(newDataUrl);
                        }
                        resolve(); // Resolve promise after adding photo
                    };
                    reader.onerror = (error) => {
                         console.error("Error reading file:", error);
                         alert(`Error reading file ${file.name}.`);
                         reject(error); // Reject promise on error
                    }
                    reader.readAsDataURL(file);
                }));
            }
        }

        // Wait for all files to be read before updating UI and resetting
        elements.saveComponentButton.textContent = "Saving...";
        elements.saveComponentButton.disabled = true;

        Promise.all(fileReadPromises).then(() => {
            // All files processed, reload details to show new photos
            loadComponentDetails(componentId); // This resets the button state too
            elements.componentPhotoInput.value = ''; // Clear file input after processing

             // Add visual indicator of saved state on the component list item
            const listItem = modal.querySelector(`.component-item[data-id="${componentId}"]`);
            if (listItem) {
                let savedIndicator = listItem.querySelector('.saved-indicator');
                if (!savedIndicator) {
                    savedIndicator = document.createElement('i');
                    savedIndicator.className = 'fas fa-check-circle saved-indicator';
                    savedIndicator.style.color = 'var(--success)';
                    savedIndicator.style.marginLeft = '8px';
                    savedIndicator.style.fontSize = '0.8em';
                    listItem.appendChild(savedIndicator);
                }
            }

        }).catch(error => {
            console.error("Error processing photos:", error);
             elements.saveComponentButton.textContent = "Save Failed";
             setTimeout(() => { // Reset after a delay
                  elements.saveComponentButton.textContent = "Save Component";
                  elements.saveComponentButton.disabled = false;
             }, 2000);
        });
    }

    function removeComponentPhoto(componentId, index) {
        if (componentData[componentId] && componentData[componentId].photos[index]) {
            componentData[componentId].photos.splice(index, 1); // Remove photo from array
            loadComponentDetails(componentId); // Reload details to update preview
        }
    }

    elements.componentItems.forEach(item => {
        item.addEventListener('click', function() {
            elements.componentItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            loadComponentDetails(this.dataset.id);
        });
    });

    if (elements.saveComponentButton) {
        elements.saveComponentButton.addEventListener('click', saveComponentDetails);
    }

    // --- Signature Pad --- (Using simplified canvas drawing)
    function initSignaturePadLib(canvasElement) {
        // Check if already initialized
        if (canvasElement.signaturePadInstance) {
            return canvasElement.signaturePadInstance;
        }

         const ctx = canvasElement.getContext('2d');
         let isDrawing = false;
         let lastX = 0;
         let lastY = 0;
         let hasDrawing = false; // Flag to track if anything was drawn

         // Function to resize canvas maintaining drawing (optional but good for responsiveness)
         function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvasElement.width = canvasElement.offsetWidth * ratio;
            canvasElement.height = canvasElement.offsetHeight * ratio;
            ctx.scale(ratio, ratio);
             clearPad(false); // Clear without resetting hasDrawing flag if needed
             // Could potentially redraw previous strokes here if stored
         }
         // window.addEventListener('resize', resizeCanvas); // Add resize listener if needed
         // resizeCanvas(); // Initial resize

         function clearPad(resetFlag = true) {
             ctx.fillStyle = 'white'; // Ensure background is white
             ctx.fillRect(0, 0, canvasElement.width / (window.devicePixelRatio || 1), canvasElement.height / (window.devicePixelRatio || 1));
             ctx.lineWidth = 2;
             ctx.strokeStyle = 'black';
             if (resetFlag) hasDrawing = false;
         }
         clearPad(); // Initial clear


         function getCoords(e) {
             e.preventDefault(); // Prevent scrolling on touch
             const rect = canvasElement.getBoundingClientRect();
             const scaleX = canvasElement.width / (window.devicePixelRatio || 1) / rect.width;
             const scaleY = canvasElement.height / (window.devicePixelRatio || 1) / rect.height;
             const clientX = e.clientX ?? e.touches?.[0]?.clientX;
             const clientY = e.clientY ?? e.touches?.[0]?.clientY;
             if (clientX === undefined || clientY === undefined) return null;
             return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
         }

         function startDrawing(e) {
              const coords = getCoords(e);
              if (!coords) return;
              isDrawing = true;
              [lastX, lastY] = [coords.x, coords.y];
              ctx.beginPath(); // Start new path segment
              ctx.moveTo(lastX, lastY);
          }

          function draw(e) {
              if (!isDrawing) return;
              const coords = getCoords(e);
              if (!coords) return;
              hasDrawing = true; // Mark as drawn
              ctx.lineTo(coords.x, coords.y);
              ctx.stroke();
              [lastX, lastY] = [coords.x, coords.y];
          }

          function stopDrawing() {
              if (!isDrawing) return;
              isDrawing = false;
               // ctx.closePath(); // Close the path if needed, usually not for freehand
          }

         // Event Listeners
         canvasElement.addEventListener('mousedown', startDrawing);
         canvasElement.addEventListener('mousemove', draw);
         canvasElement.addEventListener('mouseup', stopDrawing);
         canvasElement.addEventListener('mouseout', stopDrawing);
         canvasElement.addEventListener('touchstart', startDrawing, { passive: false });
         canvasElement.addEventListener('touchmove', draw, { passive: false });
         canvasElement.addEventListener('touchend', stopDrawing);
         canvasElement.addEventListener('touchcancel', stopDrawing);

         const instance = {
             clear: () => clearPad(true),
             toDataURL: (type = 'image/png', quality) => hasDrawing ? canvasElement.toDataURL(type, quality) : null, // Return null if empty
             isEmpty: () => !hasDrawing
         };
         canvasElement.signaturePadInstance = instance; // Store instance on element
         return instance;
     }
    if (elements.signatureCanvas) {
        signaturePadInstance = initSignaturePadLib(elements.signatureCanvas);
    }
    if (elements.clearSignatureButton && signaturePadInstance) {
        elements.clearSignatureButton.addEventListener('click', () => signaturePadInstance.clear());
    }

    // --- Cover Photo Preview ---
    if (elements.coverPhotoInput && elements.coverPreviewContainer) {
        elements.coverPhotoInput.addEventListener('change', function() {
            elements.coverPreviewContainer.innerHTML = ''; // Clear preview
            if (this.files && this.files[0]) {
                const file = this.files[0];
                 if (!file.type.startsWith('image/')) {
                    alert("Please select a valid image file for the cover photo.");
                    this.value = ''; // Clear invalid selection
                    return;
                 }
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = "Cover photo preview";
                    img.style.maxWidth = '200px'; // Limit preview size
                    img.style.maxHeight = '150px';
                    img.style.borderRadius = 'var(--radius-sm)';
                    elements.coverPreviewContainer.appendChild(img);
                };
                reader.onerror = () => alert("Error reading cover photo file.");
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Report Generation & Preview ---
    function collectReportData() {
         const getValue = (element, defaultValue = 'N/A') => element?.value?.trim() || defaultValue;
         const getSelectText = (element, defaultValue = 'N/A') => element ? element.options[element.selectedIndex]?.text : defaultValue;

         let signatureDataURL = signaturePadInstance?.toDataURL();
         let coverPhotoDataURL = elements.coverPreviewContainer?.querySelector('img')?.src || null;

         // Collect diver names
         const diverCount = parseInt(elements.diverCountSelect?.value || 0);
         const divers = Array.from({ length: diverCount }, (_, i) => {
             const input = modal.querySelector(`#diver${i+1}_gen`);
             return getValue(input, `Diver ${i+1}`);
         });

         return {
             vesselName: getValue(elements.vesselName, 'Unnamed Vessel'),
             imo: getValue(elements.imo),
             vesselType: getSelectText(elements.vesselTypeGen),
             commissioned: getValue(elements.vesselCommissioned),
             grossTonnage: getValue(elements.grossTonnage),
             length: getValue(elements.length),
             beam: getValue(elements.beam),
             draft: getValue(elements.vesselDraft),
             operationalArea: getSelectText(elements.operatingArea),
             lastAntifouling: formatDate(getValue(elements.antifoulingDate, null)), // Format date

             inspectionDate: formatDate(getValue(elements.inspectionDate, new Date().toISOString().slice(0, 10))), // Format date
             inspectionLocation: getValue(elements.inspectionLocation),
             visibility: getValue(elements.visibility),
             inspector: getValue(elements.inspector, 'Unspecified Inspector'),
             clientDetails: getValue(elements.clientDetails),
             clientRep: getValue(elements.clientRep),
             supervisor: getValue(elements.supervisor),
             divers: divers,
             methodology: getValue(elements.methodologyText, 'Standard visual and tactile inspection methods employed.'),

             components: componentData, // Use the stored object with photos

             summary: getValue(elements.summaryText, 'No summary provided.'),
             recommendations: getValue(elements.recommendationsText, 'No specific recommendations provided.'),
             declaration: getValue(elements.declaration).replace('[Inspector Name]', getValue(elements.inspector, 'Inspector')), // Replace placeholder
             signature: signatureDataURL,

             title: getValue(elements.reportTitle, 'Biofouling Inspection Report'),
             coverPhoto: coverPhotoDataURL,
             documentNumber: getValue(elements.documentNumber, `MS-RPT-${new Date().getFullYear()}-XXXX`),
             documentRevision: getValue(elements.documentRevision, '0'),
             reportFormat: getSelectText(elements.reportFormat, 'Full Report')
         };
    }

    // Generate simplified HTML for the modal preview
    function generateReportPreviewContent() {
        if (!elements.reportPreviewModal || !elements.reportPreviewContainer) return;
        const data = collectReportData();

        // Generate simplified component list for preview
        const componentsPreviewHTML = Object.entries(data.components).map(([id, compData]) => {
             const name = modal.querySelector(`.component-item[data-id="${id}"] .component-name`)?.textContent || id;
             const photoCount = compData.photos?.length || 0;
             return `<li><strong>${name}:</strong> ${compData.foulingRating || 'N/A'} (${compData.foulingCoverage || 'N/A'}). ${compData.comments || 'No comments.'} ${photoCount > 0 ? `(${photoCount} photo${photoCount > 1 ? 's' : ''})` : ''}</li>`;
         }).join('');

        elements.reportPreviewContainer.innerHTML = `
            <h1 style="text-align: center;">${data.title}</h1>
            ${data.coverPhoto ? `<div style="text-align:center; margin-bottom: 1em;"><img src="${data.coverPhoto}" alt="Cover Photo" style="max-width: 50%; max-height: 200px; border: 1px solid #eee;"></div>` : ''}
            <h2>Vessel: ${data.vesselName} (IMO: ${data.imo})</h2>
            <p><strong>Inspection Date:</strong> ${data.inspectionDate} | <strong>Location:</strong> ${data.inspectionLocation}</p>
            <hr>
            <h3>Executive Summary</h3>
            <p>${data.summary.replace(/\n/g, '<br>')}</p>
            <h3>Components Overview</h3>
            ${componentsPreviewHTML ? `<ul>${componentsPreviewHTML}</ul>` : '<p>No component data entered.</p>'}
            <h3>Recommendations</h3>
            <p>${data.recommendations.replace(/\n/g, '<br>')}</p>
            ${data.signature ? `<h3>Signature</h3><div class="signature"><img src="${data.signature}" alt="Signature"></div><p>${data.inspector}</p>` : '<h3>Signature</h3><p>Not Provided</p>'}
        `;
        openModal(elements.reportPreviewModal); // Use openModal function
    }

    // Generate full HTML content for download/printing
     function generateFinalReportHTML() {
         const data = collectReportData();
         const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#FF6600';

         const componentsHTML = Object.entries(data.components).map(([id, compData]) => {
             const name = modal.querySelector(`.component-item[data-id="${id}"] .component-name`)?.textContent || id;
             const photosHTML = (compData.photos || [])
                 .map(src => `<img src="${src}" alt="${name} photo" style="width: 180px; height: auto; margin: 5px; border: 1px solid #eee; border-radius: 3px; vertical-align: top;">`)
                 .join('');
             return `
                 <div class="component" style="border: 1px solid #ddd; padding: 12px; margin-bottom: 15px; border-radius: 4px; page-break-inside: avoid;">
                     <h4 style="margin: 0 0 8px 0; font-size: 1.1em; color: #111; border-bottom: 1px solid #eee; padding-bottom: 4px;">${name}</h4>
                     <table style="font-size: 9pt; margin-bottom: 8px; border: none;">
                         <tr>
                             <td style="border: none; padding: 2px 5px 2px 0; font-weight: bold;">Observations:</td>
                             <td style="border: none; padding: 2px 0;">${compData.comments?.replace(/\n/g, '<br>') || 'N/A'}</td>
                         </tr>
                         <tr>
                              <td style="border: none; padding: 2px 5px 2px 0; font-weight: bold;">Fouling:</td>
                              <td style="border: none; padding: 2px 0;">${compData.foulingRating || 'N/A'} (${compData.foulingCoverage || 'N/A'})</td>
                          </tr>
                          <tr>
                              <td style="border: none; padding: 2px 5px 2px 0; font-weight: bold;">Paint:</td>
                              <td style="border: none; padding: 2px 0;">${compData.pdrRating || 'N/A'}</td>
                          </tr>
                     </table>
                     ${photosHTML ? `<div style="margin-top: 10px;"><strong>Photos:</strong><br>${photosHTML}</div>` : ''}
                 </div>`;
         }).join('');


         return `
             <!DOCTYPE html>
             <html lang="en">
             <head>
                 <meta charset="UTF-8">
                 <title>${data.title} - ${data.vesselName}</title>
                 <style>
                     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                     body { font-family: 'Inter', Arial, sans-serif; margin: 40pt; font-size: 10pt; line-height: 1.4; color: #333; }
                     @page { margin: 40pt; }
                     h1, h2, h3, h4 { color: #111; margin: 1.6em 0 0.6em 0; font-weight: 600; }
                     h1 { font-size: 20pt; text-align: center; margin-top: 0; color: ${accentColor}; }
                     h2 { font-size: 14pt; border-bottom: 1.5px solid ${accentColor}; padding-bottom: 4px; font-weight: 700;}
                     h3 { font-size: 12pt; font-weight: 700; }
                     h4 { font-size: 11pt; font-weight: 600;}
                     p { margin: 0 0 0.9em 0; }
                     table { width: 100%; border-collapse: collapse; margin-bottom: 1.2em; font-size: 9pt; }
                     th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top;}
                     th { background-color: #f0f0f0; font-weight: bold; }
                     .page-break { page-break-after: always; }
                     .cover-page { text-align: center; margin-bottom: 3em; }
                     .cover-page img { max-width: 70%; max-height: 350px; border: 1px solid #ccc; margin-top: 2em; margin-bottom: 1em; }
                     .signature-block { margin-top: 2.5em; page-break-inside: avoid; }
                     .signature-block img { max-height: 70px; border-bottom: 1px solid #555; margin-bottom: 5px; display: block;}
                     ul { padding-left: 20px; list-style: disc; }
                     li { margin-bottom: 0.5em; }
                     .footer { position: fixed; bottom: 20pt; left: 40pt; right: 40pt; text-align: center; font-size: 8pt; color: #777; }
                 </style>
             </head>
             <body>
                 <div class="cover-page">
                     <h1>${data.title}</h1>
                     ${data.coverPhoto ? `<img src="${data.coverPhoto}" alt="Cover Photo"><br>` : ''}
                     <h2 style="border-bottom: none; margin-top: 1em;">${data.vesselName} (IMO: ${data.imo})</h2>
                     <p style="font-size: 11pt;"><strong>Inspection Date:</strong> ${data.inspectionDate}</p>
                     <p style="font-size: 11pt;"><strong>Location:</strong> ${data.inspectionLocation}</p>
                     <p style="font-size: 9pt; margin-top: 3em;"><strong>Document:</strong> ${data.documentNumber} Rev ${data.documentRevision}</p>
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
                     <tr><th>Operating Area</th><td>${data.operationalArea}</td><th>Last Antifouling</th><td>${data.lastAntifouling}</td></tr>
                 </table>

                 <h2>Inspection Details</h2>
                  <table>
                     <tr><th>Inspection Date</th><td>${data.inspectionDate}</td><th>Location</th><td>${data.inspectionLocation}</td></tr>
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
                 <p>${data.declaration.replace(/\n/g, '<br>')}</p>
                  <div class="signature-block">
                     ${data.signature ? `<img src="${data.signature}" alt="Signature"><br>` : '<p style="margin-bottom: 40px;">[Signature]</p>'}
                     <span>${data.inspector}</span><br>
                     <span>Date: ${data.inspectionDate}</span>
                 </div>

                 <!-- Add footer to each page using running elements potentially, or just here -->
                 <!-- <div class="footer">Page <span class="pageNumber"></span> of <span class="totalPages"></span> | ${data.documentNumber}</div> -->

             </body>
             </html>
         `;
     }

    // --- Event Listeners for Preview/Generate ---
    if (elements.previewReportButton) {
        elements.previewReportButton.addEventListener('click', generateReportPreviewContent);
    }

    async function downloadReport(format = 'html') { // Add format option
        const reportName = `MarineStream_Report_${elements.vesselName?.value?.replace(/[^a-z0-9]/gi, '_') || 'Vessel'}`;
        const htmlContent = generateFinalReportHTML();

        if (format === 'pdf' && typeof html2pdf !== 'undefined') { // Check if html2pdf library is loaded
            // Use html2pdf.js for better PDF generation
            const pdfOptions = {
                margin:       [40, 40, 40, 40], // margins in pt [top, left, bottom, right]
                filename:     `${reportName}.pdf`,
                image:        { type: 'jpeg', quality: 0.95 },
                html2canvas:  { scale: 2, logging: false, useCORS: true },
                jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
            };
            try {
                await html2pdf().from(htmlContent).set(pdfOptions).save();
            } catch (pdfError) {
                 console.error("html2pdf generation failed:", pdfError);
                 alert("Failed to generate PDF. Check console for details. Downloading as HTML instead.");
                 downloadHTML(); // Fallback to HTML
            }
        } else {
            downloadHTML(); // Default to HTML download
        }

        function downloadHTML() {
             const blob = new Blob([htmlContent], { type: 'text/html' });
             const url = URL.createObjectURL(blob);
             const link = document.createElement('a');
             link.href = url;
             link.download = `${reportName}.html`;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             URL.revokeObjectURL(url);
        }
    }


     if (elements.generateReportButton) {
         // Add a dropdown or similar to choose format if desired, otherwise default to HTML or PDF
         elements.generateReportButton.addEventListener('click', () => downloadReport('html')); // Default to HTML for now
     }

     // Close/Download from Preview Modal
     if (elements.closePreviewButton && elements.reportPreviewModal) {
         elements.closePreviewButton.addEventListener('click', () => {
             closeModal(elements.reportPreviewModal); // Use closeModal function
         });
     }
     if (elements.downloadReportButton) {
         // Add format choice here too if needed
         elements.downloadReportButton.addEventListener('click', () => downloadReport('html')); // Default to HTML
     }
}


// === Video Initialization (with Autoplay) ===
function initVideos() {
    function setupVideo(videoId, buttonId) {
        const video = document.getElementById(videoId);
        const playBtn = document.getElementById(buttonId);
        const videoContainer = video ? video.closest('.video-container') : null; // Get container

        if (!video || !playBtn || !videoContainer) {
             console.warn(`Video setup skipped: Elements not found for ${videoId}`);
             return;
        }

        // --- Autoplay Configuration ---
        // Browsers require muted for autoplay usually
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true; // Important for iOS
        video.loop = true; // Loop the background videos

        // Attempt to play on load (needed for some browser policies)
        video.play().catch(error => {
            console.warn(`Autoplay blocked for ${videoId}. User interaction needed.`, error);
            // Show play button overlay if autoplay fails
            playBtn.style.opacity = '1';
            playBtn.style.pointerEvents = 'auto';
        });


        function togglePlay() {
            if (video.paused || video.ended) {
                video.play().catch(e => console.error(`Error playing ${videoId}:`, e));
            } else {
                video.pause();
            }
             // Toggle mute when user explicitly interacts
             video.muted = false;
             updateButton(); // Update button state immediately
        }

         function updateButton() {
            const icon = video.paused || video.ended ? 'fa-play' : 'fa-pause';
            playBtn.innerHTML = `<i class="fas ${icon}"></i>`;
            playBtn.setAttribute('aria-label', video.paused || video.ended ? `Play ${videoId}` : `Pause ${videoId}`);
         }

        // --- Custom Controls Interaction ---
        playBtn.addEventListener('click', togglePlay);
        video.addEventListener('play', () => {
             updateButton();
             // Hide button slightly after play starts if autoplay worked
             if (video.autoplay && !video.paused) { // Check if autoplay is likely active
                 // playBtn.style.opacity = '0'; // Fade out button
             }
             videoContainer.classList.add('video-playing'); // Add class for styling
        });
        video.addEventListener('pause', () => {
            updateButton();
            // playBtn.style.opacity = '1'; // Ensure button is visible when paused
            videoContainer.classList.remove('video-playing');
        });
        video.addEventListener('ended', () => {
             updateButton();
             // playBtn.style.opacity = '1'; // Ensure button is visible when ended
             videoContainer.classList.remove('video-playing');
        });

        // Initial button state (might be playing due to autoplay)
        updateButton();

        // Hide custom play button initially if autoplay is likely to work
        // We rely on the play/pause event listeners to show/hide it
         playBtn.style.opacity = '0';
         playBtn.style.pointerEvents = 'none';

         // Show controls on container hover (already handled by CSS)
         // Hide native controls if custom ones are working
         video.controls = false;
    }

    setupVideo('rov-video', 'rov-play-btn');
    setupVideo('crawler-video', 'crawler-play-btn');
}


// === Helper Functions ===
function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        // Handle YYYY-MM-DD format safely
        const parts = dateString.split('-');
        if (parts.length === 3) {
            // new Date(year, monthIndex, day) - month is 0-indexed
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
             if (!isNaN(date.getTime())) {
                 const options = { year: 'numeric', month: 'long', day: 'numeric' };
                 return date.toLocaleDateString(navigator.language || 'en-US', options); // Use browser language
             }
        }
        // Fallback for other potential formats (less reliable)
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(navigator.language || 'en-US', options);
        }
        return dateString; // Return original if parsing fails
    } catch (e) {
        console.warn("Date formatting failed for:", dateString, e);
        return dateString; // Return original string on error
    }
}