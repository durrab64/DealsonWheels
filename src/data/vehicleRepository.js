import { tradeInventory } from './cars.jsx';

/**
 * Read-only access to the static used-car inventory.
 *
 * `cars.jsx` remains the source of truth. This module only exposes the lookup
 * shapes the marketplace pages already use; it does not add, filter, sort or
 * modify listings.
 */

/**
 * Return the existing vehicle listing array.
 *
 * The same authored array reference is returned so consumers that depend on
 * its identity (for example `useMemo` dependencies) keep their current
 * behavior.
 *
 * @returns {Array<object>}
 */
export const getVehicleListings = () => tradeInventory;

/**
 * Find a listing by route id.
 *
 * Matches the existing page behavior exactly: string comparison against the
 * stored id, so numeric ids are matched and values such as "01" are not.
 *
 * @param {string} id
 * @returns {object | undefined}
 */
export const getVehicleById = (id) =>
    tradeInventory.find(item => String(item.id) === id);
