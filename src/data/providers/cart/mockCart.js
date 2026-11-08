const LOCAL_STORAGE_KEY = 'cart';

export const getCart = async (userId) => {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
};

export const saveCart = async (userId, items) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error("Mock save cart error", e);
    }
};

export const clearCart = async (userId) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
};

export const subscribeToCart = (userId, callback) => {
    getCart(userId).then(callback);
    return () => {};
};

export default {
    getCart,
    saveCart,
    clearCart,
    subscribeToCart
};

