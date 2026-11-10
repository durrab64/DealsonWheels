/**
 * LocalStorage authentication persistence provider for the existing mock auth.
 *
 * Implements the auth persistence contract using the `user` localStorage key
 * and JSON encoding. It does not authenticate anyone: credentials, sessions
 * and tokens are unchanged mock behavior and remain in `AuthContext`.
 *
 * Provider contract:
 *   AUTH_STORAGE_KEY: 'user'
 *   loadUser(): object | null
 *   saveUser(user: object | null): void
 *   clearUser(): void
 */

export const AUTH_STORAGE_KEY = 'user';

// Only accept a persisted user that has the fields the UI relies on.
const isValidUser = (value) =>
    Boolean(value) &&
    typeof value === 'object' &&
    (typeof value.id === 'string' || typeof value.id === 'number') &&
    typeof value.name === 'string' &&
    typeof value.email === 'string';

/**
 * Read the persisted user.
 *
 * Missing storage, invalid JSON and invalid user shapes all yield `null`,
 * matching the previous context initialization.
 *
 * @returns {object | null}
 */
const loadUser = () => {
    try {
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!savedUser) return null;
        const parsedUser = JSON.parse(savedUser);
        return isValidUser(parsedUser) ? parsedUser : null;
    } catch {
        return null;
    }
};

/**
 * Persist a user, or remove the stored user when the value is not valid.
 *
 * @param {object | null} user
 */
const saveUser = (user) => {
    try {
        if (isValidUser(user)) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    } catch {
        // Ignore storage errors
    }
};

/**
 * Remove the persisted user.
 */
const clearUser = () => {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        // Ignore storage errors
    }
};

export const authProvider = {
    AUTH_STORAGE_KEY,
    loadUser,
    saveUser,
    clearUser,
};
