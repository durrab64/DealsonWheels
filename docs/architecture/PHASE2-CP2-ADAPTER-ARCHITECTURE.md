# Deals on Wheels — Phase 2 CP2: Adapter Contracts & Pluggable Data Architecture

**Repository:** `C:\Users\durra\Downloads\Compressed\DealsonWheels-repo-clone-20261105-232808`  
**Branch:** `phase1/foundation`  
**HEAD:** `46d854eb42f04881e5f7c5bb33d0f15dc9379654` (CP4 commit)  
**Date:** 2026-11-08  
**Change class:** Implementation — introduces provider modules and a composition layer; no Firebase SDK, no Firebase configuration, no environment changes, no source behavior change.

---

## 1. Executive summary

CP2 establishes a pluggable adapter architecture behind the four Phase 1 CP4 data-access boundaries. Each repository module (`catalogRepository`, `vehicleRepository`, `cartStorage`, `authStorage`) now delegates to a provider object selected by a composition layer (`compose.js`). The default providers preserve existing behavior exactly: static authored data for catalog/vehicles and `localStorage` for cart/auth.

The architecture is **entirely Firebase-independent**. No Firebase SDK is installed, no Firebase project is configured, no `.env` files are created, and no async providers are introduced. Future Firebase implementations can be added as new providers in `compose.js` without modifying repository consumers or UI components.

All existing tests pass (112 across 10 files), the production build succeeds, and ESLint results match the CP4 baseline (36 problems: 34 errors, 2 warnings).

---

## 2. Existing versus new architecture

### 2.1 Before CP2 (CP4 state)

```
UI Components (Navbar, CategoryPage, HomePage, ChildCategoryPage,
                 ProductPage, BuySellPage, BuySellProductPage)
        │
        ▼
  src/data/catalogRepository.js      ← inline static data + generated products
  src/data/vehicleRepository.js      ← inline import from cars.jsx
  src/data/cartStorage.js            ← inline localStorage logic
  src/data/authStorage.js            ← inline localStorage logic
```

Each repository module contained both the public API and the backing implementation. There was no seam for swapping the backing implementation without editing the repository module itself.

### 2.2 After CP2

```
UI Components (unchanged imports)
        │
        ▼
  src/data/catalogRepository.js      ← delegates to catalogProvider
  src/data/vehicleRepository.js      ← delegates to vehicleProvider
  src/data/cartStorage.js            ← delegates to cartProvider
  src/data/authStorage.js            ← delegates to authProvider
        │
        ▼
  src/data/compose.js                ← selects and wires providers
        │
        ├── providers/catalog/staticProvider.js      ← static data (categories.jsx + generated)
        ├── providers/vehicle/staticProvider.js      ← static data (cars.jsx)
        ├── providers/cart/localStorageProvider.js   ← localStorage 'cart'
        └── providers/auth/localStorageProvider.js   ← localStorage 'user'
```

The repository modules are now thin delegation layers. The backing implementation lives in provider modules under `src/data/providers/`. The composition layer (`compose.js`) is the single selection point.

---

## 3. Adapter contracts and public APIs

All repository public APIs are preserved exactly. Each provider implements a domain-specific contract.

### 3.1 Catalog provider contract

**Repository:** `src/data/catalogRepository.js`  
**Provider:** `src/data/providers/catalog/staticProvider.js`  
**Exported as:** `catalogProvider`

| Function | Signature | Behavior |
|---|---|---|
| `getCategoryEntries()` | `() => Array<[string, object]>` | Returns `[type, category]` pairs in authored order |
| `getCategory(type)` | `(string) => object \| undefined` | Returns top-level category by route key |
| `getChildCategory(type, childId)` | `(string, string) => object \| undefined` | Returns child category scoped to parent |
| `getGeneratedProducts(type, childId)` | `(string, string) => Array<object>` | Returns generated parts product summaries |
| `getProductDetail(type, childId, productId)` | `(string, string, string) => object \| null` | Returns product-detail placeholder or null |

All catalog functions are synchronous. The provider owns the inline product data (`productImages`, `productDescriptions`, `productData`) previously held in `catalogRepository.js`.

### 3.2 Vehicle provider contract

**Repository:** `src/data/vehicleRepository.js`  
**Provider:** `src/data/providers/vehicle/staticProvider.js`  
**Exported as:** `vehicleProvider`

| Function | Signature | Behavior |
|---|---|---|
| `getVehicleListings()` | `() => Array<object>` | Returns the authored `tradeInventory` array (same reference) |
| `getVehicleById(id)` | `(string) => object \| undefined` | Exact `String(item.id) === id` match |

All vehicle functions are synchronous.

### 3.3 Cart provider contract

**Repository:** `src/data/cartStorage.js`  
**Provider:** `src/data/providers/cart/localStorageProvider.js`  
**Exported as:** `cartProvider`

| Member | Signature | Behavior |
|---|---|---|
| `CART_STORAGE_KEY` | `'cart'` | Existing localStorage key |
| `loadCartItems()` | `() => Array<object>` | Parse, filter, normalize quantity; `[]` on error |
| `saveCartItems(items)` | `(Array<object>) => boolean` | Serialize; `false` on write error |

All cart functions are synchronous. Validation and normalization logic is preserved exactly from the previous inline implementation.

### 3.4 Auth provider contract

**Repository:** `src/data/authStorage.js`  
**Provider:** `src/data/providers/auth/localStorageProvider.js`  
**Exported as:** `authProvider`

| Member | Signature | Behavior |
|---|---|---|
| `AUTH_STORAGE_KEY` | `'user'` | Existing localStorage key |
| `loadUser()` | `() => object \| null` | Parse and validate; `null` on error/invalid |
| `saveUser(user)` | `(object \| null) => void` | Persist valid user; remove key for invalid |
| `clearUser()` | `() => void` | Remove the `user` key |

All auth functions are synchronous.

### 3.5 Repository public APIs (preserved)

| Repository | Exports | Backed by |
|---|---|---|
| `catalogRepository.js` | `getCategoryEntries`, `getCategory`, `getChildCategory`, `getGeneratedProducts`, `getProductDetail` | `catalogProvider` from `compose.js` |
| `vehicleRepository.js` | `getVehicleListings`, `getVehicleById` | `vehicleProvider` from `compose.js` |
| `cartStorage.js` | `CART_STORAGE_KEY`, `loadCartItems`, `saveCartItems` | `cartProvider` from `compose.js` |
| `authStorage.js` | `AUTH_STORAGE_KEY`, `loadUser`, `saveUser`, `clearUser` | `authProvider` from `compose.js` |

Each repository function delegates one-to-one to its provider method. No consumer-visible signature or behavior changes.

---

## 4. Provider selection strategy

**Composition layer:** `src/data/compose.js`

`compose.js` imports all four providers and re-exports them as named exports. Repository modules import their provider from `compose.js`:

```js
import { catalogProvider } from './compose.js';
export const getCategory = (type) => catalogProvider.getCategory(type);
```

**Default selection:**
- Catalog → `providers/catalog/staticProvider.js` (static authored data)
- Vehicles → `providers/vehicle/staticProvider.js` (static authored data)
- Cart → `providers/cart/localStorageProvider.js` (`localStorage['cart']`)
- Auth → `providers/auth/localStorageProvider.js` (`localStorage['user']`)

**Future Firebase integration path:** To add Firebase, create new provider modules under `src/data/providers/` (e.g., `providers/cart/firestoreProvider.js`) implementing the same contracts, then update `compose.js` to select them. No repository consumer or UI component needs to change.

**No global mutable configuration:** Provider selection is static at module load time. There are no setters, no runtime reconfiguration, and no hidden initialization side effects.

---

## 5. Error handling

### 5.1 Current (synchronous) error handling

| Provider | Read error behavior | Write error behavior |
|---|---|---|
| Catalog | N/A (in-memory reads, no I/O) | N/A (read-only) |
| Vehicle | N/A (in-memory reads, no I/O) | N/A (read-only) |
| Cart (`loadCartItems`) | Catches exceptions, logs via `console.error`, returns `[]` | N/A |
| Cart (`saveCartItems`) | N/A | Catches exceptions, logs via `console.error`, returns `false` |
| Auth (`loadUser`) | Catches exceptions, returns `null` | N/A |
| Auth (`saveUser`) | N/A | No try/catch (preserves previous inline behavior) |

### 5.2 Error propagation expectations

- Providers throw or return error indicators; repositories propagate them transparently (delegation is pass-through).
- Consumers (`CartContext`, `AuthContext`) handle return values as before (`[]` on cart read failure, `false` on save failure, `null` on auth read failure).
- Persistence errors are **not** silently swallowed — they are logged via `console.error`.

### 5.3 Preserved behaviors

- Malformed JSON in `localStorage['cart']` → `[]` with log
- Non-array `localStorage['cart']` → `[]`
- Invalid persisted user → `null`, key removed
- Storage access throws → `[]` (cart read) / `null` (auth read) with log
- `saveCartItems` write failure → `false` with log

---

## 6. Sync/async compatibility decisions

### 6.1 Decision: keep all providers synchronous

All CP2 providers are synchronous. This matches the existing `localStorage` and static-module backing. No existing function is converted to `async`.

### 6.2 Rationale

- `localStorage` is inherently synchronous; making cart/auth async would change consumer behavior unnecessarily.
- Static data reads are in-memory and synchronous.
- Converting everything to async prematurely would require updating all consumers (`CartContext`, `AuthContext`, page components) to handle Promises, which is out of scope for CP2.

### 6.3 Future Firebase migration impact

Firebase Firestore and Authentication operations are asynchronous (Promise-based). When Firebase providers are added in a future checkpoint:

- Repository function signatures would need to return Promises (`Promise<Array<object>>`, `Promise<boolean>`, etc.)
- Consumers (`CartContext`, `AuthContext`) would need `async`/`await` or `.then()` handling
- The sync/async boundary would be at the repository-provider delegation layer

This migration is explicitly **deferred** to a future checkpoint. CP2 establishes the provider seam but keeps the sync contract.

### 6.4 Consistency

No module mixes synchronous and asynchronous return types. All four providers are uniformly synchronous. Future Firebase providers would be uniformly asynchronous within their domain, but mixing sync and async providers across domains is avoided by keeping the current contract sync until all domains are migrated together.

---

## 7. Testing strategy

### 7.1 Existing tests (preserved, unchanged)

| Test file | Coverage |
|---|---|
| `src/data/catalogRepository.test.js` | Category entries/order, child-category scoping, generated product data/ids, fallback naming, unknown-child behavior, product-detail placeholder, `productId`-ignored characterization |
| `src/data/vehicleRepository.test.js` | Listing identity/length, exact-id lookup, invalid ids (`999`, `1abc`, `01`, `''`) |
| `src/data/cartStorage.test.js` | Storage key, empty cart, round-trip, invalid-entry filtering, quantity normalization, non-array values, malformed JSON recovery, storage-throw recovery, save-failure reporting |
| `src/data/authStorage.test.js` | Storage key, null when missing, valid restore, numeric id + extra fields, invalid-value rejection, persist/remove, clear, storage-throw recovery |

All existing characterization tests remain clearly identified and pass unchanged.

### 7.2 New tests: `src/data/compose.test.js`

| Test group | Coverage |
|---|---|
| Compose provider selection | All four providers exported, static providers selected by default (no Firebase) |
| Catalog provider contract | All 5 methods present, static provider returns authored categories |
| Vehicle provider contract | Both methods present, static provider returns authored inventory |
| Cart provider contract | Both methods present, existing `cart` key |
| Auth provider contract | All 3 methods present, existing `user` key |
| Repository delegation | Each repository function delegates to its provider (spy verification) |
| Provider substitution | Fake providers with matching contract shape are accepted |

Tests use lightweight fake providers where useful and do not depend on Firebase or external network access.

### 7.3 Test results

- **10 test files, 112 tests passed** (90 existing + 22 new from `compose.test.js`)
- 0 failures

---

## 8. Future Firebase integration path

The adapter architecture makes Firebase integration possible through provider substitution:

1. **Create Firebase provider modules** under `src/data/providers/` (e.g., `providers/cart/firestoreProvider.js`, `providers/auth/firebaseAuthProvider.js`)
2. **Implement the same contracts** — each provider exposes the same method signatures as its localStorage/static counterpart
3. **Update `compose.js`** to select Firebase providers instead of (or alongside) the default providers
4. **No changes to repository consumers or UI components** — `catalogRepository`, `vehicleRepository`, `cartStorage`, `authStorage` public APIs remain unchanged

**Important:** Firebase providers would be asynchronous. A future checkpoint must address the sync/async contract change across all consumers. CP2 does not introduce any Firebase code, placeholder Firebase modules, or misleading Firebase providers.

---

## 9. Files changed

### New files (6)

| File | Purpose |
|---|---|
| `src/data/compose.js` | Composition layer — selects and wires providers |
| `src/data/compose.test.js` | Contract-focused tests for provider selection, delegation, and substitution |
| `src/data/providers/catalog/staticProvider.js` | Catalog provider backed by static authored data |
| `src/data/providers/vehicle/staticProvider.js` | Vehicle provider backed by static authored data |
| `src/data/providers/cart/localStorageProvider.js` | Cart provider backed by `localStorage['cart']` |
| `src/data/providers/auth/localStorageProvider.js` | Auth provider backed by `localStorage['user']` |

### Modified files (4)

| File | Change |
|---|---|
| `src/data/catalogRepository.js` | Reduced from 324 to ~30 lines; delegates all functions to `catalogProvider` from `compose.js` |
| `src/data/vehicleRepository.js` | Reduced from 32 to ~15 lines; delegates to `vehicleProvider` from `compose.js` |
| `src/data/cartStorage.js` | Reduced from 70 to ~20 lines; delegates to `cartProvider` from `compose.js`, re-exports `CART_STORAGE_KEY` |
| `src/data/authStorage.js` | Reduced from 56 to ~20 lines; delegates to `authProvider` from `compose.js`, re-exports `AUTH_STORAGE_KEY` |

### Deleted files

None.

### Existing files preserved unchanged

- `src/data/categories.jsx` — source of truth, not modified
- `src/data/cars.jsx` — source of truth, not modified
- All page components and contexts — imports unchanged, behavior unchanged
- All existing test files — preserved, all pass

---

## 10. Known limitations

1. **Sync-only contract:** All providers are synchronous. Future Firebase providers will be asynchronous, requiring a coordinated contract change across all consumers in a later checkpoint.
2. **Provider selection is static:** `compose.js` selects providers at module load time. There is no runtime provider switching (no global mutable configuration, by design).
3. **No Firebase code:** No Firebase SDK, configuration, or providers exist in this checkpoint. The Firebase integration path is documented but not implemented.
4. **Repository modules depend on `compose.js`:** To use a repository with a non-default provider without modifying `compose.js`, a consumer would need to import the provider directly. This is acceptable for CP2; dependency injection through constructor parameters was considered but deemed unnecessary abstraction.
5. **Build size increase:** 2134 modules (was 2129, +5 for new provider/compose files); JS bundle 543.25 kB (was 542.63 kB). The increase is solely from the 5 new modules.

---

## 11. CP2 results summary

| Check | CP4 baseline | CP2 result | Match |
|---|---|---|---|
| Vitest | 90 passed, 9 files | 112 passed, 10 files (+22 new) | ✓ |
| Production build | 2,129 modules, 542.63 kB JS, 110.05 kB CSS | 2,134 modules, 543.25 kB JS, 110.05 kB CSS | ✓ (module count +5 from new files) |
| ESLint | 36 problems (34 errors, 2 warnings) | 36 problems (34 errors, 2 warnings) | ✓ (no new lint errors) |

**Application behavior compatibility:** Confirmed. All 90 pre-existing tests pass unchanged. All page components and contexts import the same repository APIs with identical signatures. No business rules or data contracts were modified.

---

## 12. Pre-edit snapshot

- **Path:** `C:\Users\durra\Downloads\Compressed\DealsonWheels-phase1-backups\20261108-…-p2cp2-pre\working-tree-….zip`
- **Size:** 121,005,528 bytes
- **SHA-256:** `19C4218470415D710F356FF02CB49A53134720853568F19512CFA7D65B6FE97E`
- **Files:** 185
- **Verified:** Rehash matches original

---

## 13. Git status

- **Branch:** `phase1/foundation`
- **HEAD:** `46d854eb42f04881e5f7c5bb33d0f15dc9379654` (CP4 commit, unchanged)
- **Working tree:** Four tracked files modified (`authStorage.js`, `cartStorage.js`, `catalogRepository.js`, `vehicleRepository.js`) and eight new files untracked (`compose.js`, `compose.test.js`, four provider files under `providers/`, and two architecture docs). Nothing staged or committed.
- **Modified:** `src/data/authStorage.js`, `src/data/cartStorage.js`, `src/data/catalogRepository.js`, `src/data/vehicleRepository.js`
- **New:** `src/data/compose.js`, `src/data/compose.test.js`, `src/data/providers/` (4 provider files), `docs/architecture/PHASE2-FIREBASE-READINESS.md` (CP1 artifact, pre-existing)
- **`main`:** Untouched (`60a7038`)

**No commit or push has been made. Stopping for owner review.**
