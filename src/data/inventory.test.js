import { describe, expect, it } from 'vitest'
import { categories } from './categories.jsx'
import { tradeInventory } from './cars.jsx'

const findCar = (id) => tradeInventory.find((car) => String(car.id) === id)

describe('categories data lookup', () => {
  it('returns a known category by its route key', () => {
    const category = categories.exterior

    expect(category).toBeDefined()
    expect(category.title).toBe('Exterior')
    expect(category.items.length).toBeGreaterThan(0)
  })

  it('returns undefined for an unknown category', () => {
    expect(categories.notARealCategory).toBeUndefined()
  })

  it('exposes the three category keys used by the routes', () => {
    expect(Object.keys(categories)).toEqual(['exterior', 'interior', 'tech'])
  })

  it.each(Object.entries(categories))(
    'all %s category items have a unique, resolvable id',
    (_type, category) => {
      const ids = category.items.map((item) => item.id)

      expect(new Set(ids).size).toBe(ids.length)

      for (const item of category.items) {
        expect(item.id).toEqual(expect.any(String))
        expect(item.name).toEqual(expect.any(String))
        expect(item.description).toEqual(expect.any(String))
        expect(category.items.find((candidate) => candidate.id === item.id)).toBe(item)
      }
    }
  )

  it('every category item resolves through its own category only', () => {
    for (const [type, category] of Object.entries(categories)) {
      for (const item of category.items) {
        expect(categories[type].items.find((candidate) => candidate.id === item.id)).toBe(
          item
        )
      }
    }
  })
})

describe('tradeInventory data lookup', () => {
  it('returns a car by exact string id', () => {
    expect(findCar('1')).toMatchObject({
      id: 1,
      name: 'SUZUKI ALTO VXR',
      price: 'Rs 32,20,000',
    })
  })

  it.each(['999', '1abc', '01', ''])(
    'returns undefined for invalid car id %j',
    (id) => {
      expect(findCar(id)).toBeUndefined()
    }
  )

  it('has unique ids and the fields the marketplace and detail pages use', () => {
    const ids = tradeInventory.map((car) => car.id)

    expect(new Set(ids).size).toBe(ids.length)

    for (const car of tradeInventory) {
      expect(car.id).toEqual(expect.any(Number))
      expect(car.name).toEqual(expect.any(String))
      expect(car.price).toEqual(expect.any(String))
      expect(car.location).toEqual(expect.any(String))
      expect(Array.isArray(car.features)).toBe(true)
      expect(car.specifications).toEqual(expect.any(Object))
      expect(Array.isArray(car.reviewsList)).toBe(true)
    }
  })

  it('has prices that the marketplace can parse as finite numbers', () => {
    for (const car of tradeInventory) {
      const parsed = Number.parseFloat(car.price.replace(/[Rs,]/g, ''))

      expect(Number.isFinite(parsed)).toBe(true)
      expect(parsed).toBeGreaterThan(0)
    }
  })
})
