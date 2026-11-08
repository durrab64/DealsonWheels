import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartProvider } from '../data/compose';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Subscribe to cart changes for user or local cart
    useEffect(() => {
        let isMounted = true;
        const userId = user?.uid || user?.id || null;

        const unsubscribe = cartProvider.subscribeToCart(userId, (items) => {
            if (isMounted && Array.isArray(items)) {
                setCartItems(items);
            }
        });

        return () => {
            isMounted = false;
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [user?.uid, user?.id]);

    const addToCart = (product) => {
        const userId = user?.uid || user?.id || null;
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            let updated;
            if (existingItem) {
                updated = prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                updated = [...prevItems, { ...product, quantity: 1 }];
            }
            cartProvider.saveCart(userId, updated);
            return updated;
        });
    };

    const removeFromCart = (productId) => {
        const userId = user?.uid || user?.id || null;
        setCartItems(prevItems => {
            const updated = prevItems.filter(item => item.id !== productId);
            cartProvider.saveCart(userId, updated);
            return updated;
        });
    };

    const updateQuantity = (productId, quantity) => {
        const userId = user?.uid || user?.id || null;
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prevItems => {
            const updated = prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            );
            cartProvider.saveCart(userId, updated);
            return updated;
        });
    };

    const clearCart = () => {
        const userId = user?.uid || user?.id || null;
        setCartItems([]);
        cartProvider.clearCart(userId);
    };

    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

    const getPriceValue = (priceStr) => {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        return parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;
    };

    const cartTotal = cartItems.reduce((total, item) => {
        return total + (getPriceValue(item.price) * (item.quantity || 1));
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
            toggleCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
