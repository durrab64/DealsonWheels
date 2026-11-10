import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInAnonymously: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(() => Promise.resolve()),
  linkWithCredential: vi.fn(),
  EmailAuthProvider: { credential: vi.fn() },
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

import {
  catalogProvider,
  vehicleProvider,
  cartProvider,
  authProvider,
} from './compose.js'

import {
  getCategory,
  getGeneratedProducts,
  getProductDetail,
} from './catalogRepository.js'

import { getVehicleListings, getVehicleById } from './vehicleRepository.js'
import { CART_STORAGE_KEY, loadCartItems, saveCartItems } from './cartStorage.js'
import {
  AUTH_STORAGE_KEY,
  loadUser,
  saveUser,
  clearUser,
} from './authStorage.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('compose provider selection', () => {
  it('exports all four default providers', () => {
    expect(catalogProvider).toBeDefined()
    expect(vehicleProvider).toBeDefined()
    expect(cartProvider).toBeDefined()
    expect(authProvider).toBeDefined()
  })

  it('selects static providers by default (no Firebase)', () => {
    expect(typeof catalogProvider.getCategory).toBe('function')
    expect(typeof vehicleProvider.getVehicleListings).toBe('function')
    expect(typeof cartProvider.loadCartItems).toBe('function')
    expect(typeof authProvider.loadUser).toBe('function')
  })
})

describe('catalog provider contract', () => {
  it('implements all catalog provider methods', () => {
    expect(typeof catalogProvider.getCategoryEntries).toBe('function')
    expect(typeof catalogProvider.getCategory).toBe('function')
    expect(typeof catalogProvider.getChildCategory).toBe('function')
    expect(typeof catalogProvider.getGeneratedProducts).toBe('function')
    expect(typeof catalogProvider.getProductDetail).toBe('function')
  })

  it('returns authored categories from static provider', () => {
    const entries = catalogProvider.getCategoryEntries()
    expect(entries.map(([type]) => type)).toEqual([
      'exterior',
      'interior',
      'tech',
    ])
  })
})

describe('vehicle provider contract', () => {
  it('implements all vehicle provider methods', () => {
    expect(typeof vehicleProvider.getVehicleListings).toBe('function')
    expect(typeof vehicleProvider.getVehicleById).toBe('function')
  })

  it('returns the authored inventory from static provider', () => {
    const listings = vehicleProvider.getVehicleListings()
    expect(Array.isArray(listings)).toBe(true)
    expect(listings.length).toBeGreaterThan(0)
  })
})

describe('cart provider contract', () => {
  it('implements all cart provider methods', () => {
    expect(typeof cartProvider.loadCartItems).toBe('function')
    expect(typeof cartProvider.saveCartItems).toBe('function')
  })

  it('uses the existing localStorage key', () => {
    expect(cartProvider.CART_STORAGE_KEY).toBe('cart')
    expect(CART_STORAGE_KEY).toBe('cart')
  })
})

describe('auth provider contract', () => {
  it('implements all auth provider methods', () => {
    expect(typeof authProvider.loadUser).toBe('function')
    expect(typeof authProvider.saveUser).toBe('function')
    expect(typeof authProvider.clearUser).toBe('function')
  })

  it('uses the existing localStorage key', () => {
    expect(authProvider.AUTH_STORAGE_KEY).toBe('user')
    expect(AUTH_STORAGE_KEY).toBe('user')
  })
})

describe('repository delegation to providers', () => {
  it('catalogRepository delegates getCategory to catalogProvider', () => {
    const spy = vi.spyOn(catalogProvider, 'getCategory')
    getCategory('exterior')
    expect(spy).toHaveBeenCalledWith('exterior')
  })

  it('catalogRepository delegates getGeneratedProducts to catalogProvider', () => {
    const spy = vi.spyOn(catalogProvider, 'getGeneratedProducts')
    getGeneratedProducts('exterior', 'wheels')
    expect(spy).toHaveBeenCalledWith('exterior', 'wheels')
  })

  it('catalogRepository delegates getProductDetail to catalogProvider', () => {
    const spy = vi.spyOn(catalogProvider, 'getProductDetail')
    getProductDetail('exterior', 'wheels', 'wheels-product-0')
    expect(spy).toHaveBeenCalledWith('exterior', 'wheels', 'wheels-product-0')
  })

  it('vehicleRepository delegates getVehicleListings to vehicleProvider', () => {
    const spy = vi.spyOn(vehicleProvider, 'getVehicleListings')
    getVehicleListings()
    expect(spy).toHaveBeenCalled()
  })

  it('vehicleRepository delegates getVehicleById to vehicleProvider', () => {
    const spy = vi.spyOn(vehicleProvider, 'getVehicleById')
    getVehicleById('1')
    expect(spy).toHaveBeenCalledWith('1')
  })

  it('cartStorage delegates loadCartItems to cartProvider', () => {
    const spy = vi.spyOn(cartProvider, 'loadCartItems')
    loadCartItems()
    expect(spy).toHaveBeenCalled()
  })

  it('cartStorage delegates saveCartItems to cartProvider', () => {
    const spy = vi.spyOn(cartProvider, 'saveCartItems')
    const items = [{ id: 'x', name: 'X', quantity: 1 }]
    saveCartItems(items)
    expect(spy).toHaveBeenCalledWith(items)
  })

  it('authStorage delegates loadUser to authProvider', () => {
    const spy = vi.spyOn(authProvider, 'loadUser')
    loadUser()
    expect(spy).toHaveBeenCalled()
  })

  it('authStorage delegates saveUser to authProvider', () => {
    const spy = vi.spyOn(authProvider, 'saveUser')
    const user = { id: '1', name: 'Demo User', email: 'demo@example.com' }
    saveUser(user)
    expect(spy).toHaveBeenCalledWith(user)
  })

  it('authStorage delegates clearUser to authProvider', () => {
    const spy = vi.spyOn(authProvider, 'clearUser')
    clearUser()
    expect(spy).toHaveBeenCalled()
  })
})

describe('provider substitution', () => {
  it('accepts a fake catalog provider with the same contract shape', () => {
    const fakeCatalogProvider = {
      getCategoryEntries: () => [],
      getCategory: () => undefined,
      getChildCategory: () => undefined,
      getGeneratedProducts: () => [],
      getProductDetail: () => null,
    }

    // A repository written to accept a provider argument would use the fake.
    // This test documents the substitution shape; repositories currently use
    // the default provider from compose.js.
    expect(typeof fakeCatalogProvider.getCategory).toBe('function')
    expect(typeof fakeCatalogProvider.getGeneratedProducts).toBe('function')
    expect(fakeCatalogProvider.getProductDetail('x', 'y', 'z')).toBeNull()
  })

  it('accepts a fake cart provider that reports save failures', () => {
    const fakeCartProvider = {
      CART_STORAGE_KEY: 'cart',
      loadCartItems: () => [],
      saveCartItems: () => false,
    }

    expect(fakeCartProvider.saveCartItems([{ id: 'a', name: 'A' }])).toBe(false)
    expect(fakeCartProvider.loadCartItems()).toEqual([])
  })
})
