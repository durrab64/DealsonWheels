/**
 * Read-only access to the static used-car inventory.
 *
 * `cars.jsx` remains the source of truth. This repository delegates to a
 * vehicle provider (selected in `compose.js`) so that a future backing
 * implementation can be substituted without rewriting page components.
 *
 * This module only exposes the lookup shapes the marketplace pages already
 * use; it does not add, filter, sort or modify listings.
 */

import { vehicleProvider } from './compose.js';

/**
 * Return the existing vehicle listing array.
 *
 * The same authored array reference is returned so consumers that depend on
 * its identity (for example `useMemo` dependencies) keep their current
 * behavior.
 *
 * @returns {Array<object>}
 */
export const getVehicleListings = () => vehicleProvider.getVehicleListings();

/**
 * Find a listing by route id.
 *
 * Matches the existing page behavior exactly: string comparison against the
 * stored id, so numeric ids are matched and values such as "01" are not.
 *
 * @param {string} id
 * @returns {object | undefined}
 */
export const getVehicleById = (id) => vehicleProvider.getVehicleById(id);
