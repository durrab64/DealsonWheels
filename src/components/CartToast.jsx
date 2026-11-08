import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const AUTO_DISMISS_MS = 5000;

const CartToast = () => {
    // The drawer already confirms the cart contents, so the toast steps aside
    // while it is open rather than overlapping the drawer's actions.
    const { lastAdded, dismissLastAdded, isCartOpen } = useCart();

    useEffect(() => {
        if (!lastAdded) return undefined;

        const timer = window.setTimeout(dismissLastAdded, AUTO_DISMISS_MS);
        return () => window.clearTimeout(timer);
    }, [lastAdded, dismissLastAdded]);

    return (
        <div
            className="cart-toast-region"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            {lastAdded && !isCartOpen && (
                <div className="cart-toast">
                    <CheckCircle2 size={20} className="cart-toast-icon" aria-hidden="true" />
                    <div className="cart-toast-body">
                        <p className="cart-toast-title">Added to cart</p>
                        <p className="cart-toast-name">{lastAdded.name}</p>
                    </div>
                    <Link
                        to="/cart"
                        className="cart-toast-link"
                        onClick={dismissLastAdded}
                    >
                        View cart
                    </Link>
                    <button
                        type="button"
                        className="cart-toast-close"
                        onClick={dismissLastAdded}
                        aria-label="Dismiss notification"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartToast;
