/**
 * Authentication persistence adapter for the existing mock auth.
 *
 * Owns the `user` localStorage key through a provider selected in
 * `compose.js`. It does not authenticate anyone: credentials, sessions
 * and tokens are unchanged mock behavior and remain in `AuthContext`.
 */

import { authProvider } from './compose.js';

export const AUTH_STORAGE_KEY = authProvider.AUTH_STORAGE_KEY;

/**
 * Read the persisted user.
 *
 * Missing storage, invalid JSON and invalid user shapes all yield `null`,
 * matching the previous context initialization.
 *
 * @returns {object | null}
 */
export const loadUser = () => {
    try {
        return authProvider.loadUser();
    } catch {
        return null;
    }
};

/**
 * Persist a user, or remove the stored user when the value is not valid.
 *
 * @param {object | null} user
 */
export const saveUser = (user) => {
    try {
        authProvider.saveUser(user);
    } catch {
        // Ignore storage errors
    }
};

/**
 * Remove the persisted user.
 */
export const clearUser = () => {
    try {
        authProvider.clearUser();
    } catch {
        // Ignore storage errors
    }
};
