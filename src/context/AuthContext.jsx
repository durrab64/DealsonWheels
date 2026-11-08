import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Only accept a persisted user that has the fields the UI relies on.
const isValidUser = (value) =>
    Boolean(value) &&
    typeof value === 'object' &&
    (typeof value.id === 'string' || typeof value.id === 'number') &&
    typeof value.name === 'string' &&
    typeof value.email === 'string';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (!savedUser) return null;
            const parsedUser = JSON.parse(savedUser);
            return isValidUser(parsedUser) ? parsedUser : null;
        } catch (error) {
            return null;
        }
    });

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

    useEffect(() => {
        if (isValidUser(user)) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (email, password) => {
        // Mock login
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockUser = {
                    id: '1',
                    name: 'Demo User',
                    email: email,
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                };
                setUser(mockUser);
                setIsAuthModalOpen(false);
                resolve(mockUser);
            }, 1000);
        });
    };

    const signup = async (name, email, password) => {
        // Mock signup
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockUser = {
                    id: '1',
                    name: name,
                    email: email,
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                };
                setUser(mockUser);
                setIsAuthModalOpen(false);
                resolve(mockUser);
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
    };

    const openLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthMode('signup');
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            isAuthModalOpen,
            authMode,
            setAuthMode,
            openLogin,
            openSignup,
            closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
};
