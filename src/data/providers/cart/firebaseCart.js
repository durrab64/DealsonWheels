import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase/config";

const LOCAL_STORAGE_KEY = 'cart';

/**
 * Get fallback cart from localStorage
 */
const getLocalCart = () => {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to read local cart", e);
        return [];
    }
};

/**
 * Save fallback cart to localStorage
 */
const saveLocalCart = (items) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error("Failed to save local cart", e);
    }
};

/**
 * Load cart items for a user (Firestore if userId exists, else localStorage)
 */
export const getCart = async (userId) => {
    if (!userId) {
        return getLocalCart();
    }

    try {
        const cartRef = doc(db, "carts", userId);
        const docSnap = await getDoc(cartRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const items = data.items || [];
            saveLocalCart(items);
            return items;
        } else {
            // Check if there are local items to sync up
            const localItems = getLocalCart();
            if (localItems.length > 0) {
                await setDoc(cartRef, { items: localItems, updatedAt: new Date().toISOString() });
            }
            return localItems;
        }
    } catch (error) {
        console.warn("Firestore getCart error, falling back to local cart:", error);
        return getLocalCart();
    }
};

/**
 * Save cart items for a user
 */
export const saveCart = async (userId, items) => {
    saveLocalCart(items);

    if (!userId) return;

    try {
        const cartRef = doc(db, "carts", userId);
        await setDoc(cartRef, {
            items,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.warn("Firestore saveCart error:", error);
    }
};

/**
 * Clear cart for a user
 */
export const clearCart = async (userId) => {
    saveLocalCart([]);

    if (!userId) return;

    try {
        const cartRef = doc(db, "carts", userId);
        await setDoc(cartRef, {
            items: [],
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.warn("Firestore clearCart error:", error);
    }
};

/**
 * Listen to real-time cart updates from Firestore
 */
export const subscribeToCart = (userId, callback) => {
    if (!userId) {
        callback(getLocalCart());
        return () => {};
    }

    try {
        const cartRef = doc(db, "carts", userId);
        return onSnapshot(cartRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const items = data.items || [];
                saveLocalCart(items);
                callback(items);
            }
        }, (error) => {
            console.warn("Firestore subscribeToCart snapshot error:", error);
            callback(getLocalCart());
        });
    } catch (error) {
        console.warn("Firestore subscribeToCart error:", error);
        callback(getLocalCart());
        return () => {};
    }
};

export default {
    getCart,
    saveCart,
    clearCart,
    subscribeToCart
};

