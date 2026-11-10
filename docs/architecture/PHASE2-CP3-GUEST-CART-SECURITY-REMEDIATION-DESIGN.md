# Phase 2 CP3 — Guest Cart Handoff Security Remediation Design

**Repository:** `C:\Users\durra\Downloads\Compressed\DealsonWheels-repo-clone-20261105-232808`  
**Branch:** `phase1/foundation`  
**HEAD:** `46d854eb42f04881e5f7c5bb33d0f15dc9379654`  
**Design Date:** 2026-11-09  
**Mode:** READ-ONLY DESIGN (no implementation yet)  
**Status:** Proposed — awaiting owner decisions

---

## 1. Executive Summary

The CP3 final sign-off audit returned **NOT APPROVED** due to four critical findings in the guest-cart handoff mechanism:

1. `cart:handoff` has no Firebase UID association — it is a per-browser key, not identity-scoped.
2. `recoverGuestCart()` is exposed via context but never called automatically.
3. Any user sharing the same browser profile can recover another user's pending guest handoff.
4. `clearGuestHandoff()` is never called — stale handoffs accumulate indefinitely.

Additionally, `login()` and `signup()` in `AuthContext.jsx` do not persist the guest cart before changing identity.

This design specifies the complete remediation, including an honest assessment of what browser `localStorage` alone can and cannot guarantee regarding shared-browser security.

---

## 2. Owner-Approved Requirements (Preserved, Unchanged)

| Requirement | Source |
|---|---|
| Lazy Firebase Anonymous Authentication — no anonymous session while browsing; create one on first cart addition | Owner-approved D8 |
| Firebase UID is the permanent customer identity | Owner-approved D8 |
| Guest carts survive reloads and interrupted authentication | Owner-approved |
| Guest-cart data must remain recoverable until migration to the authenticated customer's cart has completed and been verified | Owner-approved |
| Different users must never see one another's carts | Owner-approved |
| Customer logout clears the visible cart but preserves that customer's persisted cart | Owner-approved |
| Do not implement cart merging in this checkpoint | Owner-approved |

---

## 3. Identity Lifecycle — State Transition Model

### 3.1 States

| State | Description |
|---|---|
| **S0 — Browsing (no auth)** | No Firebase user. No anonymous session. Cart exists only in React state + `localStorage['cart']`. |
| **S1 — Anonymous Pending** | User added item to cart. `prepareGuestHandoff()` called. `signInAnonymously()` in flight. |
| **S2 — Anonymous Authenticated** | Firebase anonymous UID exists. Cart may be bound to anonymous UID in handoff record. |
| **S3 — Anonymous Restored** | Page reloaded. `onAuthStateChanged` restored anonymous user. Cart persisted in `cart` key. Handoff still present. |
| **S4 — Customer Signing In** | Existing customer email/password login in flight. Guest handoff must be prepared before identity change. |
| **S5 — Customer Registered** | New customer email/password signup in flight. Guest handoff must be prepared before identity change. |
| **S6 — Customer Authenticated** | Firebase UID bound to customer. Guest cart (if any) awaits migration (future checkpoint). |
| **S7 — Auth Interrupted** | Authentication failed or was interrupted. Guest handoff remains intact on disk. |
| **S8 — Signed Out** | User logged out. Visible cart cleared in React state. Persisted cart in `cart` key preserved. Handoff preserved. |
| **S9 — Different User** | Another person signs in on same browser profile. Handoff from previous identity must NOT be exposed. |

### 3.2 Transition Table

| Transition | Trigger | Storage Keys Before | Storage Keys After | Firebase UID | Recovery Allowed? | Handoff Modified? | Failure Behavior |
|---|---|---|---|---|---|---|---|
| **S0 → S1** | First `addToCart()` | `cart` | `cart` + `cart:handoff` | None | No (no UID yet) | Yes — write handoff | If `signInAnonymously()` not yet called, cart persists in both keys |
| **S1 → S2** | `signInAnonymously()` succeeds | `cart` + `cart:handoff` | `cart` + `cart:handoff` | Anonymous UID | Yes — bind handoff to UID | Yes — add `firebaseUid` to handoff record | Cart remains in both keys regardless of outcome |
| **S1 → S7** | `signInAnonymously()` fails | `cart` + `cart:handoff` | `cart` + `cart:handoff` | None | Yes — handoff intact | No | Cart fully preserved. User can retry or proceed as guest |
| **S2 → S3** | Page reload (anonymous) | `cart` + `cart:handoff` | `cart` + `cart:handoff` | Anonymous UID restored by Firebase | Yes | No | Cart auto-restored from `cart` key via `useState(loadCartItems)` |
| **S0/S2 → S4** | Customer `login(email, password)` | `cart` [+ `cart:handoff`] | `cart` + `cart:handoff` | Customer UID (after success) | Yes — verify before loading | Yes — prepare handoff before `signInWithEmailAndPassword` | If login fails, guest handoff intact. Cart in `cart` key unaffected |
| **S0/S2 → S5** | Customer `signup(email, password, name)` | `cart` [+ `cart:handoff`] | `cart` + `cart:handoff` | Customer UID (after success) | Yes — verify before loading | Yes — prepare handoff before `createUserWithEmailAndPassword` | If signup fails, guest handoff intact. Cart in `cart` key unaffected |
| **S4/S5 → S6** | Auth succeeds | `cart` + `cart:handoff` | `cart` + `cart:handoff` | Customer UID | Yes — after migration verification (future checkpoint) | No — handoff NOT cleared on auth success | Cart merge/migration is future work |
| **S2/S6 → S7** | Auth interrupted | `cart` + `cart:handoff` | `cart` + `cart:handoff` | Previous UID (if any) | Yes — handoff intact | No | Cart fully preserved |
| **S6 → S8** | `logout()` | `cart` | `cart` | None | No | No | Visible cart cleared in React state. `cart` key preserved for that customer |
| **S6/S8 → S9** | Different user signs in | `cart` + `cart:handoff` | `cart` + `cart:handoff` | New customer UID | **NO** — previous handoff must not be exposed | No — previous handoff remains but is not accessible to new user | New user starts fresh. Previous handoff remains orphaned |

### 3.3 Critical Rule: No Automatic Recovery of Unclaimed Handoff

**Never** automatically recover `cart:handoff` into a signed-in customer's cart. The handoff from a previous guest session (or a different user) must remain orphaned until the future cart-migration checkpoint explicitly verifies and merges it.

**Recovery is allowed only when:**
1. Firebase authentication state has been restored (anonymous or customer), AND
2. The current identity matches the identity recorded in the handoff (when UID binding exists), AND
3. Recovery is explicitly requested (not automatic on mount).

---

## 4. Storage Ownership Model

### 4.1 Storage Keys

| Key | Owner | Contents | Identity Bound? | Cleared On |
|---|---|---|---|---|
| `localStorage['cart']` | Active cart | Current cart items array | No (per-browser) | Never cleared by auth. Cleared only by `clearCart()` (writes `[]`) |
| `localStorage['user']` | Auth adapter | Persisted user profile (transitional) | No | `authStorage.clearUser()` / `firebaseAuthProvider.clearUser()` |
| `localStorage['cart:handoff']` | Handoff adapter | Guest cart snapshot + metadata | **Must be** (after S2) | **Never** — only cleared after verified migration (future checkpoint) |

### 4.2 Handoff Record Schema (Proposed)

```json
{
  "items": [ /* cart items */ ],
  "timestamp": 1794200000000,
  "source": "guest",
  "firebaseUid": null | "<uid>",       // Set after S2 (anonymous) or S6 (customer)
  "identityType": "anonymous" | "customer" | null,
  "recovered": false,                   // Set to true after successful recovery
  "version": 1
}
```

**Before S1/S2:** `firebaseUid: null`, `identityType: null` — unclaimed handoff.
**After S2:** `firebaseUid: "<anon-uid>"`, `identityType: "anonymous"` — bound to anonymous identity.
**After S4/S5 → S6:** `firebaseUid: "<customer-uid>"`, `identityType: "customer"` — bound to customer identity.

### 4.3 Identity Isolation Boundaries

| Boundary | Protected? | Mechanism |
|---|---|---|
| Between Firebase anonymous UIDs | Yes | `firebaseUid` in handoff record; recovery checks UID match |
| Between Firebase customer UIDs | Yes | `firebaseUid` in handoff record; recovery checks UID match |
| Between different people sharing one browser profile **before authentication** | **No** | `localStorage` is per-browser-profile, not per-human. No mechanism can distinguish two unauthenticated humans on the same profile. |
| Between authenticated customer and previous guest on same browser | Yes | Handoff has `firebaseUid: null` (unclaimed) or previous UID. Recovery must not auto-load unclaimed handoff into a different customer's cart. |

---

## 5. Threat Model and Limitations (Honest Assessment)

### 5.1 What localStorage CANNOT Guarantee

**Critical limitation:** Browser `localStorage` is scoped by **origin + browser profile**, not by human identity. If two people share the same browser profile (same OS user account, same browser, same origin), they share the same `localStorage`. There is **no technical mechanism** within client-side JavaScript that can distinguish Person A from Person B before either authenticates.

**Consequences:**
- A pending handoff created before Firebase returns an anonymous UID cannot be attributed to a specific human.
- If Person A adds items to cart (creating `cart:handoff`), closes the browser, and Person B uses the same browser profile, Person B's `recoverGuestCart()` call could theoretically return Person A's items — **unless** recovery is gated on UID matching and the handoff is unclaimed (`firebaseUid: null`).

**Required design response:**
- Unclaimed handoffs (`firebaseUid: null`) must **never** be automatically recovered into any authenticated session.
- Recovery must require an explicit user action AND UID verification.
- After Firebase assigns an anonymous UID (S2), the handoff must be updated with that UID so it is bound to that specific Firebase identity.

### 5.2 Protection Between Firebase Identities — ACHIEVABLE

Once Firebase Authentication assigns a UID (anonymous or customer), the handoff record can be bound to that UID. Recovery checks:
1. Is there a current Firebase user?
2. Does the handoff's `firebaseUid` match the current user's UID?
3. If yes → recovery allowed. If no → recovery denied.

This satisfies the requirement that "different users must never see one another's carts" **at the Firebase identity level**.

### 5.3 Protection Between Humans Sharing One Browser Profile — NOT ACHIEVABLE client-side

This requires owner decision. Options:

| Option | Description | Trade-off |
|---|---|---|
| **A — Accept limitation** | Document that shared-browser-profile isolation before authentication is not guaranteed. First person to add items "owns" the handoff until UID binding. | Simple. Honest limitation. |
| **B — Require authentication before any cart persistence** | No cart data written to localStorage until user authenticates. Breaks lazy anonymous auth requirement. | Violates owner-approved lazy auth. |
| **C — Session-scoped in-memory only** | Cart exists only in memory until auth. Lost on reload. | Violates "survive reloads" requirement. |
| **D — Owner approval of limitation** | Document the shared-browser limitation explicitly and obtain owner sign-off. | Recommended. |

**Recommendation:** Option D — Document the limitation and obtain owner approval. The client-side code cannot solve this without server-side session binding.

---

## 6. Safe Recovery Algorithm

### 6.1 Recovery Preconditions

Recovery of guest cart data is permitted **only** when ALL of the following are true:

1. Firebase Authentication state has been restored (not `null`, not `isLoading`).
2. The current Firebase user has a UID (anonymous or customer).
3. The handoff record exists and is valid JSON.
4. The handoff's `firebaseUid` matches the current user's UID (or handoff is unclaimed AND the current user is anonymous AND recovery is explicitly requested).
5. The customer's current cart (`cart` key) is empty OR the user explicitly chooses to merge (merge logic is future work — for now, recovery only when cart is empty).

### 6.2 Recovery Algorithm (Pseudocode)

```
function attemptGuestRecovery(currentUser):
    if currentUser is null:
        return null  // No user, no recovery
    
    handoff = readCartHandoff()
    if handoff is null or invalid:
        return null  // Nothing to recover
    
    // Unclaimed handoff (pre-UID) — never auto-recover into any authenticated session
    if handoff.firebaseUid is null:
        return null  // Orphaned. Awaits future migration checkpoint.
    
    // UID-bound handoff — verify identity match
    if handoff.firebaseUid !== currentUser.uid:
        return null  // Different user's handoff. Deny access.
    
    // Identity matches. Recover if current cart is empty.
    currentCart = readCart()
    if currentCart is not empty:
        return null  // Don't overwrite existing cart. Future merge logic handles this.
    
    return handoff.items  // Safe to recover
```

### 6.3 Recovery Invocation Points

Recovery must **not** be automatic on `CartProvider` mount. It must be invoked explicitly:

| Invocation Point | Condition | Rationale |
|---|---|---|
| `CartProvider` mount | Never automatic | Prevents exposing unclaimed handoff to wrong user |
| After `signInAnonymously()` succeeds | Explicit call by page/component | UID now exists; safe to check match |
| After `login()`/`signup()` succeeds | Explicit call by page/component | UID now exists; safe to check match |
| User-initiated "Restore my cart" | Explicit user action | User consents to recovery |
| Page reload with existing anonymous UID | Explicit call after `onAuthStateChanged` | UID restored; handoff may match |

### 6.4 Failure Behavior

| Failure | Behavior |
|---|---|
| `signInAnonymously()` fails | Handoff remains on disk (`firebaseUid: null`). Cart in `cart` key intact. User can retry. |
| `login()` fails | Handoff remains on disk. Cart in `cart` key intact. Error returned to UI. |
| `signup()` fails | Handoff remains on disk. Cart in `cart` key intact. Error returned to UI. |
| Recovery called but UID mismatch | Returns `null`. No data exposed. No data modified. |
| Recovery called but current cart non-empty | Returns `null`. No overwrite. Future merge logic handles. |
| `clearGuestHandoff()` called prematurely | **Must not happen.** Guards in code review. |

### 6.5 Idempotency

Recovery is idempotent: calling `recoverGuestCart()` multiple times returns the same result without modifying the handoff record. The handoff is **not** cleared by recovery (per owner requirement — data remains until verified migration).

---

## 7. Login/Signup Integration Requirements

### 7.1 Current State (Vulnerable)

**Source:** `src/context/AuthContext.jsx`, lines 48-70

```js
const login = async (email, password) => {
    const user = await authProvider.login(email, password);
    // No guest cart preparation before identity change
    ...
};

const signup = async (name, email, password) => {
    const user = await authProvider.signup(email, password, name);
    // No guest cart preparation before identity change
    ...
};
```

**Vulnerability:** If a user has items in their guest cart (in `cart` key) and calls `login()` or `signup()` directly without going through `addToCart()`, the cart is **not** prepared to `cart:handoff` before the identity change. If authentication fails, the cart is still in `cart` key (not lost), but there is no explicit handoff record for recovery.

### 7.2 Required Changes

**`login(email, password)` must:**
1. Call `prepareGuestHandoff(currentCartItems)` **before** `authProvider.login()`.
2. If login succeeds, do NOT clear `cart:handoff` (awaits migration).
3. If login fails, handoff remains intact.

**`signup(name, email, password)` must:**
1. Call `prepareGuestHandoff(currentCartItems)` **before** `authProvider.signup()`.
2. If signup succeeds, do NOT clear `cart:handoff` (awaits migration).
3. If signup fails, handoff remains intact.

### 7.3 Why `addToCart()` Already Does This Correctly

**Source:** `src/context/CartContext.jsx`, lines 47-79

`addToCart()` persists new items to both `cart` and `cart:handoff` inside the `setCartItems` updater, **before** `signInAnonymously()` is called. This is the correct ordering and should be preserved.

---

## 8. Handoff Cleanup Contract (Future Migration Checkpoint)

### 8.1 When `clearGuestHandoff()` May Be Called

`clearGuestHandoff()` must **only** be called after ALL of the following are verified true:

1. Cart migration has **successfully completed** (guest items merged into customer's cart).
2. The resulting customer cart has been **verified** (items, quantities, prices match expectations).
3. The system has **confirmed** that guest data is no longer needed (user acknowledged migration, or migration completed without errors).

### 8.2 When `clearGuestHandoff()` Must NOT Be Called

| Scenario | Reason |
|---|---|
| After `signInAnonymously()` succeeds | Handoff still needed for recovery if migration hasn't happened |
| After `login()`/`signup()` succeeds | Handoff still needed for recovery if migration hasn't happened |
| On `logout()` | Customer's cart preserved; handoff may still be needed |
| On page reload | Handoff must persist across reloads |
| On auth state change | Handoff is independent of auth state |
| Automatically after any time threshold | No time-based expiry without owner approval |

### 8.3 Cleanup Contract for Future Checkpoint

```
Future cart migration checkpoint must:
1. Read handoff from cart:handoff
2. Verify handoff.firebaseUid matches current user UID
3. Perform merge (guest items → customer cart) — OUT OF SCOPE for this checkpoint
4. Verify merged cart correctness
5. Call clearGuestHandoff() ONLY after steps 1-4 succeed
6. If any step fails, do NOT call clearGuestHandoff()
```

---

## 9. Storage Key Summary

| Key | Read By | Written By | Cleared By | Identity Bound? |
|---|---|---|---|---|
| `cart` | `loadCartItems()` | `saveCartItems()` (via `useEffect` + `addToCart` updater) | `clearCart()` (writes `[]`) | No |
| `cart:handoff` | `recoverGuestHandoff()` | `prepareGuestHandoff()` | **Never** (future migration only) | Yes (after UID assigned) |
| `user` | `authStorage.loadUser()` | `authStorage.saveUser()` / Firebase `onAuthStateChanged` | `authStorage.clearUser()` | No |

---

## 10. Required Tests for Each Critical Scenario

| Test | Scenario | Expected Result |
|---|---|---|
| T1 | `prepareGuestHandoff()` writes record without `firebaseUid` (pre-auth) | Record has `firebaseUid: null`, `identityType: null` |
| T2 | `prepareGuestHandoff()` called after anonymous UID assigned | Record updated with `firebaseUid`, `identityType: 'anonymous'` |
| T3 | `recoverGuestCart()` called with no current user | Returns `null` |
| T4 | `recoverGuestCart()` called with UID mismatch | Returns `null`. No data exposed. |
| T5 | `recoverGuestCart()` called with matching UID and empty current cart | Returns handoff items |
| T6 | `recoverGuestCart()` called with matching UID and non-empty current cart | Returns `null` (no overwrite) |
| T7 | `clearGuestHandoff()` never called after `signInAnonymously()` success | Handoff record still present after auth |
| T8 | `clearGuestHandoff()` never called after `login()`/`signup()` success | Handoff record still present after auth |
| T9 | `login()` calls `prepareGuestHandoff()` before `signInWithEmailAndPassword` | Handoff written before auth call |
| T10 | `signup()` calls `prepareGuestHandoff()` before `createUserWithEmailAndPassword` | Handoff written before auth call |
| T11 | `signInAnonymously()` fails → handoff remains intact | Handoff still readable after failure |
| T12 | `login()` fails → handoff remains intact | Handoff still readable after failure |
| T13 | `recoverGuestCart()` called twice → same result (idempotent) | Both calls return same items. Handoff not cleared. |
| T14 | Unclaimed handoff (`firebaseUid: null`) → `recoverGuestCart()` returns `null` | Never auto-recover unclaimed handoff |
| T15 | `logout()` does not clear `cart:handoff` | Handoff persists after logout |

---

## 11. Owner Decisions Still Required

| Decision | Options | Recommendation |
|---|---|---|
| **D1: Shared-browser-profile limitation** | A) Accept as documented limitation. B) Require auth before cart persistence (breaks lazy auth). C) Server-side session binding (out of scope). | **A** — Document honestly. Obtain sign-off. |
| **D2: Handoff UID binding timing** | A) Bind immediately after `signInAnonymously()` resolves. B) Bind on next cart operation. | **A** — Bind as soon as UID is available. |
| **D3: Recovery UI trigger** | A) Explicit "Restore cart" button in UI. B) Automatic on mount with UID match. C) Both. | **A** — Explicit user action is safest. |
| **D4: `clearGuestHandoff()` guardrails** | A) Code review enforcement only. B) Runtime flag preventing premature calls. C) Both. | **C** — Both for defense in depth. |
| **D5: Cart merge policy** | Deferred to future checkpoint. No decision needed now. | N/A |

---

## 12. Recommendation

### Are the owner-approved requirements technically achievable?

| Requirement | Achievable? | Notes |
|---|---|---|
| Lazy anonymous auth on first cart addition | **Yes** | Already implemented in `addToCart()` |
| Firebase UID as permanent identity | **Yes** | Firebase provides UID; must be bound to handoff |
| Guest carts survive reloads | **Yes** | `localStorage['cart']` persists |
| Guest carts survive interrupted auth | **Yes** | Handoff written before auth call |
| Recoverable until verified migration | **Yes** | `clearGuestHandoff()` never called prematurely |
| Different users never see each other's carts | **Partially** | Achievable at Firebase UID level. **Not achievable** between humans sharing one browser profile before authentication (client-side limitation). |
| Logout clears visible cart, preserves persisted cart | **Yes** | `clearCart()` writes `[]` to React state; `cart` key preserved |
| No cart merging | **Yes** | Out of scope |

### Overall Recommendation

**Proceed with remediation**, conditioned on owner approval of **D1** (shared-browser limitation). The technical gaps are addressable:

1. Bind `firebaseUid` to handoff record after anonymous auth succeeds.
2. Gate `recoverGuestCart()` on UID match and explicit invocation.
3. Call `prepareGuestHandoff()` in `login()` and `signup()` before identity change.
4. Never call `clearGuestHandoff()` until future migration checkpoint verifies success.

The shared-browser-profile limitation (two humans, one browser profile, no auth) is a **client-side architectural boundary** that cannot be resolved without server-side session binding or requiring authentication before cart persistence. This must be documented and accepted by the owner.

---

## 13. Files That Would Require Changes (For Reference Only)

| File | Change |
|---|---|
| `src/data/cartStorage.js` | Add `firebaseUid` to handoff record; add UID-bound read logic |
| `src/context/CartContext.jsx` | Gate `recoverGuestCart()` on UID match; invoke at appropriate points |
| `src/context/AuthContext.jsx` | Call `prepareGuestHandoff()` in `login()` and `signup()` before auth |
| `src/context/AuthContext.test.jsx` | Add tests for UID-bound recovery, mismatch denial, login/signup handoff prep |
| `src/context/CartContext.test.jsx` | Add tests for identity isolation, idempotency, no-premature-clear |

**No changes made in this design phase.** Stopping for owner decisions.
