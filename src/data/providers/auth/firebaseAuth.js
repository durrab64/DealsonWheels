import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    signOut,
    updateProfile,
    onAuthStateChanged
} from "firebase/auth";
import { auth } from "../../../firebase/config";

/**
 * Format Firebase user into unified user object
 */
export const formatUser = (fbUser) => {
    if (!fbUser) return null;
    return {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || (fbUser.isAnonymous ? 'Guest User' : fbUser.email?.split('@')[0] || 'User'),
        email: fbUser.email || (fbUser.isAnonymous ? 'guest@dealsonwheels.com' : ''),
        isAnonymous: fbUser.isAnonymous,
        avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || fbUser.email || 'User')}`
    };
};

/**
 * Sign in with email and password
 */
export const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return formatUser(userCredential.user);
};

/**
 * Register a new user with email, password, and display name
 */
export const signup = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
    }
    return formatUser(auth.currentUser || userCredential.user);
};

/**
 * Sign in anonymously as guest
 */
export const loginAnonymouslyUser = async () => {
    const userCredential = await signInAnonymously(auth);
    return formatUser(userCredential.user);
};

/**
 * Sign out current user
 */
export const logout = async () => {
    await signOut(auth);
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, (fbUser) => {
        callback(formatUser(fbUser));
    });
};

/**
 * Get current user synchronously
 */
export const getCurrentUser = () => {
    return formatUser(auth.currentUser);
};

export default {
    login,
    signup,
    loginAnonymously: loginAnonymouslyUser,
    logout,
    onAuthStateChange,
    getCurrentUser,
    formatUser
};

