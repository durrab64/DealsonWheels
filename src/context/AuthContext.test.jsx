import React from 'react'
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
  onAuthStateChanged: vi.fn((_auth, cb) => {
    // Simulate async Firebase auth initialization
    Promise.resolve().then(() => cb(null));
    return () => {};
  }),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}));

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import { authProvider } from '../data/compose.js'
import { sendPasswordResetEmail } from 'firebase/auth'
import {
  GUEST_HANDOFF_KEY,
  GUEST_HANDOFF_SCHEMA,
  GUEST_HANDOFF_VERSION,
} from '../data/cartStorage'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

const renderAuth = () => renderHook(() => useAuth(), { wrapper})

const cartItems = [
  { id: 'wheel-1', name: 'Wheel', price: '$1,200.50', quantity: 2 },
]

const boundRecord = (uid, items = cartItems) => ({
  schema: GUEST_HANDOFF_SCHEMA,
  version: GUEST_HANDOFF_VERSION,
  state: 'bound',
  firebaseUid: uid,
  identityType: 'anonymous',
  items,
  source: 'guest',
  createdAt: 1000,
  updatedAt: 1000,
})

const readHandoff = () => JSON.parse(localStorage.getItem(GUEST_HANDOFF_KEY))

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('AuthContext persisted-user validation', () => {
  it('starts logged out when no user is stored', async () => {
    const { result } = renderAuth()

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('restores a stored user with the fields the UI uses', () => {
    const user = { id: '1', name: 'Demo User', email: 'demo@example.com' }
    localStorage.setItem('user', JSON.stringify(user))

    const { result } = renderAuth()

    expect(result.current.user).toEqual(user)
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(user)
  })

  it('accepts a numeric id and extra fields', () => {
    const user = {
      id: 0,
      name: 'Numeric User',
      email: 'numeric@example.com',
      avatar: '/avatar.png',
    }
    localStorage.setItem('user', JSON.stringify(user))

    const { result } = renderAuth()

    expect(result.current.user).toEqual(user)
  })

  it.each([
    ['malformed JSON', '{not valid json'],
    ['a non-object value', '"just a string"'],
    ['null', 'null'],
    ['an array', '[]'],
    [
      'an object missing the email',
      JSON.stringify({ id: '1', name: 'No Email' }),
    ],
    [
      'an object with a non-string name',
      JSON.stringify({ id: '1', name: 42, email: 'demo@example.com' }),
    ],
  ])('rejects %s and removes the stored value', async (_label, storedValue) => {
    localStorage.setItem('user', storedValue)

    const { result } = renderAuth()

    expect(result.current.user).toBeNull()

    await act(async () => {
      await Promise.resolve()
    })

    expect(localStorage.getItem('user')).toBeNull()
  })

  it('clears the user on logout', async () => {
    const user = { id: '1', name: 'Demo User', email: 'demo@example.com' }
    localStorage.setItem('user', JSON.stringify(user))

    const { result } = renderAuth()
    expect(result.current.user).toEqual(user)

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    )

    consoleError.mockRestore()
  })

  it('lazy auth: does not sign in anonymously on page load', async () => {
    const spy = vi.spyOn(authProvider, 'signInAnonymously')

    const { result } = renderAuth()

    await act(async () => {
      await Promise.resolve()
    })

    expect(spy).not.toHaveBeenCalled()
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('signup creates a user via Firebase auth', async () => {
    const originalSignup = authProvider.signup
    authProvider.signup = async () => ({
      uid: 'new-user-123',
      name: 'New User',
      email: 'new@example.com',
      isAnonymous: false,
    })

    const { result } = renderAuth()
    expect(result.current.user).toBeNull()

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.signup('new@example.com', 'password123', 'New User')
    })

    expect(result.current.user).toMatchObject({
      id: 'new-user-123',
      name: 'New User',
      email: 'new@example.com',
      isAnonymous: false,
    })
    expect(result.current.isLoading).toBe(false)

    authProvider.signup = originalSignup
  })

  it('login authenticates with email/password', async () => {
    const loginSpy = vi.spyOn(authProvider, 'login')
    loginSpy.mockResolvedValue({
      uid: 'existing-456',
      name: 'Existing User',
      email: 'existing@example.com',
      isAnonymous: false,
    })

    const { result } = renderAuth()
    expect(result.current.user).toBeNull()

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.login('existing@example.com', 'password123')
    })

    expect(result.current.user).toMatchObject({
      id: 'existing-456',
      name: 'Existing User',
      email: 'existing@example.com',
      isAnonymous: false,
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('login upgrades anonymous account preserving uid via linkWithCredential', async () => {
    const loginSpy = vi.spyOn(authProvider, 'login')
    loginSpy.mockImplementation(async () => ({
      uid: 'anon-789',
      name: 'Demo User',
      email: 'demo@example.com',
      isAnonymous: false,
    }))

    const { result } = renderAuth()
    expect(result.current.user).toBeNull()

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.login('demo@example.com', 'password123')
    })

    expect(loginSpy).toHaveBeenCalledWith('demo@example.com', 'password123')
    expect(result.current.user).toMatchObject({
      id: 'anon-789',
      name: 'Demo User',
      email: 'demo@example.com',
      isAnonymous: false,
    })
  })

  describe('guest cart preservation before identity change', () => {
    it('prepares and preserves the guest handoff before existing-customer login', async () => {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue({
        uid: 'anon-1',
        isAnonymous: true,
      })

      const loginSpy = vi.spyOn(authProvider, 'login').mockImplementation(async () => {
        const handoff = readHandoff()
        expect(handoff).not.toBeNull()
        expect(handoff.state).toBe('bound')
        expect(handoff.firebaseUid).toBe('anon-1')
        expect(handoff.items).toEqual(cartItems)
        return {
          uid: 'cust-1',
          name: 'Existing User',
          email: 'existing@example.com',
          isAnonymous: false,
        }
      })

      const { result } = renderAuth()

      await act(async () => {
        await result.current.login('existing@example.com', 'password123')
      })

      expect(loginSpy).toHaveBeenCalledWith('existing@example.com', 'password123')
      // The handoff keeps its original anonymous UID; it is never reassigned.
      expect(readHandoff()).toMatchObject({
        state: 'bound',
        firebaseUid: 'anon-1',
        identityType: 'anonymous',
        items: cartItems,
      })
    })

    it('links an anonymous account on signup and preserves UID ownership', async () => {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue({
        uid: 'anon-1',
        isAnonymous: true,
      })

      const signupSpy = vi.spyOn(authProvider, 'signup')
      const linkSpy = vi
        .spyOn(authProvider, 'linkWithCredential')
        .mockImplementation(async () => {
          const handoff = readHandoff()
          expect(handoff.state).toBe('bound')
          expect(handoff.firebaseUid).toBe('anon-1')
          return {
            uid: 'anon-1',
            displayName: '',
            email: 'new@example.com',
            photoURL: null,
            updateProfile: vi.fn(() => Promise.resolve()),
          }
        })

      const { result } = renderAuth()

      await act(async () => {
        await result.current.signup('New User', 'new@example.com', 'password123')
      })

      expect(linkSpy).toHaveBeenCalledWith('new@example.com', 'password123')
      expect(signupSpy).not.toHaveBeenCalled()
      expect(result.current.user).toMatchObject({
        id: 'anon-1',
        name: 'New User',
        email: 'new@example.com',
        isAnonymous: false,
      })
      expect(readHandoff()).toMatchObject({
        state: 'bound',
        firebaseUid: 'anon-1',
      })
    })

    it('preserves the guest handoff when login fails', async () => {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue({
        uid: 'anon-1',
        isAnonymous: true,
      })
      vi.spyOn(authProvider, 'login').mockRejectedValueOnce(
        new Error('Invalid credentials')
      )

      const { result } = renderAuth()

      await expect(
        result.current.login('existing@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials')

      expect(readHandoff()).toMatchObject({
        state: 'bound',
        firebaseUid: 'anon-1',
        items: cartItems,
      })
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual(cartItems)
    })

    it('does not clear the handoff on logout', async () => {
      localStorage.setItem(
        GUEST_HANDOFF_KEY,
        JSON.stringify(boundRecord('anon-1'))
      )

      const { result } = renderAuth()

      await act(async () => {
        await result.current.logout()
      })

      expect(readHandoff()).toEqual(boundRecord('anon-1'))
    })

    it('does not overwrite a handoff owned by another identity on login', async () => {
      const foreignHandoff = boundRecord('anon-other', [
        { id: 'foreign', name: 'Foreign', price: '$1', quantity: 7 },
      ])
      localStorage.setItem('cart', JSON.stringify(cartItems))
      localStorage.setItem(GUEST_HANDOFF_KEY, JSON.stringify(foreignHandoff))
      vi.spyOn(authProvider, 'getCurrentUser').mockReturnValue(null)
      vi.spyOn(authProvider, 'loadUser').mockReturnValue(null)
      vi.spyOn(authProvider, 'login').mockResolvedValue({
        uid: 'cust-1',
        name: 'Existing User',
        email: 'existing@example.com',
        isAnonymous: false,
      })

      const { result } = renderAuth()

      await act(async () => {
        await result.current.login('existing@example.com', 'password123')
      })

      expect(readHandoff()).toEqual(foreignHandoff)
    })
  })

  describe('password reset', () => {
    const resetEmail = 'user@example.com'

    it('exposes resetPassword function', () => {
      const { result } = renderAuth()
      expect(typeof result.current.resetPassword).toBe('function')
    })

    it('calls sendPasswordResetEmail with the correct email', async () => {
      const sendResetSpy = vi.mocked(sendPasswordResetEmail)
      sendResetSpy.mockResolvedValue(undefined)

      const { result } = renderAuth()

      await act(async () => {
        await result.current.resetPassword(resetEmail)
      })

      expect(sendResetSpy).toHaveBeenCalledWith(expect.anything(), resetEmail)
      expect(result.current.isResettingPassword).toBe(false)

      sendResetSpy.mockReset()
    })

    it('sets success message and clears loading state on success', async () => {
      const { result } = renderAuth()

      expect(result.current.isResettingPassword).toBe(false)
      expect(result.current.resetMessage).toBeNull()

      await act(async () => {
        await result.current.resetPassword(resetEmail)
      })

      expect(result.current.isResettingPassword).toBe(false)
      expect(result.current.resetMessage).toBe(
        'If an account exists for that email, a password-reset link has been sent.'
      )
    })

    it('shows the same non-enumerating message on Firebase error', async () => {
      const sendResetSpy = vi.mocked(sendPasswordResetEmail)
      sendResetSpy.mockRejectedValueOnce(new Error('Firebase error'))

      const { result } = renderAuth()

      await act(async () => {
        await result.current.resetPassword(resetEmail)
      })

      // Same guidance regardless of whether the email exists
      expect(result.current.resetMessage).toBe(
        'If an account exists for that email, a password-reset link has been sent.'
      )
      expect(result.current.isResettingPassword).toBe(false)

      sendResetSpy.mockReset()
    })

    it('restores loading state to false after success and failure', async () => {
      const { result } = renderAuth()

      // Success case
      await act(async () => {
        await result.current.resetPassword(resetEmail)
      })
      expect(result.current.isResettingPassword).toBe(false)

      // Failure case
      const sendResetSpy = vi.mocked(sendPasswordResetEmail)
      sendResetSpy.mockRejectedValueOnce(new Error('Firebase error'))

      await act(async () => {
        await result.current.resetPassword(resetEmail)
      })
      expect(result.current.isResettingPassword).toBe(false)

      sendResetSpy.mockReset()
    })

    it('does not create an anonymous session during password reset', async () => {
      const signInSpy = vi.spyOn(authProvider, 'signInAnonymously')

      const { result } = renderAuth()

      await act(async () => {
        await result.current.resetPassword(resetEmail)
      })

      expect(signInSpy).not.toHaveBeenCalled()
      expect(result.current.user).toBeNull()

      signInSpy.mockRestore()
    })

    it('does not alter the cart or guest handoff during password reset', async () => {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      localStorage.setItem(
        GUEST_HANDOFF_KEY,
        JSON.stringify(boundRecord('anon-1'))
      )

      const { result } = renderAuth()

      await act(async () => {
        await result.current.resetPassword(resetEmail)
      })

      expect(JSON.parse(localStorage.getItem('cart'))).toEqual(cartItems)
      expect(readHandoff()).toEqual(boundRecord('anon-1'))
    })
  })
})
