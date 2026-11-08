import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Defensive validation for anything read back from localStorage.
// The persisted shape is unchanged: an array of product objects with a
// positive integer quantity.
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

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (!savedCart) return [];
            return normalizeCartItems(JSON.parse(savedCart));
        } catch (error) {
            console.error('Error reading cart from localStorage', error);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    // Ephemeral confirmation state for the add-to-cart toast. Not persisted.
    const [lastAdded, setLastAdded] = useState(null);

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to localStorage', error);
        }
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });

        // Show a confirmation toast. This intentionally does NOT open the drawer.
        setLastAdded({
            id: product.id,
            name: product.name || 'Item',
            image: product.image || '',
            addedAt: Date.now()
        });
    };

    const dismissLastAdded = useCallback(() => setLastAdded(null), []);

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Assuming price is a string like "$1,200" or number. We need to parse it.
    const getPriceValue = (priceStr) => {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    };

    const cartTotal = cartItems.reduce((total, item) => {
        return total + (getPriceValue(item.price) * item.quantity);
    }, 0);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <CartContext.Provider value={{
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
            dismissLastAdded
        }}>
            {children}
        </CartContext.Provider>
    );
};
