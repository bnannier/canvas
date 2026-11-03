# Canvas application recipes

Three complete frontend flows share one small Expo app: profile settings, an operations dashboard, and studio booking. Every control, surface, and content layout uses the published `@nannier/canvas` **4.1.0** package. There are no workspace aliases, source overlays, or private kit changes.

The source in this repository remains all rights reserved. `private: true` and `UNLICENSED` prevent accidental publication; they do not grant a source license.

## Run

Use Bun 1.4+ and Node 22.13+ (Node 26 also works). From this folder:

```sh
bun install --frozen-lockfile
bun run web
```

Open the URL printed by Expo. Use the navbar to switch recipes and the Dark mode switch to change appearance. Set `initialRecipe` in `recipe-config.json` to `settings`, `dashboard`, or `booking` to select the first screen. Drafts survive recipe navigation. Reloading or restarting restores all sample data.

```sh
bun run typecheck
bun run build:web
bun run ios
bun run android
```

`build:web` writes a static export to `dist/`. Serve it with any static HTTP server. `ios` needs macOS, Xcode, CocoaPods and an installed simulator; `android` needs a JDK, Android SDK and emulator/device. The first native run generates local `ios/` or `android/` projects; those generated folders are ignored.

The app uses the same React Native source on iOS, Android, and web. The platform package condition selects Canvas's native build automatically. Only app-frame viewport sizing and background styles are explicit; forms, cards, grids, spacing, labels, and controls use Canvas's semantic API. Grid measures its own container, so two-column pages collapse to one column inside a phone or narrow pane. Navbar's navigation row scrolls when it does not fit.

## What works

- **Settings:** edit name and email, toggle project updates and a weekly digest, validate required fields, save a trimmed profile, cancel back to the saved values, and inspect a saved summary. Enter submits and an invalid text field receives focus.
- **Dashboard:** search work by title, owner, or reference; filter by status; inspect metrics calculated from the filtered results; reset an empty result; and refresh sample progress. Each refresh advances one work item's progress by seven points (capped at 100), changes its status to Ready when complete, and updates the local activity log.
- **Booking:** choose a service, one of the next five dates, and a corresponding time slot; enter a name and valid email; confirm a sample reservation; and cancel or clear it. Changing service or date clears the selected time. Times use the device's local timezone.

All data lives in React state. There is no backend, persistence, authentication, email delivery, payment, or business reservation. Sample availability does not check a real calendar. Connect these explicit state transitions to your own services before using them for real operations.

## Files

- `App.tsx`: shared safe-area, theme, navigation, and screen frame.
- `recipe-config.json`: selectable initial recipe.
- `src/recipes/settings.tsx`: profile model and settings screen.
- `src/recipes/dashboard.tsx`: filtered work model, metrics, and activity.
- `src/recipes/booking.tsx`: date/slot selection, validation, and reservation state.
- `app.config.js`: Expo platform configuration.

The exact lockfile resolves Canvas from npm, rather than a parent checkout. There are no optional glass peers because these recipes use solid surfaces. Standard npm/Bun overrides and the lockfile pin `expo-modules-core@57.0.24` and `expo-modules-jsi@57.1.3`, including the upstream Swift pointer capture and Clang annotation compatibility fixes. No dependency patch is needed. `enableSceneSupport` adopts the scene lifecycle required by the current iOS SDK. After changing app configuration, regenerate existing native projects with `bunx expo prebuild --clean` (this replaces generated native directories).

## Repository interaction checks

The source checkout includes `tests/interactions.mjs`, which reuses the repository's existing `@playwright/test` installation. Install the root development dependencies and Playwright Chromium first, then:

```sh
bun run build:web
node tests/interactions.mjs
```

The harness serves only this app's static export on a temporary localhost port, drives real Chromium at 1280×900 and 390×900, and closes both resources when done. It verifies all three flows, keyboard activation, validation, cancellation, preserved state on navigation, dark mode, filtered metrics/progress, empty results, slot invalidation, reload reset, viewport bounds, and browser errors. It writes text results only; screenshots and traces are not retained.

The public docs build stages the same app at `/recipes/` after its own postprocessors, using `node docs/scripts/prepare-recipes.mjs docs/dist` from the repository root. This runs a production export with the `/recipes` base path in a temporary directory, copies only compiled web files into ignored `docs/dist/recipes/`, and includes the installed npm package's `LICENSE.canvas.txt` plus `provenance.json`. Source maps and source archives fail the staging check. The recipe source stays private and unlicensed; the Canvas MIT grant remains scoped to the published package.

To check that combined artifact under the docs' existing strict CSP, serve `docs/dist` with `bun e2e/support/serve-dist.ts --root docs/dist --port 4173 --headers --no-spa` from the root, then run `CANVAS_RECIPES_TEST_URL=http://127.0.0.1:4173/recipes/ node examples/recipes/tests/interactions.mjs`. This also asserts that the response requires Trusted Types, has no unsafe script allowances, and reports zero CSP violations.

`tests/native-flow.yaml` also drives the three flows on an installed native release app through Maestro. Pass `APPOINTMENT_DATE` as the first displayed date label (the device locale determines its formatting). The flow includes a horizontal navbar swipe for the audit phones:

```sh
maestro --udid YOUR_DEVICE_ID test tests/native-flow.yaml -e "APPOINTMENT_DATE=Mon, Nov 2, 2026"
```

Keep Maestro debug output outside the repository and delete generated screenshots after inspection. TypeScript, browser checks, and simulator automation do not establish VoiceOver/TalkBack announcements or physical-device behavior; verify those separately.

Verified on 2026-11-01: strict TypeScript, Expo static web export, Chromium interactions at 1280×900 and 390×900, an iOS Release simulator build (Canvas Audit, iOS 27.0, SDK 27.2), and an Android arm64 Release build (canvas_audit, API 35, JDK 17). The native Maestro flow passed on both platforms, including profile save, filtered dashboard metrics and refresh, booking confirmation/cancellation, and state preserved across navigation. These are simulator/emulator results.
