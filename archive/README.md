# Archive

This directory holds files that were verified to have no active import, route, script, or runtime references during Phase 0 housekeeping (Checkpoint 5). Files were **moved**, not deleted, and keep their original repository-relative paths so they can be restored with a simple copy.

Nothing here is part of the Vite build. Restoring a file means copying it back to the same relative path.

| Archived file | Original path | Why it is unused |
| --- | --- | --- |
| `append_mobile_css.mjs` | `append_mobile_css.mjs` | One-off script that appended mobile CSS to `src/index.css`. Not referenced by any package script, source file, route, or documentation. Its output is already present in `src/index.css`. |
| `fix_css.js` | `fix_css.js` | One-off CommonJS helper that removed null characters from `src/index.css`. Not referenced anywhere. |
| `fix_css.mjs` | `fix_css.mjs` | ESM duplicate of `fix_css.js`; not referenced anywhere. |
| `fix_css.py` | `fix_css.py` | Python duplicate of the same one-off null-character cleanup; not referenced anywhere. |
| `scripts/fix_background.py` | `scripts/fix_background.py` | One-off Pillow/NumPy script for editing one product image. Not referenced by any package script or source file, and not part of the build. |
| `src/App.css` | `src/App.css` | Vite template stylesheet; not imported by `src/main.jsx`, `src/App.jsx`, or any other module. |
| `src/components/Sidebar.jsx` | `src/components/Sidebar.jsx` | React component with no importers; the sidebar UI is not part of any route. |
| `src/pages/ChildCategoryPage.jsx.backup` | `src/pages/ChildCategoryPage.jsx.backup` | Editor backup copy of `ChildCategoryPage.jsx`. The `.jsx.backup` extension is not resolvable by Vite and no source file references it. |

## Evidence summary

- A full static import graph starting at `src/main.jsx` reached every file still under `src/` except `src/App.css`, `src/components/Sidebar.jsx`, and `src/pages/ChildCategoryPage.jsx.backup`.
- `src/components/PageTransitionAdvanced.jsx` and `src/utils/transitions.js` are also unreachable from the main entry, but they are **not archived**: they are a documented optional transition feature referenced by `TRANSITIONS_README.md` and the `/demo` page instructions, so they are not clear-cut unused code.
- `src/assets/react.svg` has no references, but it is an asset; assets were intentionally not archived merely for lacking a direct import.
- Package scripts are only `dev`, `build`, `preview`, and `lint`; none invoke the archived helper scripts.
- No dynamic `import()` or `require()` calls exist in `src/` that could reference the archived modules.
- The archived files are preserved byte-for-byte; the CP5 checkpoint artifacts (`archived-files.csv`) record their SHA-256 hashes and pre-move counterparts.
