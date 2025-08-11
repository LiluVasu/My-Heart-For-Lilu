// === GIFT PAGE SCRIPT - ADVANCED VERSION ===

class MemorySlideshow {
    constructor() {
        this.slideIndex = 0;
        this.slides = [];
        this.isTransitioning = false;
        this.autoPlayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.music = null;
        this.musicToggle = null;
        this.musicPlaying = false;
        
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
        this.setupMusicPlayer();
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
        this.music = document.getElementById('backgroundMusic');
        this.musicToggle = document.getElementById('musicToggle');
        
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
            if (this.slideshow.classList.contains('hidden')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
            }
        });
    }
    
    setupTouchNavigation() {
        if (this.slideshow) {
            this.slideshow.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            });
            
            this.slideshow.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            });
        }
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
        ripple.style.transform = 'scale(0)';
        ripple.style.opacity = '0.6';
        
        // Force reflow
        ripple.offsetHeight;
        
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
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

    setupMusicPlayer() {
        if (!this.music || !this.musicToggle) {
            console.log('Music elements not found');
            return;
        }

        // Set initial music properties
        this.music.volume = 0.3; // Start at 30% volume
        this.music.loop = true;

        // Music toggle button event listener
        this.musicToggle.addEventListener('click', () => {
            this.toggleMusic();
        });

        // Try to play music when entering slideshow (autoplay)
        this.music.addEventListener('canplaythrough', () => {
            console.log('Music is ready to play');
        });

        this.music.addEventListener('error', (e) => {
            console.error('Music loading error:', e);
            this.musicToggle.style.display = 'none';
        });

        // Handle autoplay restrictions
        this.music.addEventListener('play', () => {
            this.musicPlaying = true;
            this.musicToggle.classList.remove('muted');
        });

        this.music.addEventListener('pause', () => {
            this.musicPlaying = false;
            this.musicToggle.classList.add('muted');
        });
    }

    toggleMusic() {
        if (!this.music) return;

        if (this.musicPlaying) {
            this.music.pause();
        } else {
            // Handle autoplay restrictions with user interaction
            const playPromise = this.music.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Music started playing');
                }).catch(error => {
                    console.log('Music autoplay was prevented:', error);
                    this.musicToggle.classList.add('muted');
                });
            }
        }
    }

    startMusicOnEnter() {
        // Try to start music when entering slideshow (user has interacted)
        if (this.music && !this.musicPlaying) {
            const playPromise = this.music.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Music started on enter');
                    this.musicPlaying = true;
                    this.musicToggle.classList.remove('muted');
                }).catch(error => {
                    console.log('Music could not start:', error);
                });
            }
        }
    }
    
    enterSlideshow() {
        // Start music when user interacts
        this.startMusicOnEnter();
        
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
        this.slideIndex = 0;
    }
    
    showSlide(index) {
        if (!this.slides || this.slides.length === 0) return;
        
        // Ensure index is within bounds
        index = Math.max(0, Math.min(index, this.slides.length - 1));
        this.slideIndex = index;
        
        // Hide all slides
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
            slide.style.transform = `translateX(${(i - index) * 100}%)`;
        });
        
        // Show current slide
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        
        // Update progress dots
        if (this.dots) {
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
        
        // Add slide-specific animations
        this.addSlideAnimations(index);
    }
    
    addSlideAnimations(index) {
        const currentSlide = this.slides[index];
        if (!currentSlide) return;
        
        // Reset animations
        const animatedElements = currentSlide.querySelectorAll('.slide-content > *');
        animatedElements.forEach((el, i) => {
            el.style.animation = 'none';
            el.offsetHeight; // Force reflow
            el.style.animation = `slideContentFadeIn 0.8s ease-out ${i * 0.2}s both`;
        });
        
        // Special animations for specific slides
        if (currentSlide.classList.contains('apology-slide')) {
            const heart = currentSlide.querySelector('.apology-heart');
            if (heart) {
                heart.style.animation = 'heartPulse 2s ease-in-out infinite';
            }
        }
        
        if (currentSlide.classList.contains('promise-slide')) {
            const hearts = currentSlide.querySelectorAll('.floating-hearts .heart');
            hearts.forEach((heart, i) => {
                heart.style.animation = `floatUp 3s ease-in-out ${i * 0.5}s infinite`;
            });
        }
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        const nextIndex = (this.slideIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        if (this.isTransitioning) return;
        const prevIndex = this.slideIndex === 0 ? this.slides.length - 1 : this.slideIndex - 1;
        this.goToSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.slideIndex) return;
        
        this.isTransitioning = true;
        this.showSlide(index);
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    startAutoPlay() {
        this.pauseAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 8000); // 8 seconds per slide
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
}

// Initialize slideshow when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.memorySlideshow = new MemorySlideshow();
});

// Heart explosion effect
function createHeartExplosion() {
    const heartContainer = document.createElement('div');
    heartContainer.style.position = 'fixed';
    heartContainer.style.top = '0';
    heartContainer.style.left = '0';
    heartContainer.style.width = '100%';
    heartContainer.style.height = '100%';
    heartContainer.style.pointerEvents = 'none';
    heartContainer.style.zIndex = '9999';
    
    const hearts = ['💕', '💖', '💗', '💝', '💘', '💓', '💞', '💟'];
    
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'absolute';
        heart.style.fontSize = Math.random() * 30 + 20 + 'px';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        heart.style.animation = `heartExplode ${Math.random() * 2 + 3}s ease-out forwards`;
        heart.style.animationDelay = Math.random() * 1 + 's';
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
