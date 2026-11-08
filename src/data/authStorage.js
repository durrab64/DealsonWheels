/**
 * Authentication persistence adapter for the existing mock auth.
 *
 * Owns the `user` localStorage key and the JSON encoding/validation. It does
 * not authenticate anyone: credentials, sessions and tokens are unchanged
 * mock behavior and remain in `AuthContext`.
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
export const loadUser = () => {
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
export const saveUser = (user) => {
    if (isValidUser(user)) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
};

/**
 * Remove the persisted user.
 */
export const clearUser = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
};
