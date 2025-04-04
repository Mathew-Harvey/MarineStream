// MarineStream Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
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


// === Hull Fouling Cost Calculator ===
function initHullFoulingCalculator() {
    const modal = document.getElementById('cost-calculator-modal');
    if (!modal) {
        console.error('Hull Fouling Calculator Modal not found');
        return;
    }
    
    // Initialize window.myChart to null
    window.myChart = null;

    console.log('Initializing Hull Fouling Calculator...');

    // Set default values
    loadVesselDefaults('tug'); // Default to tug

    // Initialize the slider
    const frSlider = document.getElementById('frSlider');
    const frLabel = document.getElementById('frLabel');
    
    if (frSlider && frLabel) {
        frSlider.addEventListener('input', function() {
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
            tick.addEventListener('click', function() {
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
        vesselTypeSelect.addEventListener('change', function() {
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
        input.addEventListener('input', function() {
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
        currencySelect.addEventListener('change', function() {
            try {
                updateCalculator();
            } catch (error) {
                console.error("Error updating calculator:", error);
            }
        });
    }

    // Initialize the calculator with default values
    // Defer this slightly to ensure all elements are properly loaded
    setTimeout(() => {
        try {
            updateCalculator();
        } catch (error) {
            console.error("Error initializing calculator:", error);
        }
    }, 100);
}

// Hull Fouling Cost Calculator Functions
function updateCalculator() {
    try {
        // Get form values
        const vesselType = document.getElementById('vesselTypeCalc').value;
        const costEco = parseFloat(document.getElementById('costEco').value) || 0;
        const costFull = parseFloat(document.getElementById('costFull').value) || 0;
        const frValue = parseInt(document.getElementById('frSlider').value) || 0;
        const currencySymbol = getCurrencySymbol();
        
        // Calculate fouling impact based on FR value
        const frImpacts = [0, 0.15, 0.35, 0.6, 0.95, 1.93]; // Impact percentages for FR0-FR5
        const frImpact = frImpacts[frValue];
        
        // Calculate costs at different speeds
        const cleanEco = costEco;
        const cleanCruise = (costEco + costFull) / 2;
        const cleanFull = costFull;
        
        const fouledEco = cleanEco * (1 + frImpact);
        const fouledCruise = cleanCruise * (1 + frImpact);
        const fouledFull = cleanFull * (1 + frImpact);
        
        // Update results text
        const resultsText = document.getElementById('resultsText');
        if (resultsText) {
            resultsText.innerHTML = `
                <p>At <strong>FR${frValue}</strong>, your vessel experiences a <strong>${(frImpact * 100).toFixed(0)}%</strong> increase in friction resistance.</p>
                <p>This translates to:</p>
                <ul>
                    <li>Economic speed: <strong>${formatCurrency(cleanEco)}</strong> → <strong>${formatCurrency(fouledEco)}</strong> per hour (${formatCurrency(fouledEco - cleanEco)} extra)</li>
                    <li>Cruising speed: <strong>${formatCurrency(cleanCruise)}</strong> → <strong>${formatCurrency(fouledCruise)}</strong> per hour (${formatCurrency(fouledCruise - cleanCruise)} extra)</li>
                    <li>Full speed: <strong>${formatCurrency(cleanFull)}</strong> → <strong>${formatCurrency(fouledFull)}</strong> per hour (${formatCurrency(fouledFull - cleanFull)} extra)</li>
                </ul>
                <p>Annual cost impact at 70% utilization: <strong>${formatCurrency((fouledEco - cleanEco) * 24 * 365 * 0.7)}</strong></p>
            `;
        }
        
        // Update chart
        const chartCanvas = document.getElementById('myChart');
        if (!chartCanvas) return;
        
        // Check if chart instance already exists and destroy it
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }
        
        // Create chart data
        const chartData = {
            labels: ['Economic Speed', 'Cruising Speed', 'Full Speed'],
            datasets: [
                {
                    label: 'Clean Hull',
                    data: [cleanEco, cleanCruise, cleanFull],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: `Fouled Hull (FR${frValue})`,
                    data: [fouledEco, fouledCruise, fouledFull],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        };
        
        // Chart options
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: `Operating Cost (${currencySymbol})`
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, false);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Vessel Speed'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        };
        
        // Create new chart
        const ctx = chartCanvas.getContext('2d');
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
    } catch (error) {
        console.error("Error updating calculator:", error);
    }
}

// Get currency symbol based on selected currency
function getCurrencySymbol() {
    const currencySelect = document.getElementById('currencySelect');
    if (!currencySelect) return '$'; // Default to $ if element not found
    
    const currency = currencySelect.value;
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'AUD': 'A$'
    };
    
    return symbols[currency] || '$';
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
function loadVesselDefaults(vesselType) {
    // Default values for different vessel types
    const defaults = {
        tug: {
            costEco: 150,
            costFull: 450
        },
        cruiseShip: {
            costEco: 850,
            costFull: 2500
        },
        osv: {
            costEco: 300,
            costFull: 900
        },
        coaster: {
            costEco: 500,
            costFull: 1500
        }
    };
    
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
    const vesselDefaults = defaults[vesselType] || defaults.tug;
    
    // Update form inputs
    const costEcoInput = document.getElementById('costEco');
    const costFullInput = document.getElementById('costFull');
    
    if (costEcoInput) costEcoInput.value = vesselDefaults.costEco;
    if (costFullInput) costFullInput.value = vesselDefaults.costFull;
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
        button.addEventListener('click', function() {
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
        button.addEventListener('click', function() {
            const nextTabId = this.dataset.next;
            const nextTab = modal.querySelector(`.tab-btn[data-tab="${nextTabId}"]`);
            
            if (nextTab) {
                nextTab.click();
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
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
        item.addEventListener('click', function() {
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
        saveComponentButton.addEventListener('click', function() {
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
            clearSignatureBtn.addEventListener('click', function() {
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
        previewButton.addEventListener('click', function() {
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
        generateButton.addEventListener('click', function() {
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
        closePreviewButton.addEventListener('click', function() {
            reportPreviewModal.style.display = 'none';
        });
    }
    
    // Download from preview button
    const downloadReportButton = document.getElementById('download-report');
    if (downloadReportButton && reportPreviewContainer) {
        downloadReportButton.addEventListener('click', function() {
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
        modal.addEventListener('click', function(event) {
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
        if (tickValue === value) {
            tick.classList.add('active-tick');
        } else {
            tick.classList.remove('active-tick');
        }
    });
}