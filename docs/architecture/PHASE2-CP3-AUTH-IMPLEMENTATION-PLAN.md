# Deals on Wheels — Phase 2 CP3: Authentication Architecture & Implementation Plan

**Repository:** `C:\Users\durra\Downloads\Compressed\DealsonWheels-repo-clone-20261105-232808`  
**Branch:** `phase1/foundation`  
**HEAD:** `46d854eb42f04881e5f7c5bb33d0f15dc9379654`  
**Date:** 2026-11-08  
**Change class:** Documentation only. No production behavior, dependency, route, asset, or persisted-data change was made for this checkpoint. No Firebase SDK installed, no Firebase project created, no source code modified.  
**Source inspected:** `docs/architecture/PHASE2-FIREBASE-READINESS.md` (CP1), `docs/architecture/PHASE2-CP2-ADAPTER-ARCHITECTURE.md` (CP2), current source tree.

---

## 1. Executive summary

CP3 prepares the application for Firebase Authentication integration by documenting the detailed implementation plan. This checkpoint is **preparation only** — no Firebase SDK is installed, no Firebase project is created, no environment files are modified, no application source is changed, and no authentication UI is redesigned.

The plan builds on CP2's provider/composition architecture: `AuthContext` will delegate to an `authProvider` selected in `compose.js`. CP3 replaces the current mock auth (every login/signup yields id `'1'`) with Firebase Authentication (anonymous guest + email/password customer), mapping users by Firebase UID.

**D8 (Authentication model and user identity) is owner-approved** (see `docs/architecture/PHASE2-FIREBASE-READINESS.md` Section 13.1). The following owner-approved product behaviors drive this plan:
- Visitors browse without authentication.
- No anonymous Firebase account is created during ordinary browsing or page load (lazy anonymous authentication).
- When a visitor first adds an item to their cart, a Firebase Anonymous Authentication session is created.
- The anonymous session persists across page reloads.
- On registration, the anonymous account is linked to an email/password account using Firebase `linkWithCredential` where appropriate.
- If the email already belongs to an existing account, that existing account is authenticated instead.
- Guest-cart migration remains a separate checkpoint (CP5).
- Firebase UID is the permanent customer identity.
- Password reset is included in the initial authentication release (owner-approved).

**Decisions that remain unresolved** (do not silently decide during CP3 implementation):
- Guest cart merge conflict resolution (what happens when both guest and authenticated carts contain the same product ID).
- Duplicate product quantity handling during guest-to-authenticated cart merge (summed, replaced, or capped).
- Maximum quantities and stock validation rules.
- Whether guest cart data survives logout (explicit owner decision — see Section 4.3).
- Account deletion and cart retention policies.
- Authentication providers beyond email/password (e.g., OAuth/social).
- Trusted admin custom-claim provisioning workflow.

---

## 2. Firebase Authentication initialization and configuration

**Proposed technical implementation (not implemented in CP3):**

| Step | Description |
|---|---|
| 2.1 | Install `firebase` SDK in a future checkpoint (not CP3). |
| 2.2 | Create a Firebase project in the Firebase Console (not CP3). |
| 2.3 | Enable Authentication in the Firebase Console: Anonymous provider and Email/Password provider. |
| 2.4 | Store Firebase web config values (`apiKey`, `authDomain`, `projectId`, etc.) in environment variables (`VITE_FIREBASE_*`), not committed to the repository. See CP1 Section 10.1. |
| 2.5 | Create a `src/firebase/config.js` module (future checkpoint) that initializes the Firebase app and exports the `auth` instance. |
| 2.6 | Configure domain/referrer restrictions for the Firebase web API key (CP1 Section 10.1). |

**Restrictions for CP3:**
- No Firebase SDK installation.
- No Firebase project creation.
- No `.env` file creation or modification.
- No `src/firebase/` module creation.

---

## 3. Anonymous guest authentication (lazy, triggered by first cart addition)

**Proposed technical implementation:**

| Aspect | Description |
|---|---|
| 3.1 | **No anonymous Firebase Auth session is created on page load or ordinary browsing.** Visitors browse unauthenticated. |
| 3.2 | When a visitor first adds an item to their cart, invoke Firebase Anonymous Auth `signInAnonymously()` to obtain a guest UID. This is the trigger that creates the anonymous session. |
| 3.3 | Map the guest UID into the existing `useAuth` shape: `user = { id: <firebase_uid>, name: 'Guest', email: null, avatarUrl: null, isAnonymous: true }`. |
| 3.4 | Persist the guest UID via `authStorage.saveUser()` (localStorage key `user`) so the anonymous identity survives page reload and browser restart (owner-approved `local` Firebase Auth persistence). |
| 3.5 | Guest cart: keyed by the Firebase Anonymous Auth UID (CP1 Section 4.1, `carts/{cartId}`). D11 (cart scoping) remains unresolved — the cart document model (device-scoped vs user-scoped) is not decided here. |
| 3.6 | Anonymous auth does not collect or store credentials; no password material is ever handled. |
| 3.7 | **Owner-approved: `local`.** Firebase Authentication uses browser-local persistence (`persistence: 'local'`). Once a Firebase Auth session is created (anonymous on first cart addition, or email/password on sign-in), the session survives page reloads and browser restarts. Lazy authentication remains unchanged: no anonymous session is created until the first cart addition. |

**Decisions NOT made (owner approval required):**
- Account deletion and cart retention policies (unresolved).
- Auth providers beyond email/password (unresolved).

---

## 4. Email/password registration, login and logout

**Proposed technical implementation:**

| Aspect | Description |
|---|---|
| 4.1 | **Registration with anonymous linking:** If the visitor has an anonymous session (created on first cart addition), registration uses `linkWithCredential(anonymousUser, emailAuthProvider.credential(email, password))` to upgrade the anonymous account to email/password while **preserving the same Firebase UID**. If the visitor has no anonymous session, `createUserWithEmailAndPassword(email, password)` creates a new account. |
| 4.2 | **Existing-account sign-in:** If the visitor is anonymous and signs in with an email that already belongs to a separate non-anonymous account, `linkWithCredential` fails with `auth/credential-already-in-use`. In that case: (a) sign out the anonymous session, (b) call `signInWithEmailAndPassword(email, password)` to authenticate the existing account, and (c) preserve the anonymous guest cart data in memory for post-merge transfer (guest-cart merge logic is deferred to CP5). |
| 4.3 | **Logout:** `signOut()`, then `authStorage.clearUser()` to remove the `user` localStorage key and clear the cart UI immediately. The customer's cart document in Firestore is preserved on logout — it is never deleted merely because the user signs out. When the same customer signs in again, their existing cart is restored. A different user signing in must never see the previous customer's cart. The anonymous guest cart document (`carts/{anonymous_uid}`) associated with the Firebase Anonymous Auth UID is also preserved on logout — it is never deleted merely because the user signs out or closes the browser. |
| 4.4 | **Field mapping:** Firebase `User.photoURL` is mapped to the application `avatar` field (not `avatarUrl`) in the `useAuth` shape: `user = { id: <firebase_uid>, name: <displayName>, email: <email>, avatar: <photoURL>, isAnonymous: false }`. This preserves backward compatibility with `Navbar` and existing consumers that render `user.avatar`. The `authStorage` adapter performs `avatar` ↔ `avatarUrl` translation during the transition period. |
| 4.5 | The existing `AuthModal` UI (login/signup forms) is reused without redesign; form validation (email format, password presence) remains client-side. |
| 4.6 | **Password reset (owner-approved: in scope for initial release):** A "Forgot Password?" entry point is provided in the login flow. Users request a password-reset email using their registered email address. Firebase Authentication's email-based password reset functionality sends a reset link to the user's email. Clear success and error feedback is provided to the user. User-facing responses do not reveal whether an email address is registered (safe, non-enumerating responses). Password reset does not create an anonymous session and does not alter cart ownership or trigger cart migration. Firebase Console email templates and authorized domains must be configured (see Section 14). |

**Decisions NOT made (owner approval required):**
- Authentication providers beyond email/password (e.g., OAuth/social) — unresolved.

---

## 5. Firebase UID-based identity

**Proposed technical implementation:**

| Aspect | Description |
|---|---|
| 5.1 | Firebase UID (`auth.currentUser.uid`) is the permanent customer identity, replacing the mock auth's hardcoded id `'1'`. |
| 5.2 | A Firebase UID exists only after the visitor has triggered anonymous authentication (first cart addition) or signed in with email/password. Visitors who only browse have no UID. |
| 5.3 | All user-owned documents (`users/{uid}`, `carts/{cartId}`, orders, trade-in requests) use the Firebase UID as document id or owner reference. |
| 5.4 | The `id` field in the persisted user object is the Firebase UUID string, always unique per authenticated user. |
| 5.5 | Anonymous users have a Firebase UID too (from `signInAnonymously` on first cart addition), enabling guest carts to be keyed by UID before sign-in. The anonymous guest cart document associated with this UID is preserved via owner-approved `local` Firebase Auth persistence and survives browser reloads and restarts. |

**Decisions NOT made (owner approval required):**
- Account deletion and cart retention policies — unresolved.

---

## 6. User profile creation and field ownership

**Proposed technical implementation:**

| Field | Ownership | Editable by client? | Source |
|---|---|---|---|
| `id` (Firebase UID) | Server-controlled | **No** | Firebase Auth |
| `email` | Server-controlled | **No** | Firebase Auth |
| `name` | User-editable | Yes (own doc only) | Provided at signup; updatable via profile update |
| `avatar` | User-editable | Yes (own doc only) | Firebase Auth `photoURL`; adapter maps `photoURL` → `avatar` in `useAuth` shape |
| `createdAt` | Server-controlled | **No** | Set at account creation (server timestamp) |
| `isAnonymous` | Server-controlled | **No** | Derived from Firebase Anonymous Auth |
| `role` custom claim | Server-controlled | **No** | Firebase Auth custom claims (admin only) |

**Security rules strategy (proposed, not implemented):**
- Client writes to `users/{uid}` limited to `name` and `avatar` only.
- Privileged fields (`uid`, `email`, `role`, `createdAt`, `isAnonymous`) are **prohibited** from client modification; enforced by Firestore security rules reading `request.auth.token`.

**Adapter mapping (transition):** The current application stores `avatar` in `localStorage['user']`. Firebase `User.photoURL` is mapped to `avatar` in the `useAuth` shape. The `authStorage` adapter performs `avatar` ↔ `avatarUrl` translation when reading/writing `localStorage['user']` during the transition period, ensuring `Navbar` and other consumers that render `user.avatar` continue to work without modification.

**Decisions NOT made (owner approval required):**
- Profile validation rules (name length, allowed characters) — not addressed.
- Avatar upload flow and Storage restrictions — not addressed (CP1 Section 7).

---

## 7. Admin authorization through trusted custom claims

**Proposed technical implementation:**

| Aspect | Description |
|---|---|
| 7.1 | **Owner-approved:** A `role` custom claim (`'customer'` | `'admin'`) is set server-side via Firebase Admin SDK using a one-time, manually executed bootstrap process. The owner creates the first administrator account through normal registration/authentication, obtains the account's Firebase UID, and a server-side bootstrap script assigns the `admin` custom claim to that exact UID. |
| 7.2 | Client code **never** trusts a client-supplied role; security rules read `request.auth.token.role`. |
| 7.3 | Admin operations: manage categories, products, car listings, moderate reviews, manage orders. |
| 7.4 | The `useAuth` shape may expose an `isAdmin` derived from `request.auth.token.role` — derived client-side from the ID token, never from a user-supplied field. |

**Bootstrap security requirements:**
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

**Decisions NOT made (owner approval required):**
- Custom claim rotation or revocation — not addressed.
- Future administrator removal or revocation workflow — not addressed.

---

## 8. Auth state restoration and loading states

**Proposed technical implementation:**

| Aspect | Description |
|---|---|
| 8.1 | On app initialization, Firebase `onAuthStateChanged` listener restores the auth state from the Firebase ID token (persisted by the Firebase SDK internally). |
| 8.2 | `AuthProvider` initializes `user` state as `null` and `isLoading` as `true`, then updates to the restored user (or remains `null` when no user is signed in) and sets `isLoading` to `false` when resolution completes. |
| 8.3 | `isLoading` is exposed in the public `useAuth` interface so UI can show a neutral state until auth resolution completes, avoiding a flash of signed-out state for returning authenticated users. |
| 8.4 | The existing `localStorage['user']` key is read as a fallback only during the transition period; Firebase `onAuthStateChanged` is the source of truth once Firebase Auth is active. |

**Existing `AuthContext` migration (Section 8):**
- Replace `useState(loadUser)` initialization with Firebase `onAuthStateChanged` callback, paired with `useState(true)` for `isLoading`.
- Replace mock `login`/`signup` with Firebase `createUserWithEmailAndPassword` / `signInWithEmailAndPassword`, and `linkWithCredential` for anonymous-to-email/password upgrading.
- Replace mock `logout` with Firebase `signOut` + `authStorage.clearUser()`.
- Keep `isAuthModalOpen`, `authMode`, `openLogin`, `openSignup`, `closeAuthModal` unchanged.
- **Interface change (deliberate):** `isLoading` is added to the `useAuth` return value. Consumers that do not need loading-state awareness can ignore it; this is backward compatible for existing callers that destructure only the fields they use.

**Interface:**
- All `useAuth` exports: `user`, `isLoading`, `login`, `signup`, `logout`, `isAuthModalOpen`, `authMode`, `openLogin`, `openSignup`, `closeAuthModal`.
- No consumer (`Navbar`, `AuthModal`, etc.) requires changes to its `useAuth` calls, but consumers may optionally consume `isLoading` to prevent UI flash.

---

## 9. Existing `AuthContext` migration

**Current state (CP4):**
- `AuthContext.jsx` delegates persistence to `authStorage` (`localStorage['user']`).
- `login(email, password)` and `signup(name, email, password)` are mock: 1-second delay, always returns id `'1'`, ignores credentials.
- `logout()` calls `setUser(null)` and `clearUser()`.

**Proposed target state (CP3):**
- `AuthContext.jsx` delegates persistence to `authStorage` (unchanged interface) AND initializes from Firebase `onAuthStateChanged` with `isLoading` state.
- `login`/`signup` call Firebase Auth methods; registration with an existing anonymous session uses `linkWithCredential` to preserve the Firebase UID.
- `logout` calls Firebase `signOut` then `clearUser()`.
- `authStorage.saveUser(user)` / `loadUser()` / `clearUser()` continue to manage the `localStorage['user']` key as a transitional fallback.
- The `avatar` ↔ `avatarUrl` translation is performed by `authStorage` during the transition period so `Navbar` continues to render `user.avatar`.

**Interface preservation:**
- `useAuth` exports: `user`, `isLoading`, `login`, `signup`, `logout`, `isAuthModalOpen`, `authMode`, `openLogin`, `openSignup`, `closeAuthModal`.
- `isLoading` is a deliberate additive change; existing consumers that destructure only the fields they use continue to work without modification.
- No consumer (`Navbar`, `AuthModal`, etc.) requires changes to its `useAuth` calls.

---

## 10. Existing localStorage user migration considerations

| Item | Current state | CP3 approach |
|---|---|---|
| `localStorage['user']` key | `{id: '1', name, email, avatar}` | Preserved during transition; read as fallback by `authStorage.loadUser()`. Firebase Auth state is authoritative once initialized. |
| Mock user id `'1'` | Hardcoded, collides across all logins | Replaced by Firebase UID once Firebase Auth is active. |
| Invalid persisted user | Discarded on read, key removed | Same behavior preserved via `authStorage.loadUser()`. |
| Password | Submitted but ignored, never stored | Never stored (Firebase Auth manages credentials server-side). |
| Persistence authority | `localStorage['user']` is the only source | Firebase Auth SDK state is authoritative; `localStorage['user']` is a transitional cache only, never read after Firebase is initialized. |

**Migration sequence (proposed, not implemented):**
1. Firebase Auth active: `onAuthStateChanged` provides the authoritative user.
2. `localStorage['user']` is written by `authStorage.saveUser()` for compatibility during transition.
3. On read, Firebase Auth state takes precedence; `localStorage['user']` is a fallback only during initialization.
4. After migration is verified, the localStorage fallback can be removed (future checkpoint).

**Decisions NOT made (owner approval required):**
- Exact cutoff point for removing localStorage fallback — not addressed.
- Whether to migrate existing mock `'1'` user data to Firebase — not addressed (mock data is not real user data).

---

## 11. Guest-to-authenticated cart migration boundaries

**Scope note:** CP3 does **not** implement cart migration. This section defines the boundaries and unresolved decisions for a future checkpoint (CP5 in the CP1 roadmap).

**Proposed boundaries:**

| Aspect | Description |
|---|---|
| 11.1 | Guest cart is keyed by Firebase Anonymous Auth UID (`carts/{anonymous_uid}`). |
| 11.2 | On sign-in (anonymous → authenticated), a merge operation combines the guest cart with the authenticated customer's cart. Guest cart data must remain available until the merge has been successfully completed and verified. |
| 11.3 | The merge is atomic (Cloud Function + Firestore transaction) to prevent data loss. |
| 11.4 | The authenticated customer's cart (`carts/{auth_uid}`) is the destination; guest cart items are merged into it. |
| 11.5 | Guest cart data must remain recoverable after interrupted sign-in, browser reload, tab closure, network failure, or failed merge. The handoff from anonymous session to authenticated customer must be recoverable after authentication is restored. Guest cart data is treated as temporary/recoverable handoff data, not authoritative ownership. |

**Decisions that remain unresolved (owner approval required, do NOT implement in CP3):**
- Guest cart merge conflict resolution: what happens when both guest and authenticated carts contain the same product ID?
- Duplicate product quantity handling: are quantities summed, replaced, or capped?
- Maximum quantities and stock validation during merge.
- Behavior when anonymous account linking fails (does the guest cart persist? is it discarded?).

---

## 12. Error handling and recovery

**Proposed technical implementation:**

| Scenario | Handling |
|---|---|
| Firebase SDK load failure | Catch error, fall back to signed-out state (`user = null`, `isLoading = false`), log via `console.error`. |
| Anonymous sign-in failure (on first cart addition) | Catch error, fall back to signed-out state, do not crash; cart addition proceeds without a guest UID. |
| Email/password login failure (invalid credentials) | Firebase Auth returns error; display via `AuthModal`; do not persist partial state. |
| Email/password signup failure (email exists, weak password) | Firebase Auth returns error; display via `AuthModal`; do not create partial profile. |
| Anonymous-to-email/password linking failure (`auth/credential-already-in-use`) | Sign out the anonymous session, call `signInWithEmailAndPassword(email, password)` to authenticate the existing account; preserve anonymous guest cart data in memory for post-merge transfer (deferred to CP5). |
| Anonymous-to-email/password linking failure (other errors) | Catch error, keep anonymous session intact, display via `AuthModal`; do not force sign-in. |
| `signOut` failure | Catch error, log via `console.error`, still call `clearUser()` to remove local state. Cart documents in Firestore are preserved on logout. |
| `onAuthStateChanged` error | Fall back to `user = null`, `isLoading = false`, log via `console.error`. |
| Network interruption during auth operation | Firebase SDK handles retries internally; surface error to user via `AuthModal`. |

**Persistence errors:**
- `authStorage.saveUser()` / `loadUser()` / `clearUser()` continue to catch and log exceptions (existing CP4 behavior preserved).
- Firebase Auth errors are distinct from localStorage errors; both are logged but not silently swallowed.

**Logout cart survival:**
- The customer's cart document in Firestore is preserved on logout. The anonymous guest cart document (`carts/{anonymous_uid}`) associated with the Firebase Anonymous Auth UID is also preserved on logout — it is never deleted merely because the user signs out or closes the browser. A different user signing in must never see the previous customer's cart.

---

## 13. Security implications and testing strategy

### 13.1 Security implications

| Concern | Mitigation (proposed, not implemented) |
|---|---|
| Client-supplied role/ownership | `role` comes from custom claims (`request.auth.token.role`), never from client input. `uid` is `request.auth.uid`, never client-supplied. Cart ownership is tied to Firebase Auth UID; client-provided UIDs are never trusted to establish cart ownership. |
| Client-set prices/totals | Verified server-side via Cloud Functions at checkout (CP1 Section 8). |
| Password exposure | Never stored in localStorage or Firestore; Firebase Auth manages credentials. |
| Anonymous user impersonation | Anonymous UID is Firebase-generated; client cannot forge it. One anonymous user's cart is never exposed to another person using the same browser. Local browser data is treated as temporary/recoverable handoff data, not authoritative cart ownership. |
| Guest cart security | Guest carts are keyed by Firebase Anonymous Auth UID. Firestore security rules enforce `request.auth.uid == cartId` (CP1 Section 6.3). Firebase UIDs are cryptographically random and unforgeable; rate limiting on anonymous sign-in is a deployment consideration. |
| ID token theft | Firebase ID tokens are short-lived; refresh token rotation handled by SDK. |
| Public browse without auth | Firestore read rules allow public catalog reads (CP1 Section 6.2). |

### 13.2 Testing strategy

| Test area | Description |
|---|---|
| Anonymous sign-in (lazy) | Verify `signInAnonymously()` is NOT called on page load; IS called on first cart addition; maps to `useAuth` shape with `isAnonymous: true`. |
| Lazy auth trigger | Verify no Firebase Auth session exists until first cart addition. |
| Email/password signup/login | Verify Firebase Auth methods are called with correct arguments; verify `useAuth` shape reflects returned user. |
| Anonymous-to-email/password linking | Verify `linkWithCredential` is called with anonymous user and email credential; verify Firebase UID is preserved after linking. |
| Existing-account sign-in from anonymous | Verify `auth/credential-already-in-use` triggers sign-out of anonymous session and `signInWithEmailAndPassword` for the existing account. |
| Logout | Verify `signOut()` called and `clearUser()` invoked; verify anonymous cart document is NOT deleted (owner decision pending). |
| Auth state restoration | Verify `onAuthStateChanged` restores user on page reload; verify `isLoading` transitions from `true` to `false`. |
| Loading state | Verify `isLoading = true` during initial auth resolution; verify UI does not flash signed-out for returning users. |
| Error handling | Verify invalid credentials produce errors without crashing; verify `signOut` errors are logged but `clearUser()` still runs. |
| Provider delegation | Verify `AuthContext` delegates to `authProvider` (unchanged from CP2 pattern). |
| localStorage fallback | Verify `authStorage` still manages `localStorage['user']` key during transition; verify `avatar` ↔ `avatarUrl` adapter mapping. |

**Test constraints:**
- No Firebase SDK in tests (CP3 is documentation-only).
- Use mocks/fakes for Firebase Auth methods.
- Preserve all existing `AuthContext.test.jsx` characterization tests.

---

## 14. Required Firebase Console configuration

**To be configured by the owner (not CP3):**

| Configuration | Description |
|---|---|
| Firebase project | Create project in Firebase Console. |
| Authentication > Sign-in method | Enable Anonymous and Email/Password providers. |
| Authentication > Authorized domains | Add `localhost` (development) and production domain(s) to prevent auth from unauthorized origins. |
| Authentication > API key restrictions | Restrict the Firebase web API key by domain/referrer (CP1 Section 10.1). |
| Authentication > Email action templates | Customize password reset email template (owner-approved: in scope for initial release). Configure the reset link action URL and email branding. |
| Firestore > Security rules | Default-deny rules with public catalog reads and user-owned document access (CP1 Section 6). |
| Cloud Functions | Admin SDK for custom claims assignment and blocking functions (`beforeCreate`, `beforeSignIn`) (future checkpoint). |
| App Check | Optional; enforce app origin for production write paths (CP1 Section 6.6). |

---

## 15. Rollback and regression strategy

| Aspect | Strategy |
|---|---|
| Rollback trigger | Firebase Auth initialization failure, auth test failures, or build failure. |
| Rollback action | Revert `AuthContext.jsx` to CP4 mock auth implementation; keep `authStorage` localStorage adapter unchanged. |
| Data safety | No user data is migrated in CP3 (mock auth has no real user data to preserve). `localStorage['user']` key format is unchanged. |
| UI regression | All existing route/component tests (`App.test.jsx`) must continue to pass. `AuthModal` UI is unchanged. |
| Test regression | All 112 existing tests (CP2 baseline) must pass after CP3 implementation. |

---

## 16. Required owner approvals before CP3 implementation

| Decision | Status | Why owner approval needed |
|---|---|---|
| D8 — Authentication model and user identity | **Owner-approved** (Section 13.1 of CP1 doc) | Already approved; drives CP3 scope. Includes lazy anonymous auth (triggered on first cart addition) and `linkWithCredential` for account upgrading. |
| D11 — Cart scoping and guest merge | **Open** | Required before cart merge implementation (CP5 in roadmap). |
| D12 — Order/checkout contract | **Open** | Required before checkout-requires-auth behavior is enforced. |
| Firebase project configuration | **Open** | Owner must create Firebase project and enable providers. |
| Firebase web API key restrictions | **Open** | Owner must configure domain/referrer restrictions. |
| Anonymous auth: lazy vs. automatic | **Owner-decided** | Owner approved **lazy** anonymous auth (triggered on first cart addition, not on page load). |
| Email/password as initial provider | **Proposed** (part of D8 approval) | Owner may choose different initial provider. |
| Firebase Auth persistence mode | **Owner-approved: `local`** | Firebase Auth uses browser-local persistence. Anonymous and signed-in customer sessions survive browser reloads and restarts once a session is created. |
| Guest cart survival on logout | **Owner-approved: preserved** | Customer's cart document is preserved on logout. Anonymous guest cart document is preserved on logout — never deleted merely because the user signs out or closes the browser. A different user signing in must never see the previous customer's cart. |
| Password reset scope | **Owner-approved: included in initial release** | Password reset is included in the initial authentication release. Users request a password-reset email via Firebase Authentication's email-based password reset functionality. Firebase Console email templates and authorized domains must be configured (Section 14). |
| Admin custom-claim provisioning | **Owner-approved: one-time server-side bootstrap** | A trusted server-side Firebase Admin SDK bootstrap script assigns the `admin` custom claim to a specific Firebase UID after the account is created through normal registration. |

---

## 17. CP3 implementation plan summary

| Phase | Focus | Dependencies | Owner approval needed? |
|---|---|---|---|
| CP3 (this plan) | Firebase Auth integration: lazy anonymous auth (first cart addition), email/password, `linkWithCredential` account upgrading, UID-based identity, `isLoading` state, AuthContext migration | D8 (approved), Firebase project config | Yes (project config) |
| CP4 | Firestore reads for catalog/vehicles | D5, D6, security rules | Yes |
| CP5 | Firestore writes: cart + guest/user scoping | D11, cart migration | Yes |

**CP3 does not implement:**
- Cart migration (guest-to-authenticated merge boundaries defined only; merge logic deferred to CP5).
- Checkout or orders.
- Security rules, Cloud Functions, or App Check.
- Any Firebase SDK installation or project configuration.
- Source code changes.
- Environment file changes.
- Automatic anonymous auth on page load (explicitly rejected — lazy auth only).

---

## 18. Explicit out-of-scope items

- No Firebase SDK installation.
- No Firebase project creation or configuration.
- No `.env` file creation or modification.
- No application source-code changes.
- No authentication UI redesign.
- No cart migration (guest-to-authenticated merge boundaries defined only; merge logic deferred to CP5).
- No automatic anonymous auth on page load (anonymous session created only on first cart addition — owner-approved lazy behavior).
- No commit or push.
- No implementation of security rules, Cloud Functions, or App Check.
- No resolution of unresolved D8 sub-decisions (merge conflicts, quantities, stock, linking failure, account deletion, additional auth providers, admin provisioning).

---

**End of plan.** This document is an implementation plan for review. No implementation decision beyond the owner-approved D8 is made by this checkpoint. Wait for review and approval before beginning CP3 implementation.
