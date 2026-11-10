/**
 * Firebase authentication provider.
 *
 * Implements the auth persistence contract using Firebase Authentication.
 * Supports anonymous guest authentication (lazy, triggered on first cart
 * addition) and email/password authentication for registered customers.
 *
 * Provider contract:
 *   AUTH_STORAGE_KEY: 'user'
 *   loadUser(): object | null
 *   saveUser(user: object | null): void
 *   clearUser(): void
 *   signInAnonymously(): Promise<firebase.auth.User>
 *   signup(email, password): Promise<firebase.auth.User>
 *   login(email, password): Promise<firebase.auth.User>
 *   logout(): Promise<void>
 *   linkWithCredential(email, password): Promise<firebase.auth.User>
 *   resetPassword(email): Promise<void>
 *   getCurrentUser(): firebase.auth.User | null
 *   onAuthStateChanged(callback): function
 */

import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { app } from "../../../firebase/config.js";

const AUTH_STORAGE_KEY = 'user';

// Only accept a persisted user that has the fields the UI relies on.
const isValidUser = (value) =>
    Boolean(value) &&
    typeof value === 'object' &&
    (typeof value.id === 'string' || typeof value.id === 'number') &&
    typeof value.name === 'string' &&
    typeof value.email === 'string';

const auth = getAuth(app);

let isInitialized = false;

function ensureInitialized() {
  if (isInitialized) return;
  isInitialized = true;
  onAuthStateChanged(auth, (user) => {
    currentAuthUser = user;
  });
}

let currentAuthUser = auth.currentUser;

export const authProvider = {
  AUTH_STORAGE_KEY,

  /**
   * Initialize the auth state listener. Call once at app bootstrap.
   */
  init() {
    ensureInitialized();
  },

  /**
   * Read the persisted user from localStorage (transitional fallback only.
   * Firebase Auth state is authoritative once initialized).
   */
  loadUser() {
    let savedCart;
    try {
      savedCart = localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
      return null;
    }
    if (!savedCart) return null;
    try {
      const parsed = JSON.parse(savedCart);
      return isValidUser(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  /**
   * Persist user to localStorage (transitional fallback).
   */
  saveUser(user) {
    try {
      if (isValidUser(user)) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  },

  clearUser() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Create an anonymous Firebase Auth session (lazy, triggered on first
   * cart addition).
   */
  async signInAnonymously() {
    ensureInitialized();
    const result = await signInAnonymously(auth);
    const user = result.user;
    this.saveUser({
      id: user.uid,
      name: 'Guest',
      email: null,
      avatarUrl: null,
      isAnonymous: true,
    });
    return user;
  },

  /**
   * Register a new email/password account.
   *
   * Anonymous-account upgrades are orchestrated by AuthContext, which calls
   * `linkWithCredential()` instead so the existing Firebase UID is preserved.
   */
  async signup(email, password, name) {
    ensureInitialized();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    if (name) {
      await user.updateProfile({ displayName: name });
    }
    this.saveUser({
      id: user.uid,
      name: name || user.displayName || '',
      email: user.email,
      avatarUrl: user.photoURL || null,
      isAnonymous: false,
    });
    return user;
  },

  /**
   * Sign in with email and password.
   *
   * Signing in to an existing account replaces any anonymous session; the
   * guest handoff stays bound to the original anonymous UID and is not
   * reassigned to the customer.
   */
  async login(email, password) {
    ensureInitialized();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    this.saveUser({
      id: user.uid,
      name: user.displayName || '',
      email: user.email,
      avatarUrl: user.photoURL || null,
      isAnonymous: false,
    });
    return user;
  },

  /**
   * Sign out the current Firebase user and clear local persistence.
   */
  async logout() {
    await signOut(auth);
    this.clearUser();
  },

  /**
   * Link an anonymous account to email/password credentials, preserving
   * the same Firebase UID.
   */
  async linkWithCredential(email, password) {
    ensureInitialized();
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(auth.currentUser, credential);
    const user = result.user;
    this.saveUser({
      id: user.uid,
      name: user.displayName || '',
      email: user.email,
      avatarUrl: user.photoURL || null,
      isAnonymous: false,
    });
    return user;
  },

  /**
   * Send a password-reset email to the given address.
   *
   * Firebase Authentication's sendPasswordResetEmail always resolves
   * successfully regardless of whether the email is registered. This
   * intentionally prevents email enumeration: callers receive the same
   * success/failure behavior whether or not the address exists.
   *
   * @param {string} email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Get the current Firebase Auth user synchronously.
   */
  getCurrentUser() {
    return auth.currentUser;
  },

  /**
   * Subscribe to auth state changes.
   */
  onAuthStateChanged(callback) {
    ensureInitialized();
    return onAuthStateChanged(auth, callback);
  },
};
