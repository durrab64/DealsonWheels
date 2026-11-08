import { firebaseAuth, mockAuth } from './providers/auth';
import { firebaseCart, mockCart } from './providers/cart';

/**
 * Data provider composer
 * Selects active provider implementation (Firebase by default)
 */
export const PROVIDER_MODE = import.meta.env.VITE_DATA_PROVIDER || 'firebase';

export const authProvider = PROVIDER_MODE === 'mock' ? mockAuth : firebaseAuth;
export const cartProvider = PROVIDER_MODE === 'mock' ? mockCart : firebaseCart;

export default {
    auth: authProvider,
    cart: cartProvider
};

