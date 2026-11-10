/**
 * Composition layer for data providers.
 *
 * Wires domain-specific providers to the repository modules. This is the
 * single selection point for backing implementations. The current default
 * uses static data providers for catalog/vehicles and localStorage providers
 * for cart/auth. Future Firebase providers can be added here without
 * modifying repository consumers or UI components.
 *
 * No Firebase SDK, no Firebase configuration, no async providers are
 * introduced by this checkpoint. All providers are synchronous and match the
 * existing localStorage/static-module behavior exactly.
 */

import { catalogProvider } from './providers/catalog/staticProvider.js';
import { vehicleProvider } from './providers/vehicle/staticProvider.js';
import { cartProvider } from './providers/cart/localStorageProvider.js';
import { authProvider } from './providers/auth/firebaseAuthProvider.js';

export { catalogProvider, vehicleProvider, cartProvider, authProvider };