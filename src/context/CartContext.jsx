import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadCartItems, saveCartItems } from '../data/cartStorage';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Persistence (validation, parsing, serialization) lives in the adapter.
    const [cartItems, setCartItems] = useState(loadCartItems);

    const [isCartOpen, setIsCartOpen] = useState(false);
    // Ephemeral confirmation state for the add-to-cart toast. Not persisted.
    const [lastAdded, setLastAdded] = useState(null);

    useEffect(() => {
        saveCartItems(cartItems);
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
