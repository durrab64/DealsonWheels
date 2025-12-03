import { gsap } from 'gsap';

/**
 * Collection of Barba.js-inspired page transition animations
 * Each function returns a GSAP timeline for smooth page transitions
 */

// 1. CURTAIN WIPE - Horizontal sliding curtains (default)
export const curtainWipe = (curtains, content, isEntering = true) => {
    const tl = gsap.timeline();

    if (isEntering) {
        // Curtains slide out
        tl.to(curtains, {
            scaleX: 0,
            duration: 0.8,
            ease: 'power3.inOut',
            stagger: 0.1,
            transformOrigin: 'right'
        });

        tl.fromTo(
            content,
            { opacity: 0, y: 40, scale: 0.98 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: 'power3.out'
            },
            '-=0.5'
        );
    } else {
        // Curtains slide in
        tl.fromTo(
            curtains,
            { scaleX: 0, transformOrigin: 'left' },
            {
                scaleX: 1,
                duration: 0.6,
                ease: 'power3.inOut',
                stagger: 0.08
            }
        );

        tl.to(
            content,
            {
                opacity: 0,
                scale: 0.98,
                duration: 0.3,
                ease: 'power2.in'
            },
            '-=0.4'
        );
    }

    return tl;
};

// 2. VERTICAL REVEAL - Top to bottom reveal
export const verticalReveal = (curtains, content, isEntering = true) => {
    const tl = gsap.timeline();

    if (isEntering) {
        tl.to(curtains, {
            scaleY: 0,
            duration: 1,
            ease: 'expo.inOut',
            stagger: 0.12,
            transformOrigin: 'bottom'
        });

        tl.fromTo(
            content,
            { opacity: 0, y: 60 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power4.out'
            },
            '-=0.6'
        );
    } else {
        tl.fromTo(
            curtains,
            { scaleY: 0, transformOrigin: 'top' },
            {
                scaleY: 1,
                duration: 0.7,
                ease: 'expo.inOut',
                stagger: 0.1
            }
        );

        tl.to(
            content,
            {
                opacity: 0,
                y: -30,
                duration: 0.4,
                ease: 'power2.in'
            },
            '-=0.5'
        );
    }

    return tl;
};

// 3. DIAGONAL SLIDE - Diagonal wipe effect
export const diagonalSlide = (curtains, content, isEntering = true) => {
    const tl = gsap.timeline();

    if (isEntering) {
        tl.to(curtains, {
            x: '100%',
            duration: 0.9,
            ease: 'power4.inOut',
            stagger: 0.1
        });

        tl.fromTo(
            content,
            { opacity: 0, x: -50, rotateY: -5 },
            {
                opacity: 1,
                x: 0,
                rotateY: 0,
                duration: 0.8,
                ease: 'power3.out'
            },
            '-=0.5'
        );
    } else {
        tl.fromTo(
            curtains,
            { x: '-100%' },
            {
                x: '0%',
                duration: 0.7,
                ease: 'power4.inOut',
                stagger: 0.08
            }
        );

        tl.to(
            content,
            {
                opacity: 0,
                x: 50,
                rotateY: 5,
                duration: 0.4,
                ease: 'power2.in'
            },
            '-=0.4'
        );
    }

    return tl;
};

// 4. ZOOM FADE - Scale and fade effect
export const zoomFade = (curtains, content, isEntering = true) => {
    const tl = gsap.timeline();

    if (isEntering) {
        tl.to(curtains, {
            opacity: 0,
            scale: 1.2,
            duration: 0.6,
            ease: 'power2.inOut',
            stagger: 0.08
        });

        tl.fromTo(
            content,
            { opacity: 0, scale: 0.9 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: 'back.out(1.2)'
            },
            '-=0.3'
        );
    } else {
        tl.fromTo(
            curtains,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: 'power2.inOut',
                stagger: 0.06
            }
        );

        tl.to(
            content,
            {
                opacity: 0,
                scale: 1.1,
                duration: 0.4,
                ease: 'power2.in'
            },
            '-=0.3'
        );
    }

    return tl;
};

// 5. SPLIT REVEAL - Center split reveal
export const splitReveal = (curtains, content, isEntering = true) => {
    const tl = gsap.timeline();

    if (isEntering) {
        // Split curtains to left and right
        curtains.forEach((curtain, index) => {
            const direction = index % 2 === 0 ? '-100%' : '100%';
            tl.to(
                curtain,
                {
                    x: direction,
                    duration: 0.8,
                    ease: 'power3.inOut'
                },
                index * 0.08
            );
        });

        tl.fromTo(
            content,
            { opacity: 0, scale: 0.95, rotateX: 10 },
            {
                opacity: 1,
                scale: 1,
                rotateX: 0,
                duration: 0.9,
                ease: 'power3.out'
            },
            '-=0.5'
        );
    } else {
        curtains.forEach((curtain, index) => {
            const direction = index % 2 === 0 ? '-100%' : '100%';
            tl.fromTo(
                curtain,
                { x: direction },
                {
                    x: '0%',
                    duration: 0.6,
                    ease: 'power3.inOut'
                },
                index * 0.06
            );
        });

        tl.to(
            content,
            {
                opacity: 0,
                scale: 1.05,
                rotateX: -10,
                duration: 0.4,
                ease: 'power2.in'
            },
            '-=0.4'
        );
    }

    return tl;
};

// 6. GLITCH TRANSITION - Modern glitch effect
export const glitchTransition = (curtains, content, isEntering = true) => {
    const tl = gsap.timeline();

    if (isEntering) {
        // Glitchy reveal
        curtains.forEach((curtain, index) => {
            tl.to(
                curtain,
                {
                    scaleX: 0,
                    duration: 0.15,
                    ease: 'steps(5)',
                    transformOrigin: index % 2 === 0 ? 'left' : 'right'
                },
                index * 0.05
            );
        });

        tl.fromTo(
            content,
            { opacity: 0, x: gsap.utils.random(-20, 20) },
            {
                opacity: 1,
                x: 0,
                duration: 0.6,
                ease: 'power2.out'
            },
            '-=0.2'
        );
    } else {
        curtains.forEach((curtain, index) => {
            tl.fromTo(
                curtain,
                { scaleX: 0, transformOrigin: index % 2 === 0 ? 'right' : 'left' },
                {
                    scaleX: 1,
                    duration: 0.15,
                    ease: 'steps(5)'
                },
                index * 0.04
            );
        });

        tl.to(
            content,
            {
                opacity: 0,
                x: gsap.utils.random(-20, 20),
                duration: 0.3,
                ease: 'power2.in'
            },
            '-=0.15'
        );
    }

    return tl;
};
