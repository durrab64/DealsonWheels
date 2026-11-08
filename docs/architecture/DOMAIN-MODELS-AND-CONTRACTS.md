# Deals on Wheels — Domain Models and Data Contracts

**Checkpoint:** Phase 1, Checkpoint 3  
**Status:** Draft for review. This document is descriptive first and prescriptive second. None of the proposed contracts below are enforced by the application today.  
**Repository:** `C:\Users\durra\Downloads\Compressed\DealsonWheels-repo-clone-20261105-232808`  
**Branch / HEAD inspected:** `phase0/stabilization` / `60a70389f5a08d30bdd574470981fa90337d98e2`  
**Date:** 2026-11-08  
**Change class:** Documentation only. No production behavior, dependency, route, asset, or persisted-data change was made for this checkpoint.

---

## 1. Scope and methodology

### 1.1 Purpose

This document establishes a shared vocabulary for the data that actually exists in Deals on Wheels, distinguishes authored data from generated placeholders and mock behavior, and proposes contracts that a future data-access layer could implement. It is preparation for that layer, not an implementation of it.

### 1.2 What was inspected

The analysis is based on direct source inspection of the current working tree, not on the README alone:

- `src/data/categories.jsx`
- `src/data/cars.jsx`
- `src/pages/ChildCategoryPage.jsx`
- `src/pages/ProductPage.jsx`
- `src/pages/CategoryPage.jsx`
- `src/pages/BuySellPage.jsx`
- `src/pages/BuySellProductPage.jsx`
- `src/pages/TradePage.jsx`
- `src/pages/SellCarPage.jsx`
- `src/pages/CartPage.jsx`
- `src/context/CartContext.jsx`
- `src/context/AuthContext.jsx`
- `src/components/CartDrawer.jsx`
- `src/components/CartToast.jsx`
- `src/components/CategoryGrid.jsx`
- `src/components/SearchResults.jsx`
- `src/components/Navbar.jsx`
- `src/components/AuthModal.jsx`
- `src/App.jsx`
- `src/App.test.jsx`
- `README.md`
- Phase 1 CP1 architecture report and CP2 testing report (external artifacts)

### 1.3 Method

1. Locate every domain-like value in source.
2. Record the literal runtime shape and every producer/consumer.
3. Classify each value as **authored static**, **generated**, **mock**, **hardcoded**, or **absent**.
4. Identify validation and normalization boundaries.
5. Compare current representations against a proposed contract.
6. Mark every policy choice that cannot be inferred from source as a decision requiring approval.

### 1.4 Evidence tags used in this document

| Tag | Meaning |
|---|---|
| **Authored static** | Hand-written demo data in `src/data/` that the UI treats as the live catalog. Still not production data. |
| **Generated** | Constructed at render time from arrays/loops; no independent record exists. |
| **Mock** | Simulated behavior with no real service behind it. |
| **Hardcoded** | Literal value embedded in a page/component; not data-driven. |
| **Absent** | No model, field, persistence, or behavior exists. |

### 1.5 Notation

TypeScript-style interfaces are used **for documentation only**. The application remains JavaScript/JSX. No interface below is compiled, imported, or enforced.

Conventions in the proposed contracts:

- `?` marks a field that may be absent.
- `readonly` is a recommendation, not current behavior.
- “Current” means observed behavior in the working tree.
- “Proposed” means a candidate contract for future work, subject to the approvals in section 9.
- “Angle-bracket decision” means the final choice is a product-owner decision, not a documentation assumption.

### 1.6 Important boundary

The application has **no repository layer, service layer, API client, database, or domain validation module**. Pages import static arrays directly and contexts call `localStorage` directly. There is therefore no existing contract to reverse-engineer at a service boundary; the contracts below are inferred from data producers and UI consumers.

---

## 2. Current data-source inventory

### 2.1 Source map

| Domain | Source | Symbol | Classification | Persistence |
|---|---|---|---|---|
| Top-level categories | `src/data/categories.jsx` | `categories` object | Authored static | None; module import |
| Child categories | `src/data/categories.jsx` | `categories[type].items[]` | Authored static | None; embedded |
| Parts product summaries | `src/pages/ChildCategoryPage.jsx` | `productItems` | Generated at render | None |
| Parts product images | `src/pages/ChildCategoryPage.jsx` | `productImages` | Hardcoded maps | None |
| Parts product names/descriptions | `src/pages/ChildCategoryPage.jsx` | `productDescriptions` | Hardcoded maps | None |
| Parts product price/rating/review seeds | `src/pages/ChildCategoryPage.jsx` | `productData` | Hardcoded array | None |
| Parts product detail | `src/pages/ProductPage.jsx` | `product` memo | Generated placeholder | None |
| Parts product reviews | `src/pages/ProductPage.jsx` | inline literal in JSX | Hardcoded | None |
| Used-car listings | `src/data/cars.jsx` | `tradeInventory` | Authored static demo inventory | None; module import |
| Car reviews | `src/data/cars.jsx` | `tradeInventory[].reviewsList[]` | Hardcoded, authored inline | None |
| Car aggregates | `src/pages/BuySellProductPage.jsx` | `rating`, `reviews` | Hardcoded / derived length | None |
| Cart | `src/context/CartContext.jsx` | `cartItems` | Real runtime state | `localStorage['cart']` |
| Cart confirmation | `src/context/CartContext.jsx` | `lastAdded` | Real ephemeral state | None (intentionally) |
| User | `src/context/AuthContext.jsx` | `user` | Mock | `localStorage['user']` |
| Auth session UI | `src/context/AuthContext.jsx` | `isAuthModalOpen`, `authMode` | Real ephemeral UI state | None |
| Search results | `src/components/Navbar.jsx` | `searchResults` | Derived at runtime | None |
| Trade-in request | `src/pages/TradePage.jsx` | `formData` | Real form state | None; discarded on submit |
| Orders / checkout | — | — | **Absent** | None |
| Payments | — | — | **Absent** | None |
| Seller listings | `src/pages/SellCarPage.jsx` | static placeholder | **Absent** (Coming Soon) | None |

### 2.2 Asset sources relevant to domain records

- Category and car images are **public URL strings** such as `/images/wheels/chrome_racing_rim_black.png` and `/cars/suzuki_alto_vxr_1764671694278.png`.
- Some category/product images are **imported Vite asset modules** from `src/assets/images/`. At runtime these also resolve to URL strings.
- `ProductPage` and `TradePage` additionally use external Unsplash URLs for one hero/one car image.
- Images are therefore always strings at the domain boundary. No image entity, alt-text field, or media record exists.

### 2.3 Structural observation

The current architecture has three distinct data worlds that do not share a model:

1. **Parts catalog** — categories are authored; products are generated at render and have no independent existence.
2. **Car marketplace** — listings are authored as one array; reviews are embedded in each listing.
3. **Commerce state** — cart and user are browser-local objects with minimal validation; orders do not exist.

This split is the central fact behind nearly every inconsistency in section 7.

---

## 3. Existing domain structures

### 3.1 Top-level category

Observed in `src/data/categories.jsx` lines 14–131.

```js
export const categories = {
  exterior: {
    title: "Exterior",
    description: "Transform your vehicle's look with premium exterior modifications.",
    items: [ /* six child items */ ]
  },
  interior: { /* title, description, four items */ },
  tech: { /* title, description, four items */ }
};
```

| Field | Observed type | Required in practice | Notes |
|---|---|---|---|
| object key (`exterior`, `interior`, `tech`) | string | Yes | Acts as the category id; used directly in routes |
| `title` | string | Yes | Display label |
| `description` | string | Yes | Display copy |
| `items` | array | Yes | Child categories; may be empty in principle |

**Identity:** the category id is the object key. There is no `id` field and no separate category collection.

### 3.2 Child category

Observed at `categories[type].items[]`.

```js
{
  id: "wheels",
  name: "Wheels & Rims",
  icon: Disc,                              // Lucide React component, not data
  image: "/images/wheels/chrome_racing_rim_black.png",
  description: "Custom alloy wheels, forged rims, and performance tires."
}
```

| Field | Observed type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Route segment and lookup key; not globally unique in principle, only unique within a category |
| `name` | string | Yes | Display label |
| `icon` | React component | Yes in source | **Not serializable**; cannot cross an API/JSON boundary |
| `image` | string | Yes | Public path or resolved asset URL |
| `description` | string | Yes | Display/search copy |

**Current child-category ids:** `wheels`, `bumpers`, `headlights`, `taillights`, `wraps`, `spoilers`, `seats`, `steering`, `lighting`, `mats`, `audio`, `screens`, `dashcams`, `tuning` (14 total).

### 3.3 Generated parts product (grid/card model)

Observed in `src/pages/ChildCategoryPage.jsx` lines 207–249.

```js
// Seeds, reused by index modulo 6
const productData = [
  { originalPrice: 399.99, discount: 25, rating: 4.8, reviewCount: 234 },
  { originalPrice: 599.99, discount: 15, rating: 4.5, reviewCount: 189 },
  { originalPrice: 299.99, discount: 30, rating: 4.9, reviewCount: 312 },
  { originalPrice: 799.99, discount: 20, rating: 4.6, reviewCount: 156 },
  { originalPrice: 449.99, discount: 10, rating: 4.7, reviewCount: 278 },
  { originalPrice: 649.99, discount: 18, rating: 4.4, reviewCount: 201 }
];

// Per generated card
{
  id: `${childId}-product-${i}`,                 // e.g. "wheels-product-0"
  name: string,
  description: string,
  image: string,
  icon: ReactComponent,
  originalPrice: `Rs${originalPrice.toFixed(2)}`, // e.g. "Rs399.99"
  price: `Rs${discountedPrice.toFixed(2)}`,       // e.g. "Rs299.99"
  discount: number,                               // percent
  rating: number,                                 // 4.4–4.9
  reviewCount: number
}
```

| Field | Observed type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Positional and derived: `<childId>-product-<index>` |
| `name` | string | Yes | From `productDescriptions`, else fallback `${childItem.name} Pro Kit ${i+1}` |
| `description` | string | Yes | From `productDescriptions`, else generic fallback |
| `image` | string | Yes | From `productImages`, wrapping by modulo |
| `icon` | React component | Yes | Non-serializable |
| `originalPrice` | **formatted string** | Yes | `Rs` + fixed 2 decimals |
| `price` | **formatted string** | Yes | `Rs` + fixed 2 decimals; discount already applied |
| `discount` | number | Yes | Percent, 10–30 |
| `rating` | number | Yes | From seed |
| `reviewCount` | number | Yes | From seed |

**Card count:** `productImages[childId].length` if non-empty, otherwise `6`. Per current maps this yields 4–6 cards per child category.

**Important:** there is no product entity behind the card. The card is recomputed on every render. `productData` is cycled by index, so the same price/rating/review seeds repeat across unrelated products and categories.

### 3.4 Parts product detail (placeholder model)

Observed in `src/pages/ProductPage.jsx` lines 29–64. The route supplies `type`, `childId`, `productId`, but only `type` and `childId` are resolved. `productId` is copied into `id` and otherwise ignored.

```js
// If childItem exists, a fixed placeholder is returned
{
  id: productId,                       // route string; not validated
  name: childItem.name,                // category name, not a product name
  description: childItem.description,  // category description
  price: '$399.00',                    // hardcoded
  rating: 4.5,                         // hardcoded
  reviews: 128,                        // hardcoded
  image: childItem.image,              // category hero image
  categoryTitle: categoryData.title,
  childName: childItem.name,
  specifications: {
    'Material': 'Premium Carbon Fiber',
    'Compatibility': 'Universal Fit',
    'Finish': 'Matte Black',
    'Installation': 'Plug & Play',
    'Warranty': '1 Year Manufacturer',
    'Origin': 'Made in USA'
  },
  features: [ /* six generic strings */ ],
  inStock: true,                       // declared, not rendered
  stockCount: 12                       // declared, not rendered
}
```

| Field | Observed type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Route `productId` |
| `name` | string | Yes | Child category name |
| `description` | string | Yes | Child category description |
| `price` | **formatted string in USD** | Yes | Literal `$399.00` |
| `rating` | number | Yes | Literal `4.5` |
| `reviews` | number | Yes | Literal `128` |
| `image` | string | Yes | Child category image |
| `specifications` | `Record<string,string>` | Yes | Fixed six entries |
| `features` | `string[]` | Yes | Fixed six entries |
| `inStock` | boolean | Yes | Not surfaced in UI |
| `stockCount` | number | Yes | Not surfaced in UI |

Additional hardcoded detail-page values:

- Struck-through price `$499.00` and badge `Save 20%` (`ProductPage.jsx` lines 204–218).
- Shipping copy: “Free standard shipping on all orders over $100” (line 324).
- Delivery: 5–7 business days standard, 2–3 express (line 338).
- Return policy: 30 days (line 352).
- Review distribution: 75 / 15 / 5 / 3 / 2 percent (lines 384–390).
- Four reviews about **headphones**, dated November 2025 (lines 407–443).

**Behavioral consequence:** `/category/exterior/wheels/anything` and `/category/exterior/wheels/wheels-product-0` render the same placeholder. This is explicitly characterized by `src/App.test.jsx` lines 102–112.

### 3.5 Used-car listing

Observed in `src/data/cars.jsx` lines 1–488. `tradeInventory` contains nine listings.

```js
{
  id: 1,                                  // number
  name: "SUZUKI ALTO VXR",
  price: "Rs 32,20,000",                  // formatted string, Indian digit grouping
  year: "2025",                           // string
  condition: "New",                       // "New" | "Used"
  mileage: "0 km",                        // formatted string
  location: "Khalid Bin Walid Road, Karachi",
  postedTime: "2 hours ago",              // relative display string
  image: "/cars/suzuki_alto_vxr_1764671694278.png",
  badge: "Featured",                      // string | null
  description: string,
  features: string[],
  specifications: {
    "Engine": "660cc",
    "Transmission": "Manual",
    "Fuel Type": "Petrol",
    "Color": "Solid White",
    "Doors": "4",
    "Seating Capacity": "4 Persons"
  },
  reviewsList: [ /* CarReview[] */ ]
}
```

| Field | Observed type | Required | Notes |
|---|---|---|---|
| `id` | number | Yes | 1–9; route lookup uses `String(item.id) === id` |
| `name` | string | Yes | Listing title |
| `price` | formatted string | Yes | `Rs` + Indian grouping, e.g. `Rs 1,26,00,000` |
| `year` | string | Yes | Display string, not a number/date |
| `condition` | string | Yes | `New` or `Used` |
| `mileage` | formatted string | Yes | e.g. `82,000 km`, `0 km` |
| `location` | string | Yes | Free text |
| `postedTime` | relative display string | Yes | e.g. `2 hours ago`, `1 week ago`; not a timestamp |
| `image` | string | Yes | Local public path |
| `badge` | string \| null | Yes in practice | `Featured`, `Premium`, or `null` |
| `description` | string | Yes | Long copy |
| `features` | string[] | Yes | 6 entries per listing |
| `specifications` | `Record<string,string>` | Yes | 6 entries per listing; values include units and text |
| `reviewsList` | `CarReview[]` | Yes | 2–3 entries per listing |

**No listing has:** seller id, seller name, status, createdAt, updatedAt, VIN, registration city as a structured field, fuel type as an enum, transmission as an enum, body type, or a numeric price.

### 3.6 Car review

Observed inside each `tradeInventory[].reviewsList[]`.

```js
{
  name: "Ahmed Khan",
  date: "2 days ago",        // relative display string
  rating: 5,                 // number 1–5
  verified: true,            // boolean
  title: "Perfect city car",
  review: "Excellent fuel average ...",
  helpful: 12                // number
}
```

| Field | Observed type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Author display name; no author id |
| `date` | relative display string | Yes | Not a timestamp |
| `rating` | number | Yes | Integer 1–5 in current data |
| `verified` | boolean | Yes | Hardcoded claim |
| `title` | string | Yes | Review headline |
| `review` | string | Yes | Body text |
| `helpful` | number | Yes | Display count; buttons are inert |

**No review has:** id, subject id, author id, createdAt, updatedAt, moderation state, or a real helpful-vote record.

### 3.7 Cart item and cart state

Observed in `src/context/CartContext.jsx`.

The persisted value under `localStorage['cart']` is an **array**, not an object wrapper:

```js
[
  {
    // every product field spread in, plus:
    id: "wheels-product-0",       // string | number
    name: "Forged Alloy Wheels 18\"",
    description: "...",
    image: "/images/wheels/...",
    icon: ReactComponent,         // spread in when added from a card
    originalPrice: "Rs399.99",
    price: "Rs299.99",            // OR "$399.00" when added from detail page
    discount: 25,
    rating: 4.8,
    reviewCount: 234,
    quantity: 1
  }
]
```

Validation and normalization (lines 16–36):

```js
const isValidCartItem = (item) =>
  Boolean(item) &&
  typeof item === 'object' &&
  (typeof item.id === 'string' || typeof item.id === 'number') &&
  typeof item.name === 'string';

const normalizeCartItems = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isValidCartItem)
    .map(item => ({
      ...item,
      quantity:
        typeof item.quantity === 'number' &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
          ? Math.floor(item.quantity)
          : 1
    }));
};
```

| Field | Observed type | Required by validator | Notes |
|---|---|---|---|
| `id` | string \| number | Yes | Strict-equality identity |
| `name` | string | Yes | Display |
| `quantity` | number | Normalized to >=1 integer on read | `updateQuantity` can write non-integers after load |
| `price` | formatted string | **No** | May be missing; parsing then yields `0` or `NaN` |
| `image` | string | No | Drawer renders it without a fallback |
| `description` | string | No | Shown on cart page |
| all other product fields | various | No | Retained by spread, including non-serializable `icon` in memory (JSON drops it) |

Derived state (lines 108–119):

```js
cartCount = sum(item.quantity)                  // unit count
getPriceValue(price) = number, 0, or parseFloat(price.replace(/[^0-9.]/g, ''))
cartTotal = sum(getPriceValue(item.price) * item.quantity)
```

| Derived value | Definition | Notes |
|---|---|---|
| `cartCount` | Sum of quantities | Used by the navbar badge |
| `cartTotal` | Sum of parsed unit prices × quantities | No currency, no rounding policy |
| `lastAdded` | `{ id, name, image, addedAt: Date.now() }` | Ephemeral toast state; not persisted |
| `isCartOpen` | boolean | Ephemeral drawer state |

### 3.8 Persisted user and auth state

Observed in `src/context/AuthContext.jsx`.

Persisted value under `localStorage['user']`:

```js
{
  id: '1',
  name: 'Demo User',                 // login; signup uses entered name
  email: 'entered@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
}
```

| Field | Observed type | Required by validator | Notes |
|---|---|---|---|
| `id` | string \| number | Yes | Always `'1'` for both login and signup |
| `name` | string | Yes | Login always `Demo User` |
| `email` | string | Yes | Echoes the submitted email |
| `avatar` | string | **No** | Navbar renders it anyway |

Mock behavior:

- `login(email, password)` ignores the password, waits 1 second, sets the fixed user.
- `signup(name, email, password)` ignores the password, waits 1 second, sets id `'1'`.
- No credential verification, token, session expiry, role, or account record.
- `authMode` is `'login'` or `'signup'`; `isAuthModalOpen` is ephemeral.
- On every `user` change, valid users are persisted and invalid/null users cause key removal.

### 3.9 Search result

Observed in `src/components/Navbar.jsx` lines 135–158 and consumed by `SearchResults.jsx`.

```js
{
  ...childItem,              // id, name, icon, image, description
  categoryType: "exterior",
  categoryTitle: "Exterior",
  childId: item.id,          // duplicate of id
  childName: item.name       // duplicate of name
}
```

| Field | Observed type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Child category id |
| `name` | string | Yes | Child category name |
| `icon` | React component | Yes in source | Non-serializable |
| `image` | string | Yes | Display thumbnail |
| `description` | string | Yes | Matched but not rendered in results |
| `categoryType` | string | Yes | Used in navigation |
| `categoryTitle` | string | Yes | Display |
| `childId` | string | Yes | Duplicate of `id`; used in navigation |
| `childName` | string | Yes | Duplicate of `name`; used in display |

Search matches child-category `name` and `description` only. It does not search products, cars, or reviews. The URL query `?q=` is written, and `CategoryPage` reads it, but the navbar does not recompute results on mount from an existing `q`.

### 3.10 Trade-in form

Observed in `src/pages/TradePage.jsx` lines 6–21.

```js
{
  make: '',
  model: '',
  year: '',
  mileage: '',
  value: '',
  condition: 'Good',
  fullName: '',
  phone: '',
  email: ''
}
```

| Field | Observed type | Required | Notes |
|---|---|---|---|
| `make` | string | No | Free text |
| `model` | string | No | Free text |
| `year` | string | No | Free text, not numeric |
| `mileage` | string | No | Free text; label says km |
| `value` | string | No | Free text; label says Rs |
| `condition` | string | Yes via default | One of `Good`, `Excellent`, `Fair`, `Poor` |
| `fullName` | string | No | Free text |
| `phone` | string | No | `type="tel"`, no pattern |
| `email` | string | No | `type="email"`, no `required` |

Submit behavior: `alert('Trade-in request submitted! ...')`; nothing is stored or sent. No validation runs. The route parameter `/trade/:id` is not read. The right-hand “Trading For” card is hardcoded to **Toyota Raize 2020**, `Rs 63,84,000`, year 2020, mileage 0 km, condition New (lines 165–213), regardless of which listing the user came from.

### 3.11 Orders, checkout, and payment

**Absent.** The only “Order Summary” is the cart page’s visual summary. There is:

- no order entity, order id, line item, status, history, or receipt;
- no checkout route or form;
- no shipping address, billing address, or contact snapshot for an order;
- no payment method, payment intent, transaction, or provider integration;
- no persistence key beyond `cart` and `user`;
- no server/API call anywhere.

Both checkout buttons are disabled and labelled “Checkout coming soon” (`CartPage.jsx` lines 124–134; `CartDrawer.jsx` lines 154–165).

### 3.12 Seller listing

**Absent.** `/sell-car` renders a static “Coming Soon” placeholder (`SellCarPage.jsx` lines 6–11). There is no seller listing form, draft, publication, moderation, or ownership model.

---

## 4. Proposed domain contracts

> **Status:** Proposals only. Nothing in this section is enforced. Fields marked “absent today” are not present in current data and must not be assumed to exist. Section 8 explains what each proposal would require to adopt.

### 4.1 Shared identifiers and scalar concepts

These are the cross-cutting decisions that every entity depends on.

```ts
// Documentation only.
type CategoryId = 'exterior' | 'interior' | 'tech';
type ChildCategoryId = string;   // currently "wheels", "audio", ...
type ProductId = string;         // currently "wheels-product-0"
type CarListingId = string;      // currently 1..9 stringified
type UserId = string;            // currently always "1"
type ISODateTimeString = string; // proposed ISO 8601 UTC, e.g. "2026-11-08T12:34:56.789Z"
type Quantity = number;          // proposed positive integer >= 1
```

Proposed identifier rules:

| Rule | Proposal | Current reality |
|---|---|---|
| Type | Always string at boundaries | Mixed: product ids string; car ids number in data, string in route |
| Format | Opaque; no spaces; case-sensitive | Positional/generated for products; numeric for cars |
| Stability | Must not change when display order changes | Product ids are index-based and therefore unstable |
| Uniqueness | Product ids globally unique; child ids unique within category | Child ids are only used within their category; product ids embed child id |
| Serialization | Must be JSON-safe | `icon` is a React component on category/product/search objects and is not JSON-safe |

**Decision required:** whether product ids remain human-readable (`wheels-product-0`) or become opaque stable ids (see D5). No new id format is adopted by this document.

### 4.2 Money and currency

This is the most consequential shared contract. Current source uses three incompatible representations:

| Location | Example | Type | Currency signal |
|---|---|---|---|
| Generated parts card | `"Rs299.99"` | string | `Rs` prefix, Western decimal |
| Parts detail page | `"$399.00"` | string | `$` prefix |
| Cart summary | `"Rs$1,234.56"` | string | `Rs$` prefix |
| Used-car listing | `"Rs 32,20,000"` | string | `Rs` + space + Indian grouping |
| Trade target | `"Rs 63,84,000"` | string | same |
| Shipping copy | `"$100"` | string | `$` |
| Trade-in estimate input | `"3,500,000"` | string | label says `Rs` |

Proposed candidate shape (pending D1 and D4):

```ts
// Documentation only. Do not implement until currency and rounding are approved.
type CurrencyCode = 'PKR' | 'USD'; // candidate set only; D1 decides the real set

interface Money {
  currency: CurrencyCode;
  // Integer minor units. One major unit equals 10^exponent minor units,
  // where the exponent is defined by the currency itself (for example the
  // ISO 4217 minor-unit exponent), not assumed to be 2.
  // Examples: exponent 2 stores 29999 for 299.99; exponent 0 stores 299
  // for 299; exponent 3 stores 299999 for 299.999.
  amountMinor: number;
}
```

Rules that follow from the proposal:

- Money is **never** parsed with `parseFloat(string.replace(...))` at a domain boundary.
- Display formatting is a view concern, not a stored-value concern.
- Arithmetic uses integer minor units or a decimal library; floats are not a monetary type.
- The scale of an amount is a property of its currency: `amountMinor` counts units of `10^-exponent`. Do not assume two decimal places; read the exponent from the approved currency definition (D1) instead of hardcoding it.
- Negative amounts are invalid for catalog prices, cart totals, shipping, and tax unless a refund/discount model is approved.
- Rounding must be defined once (per line, per subtotal, or per total) before tax is implemented.

Alternative if the product owner prefers decimal major units:

```ts
interface MoneyDecimal {
  currency: CurrencyCode;
  // Decimal major units using the currency's standard exponent.
  // The permitted number of fraction digits follows the currency
  // (for example 2 for USD or PKR, 0 for JPY, 3 for KWD), not a fixed 2.
  amount: number;
}
```

The decimal-major-unit alternative is subject to the same currency-exponent rule. "Exactly two fraction digits" is not a valid universal assumption; the allowed precision must come from each currency's definition, whichever representation is approved.

This document **does not choose** between these representations, PKR versus USD, tax rate, shipping threshold, or rounding. Those are product-owner decisions D1, D2, and D4.

### 4.3 Category and child category

```ts
interface Category {
  id: CategoryId;
  title: string;
  description: string;
  children: ChildCategory[];
}

interface ChildCategory {
  id: ChildCategoryId;
  categoryId: CategoryId;
  name: string;
  description: string;
  imageUrl: string;
  // icon is intentionally omitted: React components are not data.
  // A presentation layer may map id -> icon locally.
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | Yes | Stable; `categoryId` added to child so it can stand alone |
| `title` / `name` | Yes | Display |
| `description` | Yes | Display and search |
| `imageUrl` | Yes | Replace current `image` naming only if a migration is approved |
| `children` | Yes | Replace current embedded `items` only if a migration is approved |
| `icon` | **Omitted** | Current `icon` is a Lucide component; presentation concern |

**Compatibility note:** the current shape is `{title, description, items}` with category id as the object key. The proposal changes `items` to `children` and adds `id`/`categoryId`. That is an adapter/migration choice, not a drop-in match.

### 4.4 Product summary and product detail

```ts
interface ProductSummary {
  id: ProductId;
  categoryId: CategoryId;
  childCategoryId: ChildCategoryId;
  name: string;
  description: string;
  imageUrl: string;
  price: Money;
  originalPrice?: Money;
  discountPercent?: number;  // 0–100
  rating?: number;           // 0–5
  reviewCount?: number;      // integer >= 0
}

interface ProductDetail extends ProductSummary {
  specifications: Record<string, string>;
  features: string[];
  inStock: boolean;
  stockCount?: number;       // integer >= 0
}
```

| Field | Required | Current source | Notes |
|---|---|---|---|
| `id` | Yes | `productId` route / `${childId}-product-${i}` | Must become stable |
| `categoryId` / `childCategoryId` | Yes | Derived from route | Not stored on the product today |
| `name` / `description` | Yes | Maps or fallbacks | Detail currently reuses child category text |
| `imageUrl` | Yes | Map/child image | Same image reused across cards in several categories |
| `price` | Yes | Formatted string | Detail and card disagree today |
| `originalPrice` | Optional | `originalPrice` string | Struck-through display |
| `discountPercent` | Optional | `discount` number | Current 10–30 |
| `rating` / `reviewCount` | Optional | Seeds | Not derived from reviews |
| `specifications` | Detail only | Fixed six entries | Currently identical for every product |
| `features` | Detail only | Fixed six entries | Currently identical for every product |
| `inStock` / `stockCount` | Detail only | Declared but unused | No inventory source |

**Do not assume** a product variant, SKU, brand, fitment, color, size, weight, shipping class, or tax category exists. None exists in source.

### 4.5 Used-car listing

```ts
interface CarListing {
  id: CarListingId;
  name: string;
  price: Money;
  year: number;                 // proposed numeric; current string
  condition: 'new' | 'used';    // proposed enum; current "New" | "Used"
  mileageKm: number;            // proposed numeric; current display string
  location: string;
  postedAt: ISODateTimeString;  // proposed timestamp; current relative string
  imageUrl: string;
  badge?: string | null;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  // Proposed only if a seller flow is approved (D9):
  sellerId?: UserId;            // absent today
  status?: 'active' | 'sold' | 'removed'; // absent today
}
```

| Field | Required | Current representation | Migration concern |
|---|---|---|---|
| `id` | Yes | number 1–9 | Stringify at boundary; preserve exact values |
| `price` | Yes | `Rs 32,20,000` | Indian grouping cannot be parsed by naive float logic in all locales; currency decision needed |
| `year` | Yes | `"2025"` | Converting to number is safe for current values |
| `condition` | Yes | `"New"` / `"Used"` | Lowercasing changes display unless a formatter is added |
| `mileageKm` | Yes | `"0 km"`, `"82,000 km"` | Parsing strips units; `0 km` on a “Used” listing would become 0 |
| `postedAt` | Yes | `"2 hours ago"` | **Not convertible** to an exact timestamp; would need a snapshot time or remain display-only |
| `specifications` | Yes | `Record<string,string>` | Keys are display labels, not stable codes |
| `sellerId` / `status` | Optional | Absent | Should not be invented as required fields |

### 4.6 Review (shared shape)

The current app has two unrelated review shapes with the same field names. A future shared contract must distinguish the subject.

```ts
type ReviewSubjectType = 'product' | 'car-listing';

interface Review {
  id: string;                         // absent today
  subjectType: ReviewSubjectType;     // implicit today (inline product vs nested car)
  subjectId: ProductId | CarListingId; // absent today
  authorId?: UserId;                  // absent today
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;                       // current field is "review"
  createdAt: ISODateTimeString;       // current field is "date" (display string)
  verified: boolean;
  helpfulCount: number;               // current field is "helpful"
  moderationStatus?: 'pending' | 'published' | 'rejected'; // absent today
}
```

| Current field | Proposed field | Compatible? |
|---|---|---|
| `name` | `authorName` | Rename/adapter |
| `date` | `createdAt` | **Not compatible** for relative strings (`2 days ago`); requires a snapshot timestamp or display-only string |
| `rating` | `rating` | Compatible, but must validate integer 1–5 |
| `verified` | `verified` | Compatible |
| `title` | `title` | Compatible |
| `review` | `body` | Rename/adapter |
| `helpful` | `helpfulCount` | Rename/adapter |
| (none) | `id`, `subjectType`, `subjectId`, `authorId` | New required fields; migration needed |

Aggregate rating is currently hardcoded independently of the review list. A future contract should define whether `rating` is stored, computed, or cached; see D7.

### 4.7 Cart item, cart, and totals

```ts
interface CartItem {
  id: ProductId;              // keep current identity field
  quantity: Quantity;         // positive integer
  name: string;               // display snapshot
  imageUrl?: string;
  description?: string;
  unitPrice: Money;           // proposed; current is a formatted string in "price"
}

interface Cart {
  items: CartItem[];
  updatedAt?: ISODateTimeString; // proposed; absent today
}

interface CartTotals {
  subtotal: Money;
  shipping: Money;
  tax: Money;
  total: Money;
  lineCount: number;          // cartItems.length
  unitCount: number;          // sum of quantities
}
```

| Current | Proposed | Notes |
|---|---|---|
| persisted array | `Cart.items` | Migration or adapter required if wrapper is adopted |
| `price` display string | `unitPrice` Money | Adapter must parse once and validate |
| `quantity` | `Quantity` | Enforce integer >=1 at write, not only read |
| `cartCount` (unit sum) | `unitCount` | Preserve current badge semantics |
| `cartItems.length` | `lineCount` | Preserve current drawer/page label semantics |
| `cartTotal` | `subtotal` | Rename only if migration approved |
| tax in `CartPage` | `tax` in totals | Must not be duplicated in view code |
| shipping in `CartPage` | `shipping` in totals | Must not be duplicated in view code |
| `lastAdded.addedAt` | `updatedAt`/event time | Add-to-cart timestamp is not a cart update timestamp; keep separate if needed |

The proposal deliberately does **not** decide:

- whether the cart is device-scoped or user-scoped (D11);
- whether checkout requires login;
- whether prices are revalidated at checkout;
- whether tax/shipping are included in the drawer, cart page, or both (D2);
- which count is shown on each surface (D3).

### 4.8 User and auth session

```ts
interface User {
  id: UserId;
  name: string;
  email: string;
  avatarUrl?: string;       // current field is "avatar"
  createdAt?: ISODateTimeString; // absent today
}

interface AuthSession {
  user: User | null;
  status: 'anonymous' | 'authenticated'; // inferred today from user != null
  // No token in the current mock; a future provider contract is out of scope.
}
```

| Field | Required | Current | Notes |
|---|---|---|---|
| `id` | Yes | Always `'1'` | Collides across every login/signup |
| `name` | Yes | `Demo User` or entered name | |
| `email` | Yes | Echoed input | Not verified or unique |
| `avatar` | Optional | Fixed Unsplash URL | Rename to `avatarUrl` requires adapter |
| password | **Never stored** | Submitted but ignored | Must not be added to a persisted user contract |

**Decision required:** whether this app will ever have real authentication, and if so, which provider/identity model (D8). This document does not propose a token, refresh, or password contract.

### 4.9 Search result

```ts
interface SearchResult {
  categoryId: CategoryId;      // adapter-mapped from current `categoryType`; see note
  categoryTitle: string;
  childCategoryId: ChildCategoryId;
  name: string;                // single display name for the child category
  description: string;
  imageUrl: string;
  // `childName` is not included: it duplicates `name` today.
  // icon omitted: presentation concern
}
```

| Current | Proposed | Notes |
|---|---|---|
| `categoryType` | `categoryId` (adapter-mapped) | Values coincide today only because the category object key acts as its id. The names are **not** interchangeable by contract; the adapter must map explicitly and define behavior if a category later gains a separate id. |
| `id` (from spread) and `childId` | `childCategoryId` | Both currently hold `item.id`; one identifier is enough |
| `name` (from spread) and `childName` | `name` | Both currently hold `item.name`; one display name is enough |
| `description` | `description` | Matched but not rendered in results today |
| `image` | `imageUrl` | Display thumbnail |
| `icon` | omitted | Non-serializable |

**Duplicate fields.** In `Navbar.jsx` the result is built by spreading the child item and then setting `childId: item.id` and `childName: item.name`. Therefore `id === childId` and `name === childName` for every result today; neither duplicate carries a distinct value. The proposal keeps one identifier (`childCategoryId`) and one display name (`name`). If a future breadcrumb needs a separately sourced label, that field must be defined with a distinct meaning rather than inherited as a copy.

**`categoryType` vs `categoryId`.** `categoryType` is the key used to index the `categories` object; `categoryId` is the proposed name for a category's identity. Their values coincide today, but that is a property of the current data layout, not a guarantee. Treat the conversion as an adapter mapping and do not assume the two are interchangeable if the catalog later stores a category id independent of its lookup key.

Search scope is a product decision: child categories only today; products and cars are not searched (D15).

### 4.10 Trade-in request

```ts
interface TradeInRequest {
  // No id or persistence exists today. Proposed only if the flow becomes real.
  id?: string;
  make: string;
  model: string;
  year: number;                 // current string
  mileageKm: number;            // current string

  // Customer input and platform output are different money concepts. Today
  // only a customer-entered value exists; it is free text, unvalidated, and
  // not authoritative. Whether the product needs either, both, or neither
  // is decision D10, so neither field is assumed required here.
  customerProvidedValue?: Money; // entered by the customer; current `value` field, string labelled "Rs"
  platformValuation?: Money;     // generated by the platform; absent today and not invented here

  condition: 'excellent' | 'good' | 'fair' | 'poor'; // current Capitalized strings
  contact: {
    fullName: string;
    phone: string;
    email: string;
  };
  targetListingId?: CarListingId;  // route id exists but is ignored today
  createdAt?: ISODateTimeString;   // absent today
}
```

**Customer-provided value vs platform valuation (decision D10).** The current `value` field is entered by the customer; it is free text, has no validation, and has no pricing basis behind it. A platform-generated valuation is a separate concept: it would require a pricing source, defined inputs, a calculation time, and a version, none of which exist. The two must not be conflated or substituted for one another. This document does not decide which is collected, displayed, trusted, or persisted.

| Current | Proposed | Notes |
|---|---|---|
| flat `fullName` / `phone` / `email` | `contact` object | Adapter/rename |
| `value` string (customer input) | `customerProvidedValue` Money | Customer-entered; not validated and not authoritative. Currency and rounding rules needed. |
| (absent) | `platformValuation` Money | Platform-generated; would require a pricing source, inputs, and a calculation timestamp. Decision D10. |
| `condition: 'Good'` | lowercase enum | Display formatter required |
| no route usage | `targetListingId` | `/trade/:id` currently has no effect |
| no submit handling | persistence + id + createdAt | Requires a real flow and PII policy (D10) |

### 4.11 Order and checkout (not implemented)

```ts
// NOT IMPLEMENTED. Proposed only if checkout is approved (D12).
// No current code creates, reads, stores, or displays an Order.
interface Order {
  id: string;
  userId: UserId;
  items: OrderItem[];
  subtotal: Money;
  shipping: Money;
  tax: Money;
  total: Money;
  status: 'pending' | 'paid' | 'cancelled' | 'fulfilled';
  createdAt: ISODateTimeString;
}

interface OrderItem {
  productId: ProductId;
  name: string;        // snapshot at purchase time
  unitPrice: Money;    // snapshot at purchase time
  quantity: Quantity;
  // Either a stored immutable snapshot or a derived value; see
  // "Line total representation" below. It must not be both.
  lineTotal: Money;
}
```

**Line total representation — decision required (part of D12).** `lineTotal` must not remain an unconstrained duplicate of `unitPrice × quantity`. Two implementations are compatible with this contract, and one must be chosen explicitly:

1. **Stored immutable snapshot.** `lineTotal` is written once at purchase and is authoritative for receipts. At write time it must satisfy `lineTotal.amountMinor === unitPrice.amountMinor × quantity` in the same currency and at the same exponent. Later corrections to `unitPrice` or `quantity` must not overwrite it in place; they require an explicit adjustment or replacement record.
2. **Derived value.** `lineTotal` is not persisted. It is computed from the stored `unitPrice` snapshot and `quantity` wherever it is displayed or summed, so it cannot disagree with them.

The choice affects receipt history and correction semantics, not just storage. This document does not choose between the two. With integer minor units the invariant is exact; if the decimal-major-unit alternative in section 4.2 is used, the approved rounding policy (D4) applies once per line.

Because no order exists, this contract must not be used to justify adding checkout, payment, tax, or shipping behavior during CP3. It is listed so future work does not accidentally treat the cart as an order.

---

## 5. Relationships between entities

### 5.1 Current relationships

```text
categories (object)
  └── [categoryId] ──1:N── items[] (child category)
                              │
                              └──1:N── generated product cards (render-time only)

cart (localStorage) ──1:N── cart items (snapshot fields)
                                    │
                                    └──N:1 reference by ProductId──► generated product cards

tradeInventory[]
  └── car listing ──1:N── reviewsList[] (embedded)

user (localStorage)        cart (localStorage)
  └── no relation            └── no relation to user

trade-in form (memory) ──X── car listing (no link; route id ignored)

search results ──derived from── child categories

orders ── absent
```

### 5.2 Relationship table

| Relationship | Cardinality | Current implementation | Strength / gap |
|---|---|---|---|
| Category → child category | 1:N | Embedded `items[]` | Strong in source, no independent child records |
| Child category → product | 1:N | Generated in `ChildCategoryPage` | **No persisted relationship**; products exist only as render output |
| Cart → cart item | 1:N | `cartItems` array held in cart state | The cart owns its item lines; no separate cart entity is persisted today |
| Cart item → product | N:1 reference by `ProductId` | `cartItems[].id` | Loose: the item is a mutable snapshot and does not embed the product; price can diverge from the catalog |
| Car listing → review | 1:N | Embedded `reviewsList[]` | Strong embedding, but no review ids/subject ids |
| Product → review | 1:N | Inline literal in `ProductPage` | **No relationship at all**; same reviews on every product |
| User → cart | 1:0..1 | None | Cart is device-local, not user-scoped |
| User → order | 1:N | None | No order model |
| Trade-in → car listing | N:0..1 | None | Route id ignored; target card hardcoded |
| Search result → child category | N:1 | Copied fields | Derived, not stored |
| Cart item → currency | N:1 | Implicit string prefix | No `CurrencyCode` field |
| Review → author user | N:0..1 | Name string only | No author id |

### 5.3 Proposed relationship rules

1. A child category always belongs to exactly one top-level category.
2. A product always belongs to exactly one child category and inherits its top-level category.
3. A cart item references a product by stable `ProductId`, but retains a price/name snapshot for display; checkout must revalidate price.
4. A review belongs to exactly one subject (`product` or `car-listing`) and records `subjectId`.
5. A review may have an `authorId` when the author is authenticated; a display name is always retained for rendering.
6. A trade-in request may reference a target car listing; if it does not, the target is unknown rather than silently defaulted.
7. A user may own at most one active cart if user-scoped carts are approved; guest carts must be defined separately.
8. An order, if ever added, references a user and stores immutable item snapshots. It must not reference live cart items.

---

## 6. Validation and normalization rules

### 6.1 Existing validation boundaries

| Boundary | Current rule | Location | Gap |
|---|---|---|---|
| Cart read from `localStorage` | Value must be an array; each item must be an object with `id` (string/number) and `name` (string); `quantity` normalized to `Math.floor` if finite and >0, else `1` | `CartContext.jsx` 16–36 | No price validation; no dedup; no upper bound; invalid items silently dropped |
| Cart write | `JSON.stringify(cartItems)` | `CartContext.jsx` 54–60 | Quota/serialization errors only logged; non-serializable `icon` silently lost |
| Cart add | Match existing by strict `id`; increment or append with quantity 1 | `CartContext.jsx` 62–82 | `1` and `"1"` do not match; no max quantity |
| Cart quantity update | If `quantity < 1`, remove; otherwise set raw value | `CartContext.jsx` 90–102 | No integer/finite check; API can store fractional/`NaN`/`Infinity` |
| Price parse | Number passthrough; falsy → 0; otherwise `parseFloat` of digits/dots | `CartContext.jsx` 111–115 | No currency awareness; `"Free"` → `NaN`; malformed separators reinterpreted |
| User read | Object with `id` (string/number), `name` (string), `email` (string) | `AuthContext.jsx` 14–27 | `avatar` unvalidated but rendered |
| User write | Valid user persisted; otherwise key removed | `AuthContext.jsx` 36–42 | No expiry or account checks |
| Auth form | HTML `required`, `type="email"`, `type="password"` | `AuthModal.jsx` 113–191 | No app-level validation; mock never rejects |
| Search input | Non-empty `trim()`; case-insensitive substring on child `name`/`description` | `Navbar.jsx` 120–158 | No products/cars; no result on initial `?q` mount |
| Category lookup | Exact key lookup; missing → “Category not found” | `CategoryPage.jsx` 13–43; `ChildCategoryPage.jsx` 216–269 | No id format check |
| Car detail lookup | `String(car.id) === id` exact match; missing → “Car not found” | `BuySellProductPage.jsx` 26–38 | `"01"`, `"1abc"` rejected; no normalization |
| Parts product lookup | Validate `type`/`childId` only; `productId` ignored | `ProductPage.jsx` 29–64 | Any product id under a valid child renders the placeholder |
| Price-range filter | `parseFloat(priceStr.replace(/[Rs,]/g, ''))`; empty min → 0, empty max → `Infinity` | `BuySellPage.jsx` 35–50 | Locale/grouping assumptions; non-numeric input yields `NaN` |
| Trade form | None | `TradePage.jsx` 6–21 | Any strings accepted; nothing submitted |
| Review rendering | Direct field access | `ProductPage.jsx` 379–416; `BuySellProductPage.jsx` 379–416 | No validation of rating range, dates, or counts |

### 6.2 Proposed normalization rules

These are recommendations for a future data layer. They are **not** current behavior.

#### Identifiers

- Accept only non-empty strings at the boundary.
- Trim surrounding whitespace and reject empty results.
- Treat ids as case-sensitive and opaque.
- Convert numeric legacy ids with `String(id)` once, at the adapter boundary.
- Keep separator restrictions out of general domain validation. If the selected storage system reserves characters (for example `/`, `\`, `:` or `%`), the storage adapter must encode, escape, or reject them at the persistence boundary. Domain validation must not assume any particular storage system's reserved characters.
- Never derive a stable id from array position.

#### Money

- Store a `currency` plus an integer amount in minor units (or the approved decimal alternative).
- Use the currency's own minor-unit exponent; do not assume two decimal places for every currency.
- Reject `NaN`, `Infinity`, negative catalog prices, and missing currency.
- Format for display only at the view layer, using one shared formatter.
- Round once according to the approved policy; do not round each intermediate addition independently.
- Do not parse localized grouping strings inside domain logic; parse once in a migration/adapter and record the result.

#### Quantities

- Require a finite integer `>= 1`.
- Define a maximum (for example 99) before enforcing it; the maximum is a product decision (D14).
- On add, merge by canonical `ProductId`; preserve the first-added price snapshot until revalidation policy is approved.
- On decrement below 1, remove the line deterministically; the same rule must apply in cart page and drawer.

#### Timestamps

- Store ISO 8601 UTC strings or an equivalent unambiguous representation.
- Do not attempt to parse relative display strings (`2 days ago`, `1 week ago`) into exact timestamps.
- Format relative/absolute display at the view layer from a stored timestamp.
- Keep `Date.now()`-style event times (for example a toast) separate from persisted domain timestamps.

#### Strings and display values

- Preserve authored display text; do not use display text as an identifier.
- Trim user-entered text at submission boundaries.
- Treat `null` and `""` differently: `null` means “explicitly absent”, `""` means “present but empty”.
- Use optional absence (`undefined`) for fields the producer did not provide, rather than inventing defaults.
- Validate email/phone with explicit rules before claiming a request was submitted.

#### Empty, missing, and invalid data

| Situation | Current behavior | Proposed behavior |
|---|---|---|
| Empty cart | `[]`; empty-state UI | `items: []`; same empty state |
| Missing `localStorage['cart']` | `[]` | `items: []` |
| Invalid cart JSON | Caught; `[]` | Discard with a recoverable warning; do not crash |
| `localStorage['cart']` is an object | `[]` | Discard; require `items` array |
| Cart item missing `id` or `name` | Item filtered out | Item rejected; optionally report count dropped |
| Cart item missing `price` | Item kept; total uses `0` or `NaN` | Item rejected or price marked unknown; totals must not become `NaN` |
| Cart item quantity `0` / negative | Normalized to `1` on read | Rejected (or removed) according to a single rule |
| Cart item quantity fractional | Floored on read; can be written fractional later | Rejected at write |
| Missing user | `null`; signed-out UI | `null`; signed-out UI |
| Invalid persisted user | `null` and key removed | `null` and key removed; log reason |
| Unknown category | “Category not found” | Same, with a typed not-found result |
| Unknown car id | “Car not found” | Same |
| Unknown child category | “Category not found” on the child page; “Product not found” on the detail page | “Child category not found” |
| Unknown parts product id | **Placeholder shown** | “Product not found”, pending D6 |
| Missing optional review author id | Not applicable (no field) | Allowed; `authorName` still required |
| Relative review date | Rendered as-is | Keep display string until a timestamp exists; do not fabricate a date |
| Trade-in submit | `alert` | Validate, persist, and return a typed result only after D10 approval |

---

## 7. Known inconsistencies

Each item is observable in the current source. “Impact” describes why it matters for a future data layer, not a request to fix it now.

### 7.1 Currency and money

| ID | Inconsistency | Evidence | Impact |
|---|---|---|---|
| I-01 | Three currency signals: `Rs`, `$`, `Rs$` | `ChildCategoryPage.jsx` 242–243; `ProductPage.jsx` 39; `CartPage.jsx` 108–120; `CartDrawer.jsx` 143–151 | A single `Money` contract cannot be inferred; D1 required |
| I-02 | Same product can cost `Rs299.99` on the card and `$399.00` on detail | Card generation 236–247 vs `ProductPage.jsx` 39; cart identity is the same `id` | Adding from card vs detail yields different totals for the same cart line; migration must choose a source of truth |
| I-03 | Car prices use Indian grouping; product prices use Western decimals | `cars.jsx` price fields vs `ChildCategoryPage.jsx` 242 | Naive numeric parsing/reformatting can change apparent value |
| I-04 | Shipping threshold is `$100` while the catalog is mostly `Rs` | `ProductPage.jsx` 324 | Policy/currency mismatch |
| I-05 | Trade-in value label is `Rs`, no currency field | `TradePage.jsx` 85–91 | No type-level currency guarantee |

### 7.2 Cart and totals

| ID | Inconsistency | Evidence | Impact |
|---|---|---|---|
| I-06 | Cart badge counts units; drawer/page labels count lines | `CartContext.jsx` 108; `CartDrawer.jsx` 59–61; `CartPage.jsx` 25 | Quantity 2 shows badge `2` but “1 items” |
| I-07 | Cart page adds 10% tax; drawer shows no tax | `CartPage.jsx` 9–12 vs `CartDrawer.jsx` 141–152 | Same cart has two different totals |
| I-08 | Both totals are labelled “Total” | Same locations | User-visible contradiction |
| I-09 | Line price is shown unmultiplied by quantity | `CartPage.jsx` 90–92; `CartDrawer.jsx` 101 | Quantity 3 still shows one unit price |
| I-10 | Decrement behavior differs: page disables at 1; drawer removes at 1 | `CartPage.jsx` 72–79; `CartDrawer.jsx` 105–112; `CartContext.jsx` 90–93 | Same control, different outcomes |
| I-11 | `toLocaleString()` in drawer vs `toFixed(2)` on page | `CartDrawer.jsx` 143; `CartPage.jsx` 108 | Locale-dependent vs fixed formatting |
| I-12 | `updateQuantity` can write values that the read normalizer would change | `CartContext.jsx` 90–102 vs 22–35 | Round-trip instability |
| I-13 | Cart read validates `id`/`name` but not `price` | `CartContext.jsx` 16–20 | Totals can become `0` or `NaN` |
| I-14 | `getPriceValue` strips all non-digit/dot characters | `CartContext.jsx` 111–115 | `"Free"` → `NaN`; locale separators can be misread |
| I-15 | Cart is device-local and not user-scoped | `CartContext.jsx` 41–56 | Login/logout does not change the cart; D11 needed |
| I-16 | No cross-tab synchronization | No `storage` event listener | Two tabs can overwrite each other |
| I-17 | Cart persists the whole product object, including a React component in memory | `CartContext.jsx` 72; `CategoryGrid.jsx` 114 | JSON silently drops `icon`; schema is not explicit |

### 7.3 Products and catalog

| ID | Inconsistency | Evidence | Impact |
|---|---|---|---|
| I-18 | Parts products are generated, not stored | `ChildCategoryPage.jsx` 225–249 | No stable catalog to migrate; ids are positional |
| I-19 | `ProductPage` ignores `productId` | `ProductPage.jsx` 27–64; `App.test.jsx` 102–112 | Any id renders the placeholder; detail contract cannot be trusted |
| I-20 | Detail page shows child category name/description, not product text | `ProductPage.jsx` 36–37 | Product identity is lost on navigation |
| I-21 | `productDescriptions` lacks keys for `bumpers`, `audio`, `screens`, `dashcams`, `tuning` | `ChildCategoryPage.jsx` 135–205 | Those categories fall back to generic `Pro Kit` names |
| I-22 | `productImages` has an orphan `lights` key; the real child id is `lighting` | `ChildCategoryPage.jsx` 51–58 vs `categories.jsx` 82 | Dead map entry; imported `lightsImg` only used there |
| I-23 | Generated card count varies 4–6 by category | Map lengths 18–132 | Catalog size is incidental |
| I-24 | Same six price/rating seeds cycle across unrelated products | `ChildCategoryPage.jsx` 207–234 | Data is not product-specific |
| I-25 | Detail `inStock`/`stockCount` exist but are not rendered | `ProductPage.jsx` 61–62 | No stock behavior or source |
| I-26 | Detail specifications/features are identical for every product | `ProductPage.jsx` 45–60 | Not a real specification model |
| I-27 | Category `icon` is a React component in data | `categories.jsx` 2–5, 22 | Not serializable across an API/JSON boundary |
| I-28 | Navbar duplicates category/child names instead of deriving from `categories` | `Navbar.jsx` 172–205 | Two sources can drift |

### 7.4 Reviews and ratings

| ID | Inconsistency | Evidence | Impact |
|---|---|---|---|
| I-29 | Parts product reviews are headphone reviews | `ProductPage.jsx` 407–443 | Review content is unrelated to the catalog |
| I-30 | Every parts product shows the same reviews and distribution | `ProductPage.jsx` 359–490 | No subject relationship |
| I-31 | Car aggregate rating is hardcoded `4.8`; review count is list length | `BuySellProductPage.jsx` 33–34 | Aggregate does not match the reviews |
| I-32 | Product aggregate `4.5 / 128` and distribution are hardcoded | `ProductPage.jsx` 40–41, 384–401 | No derivation policy |
| I-33 | Car review dates are relative strings; product review dates are absolute display strings | `cars.jsx` 33; `ProductPage.jsx` 410 | Cannot reliably convert either to timestamps |
| I-34 | Reviews have no ids, author ids, or subject ids | `cars.jsx` 30–57; `ProductPage.jsx` 407–443 | No identity, moderation, or update path |
| I-35 | “Verified” is a stored boolean with no verification source | `cars.jsx` 35; `ProductPage.jsx` 412 | Claim cannot be audited |
| I-36 | Helpful/Report buttons are inert | `ProductPage.jsx` 472–479; `BuySellProductPage.jsx` 407–414 | `helpful` count has no write model |

### 7.5 Cars and trade-in

| ID | Inconsistency | Evidence | Impact |
|---|---|---|---|
| I-37 | Used-car marketplace contains `condition: "New"` listings | `cars.jsx` 7, 65, 337 | Route says `used`; condition semantics conflict (D9) |
| I-38 | Year and mileage are display strings, not numbers | `cars.jsx` 6–8 | Sorting/filtering by year/mileage is not possible without parsing |
| I-39 | `postedTime` is a relative string | `cars.jsx` 10 | No exact listing timestamp; cannot age or sort |
| I-40 | Price sort/filter uses a local `parsePrice` with different rules than the cart | `BuySellPage.jsx` 35–38 vs `CartContext.jsx` 111–115 | Two price parsers, two behaviors |
| I-41 | `newest` sort option is a no-op | `BuySellPage.jsx` 27–32, 53–59 | UI offers behavior that does not exist |
| I-42 | `/trade/:id` ignores the id | `TradePage.jsx` 5–21, 165–213 | Wrong car can be shown for a trade link |
| I-43 | Trade card hardcodes Toyota Raize 2020 and its price | `TradePage.jsx` 165–169 | Not linked to `tradeInventory` |
| I-44 | Trade form has no required fields or validation | `TradePage.jsx` 37–152 | Empty submissions “succeed” |
| I-45 | Trade submission discards all data | `TradePage.jsx` 18–21 | No request entity, audit trail, or PII policy |
| I-46 | Seller info, “Verified Seller”, and 200+ point inspection are hardcoded claims | `BuySellProductPage.jsx` 282–325 | No seller or inspection model |
| I-47 | `/sell-car` is a static placeholder | `SellCarPage.jsx` 6–11 | No seller listing model |

### 7.6 Identity, search, and persistence

| ID | Inconsistency | Evidence | Impact |
|---|---|---|---|
| I-48 | Every mock login/signup uses id `'1'` | `AuthContext.jsx` 48–70 | All users collide |
| I-49 | Password is submitted but ignored and never stored | `AuthContext.jsx` 44–76; `AuthModal.jsx` 153–168 | No credential contract; do not persist passwords |
| I-50 | User `avatar` is unvalidated but rendered | `AuthContext.jsx` 14–19; `Navbar.jsx` 304 | Broken image possible |
| I-51 | No session expiry or token | `AuthContext.jsx` 21–42 | Persisted user can live forever |
| I-52 | Search covers child categories only | `Navbar.jsx` 135–158 | Products and cars are unsearchable |
| I-53 | Search result duplicates `id` as `childId` and `name` as `childName` | `Navbar.jsx` 146–152 | Ambiguous identity |
| I-54 | `?q=` initializes the input but does not run a search on mount | `Navbar.jsx` 14, 120–133 | Shared search URL can show no results until typing |
| I-55 | `localStorage` is accessed directly in contexts | `CartContext.jsx` 41–58; `AuthContext.jsx` 24–41 | No storage abstraction or migration point |
| I-56 | Invalid persisted data is silently discarded | `CartContext.jsx` 22–23; `AuthContext.jsx` 27 | Data loss is not reported |
| I-57 | README says “No automated tests”, but CP2 added 53 tests | `README.md` 109 | Documentation drift; not a runtime defect |

### 7.7 Severity summary

| Severity | IDs | Meaning |
|---|---|---|
| High (commerce correctness) | I-01, I-02, I-06, I-07, I-08, I-13, I-14, I-18, I-19 | Wrong money/count/identity can mislead users or corrupt a future checkout |
| Medium (data integrity) | I-03, I-09, I-10, I-12, I-15, I-17, I-20–I-24, I-29–I-34, I-37–I-46, I-48, I-49, I-52 | Contracts cannot be implemented without adapters or policy decisions |
| Low (quality/drift) | I-04, I-05, I-11, I-16, I-25–I-28, I-35, I-36, I-47, I-50, I-51, I-53–I-57 | Confusing UX, dead options, or documentation drift |

---

## 8. Compatibility and migration considerations

> No migration is performed by this checkpoint. The table describes what a future change would require.

### 8.1 Compatibility legend

| Label | Meaning |
|---|---|
| **Compatible** | A proposed contract can be introduced without changing existing records or UI behavior. |
| **Adapter** | A translation layer can map the current shape to the proposal without rewriting stored data. |
| **Migration** | Stored data or source records must be rewritten; some value may be reinterpreted. |
| **Breaking** | The proposal cannot coexist with current behavior without a product/UI decision. |

### 8.2 Per-domain analysis

| Domain | Current representation | Proposed contract compatibility | Adapter / migration need | Possible data loss or reinterpretation |
|---|---|---|---|---|
| Category | Object keyed by id; `items[]`; `icon` component | **Adapter** | Map key → `id`; `items` → `children`; drop `icon` from transport and remap in UI | None if mapping is lossless; `icon` must remain a presentation lookup |
| Child category | Embedded `{id,name,icon,image,description}` | **Adapter** | Add `categoryId`; rename `image` → `imageUrl` only with UI changes | None |
| Product summary | Generated at render; positional id; formatted `Rs` strings | **Migration / breaking** | Replace generation with stored records; assign stable ids; convert price strings to `Money` | Positional ids cannot be preserved if catalog order changes; old cart items referencing `wheels-product-0` need mapping |
| Product detail | Synthesized placeholder; ignores `productId` | **Breaking** | Requires a real catalog lookup and a not-found decision (D6) | Existing URLs that “work” with any id would start returning 404/not-found; bookmarks may break |
| Car listing | Numeric id; display strings for price/year/mileage/posted time | **Adapter / migration** | Stringify ids at boundary; parse price with an approved parser; parse year/mileage; add `postedAt` from an agreed basis | `postedTime` relative strings cannot be converted to exact timestamps without a snapshot; `0 km` on used listings may be intentional but is ambiguous; Indian grouping must not be parsed naively |
| Car review | Nested; `name`, relative `date`, `helpful` | **Migration** | Add id/subject/author/timestamp; rename fields | Relative dates cannot be reconstructed; author identity cannot be recovered from a display name |
| Product review | Inline hardcoded headphones | **Migration / breaking** | Replace with real subject-linked reviews; remove unrelated copy | Current review content is not real product feedback and should not be migrated as such |
| Cart item | Array; flat product spread; `price` string; quantity | **Migration** | Wrap in `Cart`, rename price to `unitPrice: Money`, validate price, normalize quantity at write, dedupe | Existing carts with missing/malformed prices would become invalid; first-added price snapshot may differ from catalog |
| Cart totals | Computed separately in page/drawer; tax only on page | **Breaking** | Centralize totals; decide tax/shipping/count semantics | Users may see a different total than before; changing tax changes displayed prices |
| User | `{id:'1', name, email, avatar}` in `localStorage` | **Adapter** | Rename `avatar` → `avatarUrl`; keep mock id until real auth | Current user id is not unique; a future real id cannot be derived. No password exists to migrate |
| Auth session | Inferred from `user` | **Adapter** | Add explicit status if needed | None if `user` remains the source of truth |
| Search result | Copied child fields + duplicates + `icon` | **Adapter** | Map `categoryType` → `categoryId`, `childId` → `childCategoryId`, drop duplicates/icon | None if navigation still uses child ids |
| Trade-in request | Flat strings in component state; discarded | **Migration / breaking** | Add validation, ids, timestamps, persistence, contact nesting, target listing | No current data exists to migrate; any future PII retention needs policy |
| Order | **Absent** | **Not applicable** | Build only if D12 approves | No data exists; do not infer orders from carts |
| Seller listing | **Absent** | **Not applicable** | Build only if a seller flow is approved | No data exists |

### 8.3 Persisted-data compatibility detail

#### `localStorage['cart']`

Current value: array of flat product snapshots with `quantity`.

A proposed `Cart { items: [] }` wrapper is **not compatible** with the current value without an adapter. The safest migration sequence would be:

1. Read the current array.
2. Validate and normalize each item (id, name, quantity, price).
3. Convert price strings to the approved `Money` representation once.
4. Preserve the first-seen price snapshot for existing items; do not silently reprice.
5. Write the new shape under the same key only after a backup/version marker exists.
6. Keep a recovery path for items that cannot be converted.

Risks:

- Items with missing `price` currently survive but produce `0` or `NaN` totals; a stricter contract would drop them.
- Items with quantity `0`/negative currently become `1`; a stricter contract might remove them.
- Items with non-serializable `icon` already lose it through JSON; no real loss beyond an unused field.
- `id` type mixing (`1` vs `"1"`) can create duplicate lines; canonicalization may merge them.
- The same product may carry `Rs299.99` or `$399.00` depending on how it was added; migration must not guess which is correct without D1/D5.

#### `localStorage['user']`

Current value: `{id, name, email, avatar}`.

- Renaming `avatar` → `avatarUrl` requires a read adapter; otherwise the navbar image breaks.
- Every user has id `'1'`; a future identity system cannot treat this as unique. Existing users would need re-registration or a synthetic id.
- No password or token exists, so there is nothing sensitive to migrate from this mock.
- Invalid users are already discarded on read; a migration must preserve that safety.

### 8.4 URL compatibility

| URL shape | Current behavior | Migration risk |
|---|---|---|
| `/category/:type` | Lists authored child categories | Stable if category ids do not change |
| `/category/:type/:childId` | Generates products | Stable if child ids do not change |
| `/category/:type/:childId/:productId` | Ignores `productId` | **High:** making lookup real would turn arbitrary ids into not-found |
| `/category/cars/used/:id` | Exact string match against numeric id | Medium: stringification must preserve `1`, not `01` |
| `/trade/:id` | Ignores `id` | High: fixing it changes the displayed car |
| `/buy-sell`, `/cart`, `/sell-car` | Stable | Low |

### 8.5 What must not be migrated silently

The following require explicit approval before any data work:

- Choosing PKR or USD as the store currency.
- Converting `Rs 32,20,000` or `Rs299.99` into a numeric amount.
- Treating relative review/listing dates as real timestamps.
- Reinterpreting `condition: "New"` on a `/category/cars/used/...` route.
- Repricing existing cart lines to the current catalog price.
- Assigning real user identities to the mock `'1'`.
- Creating orders from existing carts.

---

## 9. Decisions requiring approval

Each decision is a product/business choice that source code cannot answer. The checkpoint stops rather than inventing an answer.

| ID | Decision | Why it is needed | Options (non-exhaustive) | Impact if deferred |
|---|---|---|---|---|
| **D1** | Store currency and supported currencies | Source mixes `Rs`, `$`, and `Rs$` | PKR only; USD only; both with explicit currency per price; display-only locale | No `Money` contract can be finalized; cart totals remain ambiguous |
| **D2** | Tax, shipping, and total policy | Cart page adds 10% tax; drawer does not; shipping is “free” everywhere; product copy says free over `$100` | No tax; fixed 10%; tax by region; shipping always free; threshold-based | Two “totals” remain contradictory; checkout cannot be correct |
| **D3** | Cart count semantics | Badge sums quantities; labels count lines | Unit count everywhere; line count everywhere; show both | UI labels and badges remain inconsistent |
| **D4** | Money representation and rounding | Strings and floats are used today | Integer minor units; decimal major units with fixed 2dp; decimal library | Arithmetic and migration rules cannot be written |
| **D5** | Parts product identity and catalog source | Products are generated; ids are positional; detail ignores ids | Keep generated demo; introduce stored catalog with stable ids; derive ids from content | No stable product contract; URLs and carts can break on reorder |
| **D6** | Product detail not-found behavior | Any `productId` currently renders the placeholder | Strict not-found; redirect to child category; keep placeholder with a demo label | Cannot make detail data-driven without changing existing URLs |
| **D7** | Review model, aggregates, and moderation | Product and car reviews are unrelated; aggregates hardcoded; dates are strings | Shared review entity; computed aggregates; keep display-only reviews; add moderation | Review contracts remain ambiguous and untrustworthy |
| **D8** | Authentication model and user identity | Mock auth ignores passwords; every user is `'1'` | Keep mock; add real provider later; guest-only; local profiles | User-scoped data cannot be designed; id collisions persist |
| **D9** | Car listing semantics (condition, seller, status) | “New” appears in a used-car route; no seller/status fields | Define `new`/`used`; add seller/status; rename route; keep demo labels | Listing contract cannot represent real inventory |
| **D10** | Trade-in persistence, validation, and PII policy | Form discards data; no request id or retention policy | No persistence (keep demo); store requests; link to target listing; define retention | Trade-in cannot become a real flow |
| **D11** | Cart scoping and guest merge | Cart is device-local, not user-scoped | Guest-only; per-user; guest cart merges on login; prompt to merge | Login/logout behavior and sync remain undefined |
| **D12** | Order/checkout contract | No order exists; checkout disabled | No checkout; COD; provider integration; request-for-quote | Do not build; cart must not be treated as an order |
| **D13** | Timestamp storage and display | Dates are relative/absolute display strings | ISO 8601 UTC; epoch milliseconds; display-only strings | Reviews/listings cannot be sorted or aged |
| **D14** | Quantity limits and stock enforcement | Quantity has no upper bound; stock fields unused | Max per line; stock-limited; unlimited demo | Cart validation and inventory behavior remain undefined |
| **D15** | Search scope | Search covers child categories only | Child categories; products; cars; unified index | Search contract cannot promise product/car results |
| **D16** | Whether `icon` belongs in data | React components are embedded in category/search objects | Keep presentation-only mapping; store icon name string | Data cannot cross a JSON/API boundary unchanged |

### 9.1 Recommended sequencing (for discussion, not approval)

1. D1 + D4 (currency and money representation).
2. D2 + D3 (tax/shipping/count policy).
3. D5 + D6 (product identity and detail behavior).
4. D7 + D13 (review/timestamp model).
5. D8 + D11 (identity and cart scoping).
6. D9 + D10 (car listing/trade-in semantics).
7. D12 + D14 + D15 (checkout, stock, search scope).
8. D16 (serialization cleanup).

This ordering is a suggestion only; no decision is made by this document.

---

## 10. Explicit out-of-scope items

The following are **not** part of CP3 and must not be inferred as approved work:

### 10.1 Implementation work

- Creating repositories, adapters, services, hooks, or a data-access layer.
- Integrating Firebase, Supabase, any API, any database, or any cloud function.
- Adding authentication providers, OAuth, tokens, sessions, or password handling.
- Adding payment processing, checkout, orders, invoices, tax calculation, or shipping calculation.
- Converting the JavaScript app to TypeScript.
- Refactoring unrelated components or redesigning UI.
- Changing routes, copy, prices, cart behavior, or any production behavior.
- Running data migrations or rewriting `localStorage`.
- Installing additional dependencies.
- Deleting, moving, renaming, or converting assets.
- Changing tests to make proposed contracts pass.

### 10.2 Documentation work

- Defining a backend API specification.
- Defining a database schema or ORM model.
- Defining Firebase security rules.
- Defining payment-provider objects.
- Defining analytics events, SEO metadata, i18n, or accessibility contracts.
- Documenting Phase 2 or CP4 work.
- Claiming any proposed contract is already implemented or enforced.

### 10.3 Repository operations

- `git commit`
- `git push`
- `git merge`
- `git reset`
- `git stash`
- Branch switching or creation
- Tagging or releasing

### 10.4 Stop conditions honored by this checkpoint

CP3 stops and reports rather than guessing because:

- Existing data structures conflict (currency, cart totals, product identity).
- Some relationships cannot be established (product ↔ review, trade-in ↔ listing, user ↔ cart).
- Several proposed contracts require product-owner decisions (section 9).
- Satisfying some contracts would require changing existing source behavior (for example, validating `productId` or fixing the trade route).
- No dependency, database, or service integration was required or attempted.

---

## Appendix A — Evidence index

| Area | File | Relevant lines |
|---|---|---|
| Category data | `src/data/categories.jsx` | 14–131 |
| Car inventory | `src/data/cars.jsx` | 1–488 |
| Product image maps | `src/pages/ChildCategoryPage.jsx` | 18–132 |
| Product description maps | `src/pages/ChildCategoryPage.jsx` | 135–205 |
| Product seed data | `src/pages/ChildCategoryPage.jsx` | 207–214 |
| Product generation | `src/pages/ChildCategoryPage.jsx` | 225–249 |
| Product detail placeholder | `src/pages/ProductPage.jsx` | 29–64 |
| Product hardcoded price/shipping | `src/pages/ProductPage.jsx` | 204–218, 310–355 |
| Product hardcoded reviews | `src/pages/ProductPage.jsx` | 359–490 |
| Cart validation/persistence | `src/context/CartContext.jsx` | 16–60 |
| Cart mutations | `src/context/CartContext.jsx` | 62–106 |
| Cart totals | `src/context/CartContext.jsx` | 108–119 |
| Auth validation/persistence | `src/context/AuthContext.jsx` | 13–42 |
| Mock login/signup | `src/context/AuthContext.jsx` | 44–76 |
| Cart page totals | `src/pages/CartPage.jsx` | 9–12, 100–134 |
| Cart drawer totals | `src/components/CartDrawer.jsx` | 59–61, 139–174 |
| Car marketplace filter/sort | `src/pages/BuySellPage.jsx` | 35–62 |
| Car detail lookup/aggregates | `src/pages/BuySellProductPage.jsx` | 26–38 |
| Car detail reviews | `src/pages/BuySellProductPage.jsx` | 331–424 |
| Trade form | `src/pages/TradePage.jsx` | 6–21, 37–157 |
| Trade target card | `src/pages/TradePage.jsx` | 160–214 |
| Search derivation | `src/components/Navbar.jsx` | 120–158 |
| Search result rendering | `src/components/SearchResults.jsx` | 10–13, 88–190 |
| Routes | `src/App.jsx` | 31–47 |
| Product-id defect test | `src/App.test.jsx` | 102–112 |
| README limitations | `README.md` | 90–110 |

## Appendix B — Current-versus-proposed quick reference

| Concept | Current | Proposed (not enforced) |
|---|---|---|
| Category id | object key | `Category.id` |
| Child category collection | `items[]` | `children[]` |
| Product storage | generated at render | stored `ProductSummary` / `ProductDetail` |
| Product id | `${childId}-product-${i}` | stable opaque `ProductId` |
| Price | formatted strings in three currencies | `Money { currency, amountMinor }` |
| Cart storage | bare array | `Cart { items, updatedAt? }` |
| Cart item price | `price` string | `unitPrice: Money` |
| Cart count | `sum(quantity)` | explicit `unitCount` and `lineCount` |
| Tax | page-only 10% | centralized `tax` |
| User | mock `{id:'1',...}` | `User` with unique id (D8) |
| Review date | display string | `createdAt` ISO timestamp (D13) |
| Review subject | implicit/inline | `subjectType` + `subjectId` |
| Trade-in | discarded local state | `TradeInRequest` (D10) |
| Order | absent | `Order` (D12 only) |
| Search | child categories only | scope decision D15 |
| `icon` in data | React component | presentation-only mapping (D16) |

---

**End of document.**  
This file documents current behavior and proposed contracts. It does not modify, enforce, or migrate any application data.
