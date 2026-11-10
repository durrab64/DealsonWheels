import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import {
    loadCartItems,
    saveCartItems,
    prepareGuestHandoff,
    bindGuestHandoffToUid,
    getGuestHandoffStatus,
    recoverGuestHandoff,
    HANDOFF_IDENTITY,
    HANDOFF_STATUS,
} from '../data/cartStorage';
import { authProvider } from '../data/compose.js';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

/**
 * Resolve the current guest identity from Firebase, falling back to the
 * transitional persisted profile only while Firebase has not initialized.
 *
 * A signed-in (non-anonymous) customer is never treated as a guest.
 */
const resolveIdentity = () => {
    const current = authProvider.getCurrentUser();
    if (current) {
        return {
            isGuest: Boolean(current.isAnonymous),
            uid: current.uid || null,
        };
    }

    const persisted = authProvider.loadUser();
    if (persisted && persisted.isAnonymous !== true) {
        return { isGuest: false, uid: persisted.id ? String(persisted.id) : null };
    }

    return { isGuest: true, uid: null };
};

export const CartProvider = ({ children }) => {
    // Persistence (validation, parsing, serialization) lives in the adapter.
    const [cartItems, setCartItems] = useState(loadCartItems);

    // The ref is the synchronous source of truth for mutations. It lets
    // addToCart persist the new cart (and handoff) before any asynchronous
    // authentication call begins, without relying on a React effect having run.
    const cartItemsRef = useRef(cartItems);

    const [isCartOpen, setIsCartOpen] = useState(false);
    // Ephemeral confirmation state for the add-to-cart toast. Not persisted.
    const [lastAdded, setLastAdded] = useState(null);

    // Forces consumers to re-evaluate recovery availability when Firebase
    // auth state changes (e.g. after anonymous sign-in or logout).
    const [, setAuthRevision] = useState(0);

    /**
     * Commit cart items: update the ref, persist synchronously, then update
     * React state. This is the only path that writes the active cart.
     */
    const commitCart = useCallback((nextItems) => {
        const normalized = Array.isArray(nextItems) ? nextItems : [];
        cartItemsRef.current = normalized;
        saveCartItems(normalized);
        setCartItems(normalized);
        return normalized;
    }, []);

    /**
     * Clear only the visible cart, leaving the persisted `cart` key intact.
     * Used on customer logout: the customer's persisted cart must survive.
     */
    const clearVisibleCart = useCallback(() => {
        cartItemsRef.current = [];
        setCartItems([]);
        setLastAdded(null);
    }, []);

    /**
     * Write the current guest cart to the durable handoff record.
     *
     * Only a guest session (no user, or an anonymous user) may write the
     * handoff. A signed-in customer must never overwrite the guest copy.
     * When an anonymous UID is known the record is bound to it immediately.
     */
    const persistGuestHandoff = useCallback((items) => {
        const identity = resolveIdentity();
        if (!identity.isGuest) return false;

        // Never overwrite a handoff that is already owned by another Firebase
        // identity (or whose owner cannot yet be confirmed). The original
        // binding and payload must survive intact.
        const existing = getGuestHandoffStatus(identity.uid);
        if (existing.status === HANDOFF_STATUS.MISMATCH) return false;
        if (
            existing.status === HANDOFF_STATUS.BOUND &&
            existing.reason === 'no-authenticated-identity'
        ) {
            return false;
        }

        const prepared = prepareGuestHandoff(items);
        if (!prepared) return false;

        if (identity.uid) {
            // Refusal here means the record is already bound to a different
            // identity; the original binding is intentionally preserved.
            bindGuestHandoffToUid(identity.uid, HANDOFF_IDENTITY.ANONYMOUS);
        }

        return true;
    }, []);

    /**
     * Lazily create an anonymous Firebase session (never on page load) and
     * bind the pending handoff to the returned UID.
     */
    const ensureAnonymousSession = useCallback(async () => {
        const current = authProvider.getCurrentUser();
        if (current) {
            if (current.isAnonymous && current.uid) {
                bindGuestHandoffToUid(current.uid, HANDOFF_IDENTITY.ANONYMOUS);
            }
            return current;
        }

        const persisted = authProvider.loadUser();
        if (persisted) {
            if (persisted.isAnonymous === true && persisted.id) {
                bindGuestHandoffToUid(
                    String(persisted.id),
                    HANDOFF_IDENTITY.ANONYMOUS
                );
            }
            return null;
        }

        try {
            const user = await authProvider.signInAnonymously();
            if (user?.uid) {
                bindGuestHandoffToUid(user.uid, HANDOFF_IDENTITY.ANONYMOUS);
            }
            return user;
        } catch {
            // Authentication failure must never discard the cart: the pending
            // handoff and the active cart key both remain on disk.
            return null;
        }
    }, []);

    /**
     * Track Firebase auth state so that:
     *   - a pending handoff is bound once an anonymous UID is restored;
     *   - customer logout clears the visible cart without deleting the
     *     customer's persisted cart.
     *
     * Recovery is never performed automatically here.
     */
    useEffect(() => {
        const initial = authProvider.getCurrentUser();
        let previous = initial
            ? { uid: initial.uid, isAnonymous: Boolean(initial.isAnonymous) }
            : null;

        const unsubscribe = authProvider.onAuthStateChanged((user) => {
            const next = user
                ? { uid: user.uid, isAnonymous: Boolean(user.isAnonymous) }
                : null;

            if (next?.uid && next.isAnonymous) {
                bindGuestHandoffToUid(next.uid, HANDOFF_IDENTITY.ANONYMOUS);
            }

            if (previous && !previous.isAnonymous && !next) {
                clearVisibleCart();
            }

            previous = next;
            setAuthRevision((revision) => revision + 1);
        });

        return unsubscribe;
    }, [clearVisibleCart]);

    /**
     * Durably persist the guest cart before any identity-changing
     * authentication operation. Writes the active `cart` key and the
     * `cart:handoff` record.
     */
    const prepareGuestCart = useCallback(() => {
        saveCartItems(cartItemsRef.current);
        return persistGuestHandoff(cartItemsRef.current);
    }, [persistGuestHandoff]);

    const addToCart = (product) => {
        const prevItems = cartItemsRef.current;
        const existingItem = prevItems.find((item) => item.id === product.id);
        const newItems = existingItem
            ? prevItems.map((item) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
            : [...prevItems, { ...product, quantity: 1 }];

        // 1. Persist the new cart and the pending handoff synchronously.
        // 2. Only then begin asynchronous anonymous authentication.
        commitCart(newItems);
        persistGuestHandoff(newItems);
        void ensureAnonymousSession();

        setLastAdded({
            id: product.id,
            name: product.name || 'Item',
            image: product.image || '',
            addedAt: Date.now(),
        });
    };

    const dismissLastAdded = useCallback(() => setLastAdded(null), []);

    const removeFromCart = (productId) => {
        commitCart(cartItemsRef.current.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        commitCart(
            cartItemsRef.current.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        commitCart([]);
        setLastAdded(null);
    };

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // Price may be a string like "$1,200" or a number.
    const getPriceValue = (priceStr) => {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    };

    const cartTotal = cartItems.reduce((total, item) => {
        return total + getPriceValue(item.price) * item.quantity;
    }, 0);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    /**
     * Describe whether an explicit guest-cart recovery is currently allowed.
     * Never reads or exposes the handoff items.
     *
     * Recovery requires: authenticated Firebase identity, a matching bound
     * UID, a non-empty handoff, and an empty visible cart.
     */
    const getGuestCartRecoveryStatus = useCallback(() => {
        const identity = resolveIdentity();

        if (!identity.uid) {
            return {
                recoverable: false,
                reason: 'no-authenticated-identity',
                itemCount: 0,
            };
        }

        const status = getGuestHandoffStatus(identity.uid);

        if (!status.recoverable) {
            return {
                recoverable: false,
                reason: status.reason,
                itemCount: status.itemCount,
            };
        }

        if (cartItemsRef.current.length > 0) {
            return {
                recoverable: false,
                reason: 'cart-not-empty',
                itemCount: status.itemCount,
            };
        }

        return {
            recoverable: true,
            reason: 'available',
            itemCount: status.itemCount,
        };
    }, []);

    /**
     * Explicit, user-triggered recovery of the guest cart.
     *
     * - Verifies the current Firebase UID against the handoff binding.
     * - Refuses to overwrite a non-empty cart.
     * - Never clears or mutates the handoff.
     * - A repeated call after a successful restore is a no-op ("cart-not-empty")
     *   so items are never duplicated.
     *
     * @returns {{ ok: boolean, reason: string, items?: Array<object> }}
     */
    const recoverGuestCart = useCallback(() => {
        const identity = resolveIdentity();

        if (!identity.uid) {
            return { ok: false, reason: 'no-authenticated-identity' };
        }

        const status = getGuestHandoffStatus(identity.uid);
        if (!status.recoverable) {
            return { ok: false, reason: status.reason };
        }

        if (cartItemsRef.current.length > 0) {
            return { ok: false, reason: 'cart-not-empty' };
        }

        const items = recoverGuestHandoff(identity.uid);
        if (!items || items.length === 0) {
            return { ok: false, reason: 'no-handoff' };
        }

        commitCart(items);
        return { ok: true, reason: 'restored', items };
    }, [commitCart]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                setIsCartOpen,
                toggleCart,
                lastAdded,
                dismissLastAdded,
                prepareGuestCart,
                recoverGuestCart,
                getGuestCartRecoveryStatus,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
