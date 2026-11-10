import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signInAnonymously } from 'firebase/auth'
import { CartProvider, useCart } from './CartContext'
import { authProvider } from '../data/compose.js'
import {
  GUEST_HANDOFF_KEY,
  GUEST_HANDOFF_SCHEMA,
  GUEST_HANDOFF_VERSION,
} from '../data/cartStorage'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInAnonymously: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(() => Promise.resolve()),
  linkWithCredential: vi.fn(),
  EmailAuthProvider: { credential: vi.fn() },
  onAuthStateChanged: vi.fn((_auth, cb) => {
    Promise.resolve().then(() => cb(null));
    return () => {};
  }),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

const renderCart = () => renderHook(() => useCart(), { wrapper })

const wheel = {
  id: 'wheel-1',
  name: 'Wheel',
  price: '$1,200.50',
  image: '/wheel.png',
  description: 'A wheel',
}

const boundRecord = (uid, cartItems = [{ ...wheel, quantity: 2 }]) => ({
  schema: GUEST_HANDOFF_SCHEMA,
  version: GUEST_HANDOFF_VERSION,
  state: 'bound',
  firebaseUid: uid,
  identityType: 'anonymous',
  items: cartItems,
  source: 'guest',
  createdAt: 1000,
  updatedAt: 1000,
})

const pendingRecord = (cartItems = [{ ...wheel, quantity: 2 }]) => ({
  schema: GUEST_HANDOFF_SCHEMA,
  version: GUEST_HANDOFF_VERSION,
  state: 'pending',
  firebaseUid: null,
  identityType: null,
  items: cartItems,
  source: 'guest',
  createdAt: 1000,
  updatedAt: 1000,
})

const storeHandoff = (record) =>
  localStorage.setItem(GUEST_HANDOFF_KEY, JSON.stringify(record))

const readHandoff = () => JSON.parse(localStorage.getItem(GUEST_HANDOFF_KEY))

const anonymousUser = { uid: 'anon-1', isAnonymous: true }
const customerUser = { uid: 'cust-1', isAnonymous: false }

beforeEach(() => {
  vi.mocked(signInAnonymously).mockResolvedValue({
    user: { uid: 'anon-1', isAnonymous: true },
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    const { result } = renderCart()

    expect(result.current.cartItems).toEqual([])
    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartTotal).toBe(0)
    expect(result.current.isCartOpen).toBe(false)
  })

  it('adds an item with quantity 1 and exposes an add confirmation', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(wheel))

    expect(result.current.cartItems).toEqual([{ ...wheel, quantity: 1 }])
    expect(result.current.cartCount).toBe(1)
    expect(result.current.lastAdded).toMatchObject({
      id: wheel.id,
      name: wheel.name,
      image: wheel.image,
    })
  })

  it('increases quantity instead of duplicating an existing item', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(wheel))
    act(() => result.current.addToCart(wheel))

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantity).toBe(2)
    expect(result.current.cartCount).toBe(2)
  })

  it('updates quantity and removes the item when quantity drops below 1', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(wheel))
    act(() => result.current.updateQuantity(wheel.id, 4))
    expect(result.current.cartItems[0].quantity).toBe(4)

    act(() => result.current.updateQuantity(wheel.id, 0))
    expect(result.current.cartItems).toEqual([])
  })

  it('removes an item by id', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(wheel))
    act(() => result.current.removeFromCart(wheel.id))

    expect(result.current.cartItems).toEqual([])
  })

  it('counts total quantity and sums price times quantity', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(wheel))
    act(() => result.current.addToCart(wheel))

    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartTotal).toBeCloseTo(2401)
  })

  it('clears the cart and dismisses the add confirmation', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(wheel))
    act(() => result.current.clearCart())
    expect(result.current.cartItems).toEqual([])
    expect(result.current.cartCount).toBe(0)
    expect(result.current.lastAdded).toBeNull()
  })

  it('toggles and sets the drawer open state', () => {
    const { result } = renderCart()

    act(() => result.current.toggleCart())
    expect(result.current.isCartOpen).toBe(true)

    act(() => result.current.toggleCart())
    expect(result.current.isCartOpen).toBe(false)
  })

  it('persists the cart and restores it after the provider remounts', () => {
    const firstRender = renderCart()

    act(() => firstRender.result.current.addToCart(wheel))
    act(() => firstRender.result.current.addToCart(wheel))

    expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
      { ...wheel, quantity: 2 },
    ])

    firstRender.unmount()

    const { result } = renderCart()
    expect(result.current.cartItems).toEqual([{ ...wheel, quantity: 2 }])
    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartTotal).toBeCloseTo(2401)
  })

  describe('guest cart handoff', () => {
    it('persists a pending handoff before signInAnonymously begins', async () => {
      const signIn = vi.mocked(signInAnonymously)

      signIn.mockImplementation(() => {
        const handoff = readHandoff()
        expect(handoff).not.toBeNull()
        expect(handoff.state).toBe('pending')
        expect(handoff.firebaseUid).toBeNull()
        expect(handoff.items).toEqual([{ ...wheel, quantity: 1 }])
        return Promise.resolve({ user: { uid: 'anon-1', isAnonymous: true } })
      })

      const { result } = renderCart()

      act(() => result.current.addToCart(wheel))

      // Active cart key is persisted too.
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
        { ...wheel, quantity: 1 },
      ])

      expect(signIn).toHaveBeenCalled()
    })

    it('binds the handoff to the anonymous UID after sign-in succeeds', async () => {
      const { result } = renderCart()

      await act(async () => {
        result.current.addToCart(wheel)
        await Promise.resolve()
      })

      const handoff = readHandoff()
      expect(handoff.state).toBe('bound')
      expect(handoff.firebaseUid).toBe('anon-1')
      expect(handoff.identityType).toBe('anonymous')
      expect(handoff.items).toEqual([{ ...wheel, quantity: 1 }])
    })

    it('preserves the pending handoff when authentication fails', async () => {
      vi.mocked(signInAnonymously).mockRejectedValueOnce(
        new Error('Firebase sign-in failed')
      )

      const { result } = renderCart()

      await act(async () => {
        result.current.addToCart(wheel)
        await Promise.resolve()
      })

      expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
        { ...wheel, quantity: 1 },
      ])

      const handoff = readHandoff()
      expect(handoff).not.toBeNull()
      expect(handoff.state).toBe('pending')
      expect(handoff.firebaseUid).toBeNull()
      expect(handoff.items).toEqual([{ ...wheel, quantity: 1 }])
    })

    it('does not create a handoff for a signed-in customer', () => {
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(customerUser)

      const { result } = renderCart()

      act(() => result.current.addToCart(wheel))

      expect(localStorage.getItem(GUEST_HANDOFF_KEY)).toBeNull()
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
        { ...wheel, quantity: 1 },
      ])
    })

    it('never overwrites a handoff bound to another Firebase UID', () => {
      const foreignHandoff = boundRecord('anon-other', [
        { ...wheel, id: 'foreign', quantity: 7 },
      ])
      storeHandoff(foreignHandoff)
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue({
        uid: 'anon-new',
        isAnonymous: true,
      })

      const { result } = renderCart()

      act(() => result.current.addToCart(wheel))

      // The foreign owner's snapshot is preserved byte-for-byte.
      expect(readHandoff()).toEqual(foreignHandoff)
      // The active cart still updates for the current browser session.
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
        { ...wheel, quantity: 1 },
      ])
    })

    it('binds a pending handoff when an anonymous session is restored', () => {
      storeHandoff(pendingRecord())
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(anonymousUser)

      const { result } = renderCart()

      act(() => result.current.addToCart(wheel))

      const handoff = readHandoff()
      expect(handoff.state).toBe('bound')
      expect(handoff.firebaseUid).toBe('anon-1')
    })

    it('recovers a matching UID-bound handoff explicitly', () => {
      storeHandoff(boundRecord('anon-1'))
      localStorage.setItem('cart', JSON.stringify([]))
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(anonymousUser)

      const { result } = renderCart()

      const status = result.current.getGuestCartRecoveryStatus()
      expect(status.recoverable).toBe(true)
      expect(status.itemCount).toBe(1)

      let outcome
      act(() => {
        outcome = result.current.recoverGuestCart()
      })

      expect(outcome.ok).toBe(true)
      expect(result.current.cartItems).toEqual([{ ...wheel, quantity: 2 }])
      // The handoff is preserved for the future migration checkpoint.
      expect(readHandoff()).toEqual(boundRecord('anon-1'))
    })

    it('refuses recovery for a mismatched UID and preserves the handoff', () => {
      storeHandoff(boundRecord('anon-1'))
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(customerUser)

      const { result } = renderCart()

      expect(result.current.getGuestCartRecoveryStatus()).toMatchObject({
        recoverable: false,
        reason: 'uid-mismatch',
      })

      let outcome
      act(() => {
        outcome = result.current.recoverGuestCart()
      })

      expect(outcome).toEqual({ ok: false, reason: 'uid-mismatch' })
      expect(result.current.cartItems).toEqual([])
      expect(readHandoff()).toEqual(boundRecord('anon-1'))
    })

    it('never exposes an unclaimed pending handoff', () => {
      storeHandoff(pendingRecord())
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(customerUser)

      const { result } = renderCart()

      expect(result.current.getGuestCartRecoveryStatus()).toMatchObject({
        recoverable: false,
        reason: 'unclaimed-handoff',
      })

      let outcome
      act(() => {
        outcome = result.current.recoverGuestCart()
      })

      expect(outcome).toEqual({ ok: false, reason: 'unclaimed-handoff' })
      expect(result.current.cartItems).toEqual([])
      expect(readHandoff()).toEqual(pendingRecord())
    })

    it('never overwrites a non-empty cart', () => {
      storeHandoff(boundRecord('anon-1'))
      localStorage.setItem(
        'cart',
        JSON.stringify([{ ...wheel, id: 'existing', quantity: 1 }])
      )
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(anonymousUser)

      const { result } = renderCart()

      expect(result.current.getGuestCartRecoveryStatus()).toMatchObject({
        recoverable: false,
        reason: 'cart-not-empty',
      })

      let outcome
      act(() => {
        outcome = result.current.recoverGuestCart()
      })

      expect(outcome).toEqual({ ok: false, reason: 'cart-not-empty' })
      expect(result.current.cartItems).toEqual([
        { ...wheel, id: 'existing', quantity: 1 },
      ])
      expect(readHandoff()).toEqual(boundRecord('anon-1'))
    })

    it('is idempotent: a repeated recovery does not duplicate items', () => {
      storeHandoff(boundRecord('anon-1'))
      localStorage.setItem('cart', JSON.stringify([]))
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(anonymousUser)

      const { result } = renderCart()

      let first
      let second
      act(() => {
        first = result.current.recoverGuestCart()
      })
      act(() => {
        second = result.current.recoverGuestCart()
      })

      expect(first.ok).toBe(true)
      expect(second).toEqual({ ok: false, reason: 'cart-not-empty' })
      expect(result.current.cartItems).toEqual([{ ...wheel, quantity: 2 }])
      expect(result.current.cartCount).toBe(2)
      expect(readHandoff()).toEqual(boundRecord('anon-1'))
    })

    it('clears the visible cart on customer logout but preserves persisted cart', () => {
      let authCallback
      vi.spyOn(authProvider, 'onAuthStateChanged').mockImplementation((cb) => {
        authCallback = cb
        return () => {}
      })
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(customerUser)

      localStorage.setItem('cart', JSON.stringify([{ ...wheel, quantity: 2 }]))
      storeHandoff(boundRecord('anon-1'))

      const { result } = renderCart()
      expect(result.current.cartItems).toEqual([{ ...wheel, quantity: 2 }])

      act(() => authCallback({ uid: 'cust-1', isAnonymous: false }))
      act(() => authCallback(null))

      expect(result.current.cartItems).toEqual([])
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
        { ...wheel, quantity: 2 },
      ])
      // Logout must not delete the guest handoff.
      expect(readHandoff()).toEqual(boundRecord('anon-1'))
    })

    it('exposes prepareGuestCart and it writes both keys', () => {
      const { result } = renderCart()

      let prepared
      act(() => {
        prepared = result.current.prepareGuestCart()
      })

      expect(prepared).toBe(true)
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual([])
      expect(readHandoff()).toMatchObject({
        schema: GUEST_HANDOFF_SCHEMA,
        version: GUEST_HANDOFF_VERSION,
        state: 'pending',
        items: [],
      })
    })
  })
})
