// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggling
    initThemeToggle();
    
    // Mobile Navigation
    initMobileNavigation();
    
    // Animations
    initAnimations();
    
    // Intersection Observer for Animation on Scroll
    initAOS();
    
    // Header Scroll Effect
    initHeaderScroll();
    
    // Smooth Scrolling for Anchor Links
    initSmoothScroll();
    
    // Logo Carousel
    initLogoCarousel();
});

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply initial theme
    htmlElement.setAttribute('data-theme', savedTheme);
    updateToggleIcon(savedTheme);
    
    // Add click event to theme toggle
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
    });
}

function updateToggleIcon(theme) {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (theme === 'dark') {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Mobile Navigation
function initMobileNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links-container');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            
            // Update icon
            if (navLinksContainer.classList.contains('active')) {
                mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            } else {
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = ''; // Restore scrolling
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (
            navLinksContainer.classList.contains('active') && 
            !navLinksContainer.contains(e.target) && 
            !mobileMenuToggle.contains(e.target)
        ) {
            navLinksContainer.classList.remove('active');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
}

// Logo Carousel Functionality
function initLogoCarousel() {
    const carousel = document.querySelector('.logo-carousel');
    const slides = document.querySelectorAll('.logo-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!carousel || slides.length === 0) return;
    
    let slideWidth = slides[0].offsetWidth + 20; // slide width + gap
    let slidesPerView = getSlidesPerView();
    let currentIndex = 0;
    let maxIndex = slides.length - slidesPerView;
    
    // Auto scroll
    let autoScrollInterval;
    startAutoScroll();
    
    // Update slide width on resize
    window.addEventListener('resize', () => {
        slideWidth = slides[0].offsetWidth + 20;
        slidesPerView = getSlidesPerView();
        maxIndex = slides.length - slidesPerView;
        goToSlide(currentIndex);
    });
    
    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        stopAutoScroll();
        goToSlide(Math.max(currentIndex - 1, 0));
        startAutoScroll();
    });
    
    nextBtn.addEventListener('click', () => {
        stopAutoScroll();
        goToSlide(Math.min(currentIndex + 1, maxIndex));
        startAutoScroll();
    });
    
    // Touch and swipe support
    let startX, endX;
    carousel.addEventListener('touchstart', (e) => {
        stopAutoScroll();
        startX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoScroll();
    }, { passive: true });
    
    function handleSwipe() {
        const diff = startX - endX;
        const threshold = 50;
        
        if (diff > threshold) {
            // Swipe left - go to next slide
            goToSlide(Math.min(currentIndex + 1, maxIndex));
        } else if (diff < -threshold) {
            // Swipe right - go to previous slide
            goToSlide(Math.max(currentIndex - 1, 0));
        }
    }
    
    function goToSlide(index) {
        currentIndex = index;
        carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        // Update button state
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === maxIndex;
        
        // UI feedback
        prevBtn.style.opacity = currentIndex === 0 ? 0.5 : 1;
        nextBtn.style.opacity = currentIndex === maxIndex ? 0.5 : 1;
    }
    
    function startAutoScroll() {
        stopAutoScroll();
        autoScrollInterval = setInterval(() => {
            currentIndex = (currentIndex >= maxIndex) ? 0 : currentIndex + 1;
            goToSlide(currentIndex);
        }, 3000);
    }
    
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
    }
    
    function getSlidesPerView() {
        const containerWidth = carousel.parentElement.offsetWidth;
        if (containerWidth < 576) return 3;
        if (containerWidth < 768) return 4;
        return 5;
    }
    
    // Pause auto scroll on hover
    carousel.parentElement.addEventListener('mouseenter', stopAutoScroll);
    carousel.parentElement.addEventListener('mouseleave', startAutoScroll);
}

// GSAP Animations
function initAnimations() {
    // Hero section animations
    gsap.from(".hero-title", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
    
    gsap.from(".hero-subtitle", {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
    });
    
    gsap.from(".hero-cta", {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.6,
        ease: "power3.out"
    });
    
    gsap.from(".floating-image", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        delay: 0.4,
        ease: "power3.out"
    });
    
    // Section heading animations
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
                toggleActions: "play none none none"
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    });
    
    // Feature card animations with stagger
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length) {
        gsap.from(featureCards, {
            scrollTrigger: {
                trigger: '.feature-grid',
                start: "top 75%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        });
    }
    
    // Dashboard features animation
    const dashboardFeatures = document.querySelectorAll('.dashboard-feature');
    if (dashboardFeatures.length) {
        gsap.from(dashboardFeatures, {
            scrollTrigger: {
                trigger: '.dashboard-features',
                start: "top 80%",
            },
            x: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        });
    }
}

// Animation on Scroll (AOS) - custom implementation
function initAOS() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const handleIntersect = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    };
    
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Header Scroll Effect
function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form Submission
const contactForms = document.querySelectorAll('.contact-form');
contactForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        const valid = validateForm(this);
        if (!valid) return;
        
        // Get submit button
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual form submission)
        setTimeout(() => {
            // Show success state
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success-message';
            successMessage.innerHTML = 'Thank you for your message. We\'ll get back to you soon!';
            form.appendChild(successMessage);
            
            // Reset form
            form.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Remove success message after fade out
                successMessage.style.opacity = 0;
                setTimeout(() => {
                    form.removeChild(successMessage);
                }, 500);
            }, 3000);
        }, 1500);
    });
});

// Form validation
function validateForm(form) {
    let valid = true;
    const inputs = form.querySelectorAll('input, textarea');
    
    // Remove existing error messages
    const existingErrors = form.querySelectorAll('.input-error');
    existingErrors.forEach(error => error.remove());
    
    inputs.forEach(input => {
        input.classList.remove('error');
        
        if (input.required && !input.value.trim()) {
            valid = false;
            markAsInvalid(input, 'This field is required');
        } else if (input.type === 'email' && input.value.trim() && !isValidEmail(input.value)) {
            valid = false;
            markAsInvalid(input, 'Please enter a valid email address');
        }
    });
    
    return valid;
}

function markAsInvalid(input, message) {
    input.classList.add('error');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'input-error';
    errorMessage.textContent = message;
    
    input.parentNode.appendChild(errorMessage);
    
    // Focus the first invalid input
    if (document.querySelectorAll('.error').length === 1) {
        input.focus();
    }
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Play Button Interaction
const playButtons = document.querySelectorAll('.play-button');
playButtons.forEach(button => {
    button.addEventListener('click', function() {
        // In a real implementation, this would trigger a video player
        const videoContainer = this.closest('.video-container');
        
        // Create video element (in real implementation)
        const videoMessage = document.createElement('div');
        videoMessage.className = 'video-message';
        videoMessage.innerHTML = '<p>Video player would open here in the full implementation</p><button class="close-video">Close</button>';
        videoContainer.appendChild(videoMessage);
        
        // Add close button functionality
        const closeBtn = videoMessage.querySelector('.close-video');
        closeBtn.addEventListener('click', () => {
            videoContainer.removeChild(videoMessage);
        });
    });
});