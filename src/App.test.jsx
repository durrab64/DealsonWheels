import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from './test/renderApp'

// Mock IntersectionObserver for framer-motion animations
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('representative routes', () => {
  it('renders the home page', async () => {
    renderApp('/')

    await screen.findByRole('heading', {
      level: 1,
      name: /DEALS ON\s+WHEELS/i,
    })
    screen.getByRole('link', { name: /explore upgrades/i })
  })

  it('renders a category page from real category data', async () => {
    renderApp('/category/exterior')

    await screen.findByRole('heading', { level: 1, name: 'Exterior' })
    // "Wheels & Rims" appears as both a category card title and product card title;
    // verify at least one instance exists.
    expect(screen.getAllByText('Wheels & Rims').length).toBeGreaterThan(0)
  })

  it('renders a child category page from real category data', async () => {
    renderApp('/category/exterior/wheels')

    await screen.findByRole('heading', { level: 1, name: 'Wheels & Rims' })
    // The grid is populated by generated placeholder products. This assertion
    // only verifies the route wires the existing grid and add-to-cart action.
    expect(screen.getAllByRole('button', { name: /add to cart/i }).length).toBeGreaterThan(
      0
    )
  })

  it('renders the car marketplace from tradeInventory', async () => {
    renderApp('/buy-sell')

    await screen.findByRole('heading', { level: 1, name: 'Buy & Sell' })
    screen.getByText('SUZUKI ALTO VXR')
    screen.getByText('Rs 32,20,000')
  })

  it('renders a valid car detail page', async () => {
    renderApp('/category/cars/used/1')

    await screen.findByRole('heading', { level: 1, name: 'SUZUKI ALTO VXR' })
    const tradeLink = screen.getByRole('link', { name: /trade/i })
    expect(tradeLink.getAttribute('href')).toBe('/trade/1')
  })

  it('renders the cart page with its empty state', async () => {
    renderApp('/cart')

    await screen.findByRole('heading', { level: 1, name: 'Shopping Cart' })
    screen.getByText('Your cart is empty')
  })

  it('renders the global 404 for an unknown URL', async () => {
    renderApp('/this/route/does/not/exist')

    await screen.findByRole('heading', { level: 1, name: 'Page not found' })
    screen.getByText('Error 404')
  })
})

describe('not-found behavior', () => {
  it('shows the category not-found state for an unknown category', async () => {
    renderApp('/category/not-a-real-category')

    await screen.findByText('Category not found')
  })

  it('shows the car not-found state for an unknown car id', async () => {
    renderApp('/category/cars/used/999')

    await screen.findByRole('heading', { level: 1, name: 'Car not found' })
  })

  it('shows the product not-found state for an unknown child category', async () => {
    renderApp('/category/exterior/not-a-child/not-a-product')

    await screen.findByText('Product not found')
  })

  it('documents that parts product ids are currently ignored', async () => {
    // Known defect: ProductPage does not validate productId and always shows
    // the child category as placeholder product content. This characterizes
    // current behavior; it is not a desired contract.
    renderApp('/category/exterior/wheels/this-product-does-not-exist')

    const headings = screen.getAllByRole('heading', { level: 1, name: 'Wheels & Rims' })
    expect(headings.length).toBeGreaterThan(0)
    screen.getByText('$399.00')
  })
})
