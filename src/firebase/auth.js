import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./config";

/**
 * Sign in existing user with email and password
 */
export const logInWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Register a new user with email, password, and optional display name
 */
export const registerWithEmail = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (name && auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: name
    });
  }
  return userCredential.user;
};

/**
 * Sign in as an anonymous guest user
 */
export const loginAnonymously = async () => {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

/**
 * Sign out current user
 */
export const logOutUser = async () => {
  await signOut(auth);
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

