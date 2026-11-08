import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CART_STORAGE_KEY,
  loadCartItems,
  saveCartItems,
} from './cartStorage'

const wheel = {
  id: 'wheel-1',
  name: 'Wheel',
  price: '$1,200.50',
  image: '/wheel.png',
  description: 'A wheel',
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('cartStorage', () => {
  it('uses the existing localStorage key', () => {
    expect(CART_STORAGE_KEY).toBe('cart')
  })

  it('returns an empty array when nothing is stored', () => {
    expect(loadCartItems()).toEqual([])
  })

  it('round-trips a valid cart without changing its shape', () => {
    const items = [{ ...wheel, quantity: 2 }]

    expect(saveCartItems(items)).toBe(true)
    expect(JSON.parse(localStorage.getItem('cart'))).toEqual(items)
    expect(loadCartItems()).toEqual(items)
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

  it('returns an empty array when storage access throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

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
})
