// MarineStream Main JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Initialize core website functionality
    initWebsiteFunctions(); // Includes theme toggles, nav, etc.

    // Check for thank you parameter in URL and show thank you modal if present
    checkForThankYouParameter();

    // --- Helper Function to Toggle Modal --- (NEW)
    function toggleModal(modalElement, show) {
        if (!modalElement) return;
        if (show) {
            modalElement.classList.add('active'); // Use class for visibility
            document.body.classList.add('modal-open');
        } else {
            modalElement.classList.remove('active');
            // Only remove body class if no other modals are active
            if (!document.querySelector('.modal-overlay.active')) {
                document.body.classList.remove('modal-open');
            }
        }
    }

    // --- Set up Cost Calculator Modal ---
    const openCostCalculatorBtn = document.getElementById('open-cost-calculator');
    const costCalculatorModal = document.getElementById('cost-calculator-modal');

    if (openCostCalculatorBtn && costCalculatorModal) {
        openCostCalculatorBtn.addEventListener('click', function() {
            toggleModal(costCalculatorModal, true);
            // Initialize calculator if not already done
            if (!window.calculatorInitialized && typeof initHullFoulingCalculator === 'function') {
                initHullFoulingCalculator();
                window.calculatorInitialized = true; // Ensure it's initialized only once
            }
        });

        // Close Logic
        costCalculatorModal.addEventListener('click', function(event) {
            if (event.target === costCalculatorModal) { // Click outside content
                toggleModal(costCalculatorModal, false);
            }
        });
        const closeBtnCost = costCalculatorModal.querySelector('.modal-close');
        if (closeBtnCost) {
            closeBtnCost.addEventListener('click', () => toggleModal(costCalculatorModal, false));
        }
    }

    // --- Set up BFMP Modals ---
    console.log("Setting up BFMP Modals..."); // Log setup start
    const openBfmpBtn = document.getElementById('open-bfmp-generator');
    const bfmpInfoModal = document.getElementById('bfmp-info-modal');
    const bfmpGeneratorModal = document.getElementById('bfmp-generator-modal');
    const bfmpStartBtn = document.getElementById('bfmp-start-btn');

    // Verify elements exist
    if (!openBfmpBtn) console.error("SCRIPT ERROR: Button #open-bfmp-generator NOT FOUND!");
    if (!bfmpInfoModal) console.error("SCRIPT ERROR: Modal #bfmp-info-modal NOT FOUND!");
    if (!bfmpGeneratorModal) console.error("SCRIPT ERROR: Modal #bfmp-generator-modal NOT FOUND!");
    if (!bfmpStartBtn) console.error("SCRIPT ERROR: Button #bfmp-start-btn NOT FOUND!");

    // 1. Button to open the *initial* BFMP Info Modal
    if (openBfmpBtn && bfmpInfoModal) {
        console.log("SUCCESS: Found button #open-bfmp-generator and modal #bfmp-info-modal. Attaching listener...");
        openBfmpBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent potential conflicts
            console.log("--> Click detected on #open-bfmp-generator. Attempting to open #bfmp-info-modal using toggleModal"); // Log click event
            toggleModal(bfmpInfoModal, true); // Use the toggleModal function
            // bfmpInfoModal.style.display = 'flex'; // REMOVE DIRECT STYLE MANIPULATION
            // document.body.classList.add('modal-open'); // toggleModal handles body class
            console.log("Called toggleModal to open #bfmp-info-modal.")
        });
        console.log("Listener attached to #open-bfmp-generator.");
    } else {
        console.error("FAILED to attach listener: BFMP Info Modal trigger button or modal itself was not found earlier.");
    }

    // 2. Close BFMP Info Modal Logic (Close button and click outside)
    if (bfmpInfoModal) {
        bfmpInfoModal.addEventListener('click', function(event) {
            if (event.target === bfmpInfoModal) { // Click outside content
                 console.log("Closing BFMP Info Modal (click outside)");
                 toggleModal(bfmpInfoModal, false);
            }
        });
        const closeBtnInfo = bfmpInfoModal.querySelector('.modal-close');
        if (closeBtnInfo) {
            closeBtnInfo.addEventListener('click', () => {
                console.log("Closing BFMP Info Modal (close button)");
                toggleModal(bfmpInfoModal, false);
            });
        }
    }

    // 3. Handle the "Start Creating Your BFMP" button (inside Info Modal)
    if (bfmpStartBtn && bfmpInfoModal && bfmpGeneratorModal) {
        bfmpStartBtn.addEventListener('click', function() {
            console.log("Closing Info Modal, Opening Generator Modal");
            toggleModal(bfmpInfoModal, false); // Close info modal
            // Use a tiny timeout to ensure the close transition completes before opening the next
            setTimeout(() => {
                toggleModal(bfmpGeneratorModal, true); // Open generator modal
            }, 50); 
        });
    } else {
         console.error("BFMP Start button or one of the BFMP modals not found.");
    }

    // 4. Close BFMP Generator Modal Logic (Close button and click outside)
    if (bfmpGeneratorModal) {
        bfmpGeneratorModal.addEventListener('click', function(event) {
            if (event.target === bfmpGeneratorModal) { // Click outside content
                console.log("Closing BFMP Generator Modal (click outside)");
                toggleModal(bfmpGeneratorModal, false);
            }
        });
        const closeBtnGen = bfmpGeneratorModal.querySelector('.modal-close');
        if (closeBtnGen) {
            closeBtnGen.addEventListener('click', () => {
                console.log("Closing BFMP Generator Modal (close button)");
                toggleModal(bfmpGeneratorModal, false);
            });
        }
    }

    // --- Other Initializations ---
    if (document.getElementById('rov-video') || document.getElementById('ms-video') || document.getElementById('crawler-video')) {
        initVideos();
    }
    initHeroCarousel();
    initImageCarousel();
    initCustomButtons();
    initModals(); // Initialize Thank You and Fallback modals

    // --- BFMP Form Logic (remains the same) ---
    const bfmpForm = document.getElementById('bfmp-form');
    const bfmpResetBtn = document.getElementById('bfmp-reset-btn');
    // ... (rest of the form handling code, starting from line ~623 in original file)
    // Handle BFMP form submission
    // ... (Existing code for reset button, image upload, and form submission) ...
    if (bfmpResetBtn && bfmpForm) {
        bfmpResetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
                bfmpForm.reset();
                // Reset image preview if it exists
                const imagePreview = document.getElementById('imagePreview');
                const vesselImagePreview = document.getElementById('vesselImagePreview');
                if (imagePreview && vesselImagePreview) {
                    imagePreview.style.display = 'none';
                    vesselImagePreview.src = '';
                }
            }
        });
    }

    // Handle vessel image upload and preview
    const vesselImageUpload = document.getElementById('vesselImageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const vesselImagePreview = document.getElementById('vesselImagePreview');

    if (vesselImageUpload && imagePreview && vesselImagePreview) {
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
            const firstInvalidField = null;

            requiredFields.forEach(field => {
                // Checkboxes/Radio buttons might need different validation
                let fieldValid = true;
                if (field.type === 'checkbox' || field.type === 'radio') {
                    // Basic check: Ensure at least one in a group is checked if required
                    // More complex validation might be needed depending on setup
                    const groupName = field.name;
                    if (!bfmpForm.querySelector(`input[name="${groupName}"]:checked`)) {
                        fieldValid = false;
                    }
                } else if (field.multiple && field.tagName === 'SELECT') {
                     if (field.selectedOptions.length === 0) {
                         fieldValid = false;
                     }
                } else if (!field.value.trim()) {
                    fieldValid = false;
                }

                if (!fieldValid) {
                    isValid = false;
                    field.classList.add('error');
                    // Find parent group to show error (optional)
                     const formGroup = field.closest('.form-group');
                     if (formGroup) formGroup.classList.add('error-group');
                    if (!firstInvalidField) firstInvalidField = field;
                } else {
                    field.classList.remove('error');
                    const formGroup = field.closest('.form-group');
                     if (formGroup) formGroup.classList.remove('error-group');
                }
            });

            if (!isValid) {
                alert('Please fill in all required fields marked with *. Check highlighted fields.');
                 if (firstInvalidField) firstInvalidField.focus();
                return;
            }

            // Collect form data
            const formData = new FormData(bfmpForm);
            const bfmpData = {};

            // Handle regular form fields and multiple selects/checkboxes
            formData.forEach((value, key) => {
                // Check if it's a multiple select or checkbox field
                const field = bfmpForm.querySelector(`[name="${key}"]`);
                const isMultiple = (field && (field.multiple || field.type === 'checkbox'));

                if (isMultiple) {
                    if (!bfmpData[key]) {
                        bfmpData[key] = []; // Initialize as array
                    }
                    bfmpData[key].push(value);
                } else {
                    bfmpData[key] = value;
                }
            });

            // Handle the vessel image if provided
            const vesselImageInput = document.getElementById('vesselImageUpload');
            if (vesselImageInput && vesselImageInput.files && vesselImageInput.files[0] && vesselImagePreview.src) {
                // Use the preview image's data URL
                bfmpData.vesselImage = vesselImagePreview.src;
            }

            // Generate BFMP document
            generateBFMP(bfmpData);
        });
    }

    // Set up infinite scroll for logos
    const logosSlide = document.querySelector('.logos-slide');
    if (logosSlide) {
        // Clone all images
        const images = logosSlide.querySelectorAll('img');
        images.forEach(img => {
            const clone = img.cloneNode(true);
            logosSlide.appendChild(clone);
        });
    }
});

// === Core Website Functionality ===
// ... (initWebsiteFunctions remains mostly the same, ensure mobile menu logic is robust)
function initWebsiteFunctions() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links-container');

    if (navToggle && navLinksContainer) {
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Toggle menu visibility
            const isActive = navLinksContainer.classList.toggle('active');
            navToggle.classList.toggle('active', isActive);
            document.body.classList.toggle('mobile-menu-open', isActive); // Prevent body scroll

            // Change icon
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
            }
        });

        // Close menu when clicking a link
        navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinksContainer.classList.contains('active')) {
                    navLinksContainer.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.classList.remove('mobile-menu-open');
                    const icon = navToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                }
            });
        });

        // Close menu when clicking outside (if needed, ensure it doesn't interfere)
        // document.addEventListener('click', function(e) {
        //     if (navLinksContainer.classList.contains('active') && !navLinksContainer.contains(e.target) && !navToggle.contains(e.target)) {
        //         navLinksContainer.classList.remove('active');
        //         navToggle.classList.remove('active');
        //         document.body.classList.remove('mobile-menu-open');
        //         const icon = navToggle.querySelector('i');
        //         if (icon) icon.className = 'fas fa-bars';
        //     }
        // });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure it's an internal link before preventing default
            if (href.startsWith('#') && href.length > 1) {
                 e.preventDefault();
                 const target = document.querySelector(href);
                 if (target) {
                     const headerOffset = document.querySelector('.main-header')?.offsetHeight || 70;
                     const elementPosition = target.getBoundingClientRect().top;
                     const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                     window.scrollTo({
                         top: offsetPosition,
                         behavior: 'smooth'
                     });

                     // Close mobile menu if open (handled by link click listener above)
                 }
            }
        });
    });

}


// Function to check for thank you parameter in URL
function checkForThankYouParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('thankyou') && urlParams.get('thankyou') === 'true') {
        // Show thank you modal
        const thankYouModal = document.getElementById('thank-you-modal');
        if (thankYouModal) {
             // Use the helper function
            if (typeof toggleModal === 'function') {
                 toggleModal(thankYouModal, true);
            } else {
                 // Fallback if called before DOMContentLoaded finishes
                 thankYouModal.style.display = 'flex';
                 document.body.classList.add('modal-open');
            }

            // Clear the parameter from URL without page refresh
            try {
                 const newUrl = window.location.pathname + window.location.hash;
                 window.history.replaceState({}, document.title, newUrl);
            } catch (e) {
                console.warn("Could not update URL history.");
            }
        }
    }
}

// Initialize Thank You and Fallback Modals
function initModals() {
     function setupGenericModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;

        const closeButtons = modalElement.querySelectorAll('.modal-close, .thank-you-close-btn'); // Include specific button if needed

        const closeModal = () => {
            if (typeof toggleModal === 'function') {
                toggleModal(modalElement, false);
            } else {
                modalElement.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        };

        closeButtons.forEach(btn => btn.addEventListener('click', closeModal));

        modalElement.addEventListener('click', function(event) {
             if (event.target === modalElement) {
                 closeModal();
             }
        });
    }

    setupGenericModal('thank-you-modal');
    setupGenericModal('emailFallback');
}

// === Video Initialization (with Autoplay) ===
// ... (initVideos remains the same) ...
function initVideos() {
    function setupVideo(videoId, buttonId) {
        const video = document.getElementById(videoId);
        const playBtn = document.getElementById(buttonId);
        const videoContainer = video ? video.closest('.video-container') : null; // Get container

        if (!video || !playBtn || !videoContainer) {
            // console.warn(`Video setup failed for: ${videoId}`);
            return;
        }

        // Function to update button state
        const updateButtonState = (isPlaying) => {
            if (isPlaying) {
                playBtn.classList.add('playing');
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                videoContainer.classList.add('video-playing');
            } else {
                playBtn.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                videoContainer.classList.remove('video-playing');
            }
        };

        // Set up play button
        playBtn.addEventListener('click', function () {
            if (video.paused || video.ended) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        updateButtonState(true);
                    }).catch(error => {
                        console.error("Video playback error:", error);
                        // Try forcing mute and playing again on user interaction
                        video.muted = true;
                        video.play().then(() => updateButtonState(true)).catch(e => console.error("Second play attempt failed:", e));
                    });
                }
            } else {
                video.pause();
                updateButtonState(false);
            }
        });

        // Update button state on video events
        video.addEventListener('play', () => updateButtonState(true));
        video.addEventListener('pause', () => updateButtonState(false));
        video.addEventListener('ended', () => {
            updateButtonState(false);
            video.currentTime = 0; // Optional: Reset video to start
        });

        // Intersection Observer for Autoplay (if enabled)
        if (video.dataset.autoplay === 'true') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Attempt autoplay only if paused
                        if(video.paused) {
                            video.muted = true; // Ensure muted for autoplay
                            const autoPlayPromise = video.play();
                            if (autoPlayPromise !== undefined) {
                                autoPlayPromise.catch(err => {
                                    // Autoplay likely prevented, log it but don't change UI state
                                    console.log(`Autoplay prevented for ${videoId}:`, err);
                                    updateButtonState(false); // Ensure button shows play if autoplay fails
                                });
                            }
                        }
                    } else {
                        // Pause when not visible
                        if (!video.paused) {
                            video.pause();
                        }
                    }
                });
            }, { threshold: 0.5 }); // Trigger when 50% visible

            observer.observe(videoContainer);
        } else {
             // Set initial state for non-autoplay videos
             updateButtonState(false);
        }
    }

    // Set up the specific videos
    setupVideo('rov-video', 'rov-play-btn');
    setupVideo('crawler-video', 'crawler-play-btn');
    setupVideo('ms-video', 'ms-play-btn');
}

// Initialize hero carousel
// ... (initHeroCarousel remains the same) ...
function initHeroCarousel() {
    // Only initialize on screens larger than 768px
    if (window.innerWidth <= 768) return;

    const carousel = document.querySelector('.carousel-container'); // Assuming this class exists for the hero carousel
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicatorsContainer = carousel.querySelector('.carousel-indicators'); // Assuming this exists
    const prevButton = carousel.querySelector('.prev'); // Assuming this exists
    const nextButton = carousel.querySelector('.next'); // Assuming this exists

    if (!track || slides.length === 0) return;

    let indicators = [];
    if (indicatorsContainer) {
        // Dynamically create indicators if needed, or select existing ones
        // Example: indicators = indicatorsContainer.querySelectorAll('.indicator');
    }

    let currentSlide = 0;
    let autoplayInterval;
    const autoplayDelay = 5000; // 5 seconds

    // Function to set active slide
    function setActiveSlide(index) {
        // Bounds check
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        currentSlide = index;

        // Update slide position
        track.style.transform = `translateX(-${index * 100}%)`;

        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Update slides (optional: for accessibility or specific styling)
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            slide.setAttribute('aria-hidden', i !== index);
        });
    }

    // Function to start/reset autoplay
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            setActiveSlide(currentSlide + 1);
        }, autoplayDelay);
    }

    // Set up indicators if they exist
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            setActiveSlide(index);
            resetAutoplay();
        });
    });

    // Set up prev/next buttons if they exist
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            setActiveSlide(currentSlide - 1);
            resetAutoplay();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            setActiveSlide(currentSlide + 1);
            resetAutoplay();
        });
    }

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    carousel.addEventListener('mouseleave', resetAutoplay);

    // Initial setup
    setActiveSlide(0);
    resetAutoplay();
}

// Initialize the new image carousel for Diver Cleaning section
// ... (initImageCarousel remains the same) ...
function initImageCarousel() {
    const carousel = document.querySelector('.image-carousel-showcase');
    if (!carousel) return;

    const track = carousel.querySelector('.image-carousel-track');
    const slides = carousel.querySelectorAll('.image-carousel-slide');
    const indicators = carousel.querySelectorAll('.carousel-indicators .indicator');

    if (!track || slides.length === 0 || indicators.length === 0) return;

    let currentSlide = 0;
    let autoplayInterval;
    const slideInterval = 4000; // Interval in milliseconds (e.g., 4 seconds)

    function setActiveSlide(index) {
        // Bounds check
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        currentSlide = index;

        // Move the track
        track.style.transform = `translateX(-${index * 100}%)`;

        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Update slide active class (optional, for potential future styling)
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        setActiveSlide(currentSlide + 1);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(nextSlide, slideInterval);
    }

    // Add event listeners to indicators
    indicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const slideIndex = parseInt(indicator.getAttribute('data-slide-to'));
            setActiveSlide(slideIndex);
            resetAutoplay(); // Reset timer when user interacts
        });
    });

    // Set initial state
    setActiveSlide(0);
    resetAutoplay(); // Start autoplay

    // Optional: Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    carousel.addEventListener('mouseleave', resetAutoplay);
}

// === Custom button functionality ===
// ... (initCustomButtons remains the same, ensure mailto fallback works)
function initCustomButtons() {
    // Helper function for mailto links with fallback
    function setupMailtoButton(buttonId, subject, body) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default if it's an anchor
                const mailtoSubject = encodeURIComponent(subject);
                const mailtoBody = encodeURIComponent(body);
                const mailtoLink = `mailto:info@marinestream.com.au?subject=${mailtoSubject}&body=${mailtoBody}`;

                // Try to open mail client
                const mailWindow = window.open(mailtoLink, '_self');

                // Fallback timeout
                setTimeout(() => {
                    // Check if window failed to open or closed immediately
                    if (!mailWindow || mailWindow.closed || typeof mailWindow.closed === 'undefined') {
                        showEmailFallback(body, subject); // Pass subject too
                    }
                }, 500); // 500ms delay seems reasonable
            });
        }
    }

    // --- Set up specific buttons --- 
    // Note: IDs like 'rov-inspection-btn', 'cleaning-demo-btn' aren't in the HTML provided.
    // Assuming they might exist or these are placeholder examples.
    setupMailtoButton('rov-inspection-btn', "ROV Inspection Services Inquiry", "I'd like to learn more about your ROV inspection services.");
    setupMailtoButton('cleaning-demo-btn', "Cleaning Demonstration Request", "I'd like to request a cleaning demonstration.");

    // Handle 'Learn More' button (if it triggers PDF or something else)
    const learnMoreBtn = document.getElementById('learn-more-btn'); // ID not found in HTML
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            if (typeof showCapabilityStatement === 'function') { // Assuming this function exists elsewhere
                showCapabilityStatement();
            } else {
                console.warn('showCapabilityStatement function not found.');
                // Potentially link to a relevant section instead
                // window.location.href = '#about';
            }
        });
    }

    // Initialize social media links (if needed)
    initSocialMediaLinks();
}

// Social media links
// ... (initSocialMediaLinks remains the same) ...
function initSocialMediaLinks() {
    // Target specific links if they exist, e.g., in footer or contact section
    const socialLinks = document.querySelectorAll('.social-link');

    socialLinks.forEach(link => {
        const platform = link.getAttribute('aria-label')?.toLowerCase();
        let url;

        switch (platform) {
            case 'linkedin':
                url = "https://www.linkedin.com/company/marinestream/posts/?feedView=all"; // Corrected URL
                break;
            case 'facebook':
                url = "https://www.facebook.com/profile.php?id=100029694686734";
                break;
            case 'youtube':
                url = "https://www.youtube.com/@MarineStream";
                break;
        }

        if (url) {
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
    });
}


// Email fallback functionality
function showEmailFallback(messageBody, subject = "MarineStream Inquiry") {
    const fallbackModal = document.getElementById('emailFallback');
    const emailContentDiv = document.getElementById('emailContent');
    const copyEmailBtn = document.getElementById('copyEmailBtn');

    if (fallbackModal && emailContentDiv) {
        // Construct full content for copy
        const fullEmailContent = `To: info@marinestream.com.au\nSubject: ${subject}\n\n${messageBody}`;
        emailContentDiv.textContent = fullEmailContent; // Show full content

        if (typeof toggleModal === 'function') {
             toggleModal(fallbackModal, true);
        } else {
            fallbackModal.style.display = 'flex';
        }

        if (copyEmailBtn) {
            // Remove previous listener to avoid multiple copies
            const newCopyBtn = copyEmailBtn.cloneNode(true);
            copyEmailBtn.parentNode.replaceChild(newCopyBtn, copyEmailBtn);

            newCopyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(fullEmailContent).then(() => {
                    alert('Email content copied to clipboard!');
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                    alert('Failed to copy content. Please copy manually.');
                });
            });
        }

        // Update webmail links (if needed)
        const gmailLink = fallbackModal.querySelector('a[href*="mail.google.com"]');
        const outlookLink = fallbackModal.querySelector('a[href*="outlook.live.com"]');
        const yahooLink = fallbackModal.querySelector('a[href*="mail.yahoo.com"]');

        if (gmailLink) gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=info@marinestream.com.au&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
        if (outlookLink) outlookLink.href = `https://outlook.live.com/mail/0/deeplink/compose?to=info@marinestream.com.au&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
        if (yahooLink) yahooLink.href = `https://mail.yahoo.com/d/compose?to=info@marinestream.com.au&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;

    }
}


// Helper function to format dates
// ... (formatDate remains the same) ...
function formatDate(dateString) {
    if (!dateString) return 'N/A'; // Handle empty dates
    try {
        // Try creating date assuming YYYY-MM-DD format first
        const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
        if (isNaN(date.getTime())) {
            // If invalid, try parsing differently (might not be needed if input type=date)
             return dateString; // Return original if parsing fails
        }
        // Use locale string format for better readability
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return dateString; // Return original on error
    }
}

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

         // Helper to safely get data or return 'N/A'
        const getData = (key, defaultValue = 'N/A') => data[key] || defaultValue;
        const formatList = (key) => {
            const items = data[key];
            if (Array.isArray(items) && items.length > 0) {
                return items.map(item => `<li>${item}</li>`).join('');
            } else if (typeof items === 'string' && items) {
                 return `<li>${items}</li>`; // Handle single selection from multiple
            } else {
                // Provide default list items if data is missing
                switch(key) {
                    case 'nicheAreas':
                        return `<li>Sea chests and cooling systems</li><li>Rudder hinges and stabiliser fins</li><li>Propellers and shafts</li><li>Thrusters and tunnels</li><li>Gratings and chain lockers</li>`;
                    default:
                        return '<li>No specific items listed.</li>';
                }
            }
        };

        // Write the HTML content to the new window
        bfmpWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Biofouling Management Plan - ${getData('vesselName')}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 20px;
                        padding: 0;
                    }
                    .page-container {
                        max-width: 800px;
                        margin: 0 auto;
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
                        font-size: 24px;
                    }
                    .section {
                        margin-bottom: 30px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #eee;
                        page-break-inside: avoid;
                    }
                    h2 {
                        color: #ff6600;
                        margin-bottom: 15px;
                        font-size: 18px;
                    }
                    h3 {
                        color: #333;
                        margin-bottom: 10px;
                        font-size: 16px;
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
                        font-size: 14px;
                    }
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                        width: 30%; /* Give label column fixed width */
                    }
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 0.9em;
                        color: #777;
                        border-top: 1px solid #eee;
                        padding-top: 15px;
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
                        max-width: 180px;
                        height: auto;
                        margin-bottom: 15px;
                    }
                    .vessel-image {
                        max-width: 90%;
                        max-height: 300px;
                        height: auto;
                        margin: 15px auto;
                        border: 1px solid #ddd;
                        display: block;
                    }
                     ul, ol { padding-left: 25px; margin-top: 5px; }
                     li { margin-bottom: 5px; }
                    @media print {
                        body { margin: 10px; }
                        .print-btn { display: none; }
                        .page-container { max-width: 100%; }
                        .bfmp-header { border-bottom: 1px solid #ccc; }
                        h1, h2 { color: #000; }
                        table { font-size: 11pt; }
                        th, td { padding: 6px; }
                        .footer { margin-top: 30px; }
                    }
                </style>
            </head>
            <body>
             <div class="page-container">
                <div class="bfmp-header">
                    <img src="./assets/marinestream_logo_colour.png" alt="MarineStream Logo" class="logo">
                    <h1>Biofouling Management Plan</h1>
                    <p><strong>Vessel: ${getData('vesselName')}</strong> (${getData('vesselType')})</p>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                    ${data.vesselImage ? `<img src="${data.vesselImage}" alt="${getData('vesselName')}" class="vessel-image">` : ''}
                </div>

                <div class="section">
                    <h2>1. Vessel Information</h2>
                    <table>
                        <tr><th>Vessel Name</th><td>${getData('vesselName')}</td></tr>
                        <tr><th>IMO Number</th><td>${getData('imoNumber')}</td></tr>
                        <tr><th>Flag State</th><td>${getData('flagState')}</td></tr>
                        <tr><th>Vessel Type</th><td>${getData('vesselType')}</td></tr>
                        <tr><th>Length Overall (m)</th><td>${getData('vesselLength')}</td></tr>
                        <tr><th>Gross Tonnage</th><td>${getData('grossTonnage')}</td></tr>
                        <tr><th>Year Built</th><td>${getData('yearBuilt')}</td></tr>
                        <tr><th>Call Sign</th><td>${getData('callSign')}</td></tr>
                        <tr><th>Home Port</th><td>${getData('homePort')}</td></tr>
                        <tr><th>Owner/Operator</th><td>${getData('owner')}</td></tr>
                    </table>
                </div>

                <div class="section">
                    <h2>2. Antifouling System</h2>
                    <table>
                        <tr><th>System Type</th><td>${getData('afSystem')}</td></tr>
                        <tr><th>Application Date</th><td>${formatDate(getData('afApplication', ''))}</td></tr>
                        <tr><th>Valid Until</th><td>${formatDate(getData('afValidity', ''))}</td></tr>
                        <tr><th>Manufacturer</th><td>${getData('afManufacturer')}</td></tr>
                        <tr><th>Product Name</th><td>${getData('afProduct')}</td></tr>
                         <tr><th>Color</th><td>${getData('afColor')}</td></tr>
                    </table>
                    <h3>Additional Details</h3>
                    <p>${getData('afDetails', 'No additional details provided.')}</p>
                </div>

                <div class="section">
                    <h2>3. Inspection and Maintenance</h2>
                    <table>
                         <tr><th>Inspection Frequency</th><td>${getData('inspectionFrequency')}</td></tr>
                         <tr><th>Primary Cleaning Method</th><td>${getData('cleaningMethod')}</td></tr>
                    </table>
                    <h3>Niche Areas to Monitor</h3>
                    <ul>${formatList('nicheAreas')}</ul>
                    <h3>Maintenance Strategy</h3>
                    <p>${getData('maintenanceDetails', 'Standard maintenance procedures will be followed.')}</p>
                </div>

                <div class="section">
                    <h2>4. Operational Profile</h2>
                     <table>
                         <tr><th>Primary Operating Regions</th><td>${formatList('operatingRegions')}</td></tr>
                         <tr><th>Trading Pattern</th><td>${getData('tradingPattern')}</td></tr>
                         <tr><th>Average Operating Speed (knots)</th><td>${getData('avgSpeed')}</td></tr>
                         <tr><th>Average Port Calls per Year</th><td>${getData('portCalls')}</td></tr>
                         <tr><th>Typical Layup Periods</th><td>${getData('layupPeriods')}</td></tr>
                    </table>
                </div>

                 <div class="section">
                    <h2>5. Procedures & Contingency</h2>
                    <h3>Contingency Measures</h3>
                    <p>If significant biofouling is detected, actions include assessment, determining cleaning needs, selecting appropriate methods, and documenting in the Record Book.</p>
                    <h3>Recordkeeping</h3>
                    <p>All activities (inspections, cleaning, maintenance) will be logged in the Biofouling Record Book and retained per regulations.</p>
                </div>

                <div class="section">
                    <h2>6. Crew Training</h2>
                    <p>${getData('trainingDetails', 'Relevant crew members will be trained on this plan, inspection methods, and documentation.')}</p>
                </div>

                 <div class="section">
                    <h2>7. Plan Review</h2>
                    <p>This plan will be reviewed annually or following significant changes (operations, regulations, maintenance). Plan Approval Authority: ${getData('approvalAuthority', 'Ship Management')}.</p>
                </div>

                <div class="footer">
                    <p>Generated by MarineStream™ | info@marinestream.com.au</p>
                </div>

                <button class="print-btn" onclick="window.print()">Print BFMP</button>
              </div>
            </body>
            </html>
        `);
        bfmpWindow.document.close();

        // Close the generator modal AFTER generating the document
        const bfmpGeneratorModal = document.getElementById('bfmp-generator-modal');
        if (bfmpGeneratorModal && typeof toggleModal === 'function') {
            toggleModal(bfmpGeneratorModal, false);
        } else if (bfmpGeneratorModal) {
             bfmpGeneratorModal.style.display = 'none';
             document.body.classList.remove('modal-open');
        }

    } catch (error) {
        console.error('Error generating BFMP:', error);
        alert('An error occurred while generating the BFMP. Please check console for details.');
    }
}


// Hero video autoplay logic (ensure it runs after DOM is ready)
// ... (remains the same) ...
document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.muted = true; // Ensure muted for autoplay
        const playPromise = heroVideo.play();

        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log("Hero video autoplay attempt failed initially:", err);
                // No need for complex retry logic here, browsers handle interaction requirement
            });
        }
    }
});
