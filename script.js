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
            } else {
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
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
            form.reset();
            
            // Reset button after 2 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }, 1500);
    });
});

// Play Button Interaction
const playButtons = document.querySelectorAll('.play-button');
playButtons.forEach(button => {
    button.addEventListener('click', function() {
        // In a real implementation, this would trigger a video player
        alert('Video player would open here in the full implementation');
    });
});