import { describe, expect, it } from 'vitest'
import { categories } from './categories.jsx'
import {
  getCategory,
  getCategoryEntries,
  getChildCategory,
  getGeneratedProducts,
  getProductDetail,
} from './catalogRepository'

describe('catalogRepository category access', () => {
  it('exposes the authored categories in their existing order', () => {
    expect(getCategoryEntries()).toEqual(Object.entries(categories))
    expect(getCategoryEntries().map(([type]) => type)).toEqual([
      'exterior',
      'interior',
      'tech',
    ])
  })

  it('returns a known category and undefined for an unknown one', () => {
    expect(getCategory('exterior')).toBe(categories.exterior)
    expect(getCategory('not-a-real-category')).toBeUndefined()
  })

  it('returns a child category scoped to its parent and undefined otherwise', () => {
    expect(getChildCategory('exterior', 'wheels')).toBe(
      categories.exterior.items.find((item) => item.id === 'wheels')
    )
    expect(getChildCategory('exterior', 'not-a-child')).toBeUndefined()
    expect(getChildCategory('not-a-category', 'wheels')).toBeUndefined()
  })
})

describe('catalogRepository generated parts products', () => {
  it('preserves the existing generated product data, ids and presentation', () => {
    const products = getGeneratedProducts('exterior', 'wheels')

    expect(products).toHaveLength(6)
    expect(products[0]).toEqual({
      id: 'wheels-product-0',
      name: 'Forged Alloy Wheels 18"',
      description: 'Lightweight forged aluminum construction with premium finish',
      image: '/images/wheels/chrome_racing_rim_black.png',
      icon: categories.exterior.items.find((item) => item.id === 'wheels').icon,
      originalPrice: 'Rs399.99',
      price: 'Rs299.99',
      discount: 25,
      rating: 4.8,
      reviewCount: 234,
    })
    expect(products.map((product) => product.id)).toEqual([
      'wheels-product-0',
      'wheels-product-1',
      'wheels-product-2',
      'wheels-product-3',
      'wheels-product-4',
      'wheels-product-5',
    ])
  })

  it('is deterministic across calls', () => {
    expect(getGeneratedProducts('interior', 'seats')).toEqual(
      getGeneratedProducts('interior', 'seats')
    )
  })

  it('keeps the fallback naming for categories with fewer descriptions', () => {
    // The authored taillights data has six images but five descriptions.
    // This preserves the current fallback, not a desired catalog contract.
    const products = getGeneratedProducts('exterior', 'taillights')

    expect(products).toHaveLength(6)
    expect(products[5].name).toBe('Taillights Pro Kit 6')
  })

  it('returns no generated products for an unknown child category', () => {
    expect(getGeneratedProducts('exterior', 'not-a-child')).toEqual([])
    expect(getGeneratedProducts('not-a-category', 'wheels')).toEqual([])
  })
})

describe('catalogRepository product detail', () => {
  it('returns the existing placeholder for a known child category', () => {
    const detail = getProductDetail('exterior', 'wheels', 'wheels-product-0')
    const child = getChildCategory('exterior', 'wheels')

    expect(detail).toMatchObject({
      id: 'wheels-product-0',
      name: child.name,
      description: child.description,
      price: '$399.00',
      rating: 4.5,
      reviews: 128,
      image: child.image,
      categoryTitle: 'Exterior',
      childName: 'Wheels & Rims',
      inStock: true,
      stockCount: 12,
    })
    expect(detail.features).toHaveLength(6)
    expect(detail.specifications.Material).toBe('Premium Carbon Fiber')
  })

  it('returns null for an unknown child category', () => {
    expect(getProductDetail('exterior', 'not-a-child', 'anything')).toBeNull()
  })

  it('characterizes that the product id is copied but not validated', () => {
    // Known defect: the detail lookup ignores productId. This is current
    // behavior, not a desired product-lookup contract.
    const detail = getProductDetail(
      'exterior',
      'wheels',
      'this-product-does-not-exist'
    )

    expect(detail.id).toBe('this-product-does-not-exist')
    expect(detail.name).toBe('Wheels & Rims')
  })
})
