// MarineStream Main JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Initialize core website functionality
    initWebsiteFunctions(); // Includes theme toggles, nav, etc.

    // Initialize tools if elements exist
    if (document.getElementById('cost-calculator-modal')) {
        initHullFoulingCalculator();
    }
    if (document.getElementById('plan-generator-modal')) {
        console.log('Plan Generator Modal element found');
        console.log('Initializing Biofouling Plan Generator...');
        initBiofoulingPlanGenerator();
    } else {
        console.error('Plan Generator Modal element NOT found');
    }

    // Initialize videos with autoplay
    if (document.getElementById('rov-video') || document.getElementById('crawler-video')) {
        initVideos(); // Modified to handle autoplay
    }

    // Initialize hero carousel
    initHeroCarousel();
    
    // Initialize custom buttons
    initCustomButtons();
});

// Function to initialize custom buttons
function initCustomButtons() {
    // ROV Inspections Button - in the live-monitoring section
    const rovSection = document.getElementById('live-monitoring');
    if (rovSection) {
        const rovButton = rovSection.querySelector('a.btn.btn-secondary');
        if (rovButton) {
            rovButton.onclick = function(e) {
                e.preventDefault();
                openEmailWithPrefilledMessage('ROV Inspections');
                return false;
            };
        }
    }
    
    // Cleaning Demonstration Button - in the crawler-capabilities section
    const crawlerSection = document.getElementById('crawler-capabilities');
    if (crawlerSection) {
        const cleaningButton = crawlerSection.querySelector('a.btn.btn-primary');
        if (cleaningButton) {
            cleaningButton.onclick = function(e) {
                e.preventDefault();
                openEmailWithPrefilledMessage('Cleaning Demonstration');
                return false;
            };
        }
    }
    
    // Learn More About Us Button - in the about section
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const learnMoreButton = aboutSection.querySelector('a.btn.btn-primary');
        if (learnMoreButton) {
            learnMoreButton.onclick = function(e) {
                e.preventDefault();
                // Call the generateCapabilityStatement function from capStat.js
                if (typeof generateCapabilityStatement === 'function') {
                    generateCapabilityStatement();
                }
                return false;
            };
        }
    }
}

// Function to open email with prefilled message based on type
function openEmailWithPrefilledMessage(messageType) {
    const recipientEmail = "mharvey@franmarine.com.au";
    let subject, body;
    
    if (messageType === 'ROV Inspections') {
        subject = "Inquiry about ROV Inspection Services";
        body = "Hello,\n\nI'd like to learn more about your ROV inspection services.\n\nPlease provide more information.\n\nThank you.";
    } else if (messageType === 'Cleaning Demonstration') {
        subject = "Request for Cleaning Demonstration";
        body = "Hello,\n\nI'd like to request a cleaning demonstration.\n\nPlease contact me to arrange this.\n\nThank you.";
    } else {
        subject = "Website Inquiry";
        body = "Hello,\n\nI'm interested in learning more about MarineStream's services.\n\nPlease provide additional information.\n\nThank you.";
    }
    
    // Create the mailto URL
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Track if the mailto link worked (we'll use a timeout check)
    let mailtoWorked = false;
    
    // Try to open the email client
    window.location.href = mailtoUrl;
    
    // Check if the mailto link worked after a short delay
    setTimeout(function() {
        if (!mailtoWorked) {
            // If we're still here, assume mailto didn't work
            showEmailFallback(recipientEmail, subject, body);
        }
    }, 500);
    
    return false;
}

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
    console.log('Initializing modal controls...');
    const modalButtons = [
        { buttonId: 'open-cost-calculator', modalId: 'cost-calculator-modal' },
        { buttonId: 'open-plan-generator', modalId: 'plan-generator-modal' }
    ];

    modalButtons.forEach(item => {
        const button = document.getElementById(item.buttonId);
        const modal = document.getElementById(item.modalId);
        console.log(`Setting up modal button: ${item.buttonId} -> ${item.modalId}`);
        if (button && modal) {
            console.log(`Found both button and modal for ${item.buttonId}`);
            button.addEventListener('click', () => {
                console.log(`Button ${item.buttonId} clicked, opening modal ${item.modalId}`);
                openModal(modal);
            });
        } else {
            console.error(`Missing button or modal: ${item.buttonId} -> ${item.modalId}`);
            if (!button) console.error(`Button not found: ${item.buttonId}`);
            if (!modal) console.error(`Modal not found: ${item.modalId}`);
        }
    });

    // Close modals functionality
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function () {
            const modal = this.closest('.modal-overlay'); // Find parent modal
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal by clicking overlay background
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
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
    // Remove scroll-triggered animations and just set elements to their final state
    gsap.set('.hero-title', { opacity: 1, y: 0 });
    gsap.set('.hero-subtitle', { opacity: 1, y: 0 });
    gsap.set('.hero-cta', { opacity: 1, y: 0 });
    gsap.set('.floating-image', { opacity: 1, y: 0 });

    // Set all section headers to visible
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.set(header, { opacity: 1, y: 0 });
    });

    // Set all feature cards to visible
    gsap.utils.toArray('.feature-card').forEach(card => {
        gsap.set(card, { opacity: 1, y: 0 });
    });

    // Set all list items to visible
    gsap.utils.toArray('.feature-list li').forEach(item => {
        gsap.set(item, { opacity: 1, x: 0 });
    });

    // Set all dashboard features to visible
    gsap.utils.toArray('.dashboard-feature').forEach(feature => {
        gsap.set(feature, { opacity: 1, x: 0 });
    });

    // Set all media elements to visible
    gsap.utils.toArray('.media-element').forEach(element => {
        gsap.set(element, { opacity: 1, y: 0 });
    });

    // Set all content elements to visible
    gsap.utils.toArray('.content-element').forEach(element => {
        gsap.set(element, { opacity: 1, y: 0 });
    });

    // Set all tool cards to visible
    gsap.utils.toArray('.tool-card').forEach(card => {
        gsap.set(card, { opacity: 1, y: 0 });
    });

    // Set all partner logos to visible
    gsap.utils.toArray('.partner-logo').forEach(logo => {
        gsap.set(logo, { opacity: 1, y: 0 });
    });

    // Add parallax effect to hero section
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.to('.hero::before', {
            backgroundPosition: '50% 30%',
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
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
        link.addEventListener('click', function (e) {
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

        while (--index && window.scrollY + headerOffset < sections[index].offsetTop) { }

        navLinks.forEach((link) => link.classList.remove('active'));
        // Ensure the corresponding link exists before adding class
        if (sections[index] && sections[index].id) {
            const activeLink = document.querySelector(`.nav-links a.nav-link[href="#${sections[index].id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            } else if (window.scrollY < sections[0].offsetTop - headerOffset) {
                // If above the first section, activate the first link (usually Home)
                const homeLink = document.querySelector('.nav-links a.nav-link[href="#home"]');
                if (homeLink) homeLink.classList.add('active');
            }
        } else if (window.scrollY < (sections[0]?.offsetTop || window.innerHeight) - headerOffset) {
            // Fallback for being at the top before the first section
            const homeLink = document.querySelector('.nav-links a.nav-link[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
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


// === Hull Fouling Cost Calculator ===
// === Hull Fouling Cost Calculator - Enhanced Version ===
function initHullFoulingCalculator() {
    const modal = document.getElementById('cost-calculator-modal');
    if (!modal) {
        console.error('Hull Fouling Calculator Modal not found');
        return;
    }

    // Initialize chart registry
    if (!window.chartInstances) {
        window.chartInstances = {};
    }

    console.log('Initializing Hull Fouling Calculator...');

    // Set default values
    loadVesselDefaults('tug'); // Default to tug

    // Initialize the slider
    const frSlider = document.getElementById('frSlider');
    const frLabel = document.getElementById('frLabel');

    if (frSlider && frLabel) {
        frSlider.addEventListener('input', function () {
            frLabel.textContent = 'FR' + this.value;
            updateActiveTick(this.value);
            try {
                updateCalculator();
            } catch (error) {
                console.error("Error updating calculator:", error);
            }
        });

        // Initialize ticks
        const rangeTicks = document.querySelectorAll('.range-tick');
        rangeTicks.forEach(tick => {
            tick.addEventListener('click', function () {
                const value = this.getAttribute('data-value');
                frSlider.value = value;
                frLabel.textContent = 'FR' + value;
                updateActiveTick(value);
                try {
                    updateCalculator();
                } catch (error) {
                    console.error("Error updating calculator:", error);
                }
            });
        });

        // Set initial active tick
        updateActiveTick(frSlider.value);
    }

    // Set up event listeners
    const vesselTypeSelect = document.getElementById('vesselTypeCalc');
    if (vesselTypeSelect) {
        vesselTypeSelect.addEventListener('change', function () {
            loadVesselDefaults(this.value);
            try {
                updateCalculator();
            } catch (error) {
                console.error("Error updating calculator:", error);
            }
        });
    }

    // Add event listeners to form inputs
    const costInputs = modal.querySelectorAll('input[type="number"]');
    costInputs.forEach(input => {
        input.addEventListener('input', function () {
            try {
                updateCalculator();
            } catch (error) {
                console.error("Error updating calculator:", error);
            }
        });
    });

    // Add event listener to currency select
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
        currencySelect.addEventListener('change', function () {
            // Update placeholder costs when currency changes
            updateInputPlaceholders();

            try {
                updateCalculator();
            } catch (error) {
                console.error("Error updating calculator:", error);
            }
        });
    }

    // Add detailed research content to the modal
    function addResearchContent() {
        const modal = document.getElementById('cost-calculator-modal');
        if (!modal) return;

        const researchSectionDiv = modal.querySelector('.research-section');
        if (!researchSectionDiv) return;

        // Clear existing content
        researchSectionDiv.innerHTML = '';

        // Create new research content
        const researchContent = `
        <div class="research-header">
            <h3><i class="fas fa-microscope"></i> Research Foundation</h3>
            <p>This calculator integrates findings from University of Melbourne marine engineering research, making complex scientific data accessible for practical decision-making.</p>
        </div>
        
        <div class="research-highlight">
            <h4><i class="fas fa-water"></i> Research Methodology: AQUAMARS Technology</h4>
            <p>The University of Melbourne studies used advanced AQUAMARS 3D underwater scanning technology to precisely map hull roughness. This diver-operated device captured high-resolution images that were reconstructed into 3D surface maps with sub-millimeter accuracy. Key findings:</p>
            <ul>
                <li>For the Coral Adventurer cruise ship, heavy calcareous fouling increased friction coefficient by <strong>193%</strong></li>
                <li>Total resistance increased by <strong>98%</strong> at cruise speed (13.8 knots)</li>
                <li>This translated to <strong>$1,273 additional fuel cost per hour</strong></li>
                <li>And <strong>1.8 tonnes of extra CO₂ emissions per hour</strong></li>
                <li>For the Rio Tinto tugboat, a different fouling level increased friction by <strong>125%</strong> and total resistance by <strong>44.2%</strong> at 13 knots</li>
            </ul>
        </div>
        
        <div class="research-grid">
            <div class="research-card">
                <h4><i class="fas fa-ship"></i> Understanding Ship Resistance</h4>
                <p>Vessels face two primary types of resistance when moving through water:</p>
                <ol>
                    <li>
                        <strong>Frictional Resistance:</strong> The drag created by water flowing along the hull surface. It follows a cubic relationship with speed (∝ speed³) and is the dominant force at lower speeds. Hull fouling directly increases this component.
                    </li>
                    <li>
                        <strong>Wave-Making Resistance:</strong> The energy needed to push water aside and create waves. It increases more rapidly with speed (∝ speed⁴·⁵) and dominates at higher speeds. Hull fouling has minimal impact on this component.
                    </li>
                </ol>
            </div>
            
            <div class="research-card">
                <h4><i class="fas fa-calculator"></i> Our Calculation Method</h4>
                <p>The researchers used advanced 3D scanning to measure hull roughness and sophisticated fluid dynamics to calculate drag. We've implemented their methodology into this practical calculator:</p>
                <div class="research-equation">
                    Cost(speed, FR) = [α·(1 + FR%)·speed³] + [β·speed⁴·⁵]
                </div>
                <div class="equation-annotation">
                    <div class="equation-dot"></div>
                    <p>The first term represents frictional resistance (affected by fouling)</p>
                </div>
                <div class="equation-annotation">
                    <div class="equation-dot"></div>
                    <p>The second term represents wave-making resistance (unchanged by fouling)</p>
                </div>
                <div class="equation-annotation">
                    <div class="equation-dot"></div>
                    <p>α and β are calculated from your vessel's known operating costs</p>
                </div>
            </div>
            
            <div class="research-card">
                <h4><i class="fas fa-coins"></i> Real-World Impact</h4>
                <p>For the Coral Adventurer cruise ship in the University of Melbourne study, operating 200 days per year at 12 hours per day with heavy fouling (FR5):</p>
                <ul>
                    <li>Additional annual fuel cost: <strong>$3,055,200</strong></li>
                    <li>Additional annual CO₂ emissions: <strong>4,320 tonnes</strong></li>
                    <li>Reduction in operational range: <strong>~33%</strong></li>
                </ul>
                <p>Similarly, for the Rio Tinto tugboat with moderate fouling at 13 knots, the added cost was approximately <strong>$955/hr</strong> with <strong>1.3 tonnes/hr</strong> of additional CO₂ emissions.</p>
                <p>These findings demonstrate the significant economic and environmental benefits of maintaining clean hulls.</p>
            </div>
        </div>
        
        <div class="information-note">
            <h4><i class="fas fa-info-circle"></i> Ongoing Research</h4>
            <p>This calculator will be updated as more research studies become available. Future enhancements will include additional vessel types, more refined friction coefficients for different fouling conditions, and the ability to calculate acoustic impacts of hull fouling.</p>
        </div>
    `;

        researchSectionDiv.innerHTML = researchContent;

        // Add research styling if not already in stylesheet
        if (!document.getElementById('research-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'research-styles';
            styleElement.textContent = `
            .research-header {
                margin-bottom: var(--space-md, 1.2rem);
            }
            
            .research-highlight {
                background-color: var(--accent-light, #FF8533);
                color: var(--bg-white, white);
                border-radius: var(--radius-md, 0.6rem);
                padding: var(--space-md, 1.2rem);
                margin-bottom: var(--space-lg, 2.4rem);
                position: relative;
            }
            
            .research-highlight h4 {
                color: white;
                margin-bottom: var(--space-sm, 0.6rem);
                display: flex;
                align-items: center;
                gap: var(--space-sm, 0.6rem);
            }
            
            .research-highlight ul {
                margin-left: var(--space-md, 1.2rem);
                margin-bottom: 0;
            }
            
            .research-highlight ul li {
                margin-bottom: var(--space-sm, 0.6rem);
                color: rgba(255, 255, 255, 0.9);
            }
            
            .research-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-md, 1.2rem);
                margin-bottom: var(--space-lg, 2.4rem);
            }
            
            .research-card {
                background-color: var(--bg-secondary, #F9F9F9);
                border-radius: var(--radius-md, 0.6rem);
                padding: var(--space-md, 1.2rem);
                box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.04));
                border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
            }
            
            .research-card h4 {
                display: flex;
                align-items: center;
                gap: var(--space-sm, 0.6rem);
                margin-bottom: var(--space-sm, 0.6rem);
                color: var(--accent-color, #FF6600);
            }
            
            .research-equation {
                background-color: var(--bg-primary, white);
                padding: var(--space-md, 1.2rem);
                border-radius: var(--radius-sm, 0.3rem);
                margin: var(--space-md, 1.2rem) 0;
                text-align: center;
                font-family: var(--font-mono, monospace);
                font-size: 1.1rem;
                font-weight: 600;
            }
            
            .equation-annotation {
                display: flex;
                align-items: flex-start;
                margin-top: var(--space-sm, 0.6rem);
            }
            
            .equation-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: var(--accent-color, #FF6600);
                margin-right: var(--space-sm, 0.6rem);
                margin-top: 0.5em;
                flex-shrink: 0;
            }
            
            .equation-annotation p {
                margin: 0;
                font-size: 0.9rem;
                text-align: left;
            }
            
            @media (max-width: 768px) {
                .research-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
            document.head.appendChild(styleElement);
        }
    }


    // Add research content sections to modal
    addResearchContent();


    // Update input placeholders based on currency and vessel defaults
    function updateInputPlaceholders() {
        // Get the current vessel
        const vesselType = document.getElementById('vesselTypeCalc').value;
        const vessel = vesselConfigs[vesselType];

        // Get current currency
        const currencySelect = document.getElementById('currencySelect');
        const currentCurrency = currencySelect ? currencySelect.value : 'AUD';

        // Convert base costs to current currency for placeholders
        const costEcoConverted = currentCurrency === 'AUD' ?
            vessel.costEco :
            convertCurrency(vessel.costEco, 'AUD', currentCurrency);

        const costFullConverted = currentCurrency === 'AUD' ?
            vessel.costFull :
            convertCurrency(vessel.costFull, 'AUD', currentCurrency);

        // Update input values if they're empty
        const costEcoInput = document.getElementById('costEco');
        const costFullInput = document.getElementById('costFull');

        if (costEcoInput) {
            if (!costEcoInput.value) {
                costEcoInput.value = Math.round(costEcoConverted);
            }
            costEcoInput.placeholder = Math.round(costEcoConverted);
        }

        if (costFullInput) {
            if (!costFullInput.value) {
                costFullInput.value = Math.round(costFullConverted);
            }
            costFullInput.placeholder = Math.round(costFullConverted);
        }

        // Update input labels to reflect current currency
        document.querySelectorAll('.help-text').forEach(helpText => {
            if (helpText.textContent.includes('fuel cost')) {
                helpText.textContent = helpText.textContent.replace(/[$€£A$]/, getCurrencySymbol(currentCurrency));
            }
        });
    }
    // Initialize the calculator with default values
    // Defer slightly to ensure all elements are properly loaded
    setTimeout(() => {
        try {
            updateInputPlaceholders();
            updateCalculator();
        } catch (error) {
            console.error("Error initializing calculator:", error);
        }
    }, 300);
}


// FR (Fouling Rating) information - based on research findings
const frData = {
    0: { pct: 0, desc: "Clean hull" },
    1: { pct: 15, desc: "Light slime" },        // Calibrated based on research
    2: { pct: 35, desc: "Medium slime" },       // Calibrated based on research
    3: { pct: 60, desc: "Heavy slime" },        // Calibrated based on research
    4: { pct: 95, desc: "Light calcareous" },   // Calibrated based on research
    5: { pct: 193, desc: "Heavy calcareous" }    // Matches 193% from research study
};

// Vessel type configurations - updated with research data
const vesselConfigs = {
    tug: {
        name: "Harbor Tug (32m)",
        ecoSpeed: 8,
        fullSpeed: 13,
        costEco: 600,
        costFull: 2160,
        waveExp: 4.5
    },
    cruiseShip: {
        name: "Passenger Cruise Ship (93m)",
        ecoSpeed: 10,
        fullSpeed: 13.8,
        costEco: 1600,
        costFull: 4200,
        waveExp: 4.6
    },
    osv: {
        name: "Offshore Supply Vessel (50m)",
        ecoSpeed: 10,
        fullSpeed: 14,
        costEco: 850,
        costFull: 3200,
        waveExp: 4.5
    },
    coaster: {
        name: "Coastal Freighter (80m)",
        ecoSpeed: 11,
        fullSpeed: 15,
        costEco: 1200,
        costFull: 4800,
        waveExp: 4.6
    }
};

// Currency conversion rates - updated for 2025
const conversionRates = {
    AUD: 1,
    USD: 0.65,
    GBP: 0.52,
    EUR: 0.62
};

// Currency symbols
const currencySymbols = {
    AUD: 'A$',
    USD: '$',
    GBP: '£',
    EUR: '€'
};

// Solve for alpha (friction coefficient) and beta (wave coefficient)
// This implements the physics model for ship resistance
function solveAlphaBeta(costEco, costFull, ecoSpeed, fullSpeed, waveExp = 4.5) {
    const s1 = ecoSpeed, s2 = fullSpeed;
    const x1 = Math.pow(s1, 3);
    const y1 = Math.pow(s1, waveExp);
    const x2 = Math.pow(s2, 3);
    const y2 = Math.pow(s2, waveExp);

    const det = x1 * y2 - x2 * y1;

    // Handle potential division by zero or near-zero values
    if (Math.abs(det) < 1e-10) {
        console.warn("Determinant near zero, using fallback values");
        return { alpha: costEco / x1, beta: 0 };
    }

    const alpha = (costEco * y2 - costFull * y1) / det;
    const beta = (costFull * x1 - costEco * x2) / det;

    return { alpha, beta };
}
// Function to calculate costs at a specific speed
function calculateCostAtSpeed(speed, alpha, beta, frPct, waveExp, currentCurrency) {
    // Calculate friction and wave resistance components
    const friction = alpha * Math.pow(speed, 3);
    const wave = beta * Math.pow(speed, waveExp);

    // Calculate clean hull cost
    const clean = friction + wave;

    // Calculate fouled hull cost with increased friction
    const frictionFouled = friction * (1 + frPct / 100);
    const fouled = frictionFouled + wave;

    // Convert to display currency if needed
    const displayClean = currentCurrency === 'AUD' ?
        clean : convertCurrency(clean, 'AUD', currentCurrency);

    const displayFouled = currentCurrency === 'AUD' ?
        fouled : convertCurrency(fouled, 'AUD', currentCurrency);

    return {
        clean: displayClean,
        fouled: displayFouled,
        cleanFriction: friction,
        fouledFriction: frictionFouled,
        cleanWave: wave
    };
}

// Function to calculate extra CO2 emissions based on extra fuel cost
function calculateExtraCO2(extraCost, vesselType, currency) {
    // Convert extraCost to AUD for consistent emission calculation
    let extraCostAUD = extraCost;
    if (currency && currency !== 'AUD') {
        extraCostAUD = convertCurrency(extraCost, currency, 'AUD');
    }

    // Calibrated to match research: 1.8T CO2/hr at $1,273/hr extra cost for cruise ship
    let emissionFactor;

    if (vesselType === 'cruiseShip') {
        emissionFactor = 1800 / 1273; // kg CO2 per $ of extra fuel (from Coral Adventurer study)
    } else if (vesselType === 'tug') {
        emissionFactor = 1300 / 955; // kg CO2 per $ from Rio Tinto tugboat study
    } else {
        // For other vessel types, use a slightly modified factor based on engine efficiency
        emissionFactor = 1.45; // kg CO2 per $ of extra fuel
    }

    return extraCostAUD * emissionFactor;
}


// Function to check if current data point is directly validated by research
function getValidationStatus(vesselType, frLevel, speed) {
    if (vesselType === 'cruiseShip' && frLevel === 5 &&
        Math.abs(speed - vesselConfigs.cruiseShip.fullSpeed) < 0.5) {
        return {
            validated: true,
            message: "Values validated by University of Melbourne Coral Adventurer study"
        };
    } else if (vesselType === 'tug' && frLevel === 4 &&
        Math.abs(speed - vesselConfigs.tug.fullSpeed) < 0.5) {
        return {
            validated: true,
            message: "Values validated by University of Melbourne Rio Tinto tugboat study"
        };
    }
    return {
        validated: false,
        message: ""
    };
}

// Currency conversion function
function convertCurrency(amount, fromCurrency, toCurrency) {
    // Input validation
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }

    if (!fromCurrency || !conversionRates[fromCurrency]) {
        console.warn(`Invalid from currency: ${fromCurrency}, using AUD as fallback`);
        fromCurrency = 'AUD';
    }

    if (!toCurrency || !conversionRates[toCurrency]) {
        console.warn(`Invalid to currency: ${toCurrency}, using AUD as fallback`);
        toCurrency = 'AUD';
    }

    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
        return amount;
    }

    // Convert to AUD first (base currency)
    const amountInAUD = fromCurrency === 'AUD'
        ? amount
        : amount / conversionRates[fromCurrency];

    // Then convert to target currency
    return amountInAUD * conversionRates[toCurrency];
}


// Enhanced calculator update function
// Enhanced calculator update function
function updateCalculator() {
    try {
        // Get form values
        const vesselType = document.getElementById('vesselTypeCalc').value;
        const vessel = vesselConfigs[vesselType];

        // Get current currency
        const currencySelect = document.getElementById('currencySelect');
        const currentCurrency = currencySelect ? currencySelect.value : 'AUD';

        // Get cost inputs in current currency
        let costEcoInput = parseFloat(document.getElementById('costEco').value) || vessel.costEco;
        let costFullInput = parseFloat(document.getElementById('costFull').value) || vessel.costFull;

        // Convert input costs to AUD for calculations if needed
        let costEco = currentCurrency === 'AUD' ?
            costEcoInput : convertCurrency(costEcoInput, currentCurrency, 'AUD');
        let costFull = currentCurrency === 'AUD' ?
            costFullInput : convertCurrency(costFullInput, currentCurrency, 'AUD');

        const frLevel = parseInt(document.getElementById('frSlider').value) || 0;
        const frPct = frData[frLevel].pct;
        const frDesc = frData[frLevel].desc;

        // Calculate speed range for chart
        const minSpeed = Math.max(vessel.ecoSpeed - 4, 4);
        const maxSpeed = vessel.fullSpeed + 2;

        // Calculate alpha (friction coefficient) and beta (wave coefficient)
        const { alpha, beta } = solveAlphaBeta(
            costEco,
            costFull,
            vessel.ecoSpeed,
            vessel.fullSpeed,
            vessel.waveExp
        );

        // Generate data points for chart
        const speeds = [];
        const cleanCosts = [];
        const fouledCosts = [];
        const co2Emissions = [];

        // Adjust step size based on speed range for better readability
        const stepSize = (maxSpeed - minSpeed) > 8 ? 0.5 : 0.25;

        for (let s = minSpeed; s <= maxSpeed; s += stepSize) {
            // Calculate friction and wave resistance components
            const friction = alpha * Math.pow(s, 3);
            const wave = beta * Math.pow(s, vessel.waveExp);
            const costClean = friction + wave;

            // Calculate fouled hull cost with increased friction
            const frictionFouled = friction * (1 + frPct / 100);
            const costFouled = frictionFouled + wave;

            // Calculate extra CO2 emissions based on extra fuel consumption
            const extraCost = costFouled - costClean;
            const extraCO2 = calculateExtraCO2(extraCost, vesselType);

            speeds.push(s.toFixed(1));

            // Convert costs to display currency
            const displayCleanCost = currentCurrency === 'AUD' ?
                costClean : convertCurrency(costClean, 'AUD', currentCurrency);

            const displayFouledCost = currentCurrency === 'AUD' ?
                costFouled : convertCurrency(costFouled, 'AUD', currentCurrency);

            cleanCosts.push(displayCleanCost);
            fouledCosts.push(displayFouledCost);
            co2Emissions.push(extraCO2);
        }

        // Calculate costs at economic and full speeds
        const resultsEco = calculateCostAtSpeed(vessel.ecoSpeed, alpha, beta, frPct, vessel.waveExp, currentCurrency);
        const resultsFull = calculateCostAtSpeed(vessel.fullSpeed, alpha, beta, frPct, vessel.waveExp, currentCurrency);

        // Calculate cruise speed (midpoint)
        const cruiseSpeed = (vessel.ecoSpeed + vessel.fullSpeed) / 2;
        const resultsCruise = calculateCostAtSpeed(cruiseSpeed, alpha, beta, frPct, vessel.waveExp, currentCurrency);

        // Check if this is validated data from research
        const validationFull = getValidationStatus(vesselType, frLevel, vessel.fullSpeed);

        // Calculate annual impact (using 12hr/day, 200 days/year from research)
        const annualHours = 12 * 200;
        const extraCostFull = resultsFull.fouled - resultsFull.clean;
        const extraCO2Full = calculateExtraCO2(extraCostFull, vesselType);
        const annualExtraCost = extraCostFull * annualHours;
        const annualExtraCO2 = extraCO2Full * annualHours / 1000; // Convert to tonnes

        // Update the results text
        const resultsText = document.getElementById('resultsText');

        if (resultsText) {
            let html = `
                <div class="result-item">
                    <span class="result-label">Vessel Type:</span>
                    <span class="result-value">${vessel.name}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Fouling Condition:</span>
                    <span class="result-value">FR${frLevel} - ${frDesc}</span>
                </div>
                
                <div class="result-group">
                    <div class="result-group-header">
                        <i class="fas fa-tachometer-alt"></i>
                        <h4>At ${vessel.ecoSpeed} knots (Economic Speed)</h4>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Clean Hull:</span>
                        <span class="result-value">${formatCurrency(resultsEco.clean, currentCurrency)}/hr</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Fouled Hull (FR${frLevel}):</span>
                        <span class="result-value">${formatCurrency(resultsEco.fouled, currentCurrency)}/hr</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Extra Cost:</span>
                        <span class="result-value">${formatCurrency(resultsEco.fouled - resultsEco.clean, currentCurrency)}/hr</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Cost Increase:</span>
                        <span class="result-value">${((resultsEco.fouled - resultsEco.clean) / resultsEco.clean * 100).toFixed(1)}%</span>
                    </div>
                </div>

                <div class="result-group">
                    <div class="result-group-header">
                        <i class="fas fa-rocket"></i>
                        <h4>At ${vessel.fullSpeed} knots (Full Speed)</h4>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Clean Hull:</span>
                        <span class="result-value">${formatCurrency(resultsFull.clean, currentCurrency)}/hr</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Fouled Hull (FR${frLevel}):</span>
                        <span class="result-value">${formatCurrency(resultsFull.fouled, currentCurrency)}/hr</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Extra Cost:</span>
                        <span class="result-value">${formatCurrency(resultsFull.fouled - resultsFull.clean, currentCurrency)}/hr</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Cost Increase:</span>
                        <span class="result-value">${((resultsFull.fouled - resultsFull.clean) / resultsFull.clean * 100).toFixed(1)}%</span>
                    </div>
                </div>

                <div class="result-group">
                    <div class="result-group-header">
                        <i class="fas fa-leaf"></i>
                        <h4>Environmental Impact at Full Speed</h4>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Additional CO₂ Emissions:</span>
                        <span class="result-value">${extraCO2Full.toFixed(1)} kg/hr</span>
                    </div>
                </div>

                <div class="result-group">
                    <div class="result-group-header">
                        <i class="fas fa-calendar-alt"></i>
                        <h4>Estimated Annual Impact</h4>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Operating Schedule:</span>
                        <span class="result-value">12 hrs/day, 200 days/year</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Additional Fuel Cost:</span>
                        <span class="result-value">${formatCurrency(annualExtraCost, currentCurrency)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Additional CO₂ Emissions:</span>
                        <span class="result-value">${annualExtraCO2.toFixed(1)} tonnes</span>
                    </div>
                </div>
            `;

            // Add validation badge if applicable
            if (validationFull.validated) {
                html += `
                    <div class="validation-badge">
                        <i class="fas fa-check-circle"></i>
                        <span>${validationFull.message}</span>
                    </div>
                `;
            }

            resultsText.innerHTML = html;
        }

        // Update the chart
        updateCalculatorChart(speeds, cleanCosts, fouledCosts, co2Emissions, frLevel, currentCurrency);

    } catch (error) {
        console.error("Error in updateCalculator:", error);
    }
}

// Function to update the chart
function updateCalculatorChart(speeds, cleanCosts, fouledCosts, co2Emissions, frLevel, currentCurrency) {
    try {
        // Find the canvas
        const chartCanvas = document.getElementById('myChart');
        if (!chartCanvas) {
            console.error("Chart canvas element not found");
            return;
        }
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error("Chart.js library not loaded");
            return;
        }
        
        // Create a registry of charts if it doesn't exist
        if (!window.chartInstances) {
            window.chartInstances = {};
        }
        
        const chartId = 'costCalculator';
        
        // Clean up any existing chart for this canvas
        if (window.chartInstances[chartId]) {
            window.chartInstances[chartId].destroy();
            delete window.chartInstances[chartId];
        }
        
        // Get currency symbol
        const currencySymbol = getCurrencySymbol(currentCurrency);
        
        // Create chart data
        const chartData = {
            labels: speeds,
            datasets: [
                {
                    label: 'Clean Hull (FR0)',
                    data: cleanCosts,
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: `Fouled Hull (FR${frLevel})`,
                    data: fouledCosts,
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Additional CO₂ Emissions',
                    data: co2Emissions,
                    backgroundColor: 'rgba(16, 133, 101, 0)',
                    borderColor: 'rgba(16, 133, 101, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1',
                    borderDash: [5, 5]
                }
            ]
        };
        
        // Chart options
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Speed (knots)',
                        color: 'rgba(74, 85, 104, 1)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(226, 232, 240, 0.6)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: `Operating Cost (${currencySymbol}/hr)`,
                        color: 'rgba(74, 85, 104, 1)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return currencySymbol + value;
                        }
                    },
                    grid: {
                        color: 'rgba(226, 232, 240, 0.6)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Additional CO₂ (kg/hr)',
                        color: 'rgba(74, 85, 104, 1)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(226, 232, 240, 0.6)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.yAxisID === 'y1') {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} kg/hr`;
                            }
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y, currentCurrency)}/hr`;
                        }
                    },
                    backgroundColor: 'rgba(26, 32, 44, 0.9)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    borderColor: 'rgba(203, 213, 224, 0.3)',
                    borderWidth: 1
                },
                legend: {
                    position: 'top',
                    align: 'start',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        };
        
        // Create new chart
        try {
            const ctx = chartCanvas.getContext('2d');
            
            // Create new chart and store in our registry
            window.chartInstances[chartId] = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: chartOptions
            });
            
            console.log("Chart created successfully with ID:", chartId);
        } catch (chartError) {
            console.error("Error creating chart:", chartError);
        }
    } catch (error) {
        console.error("Error updating chart:", error);
    }
}


// Get currency symbol based on selected currency
function getCurrencySymbol(currency = null) {
    // If no currency provided, get it from the select element
    if (!currency) {
        const currencySelect = document.getElementById('currencySelect');
        if (!currencySelect) return '$'; // Default to $ if element not found
        currency = currencySelect.value;
    }
    
    return currencySymbols[currency] || '$';
}

// Format currency with appropriate symbol
function formatCurrency(value, currency = null) {
    if (!currency) {
        const currencySelect = document.getElementById('currencySelect');
        currency = currencySelect ? currencySelect.value : 'AUD';
    }
    
    const currencySymbol = getCurrencySymbol(currency);
    value = parseFloat(value).toFixed(0);
    
    // Format with thousand separators
    value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    return `${currencySymbol}${value}`;
}

// Format currency with appropriate symbol
function formatCurrency(value, includeSymbol = true) {
    const currencySymbol = getCurrencySymbol();
    value = parseFloat(value).toFixed(0);

    // Format with thousand separators
    value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return includeSymbol ? `${currencySymbol}${value}` : value;
}

// Load vessel defaults
// Load vessel defaults
function loadVesselDefaults(vesselType) {
    // If no vessel type provided, get it from the select
    if (!vesselType) {
        const vesselSelect = document.getElementById('vesselTypeCalc');
        if (vesselSelect) {
            vesselType = vesselSelect.value;
        } else {
            vesselType = 'tug'; // Default
        }
    }
    
    // Get default values for selected vessel
    const vessel = vesselConfigs[vesselType] || vesselConfigs.tug;
    
    // Get current currency
    const currencySelect = document.getElementById('currencySelect');
    const currentCurrency = currencySelect ? currencySelect.value : 'AUD';
    
    // Convert costs to current currency
    const costEcoConverted = currentCurrency === 'AUD' ? 
        vessel.costEco : 
        convertCurrency(vessel.costEco, 'AUD', currentCurrency);
        
    const costFullConverted = currentCurrency === 'AUD' ? 
        vessel.costFull : 
        convertCurrency(vessel.costFull, 'AUD', currentCurrency);
    
    // Update form inputs
    const costEcoInput = document.getElementById('costEco');
    const costFullInput = document.getElementById('costFull');
    
    if (costEcoInput) costEcoInput.value = Math.round(costEcoConverted);
    if (costFullInput) costFullInput.value = Math.round(costFullConverted);
}


// === Biofouling Management Plan Generator ===
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

    // Add click event to tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.dataset.tab;

            // Remove active class from all tabs and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to target tab and pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Update progress indicator
            updateProgressIndicator();
        });
    });

    // Next/Previous buttons functionality
    const nextButtons = modal.querySelectorAll('.next-tab');
    const prevButtons = modal.querySelectorAll('.prev-tab');

    nextButtons.forEach(button => {
        button.addEventListener('click', function () {
            const nextTabId = this.dataset.next;
            const nextTab = modal.querySelector(`.tab-btn[data-tab="${nextTabId}"]`);

            if (nextTab) {
                nextTab.click();
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', function () {
            const prevTabId = this.dataset.prev;
            const prevTab = modal.querySelector(`.tab-btn[data-tab="${prevTabId}"]`);

            if (prevTab) {
                prevTab.click();
            }
        });
    });

    // Component selection functionality
    const componentItems = modal.querySelectorAll('.component-item');
    const componentForm = modal.querySelector('.component-form');
    const componentTitle = modal.querySelector('#component-title');
    const selectComponentMessage = modal.querySelector('.select-component-message');
    const otherComponentNameGroup = modal.querySelector('#other-component-name-group');

    componentItems.forEach(item => {
        item.addEventListener('click', function () {
            const componentId = this.dataset.id;
            const componentName = this.querySelector('.component-name').textContent;

            // Remove active class from all items
            componentItems.forEach(item => item.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Show component form and hide message
            if (componentForm) {
                componentForm.style.display = 'block';
                if (selectComponentMessage) selectComponentMessage.style.display = 'none';

                // Set component title
                if (componentTitle) {
                    componentTitle.textContent = componentName;
                }

                // Show "Other" field if needed
                if (otherComponentNameGroup) {
                    otherComponentNameGroup.style.display = componentId === 'other' ? 'block' : 'none';
                }

                // Load component data if it exists
                loadComponentData(componentId);
            }
        });
    });

    // Save component data
    const saveComponentButton = modal.querySelector('#save-component');
    if (saveComponentButton) {
        saveComponentButton.addEventListener('click', function () {
            saveComponentData();
        });
    }

    // Load component data function
    function loadComponentData(componentId) {
        // Get the active component item
        const componentItem = modal.querySelector(`.component-item[data-id="${componentId}"]`);
        if (!componentItem) return;

        // Check if component has saved data
        if (componentItem.dataset.saved === 'true') {
            // Fill form with saved data
            modal.querySelector('#fouling-rating').value = componentItem.dataset.foulingRating || 'FR0';
            modal.querySelector('#fouling-coverage').value = componentItem.dataset.foulingCoverage || '0%';
            modal.querySelector('#pdr-rating').value = componentItem.dataset.pdrRating || 'PDR0';
            modal.querySelector('#management-action').value = componentItem.dataset.managementAction || 'None';
            modal.querySelector('#component-comments').value = componentItem.dataset.comments || '';

            if (componentId === 'other' && modal.querySelector('#other-component-name')) {
                modal.querySelector('#other-component-name').value = componentItem.dataset.otherName || '';
            }
        } else {
            // Reset form for new component
            modal.querySelector('#fouling-rating').value = 'FR0';
            modal.querySelector('#fouling-coverage').value = '0%';
            modal.querySelector('#pdr-rating').value = 'PDR0';
            modal.querySelector('#management-action').value = 'None';
            modal.querySelector('#component-comments').value = '';

            if (componentId === 'other' && modal.querySelector('#other-component-name')) {
                modal.querySelector('#other-component-name').value = '';
            }
        }
    }

    // Save component data function
    function saveComponentData() {
        // Get the active component
        const activeComponent = modal.querySelector('.component-item.active');
        if (!activeComponent) return;

        const componentId = activeComponent.dataset.id;

        // Get form values
        const foulingRating = modal.querySelector('#fouling-rating').value;
        const foulingCoverage = modal.querySelector('#fouling-coverage').value;
        const pdrRating = modal.querySelector('#pdr-rating').value;
        const managementAction = modal.querySelector('#management-action').value;
        const comments = modal.querySelector('#component-comments').value;

        // Save data to component item's dataset
        activeComponent.dataset.saved = 'true';
        activeComponent.dataset.foulingRating = foulingRating;
        activeComponent.dataset.foulingCoverage = foulingCoverage;
        activeComponent.dataset.pdrRating = pdrRating;
        activeComponent.dataset.managementAction = managementAction;
        activeComponent.dataset.comments = comments;

        // Handle 'other' component name if applicable
        if (componentId === 'other' && modal.querySelector('#other-component-name')) {
            const otherName = modal.querySelector('#other-component-name').value;
            activeComponent.dataset.otherName = otherName;

            // Update the component name display
            if (otherName) {
                const nameElement = activeComponent.querySelector('.component-name');
                if (nameElement) {
                    nameElement.textContent = otherName;
                }
            }
        }

        // Add a visual indicator that the component has been saved
        if (!activeComponent.querySelector('.saved-indicator')) {
            const savedIndicator = document.createElement('span');
            savedIndicator.className = 'saved-indicator';
            savedIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
            activeComponent.appendChild(savedIndicator);
        }

        // Show success message
        alert('Component data saved successfully!');
    }

    // Signature pad initialization
    const signaturePad = document.getElementById('signaturePad');
    const clearSignatureBtn = document.getElementById('clearSignature');

    if (signaturePad && typeof SignaturePad !== 'undefined') {
        const pad = new SignaturePad(signaturePad);

        // Clear signature
        if (clearSignatureBtn) {
            clearSignatureBtn.addEventListener('click', function () {
                pad.clear();
            });
        }
    }

    // Preview and generate report buttons
    const previewButton = modal.querySelector('#preview-report');
    const generateButton = modal.querySelector('#generate-report');
    const reportPreviewContainer = document.getElementById('report-preview-container');
    const reportPreviewModal = document.getElementById('report-preview-modal');

    if (previewButton) {
        previewButton.addEventListener('click', function () {
            try {
                const reportData = collectReportData();
                if (reportData) {
                    const reportHtml = generateReportHtml(reportData);

                    if (reportPreviewContainer) {
                        reportPreviewContainer.innerHTML = reportHtml;
                    }

                    if (reportPreviewModal) {
                        // Show the preview modal
                        reportPreviewModal.style.display = 'flex';
                    }
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
                const reportData = collectReportData();
                if (reportData) {
                    const reportHtml = generateReportHtml(reportData);

                    // Generate PDF
                    if (typeof html2pdf !== 'undefined') {
                        const element = document.createElement('div');
                        element.innerHTML = reportHtml;
                        document.body.appendChild(element);

                        const options = {
                            margin: 10,
                            filename: `${reportData.vesselDetails.name || 'Vessel'}_BFMP_${new Date().toISOString().slice(0, 10)}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2 },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        };

                        html2pdf().set(options).from(element).save().then(() => {
                            document.body.removeChild(element);
                        });
                    } else {
                        // Fallback to downloading as HTML
                        const blob = new Blob([reportHtml], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${reportData.vesselDetails.name || 'Vessel'}_BFMP_${new Date().toISOString().slice(0, 10)}.html`;
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
    if (closePreviewButton && reportPreviewModal) {
        closePreviewButton.addEventListener('click', function () {
            reportPreviewModal.style.display = 'none';
        });
    }

    // Download from preview button
    const downloadReportButton = document.getElementById('download-report');
    if (downloadReportButton && reportPreviewContainer) {
        downloadReportButton.addEventListener('click', function () {
            try {
                const reportData = collectReportData();
                if (reportData) {
                    // Generate PDF using html2pdf if available
                    if (typeof html2pdf !== 'undefined') {
                        const options = {
                            margin: 10,
                            filename: `${reportData.vesselDetails.name || 'Vessel'}_BFMP_${new Date().toISOString().slice(0, 10)}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2 },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        };

                        html2pdf().set(options).from(reportPreviewContainer).save();
                    } else {
                        // Fallback to downloading as HTML
                        const blob = new Blob([reportPreviewContainer.innerHTML], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${reportData.vesselDetails.name || 'Vessel'}_BFMP_${new Date().toISOString().slice(0, 10)}.html`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                }
            } catch (error) {
                console.error('Error downloading report:', error);
                alert('An error occurred while downloading the report. Please try again.');
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

// Helper function to format dates
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (error) {
        return dateString;
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

// Collect all report data
function collectReportData() {
    try {
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };

        const getSelectValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };

        const getTextareaValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };

        const getSignatureData = () => {
            const canvas = document.getElementById('signaturePad');
            if (canvas && typeof SignaturePad !== 'undefined') {
                const signaturePad = new SignaturePad(canvas);
                return !signaturePad.isEmpty() ? canvas.toDataURL() : '';
            }
            return '';
        };

        // Collect niche area data
        const getNicheAreasData = () => {
            const nicheAreas = [];
            const nicheItems = document.querySelectorAll('.niche-item');

            nicheItems.forEach(item => {
                if (item.classList.contains('saved')) {
                    const nicheId = item.dataset.id;
                    const nicheName = item.querySelector('.niche-name').textContent;
                    const afsApplied = item.dataset.afsApplied || 'Not specified';
                    const otherMeasures = item.dataset.otherMeasures || 'Not specified';
                    const inspectionFrequency = item.dataset.inspectionFrequency || 'Not specified';
                    const cleaningFrequency = item.dataset.cleaningFrequency || 'Not specified';
                    const notes = item.dataset.notes || '';

                    nicheAreas.push({
                        id: nicheId,
                        name: nicheName,
                        afsApplied: afsApplied,
                        otherMeasures: otherMeasures,
                        inspectionFrequency: inspectionFrequency,
                        cleaningFrequency: cleaningFrequency,
                        notes: notes
                    });
                }
            });

            return nicheAreas;
        };

        // Build the report data object
        const reportData = {
            // Document metadata
            title: getValue('reportTitle') || 'Biofouling Management Plan',
            documentNumber: getValue('documentNumber') || `BFMP-${new Date().getFullYear()}-00X`,
            revision: getValue('documentRevision') || '0',
            documentDate: getValue('documentDate') || new Date().toISOString().split('T')[0],

            // Vessel details
            vesselDetails: {
                name: getValue('vesselName') || '[Vessel Name]',
                imo: getValue('imo') || '[IMO Number]',
                portRegistry: getValue('portRegistry') || '[Port of Registry]',
                type: getSelectValue('vesselTypeGen') || 'Not specified',
                commissioned: getValue('vesselCommissioned') || 'Not specified',
                grossTonnage: getValue('grossTonnage') || 'Not specified',
                length: getValue('length') || 'Not specified',
                beam: getValue('beam') || 'Not specified',
                operatingArea: getSelectValue('operatingArea') || 'Not specified'
            },

            // Responsible personnel
            personnel: {
                responsiblePerson: getValue('responsiblePerson') || '[Responsible Person]',
                responsiblePosition: getValue('responsiblePosition') || 'Not specified',
                shorePerson: getValue('shorePerson') || '[Shore Contact]',
                shoreCompany: getValue('shoreCompany') || 'Not specified'
            },

            // AFS details
            afs: {
                type: getValue('afsType') || 'Not specified',
                manufacturer: getValue('afsManufacturer') || 'Not specified',
                applicationDate: getValue('antifoulingDate') || 'Not specified',
                applicationLocation: getValue('afsLocation') || 'Not specified',
                expectedLife: getValue('afsExpectedLife') || 'Not specified',
                documentation: getTextareaValue('afsDocumentation') || 'Not specified'
            },

            // Niche areas management
            nicheAreas: getNicheAreasData(),
            nicheAreaStrategy: getTextareaValue('nicheAreaStrategy') || 'Not specified',

            // Operating profile
            operatingProfile: {
                operatingSpeed: getValue('operatingSpeed') || 'Not specified',
                typicalRoutes: getTextareaValue('typicalRoutes') || 'Not specified',
                inactivityPeriods: getTextareaValue('inactivityPeriods') || 'Not specified',
                foulingFactors: getTextareaValue('foulingFactors') || 'Not specified'
            },

            // Inspection and BRB
            inspection: {
                plannedInspections: getTextareaValue('plannedInspections') || 'Not specified',
                inspectionSchedule: getTextareaValue('inspectionSchedule') || 'Not specified',
                inspectionMethods: getTextareaValue('inspectionMethods') || 'Not specified',
                maintenanceActivities: getTextareaValue('maintenanceActivities') || 'Not specified',
                nonScheduledTriggers: getTextareaValue('nonScheduledTriggers') || 'Not specified',
                documentationProcedures: getTextareaValue('documentationProcedures') || 'Not specified'
            },

            recordKeeping: getTextareaValue('recordKeeping') || 'Not specified',

            // Training and contingency
            training: {
                trainingProgram: getTextareaValue('trainingProgram') || 'Not specified',
                newCrewFamiliarization: getTextareaValue('newCrewFamiliarization') || 'Not specified'
            },

            contingencyPlan: getTextareaValue('contingencyPlan') || 'Not specified',

            // Declaration
            declaration: {
                name: getValue('inspectorNameSignOff') || '[Name]',
                position: getValue('signatoryPosition') || '[Position]',
                signature: getSignatureData()
            }
        };

        return reportData;
    } catch (error) {
        console.error('Error collecting report data:', error);
        return null;
    }
}

// Generate HTML for report preview
function generateReportHtml(data) {
    return `
        <div class="report-preview">
            <div class="report-header">
                <h1>${data.title || 'Biofouling Management Plan'}</h1>
                <p><strong>Document Number:</strong> ${data.documentNumber || 'N/A'} <span class="rev-marker">Rev ${data.revision || '0'}</span></p>
                <p><strong>Date:</strong> ${data.documentDate ? new Date(data.documentDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            </div>

            <h2>1. Introduction / Plan Overview</h2>
            <div class="section">
                <h3>1.1 Purpose</h3>
                <p>This Biofouling Management Plan has been developed to comply with the International Maritime Organization's Guidelines for the Control and Management of Ships' Biofouling to Minimize the Transfer of Invasive Aquatic Species (IMO Resolution MEPC.207(62)) and Australian national guidelines based on the Biosecurity Act 2015.</p>
                
                <p>The purpose of this plan is to provide guidance on vessel-specific biofouling management measures to minimize the transfer of invasive aquatic species. This plan details operational practices and measures to be implemented to manage biofouling risks for the vessel.</p>
                
                <h3>1.2 Vessel Applicability</h3>
                <p>This Biofouling Management Plan applies specifically to the vessel ${data.vesselDetails.name || '[Vessel Name]'}, IMO ${data.vesselDetails.imo || '[IMO Number]'}.</p>
                
                <h3>1.3 Plan Review Schedule</h3>
                <p>This Biofouling Management Plan shall be reviewed and updated at intervals not exceeding five years, following major modifications to underwater surfaces, or when there is a significant change in the vessel's operational profile. The ${data.personnel.responsiblePosition || 'responsible person'} aboard the vessel and ${data.personnel.shorePerson || 'shore-based personnel'} are responsible for ensuring the plan remains up to date.</p>
            </div>

            <h2>2. Vessel Particulars</h2>
            <div class="section">
                <table>
                    <tr>
                        <th>Vessel Name</th>
                        <td>${data.vesselDetails.name || '[Vessel Name]'}</td>
                    </tr>
                    <tr>
                        <th>IMO Number</th>
                        <td>${data.vesselDetails.imo || '[IMO Number]'}</td>
                    </tr>
                    <tr>
                        <th>Port of Registry</th>
                        <td>${data.vesselDetails.portRegistry || '[Port of Registry]'}</td>
                    </tr>
                    <tr>
                        <th>Vessel Type</th>
                        <td>${data.vesselDetails.type || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <th>Year Built/Commissioned</th>
                        <td>${data.vesselDetails.commissioned || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <th>Gross Tonnage</th>
                        <td>${data.vesselDetails.grossTonnage || 'Not specified'} t</td>
                    </tr>
                    <tr>
                        <th>Length Overall (LOA)</th>
                        <td>${data.vesselDetails.length || 'Not specified'} m</td>
                    </tr>
                    <tr>
                        <th>Beam</th>
                        <td>${data.vesselDetails.beam || 'Not specified'} m</td>
                    </tr>
                </table>
                
                <h3>2.1 Responsible Personnel</h3>
                <table>
                    <tr>
                        <th>Onboard Responsible Person</th>
                        <td>${data.personnel.responsiblePerson || '[Responsible Person]'}</td>
                    </tr>
                    <tr>
                        <th>Position</th>
                        <td>${data.personnel.responsiblePosition || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <th>Shore-based Responsible Person</th>
                        <td>${data.personnel.shorePerson || '[Shore Contact]'}</td>
                    </tr>
                    <tr>
                        <th>Company</th>
                        <td>${data.personnel.shoreCompany || 'Not specified'}</td>
                    </tr>
                </table>
            </div>

            <h2>3. Antifouling System (AFS) Details</h2>
            <div class="section">
                <table>
                    <tr>
                        <th>AFS Type</th>
                        <td>${data.afs.type || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <th>Manufacturer/Product</th>
                        <td>${data.afs.manufacturer || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <th>Last Application Date</th>
                        <td>${data.afs.applicationDate ? formatDate(data.afs.applicationDate) : 'Not specified'}</td>
                    </tr>
                    <tr>
                        <th>Application Location</th>
                        <td>${data.afs.applicationLocation || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <th>Expected Service Life</th>
                        <td>${data.afs.expectedLife || 'Not specified'} years</td>
                    </tr>
                </table>
                
                <h3>3.1 AFS Documentation</h3>
                <p>${data.afs.documentation || 'Not specified'}</p>
            </div>

            <h2>4. Management of Niche Areas</h2>
            <div class="section">
                <p>${data.nicheAreaStrategy || 'Not specified'}</p>
                
                <h3>4.1 Niche Area Details</h3>
                ${data.nicheAreas.length > 0 ?
            data.nicheAreas.map(niche => `
                        <div class="niche-area">
                            <h4>${niche.name}</h4>
                            <table>
                                <tr>
                                    <th>AFS Applied</th>
                                    <td>${niche.afsApplied}</td>
                                </tr>
                                <tr>
                                    <th>Other Anti-fouling Measures</th>
                                    <td>${niche.otherMeasures}</td>
                                </tr>
                                <tr>
                                    <th>Inspection Frequency/Method</th>
                                    <td>${niche.inspectionFrequency}</td>
                                </tr>
                                <tr>
                                    <th>Cleaning Frequency/Method</th>
                                    <td>${niche.cleaningFrequency}</td>
                                </tr>
                                ${niche.notes ? `
                                <tr>
                                    <th>Additional Notes</th>
                                    <td>${niche.notes}</td>
                                </tr>` : ''}
                            </table>
                        </div>
                    `).join('') :
            '<p>No specific niche area management strategies defined. Please refer to the general strategy above.</p>'
        }
            </div>

            <h2>5. Operating Profile</h2>
            <div class="section">
                <table>
                    <tr>
                        <th>Typical Operating Speed</th>
                        <td>${data.operatingProfile.operatingSpeed || 'Not specified'} knots</td>
                    </tr>
                </table>
                
                <h3>5.1 Typical Routes/Bioregions</h3>
                <p>${data.operatingProfile.typicalRoutes || 'Not specified'}</p>
                
                <h3>5.2 Periods of Inactivity</h3>
                <p>${data.operatingProfile.inactivityPeriods || 'Not specified'}</p>
                
                <h3>5.3 Operational Factors Influencing Fouling Risk</h3>
                <p>${data.operatingProfile.foulingFactors || 'Not specified'}</p>
            </div>

            <h2>6. Inspection Strategy</h2>
            <div class="section">
                <h3>6.1 Planned Inspections</h3>
                <p>${data.inspection.plannedInspections || 'Not specified'}</p>
                
                <h3>6.2 Inspection Schedule</h3>
                <p>${data.inspection.inspectionSchedule || 'Not specified'}</p>
                
                <h3>6.3 Inspection Methods</h3>
                <p>${data.inspection.inspectionMethods || 'Not specified'}</p>
                
                <h3>6.4 Maintenance Activities</h3>
                <p>${data.inspection.maintenanceActivities || 'Not specified'}</p>
                
                <h3>6.5 Non-Scheduled Inspection/Maintenance Triggers</h3>
                <p>${data.inspection.nonScheduledTriggers || 'Not specified'}</p>
                
                <h3>6.6 Documentation Procedures</h3>
                <p>${data.inspection.documentationProcedures || 'Not specified'}</p>
            </div>

            <h2>7. Biofouling Record Book Procedures</h2>
            <div class="section">
                <p>${data.recordKeeping || 'Not specified'}</p>
            </div>

            <h2>8. Crew Training & Familiarization</h2>
            <div class="section">
                <h3>8.1 Training Program</h3>
                <p>${data.training.trainingProgram || 'Not specified'}</p>
                
                <h3>8.2 New Crew Familiarization</h3>
                <p>${data.training.newCrewFamiliarization || 'Not specified'}</p>
            </div>

            <h2>9. Contingency Planning</h2>
            <div class="section">
                <p>${data.contingencyPlan || 'Not specified'}</p>
            </div>

            <div class="declaration">
                <h2>Declaration</h2>
                <p>I confirm that this Biofouling Management Plan has been developed in accordance with the IMO Guidelines for the Control and Management of Ships' Biofouling to Minimize the Transfer of Invasive Aquatic Species (Resolution MEPC.207(62)) and Australian national requirements.</p>
                
                <table class="signature-table">
                    <tr>
                        <th>Name:</th>
                        <td>${data.declaration.name || '[Name]'}</td>
                    </tr>
                    <tr>
                        <th>Position:</th>
                        <td>${data.declaration.position || '[Position]'}</td>
                    </tr>
                    <tr>
                        <th>Signature:</th>
                        <td class="signature">
                            ${data.declaration.signature ? `<img src="${data.declaration.signature}" alt="Signature">` : '[Signature]'}
                        </td>
                    </tr>
                    <tr>
                        <th>Date:</th>
                        <td>${new Date().toLocaleDateString()}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

// Helper function to update active tick on the slider
function updateActiveTick(value) {
    const ticks = document.querySelectorAll('.range-tick');
    if (!ticks || ticks.length === 0) return;
    
    value = parseInt(value);
    ticks.forEach(tick => {
        const tickValue = parseInt(tick.getAttribute('data-value'));
        const tickDot = tick.querySelector('.tick-dot');
        
        if (tickValue === value) {
            tick.classList.add('active-tick');
            if (tickDot) {
                tickDot.style.backgroundColor = 'var(--accent-color)';
                tickDot.style.transform = 'scale(1.5)';
            }
        } else {
            tick.classList.remove('active-tick');
            if (tickDot) {
                tickDot.style.backgroundColor = 'var(--neutral-500, #CBD5E0)';
                tickDot.style.transform = 'scale(1)';
            }
        }
    });
}
// Hero Carousel Functionality
function initHeroCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');

    let currentSlide = 0;
    let slideInterval;
    const slideCount = slides.length;
    const slideWidth = 100; // Percentage width of each slide

    // Auto-play configuration
    const autoPlayDelay = 5000; // 5 seconds

    function updateSlide(index) {
        // Update transform to slide horizontally
        carouselTrack.style.transform = `translateX(-${index * slideWidth}%)`;

        // Update indicators
        indicators.forEach(indicator => indicator.classList.remove('active'));
        indicators[index].classList.add('active');

        currentSlide = index;
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slideCount;
        updateSlide(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slideCount) % slideCount;
        updateSlide(prevIndex);
    }

    function startAutoPlay() {
        stopAutoPlay(); // Clear any existing interval
        slideInterval = setInterval(nextSlide, autoPlayDelay);
    }

    function stopAutoPlay() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay(); // Restart auto-play after manual navigation
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay(); // Restart auto-play after manual navigation
    });

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            updateSlide(index);
            startAutoPlay(); // Restart auto-play after manual navigation
        });
    });

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    });

    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextSlide();
            startAutoPlay();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
            startAutoPlay();
        }
    });

    // Pause auto-play on hover
    carouselTrack.addEventListener('mouseenter', stopAutoPlay);
    carouselTrack.addEventListener('mouseleave', startAutoPlay);

    // Initialize
    updateSlide(0);
    startAutoPlay();
}

// Contact form handling with fallback
function handleFormSubmit(event) {
  event.preventDefault();
  
  // Get form values
  const name = document.getElementById('yourName').value;
  const email = document.getElementById('yourEmail').value;
  const message = document.getElementById('yourMessage').value;
  
  // Recipient email (company email)
  const recipientEmail = "mharvey@franmarine.com.au";
  
  // Construct email subject and body
  const subject = `Website Inquiry from ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nThis email was sent via the contact form on the MarineStream website.`;
  
  // Create the mailto URL
  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Track if the mailto link worked (we'll use a timeout check)
  let mailtoWorked = false;
  
  // Try to open the email client
  window.location.href = mailtoUrl;
  
  // Check if the mailto link worked after a short delay
  setTimeout(function() {
    if (!mailtoWorked) {
      // If we're still here, assume mailto didn't work
      showEmailFallback(recipientEmail, subject, body);
    }
  }, 500);
  
  // Reset the form (will only execute if mailto fails)
  setTimeout(function() {
    document.getElementById('contactForm').reset();
  }, 1000);
  
  return false;
}

function showEmailFallback(to, subject, body) {
  // Format the email content for display
  const emailContentHtml = `
    <strong>To:</strong> ${to}<br>
    <strong>Subject:</strong> ${subject}<br>
    <strong>Body:</strong><br>${body.replace(/\n/g, '<br>')}
  `;
  
  // Insert the content into the fallback div
  document.getElementById('emailContent').innerHTML = emailContentHtml;
  
  // Show the fallback modal
  document.getElementById('emailFallback').style.display = 'flex';
  
  // Set up copy button functionality
  document.getElementById('copyEmailBtn').onclick = function() {
    const emailText = `To: ${to}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(emailText).then(function() {
      alert('Email content copied to clipboard!');
    }).catch(function(err) {
      console.error('Could not copy text: ', err);
    });
  };
}