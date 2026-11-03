# Phase 11 — public application recipes

Verified 2026-11-02. The private Expo recipe app now consumes the published `@nannier/canvas@4.1.0`; its exact dependency and Bun integrity entry are the only dependency changes. Existing React Native settings, operations dashboard, and studio booking flows supply the public app. No docs v4 hand-off page, chrome, or component skin changed.

## Build contract

From the repository root, run `node docs/scripts/prepare-recipes.mjs docs/dist`. From the docs directory, run `node scripts/prepare-recipes.mjs dist`. The module also exports synchronous `prepareRecipes(docsDist)` and `stageRecipes(exportDir, docsDist, provenance)` for tooling and boundary tests.

Run this stage **after** docs export, `prepare-pages.mjs`, inline CSS, and paint-first processing. Those processors impose docs SSR/font/entry conventions that the independent single-output recipe app does not use. The recipe stage refreshes the existing sitemap after adding `/recipes/`. Root integration owns the docs build/release command; this phase does not deploy anything.

The stage exports Expo web production output into an OS temporary directory with `experiments.baseUrl=/recipes` and no source-map option. It validates the export before replacing only `docs/dist/recipes/`, normalizes `assets/node_modules` to uploadable `assets/vendor`, and deletes temporary output in `finally`. Unexpected files, source maps or source-map references, symlinks, inline scripts, and HTML asset references outside `/recipes/` fail closed. Export metadata is omitted. Native and local recipe runs keep an empty base path.

Current generated output is four files, approximately 1.8 MiB:

- `/recipes/index.html`
- `/recipes/_expo/static/js/web/AppEntry-<hash>.js`
- `/recipes/LICENSE.canvas.txt`
- `/recipes/provenance.json`

All are under ignored `docs/dist/`. No compiled bundles, source archives, screenshots, reports, or traces are committed. Recipe app and repository source remain all rights reserved. The license is copied verbatim from the installed npm Canvas distribution, including its explicit distribution-only grant. The provenance notice records the exact npm version, registry tarball URL, lock integrity, and package-license SHA-256; it does not claim that the private recipe source is MIT. HTML metadata points to the license and provenance notice.

## Verification

- `bun run typecheck` in `examples/recipes`: passed.
- `bun test tools/docs/recipes.test.ts`: 2 tests, 21 assertions passed. Synthetic temporary fixtures verify isolated staging, preservation of docs files, stale-file removal, deterministic repeated staging, vendor assets, notices, and rejection of source/maps/archives/symlinks/inline scripts/root asset URLs before writing.
- Clean production generation: passed using actual installed npm Canvas 4.1.0. Output has no source-map references, embedded source maps, or local workspace paths.
- Served the combined `docs/dist` artifact through the repository static server with the unchanged `_headers`, then ran `CANVAS_RECIPES_TEST_URL=http://127.0.0.1:4187/recipes/ node examples/recipes/tests/interactions.mjs`: passed at 1280×900 and 390×900. The harness verifies settings validation/save/cancel, dashboard search/status/metrics/refresh/empty results, booking selection/invalidation/confirmation/cancellation, draft preservation across navigation, reload reset, keyboard activation/Escape, dark mode, and viewport bounds. Both viewports reported zero browser errors and zero CSP violations. Response assertions require Trusted Types and reject unsafe-inline/unsafe-eval in script-src.
- Captured and inspected actual Settings, Dashboard, and Booking renders at both viewports. Desktop shows paired panels; phone shows clean stacked panels and horizontally scrolling navbar navigation. All six temporary screenshots were deleted immediately after inspection.

## Limits

The recipe app is a client-rendered showcase requiring JavaScript. This phase does not add server rendering or individual recipe deep links. All three demos explicitly describe their session-only state: no backend, persistence, authentication, outgoing email, payment, actual availability, or business reservation. The production bundle uses a single external parser-created script and needs neither the docs paint-first loader nor another CSP hash; no policy relaxation was made. This phase verifies Chromium web behavior, not a new native/device build or physical-device assistive technology behavior.

## Public tutorial follow-up

Added `docs/public/recipes.md`, a plain Markdown tutorial covering the three actual flows, session reset behavior, exact npm 4.1.0 initialization/installation and installed doctor commands, and distribution-only license/provenance links. Its publication-ready instructions link to the generated `/recipes/` route; production deployment remains pending. No JSX examples, new UI, private repository links, or backend claims were added. The sitemap now admits only the additional root Markdown route `/recipes.md`, retaining its other exclusions. Focused `bun test tools/docs/sitemap.test.ts` passes (2 tests, 8 assertions).

## Integrated verification

The root integration appends recipe preparation after the docs processors, installs the recipe app from its frozen lockfile in the existing reusable release validation, and retains release-only GitHub triggers. The local combined artifact passed all three recipe flows again at 1280×900 and 390×900 under unchanged strict CSP. The guide receives Markdown/revalidation headers, and the refreshed sitemap contains 1,115 URLs. That first artifact preserved the original release's AI references.

Full source verification passed: 8,768 tests, eight skips, zero failures. Seven Python packaging tests passed both normally and in a minimal clean fixture without a generated root LICENSE. Typechecks, lint, package build/verification, size budgets, API/docs/audit/privacy/raster/design/notices checks passed. Independent review's two Python fixture portability/clean-checkout findings were fixed and re-reviewed. No production recipe deployment or new native runtime result is claimed by these local checks.

## Deployment authorization and source isolation

The owner approved committing/pushing the reviewed changes and deploying docs,
with npm and store releases disabled, while keeping the kit repository public.
An isolated worktree excludes unrelated in-progress icon edits. Its base is
`3fe1a496`, the already-committed README/USAGE update on main. That update had
regenerated the current 4.1.0 source snapshot; deployment verification must use
the sealed docs artifact and current snapshot manifest, rather than asserting
byte equality with the older npm-bundled documentation. Both identify themselves
as source snapshots. The published npm 4.1.0 package remains unchanged.
