# Deals on Wheels — Phase 2 CP4: Firebase Project Setup Preparation

**Repository:** `C:\Users\durra\Downloads\Compressed\DealsonWheels-repo-clone-20261105-232808`  
**Branch:** `phase1/foundation`  
**HEAD:** `46d854eb42f04881e5f7c5bb33d0f15dc9379654`  
**Date:** 2026-11-08  
**Change class:** Documentation only. No Firebase project created, no Firebase SDK installed, no environment files modified, no application source changed, no deployment.

**Source inspected:**
- `docs/architecture/PHASE2-FIREBASE-READINESS.md` (CP1 architecture audit)
- `docs/architecture/PHASE2-CP2-ADAPTER-ARCHITECTURE.md` (CP2 adapter architecture)
- `docs/architecture/PHASE2-CP3-AUTH-IMPLEMENTATION-PLAN.md` (CP3 implementation plan)
- `docs/architecture/PHASE2-CP3-AUTH-INDEPENDENT-REVIEW.md` (CP3 independent review)
- `docs/architecture/PHASE2-CP3-ARCHITECTURE-READINESS-REPORT.md` (CP3 architecture readiness report)
- Current source tree

---

## 1. Executive Summary

This checkpoint prepares a complete Firebase project setup checklist and repository readiness plan for Deals on Wheels. This checkpoint is **preparation only** — no Firebase project is created, no Firebase SDK is installed, no environment files are modified, no application source code is changed, no deployment occurs.

All previously approved CP3 decisions are preserved:
- **D8** — Authentication model: lazy anonymous auth, email/password, `linkWithCredential` account linking, Firebase UID as permanent identity
- **Firebase Auth persistence:** owner-approved `local` (browser-local persistence)
- **Lazy anonymous auth:** no Firebase Auth session on page load; `signInAnonymously()` triggered only on first cart addition
- **Password reset:** owner-approved for initial release
- **Admin custom-claim provisioning:** owner-approved one-time server-side bootstrap
- **Guest cart survival on logout:** owner-approved (customer's cart document preserved; anonymous guest cart document preserved)

The Firebase project has **not** been created. The owner must create it manually in the Firebase Console using the checklist below.

---

## 2. Preflight Verification

Before any Firebase project creation:

| Check | Status |
|---|---|
| Repository path verified | `C:\Users\durra\Downloads\Compressed\DealsonWheels-repo-clone-20261105-232808` |
| Branch verified | `phase1/foundation` |
| HEAD verified | `46d854eb42f04881e5f7c5bb33d0f15dc9379654` (CP4 commit) |
| Local == Remote HEAD | Equal |
| `main` untouched | Yes (`60a7038`) |
| Working tree inspected | 4 modified tracked files + 8 untracked files (from CP2/CP3) |
| No Firebase SDK installed | Confirmed |
| No Firebase project created | Confirmed |
| No `.env` files exist | Confirmed |

**Pre-edit snapshot created:**

| Item | Value |
|---|---|
| Path | `C:\Users\durra\Downloads\Compressed\DealsonWheels-phase1-backups\20261108-134450-p2cp4-pre\working-tree-20261108-134450.zip` |
| Size | 121,022,228 bytes |
| SHA-256 | `79559532457F2A1259026AC09BDDE2C21A96449BD0E978D30234E0DEAB24FDE0` |
| Files | 196 |

---

## 3. Firebase Console Checklist (Owner-Executed)

The owner performs these steps in the Firebase Console. **OpenCode does not create or configure any Firebase resources.**

### Step 1: Create Firebase Project

| Step | Action | Owner Action? | Notes |
|---|---|---|---|
| 1.1 | Go to https://console.firebase.google.com | Owner | — |
| 1.2 | Click "Add project" | Owner | — |
| 1.3 | Project name: `dealsonwheels` (or organization-approved name) | Owner | — |
| 1.4 | Project ID: auto-generated from project name | Owner | Cannot be changed later; note it for Step 4 |
| 1.5 | Enable Google Analytics: **No** | Owner | Not required for this application; keeps setup minimal |
| 1.6 | Click "Create project" | Owner | — |

### Step 2: Enable Firebase Authentication

| Step | Action | Owner Action? | Notes |
|---|---|---|---|
| 2.1 | In Firebase Console, go to Build > Authentication | Owner | — |
| 2.2 | Click "Get started" | Owner | — |
| 2.3 | Enable **Anonymous** provider | Owner | Required for guest cart access |
| 2.4 | Enable **Email/Password** provider | Owner | Required for registered customer accounts |
| 2.5 | Do **not** enable any other providers (Google, Apple, etc.) | Owner | Out of scope for CP3 |
| 4.5 | Save changes | Owner | — |

### Step 3: Register a Web App

| Step | Action | Owner Action? | Notes |
|---|---|---|---|
| 3.1 | In Firebase Console, go to Project Settings (gear icon) | Owner | — |
| 3.2 | Click "Add app" and select the web icon (`</>`) | Owner | — |
| 3.3 | App nickname: `dealsonwheels-web` | Owner | — |
| 3.4 | Check "Also set up Firebase Hosting" | Owner | **No** — Vercel hosting is preserved |
| 3.4 | Click "Register app" | Owner | — |
| 3.5 | Copy the `firebaseConfig` object | Owner | Contains `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` |

### Step 4: Configure Authentication Providers

| Step | Action | Owner Action? | Notes |
|---|---|---|---|
| 4.1 | In Firebase Console, go to Build > Authentication > Sign-in method | Owner | — |
| 4.2 | Enable "Anonymous" | Owner | Required for guest cart access |
| 4.3 | Enable "Email/Password" | Owner | Required for registered customer accounts |
| 4.4 | Do **not** enable any other providers (Google, Apple, etc.) | Owner | Out of scope for CP3 |
| 4.5 | Save changes | Owner | — |

### Step 5: Configure Authorized Domains

| Step | Action | Owner Action? | Notes |
|---|---|---|---|
| 5.1 | In Firebase Console, go to Build > Authentication > Settings | Owner | — |
| 5.2 | Under "Authorized domains", add `localhost` | Owner | Required for local development |
| 5.3 | Add the production Vercel domain (e.g., `dealsonwheels.vercel.app`) | Owner | Required for production |
| 5.4 | Add any custom domain if applicable | Owner | Optional, only if custom domain is used |
| 5.5 | Save changes | Owner | — |

### Step 6: Configure API Key Restrictions

| Step | Action | Owner Action? | Notes |
|---|---|---|---|
| 6.1 | Go to Google Cloud Console (console.cloud.google.com) | Owner | — |
| 6.2 | Select the Firebase project | Owner | — |
| 6.3 | Go to APIs & Services > Credentials | Owner | — |
| 6.4 | Find the Firebase API key (browser key) | Owner | — |
| 6.5 | Click "Edit" on the API key | Owner | — |
| 6.6 | Under "API restrictions", select "Restrict key" | Owner | Limits blast radius if key is exposed |
| 6.7 | Select only "Firebase Authentication API" | Owner | Limits blast radius if key is exposed |
| 6.7 | Under "Application restrictions", select "HTTP referrers (websites)" | Owner | Limits key usage to authorized origins |
| 6.8 | Add website restrictions: `localhost:5173/*` and production domain/* | Owner | Limits key usage to authorized origins |
| 6.9 | Save changes | Owner | — |

### Step 6: Services NOT Enabled in CP3

| Service | Status | Reason |
|---|---|---|
| Firebase Hosting | **Not enabled** | Vercel hosting is preserved |
| Firebase Storage | **Not enabled** | Not needed for CP3 |
| Cloud Functions | **Not enabled** | Not needed for CP3 |
| App Check | **Not enabled** | Optional; recommended for production |
| Firebase Extensions | **Not enabled** | Not needed |
| Analytics | **Not enabled** | Not needed |

---

## 4. Environment Configuration Plan

### 4.1 Required Vite Environment Variables

The following environment variables must be configured for the application to connect to Firebase:

| Variable | Description | Example (placeholder only) | Committed to Git? |
|---|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key | `AIzaSy...` | **No** |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | `dealsonwheels-92e55.firebaseapp.com` | **No** |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `dealsonwheels-92e55` | **No** |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | `dealsonwheels.appspot.com` | **No** |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID | `644698324314` | **No** |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:644698324314:web:2ff0cab61720421ee60763` | **No** |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID | Not applicable | **No** (Analytics not enabled) |

### 4.2 Environment Variable Classification

| Variable | Public Client Config? | Committed to Git? | Where Stored |
|---|---|---|---|
| `VITE_FIREBASE_API_KEY` | Yes (sent by Firebase SDK) | **No** | `.env.local`, Vercel env vars |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | **No** | `.env.local`, Vercel env vars |
| `VITE_FIREBASE_PROJECT_ID` | Yes | **No** | `.env.local`, Vercel env vars |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | **No** | `.env.local`, Vercel env vars |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | **No** | `.env.local`, Vercel env vars |
| `VITE_FIREBASE_APP_ID` | Yes | **No** | `.env.local`, Vercel env vars |
| Service account private key | **No** | **Never** | Server-side only (Cloud Functions) |

### 4.3 `.env.local` Template (Local Development)

**This file must NOT be committed to Git.** Add `.env.local` to `.gitignore` if not already present.

```env
# Firebase configuration — DO NOT COMMIT
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4.4 Vercel Production Environment Variables

In the Vercel dashboard, go to Project Settings > Environment Variables and add:

| Variable | Value | Environment |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | From Firebase Console | Production, Preview, Development |
| `VITE_FIREBASE_AUTH_DOMAIN` | From Firebase Console | Production, Preview, Development |
| `VITE_FIREBASE_PROJECT_ID` | From Firebase Console | Production, Preview, Development |
| `VITE_FIREBASE_STORAGE_BUCKET` | From Firebase Console | Production, Preview, Development |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From Firebase Console | Production, Preview, Development |
| `VITE_FIREBASE_APP_ID` | From Firebase Console | Production, Preview, Development |

### 4.5 How to Verify No Secrets Are Committed

Before any commit:

```bash
# Check that no .env files are tracked
git ls-files | grep -i '.env'

# Check that no Firebase config files are tracked
git ls-files | grep -i 'firebase'
git ls-files | grep -i 'service-account'
```

Expected `.gitignore` entries:
```
.env
.env.local
.env.development
.env.production
.env.test
*.firebase.json
service-account*.json
```

---

## 5. Security Preflight

The following security decisions are **owner-approved** and must be preserved:

| Decision | Status | Details |
|---|---|---|
| Public browsing without auth | Owner-approved | Visitors browse without signing in |
| Anonymous Firebase Auth | Owner-approved | Lazy: no session on page load; `signInAnonymously()` triggered only on first cart addition |
| Firebase Auth persistence | Owner-approved | `local` (browser-local persistence) |
| Firebase UID as permanent identity | Owner-approved | `auth.currentUser.uid` is the permanent customer identity |
| Guest cart recovery | Owner-approved | Guest cart data survives interrupted sign-in; recoverable after authentication |
| Customer logout | Owner-approved | Cart UI cleared immediately; customer's persisted cart not deleted; different user never sees previous cart |
| Admin privileges via custom claims | Owner-approved | Server-assigned custom claims only |
| Service-account credentials | **Never** in client code | Never in `VITE_*` variables, browser code, or Git |
| Firestore Security Rules | Owner-approved pattern | Default-deny; ownership enforced using verified authentication identity |
| App Check | Optional | Supplementary to Security Rules, not a replacement |

### Security Rules (Documented, Not Implemented)

```javascript
// Firestore Rules — NOT IMPLEMENTED YET (CP6)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /carts/{cartId} {
      allow read, write: if request.auth != null && request.auth.uid == cartId;
    }
  }
}
```

### App Check

App Check is **optional** and recommended for production. It verifies that requests originate from the genuine app but does not replace Security Rules.

---

## 6. Implementation Prerequisites

The following must be completed by the owner **before** Firebase Auth implementation (CP3) can begin:

| # | Prerequisite | Owner Action | OpenCode Action |
|---|---|---|---|
| 1 | Create Firebase project | Owner creates project in Firebase Console | — |
| 2 | Enable Authentication (Anonymous + Email/Password) | Owner enables in Firebase Console | — |
| 3 | Register web app and copy config | Owner copies `firebaseConfig` | — |
| 4 | Configure authorized domains | Owner adds `localhost` + production domain | — |
| 5 | Configure API key restrictions | Owner restricts key to Firebase Auth + authorized domains | — |
| 6 | Share `VITE_FIREBASE_*` values with OpenCode | Owner provides values via secure channel | OpenCode creates `.env.local` (not committed) |
| 7 | Create `src/firebase/config.js` | — | OpenCode creates module |
| 8 | Implement `AuthContext` migration | — | OpenCode implements (CP3) |

### Information OpenCode Needs from Owner (Non-Secret)

The owner must provide the following **non-secret** values from the Firebase Console project settings:

| Value | Example Format | Where Found |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` | Project Settings > General |
| `VITE_FIREBASE_AUTH_DOMAIN` | `dealsonwheels-92e55.firebaseapp.com` | Project Settings > General |
| `VITE_FIREBASE_PROJECT_ID` | `dealsonwheels-92e55` | Project Settings > General |
| `VITE_FIREBASE_STORAGE_BUCKET` | `dealsonwheels.appspot.com` | Project Settings > General |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `644698324314` | Project Settings > General |
| `VITE_FIREBASE_APP_ID` | `1:644698324314:web:abcdef123456` | Project Settings > General |

**Never provide:** Service account private keys, client secrets, or any token material.

---

## 8. Strict Boundaries

| Action | Status | Reason |
|---|---|---|
| Create Firebase project | **Not done** | Owner action only |
| Install Firebase SDK | **Not done** | CP3 implementation task |
| Modify application source | **Not done** | CP3 implementation task |
| Modify environment files | **Not done** | Owner provides values; OpenCode creates `.env.local` |
| Commit or push | **Not done** | Documentation checkpoint only |
| Deploy to production | **Not done** | Vercel hosting preserved; no deployment in CP3 |
| Place secrets in documentation | **Not done** | All secrets remain in `.env.local` / Vercel env vars |

---

## 9. Checklist Completeness

| Checklist Section | Status |
|---|---|
| Firebase project creation | ✅ Documented |
| Authentication provider enablement | ✅ Documented |
| Web app registration | ✅ Documented |
| Firebase config retrieval | ✅ Documented |
| Authorized domains | ✅ Documented |
| API key restrictions | ✅ Documented |
| Firestore creation | ✅ Documented (deferred to CP4) |
| Storage, Cloud Functions, Security Rules, App Check | ✅ Documented (deferred) |
| Environment variable template | ✅ Documented |
| Security preflight | ✅ Documented |
| Implementation prerequisites | ✅ Documented |

---

## 10. Remaining Owner Decisions

The following decisions require explicit owner approval before CP3 implementation:

1. **Firebase project creation** — Owner must create project in Firebase Console
2. **Firebase web API key domain/referrer restrictions** — Owner must configure key restrictions
3. **Authorized domains for Firebase Authentication** — Owner must add `localhost` and production domain

These are the **only** decisions blocking CP3 implementation. All other D8-related decisions are owner-approved.

---

## 11. Next Actions for Owner

1. Create Firebase project in Firebase Console
2. Enable Authentication (Anonymous + Email/Password)
3. Register a web app and copy the `firebaseConfig` values
4. Configure authorized domains (`localhost` + production domain)
5. Configure API key restrictions in Google Cloud Console
6. Share the non-secret `VITE_FIREBASE_*` values with OpenCode
7. OpenCode will create `.env.local` (not committed) and `src/firebase/config.js`
8. CP3 implementation can begin

---

## 12. Document References

| Document | Purpose |
|---|---|
| `docs/architecture/PHASE2-FIREBASE-READINESS.md` | CP1 architecture audit |
| `docs/architecture/PHASE2-CP2-ADAPTER-ARCHITECTURE.md` | CP2 adapter architecture |
| `docs/architecture/PHASE2-CP2-INDEPENDENT-REVIEW.md` | CP2 independent review |
| `docs/architecture/PHASE2-CP3-AUTH-IMPLEMENTATION-PLAN.md` | CP3 implementation plan |
| `docs/architecture/PHASE2-CP3-AUTH-INDEPENDENT-REVIEW.md` | CP3 independent review |
| `docs/architecture/PHASE2-CP3-ARCHITECTURE-READINESS-REPORT.md` | CP3 architecture readiness |
| **`docs/architecture/PHASE2-CP4-FIREBASE-PROJECT-SETUP.md`** | **This document** |

---

**End of document.** This checkpoint is preparation only. The Firebase project has **not** been created. No source code, tests, Firebase configuration, or dependencies have been changed. No commit or push has been performed.