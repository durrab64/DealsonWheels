/**
 * Cart persistence adapter.
 *
 * Owns the `cart` localStorage key through a provider selected in
 * `compose.js`. It deliberately does not own cart business rules (pricing,
 * totals, add/remove/update); those stay in `CartContext`.
 *
 * The persisted active cart shape is unchanged: an array of product objects,
 * each with a positive integer quantity.
 *
 * Guest cart handoff
 * ------------------
 * Before an identity-changing authentication operation (anonymous sign-in,
 * email/password login, account linking) the guest cart is durably snapshotted
 * to a separate `cart:handoff` key.
 *
 * Handoff record schema (versioned):
 *
 *   {
 *     schema: 'dealsonwheels.guest-cart-handoff',
 *     version: 1,
 *     state: 'pending' | 'bound',
 *     firebaseUid: string | null,
 *     identityType: 'anonymous' | 'customer' | null,
 *     items: Array<cart item>,
 *     source: 'guest',
 *     createdAt: number,
 *     updatedAt: number
 *   }
 *
 * Identity rules:
 *   - A record written before Firebase has returned a UID is `pending`
 *     (firebaseUid: null). It is never automatically recoverable.
 *   - Once an anonymous Firebase UID exists the record is `bound` to that UID.
 *   - A bound record can never be rebound to a different Firebase UID. Login
 *     and signup therefore preserve a guest handoff under the identity that
 *     created it; ownership is never reassigned to an existing customer.
 *   - Recovery requires a non-empty current UID that matches the bound UID.
 *
 * Cleanup contract:
 *   `clearGuestHandoff()` refuses to run unless the caller passes the
 *   verified-migration guard token. It must only be used by the future cart
 *   migration checkpoint, after a guest-to-customer migration has completed
 *   and been verified. Authentication success, component mounts and recovery
 *   must never clear the handoff.
 *
 * Provider contract:
 *   CART_STORAGE_KEY: 'cart'
 *   GUEST_HANDOFF_KEY: 'cart:handoff'
 *   loadCartItems(): Array<object>
 *   saveCartItems(items: Array<object>): boolean
 */

import { cartProvider } from './compose.js';

export const CART_STORAGE_KEY = cartProvider.CART_STORAGE_KEY;

/**
 * Dedicated handoff key for guest cart recovery before identity changes.
 * Separate from the active `cart` key so the guest cart is never overwritten
 * by an authenticated cart until migration is verified.
 */
export const GUEST_HANDOFF_KEY = 'cart:handoff';

export const GUEST_HANDOFF_SCHEMA = 'dealsonwheels.guest-cart-handoff';
export const GUEST_HANDOFF_VERSION = 1;

export const HANDOFF_STATE = Object.freeze({
    PENDING: 'pending',
    BOUND: 'bound',
});

export const HANDOFF_IDENTITY = Object.freeze({
    ANONYMOUS: 'anonymous',
    CUSTOMER: 'customer',
});

/**
 * Guard token required by `clearGuestHandoff()`. Only the future verified
 * cart-migration checkpoint may pass this value.
 */
export const HANDOFF_CLEAR_GUARD = 'verified-cart-migration-completed';

export const HANDOFF_STATUS = Object.freeze({
    NONE: 'none',
    INVALID: 'invalid',
    PENDING: 'pending',
    BOUND: 'bound',
    MISMATCH: 'mismatch',
});

const isNonEmptyString = (value) =>
    typeof value === 'string' && value.length > 0;

const isValidItem = (item) =>
    Boolean(item) &&
    typeof item === 'object' &&
    (typeof item.id === 'string' || typeof item.id === 'number') &&
    typeof item.name === 'string';

const isValidItemList = (items) =>
    Array.isArray(items) && items.every(isValidItem);

/**
 * Validate a handoff record. Unsupported versions, unknown states, malformed
 * item lists and inconsistent identity fields are rejected.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isValidGuestHandoff = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    if (value.schema !== GUEST_HANDOFF_SCHEMA) return false;
    if (value.version !== GUEST_HANDOFF_VERSION) return false;
    if (value.source !== 'guest') return false;
    if (!isValidItemList(value.items)) return false;
    if (typeof value.createdAt !== 'number' || !Number.isFinite(value.createdAt)) {
        return false;
    }
    if (typeof value.updatedAt !== 'number' || !Number.isFinite(value.updatedAt)) {
        return false;
    }

    if (value.state === HANDOFF_STATE.PENDING) {
        return value.firebaseUid === null && value.identityType === null;
    }

    if (value.state === HANDOFF_STATE.BOUND) {
        if (!isNonEmptyString(value.firebaseUid)) return false;
        return (
            value.identityType === HANDOFF_IDENTITY.ANONYMOUS ||
            value.identityType === HANDOFF_IDENTITY.CUSTOMER
        );
    }

    return false;
};

/**
 * Read the raw handoff record without mutating it.
 *
 * @returns {{ status: string, record: object | null, storageFailed: boolean }}
 */
const readGuestHandoff = () => {
    let raw;
    try {
        raw = localStorage.getItem(GUEST_HANDOFF_KEY);
    } catch {
        return { status: HANDOFF_STATUS.INVALID, record: null, storageFailed: true };
    }

    if (raw === null || raw === undefined || raw === '') {
        return { status: HANDOFF_STATUS.NONE, record: null, storageFailed: false };
    }

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return { status: HANDOFF_STATUS.INVALID, record: null, storageFailed: false };
    }

    if (!isValidGuestHandoff(parsed)) {
        return { status: HANDOFF_STATUS.INVALID, record: null, storageFailed: false };
    }

    return { status: parsed.state, record: parsed, storageFailed: false };
};

const writeGuestHandoff = (record) => {
    try {
        localStorage.setItem(GUEST_HANDOFF_KEY, JSON.stringify(record));
        return true;
    } catch {
        // Never remove or truncate the existing record on a failed write: it is
        // the only durable copy of the guest cart.
        return false;
    }
};

/**
 * Read and normalize the persisted active cart.
 *
 * @returns {Array<object>}
 */
export const loadCartItems = () => {
    try {
        return cartProvider.loadCartItems();
    } catch {
        return [];
    }
};

/**
 * Persist the active cart.
 *
 * @param {Array<object>} items
 * @returns {boolean} true when the write succeeded, false when it failed.
 */
export const saveCartItems = (items) => {
    try {
        return cartProvider.saveCartItems(items);
    } catch {
        return false;
    }
};

/**
 * Prepare (or update) a durable guest-cart handoff record.
 *
 * If a valid UID-bound record already exists its identity binding is preserved
 * and only `items`/`updatedAt` change. A bound record is never downgraded to
 * pending. Otherwise a pending record is written.
 *
 * This is synchronous and completes before any asynchronous authentication
 * call begins.
 *
 * @param {Array<object>} items
 * @returns {boolean} true when the handoff record was written successfully.
 */
export const prepareGuestHandoff = (items) => {
    if (!Array.isArray(items)) return false;

    const existing = readGuestHandoff();
    if (existing.storageFailed) return false;

    const now = Date.now();

    if (existing.status === HANDOFF_STATE.BOUND && existing.record) {
        return writeGuestHandoff({
            ...existing.record,
            items,
            updatedAt: now,
        });
    }

    const previous =
        existing.status === HANDOFF_STATE.PENDING ? existing.record : null;

    return writeGuestHandoff({
        schema: GUEST_HANDOFF_SCHEMA,
        version: GUEST_HANDOFF_VERSION,
        state: HANDOFF_STATE.PENDING,
        firebaseUid: null,
        identityType: null,
        items,
        source: 'guest',
        createdAt: previous ? previous.createdAt : now,
        updatedAt: now,
    });
};

/**
 * Bind a pending handoff to a Firebase UID.
 *
 * - Pending record -> bound to `uid`.
 * - Already bound to `uid` -> idempotent success.
 * - Already bound to a different UID -> refused; the original binding wins.
 *
 * @param {string} uid
 * @param {'anonymous' | 'customer'} identityType
 * @returns {boolean}
 */
export const bindGuestHandoffToUid = (
    uid,
    identityType = HANDOFF_IDENTITY.ANONYMOUS
) => {
    if (!isNonEmptyString(uid)) return false;
    if (
        identityType !== HANDOFF_IDENTITY.ANONYMOUS &&
        identityType !== HANDOFF_IDENTITY.CUSTOMER
    ) {
        return false;
    }

    const existing = readGuestHandoff();
    if (existing.storageFailed) return false;
    if (!existing.record) return false;

    if (existing.record.state === HANDOFF_STATE.BOUND) {
        return existing.record.firebaseUid === uid;
    }

    return writeGuestHandoff({
        ...existing.record,
        state: HANDOFF_STATE.BOUND,
        firebaseUid: uid,
        identityType,
        updatedAt: Date.now(),
    });
};

/**
 * Inspect whether a handoff is recoverable for the given identity, without
 * reading or mutating the cart.
 *
 * @param {string | null} currentUid
 * @returns {{
 *   status: string,
 *   recoverable: boolean,
 *   reason: string,
 *   itemCount: number,
 *   identityType?: string
 * }}
 */
export const getGuestHandoffStatus = (currentUid) => {
    const existing = readGuestHandoff();

    if (existing.storageFailed) {
        return {
            status: HANDOFF_STATUS.INVALID,
            recoverable: false,
            reason: 'storage-unavailable',
            itemCount: 0,
        };
    }

    if (existing.status === HANDOFF_STATUS.NONE) {
        return {
            status: HANDOFF_STATUS.NONE,
            recoverable: false,
            reason: 'no-handoff',
            itemCount: 0,
        };
    }

    if (existing.status === HANDOFF_STATUS.INVALID || !existing.record) {
        return {
            status: HANDOFF_STATUS.INVALID,
            recoverable: false,
            reason: 'invalid-handoff',
            itemCount: 0,
        };
    }

    const record = existing.record;
    const itemCount = record.items.length;

    if (record.state === HANDOFF_STATE.PENDING) {
        return {
            status: HANDOFF_STATUS.PENDING,
            recoverable: false,
            reason: 'unclaimed-handoff',
            itemCount,
        };
    }

    if (!isNonEmptyString(currentUid)) {
        return {
            status: HANDOFF_STATUS.BOUND,
            recoverable: false,
            reason: 'no-authenticated-identity',
            itemCount,
            identityType: record.identityType,
        };
    }

    if (record.firebaseUid !== currentUid) {
        return {
            status: HANDOFF_STATUS.MISMATCH,
            recoverable: false,
            reason: 'uid-mismatch',
            itemCount,
            identityType: record.identityType,
        };
    }

    if (itemCount === 0) {
        return {
            status: HANDOFF_STATUS.BOUND,
            recoverable: false,
            reason: 'empty-handoff',
            itemCount: 0,
            identityType: record.identityType,
        };
    }

    return {
        status: HANDOFF_STATUS.BOUND,
        recoverable: true,
        reason: 'available',
        itemCount,
        identityType: record.identityType,
    };
};

/**
 * Recover the guest cart for the given identity.
 *
 * Returns the stored items only when a valid record is bound to `currentUid`.
 * Pending (unclaimed), mismatched and invalid records return null. The handoff
 * is never cleared or modified by recovery.
 *
 * @param {string | null} currentUid
 * @returns {Array<object> | null}
 */
export const recoverGuestHandoff = (currentUid) => {
    const existing = readGuestHandoff();
    if (existing.storageFailed || !existing.record) return null;

    const record = existing.record;
    if (record.state !== HANDOFF_STATE.BOUND) return null;
    if (!isNonEmptyString(currentUid)) return null;
    if (record.firebaseUid !== currentUid) return null;
    if (record.items.length === 0) return null;

    return record.items;
};

/**
 * Clear the guest-cart handoff record.
 *
 * Guarded: the caller must pass `HANDOFF_CLEAR_GUARD`, which is reserved for
 * the future verified cart-migration checkpoint. Any other invocation is
 * refused so that authentication success, mounts or recovery can never delete
 * the only durable copy of a guest cart.
 *
 * @param {string} guard
 * @returns {boolean} true only when the record was cleared.
 */
export const clearGuestHandoff = (guard) => {
    if (guard !== HANDOFF_CLEAR_GUARD) {
        console.warn(
            'Refusing to clear guest cart handoff: verified migration guard missing.'
        );
        return false;
    }

    try {
        localStorage.removeItem(GUEST_HANDOFF_KEY);
        return true;
    } catch {
        return false;
    }
};
