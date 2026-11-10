/**
 * Read-only catalog access for the parts store.
 *
 * The authored data in `categories.jsx` remains the source of truth. This
 * repository delegates to a catalog provider (selected in `compose.js`) so
 * that a future backing implementation can be substituted without rewriting
 * page components. The public API and behavior are unchanged from the
 * previous inline implementation.
 *
 * No new catalog, price, rating, image or identifier is introduced here.
 */

import { catalogProvider } from './compose.js';

/**
 * Return `[type, category]` pairs in authored order.
 * @returns {Array<[string, object]>}
 */
export const getCategoryEntries = () => catalogProvider.getCategoryEntries();

/**
 * Return a top-level category by its route key.
 * @param {string} type
 * @returns {object | undefined}
 */
export const getCategory = (type) => catalogProvider.getCategory(type);

/**
 * Return a child category by top-level key and child id.
 * @param {string} type
 * @param {string} childId
 * @returns {object | undefined}
 */
export const getChildCategory = (type, childId) =>
    catalogProvider.getChildCategory(type, childId);

/**
 * Build the existing generated parts products for a child category.
 *
 * @param {string} type
 * @param {string} childId
 * @returns {Array<object>} Generated product summaries; empty if unknown.
 */
export const getGeneratedProducts = (type, childId) =>
    catalogProvider.getGeneratedProducts(type, childId);

/**
 * Resolve the existing parts product-detail placeholder.
 *
 * @param {string} type
 * @param {string} childId
 * @param {string} productId
 * @returns {object | null} Placeholder product, or null when the child is unknown.
 */
export const getProductDetail = (type, childId, productId) =>
    catalogProvider.getProductDetail(type, childId, productId);
