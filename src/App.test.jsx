import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from './test/renderApp'

describe('representative routes', () => {
  it('renders the home page', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /DEALS ON\s+WHEELS/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /explore upgrades/i })).toBeInTheDocument()
  })

  it('renders a category page from real category data', async () => {
    renderApp('/category/exterior')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Exterior' })
    ).toBeInTheDocument()
    expect(screen.getByText('Wheels & Rims')).toBeInTheDocument()
  })

  it('renders a child category page from real category data', async () => {
    renderApp('/category/exterior/wheels')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Wheels & Rims' })
    ).toBeInTheDocument()
    // The grid is populated by generated placeholder products. This assertion
    // only verifies the route wires the existing grid and add-to-cart action.
    expect(screen.getAllByRole('button', { name: /add to cart/i }).length).toBeGreaterThan(
      0
    )
  })

  it('renders the car marketplace from tradeInventory', async () => {
    renderApp('/buy-sell')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Buy & Sell' })
    ).toBeInTheDocument()
    expect(screen.getByText('SUZUKI ALTO VXR')).toBeInTheDocument()
    expect(screen.getByText('Rs 32,20,000')).toBeInTheDocument()
  })

  it('renders a valid car detail page', async () => {
    renderApp('/category/cars/used/1')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'SUZUKI ALTO VXR' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /trade/i })).toHaveAttribute(
      'href',
      '/trade/1'
    )
  })

  it('renders the cart page with its empty state', async () => {
    renderApp('/cart')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Shopping Cart' })
    ).toBeInTheDocument()
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('renders the global 404 for an unknown URL', async () => {
    renderApp('/this/route/does/not/exist')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' })
    ).toBeInTheDocument()
    expect(screen.getByText('Error 404')).toBeInTheDocument()
  })
})

describe('not-found behavior', () => {
  it('shows the category not-found state for an unknown category', async () => {
    renderApp('/category/not-a-real-category')

    expect(await screen.findByText('Category not found')).toBeInTheDocument()
  })

  it('shows the car not-found state for an unknown car id', async () => {
    renderApp('/category/cars/used/999')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Car not found' })
    ).toBeInTheDocument()
  })

  it('shows the product not-found state for an unknown child category', async () => {
    renderApp('/category/exterior/not-a-child/not-a-product')

    expect(await screen.findByText('Product not found')).toBeInTheDocument()
  })

  it('documents that parts product ids are currently ignored', async () => {
    // Known defect: ProductPage does not validate productId and always shows
    // the child category as placeholder product content. This characterizes
    // current behavior; it is not a desired contract.
    renderApp('/category/exterior/wheels/this-product-does-not-exist')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Wheels & Rims' })
    ).toBeInTheDocument()
    expect(screen.getByText('$399.00')).toBeInTheDocument()
  })
})
