import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { curtainWipe, verticalReveal, diagonalSlide, zoomFade, splitReveal, glitchTransition } from '../utils/transitions';

/**
 * Advanced Page Transition Component - Barba.js Style
 * 
 * Available transition types:
 * - 'curtain' (default): Horizontal sliding curtains
 * - 'vertical': Top to bottom reveal
 * - 'diagonal': Diagonal wipe effect
 * - 'zoom': Scale and fade
 * - 'split': Center split reveal
 * - 'glitch': Modern glitch effect
 */

const PageTransition = ({ children, transitionType = 'curtain' }) => {
    const curtainRef = useRef(null);
    const curtain2Ref = useRef(null);
    const curtain3Ref = useRef(null);
    const contentRef = useRef(null);
    const location = useLocation();
    const isFirstLoad = useRef(true);

    // Map transition types to functions
    const transitions = {
        curtain: curtainWipe,
        vertical: verticalReveal,
        diagonal: diagonalSlide,
        zoom: zoomFade,
        split: splitReveal,
        glitch: glitchTransition
    };

    useEffect(() => {
        const curtains = [curtainRef.current, curtain2Ref.current, curtain3Ref.current];
        const selectedTransition = transitions[transitionType] || curtainWipe;

        if (isFirstLoad.current) {
            // Initial page load - always use curtain wipe for dramatic entrance
            const tl = gsap.timeline();

            tl.set(curtains, {
                scaleX: 1,
                transformOrigin: 'left'
            });

            tl.to(curtains, {
                scaleX: 0,
                duration: 1.2,
                ease: 'power4.inOut',
                stagger: 0.1,
                transformOrigin: 'right'
            });

            tl.fromTo(
                contentRef.current,
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out'
                },
                '-=0.6'
            );

            isFirstLoad.current = false;
        } else {
            // Page transitions
            const masterTl = gsap.timeline();

            // Exit animation
            const exitTl = selectedTransition(curtains, contentRef.current, false);
            masterTl.add(exitTl);

            // Small pause for effect
            masterTl.add(() => { }, '+=0.1');

            // Enter animation
            const enterTl = selectedTransition(curtains, contentRef.current, true);
            masterTl.add(enterTl);

            return () => {
                masterTl.kill();
            };
        }
    }, [location.pathname, transitionType]);

    return (
        <>
            {/* Layered curtain overlays - Barba.js style */}
            <div
                ref={curtainRef}
                className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black z-[100] pointer-events-none"
            />
            <div
                ref={curtain2Ref}
                className="fixed inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 z-[99] pointer-events-none"
            />
            <div
                ref={curtain3Ref}
                className="fixed inset-0 bg-gradient-to-bl from-zinc-800 via-zinc-700 to-zinc-800 z-[98] pointer-events-none opacity-80"
            />

            {/* Page content */}
            <div ref={contentRef} className="relative z-10">
                {children}
            </div>
        </>
    );
};

export default PageTransition;
