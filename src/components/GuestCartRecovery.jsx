import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const REASON_MESSAGES = {
    'no-authenticated-identity': 'Sign in to restore a saved guest cart.',
    'no-handoff': 'No recoverable guest cart is available for this account.',
    'invalid-handoff': 'The saved guest cart could not be read and was left untouched.',
    'unclaimed-handoff': 'A saved guest cart is waiting for the account that created it.',
    'uid-mismatch': 'A saved guest cart belongs to a different account and was not loaded.',
    'empty-handoff': 'No recoverable guest cart is available for this account.',
    'storage-unavailable': 'Saved cart storage is unavailable in this browser.',
    'cart-not-empty': 'Empty your cart before restoring a saved guest cart.',
};

const FEEDBACK_MESSAGES = {
    'no-authenticated-identity': 'Sign in to restore a saved guest cart.',
    'no-handoff': 'No recoverable guest cart is available.',
    'invalid-handoff': 'The saved guest cart could not be read. Nothing was changed.',
    'unclaimed-handoff': 'This cart is not linked to your current account.',
    'uid-mismatch': 'That saved cart belongs to a different account.',
    'empty-handoff': 'No recoverable guest cart is available.',
    'storage-unavailable': 'Saved cart storage is unavailable.',
    'cart-not-empty': 'Your cart already has items, so nothing was overwritten.',
};

/**
 * Explicit, user-triggered guest-cart recovery.
 *
 * Renders only inside the existing empty-cart states. It never recovers
 * automatically: the button calls CartContext.recoverGuestCart(), which checks
 * the current Firebase UID, refuses to overwrite a non-empty cart, and leaves
 * the handoff record intact.
 */
const GuestCartRecovery = ({ className = '' }) => {
    const { getGuestCartRecoveryStatus, recoverGuestCart } = useCart();
    const [feedback, setFeedback] = useState(null);

    const status = getGuestCartRecoveryStatus();

    const handleRestore = () => {
        const result = recoverGuestCart();
        if (result.ok) {
            setFeedback(
                `Restored ${result.items.length} item${result.items.length === 1 ? '' : 's'} to your cart.`
            );
        } else {
            setFeedback(
                FEEDBACK_MESSAGES[result.reason] ||
                    'The saved guest cart could not be restored.'
            );
        }
    };

    if (!status.recoverable) {
        return (
            <p
                className={`guest-cart-recovery-note text-xs text-gray-500 ${className}`}
                role="status"
            >
                {feedback ||
                    REASON_MESSAGES[status.reason] ||
                    'No recoverable guest cart is available for this account.'}
            </p>
        );
    }

    return (
        <div className={`guest-cart-recovery ${className}`}>
            <button
                type="button"
                onClick={handleRestore}
                className="guest-cart-recovery-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-sm text-white hover:bg-white/5 transition-colors"
            >
                <RotateCcw size={16} aria-hidden="true" />
                Restore guest cart ({status.itemCount} item
                {status.itemCount === 1 ? '' : 's'})
            </button>
            {feedback && (
                <p className="guest-cart-recovery-feedback text-xs text-gray-400 mt-2" role="status">
                    {feedback}
                </p>
            )}
        </div>
    );
};

export default GuestCartRecovery;
