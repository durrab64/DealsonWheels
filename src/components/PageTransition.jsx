import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const [displayChildren, setDisplayChildren] = useState(children);

    const blocksRef = useRef([]);
    const containerRef = useRef(null);
    const isFirstLoad = useRef(true);
    const prevLocation = useRef(location.pathname);

    // Create 8 blocks for the swoosh effect
    const numBlocks = 8;

    useEffect(() => {
        // If location hasn't changed, do nothing (except first load)
        if (location.pathname === prevLocation.current && !isFirstLoad.current) {
            return;
        }

        const tl = gsap.timeline();
        const blocks = blocksRef.current;
        const container = containerRef.current;

        if (isFirstLoad.current) {
            // Initial Load Logic
            tl.set(container, { visibility: 'visible' });
            tl.set(blocks, { yPercent: 100 });

            tl.to(blocks, {
                yPercent: -100,
                duration: 0.5,
                ease: 'power2.out',
                stagger: {
                    each: 0.05,
                    from: 'start'
                }
            });

            tl.set(container, { visibility: 'hidden' });
            isFirstLoad.current = false;
        } else {
            // Navigation Transition Logic

            // 1. Make blocks visible and ready (above screen)
            tl.set(container, { visibility: 'visible' });
            tl.set(blocks, { yPercent: -100 });

            // 2. Animate DOWN to cover the screen (Fast: 0.4s)
            tl.to(blocks, {
                yPercent: 0,
                duration: 0.4,
                ease: 'power2.in',
                stagger: {
                    each: 0.05,
                    from: 'start'
                },
                onComplete: () => {
                    // 3. SWAP CONTENT while covered
                    // This is the magic moment: switch from old page to new page
                    setDisplayChildren(children);
                    // Scroll to top for new page
                    window.scrollTo(0, 0);
                }
            });

            // 4. Small pause to ensure swap is clean
            tl.to({}, { duration: 0.1 });

            // 5. Animate UP to reveal new page (Fast: 0.4s)
            tl.to(blocks, {
                yPercent: 100,
                duration: 0.4,
                ease: 'power2.out',
                stagger: {
                    each: 0.05,
                    from: 'start'
                }
            });

            // 6. Cleanup
            tl.call(() => {
                gsap.set(container, { visibility: 'hidden' });
            });
        }

        prevLocation.current = location.pathname;

        return () => {
            tl.kill();
        };
    }, [location.pathname, children]);

    // All blocks use the same color
    const blockColors = Array(8).fill('#1a1a1a');

    return (
        <>
            {/* Swoosh Blocks Container */}
            <div
                ref={containerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 'var(--z-transition)',
                    display: 'flex',
                    visibility: 'hidden'
                }}
            >
                {Array.from({ length: numBlocks }).map((_, index) => (
                    <div
                        key={index}
                        ref={el => blocksRef.current[index] = el}
                        style={{
                            flex: 1,
                            background: blockColors[index],
                            willChange: 'transform'
                        }}
                    />
                ))}
            </div>

            {/* Page Content */}
            {/* We render displayChildren which holds the OLD page until the swap happens */}
            <div style={{ opacity: 1 }}>
                {displayChildren}
            </div>
        </>
    );
};

export default PageTransition;
