/**
 * Mock Auth Provider for offline development or testing
 */
let currentMockUser = null;
const listeners = [];

export const login = async (email, password) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            currentMockUser = {
                id: 'mock-1',
                uid: 'mock-1',
                name: email.split('@')[0] || 'Demo User',
                email: email,
                isAnonymous: false,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
            };
            listeners.forEach((cb) => cb(currentMockUser));
            resolve(currentMockUser);
        }, 300);
    });
};

export const signup = async (name, email, password) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            currentMockUser = {
                id: 'mock-1',
                uid: 'mock-1',
                name: name || 'Demo User',
                email: email,
                isAnonymous: false,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
            };
            listeners.forEach((cb) => cb(currentMockUser));
            resolve(currentMockUser);
        }, 300);
    });
};

export const loginAnonymouslyUser = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            currentMockUser = {
                id: 'mock-guest',
                uid: 'mock-guest',
                name: 'Guest User',
                email: 'guest@dealsonwheels.com',
                isAnonymous: true,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
            };
            listeners.forEach((cb) => cb(currentMockUser));
            resolve(currentMockUser);
        }, 200);
    });
};

export const logout = async () => {
    currentMockUser = null;
    listeners.forEach((cb) => cb(null));
};

export const onAuthStateChange = (callback) => {
    listeners.push(callback);
    callback(currentMockUser);
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
    };
};

export const getCurrentUser = () => currentMockUser;

export default {
    login,
    signup,
    loginAnonymously: loginAnonymouslyUser,
    logout,
    onAuthStateChange,
    getCurrentUser
};

