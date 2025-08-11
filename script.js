// === GIFT PAGE SCRIPT - ADVANCED VERSION ===

class MemorySlideshow {
    constructor() {
        this.slideIndex = 0;
        this.slides = [];
        this.isTransitioning = false;
        this.autoPlayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }
        
        if (!this.setupElements()) {
            console.error('Failed to initialize slideshow: missing elements');
            return;
        }
        
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.preloadImages();
    }
    
    setupElements() {
        this.intro = document.getElementById('intro');
        this.slideshow = document.getElementById('slideshow');
        this.enterBtn = document.getElementById('enterBtn');
        this.prevBtn = document.querySelector('.prev');
        this.nextBtn = document.querySelector('.next');
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        
        // Check if all required elements exist
        if (!this.intro || !this.slideshow || !this.enterBtn || !this.prevBtn || !this.nextBtn) {
            console.error('Required elements not found. Please check HTML structure.');
            return false;
        }
        
        // Add loading states for slides with images
        this.slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                img.addEventListener('load', () => {
                    slide.classList.add('image-loaded');
                });
            }
        });
        
        return true;
    }
    
    setupEventListeners() {
        // Enter button with enhanced animation
        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', (e) => {
                this.createRippleEffect(e.target, e);
                setTimeout(() => this.enterSlideshow(), 300);
            });
        }
        
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Dot navigation
        if (this.dots && this.dots.length > 0) {
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
        }
        
        // Mouse wheel navigation
        if (this.slideshow) {
            this.slideshow.addEventListener('wheel', (e) => {
                if (this.isTransitioning) return;
                
                e.preventDefault();
                if (e.deltaY > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }, { passive: false });
            
            // Hover effects for auto-play
            this.slideshow.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.slideshow.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.intro.classList.contains('hidden')) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousSlide();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextSlide();
                        break;
                    case 'Escape':
                        this.exitSlideshow();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.toggleAutoPlay();
                        break;
                }
            } else if (e.key === 'Enter') {
                this.enterSlideshow();
            }
        });
    }
    
    setupTouchNavigation() {
        this.slideshow.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.slideshow.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }
    
    createRippleEffect(button, event) {
        if (!button || !event) return;
        
        const ripple = button.querySelector('.button-ripple');
        if (!ripple) return;
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.classList.add('ripple-active');
        
        setTimeout(() => {
            button.classList.remove('ripple-active');
        }, 600);
    }
    
    preloadImages() {
        this.slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img && img.src) {
                const imageUrl = img.src;
                const preloadImg = new Image();
                preloadImg.src = imageUrl;
            }
        });
    }
    
    enterSlideshow() {
        // Trigger heart explosion effect
        if (window.originalCreateHeartExplosion) {
            window.originalCreateHeartExplosion();
        }
        
        // Add exit animation to intro
        if (this.intro) {
            this.intro.style.animation = 'introFadeOut 0.8s ease-in-out forwards';
        }
        
        setTimeout(() => {
            if (this.intro) {
                this.intro.classList.add('hidden');
            }
            if (this.slideshow) {
                this.slideshow.classList.remove('hidden');
                this.slideshow.style.animation = 'slideShowFadeIn 1s ease-out';
            }
            this.showSlide(0);
            this.startAutoPlay();
        }, 800);
    }
    
    exitSlideshow() {
        this.pauseAutoPlay();
        this.slideshow.classList.add('hidden');
        this.intro.classList.remove('hidden');
        this.intro.style.animation = 'introFadeIn 1s ease-out';
    }
    
    showSlide(index) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Handle index wrapping
        if (index >= this.slides.length) {
            this.slideIndex = 0;
        } else if (index < 0) {
            this.slideIndex = this.slides.length - 1;
        } else {
            this.slideIndex = index;
        }
        
        // Update slides
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === this.slideIndex) {
                setTimeout(() => {
                    slide.classList.add('active');
                    this.animateCaption(slide);
                }, 100);
            }
        });
        
        // Update dots
        if (this.dots && this.dots.length > 0) {
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === this.slideIndex);
            });
        }
        
        // Reset transition flag
        setTimeout(() => {
            this.isTransitioning = false;
        }, 400);
    }
    
    animateCaption(slide) {
        const caption = slide.querySelector('.caption-content');
        if (caption) {
            caption.style.animation = 'none';
            setTimeout(() => {
                caption.style.animation = 'captionSlideUp 0.8s ease-out';
            }, 50);
        }
    }
    
    nextSlide() {
        if (!this.isTransitioning) {
            this.showSlide(this.slideIndex + 1);
        }
    }
    
    previousSlide() {
        if (!this.isTransitioning) {
            this.showSlide(this.slideIndex - 1);
        }
    }
    
    goToSlide(index) {
        if (!this.isTransitioning && index !== this.slideIndex) {
            this.showSlide(index);
        }
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 12000); // Slower for reading emotional content - 12 seconds
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resumeAutoPlay() {
        if (!this.autoPlayInterval) {
            this.startAutoPlay();
        }
    }
    
    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.pauseAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }
}

// === PARTICLE ANIMATION SYSTEM ===
class ParticleSystem {
    constructor() {
        this.particles = document.querySelectorAll('.particle');
        this.init();
    }
    
    init() {
        this.particles.forEach(particle => {
            this.randomizeParticle(particle);
        });
    }
    
    randomizeParticle(particle) {
        const size = Math.random() * 5 + 2; // 2-7px
        const opacity = Math.random() * 0.6 + 0.2; // 0.2-0.8
        const duration = Math.random() * 6 + 6; // 6-12s
        const delay = Math.random() * 3; // 0-3s
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.opacity = opacity;
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';
    }
}

// === ENHANCED ANIMATIONS ===
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes introFadeOut {
            from { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
            to { 
                opacity: 0; 
                transform: translateY(-30px) scale(0.95); 
            }
        }
        
        @keyframes slideShowFadeIn {
            from { 
                opacity: 0; 
                transform: scale(1.05); 
            }
            to { 
                opacity: 1; 
                transform: scale(1); 
            }
        }
        
        .ripple-active .button-ripple {
            animation: rippleExpand 0.6s ease-out;
        }
        
        @keyframes rippleExpand {
            from {
                width: 0;
                height: 0;
                opacity: 1;
            }
            to {
                width: 300px;
                height: 300px;
                opacity: 0;
            }
        }
        
        .image-loaded img {
            animation: imageReveal 1s ease-out;
        }
        
        @keyframes imageReveal {
            from {
                opacity: 0;
                transform: scale(1.1);
                filter: blur(5px);
            }
            to {
                opacity: 1;
                transform: scale(1);
                filter: blur(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// === PERFORMANCE OPTIMIZATIONS ===
function optimizePerformance() {
    // Preload critical resources
    const preloadLinks = [
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap'
    ];
    
    preloadLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        document.head.appendChild(link);
    });
    
    // Optimize images with intersection observer
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('optimized');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // iPhone/iOS Detection and Optimizations
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIPhone15 = /iPhone/.test(navigator.userAgent) && window.screen.height >= 852;
    
    if (isIOS) {
        document.body.classList.add('ios-device');
        
        // Prevent zoom on double tap
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - this.lastTouchEnd <= 300) {
                e.preventDefault();
            }
            this.lastTouchEnd = now;
        }, false);
        
        // Fix viewport height for iOS
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        window.addEventListener('resize', setVH);
        setVH();
    }
    
    if (isIPhone15) {
        document.body.classList.add('iphone15');
        
        // Add special iPhone 15 optimizations
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 430px) {
                .slide {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                }
                
                .nav {
                    top: calc(50% + env(safe-area-inset-top));
                }
                
                .progress-bar {
                    bottom: calc(3% + env(safe-area-inset-bottom));
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add custom animations
    addCustomAnimations();
    
    // Initialize performance optimizations
    optimizePerformance();
    
    // Initialize particle system
    new ParticleSystem();
    
    // Initialize slideshow
    try {
        new MemorySlideshow();
        console.log('Memory slideshow initialized successfully');
    } catch (error) {
        console.error('Failed to initialize slideshow:', error);
    }
    
    // Add special love effects
    addLoveEffects();
    
    // Add loading complete class to body
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// === ACCESSIBILITY ENHANCEMENTS ===
document.addEventListener('DOMContentLoaded', () => {
    // Add focus indicators for keyboard navigation
    const focusableElements = document.querySelectorAll('button, .dot');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.classList.add('keyboard-focused');
        });
        
        element.addEventListener('blur', () => {
            element.classList.remove('keyboard-focused');
        });
    });
    
    // Announce slide changes to screen readers
    const slideshow = document.getElementById('slideshow');
    if (slideshow) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        slideshow.appendChild(announcement);
        
        // Update announcement when slides change
        const observer = new MutationObserver(() => {
            const activeSlide = document.querySelector('.slide.active');
            if (activeSlide) {
                const titleEl = activeSlide.querySelector('h2');
                const dateEl = activeSlide.querySelector('.date');
                if (titleEl && dateEl) {
                    announcement.textContent = `Now showing: ${titleEl.textContent}, ${dateEl.textContent}`;
                }
            }
        });
        
        observer.observe(slideshow, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });
    }
});

// === SPECIAL LOVE EFFECTS ===
function addLoveEffects() {
    // Create heart explosion effect when entering slideshow
    function createHeartExplosion() {
        const heartContainer = document.createElement('div');
        heartContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
        `;
        
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = ['💕', '💖', '💝', '💗', '💓'][Math.floor(Math.random() * 5)];
            heart.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 20 + 15}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: heartExplode ${Math.random() * 3 + 2}s ease-out forwards;
                pointer-events: none;
            `;
            heartContainer.appendChild(heart);
        }
        
        document.body.appendChild(heartContainer);
        
        setTimeout(() => {
            document.body.removeChild(heartContainer);
        }, 5000);
    }
    
    // Add heart explosion CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes heartExplode {
            0% {
                opacity: 1;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: scale(1.2) rotate(180deg);
            }
            100% {
                opacity: 0;
                transform: scale(0.5) rotate(360deg) translateY(-100px);
            }
        }
        
        .ios-device {
            -webkit-overflow-scrolling: touch;
        }
        
        .ios-device body {
            height: 100vh;
            height: calc(var(--vh, 1vh) * 100);
        }
        
        .love-pulse {
            animation: lovePulse 2s ease-in-out infinite;
        }
        
        @keyframes lovePulse {
            0%, 100% {
                transform: scale(1);
                filter: hue-rotate(0deg);
            }
            50% {
                transform: scale(1.05);
                filter: hue-rotate(10deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Trigger heart explosion when entering slideshow
    window.originalCreateHeartExplosion = createHeartExplosion;
    
    // Add love pulse to certain elements
    setTimeout(() => {
        const loveElements = document.querySelectorAll('.memories-text, .apology-heart, .promise-heart');
        loveElements.forEach(element => {
            element.classList.add('love-pulse');
        });
    }, 2000);
}
