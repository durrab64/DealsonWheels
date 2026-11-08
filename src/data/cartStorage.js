/**
 * Cart persistence adapter.
 *
 * Owns the `cart` localStorage key, the JSON encoding, and the defensive
 * validation of anything read back from storage. It deliberately does not own
 * cart business rules (pricing, totals, add/remove/update); those stay in
 * `CartContext`.
 *
 * The persisted shape is unchanged: an array of product objects, each with a
 * positive integer quantity.
 */

export const CART_STORAGE_KEY = 'cart';

const isValidCartItem = (item) =>
    Boolean(item) &&
    typeof item === 'object' &&
    (typeof item.id === 'string' || typeof item.id === 'number') &&
    typeof item.name === 'string';

const normalizeCartItems = (value) => {
    if (!Array.isArray(value)) return [];

    return value
        .filter(isValidCartItem)
        .map(item => ({
            ...item,
            quantity:
                typeof item.quantity === 'number' &&
                Number.isFinite(item.quantity) &&
                item.quantity > 0
                    ? Math.floor(item.quantity)
                    : 1
        }));
};

/**
 * Read and normalize the persisted cart.
 *
 * Behavior matches the previous context logic: missing storage returns an
 * empty array; invalid JSON is logged and treated as an empty cart.
 *
 * @returns {Array<object>}
 */
export const loadCartItems = () => {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (!savedCart) return [];
        return normalizeCartItems(JSON.parse(savedCart));
    } catch (error) {
        console.error('Error reading cart from localStorage', error);
        return [];
    }
};

/**
 * Persist the cart.
 *
 * @param {Array<object>} items
 * @returns {boolean} true when the write succeeded, false when it failed.
 */
export const saveCartItems = (items) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving cart to localStorage', error);
        return false;
    }
};
