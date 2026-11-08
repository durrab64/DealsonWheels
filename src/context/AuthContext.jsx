import React, { createContext, useContext, useState, useEffect } from 'react';
import { authProvider } from '../data/compose';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            return null;
        }
    });

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authProvider.onAuthStateChange((userData) => {
            setUser(userData);
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                localStorage.removeItem('user');
            }
            setLoading(false);
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    const login = async (email, password) => {
        const loggedUser = await authProvider.login(email, password);
        setUser(loggedUser);
        setIsAuthModalOpen(false);
        return loggedUser;
    };

    const signup = async (name, email, password) => {
        const newUser = await authProvider.signup(name, email, password);
        setUser(newUser);
        setIsAuthModalOpen(false);
        return newUser;
    };

    const loginGuest = async () => {
        const guestUser = await authProvider.loginAnonymously();
        setUser(guestUser);
        setIsAuthModalOpen(false);
        return guestUser;
    };

    const logout = async () => {
        await authProvider.logout();
        setUser(null);
        localStorage.removeItem('user');
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
            loading,
            login,
            signup,
            loginGuest,
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
