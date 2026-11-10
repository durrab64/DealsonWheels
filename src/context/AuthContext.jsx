import React, { createContext, useContext, useState, useEffect } from 'react';
import { authProvider } from '../data/compose.js';
import {
    loadCartItems,
    prepareGuestHandoff,
    bindGuestHandoffToUid,
    getGuestHandoffStatus,
    HANDOFF_IDENTITY,
    HANDOFF_STATUS,
} from '../data/cartStorage';

const AuthContext = createContext();

/**
 * Durably snapshot the guest cart before an identity-changing operation.
 *
 * Runs synchronously before `login()`/`signup()` so no React effect or
 * asynchronous authentication call can race ahead of the persistence write.
 *
 * A signed-in non-anonymous customer who is switching accounts must not
 * overwrite the guest handoff with their own cart, and a handoff already bound
 * to an anonymous UID keeps that binding (it is never reassigned to the
 * customer who signs in).
 */
const preserveGuestCartBeforeIdentityChange = () => {
    const current = authProvider.getCurrentUser();

    if (current && !current.isAnonymous) {
        // Customer switching accounts: leave the guest handoff untouched.
        return;
    }

    const persisted = authProvider.loadUser();
    if (!current && persisted && persisted.isAnonymous !== true) {
        // A persisted customer profile exists but Firebase has not restored
        // yet. Treat this as a customer session, not a guest.
        return;
    }

    const items = loadCartItems();
    if (items.length === 0) return;

    // Never overwrite a handoff already owned by a different (or as-yet
    // unknown) Firebase identity. Preserve the original binding intact.
    const existing = getGuestHandoffStatus(current?.uid || null);
    if (existing.status === HANDOFF_STATUS.MISMATCH) return;
    if (
        existing.status === HANDOFF_STATUS.BOUND &&
        existing.reason === 'no-authenticated-identity'
    ) {
        return;
    }

    if (!prepareGuestHandoff(items)) return;

    const uid =
        current?.uid ||
        (persisted?.isAnonymous === true && persisted.id
            ? String(persisted.id)
            : null);

    if (uid) {
        bindGuestHandoffToUid(uid, HANDOFF_IDENTITY.ANONYMOUS);
    }
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Persistence (validation, parsing, serialization) lives in the adapter.
    // Firebase Auth state is authoritative once initialized.
    const [user, setUser] = useState(() => authProvider.loadUser());
    const [isLoading, setIsLoading] = useState(true);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetMessage, setResetMessage] = useState(null);
    const [resetError, setResetError] = useState(null);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

    // Initialize Firebase Auth state listener on mount.
    useEffect(() => {
        authProvider.init();
        const unsubscribe = authProvider.onAuthStateChanged((user) => {
            if (user) {
                authProvider.saveUser(user);
                setUser({
                    id: user.uid,
                    name: user.displayName || '',
                    email: user.email,
                    avatarUrl: user.photoURL || null,
                    isAnonymous: user.isAnonymous || false,
                });
            } else {
                setUser(null);
                authProvider.clearUser();
            }
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        // Preserve the guest cart before Firebase changes identity.
        preserveGuestCartBeforeIdentityChange();

        const user = await authProvider.login(email, password);
        setUser({
            id: user.uid,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            isAnonymous: user.isAnonymous,
        });
        return user;
    };

    const signup = async (name, email, password) => {
        // Preserve the guest cart before Firebase changes identity.
        preserveGuestCartBeforeIdentityChange();

        const current = authProvider.getCurrentUser();
        let user;

        if (current?.isAnonymous) {
            // Upgrade the anonymous account in place. Linking preserves the
            // Firebase UID, so the guest handoff stays bound to the same
            // identity and is not reassigned.
            user = await authProvider.linkWithCredential(email, password);
            if (name && typeof user?.updateProfile === 'function') {
                await user.updateProfile({ displayName: name });
            }
        } else {
            user = await authProvider.signup(email, password, name);
        }

        setUser({
            id: user.uid,
            name: user.name || name || user.displayName || '',
            email: user.email,
            avatarUrl: user.avatarUrl || user.photoURL || null,
            isAnonymous: false,
        });
        return user;
    };

    const logout = async () => {
        await authProvider.logout();
        setUser(null);
    };

    /**
     * Send a password-reset email to the given address.
     *
     * Responses are intentionally non-enumerating: whether or not the email
     * is registered, the user receives the same success guidance. This
     * prevents attackers from probing which email addresses exist.
     */
    const resetPassword = async (email) => {
        setIsResettingPassword(true);
        setResetMessage(null);
        setResetError(null);
        try {
            await authProvider.resetPassword(email);
            setResetMessage(
                'If an account exists for that email, a password-reset link has been sent.'
            );
        } catch {
            // Same non-enumerating guidance on error
            setResetMessage(
                'If an account exists for that email, a password-reset link has been sent.'
            );
        } finally {
            setIsResettingPassword(false);
        }
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
            isLoading,
            login,
            signup,
            resetPassword,
            isResettingPassword,
            resetMessage,
            resetError,
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
