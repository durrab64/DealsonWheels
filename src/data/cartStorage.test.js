vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

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
}));

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CART_STORAGE_KEY,
  GUEST_HANDOFF_KEY,
  GUEST_HANDOFF_SCHEMA,
  GUEST_HANDOFF_VERSION,
  HANDOFF_CLEAR_GUARD,
  HANDOFF_STATE,
  HANDOFF_STATUS,
  loadCartItems,
  saveCartItems,
  prepareGuestHandoff,
  bindGuestHandoffToUid,
  getGuestHandoffStatus,
  recoverGuestHandoff,
  isValidGuestHandoff,
  clearGuestHandoff,
} from './cartStorage'

const wheel = {
  id: 'wheel-1',
  name: 'Wheel',
  price: '$1,200.50',
  image: '/wheel.png',
  description: 'A wheel',
}

const items = [{ ...wheel, quantity: 2 }]

const boundRecord = (overrides = {}) => ({
  schema: GUEST_HANDOFF_SCHEMA,
  version: GUEST_HANDOFF_VERSION,
  state: HANDOFF_STATE.BOUND,
  firebaseUid: 'anon-1',
  identityType: 'anonymous',
  items,
  source: 'guest',
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
})

const storeHandoff = (record) =>
  localStorage.setItem(GUEST_HANDOFF_KEY, JSON.stringify(record))

const readHandoff = () => JSON.parse(localStorage.getItem(GUEST_HANDOFF_KEY))

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('cartStorage', () => {
  it('uses the existing localStorage key', () => {
    expect(CART_STORAGE_KEY).toBe('cart')
  })

  it('starts empty when nothing is stored', () => {
    expect(loadCartItems()).toEqual([])
  })

  it('round-trips a valid cart without changing its shape', () => {
    const cart = [{ ...wheel, quantity: 2 }]

    expect(saveCartItems(cart)).toBe(true)
    expect(JSON.parse(localStorage.getItem('cart'))).toEqual(cart)
    expect(loadCartItems()).toEqual(cart)
  })

  it('filters invalid entries and normalizes quantities on load', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([
        { id: 'ok', name: 'Valid', price: '$10', quantity: 2.9 },
        { id: 'missing-name', price: '$1', quantity: 1 },
        null,
        'not-an-item',
        { id: 'bad-quantity', name: 'Bad quantity', quantity: '2' },
        { id: 'zero-quantity', name: 'Zero quantity', quantity: 0 },
      ])
    )

    expect(loadCartItems()).toEqual([
      { id: 'ok', name: 'Valid', price: '$10', quantity: 2 },
      { id: 'bad-quantity', name: 'Bad quantity', quantity: 1 },
      { id: 'zero-quantity', name: 'Zero quantity', quantity: 1 },
    ])
  })

  it('returns an empty array for non-array stored values', () => {
    localStorage.setItem('cart', JSON.stringify({ id: 'not-an-array' }))

    expect(loadCartItems()).toEqual([])
  })

  it('recovers from malformed JSON, logs, and returns an empty array', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem('cart', '{not valid json')

    expect(loadCartItems()).toEqual([])
    expect(consoleError).toHaveBeenCalledWith(
      'Error reading cart from localStorage',
      expect.any(Error)
    )
  })

  it('reports save failures without throwing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(saveCartItems([wheel])).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(
      'Error saving cart to localStorage',
      expect.any(Error)
    )
  })

  describe('guest cart handoff', () => {
    it('exposes a distinct handoff key', () => {
      expect(GUEST_HANDOFF_KEY).toBe('cart:handoff')
    })

    it('writes a versioned pending handoff record before authentication', () => {
      expect(prepareGuestHandoff(items)).toBe(true)

      const handoff = readHandoff()
      expect(handoff.schema).toBe(GUEST_HANDOFF_SCHEMA)
      expect(handoff.version).toBe(GUEST_HANDOFF_VERSION)
      expect(handoff.state).toBe(HANDOFF_STATE.PENDING)
      expect(handoff.firebaseUid).toBeNull()
      expect(handoff.identityType).toBeNull()
      expect(handoff.items).toEqual(items)
      expect(handoff.source).toBe('guest')
      expect(handoff.createdAt).toBeGreaterThan(0)
      expect(handoff.updatedAt).toBeGreaterThan(0)
    })

    it('does not overwrite the active cart key', () => {
      prepareGuestHandoff(items)

      expect(localStorage.getItem('cart')).toBeNull()
      expect(localStorage.getItem(GUEST_HANDOFF_KEY)).not.toBeNull()
    })

    it('binds a pending handoff to the anonymous Firebase UID', () => {
      prepareGuestHandoff(items)

      expect(bindGuestHandoffToUid('anon-1', 'anonymous')).toBe(true)

      const handoff = readHandoff()
      expect(handoff.state).toBe(HANDOFF_STATE.BOUND)
      expect(handoff.firebaseUid).toBe('anon-1')
      expect(handoff.identityType).toBe('anonymous')
      expect(handoff.items).toEqual(items)
    })

    it('never rebinds a handoff to a different UID', () => {
      storeHandoff(boundRecord({ firebaseUid: 'anon-1' }))

      expect(bindGuestHandoffToUid('cust-2', 'customer')).toBe(false)

      const handoff = readHandoff()
      expect(handoff.firebaseUid).toBe('anon-1')
      expect(handoff.identityType).toBe('anonymous')
    })

    it('treats binding to the same UID as idempotent', () => {
      storeHandoff(boundRecord({ firebaseUid: 'anon-1' }))

      expect(bindGuestHandoffToUid('anon-1', 'anonymous')).toBe(true)
      expect(readHandoff()).toEqual(boundRecord({ firebaseUid: 'anon-1' }))
    })

    it('preserves an existing UID binding when updating items', () => {
      storeHandoff(boundRecord({ firebaseUid: 'anon-1' }))
      const nextItems = [{ ...wheel, quantity: 5 }]

      expect(prepareGuestHandoff(nextItems)).toBe(true)

      const handoff = readHandoff()
      expect(handoff.state).toBe(HANDOFF_STATE.BOUND)
      expect(handoff.firebaseUid).toBe('anon-1')
      expect(handoff.identityType).toBe('anonymous')
      expect(handoff.items).toEqual(nextItems)
      expect(handoff.createdAt).toBe(1000)
    })

    it('reports no handoff when nothing is stored', () => {
      const status = getGuestHandoffStatus('anon-1')

      expect(status.status).toBe(HANDOFF_STATUS.NONE)
      expect(status.recoverable).toBe(false)
      expect(status.reason).toBe('no-handoff')
      expect(recoverGuestHandoff('anon-1')).toBeNull()
    })

    it('never recovers an unclaimed pending handoff', () => {
      prepareGuestHandoff(items)

      const status = getGuestHandoffStatus('anon-1')
      expect(status.status).toBe(HANDOFF_STATUS.PENDING)
      expect(status.recoverable).toBe(false)
      expect(status.reason).toBe('unclaimed-handoff')
      expect(status.itemCount).toBe(1)
      expect(recoverGuestHandoff('anon-1')).toBeNull()
    })

    it('recovers a UID-bound handoff for the matching identity', () => {
      storeHandoff(boundRecord({ firebaseUid: 'anon-1' }))

      const status = getGuestHandoffStatus('anon-1')
      expect(status.status).toBe(HANDOFF_STATUS.BOUND)
      expect(status.recoverable).toBe(true)
      expect(status.itemCount).toBe(1)
      expect(recoverGuestHandoff('anon-1')).toEqual(items)
    })

    it('refuses recovery for a mismatched UID', () => {
      storeHandoff(boundRecord({ firebaseUid: 'anon-1' }))

      const status = getGuestHandoffStatus('cust-2')
      expect(status.status).toBe(HANDOFF_STATUS.MISMATCH)
      expect(status.recoverable).toBe(false)
      expect(status.reason).toBe('uid-mismatch')
      expect(recoverGuestHandoff('cust-2')).toBeNull()
    })

    it('refuses recovery without an authenticated identity', () => {
      storeHandoff(boundRecord({ firebaseUid: 'anon-1' }))

      const status = getGuestHandoffStatus(null)
      expect(status.recoverable).toBe(false)
      expect(status.reason).toBe('no-authenticated-identity')
      expect(recoverGuestHandoff(null)).toBeNull()
    })

    it('does not clear the handoff record on recovery', () => {
      storeHandoff(boundRecord({ firebaseUid: 'anon-1' }))

      recoverGuestHandoff('anon-1')

      expect(localStorage.getItem(GUEST_HANDOFF_KEY)).not.toBeNull()
      expect(readHandoff()).toEqual(boundRecord({ firebaseUid: 'anon-1' }))
    })

    it('rejects invalid, unsupported and legacy records', () => {
      localStorage.setItem(GUEST_HANDOFF_KEY, '{not valid json')
      expect(getGuestHandoffStatus('anon-1').status).toBe(HANDOFF_STATUS.INVALID)
      expect(getGuestHandoffStatus('anon-1').reason).toBe('invalid-handoff')
      expect(recoverGuestHandoff('anon-1')).toBeNull()

      storeHandoff(boundRecord({ items: 'not-an-array' }))
      expect(getGuestHandoffStatus('anon-1').status).toBe(HANDOFF_STATUS.INVALID)

      storeHandoff(boundRecord({ version: 999 }))
      expect(getGuestHandoffStatus('anon-1').status).toBe(HANDOFF_STATUS.INVALID)

      storeHandoff({ items, timestamp: Date.now(), source: 'guest' })
      expect(getGuestHandoffStatus('anon-1').status).toBe(HANDOFF_STATUS.INVALID)
      expect(isValidGuestHandoff({ items })).toBe(false)
    })

    it('fails safely without overwriting the active cart', () => {
      localStorage.setItem('cart', JSON.stringify(items))
      localStorage.setItem(GUEST_HANDOFF_KEY, '{not valid json')

      expect(recoverGuestHandoff('anon-1')).toBeNull()
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual(items)
    })

    it('refuses to clear without the verified-migration guard', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      storeHandoff(boundRecord())

      expect(clearGuestHandoff()).toBe(false)
      expect(clearGuestHandoff('anything-else')).toBe(false)
      expect(localStorage.getItem(GUEST_HANDOFF_KEY)).not.toBeNull()
      expect(warn).toHaveBeenCalled()
    })

    it('clears only with the verified-migration guard', () => {
      storeHandoff(boundRecord())

      expect(clearGuestHandoff(HANDOFF_CLEAR_GUARD)).toBe(true)
      expect(localStorage.getItem(GUEST_HANDOFF_KEY)).toBeNull()
    })

    it('handles storage errors gracefully on write', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })

      expect(prepareGuestHandoff(items)).toBe(false)
      spy.mockRestore()
    })

    it('handles storage errors gracefully on read', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('unavailable')
      })

      expect(getGuestHandoffStatus('anon-1').reason).toBe('storage-unavailable')
      expect(recoverGuestHandoff('anon-1')).toBeNull()
      // A failed read must not cause a blind overwrite.
      expect(prepareGuestHandoff(items)).toBe(false)
      spy.mockRestore()
    })
  })
})
