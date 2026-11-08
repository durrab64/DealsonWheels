import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * Shared dialog accessibility behaviour for the cart drawer and the auth modal.
 *
 * - Moves focus into the dialog when it opens.
 * - Traps Tab / Shift+Tab inside the dialog.
 * - Closes on Escape.
 * - Restores focus to the previously focused element on close.
 * - Locks body scroll while the dialog is open.
 */
const useDialogA11y = (isOpen, onClose, { initialFocusRef } = {}) => {
    const containerRef = useRef(null);
    const previouslyFocusedRef = useRef(null);
    const onCloseRef = useRef(onClose);

    // Keep the latest close handler without re-running the focus effect.
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!isOpen) return undefined;

        const container = containerRef.current;
        previouslyFocusedRef.current = document.activeElement;

        const getFocusable = () => {
            if (!container) return [];
            return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
                (element) => element.getClientRects().length > 0
            );
        };

        // Wait for the opening animation/mount so the first field is focusable.
        const focusTimer = window.setTimeout(() => {
            const target = initialFocusRef?.current || getFocusable()[0] || container;
            target?.focus?.();
        }, 0);

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current?.();
                return;
            }

            if (event.key !== 'Tab' || !container) return;

            const focusable = getFocusable();
            if (focusable.length === 0) {
                event.preventDefault();
                container.focus?.();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;
            const isInside = container.contains(active);

            if (event.shiftKey && (active === first || !isInside)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (active === last || !isInside)) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);

            const previous = previouslyFocusedRef.current;
            if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
                previous.focus();
            }
        };
    }, [isOpen, initialFocusRef]);

    // Lock background scrolling while the dialog is open.
    useEffect(() => {
        if (!isOpen) return undefined;

        const { body, documentElement } = document;
        const previousOverflow = body.style.overflow;
        const previousPaddingRight = body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = previousOverflow;
            body.style.paddingRight = previousPaddingRight;
        };
    }, [isOpen]);

    return containerRef;
};

export default useDialogA11y;
