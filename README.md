# Deals on Wheels

A front-end demo storefront for browsing car upgrades and used-car listings, built with React and Vite. The project currently runs entirely in the browser with static demo data; it is not a production marketplace and has no backend, database, real authentication, or payment processing.

## Status

This repository is in **Phase 0 stabilization**. The UI, routing, responsive layout, and accessibility work are in place, but several product areas are intentionally incomplete (see [Current limitations](#current-limitations)).

## Tech stack

- **React 19** with **Vite 7**
- **React Router 7** for client-side routing
- **Tailwind CSS 4** (PostCSS setup) plus a large hand-written stylesheet in `src/index.css`
- **Framer Motion** and **GSAP** for UI/page-transition animation
- **Lucide React** for icons
- **ESLint 9** for linting

## Requirements

- Node.js **20.19+** or **22.12+** (required by Vite 7)
- npm (the repository includes `package-lock.json`)

## Getting started

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

## Available scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Start the Vite development server with HMR. |
| `build` | `vite build` | Create a production build in `dist/`. |
| `preview` | `vite preview` | Serve the production build locally. |
| `lint` | `eslint .` | Run ESLint over the repository. |

There is no test script yet; the project does not currently have automated tests.

## Routes

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Home | Hero, category sections (Exterior, Interior, Tech), and a buy/sell teaser. |
| `/category/:type` | Category listing | `type` is one of `exterior`, `interior`, or `tech`. |
| `/category/:type/:childId` | Child category | Product listing for a category such as `wheels` or `audio`. |
| `/category/:type/:childId/:productId` | Product detail | Static product detail, quantity selector, and add-to-cart. |
| `/buy-sell` | Buy & Sell | Browse the static used-car inventory with grid/list views. |
| `/category/cars/used/:id` | Used-car detail | Vehicle details, specifications, reviews, and trade-in link. |
| `/trade/:id` | Trade-in | Demo trade-in form; submission only shows a browser alert. |
| `/sell-car` | Sell your car | "Coming Soon" placeholder; no listing flow yet. |
| `/cart` | Cart | Cart contents and order summary; checkout is disabled. |
| `/demo` | Transition demo | Registered only in development (`import.meta.env.DEV`); unreachable in production. |
| `*` | Not found | Global 404 page. |

`vercel.json` includes an SPA rewrite so the production build can be deployed to Vercel with client-side routing.

## Project structure

```text
src/
├── assets/
│   └── images/          # Category artwork imported by the app
├── components/          # Navbar, layout, cart drawer, auth modal, cards, transitions
├── context/             # Auth and cart providers
├── data/
│   ├── categories.jsx   # Static catalog categories and items
│   └── cars.jsx         # Static used-car inventory and reviews
├── hooks/
│   └── useDialogA11y.js # Shared dialog focus trap, Escape, scroll lock, focus restore
├── pages/               # Route-level pages
├── utils/
│   └── transitions.js   # GSAP page-transition helpers
├── App.jsx              # Route table and providers
├── index.css            # Global styles and responsive rules
└── main.jsx             # Browser entry point
public/
├── cars/                # Used-car photos
├── images/              # Product and category photos
├── logo.png
└── vite.svg             # Favicon
archive/                 # Verified-unused files moved out of the build (see archive/README.md)
```

Page-transition details are documented in [`TRANSITIONS_README.md`](./TRANSITIONS_README.md).

## Data and state

- Catalog categories, products, prices, used-car listings, and reviews are **static demo data** in `src/data/` and page-level maps.
- Search runs client-side against the static catalog.
- The cart is stored in `localStorage` under the `cart` key.
- Login/signup are **mock flows**: they wait briefly, create a demo user, and persist it in `localStorage` under the `user` key. No credentials are verified and no account is created.
- The hero background is loaded from an external Unsplash URL; all other imagery is local.

## Current limitations

These are deliberate gaps, not hidden production features:

- **No backend or API.** There is no server, database, cloud function, or persistence beyond `localStorage`.
- **No Firebase.** Firebase is not installed or configured.
- **No real authentication.** Login and signup are mock flows only.
- **No payment processing.** Cart checkout buttons are disabled and labeled "Checkout coming soon."
- **No seller listing flow.** `/sell-car` is a "Coming Soon" placeholder.
- **Trade-in form is a demo.** Submitting it shows a browser `alert` and sends nothing.
- **Static inventory.** Prices, stock, reviews, and vehicle data are hard-coded and may not be realistic.
- **No automated tests.** Verification during Phase 0 has been manual and scripted browser checks.
- **Lint is not clean yet.** `npm run lint` reports pre-existing issues (unused variables, hook dependency warnings, and Fast Refresh export notices).

## Accessibility notes

Phase 0 added keyboard and screen-reader support across the main flows:

- Dialogs (cart drawer, auth modal, mobile menu) trap focus, close on Escape, lock body scroll, and restore focus to the trigger.
- The mobile-menu focus trap stands down while the auth modal is layered above it.
- Interactive controls meet the 44 px touch-target guideline on small screens.
- The logo has an inset `:focus-visible` ring that is not clipped by the navbar crop.

## Archive and assets

Unused source files that were verified to have no import, route, or script references have been moved to `archive/` rather than deleted. See [`archive/README.md`](./archive/README.md) for the inventory and evidence.

An asset inventory (duplicates, dimensions, sizes, and unused-looking files) is maintained with the Phase 0 checkpoint artifacts outside this repository. No assets were deleted, converted, renamed, or replaced during housekeeping.

## License

MIT. See [`LICENSE`](./LICENSE).
