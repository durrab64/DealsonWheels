import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

const renderAuth = () => renderHook(() => useAuth(), { wrapper })

describe('AuthContext persisted-user validation', () => {
  it('starts logged out when no user is stored', () => {
    const { result } = renderAuth()

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
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
  ])('rejects %s and removes the stored value', (_label, storedValue) => {
    localStorage.setItem('user', storedValue)

    const { result } = renderAuth()

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('clears the user on logout', () => {
    const user = { id: '1', name: 'Demo User', email: 'demo@example.com' }
    localStorage.setItem('user', JSON.stringify(user))

    const { result } = renderAuth()
    expect(result.current.user).toEqual(user)

    act(() => result.current.logout())

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
})
