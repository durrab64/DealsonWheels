import { describe, expect, it } from 'vitest'
import { tradeInventory } from './cars.jsx'
import { getVehicleById, getVehicleListings } from './vehicleRepository'

describe('vehicleRepository listings', () => {
  it('returns the existing inventory array unchanged', () => {
    const listings = getVehicleListings()

    expect(listings).toBe(tradeInventory)
    expect(listings).toHaveLength(tradeInventory.length)
    expect(listings[0]).toEqual(tradeInventory[0])
  })
})

describe('vehicleRepository lookup', () => {
  it('returns a listing by its exact string id', () => {
    expect(getVehicleById('1')).toMatchObject({
      id: 1,
      name: 'SUZUKI ALTO VXR',
      price: 'Rs 32,20,000',
    })
  })

  it.each(['999', '1abc', '01', ''])(
    'returns undefined for invalid id %j',
    (id) => {
      expect(getVehicleById(id)).toBeUndefined()
    }
  )
})
