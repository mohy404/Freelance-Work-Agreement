/**
 * Memories Gallery — Premium Interactive Experience
 * A cinematic digital memory album
 * 
 * Features:
 * - Randomized organic floating animations
 * - Mouse parallax depth effect
 * - Cinematic lightbox with FLIP-like transitions
 * - Keyboard & touch navigation
 * - Scroll reveal animations
 * - Accessibility support (reduced motion, keyboard nav, focus management)
 * - Performance optimized (Intersection Observer, requestAnimationFrame, passive events)
 */

(function() {
    'use strict';

    // ─── Configuration ───
    const CONFIG = {
        parallaxIntensity: 15,
        parallaxSmoothing: 0.08,
        lightboxTransitionDuration: 500,
        swipeThreshold: 50,
        particleCount: 12,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // ─── State ───
    const state = {
        mouseX: 0,
        mouseY: 0,
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        isLightboxOpen: false,
        currentImageIndex: 0,
        touchStartX: 0,
        touchStartY: 0,
        isTouching: false,
        rafId: null
    };

    // ─── DOM Elements ───
    const elements = {
        memoryCards: document.querySelectorAll('.memory-card'),
        revealCards: document.querySelectorAll('.reveal-card'),
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxTitle: document.getElementById('lightboxTitle'),
        lightboxDate: document.getElementById('lightboxDate'),
        lightboxCounter: document.getElementById('lightboxCounter'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxPrev: document.getElementById('lightboxPrev'),
        lightboxNext: document.getElementById('lightboxNext'),
        particlesContainer: document.querySelector('.particles-container'),
        quoteContainer: document.querySelector('.quote-container'),
        siteFooter: document.querySelector('.site-footer'),
        floatingCanvas: document.getElementById('floatingCanvas')
    };

    // ─── Memory Data ───
    const memories = [
        {
            src: 'https://picsum.photos/seed/memory1/1200/1600.jpg',
            title: 'A Beautiful Moment',
            date: 'September 2026',
            alt: 'ذكرى جميلة - لحظة هادئة في الطبيعة'
        },
        {
            src: 'https://picsum.photos/seed/memory2/1200/1600.jpg',
            title: 'Golden Hour',
            date: 'August 2026',
            alt: 'ذكرى لا تُنسى - ضوء ذهبي في المساء'
        },
        {
            src: 'https://picsum.photos/seed/memory3/1200/1600.jpg',
            title: 'Warm Smiles',
            date: 'July 2026',
            alt: 'لحظة سعيدة - ابتسامة ودفء'
        },
        {
            src: 'https://picsum.photos/seed/memory4/1200/1600.jpg',
            title: 'Family Time',
            date: 'June 2026',
            alt: 'ذكريات العائلة - لحظات لا تُنسى'
        },
        {
            src: 'https://picsum.photos/seed/memory5/1200/1600.jpg',
            title: 'Adventure Awaits',
            date: 'May 2026',
            alt: 'مغامرة جميلة - استكشاف العالم'
        },
        {
            src: 'https://picsum.photos/seed/memory6/1200/1600.jpg',
            title: 'Peaceful Days',
            date: 'April 2026',
            alt: 'هدوء اللحظات - سكينة وجمال'
        },
        {
            src: 'https://picsum.photos/seed/memory7/1200/1600.jpg',
            title: 'Joyful Hearts',
            date: 'March 2026',
            alt: 'لحظات سعيدة - فرح وبهجة'
        },
        {
            src: 'https://picsum.photos/seed/memory8/1200/1600.jpg',
            title: 'Forever Young',
            date: 'February 2026',
            alt: 'ذكريات العمر - أجمل اللحظات'
        }
    ];

    const extraMemories = [
        {
            src: 'https://picsum.photos/seed/extra1/1200/800.jpg',
            title: 'Cinematic View',
            date: 'January 2026',
            alt: 'ذكرى إضافية - لقطة سينمائية'
        },
        {
            src: 'https://picsum.photos/seed/extra2/1200/800.jpg',
            title: 'Special Day',
            date: 'December 2025',
            alt: 'ذكرى إضافية - لحظة خاصة'
        },
        {
            src: 'https://picsum.photos/seed/extra3/1200/800.jpg',
            title: 'Light & Calm',
            date: 'November 2025',
            alt: 'ذكرى إضافية - ضوء وهدوء'
        }
    ];

    // ─── Utility Functions ───
    const utils = {
        /**
         * Generates a random number within a range
         */
        random: (min, max) => Math.random() * (max - min) + min,

        /**
         * Clamps a value between min and max
         */
        clamp: (value, min, max) => Math.min(Math.max(value, min), max),

        /**
         * Linear interpolation for smooth animations
         */
        lerp: (start, end, factor) => start + (end - start) * factor,

        /**
         * Debounces a function
         */
        debounce: (fn, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(null, args), delay);
            };
        }
    };

    // ─── Randomized Organic Movement ───
    function initRandomizedMovement() {
        if (CONFIG.reducedMotion) return;

        elements.memoryCards.forEach((card, index) => {
            // Generate controlled random values for organic feel
            const randomRotation = utils.random(-1.5, 1.5);
            const randomDelay = utils.random(0, 2);
            const randomDuration = utils.random(7, 13);

            // Apply subtle randomization to existing CSS animations
            card.style.setProperty('--random-rotation', `${randomRotation}deg`);
            card.style.setProperty('--random-delay', `${randomDelay}s`);
            card.style.setProperty('--random-duration', `${randomDuration}s`);

            // Slightly randomize initial position for organic feel
            const offsetX = utils.random(-5, 5);
            const offsetY = utils.random(-5, 5);

            // Store original position for parallax calculations
            const computedStyle = window.getComputedStyle(card);
            card.dataset.originalTransform = computedStyle.transform || '';
            card.dataset.offsetX = offsetX;
            card.dataset.offsetY = offsetY;
        });
    }

    // ─── Mouse Parallax ───
    function initParallax() {
        if (CONFIG.reducedMotion || window.matchMedia('(pointer: coarse)').matches) {
            return; // Skip parallax on touch devices or reduced motion
        }

        document.addEventListener('mousemove', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;

            // Calculate normalized position (-1 to 1)
            state.targetX = (state.mouseX / window.innerWidth - 0.5) * 2;
            state.targetY = (state.mouseY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        function updateParallax() {
            if (state.isLightboxOpen) {
                state.rafId = requestAnimationFrame(updateParallax);
                return;
            }

            // Smooth interpolation
            state.currentX = utils.lerp(state.currentX, state.targetX, CONFIG.parallaxSmoothing);
            state.currentY = utils.lerp(state.currentY, state.targetY, CONFIG.parallaxSmoothing);

            elements.memoryCards.forEach((card) => {
                const depth = parseFloat(getComputedStyle(card).getPropertyValue('--parallax-depth')) || 0.03;
                const moveX = state.currentX * CONFIG.parallaxIntensity * depth * -1;
                const moveY = state.currentY * CONFIG.parallaxIntensity * depth * -1;

                // Apply parallax as CSS custom property for performance
                card.style.setProperty('--parallax-x', `${moveX}px`);
                card.style.setProperty('--parallax-y', `${moveY}px`);

                // Apply transform with parallax offset
                // We use translate3d for GPU acceleration
                const baseTransform = card.dataset.originalTransform || '';
                card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });

            state.rafId = requestAnimationFrame(updateParallax);
        }

        state.rafId = requestAnimationFrame(updateParallax);
    }

    // ─── Particles ───
    function initParticles() {
        if (CONFIG.reducedMotion || !elements.particlesContainer) return;

        const particleTypes = ['star', 'dot', 'heart'];
        const symbols = { star: '✦', heart: '❤' };

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const particle = document.createElement('span');
            const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];

            particle.className = `particle particle--${type}`;
            particle.style.left = `${utils.random(5, 95)}%`;
            particle.style.top = `${utils.random(5, 95)}%`;
            particle.style.animationDelay = `${utils.random(0, 8)}s`;
            particle.style.animationDuration = `${utils.random(6, 12)}s`;

            if (type === 'star') {
                particle.textContent = symbols.star;
                particle.style.fontSize = `${utils.random(0.5, 1)}rem`;
            } else if (type === 'heart') {
                particle.textContent = symbols.heart;
                particle.style.fontSize = `${utils.random(0.4, 0.8)}rem`;
            } else {
                particle.style.width = `${utils.random(2, 4)}px`;
                particle.style.height = particle.style.width;
            }

            elements.particlesContainer.appendChild(particle);
        }
    }

    // ─── Lightbox ───
    function initLightbox() {
        // Memory cards click handlers
        elements.memoryCards.forEach((card, index) => {
            const openHandler = (e) => {
                if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
                if (e.type === 'keydown') e.preventDefault();
                openLightbox(index, 'main');
            };

            card.addEventListener('click', openHandler);
            card.addEventListener('keydown', openHandler);
        });

        // Reveal cards click handlers
        elements.revealCards.forEach((card, index) => {
            const openHandler = (e) => {
                if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
                if (e.type === 'keydown') e.preventDefault();
                openLightbox(index, 'extra');
            };

            card.addEventListener('click', openHandler);
            card.addEventListener('keydown', openHandler);
        });

        // Close button
        elements.lightboxClose.addEventListener('click', closeLightbox);

        // Navigation buttons
        elements.lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        elements.lightboxNext.addEventListener('click', () => navigateLightbox(1));

        // Backdrop click
        elements.lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

        // Keyboard navigation
        document.addEventListener('keydown', handleLightboxKeyboard);

        // Touch swipe
        initTouchSwipe();
    }

    function openLightbox(index, type = 'main') {
        const data = type === 'main' ? memories : extraMemories;

        state.currentImageIndex = index;
        state.isLightboxOpen = true;
        state.lightboxType = type;

        updateLightboxContent(data[index]);
        elements.lightbox.hidden = false;

        // Force reflow for transition
        elements.lightbox.offsetHeight;
        elements.lightbox.classList.add('is-active');

        // Trap focus within lightbox
        elements.lightboxClose.focus();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Update counter
        updateLightboxCounter(data);
    }

    function closeLightbox() {
        if (!state.isLightboxOpen) return;

        elements.lightbox.classList.remove('is-active');
        state.isLightboxOpen = false;

        setTimeout(() => {
            elements.lightbox.hidden = true;
            elements.lightboxImage.src = '';
            document.body.style.overflow = '';
        }, CONFIG.lightboxTransitionDuration);
    }

    function navigateLightbox(direction) {
        const data = state.lightboxType === 'main' ? memories : extraMemories;
        const total = data.length;

        state.currentImageIndex = (state.currentImageIndex + direction + total) % total;

        // Fade out current image
        elements.lightboxImage.style.opacity = '0';
        elements.lightboxImage.style.transform = 'scale(0.95)';

        setTimeout(() => {
            updateLightboxContent(data[state.currentImageIndex]);
            elements.lightboxImage.style.opacity = '1';
            elements.lightboxImage.style.transform = 'scale(1)';
            updateLightboxCounter(data);
        }, 200);
    }

    function updateLightboxContent(memory) {
        elements.lightboxImage.src = memory.src;
        elements.lightboxImage.alt = memory.alt;
        elements.lightboxTitle.textContent = memory.title;
        elements.lightboxDate.textContent = memory.date;
    }

    function updateLightboxCounter(data) {
        elements.lightboxCounter.textContent = `${state.currentImageIndex + 1} / ${data.length}`;
    }

    function handleLightboxKeyboard(e) {
        if (!state.isLightboxOpen) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigateLightbox(1);
                break;
        }
    }

    function initTouchSwipe() {
        const container = elements.lightbox.querySelector('.lightbox-content');

        container.addEventListener('touchstart', (e) => {
            state.touchStartX = e.touches[0].clientX;
            state.touchStartY = e.touches[0].clientY;
            state.isTouching = true;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!state.isTouching) return;
            state.touchEndX = e.touches[0].clientX;
            state.touchEndY = e.touches[0].clientY;
        }, { passive: true });

        container.addEventListener('touchend', () => {
            if (!state.isTouching) return;
            state.isTouching = false;

            const diffX = state.touchStartX - state.touchEndX;
            const diffY = state.touchStartY - state.touchEndY;

            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > CONFIG.swipeThreshold) {
                if (diffX > 0) {
                    navigateLightbox(1); // Swipe left -> next
                } else {
                    navigateLightbox(-1); // Swipe right -> prev
                }
            }
        }, { passive: true });
    }

    // ─── Scroll Reveal Animations ───
    function initScrollReveal() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe quote section
        if (elements.quoteContainer) {
            observer.observe(elements.quoteContainer);
        }

        // Observe reveal cards
        elements.revealCards.forEach(card => {
            observer.observe(card);
        });

        // Observe footer
        if (elements.siteFooter) {
            observer.observe(elements.siteFooter);
        }
    }

    // ─── Focus Management ───
    function initFocusManagement() {
        // Save last focused element before opening lightbox
        elements.memoryCards.forEach(card => {
            card.addEventListener('click', () => {
                state.lastFocusedElement = card;
            });
        });

        elements.revealCards.forEach(card => {
            card.addEventListener('click', () => {
                state.lastFocusedElement = card;
            });
        });

        // Restore focus on lightbox close
        const originalCloseLightbox = closeLightbox;
        closeLightbox = function() {
            originalCloseLightbox();
            if (state.lastFocusedElement) {
                setTimeout(() => state.lastFocusedElement.focus(), CONFIG.lightboxTransitionDuration);
            }
        };
    }

    // ─── Preload Images ───
    function preloadImages() {
        // Preload lightbox images in background
        const allImages = [...memories, ...extraMemories];

        allImages.forEach((memory, index) => {
            // Stagger preloading to not block main thread
            setTimeout(() => {
                const img = new Image();
                img.src = memory.src;
            }, index * 200);
        });
    }

    // ─── Handle Image Errors ───
    function initImageErrorHandling() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function() {
                // Create a placeholder with the memory title
                const card = this.closest('.memory-card, .reveal-card');
                if (card) {
                    const title = card.querySelector('.caption-title, .reveal-title');
                    const titleText = title ? title.textContent : 'Memory';

                    this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect fill='%23F1ECE4' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Georgia' font-style='italic' font-size='18' fill='%238C7A68'%3E${encodeURIComponent(titleText)}%3C/text%3E%3C/svg%3E`;
                }
            });
        });
    }

    // ─── Resize Handler ───
    function initResizeHandler() {
        const handleResize = utils.debounce(() => {
            // Recalculate positions if needed
            if (state.rafId) {
                cancelAnimationFrame(state.rafId);
                initParallax();
            }
        }, 250);

        window.addEventListener('resize', handleResize, { passive: true });
    }

    // ─── Initialize ───
    function init() {
        initRandomizedMovement();
        initParallax();
        initParticles();
        initLightbox();
        initScrollReveal();
        initFocusManagement();
        initImageErrorHandling();
        initResizeHandler();

        // Delay preloading until after initial render
        if (document.readyState === 'complete') {
            setTimeout(preloadImages, 1000);
        } else {
            window.addEventListener('load', () => setTimeout(preloadImages, 1000));
        }

        // Log initialization
        console.log('%c Memories Gallery ', 'background: #2B2927; color: #D4B896; padding: 4px 8px; border-radius: 4px; font-family: Georgia; font-style: italic;', 'initialized');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
