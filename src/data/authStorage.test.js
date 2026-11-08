import { afterEach, describe, expect, it, vi } from 'vitest'
import { AUTH_STORAGE_KEY, clearUser, loadUser, saveUser } from './authStorage'

const user = { id: '1', name: 'Demo User', email: 'demo@example.com' }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('authStorage', () => {
  it('uses the existing localStorage key', () => {
    expect(AUTH_STORAGE_KEY).toBe('user')
  })

  it('returns null when nothing is stored', () => {
    expect(loadUser()).toBeNull()
  })

  it('restores a valid stored user with its existing shape', () => {
    localStorage.setItem('user', JSON.stringify(user))

    expect(loadUser()).toEqual(user)
  })

  it('accepts a numeric id and extra fields', () => {
    const numeric = { id: 0, name: 'Numeric User', email: 'n@example.com', avatar: '/a.png' }
    localStorage.setItem('user', JSON.stringify(numeric))

    expect(loadUser()).toEqual(numeric)
  })

  it.each([
    ['malformed JSON', '{not valid json'],
    ['a non-object value', '"just a string"'],
    ['null', 'null'],
    ['an array', '[]'],
    ['an object missing the email', JSON.stringify({ id: '1', name: 'No Email' })],
    [
      'an object with a non-string name',
      JSON.stringify({ id: '1', name: 42, email: 'demo@example.com' }),
    ],
  ])('returns null for %s', (_label, storedValue) => {
    localStorage.setItem('user', storedValue)

    expect(loadUser()).toBeNull()
  })

  it('persists a valid user and removes the stored value for invalid input', () => {
    saveUser(user)

    expect(JSON.parse(localStorage.getItem('user'))).toEqual(user)

    saveUser({ id: '1', name: 'No Email' })

    expect(localStorage.getItem('user')).toBeNull()
  })

  it('clears the stored user', () => {
    localStorage.setItem('user', JSON.stringify(user))

    clearUser()

    expect(localStorage.getItem('user')).toBeNull()
  })

  it('returns null when storage access throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    expect(loadUser()).toBeNull()
  })
})
