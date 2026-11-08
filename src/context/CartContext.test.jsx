import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CartProvider, useCart } from './CartContext'

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

const renderCart = () => renderHook(() => useCart(), { wrapper })

const wheel = {
  id: 'wheel-1',
  name: 'Wheel',
  price: '$1,200.50',
  image: '/wheel.png',
  description: 'A wheel',
}

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
    const secondProduct = { id: 2, name: 'Seat', price: 50 }

    const { result } = renderCart()
    act(() => result.current.addToCart(wheel))
    act(() => result.current.addToCart(secondProduct))

    act(() => result.current.removeFromCart(wheel.id))

    expect(result.current.cartItems).toEqual([{ ...secondProduct, quantity: 1 }])
  })

  it('counts total quantity and sums price times quantity', () => {
    const secondProduct = { id: 2, name: 'Seat', price: 50 }

    const { result } = renderCart()
    act(() => result.current.addToCart(wheel))
    act(() => result.current.addToCart(wheel))
    act(() => result.current.addToCart(secondProduct))

    // cartCount is a sum of quantities, not the number of cart lines.
    expect(result.current.cartCount).toBe(3)
    expect(result.current.cartTotal).toBeCloseTo(2451)
  })

  it('clears the cart and dismisses the add confirmation', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(wheel))
    act(() => result.current.dismissLastAdded())
    expect(result.current.lastAdded).toBeNull()

    act(() => result.current.clearCart())
    expect(result.current.cartItems).toEqual([])
    expect(result.current.cartCount).toBe(0)
  })

  it('toggles and sets the drawer open state', () => {
    const { result } = renderCart()

    act(() => result.current.toggleCart())
    expect(result.current.isCartOpen).toBe(true)

    act(() => result.current.toggleCart())
    expect(result.current.isCartOpen).toBe(false)

    act(() => result.current.setIsCartOpen(true))
    expect(result.current.isCartOpen).toBe(true)
  })

  it('persists the cart and restores it after the provider remounts', async () => {
    const firstRender = renderCart()

    act(() => firstRender.result.current.addToCart(wheel))
    act(() => firstRender.result.current.addToCart(wheel))

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
        { ...wheel, quantity: 2 },
      ])
    })

    firstRender.unmount()

    const { result } = renderCart()
    expect(result.current.cartItems).toEqual([{ ...wheel, quantity: 2 }])
    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartTotal).toBeCloseTo(2401)
  })

  it('throws when useCart is used outside CartProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useCart())).toThrow(
      'useCart must be used within a CartProvider'
    )

    consoleError.mockRestore()
  })
})

describe('CartContext localStorage recovery', () => {
  it('starts empty when the cart key is missing', () => {
    const { result } = renderCart()

    expect(result.current.cartItems).toEqual([])
  })

  it('restores valid saved cart data', () => {
    localStorage.setItem('cart', JSON.stringify([{ ...wheel, quantity: 2 }]))

    const { result } = renderCart()

    expect(result.current.cartItems).toEqual([{ ...wheel, quantity: 2 }])
  })

  it('recovers from malformed JSON without crashing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem('cart', '{not valid json')

    const { result } = renderCart()

    expect(result.current.cartItems).toEqual([])
    expect(consoleError).toHaveBeenCalled()
    expect(JSON.parse(localStorage.getItem('cart'))).toEqual([])

    consoleError.mockRestore()
  })

  it('ignores non-array saved values', () => {
    localStorage.setItem('cart', JSON.stringify({ id: 'not-an-array' }))

    const { result } = renderCart()

    expect(result.current.cartItems).toEqual([])
  })

  it('filters invalid entries and normalizes invalid quantities to 1', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([
        { id: 'ok', name: 'Valid', price: '$10', quantity: 2 },
        { id: 'missing-name', price: '$1', quantity: 1 },
        null,
        'not-an-item',
        { id: 'bad-quantity', name: 'Bad quantity', price: '$5', quantity: '2' },
        { id: 'zero-quantity', name: 'Zero quantity', price: '$5', quantity: 0 },
        { id: 'decimal-quantity', name: 'Decimal quantity', price: '$5', quantity: 2.9 },
        { id: 7, name: 'Numeric id', price: 15, quantity: 1 },
      ])
    )

    const { result } = renderCart()

    expect(result.current.cartItems).toEqual([
      { id: 'ok', name: 'Valid', price: '$10', quantity: 2 },
      { id: 'bad-quantity', name: 'Bad quantity', price: '$5', quantity: 1 },
      { id: 'zero-quantity', name: 'Zero quantity', price: '$5', quantity: 1 },
      { id: 'decimal-quantity', name: 'Decimal quantity', price: '$5', quantity: 2 },
      { id: 7, name: 'Numeric id', price: 15, quantity: 1 },
    ])
  })

  it('normalizes non-finite saved quantities to 1', () => {
    localStorage.setItem(
      'cart',
      '[{"id":"infinity","name":"Infinite","price":"$1","quantity":1e999}]'
    )

    const { result } = renderCart()

    expect(result.current.cartItems).toEqual([
      { id: 'infinity', name: 'Infinite', price: '$1', quantity: 1 },
    ])
  })
})
