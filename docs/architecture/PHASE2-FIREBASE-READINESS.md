# Deals on Wheels — Phase 2 CP1: Firebase Architecture & Readiness Audit

**Repository:** `C:\Users\durra\Downloads\Compressed\DealsonWheels-repo-clone-20261105-232808`  
**Branch:** `phase1/foundation`  
**HEAD:** `46d854eb42f04881e5f7c5bb33d0f15dc9379654`  
**Date:** 2026-11-08  
**Change class:** Documentation only. No production behavior, dependency, route, asset, or persisted-data change was made for this checkpoint.  
**Source inspected:** `DOMAIN-MODELS-AND-CONTRACTS.md` (CP3), Phase 1 CP4 architecture report, current source tree.

---

## 1. Executive summary

This checkpoint is a **read-only architecture and readiness audit** for preparing Deals on Wheels for Firebase integration. It produces an implementation plan only; it does not install the Firebase SDK, create a Firebase project, modify environment files, change application source, migrate data, deploy, or commit anything.

**Key finding:** The repository currently contains **no Firebase SDK, no Firebase configuration, no `.env` files, and no secret material**. The application is a pure client-side React 19 + Vite 7 SPA with static authored data (`categories.jsx`, `cars.jsx`), browser `localStorage` persistence (`cart`, `user`), and mock authentication (every login/signup yields id `'1'`). Hosting today is Vercel via `vercel.json` (single-page rewrite rule).

Phase 1 CP4 introduced four data-access boundaries under `src/data/`:
- `catalogRepository.js` — categories, child categories, generated parts products, product detail placeholder
- `vehicleRepository.js` — used-car inventory listing and by-id lookup
- `cartStorage.js` — `localStorage['cart']` persistence adapter
- `authStorage.js` — `localStorage['user']` persistence adapter

These boundaries are the correct seam for Firebase integration: each boundary can be swapped from `localStorage`/static-module backing to a Firebase backing without touching UI components, provided the domain contracts (currency, identity, cart scoping, product identity, etc.) are resolved first.

**Fifteen decisions (D1–D16) from CP3 remain unresolved and block Firebase implementation.** D8 (Authentication model and user identity) is owner-approved as described in Section 13.1; all other decisions require explicit product-owner approval before any Firebase code is written.

---

## 2. Current architecture findings

### 2.1 Technology stack (observed, read-only)

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.2.0 |
| Build tool | Vite | 7.2.4 |
| Routing | react-router-dom | 7.9.6 |
| Styling | Tailwind CSS + PostCSS | 4.1.17 |
| Animation | framer-motion | 12.23.24 |
| Icons | lucide-react | 0.554.0 |
| Testing | Vitest + @testing-library/react | 4.1.12 / 16.3.3 |
| Lint | ESLint | 9.39.1 |
| Hosting config | `vercel.json` (SPA rewrite) | — |
| Persistence | `localStorage` keys `cart`, `user` | — |

No database, API client, service layer, or repository layer existed before CP4. CP4 added the four `src/data/` adapters but they still back onto static modules and `localStorage`.

### 2.2 Application routes (from `src/App.jsx`)

| Route | Component | Data backing |
|---|---|---|
| `/` | `HomePage` | categories (`getCategory`) |
| `/cart` | `CartPage` | `localStorage['cart']` via `cartStorage` |
| `/buy-sell` | `BuySellPage` | `tradeInventory` via `vehicleRepository` |
| `/sell-car` | `SellCarPage` | static placeholder (absent domain) |
| `/category/cars/used/:id` | `BuySellProductPage` | `getVehicleById(id)` |
| `/trade/:id` | `TradePage` | id ignored; hardcoded target card |
| `/category/:type` | `CategoryPage` | `getCategory(type)` |
| `/category/:type/:childId` | `ChildCategoryPage` | `getChildCategory`, `getGeneratedProducts` |
| `/category/:type/:childId/:productId` | `ProductPage` | `getProductDetail` (placeholder; `productId` ignored) |
| `*` | `NotFoundPage` | — |

### 2.3 Domains and current sources of truth

| Domain | Current source | Classification | Persistence |
|---|---|---|---|
| Categories / child categories | `src/data/categories.jsx` | Authored static | Module import only |
| Parts products (cards) | `src/data/catalogRepository.js` | Generated at render | None (no stored records) |
| Product detail | `src/data/catalogRepository.js` | Generated placeholder | None |
| Used-car listings | `src/data/cars.jsx` | Authored static demo | Module import only |
| Car reviews | embedded in `tradeInventory[]` | Authored inline | None |
| Cart | `localStorage['cart']` via `cartStorage` | Real runtime state | Browser localStorage |
| User / mock auth | `localStorage['user']` via `authStorage` | Mock | Browser localStorage |
| Trade-in request | `src/pages/TradePage.jsx` form state | Real form state, discarded on submit | None |
| Orders / checkout / payments | **Absent** | — | None |
| Seller listings | **Absent** (`/sell-car` placeholder) | — | None |
| Favorites / workshops / bookings | **Absent** | — | None |

### 2.4 Unresolved decisions (D1–D16) from CP3

These decisions are carried forward unchanged unless marked owner-approved. D8 is owner-approved as described in Section 13.1.

| ID | Decision | Blocking for Firebase? | Status |
|---|---|---|---|
| D1 | Store currency and supported currencies (`Rs`, `$`, `Rs$` mixed today) | **Yes** — Firestore `Money` shape and security rules depend on it | Open |
| D2 | Tax, shipping, total policy | **Yes** — order/checkout totals and server-side price verification | Open |
| D3 | Cart count semantics (unit vs line count) | No — UI semantics only | Open |
| D4 | Money representation and rounding | **Yes** — Firestore field type and server verification logic | Open |
| D5 | Parts product identity and catalog source | **Yes** — collection/document id design | Open |
| D6 | Product detail not-found behavior | **Yes** — read security rules and client 404 handling | Open |
| D7 | Review model, aggregates, moderation | **Yes** — subcollection design and moderation security rules | Open |
| D8 | Authentication model and user identity | **Yes** — Firebase Auth mapping and custom claims | **Owner-approved (Section 13.1)** |
| D9 | Car listing semantics (condition, seller, status) | **Yes** — listing document schema and write rules | Open |
| D10 | Trade-in persistence, validation, PII policy | **Yes** — collection schema and PII protection rules | Open |
| D11 | Cart scoping and guest merge | **Yes** — user-scoped vs device-scoped cart documents | Open |
| D12 | Order/checkout contract | **Yes** — orders collection and server-side verification | Open |
| D13 | Timestamp storage and display | **Yes** — Firestore timestamp fields | Open |
| D14 | Quantity limits and stock enforcement | **Partial** — cart write validation rules | Open |
| D15 | Search scope | **Partial** — Firestore query vs client-side filtering | Open |
| D16 | Whether `icon` belongs in data | No — presentation-only mapping can proceed | Open |

### 2.5 Known inconsistencies with Firebase relevance

- **I-01, I-02, I-03:** Three currency signals (`Rs`, `$`, `Rs$`), Western vs Indian decimal grouping. A single Firestore `Money` type cannot be inferred. **D1/D4 required.**
- **I-15:** Cart is device-local, not user-scoped. **D11 required** before mapping cart to a user-owned Firestore document.
- **I-18, I-19:** Parts products are generated; detail ignores `productId`. **D5/D6 required** before a products collection exists.
- **I-48:** Every mock user is id `'1'`. **D8 owner-approved** — maps users to Firebase Auth UIDs per Section 13.1.
- **I-55:** `localStorage` accessed directly in contexts. CP4 moved this behind adapters, which is the correct pre-Firebase seam.

---

## 3. Firebase service mapping

The following mapping is a **proposal only**. No Firebase project exists and no SDK is installed.

| Firebase service | Proposed responsibility | CP4 boundary it replaces / augments |
|---|---|---|
| **Firebase Authentication** | User identity, sign-in, sign-out, session state. Replaces mock `AuthContext` login/signup/logout. | `authStorage.js` + mock auth in `AuthContext.jsx` |
| **Firestore** | Categories, child categories, products, car listings, reviews, carts, orders, trade-in requests. Replaces static modules + `localStorage`. | `catalogRepository.js`, `vehicleRepository.js`, `cartStorage.js` |
| **Firebase Storage** | Customer-uploaded images (trade-in photos, seller listing photos, profile avatars). Replaces public URL strings where upload is needed. | Not currently used (all images are public URLs) |
| **Cloud Functions** | Server-side price verification at checkout, order creation, booking concurrency, moderation, email/trade-in notifications. | Not present (no server exists) |
| **Firestore Security Rules** | Default-deny read/write, user-owned document access, public catalog reads, admin custom claims, upload restrictions. | Not present |
| **App Check** | Runtime attestation that requests originate from the genuine app. | Not present |

### Services explicitly NOT proposed for Phase 2 CP1

- No Firebase Hosting migration (Vercel is preserved temporarily).
- No Firebase Analytics, Crashlytics, Performance Monitoring, Remote Config.
- No Firebase Extensions.

---

## 4. Proposed Firestore collections and relationships

**Proposal only — subject to D1, D5, D7, D8, D9, D10, D11, D12, D13, D14.**

### 4.1 Collections

| Collection | Document id (proposal) | Owner | Public read? | Notes |
|---|---|---|---|---|
| `categories` | stable category id | system/admin | Yes | Top-level categories |
| `categories/{catId}/children` | stable child id | system/admin | Yes | Child categories |
| `products` | stable product id (D5) | system/admin | Yes | Parts product summaries |
| `products/{pid}/detail` | `detail` (fixed document) or subcollection option under `products/{pid}` (D5) | system/admin | Yes | Product detail specs/features/stock — subcollection vs fixed document subject to D5 |
| `carListings` | stable listing id (D9) | seller (proposed) | Yes | Used-car listings |
| `carListings/{cid}/reviews` | auto-id | review author | Yes (published only) | Car review subcollection |
| `products/{pid}/reviews` | auto-id | review author | Yes (published only) | Product review subcollection |
| `users/{uid}` | Firebase Auth UID | system/auth | No | User profile (name, email, avatarUrl, role) |
| `carts/{cartId}` | cart id (Firebase Anonymous Auth UID for guests, signed-in user UID for customers — D11) | cart owner | No | Guest or user-scoped cart; account-linking and guest-to-user cart-merge requirements unresolved (D11) |
| `orders/{orderId}` | auto-id | order owner | No | Order (D12 only) |
| `tradeInRequests/{id}` | auto-id | requester | No | Trade-in request (D10 only, PII) |

**Product detail schema:** The choice between a fixed `detail` document and a reviews-style subcollection under `products/{pid}` is left open; the final product schema (including whether detail fields live on the product document or a nested document) is subject to D5 approval.

### 4.2 Relationships (proposal)

```
categories
  └── children (subcollection)
        id: childId
        fields: name, description, imageUrl, categoryId

products
  id: productId (stable, D5)
  fields: categoryId, childCategoryId, name, description, imageUrl,
          price (Money), originalPrice?, discountPercent?, rating?,
          reviewCount?, inStock, stockCount?

products/{pid}/reviews
  id: reviewId
  fields: subjectType='product', subjectId, authorId?, authorName,
          rating, title, body, createdAt, verified, moderationStatus

carListings
  id: listingId
  fields: name, price (Money), year, condition, mileageKm, location,
          postedAt, imageUrl, badge?, description, features[],
  sellerId? (D9), status? (D9)

carListings/{cid}/reviews
  id: reviewId
  fields: subjectType='car-listing', subjectId, authorId?, authorName,
          rating, title, body, createdAt, verified, moderationStatus

users/{uid}
  fields: name, email, avatarUrl?, createdAt?, role? (admin custom claim)

carts/{cartId}
  id: cartId (uid or device id — D11)
  fields: items[{productId, quantity, unitPrice (Money), name, imageUrl?}],
          updatedAt?

orders/{orderId}  (D12 only)
  fields: userId, items[{productId, name, unitPrice, quantity, lineTotal}],
          subtotal, shipping, tax, total, status, createdAt

tradeInRequests/{id}  (D10 only, PII)
  fields: make, model, year, mileageKm, condition, contact{fullName,phone,email},
          customerProvidedValue (Money), platformValuation?, targetListingId?,
          createdAt
```

### 4.3 Data type: Money (proposal)

```json
{
  "currency": "PKR" | "USD",   // D1
  "amountMinor": 29999         // integer minor units; D4 exponent rule
}
```

**Rationale:** Firestore stores numbers as doubles; integer minor units avoid float drift for currency (D4). Currency code stored explicitly because the current app mixes `Rs`, `$`, `Rs$` (I-01).

### 4.4 Timestamp type

Firestore server timestamps (`firebase.firestore.FieldValue.serverTimestamp()`) proposed for `createdAt`, `updatedAt`, `postedAt` (D13). Relative display strings (`2 days ago`) are **not** convertible to exact timestamps and must not be fabricated.

---

## 5. Authentication and authorization model

### 5.1 Firebase Authentication (proposal)

- **Lazy anonymous auth** for guests: no Firebase Auth session is created on page load or ordinary browsing. When a visitor first adds an item to their cart, `signInAnonymously()` is invoked to create a guest session. **Owner-approved: `local` persistence** — Firebase Authentication uses browser-local persistence, so once a session is created (anonymous on first cart addition, or email/password on sign-in), it survives page reloads and browser restarts. On logout, the customer's cart document in Firestore is preserved; the anonymous guest cart document (`carts/{anonymous_uid}`) is also preserved — never deleted merely because the user signs out or closes the browser. A different user signing in must never see the previous customer's cart. (D8 owner-approved; see Section 13.1.)
- **Email/password auth** for registered customers (D8 decision needed).
- **No social providers** proposed at this stage.
- **No password material stored in Firestore** (current mock ignores passwords; Firebase Auth manages credentials server-side).
- **Session state** mapped from `onAuthStateChanged` into the existing `useAuth` shape (`user`, `isLoading`, `login`, `signup`, `logout`).

### 5.2 Admin custom claims (owner-approved)

- **Owner-approved:** A `role` custom claim (`'customer'` | `'admin'`) is set server-side via Firebase Admin SDK using a one-time, manually executed bootstrap process. The owner creates the first administrator account through normal registration/authentication, obtains the account's Firebase UID, and a server-side bootstrap script assigns the `admin` custom claim to that exact UID.
- Client code **never** trusts a client-supplied role; security rules read `request.auth.token.role`.
- Admin operations: manage categories, products, car listings, moderate reviews, manage orders.

### 5.3 Guest versus authenticated access

| Operation | Guest (anonymous) | Authenticated customer | Admin |
|---|---|---|---|
| Read categories/products/car listings | Yes | Yes | Yes |
| Search catalog | Yes (D15 scope) | Yes | Yes |
| Read own user profile | No | Yes (own doc only) | Yes (any) |
| Write own cart | Yes (after first cart addition triggers anonymous auth — D11) | Yes (user-scoped cart — D11) | No |
| Checkout / create order | Decision D12 | Decision D12 | No |
| Cart logout behavior | Customer's cart document preserved; UI cleared immediately. Same customer's cart restored on re-sign-in. Different user never sees previous customer's cart. | Same as guest | N/A |
| Create trade-in request | Decision D10 | Decision D10 | No |
| Write catalog/listings/reviews | No | Reviews only (own) | Yes |

### 5.4 Operations that must never trust client-supplied values

- **Prices:** unit price, line total, subtotal, tax, shipping, total — must be verified server-side against the catalog at order time (D2, D4).
- **Ownership:** `userId`, `sellerId`, `authorId` — must equal `request.auth.uid` or be set server-side. Cart ownership is tied to Firebase Auth UID; client-provided UIDs are never trusted to establish cart ownership. One anonymous user's cart is never exposed to another person using the same browser. Local browser data is treated as temporary/recoverable handoff data, not authoritative cart ownership.
- **Roles:** `role`, `isAdmin` — must come from custom claims, not document fields.
- **Booking/listing availability:** status, stockCount — must be verified in a transaction, not trusted from client input.
- **Trade-in valuation:** `customerProvidedValue` is customer input, not authoritative (D10); `platformValuation` must be server-generated.

### 5.5 User-profile field ownership (proposal)

| Field category | Fields | Editable by client? | Managed by |
|---|---|---|---|
| User-editable profile | `name`, `avatar` | Yes (own document only) | Client (own document) |
| Contact / identity | `email` | No | Firebase Auth |
| Server-controlled (privileged) | `uid` (document id), `role` custom claim, email-verification flags, `createdAt`, sign-in metadata, `isAnonymous` | **No — prohibited** | Firebase Auth / server |

**Adapter mapping (transition):** Firebase `User.photoURL` is mapped to the application `avatar` field in the `useAuth` shape. The `authStorage` adapter performs `avatar` ↔ `avatarUrl` translation when reading/writing `localStorage['user']` during the transition period, ensuring `Navbar` and other consumers that render `user.avatar` continue to work without modification.

Client writes to `users/{uid}` must be limited to user-editable profile fields. Privileged fields — including `uid`, `email`, `role`, verification flags, `createdAt`, `isAnonymous`, and the document id — must never be modifiable by the client and are enforced by security rules.

---

## 6. Security rules strategy

**Proposal only — not implemented.**

### 6.1 Default-deny

All Firestore collections default to `allow read, write: if false;` at the top level, with explicit allow rules per collection.

### 6.2 Public read rules

```text
// Proposal only
match /categories/{catId} { allow read: if true; }
match /categories/{catId}/children/{childId} { allow read: if true; }
match /products/{pid} { allow read: if true; }
match /carListings/{cid} { allow read: if true; }
```

Published reviews only; `moderationStatus` gating needed (D7).

### 6.3 User-owned document access

```text
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
match /carts/{cartId} {
  // Candidate design (D11 unresolved): guest carts are keyed by the
  // Firebase Anonymous Authentication UID; signed-in customers use their
  // own Auth UID as cartId. When an anonymous user signs in, account
  // linking and a guest-to-user cart merge are required. D11 is not
  // finalized here.
  allow read, write: if request.auth != null && request.auth.uid == cartId;
}
```

### 6.4 Admin write rules

```text
match /categories/{catId} { allow write: if isAdmin(); }
match /products/{pid} { allow write: if isAdmin(); }
match /carListings/{cid} {
  // D9 unresolved: seller ownership and status semantics are not finalized.
  // Candidate design: create-time assigns sellerId = request.auth.uid
  // (validated against the client-supplied value); ownership is immutable
  // on update (sellerId cannot change); status transitions are restricted;
  // administrative actions require independent authorization via custom
  // claims.
  allow create: if request.auth != null && request.auth.uid == request.resource.data.sellerId;
  allow update: if request.auth != null &&
    request.auth.uid == resource.data.sellerId &&
    request.resource.data.sellerId == resource.data.sellerId;
  allow delete: if isAdmin();
}
```

### 6.5 Storage access

- Public read for catalog images already served as public URLs; no Storage needed for existing assets.
- Customer uploads (trade-in photos, seller photos, avatar): authenticated-only, per-user folder `users/{uid}/uploads/`, file type/size limits, virus-scan consideration server-side.

### 6.6 App Check

Proposed to enforce that Firestore/Storage requests originate from the built Vite app. Required before enabling any write path in production.

---

## 7. Storage strategy

**Proposal only.**

| Asset type | Current | Proposed Firebase Storage path | Access |
|---|---|---|---|
| Category hero images | `/images/...` public URL | Keep public URLs (no upload) | Public read |
| Child category images | `/images/...` public URL | Keep public URLs | Public read |
| Product images | `/images/...` public URL | Keep public URLs | Public read |
| Car listing images | `/cars/...` public URL | Keep public URLs | Public read |
| Trade-in photos | none (form discards data) | `tradeInRequests/{id}/photos/{photoId}` | Owner + admin |
| Seller listing photos | none (`/sell-car` placeholder) | `sellerListings/{id}/photos/{photoId}` | Owner + admin |
| User avatars | fixed Unsplash URL | `users/{uid}/avatar` | Owner + admin, public read |

**No existing asset is migrated to Firebase Storage.** New uploads only, after D10 (trade-in) and a seller-flow decision.

---

## 8. Cloud Functions and transaction requirements

**Proposal only — not implemented.**

| Operation | Why server-side | Mechanism |
|---|---|---|
| Order creation + price verification | Client must not set totals; price must be rechecked against catalog | Callable function + Firestore transaction |
| Guest-to-user cart merge (D11) | Merge must be atomic and ownership-verified | Callable function + transaction |
| Booking slot concurrency | Prevent double-booking | Firestore transaction |
| Car listing status transition | Prevent unauthorized sold/removed changes | Security rules + optional function |
| Review moderation | Admin-only publish/reject | Callable function |
| Trade-in request persistence (D10) | PII handling, server-generated valuation | Callable function |
| Email notifications | Not client-safe | Callable function |
| Custom claims assignment | Server-only | Admin SDK function |

---

## 9. Migration plan

**Incremental, no big-bang. Preserves React 19 + Vite 7 and Vercel hosting temporarily.**

### Phase A (readiness, this checkpoint)
- Complete this audit document.
- Catalogue blocking decisions; Phase B proceeds without requiring all D1–D16 to be resolved.

### Phase B (adapter layer, no Firebase yet)
- Extend `src/data/` adapters to support a pluggable backing (static module / localStorage / Firebase) behind the same interface.
- Add unit tests for adapter contracts.
- No Firebase SDK installed yet.

### Phase C (Firebase Auth only)
- Install Firebase SDK.
- Add Firebase config from environment variables (not committed).
- Replace mock auth with `onAuthStateChanged` + lazy anonymous auth (triggered on first cart addition) + email/password auth.
- Implement `linkWithCredential` for anonymous-to-email/password account upgrading.
- Keep `localStorage['user']` as a fallback until migration is complete.
- Do not delete mock auth until user data migration is verified.

### Phase D (Firestore reads)
- Replace static catalog/vehicle imports with Firestore reads behind `catalogRepository` / `vehicleRepository`.
- Keep static data as fallback/seeding source.
- Public read rules only.

### Phase E (Firestore writes + cart)
- Map `cartStorage` to Firestore cart documents (guest or user-scoped — D11).
- Preserve `localStorage['cart']` format during transition; do not silently drop items.
- Migration sequence for existing carts: read array → validate/normalize → convert price strings to Money → write under same key with version marker → keep recovery path.

### Phase F (orders, trade-in, admin)
- Orders collection (D12 only), trade-in requests (D10 only), security rules, App Check, Cloud Functions.
- Checkout buttons remain "coming soon" until D12 is approved.

### Data that must not be migrated silently (from CP3 §8.5)
- Currency choice (PKR vs USD).
- Numeric conversion of `Rs 32,20,000` / `Rs299.99`.
- Relative review/listing dates as timestamps.
- `condition: "New"` on a used-car route.
- Repricing existing cart lines.
- Real user identities replacing mock `'1'`.
- Orders created from existing carts.

### localStorage transition
- `cart` and `user` keys are preserved during the adapter phase.
- Firebase documents are written only after the adapter contract is stable and tested.
- A version marker in `localStorage` (e.g., `cart:v2`) allows rollback.

---

## 10. Environment and deployment strategy

### 10.1 Environment variables (proposal)

| Variable | Purpose | Committed? |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key — public client configuration, not a server secret; requires domain/referrer restrictions | **No** (`.env.local`, `.gitignore`) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | **No** |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project id | **No** |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | **No** |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender | **No** |
| `VITE_FIREBASE_APP_ID` | Firebase app id | **No** |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics (optional) | **No** |

- No `.env` files exist today. None are created by this audit.
- Firebase config must be loaded at build/runtime from environment; never hardcoded in source.
- Vercel environment variables used for production; local `.env.local` for development (not committed).
- **API key classification:** Firebase web API keys are public client configuration (they are sent to the browser by the Firebase SDK), not server secrets. They should be restricted by domain/referrer and used with App Check where available. Service-account private keys and Admin SDK credentials must **never** be placed in client-exposed `VITE_` variables or committed to the repository; they belong only in server-side environments such as Cloud Functions.
- **Password reset email templates:** Password reset is owner-approved for the initial release. Firebase Console email action templates for password reset emails must be configured, including the reset link action URL and email branding.

### 10.2 Deployment

- **Vercel hosting preserved** for Phase 2; no Firebase Hosting migration.
- `vercel.json` SPA rewrite rule remains valid.
- Separate dev/staging/production Firebase projects recommended; configuration separated by environment variable set, not by code branches.
- No production data migrated.

---

## 11. Risks and unresolved decisions

| Risk | Impact | Mitigation |
|---|---|---|
| D1/D4 unresolved: no Money contract | Cannot design Firestore price fields or server verification | Product owner approval required before Firebase-bearing phases (CP3+) |
| D5/D6 unresolved: product identity | Cannot create products collection or detail read rules | Keep generated demo until decided |
| D11 unresolved: cart scoping | Cannot design cart documents or merge logic | Keep device-local cart until decided. Guest cart document preserved on logout; customer's cart document preserved on logout. |
| D12 unresolved: orders | Cannot design orders collection or checkout | Checkout stays disabled |
| Currency mismatch (`Rs`/`$`/`Rs$`) | Cart totals ambiguous | D1/D2 required |
| Mock user id `'1'` collision | Cannot migrate to unique UIDs | D8 owner-approved — unique Firebase Auth UIDs replace mock `'1'`; `local` persistence owner-approved so sessions survive browser restart |
| No server-side verification exists | Client could set arbitrary prices | Cloud Functions + security rules |
| Vercel → Firebase Hosting not planned | Hosting preserved temporarily | Explicit decision if hosting changes |

**Decisions explicitly NOT made here:** D1–D7, D9–D16 remain open and require explicit owner approval. D8 is owner-approved as described in Section 13.1, including lazy anonymous auth and `local` Firebase Auth persistence. Guest cart survival on logout is owner-approved: preserved. No choice is made on the owner's behalf beyond the approved D8 decisions.

---

## 12. Recommended Phase 2 checkpoint sequence

| Checkpoint | Focus | Gate |
|---|---|---|
| CP1 (this) | Architecture & readiness audit | ✓ This document |
| CP2 | Pluggable adapter layer + tests (no Firebase) | None — Firebase-independent; adapter contracts only |
| CP3 | Firebase Auth integration (mock → Firebase) | D8, project config |
| CP4 | Firestore reads for catalog/vehicles | D5, D6, security rules |
| CP5 | Firestore writes: cart + guest/user scoping | D11, cart migration |
| CP6 | Orders, trade-in, security rules, App Check | D10, D12, security review |
| CP7 | Admin functions, moderation, hosting decision | D2, D3, D9 |

---

## 13. Decision register (D1–D16 carried forward)

All decisions below are **existing Phase 1 decisions, carried forward unchanged** unless marked owner-approved. Items marked **Blocks Firebase** require owner approval before Firebase implementation can proceed.

### 13.1 D8 — Authentication model and user identity (owner-approved)

**Status:** Owner-approved. The following product decisions were approved by the owner:

**Approved product behavior:**
- Public product browsing without authentication.
- Guest users can add products to carts.
- Checkout requires authentication.
- Guest carts must merge into the authenticated customer's cart after sign-in.
- Password reset is included in the initial authentication release (owner-approved). Users request a password-reset email using their registered email address via Firebase Authentication's email-based password reset functionality. Clear success and error feedback is provided without revealing whether an email address is registered. Firebase Console email templates must be configured.
- On logout, the customer's cart document in Firestore is preserved; the cart UI is cleared immediately. When the same customer signs in again, their existing cart is restored. A different user signing in must never see the previous customer's cart.
- The anonymous guest cart document (`carts/{anonymous_uid}`) is associated with the Firebase Anonymous Auth UID and preserved via owner-approved `local` Firebase Auth persistence. It is never deleted merely because the user signs out or closes the browser. One anonymous user's cart is never exposed to another person using the same browser.
- Guest cart data must remain available until the authenticated customer's cart merge has been successfully completed and verified. Interrupted sign-in, browser reload, tab closure, network failure, or failed merge must not silently discard the guest cart. The handoff must be recoverable after authentication is restored.

**Approved administrative behavior (owner-approved):**
- Firebase Auth custom claims for admin authorization, set server-side via Firebase Admin SDK using a one-time, manually executed bootstrap process.
- The owner creates the first administrator account through normal registration/authentication.
- A trusted operator obtains the account's Firebase UID.
- A server-side bootstrap script assigns the `admin` custom claim to that exact UID.
- The bootstrap script must require an explicit target UID; never grant admin to the first registered user automatically.
- It must verify the intended Firebase project/environment before making changes.
- It must fail safely when the target account cannot be verified.
- It must avoid logging credentials, tokens, or sensitive account information.
- It must be idempotent where practical.
- It must report the target UID and operation result without exposing secrets.
- It must not be exposed as a public HTTP endpoint.
- Clients may need to refresh their Firebase ID token before updated claims become visible.
- Firestore and Storage security rules must rely on verified token claims, never client-provided role fields.
- Profile documents must not allow users to write their own privileged role or custom-claim fields.
- Future administrator provisioning and removal must use trusted server-side operations.

**Proposed technical implementation (not yet implemented, subject to further design):**
- Firebase Anonymous Authentication is the proposed guest identity mechanism, created **lazily** on first cart addition (not on page load or ordinary browsing).
- **Owner-approved: `local` persistence** — Firebase Authentication uses browser-local persistence, so once a session is created it survives page reloads and browser restarts.
- Firebase UID is the permanent customer identity.
- Email/password authentication for registered customers (initial proposed method).
- `linkWithCredential` for anonymous-to-email/password account upgrading, preserving the same Firebase UID.

**Decisions that remain unresolved (do not silently decide):**
- Guest cart merge conflict resolution (what happens when both guest and authenticated carts contain the same product).
- Duplicate product quantity handling during guest-to-authenticated cart merge.
- Maximum quantities and stock validation rules.
- Behavior when anonymous account linking fails.
- Account deletion and cart retention policies.
- Authentication providers beyond the initial proposed email/password method (e.g., OAuth/social providers).

| ID | Decision | Blocks Firebase? | Status | Recommended handling |
|---|---|---|---|---|
| D1 | Store currency and supported currencies | Yes | Open | Owner approval (PKR / USD / both) |
| D2 | Tax, shipping, total policy | Yes | Open | Owner approval |
| D3 | Cart count semantics | No | Open | UI decision |
| D4 | Money representation and rounding | Yes | Open | Owner approval |
| D5 | Parts product identity and catalog source | Yes | Open | Owner approval |
| D6 | Product detail not-found behavior | Yes | Open | Owner approval |
| D7 | Review model, aggregates, moderation | Yes | Open | Owner approval |
| D8 | Authentication model and user identity | Yes | **Owner-approved (Section 13.1)** | Approved — see Section 13.1 |
| D9 | Car listing semantics (condition, seller, status) | Yes | Open | Owner approval |
| D10 | Trade-in persistence, validation, PII policy | Yes | Open | Owner approval |
| D11 | Cart scoping and guest merge | Yes | Open | Owner approval |
| D12 | Order/checkout contract | Yes | Open | Owner approval |
| D13 | Timestamp storage and display | Yes | Open | Owner approval |
| D14 | Quantity limits and stock enforcement | Partial | Open | Owner approval |
| D15 | Search scope | Partial | Open | Owner approval |
| D16 | Whether `icon` belongs in data | No | Open | Presentation decision |

---

## 14. Explicit out-of-scope items

- No Firebase SDK installation.
- No Firebase project creation or configuration.
- No environment file creation or modification.
- No application source changes.
- No database creation or migration.
- No deployment.
- No commit or push.
- No UI redesign.
- No resolution of D1–D7, D9–D16 without approval. D8 is owner-approved as described in Section 13.1.
- No implementation of security rules, Cloud Functions, or App Check.

---

**End of audit.** This document is a proposal for review. D8 is owner-approved as described in Section 13.1; all other decisions (D1–D7, D9–D16) remain open. Wait for review and approval before beginning Phase 2 implementation.
