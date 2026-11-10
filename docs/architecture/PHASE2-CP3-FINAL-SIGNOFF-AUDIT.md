# Phase 2 CP3 — Final Security & Recovery Sign-off Audit

**Repository:** `C:\Users\durra\Downloads\Compressed\DealsonWheels-repo-clone-20261105-232808`  
**Branch:** `phase1/foundation`  
**HEAD:** `46d854eb42f04881e5f7c5bb33d0f15dc9379654`  
**Audit Date:** 2026-11-09  
**Audit Mode:** READ-ONLY (no source code, test, configuration, documentation, or Git state modified)  
**Original Verdict:** NOT APPROVED — Critical identity-isolation gaps in guest-cart handoff  
**Remediation Status (2026-11-10):** APPROVED — see §12 (re-audit addendum)

---

## 1. Executive Summary

CP3 gap closure has implemented durable guest-cart handoff and password reset functionality. All 130 tests pass, the production build succeeds, and lint is at baseline (33 errors, 2 warnings). However, **critical security flaws exist in the guest-cart handoff mechanism** that prevent safe approval for production use, particularly in shared-browser / multi-user scenarios. These are NOT test or lint issues — they are architectural gaps in the implementation itself.

---

## 2. Git Status & Inventory

| Check | Result |
|---|---|
| Branch | `phase1/foundation` |
| HEAD | `46d854eb42f04881e5f7c5bb33d0f15dc9379654` |
| Local == Remote | ✅ Equal (verified) |
| Commit/push performed | ❌ No (per owner instructions) |

### Modified tracked files (19)

| File | Phase |
|---|---|
| `package.json` | CP2 |
| `package-lock.json` | CP2 |
| `src/context/AuthContext.jsx` | CP2 + CP3 |
| `src/context/AuthContext.test.jsx` | CP2 + CP3 |
| `src/context/CartContext.jsx` | CP2 + CP3 |
| `src/context/CartContext.test.jsx` | CP2 + CP3 |
| `src/data/authStorage.js` | CP2 |
| `src/data/authStorage.test.js` | CP2 + CP3 |
| `src/data/cartStorage.js` | CP2 + CP3 |
| `src/data/cartStorage.test.js` | CP2 + CP3 |
| `src/data/catalogRepository.js` | CP2 |
| `src/data/vehicleRepository.js` | CP2 |
| `src/test/renderApp.jsx` | CP2 |
| `src/test/setup.js` | CP3 (deleted) |
| `vitest.config.js` | CP2 |
| `src/App.test.jsx` | CP3 |
| `src/components/PageTransition.test.jsx` | CP3 |
| `package.json` / `package-lock.json` | CP2 |

### Deleted tracked files (1)

| File | Phase |
|---|---|
| `src/test/setup.js` | CP3 |

### Untracked new files (18)

| File | Phase |
|---|---|
| `docs/architecture/PHASE2-CP2-ADAPTER-ARCHITECTURE.md` | CP2 |
| `docs/architecture/PHASE2-CP2-INDEPENDENT-REVIEW.md` | CP2 |
| `docs/architecture/PHASE2-FIREBASE-READINESS.md` | CP2 |
| `docs/architecture/PHASE2-CP3-ARCHITECTURE-READINESS-REPORT.md` | CP3 |
| `docs/architecture/PHASE2-CP3-AUTH-IMPLEMENTATION-PLAN.md` | CP3 |
| `docs/architecture/PHASE2-CP3-AUTH-INDEPENDENT-REVIEW.md` | CP3 |
| `docs/architecture/PHASE2-CP3-IMPLEMENTATION-EVIDENCE-REPORT.md` | CP3 |
| `docs/architecture/PHASE2-CP4-FIREBASE-PROJECT-SETUP.md` | CP4 |
| `src/data/compose.js` | CP2 |
| `src/data/compose.test.js` | CP2 |
| `src/data/providers/auth/firebaseAuthProvider.js` | CP2 + CP3 |
| `src/data/providers/auth/localStorageProvider.js` | CP2 |
| `src/data/providers/cart/localStorageProvider.js` | CP2 |
| `src/data/providers/catalog/staticProvider.js` | CP2 |
| `src/data/providers/vehicle/staticProvider.js` | CP2 |
| `src/firebase/config.js` | CP2 |

### Git-ignored file

| File | Ignored By |
|---|---|
| `.env.local` | `.gitignore:28:.env.*` |

---

## 3. Guest-Cart Identity Isolation — Critical Findings

### 3.1 Is the handoff associated with the correct anonymous Firebase UID?

**NO — Critical Finding**

**Source:** `src/data/cartStorage.js`, lines 83-95 (`prepareGuestHandoff`)

```js
export const prepareGuestHandoff = (items) => {
    try {
        const handoff = {
            items,
            timestamp: Date.now(),
            source: 'guest',
        };
        localStorage.setItem(GUEST_HANDOFF_KEY, JSON.stringify(handoff));
        return true;
    } catch {
        return false;
    }
};
```

The handoff record contains `items`, `timestamp`, and `source: 'guest'` — **no Firebase UID**. Even after `signInAnonymously()` succeeds and Firebase assigns a cryptographic UID, the handoff record is never updated with that UID. The `cart:handoff` key is per-browser, not per-user.

**Impact:** Once a Firebase anonymous UID exists, there is no way to associate the handoff record with that specific identity. The handoff cannot be scoped to the correct user.

### 3.2 What happens if the browser closes after writing `cart:handoff` but before `signInAnonymously()` succeeds?

**The data persists but is not automatically recovered.**

**Source:** `src/context/CartContext.jsx`, lines 20-22 (`useState(loadCartItems)`) and lines 130-132 (`recoverGuestCart`)

On reload:
- `loadCartItems()` reads from `cart` key only (line 22)
- `recoverGuestCart()` exists (line 130) but is **never called automatically** on mount or after authentication restoration
- The cart will appear empty unless `recoverGuestCart()` is explicitly invoked by a component

**Impact:** The handoff record is durable (survives browser close) but useless without explicit recovery logic. A user who closes the browser mid-sign-in loses their cart on return unless they manually trigger recovery (which no UI currently does).

### 3.3 Can a different person using the same browser recover the previous person's pending guest cart?

**YES — Critical Finding**

**Source:** `src/data/cartStorage.js`, line 39 (`GUEST_HANDOFF_KEY = 'cart:handoff'`)

The `cart:handoff` key is a per-browser localStorage key with no UID association, no user scoping, and no identity isolation. If Person A adds items to their cart and `prepareGuestHandoff()` writes to `cart:handoff`, then Person B uses the same browser and calls `recoverGuestCart()`, Person B receives Person A's cart items.

**Impact:** Cross-user cart leakage on shared devices. This violates basic data isolation requirements.

### 3.4 Can a signed-in customer accidentally load another user's guest cart?

**YES — Critical Finding**

Same root cause as 3.3. `recoverGuestCart()` (line 130-132 of `CartContext.jsx`) reads `cart:handoff` which is per-browser. A signed-in customer who invokes `recoverGuestCart()` would receive whatever guest cart was last written to that key by any previous user of the browser.

### 3.5 Can a guest cart overwrite or become confused with a previously signed-in customer's cart?

**Partially — Medium Finding**

In the normal `addToCart()` flow (lines 47-79 of `CartContext.jsx`): No, because `cart` and `cart:handoff` are separate keys, and `loadCartItems()` only reads from `cart`.

However, if `recoverGuestCart()` is called and its result is used to overwrite the current cart (which no code currently does, but the function enables it), then a guest cart could overwrite a signed-in customer's cart. The function exposes this capability without any guardrails.

### 3.6 Does logout clear the visible cart without deleting the customer's persisted cart?

**Mixed — Low Finding**

**Source:** `src/context/AuthContext.jsx`, lines 72-75 (`logout`)

```js
const logout = async () => {
    await authProvider.logout();
    setUser(null);
};
```

`logout()` calls `authProvider.logout()` → `signOut(auth)` → `clearUser()` (removes `user` key). It does NOT touch `cart` or `cart:handoff`. The CartContext `clearCart()` (line 101-104) sets `cartItems` to `[]` which triggers `useEffect` → `saveCartItems([])` → writes `[]` to `cart`. But `logout()` does NOT call `clearCart()`.

**Impact:** After logout, the `cart` key still contains the previous cart data, and `cart:handoff` also persists. The visible cart state depends on component lifecycle. This is not necessarily a bug (cart persistence across logout may be intended), but it means the cart is not cleared on logout.

### 3.7 Can a stale handoff be recovered after the user has changed identity?

**YES — Critical Finding**

**Source:** `src/data/cartStorage.js`, lines 126-132 (`clearGuestHandoff`)

```js
export const clearGuestHandoff = () => {
    try {
        localStorage.removeItem(GUEST_HANDOFF_KEY);
    } catch {
        // Ignore storage errors
    }
};
```

`clearGuestHandoff()` is **exported but never called anywhere in the codebase**. A grep of the entire `src/` directory confirms zero invocations of `clearGuestHandoff`. The handoff record persists indefinitely until manually cleared (which never happens).

**Impact:** A stale handoff from a previous session or a different user can be recovered at any time via `recoverGuestCart()`, even after the current user has signed in with a completely different identity.

### 3.8 Under what exact conditions is `clearGuestHandoff()` called?

**NEVER — Critical Finding**

`clearGuestHandoff()` is exported from `src/data/cartStorage.js` (line 126) but is **not imported or invoked anywhere** in the application code. It is not called:
- After cart migration (migration not implemented)
- On logout
- On authentication state change
- On page unload
- Anywhere

**Impact:** Stale handoff records accumulate forever. There is no safe lifecycle for clearing them. The function exists but is dead code — it cannot delete data prematurely (because it's never called), but it also cannot clean up stale data (because it's never called).

---

## 4. Handoff Recovery and Ordering Analysis

### 4.1 Cart is durably written before anonymous authentication begins

**YES — Verified**

**Source:** `src/context/CartContext.jsx`, lines 47-79 (`addToCart`)

```js
setCartItems(prevItems => {
    const newItems = ...;
    saveCartItems(newItems);        // writes to cart key
    prepareGuestHandoff(newItems);  // writes to cart:handoff key
    return newItems;
});

if (!authProvider.loadUser() && !authProvider.getCurrentUser()) {
    authProvider.signInAnonymously();  // async call — cart already on disk
}
```

Both `saveCartItems()` and `prepareGuestHandoff()` are called synchronously inside the React state updater, **before** `signInAnonymously()` is invoked. Since both are synchronous `localStorage.setItem()` calls, the cart is guaranteed to be on disk before any asynchronous authentication call begins.

**Assessment:** Ordering is correct and deterministic for the `addToCart()` flow.

### 4.2 The handoff survives reloads and interrupted authentication

**YES — Verified**

**Source:** `src/data/cartStorage.js`, lines 83-95 (`prepareGuestHandoff`) and lines 107-117 (`recoverGuestHandoff`)

`localStorage.setItem()` is synchronous and persists across page reloads and browser restarts. The handoff record is never cleared by `recoverGuestHandoff()` (read-only) or by any auth state change. If `signInAnonymously()` fails, the handoff record remains intact.

**Assessment:** Durability is correct. Data survives reloads, tab closure, and interrupted authentication.

### 4.3 Recovery is invoked at the appropriate point after authentication restoration

**NO — Critical Finding**

`recoverGuestCart()` is exposed via CartContext (line 149) but is **never called automatically**:
- Not called on `CartProvider` mount
- Not called after `signInAnonymously()` resolves
- Not called after `login()` or `signup()` succeeds
- Not called after `linkWithCredential()` completes
- Not called in any page component or route handler

**Source:** `src/context/CartContext.jsx`, lines 130-132 — `recoverGuestCart` returns `recoverGuestHandoff()` but nothing invokes it.

**Impact:** The handoff record is written but never automatically recovered. Users must manually invoke `recoverGuestCart()` (which no UI does) to retrieve their cart after an interrupted session.

### 4.4 Failed authentication does not silently discard cart data

**YES — Verified**

**Source:** `src/context/CartContext.jsx`, lines 47-79

Cart is persisted to both `cart` and `cart:handoff` keys inside the `setCartItems` updater, before `signInAnonymously()` is called. If `signInAnonymously()` rejects, the cart data remains on disk.

**Test verification:** `src/context/CartContext.test.jsx` line 170-188 ("preserves guest cart when authentication fails") confirms this behavior.

**Assessment:** Correct for the `addToCart()` flow. However, `login()` and `signup()` in `AuthContext.jsx` (lines 48-70) do NOT call `prepareGuestCart()` or `prepareGuestHandoff()` before authenticating. If a user has a guest cart and then calls `login()` directly (without going through `addToCart()`), the cart is NOT persisted before authentication.

### 4.5 Handoff clearing is safe and does not happen prematurely

**YES (trivially) — but non-functional**

`clearGuestHandoff()` is never called (see 3.8), so it cannot delete data prematurely. However, it also cannot clean up stale data after a verified migration (which doesn't exist yet).

### 4.6 Race conditions and stale state

**Race condition in `addToCart()`:** `saveCartItems()` and `prepareGuestHandoff()` are called synchronously inside the React `setCartItems` updater function. While this works for synchronous localStorage operations, it's an unusual pattern — side effects inside state updaters. If `saveCartItems` were ever made async, this would break. Currently safe but fragile.

**Duplicate recovery risk:** `recoverGuestCart()` can be called multiple times and returns the same stale data each time (since `clearGuestHandoff()` is never called). There's no deduplication or "consume once" semantics.

**Stale React state:** `cartItems` state is initialized from `loadCartItems()` on mount. If a handoff record exists but `recoverGuestCart()` is not called, the cart starts empty even though recoverable data exists on disk.

---

## 5. Password Reset Verification

### 5.1 `sendPasswordResetEmail()` is called with the supplied email

**YES — Verified**

**Source:** `src/data/providers/auth/firebaseAuthProvider.js`, lines 208-210

```js
async resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
},
```

**Test:** `src/context/AuthContext.test.jsx`, line 233-247 ("calls sendPasswordResetEmail with the correct email") — asserts `sendResetSpy.toHaveBeenCalledWith(expect.anything(), resetEmail)`.

### 5.2 Success and failure responses do not reveal whether an account exists

**YES — Verified**

**Source:** `src/context/AuthContext.jsx`, lines 84-101

```js
const resetPassword = async (email) => {
    setIsResettingPassword(true);
    setResetMessage(null);
    setResetError(null);
    try {
        await authProvider.resetPassword(email);
        setResetMessage(
            'If an account exists for that email, a password-reset link has been sent.'
        );
    } catch {
        // Same non-enumerating guidance on error
        setResetMessage(
            'If an account exists for that email, a password-reset link has been sent.'
        );
    } finally {
        setIsResettingPassword(false);
    }
};
```

Both success and error paths show the identical message. Firebase's `sendPasswordResetEmail` also intentionally resolves regardless of whether the email is registered.

**Tests:**
- Line 249-263 ("sets success message and clears loading state on success")
- Line 265-282 ("shows the same non-enumerating message on Firebase error")

### 5.3 Loading state is restored after success and failure

**YES — Verified**

**Test:** `src/context/AuthContext.test.jsx`, line 284-303 ("restores loading state to false after success and failure") — asserts `isResettingPassword` is `false` after both success and failure paths.

### 5.4 Password reset does not create an anonymous session or alter cart ownership

**YES — Verified**

**Test:** `src/context/AuthContext.test.jsx`, line 305-318 ("does not create an anonymous session during password reset") — asserts `signInAnonymously` is not called and `user` remains `null`.

**Source inspection:** `resetPassword()` in `AuthContext.jsx` (lines 84-101) does not call `signInAnonymously`, `login`, `signup`, or `linkWithCredential`. It only calls `authProvider.resetPassword(email)`.

### 5.5 Errors are handled safely without leaking account-existence information

**YES — Verified**

Same as 5.2. The catch block uses the same message as the success path.

### 5.6 Missing test coverage

**Minor gap:** There is no test verifying that `resetPassword` does not alter `cartItems` or cart ownership. The test only checks that no anonymous session is created. Cart ownership isolation during password reset is not explicitly tested, though the implementation correctly does not touch cart state.

---

## 6. Firebase Configuration Readiness

### 6.1 `.env.local` is ignored by Git

**YES — Verified**

**Source:** `.gitignore`, line 28: `.env.*`

**Verification:** `git check-ignore -v .env.local` returns `.gitignore:28:.env.*	.env.local`

### 6.2 The application reads the expected `VITE_FIREBASE_*` variables

**YES — Verified**

**Source:** `src/firebase/config.js`, lines 3-10

```js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

### 6.3 Placeholder values are not mistaken for valid project configuration

**Cannot verify runtime values** — `.env.local` contains placeholders (not read for security reasons per audit boundaries). The configuration code correctly reads from environment variables and throws if required keys are missing.

### 6.4 Missing configuration fails clearly

**YES — Verified**

**Source:** `src/firebase/config.js`, lines 13-20

```js
const required = ["apiKey", "authDomain", "projectId", "appId"];
for (const key of required) {
    if (!firebaseConfig[key]) {
        throw new Error(
            `Missing Firebase config: ${key}. Check VITE_FIREBASE_* environment variables in .env.local`
        );
    }
}
```

### 6.5 No Firebase Admin SDK credentials or service-account secrets in client code

**YES — Verified**

**Source:** `src/firebase/config.js` only imports `initializeApp` from `firebase/app` (client SDK). No Admin SDK imports. No service-account keys in any tracked file.

### 6.6 Configuration code vs. real project configuration

**Important distinction:** The configuration CODE is implemented (`src/firebase/config.js`, `vitest.config.js` test values). The real Firebase PROJECT CONFIGURATION (actual API keys, project ID, auth domain) is NOT supplied — `.env.local` contains placeholder values only. The application has not been runtime-tested against a real Firebase project.

---

## 7. Regression and Verification Results

### 7.1 Test Suite

```
Test Files  10 passed (10)
Tests  130 passed (130)
```

All 130 tests pass across 10 test files. Zero failures.

### 7.2 Production Build

```
✓ 2145 modules transformed.
✓ built in 24.15s
```

- JS: 652.59 kB (gzip: 205.05 kB)
- CSS: 110.05 kB (gzip: 18.37 kB)
- Warning: Chunks larger than 500 kB (pre-existing)

### 7.3 ESLint

```
✖ 35 problems (33 errors, 2 warnings)
```

Matches baseline (34 errors, 2 warnings reported previously; current is 33 errors, 2 warnings — 1 fewer error due to removal of unused `beforeEach` import during test cleanup).

**All lint errors are pre-existing** (unused `motion` imports, unused variables in `CategoryGrid.jsx`, `categories.jsx`, `firebaseAuthProvider.js`, etc.). No new lint problems introduced by CP3 changes.

---

## 8. Test Inventory Reconciliation

| Metric | CP2 | Pre-CP3-Closure | Current | Difference |
|---|---|---|---|---|
| Total tests | 112 | 108 | 130 | +18 |
| Test files | 10 | 10 | 10 | 0 |

**CP3 gap closure added 22 new tests:**
- `AuthContext.test.jsx`: +6 (password reset: expose function, call sendPasswordResetEmail, success message, non-enumerating error, loading state, no anonymous session)
- `CartContext.test.jsx`: +6 (guest cart handoff: persistence ordering, failure preservation, recovery, function exposure)
- `cartStorage.test.js`: +11 (handoff: key exposure, record write, separate key, recovery, null cases, no-clear-on-read, clear, error handling)

**CP2→Current difference (+18):** The pre-closure count was 108 (-4 from CP2's 112), attributable to CP3 refactoring changes (including deletion of `src/test/setup.js`). The gap closure added 22 tests, net +18.

---

## 9. Findings Summary

| # | Severity | Finding | Source |
|---|---|---|---|
| 1 | **Critical** | Handoff record not associated with Firebase UID — per-browser key, not identity-scoped | `src/data/cartStorage.js:83-95` |
| 2 | **Critical** | `recoverGuestCart()` never called automatically — handoff data is written but never recovered | `src/context/CartContext.jsx:130-132` |
| 3 | **Critical** | No identity isolation — any user on same browser can recover another user's pending guest cart | `src/data/cartStorage.js:39` |
| 4 | **Critical** | `clearGuestHandoff()` never called — stale handoffs accumulate indefinitely | `src/data/cartStorage.js:126-132` |
| 5 | High | `login()`/`signup()` in `AuthContext.jsx` do not persist guest cart before authentication — cart can be lost if user logs in without first adding to cart | `src/context/AuthContext.jsx:48-70` |
| 6 | Medium | `recoverGuestCart()` can overwrite signed-in customer's cart — no guardrails against guest→authenticated cart confusion | `src/context/CartContext.jsx:130-132` |
| 7 | Low | `logout()` does not clear cart — cart persists across logout (may be intended behavior) | `src/context/AuthContext.jsx:72-75` |
| 8 | Low | No test verifying password reset does not alter cart ownership | `src/context/AuthContext.test.jsx` |

---

## 10. Owner-Approved CP3 Requirements Check

| Requirement | Status | Evidence |
|---|---|---|
| Guest-cart preparation explicitly wired into identity-changing flow | **PARTIAL** | Wired into `addToCart()` only; NOT wired into `login()` or `signup()` |
| Persistence ordering is deterministic and tested | **YES** | Cart saved before `signInAnonymously()`; tested in `CartContext.test.jsx` |
| Recovery survives interrupted authentication and reload | **PARTIAL** | Data survives on disk, but `recoverGuestCart()` is never called automatically |
| Failed authentication cannot silently discard guest cart | **YES** | For `addToCart()` flow; NOT for `login()`/`signup()` direct flows |
| Password-reset behavior has dedicated tests | **YES** | 6 tests in `AuthContext.test.jsx` |
| Test-count discrepancies explained | **YES** | CP2: 112 → Pre-closure: 108 → Current: 130 (+18 net) |
| Git inventory internally consistent | **YES** | 19 modified, 1 deleted, 18 untracked; `.env.local` Git-ignored |
| Production build succeeds | **YES** | 2145 modules, 24.15s |
| No unexplained test failures | **YES** | 130/130 passing |

---

## 11. Remaining Limitations and Deferred Work

| Item | Status |
|---|---|
| Cart merge (anonymous → authenticated) | Deferred — not implemented per owner instructions |
| Cart migration (Firestore) | Deferred — not implemented per owner instructions |
| `clearGuestHandoff()` invocation | Available but never called — no safe lifecycle for clearing stale handoffs |
| Firebase project configuration | Placeholder values in `.env.local`; not runtime-tested against real Firebase |
| Firebase email templates | Not configured |
| Production domain authorization | Not verified |
| Handoff UID association | Not implemented — per-browser key only |
| Automatic handoff recovery | Not implemented — `recoverGuestCart()` exposed but never called |
| Cart persistence in `login()`/`signup()` | Not implemented — only `addToCart()` persists before auth |

---

## 12. Final Verdict

### Original audit (2026-11-09): **NOT APPROVED**

CP3 was **not safe to approve** at that time due to **Critical security findings** in the guest-cart handoff mechanism:

1. **No identity isolation:** The `cart:handoff` localStorage key was per-browser, not per-user. A user on the same browser could recover another user's pending guest cart via `recoverGuestCart()`.
2. **No recovery path:** `recoverGuestCart()` was exposed via context but never called.
3. **Unprotected cleanup:** `clearGuestHandoff()` had no lifecycle or guard.
4. **Incomplete auth-flow coverage:** Guest cart persistence before authentication was only wired into `addToCart()`.

### Remediation re-audit (2026-11-10): **APPROVED**

The owner approved D1–D4 and the remediation was implemented and independently
re-reviewed. Full detail is in
`docs/architecture/PHASE2-CP3-SECURITY-REMEDIATION-REPORT.md`.

| Earlier finding | Re-audit result |
|---|---|
| Handoff had no Firebase UID | **Resolved.** Versioned record with `pending`/`bound` state and `firebaseUid`. |
| No explicit recovery path | **Resolved.** User-triggered Restore guest cart action, gated on authenticated UID, UID match and empty cart. |
| Cross-user handoff recovery | **Resolved at the Firebase identity level.** Pending records are never recoverable; bound records require an exact UID match; foreign records are never overwritten. |
| Unguarded cleanup | **Resolved.** `clearGuestHandoff()` refuses to run without `HANDOFF_CLEAR_GUARD`, reserved for the future verified migration. |
| Login/signup did not preserve the cart | **Resolved.** Both snapshot synchronously before authentication; original anonymous ownership is preserved. |
| Anonymous upgrade | **Resolved.** Anonymous signup links via `linkWithCredential`, preserving the Firebase UID. |

Verification at re-audit:

- Full suite: **152/152 tests pass**, 10 files.
- Production build: **success** (2146 modules).
- ESLint: **33 errors, 2 warnings** — identical to the pre-remediation baseline.

Remaining limitation: **D1** — two unauthenticated humans sharing one browser
profile cannot be distinguished by client-side `localStorage`. This was
explicitly accepted by the owner and does **not** permit cross-Firebase-identity
handoff recovery. The active `cart` key remains per-browser per the approved
storage model; customer-specific merging is deferred.

**No unresolved Critical or High security finding remains. CP3 is APPROVED for
the owner-approved scope.**

