# Phase 1: installation and evaluation foundation

Started 2026-11-01. Base revision:
`1b51bef68135a9426fed9ef7e0dc3fa3dcb274bb`.

## Registry evidence

Public npm metadata was read on 2026-11-01 with:

```sh
npm view @nannier/canvas name version dist-tags license repository peerDependencies peerDependenciesMeta dist --json
```

- Name: `@nannier/canvas`.
- Version and `latest`: `4.0.0`.
- Repository: `https://github.com/bnannier/canvas`.
- Package license: MIT; the installed `LICENSE` explicitly excludes the source repository.
- Required peers: `react >=18`, `react-native >=0.74`, `react-native-svg >=15.8.0`.
- Tarball: `https://registry.npmjs.org/@nannier/canvas/-/canvas-4.0.0.tgz`.
- npm integrity: `sha512-Q1DuTEBMn4WbxrKcvHjnZeW23ZUJ9EjQxlPqhWXcOuC8nJt+LiPYKSyyx9NQgs4uBozzPJVva42U+M395uvkNQ==`.

The starter now pins this release, with the same integrity in its Bun lockfile,
and imports from the canonical package name. Its previous dependency was
`@nannier-com/canvas@2.62.1`. Stale references to the proposed `@ionizeio` scope
and repository URL were removed from the starter. No library API changes were
needed. The root installation guide now distinguishes Expo-managed dependencies
from an existing bare RN/RNW application and explains how to check release identity.

## Verification

Host: macOS 27.0.1, Node 26.10.0, Bun 1.4.2. The starter retains its locked
Expo 57, React 19.2.3 and React Native 0.86.3 environment.

| Check | Result |
| --- | --- |
| Starter registry install and frozen-lockfile reinstall | Passed |
| Starter `bun run typecheck` | Passed |
| Starter `bun run build:web` | Passed |
| Existing starter browser suite, Chromium and WebKit desktop/touch | 24 passed |
| Existing starter browser suite, Firefox | 6 blocked before test execution: browser exited with `Could not find profile folder`; a canonical `/private/tmp` profile path and a fresh temporary Firefox 156 runtime did not resolve it |
| Temporary desktop capture of the migrated starter | Inspected; workspace form and saved summary render; capture not retained in Git |
| Expo export for web, iOS and Android | Passed; native bundles are packaging evidence, not device-runtime evidence |
| Direct starter iOS build/runtime | Release build passed (0 errors, 1 warning); workspace, preference changes/save, Drawer/nested navigation and reset verified on iOS 27 simulator |
| Direct starter Android build/runtime | Release build passed with existing JDK 17; installed on `canvas_audit` (API 35), Maestro flow passed 1/1: workspace save, preference changes/save, nested navigation and reset. JDK 25's prefab parser failure was a toolchain issue. |

Browser command, run from the repository root:

```sh
bunx --no-install playwright test --config e2e/starter/playwright.config.ts --reporter=list --workers=2
```

The suite verifies registry identity/no overlay, form validation, save/cancel,
preference previews, navigation, reset, nested overlay Escape/focus behavior and
absence of internal test routes. No screenshots, video or traces are enabled.

Native builds were run from `examples/starter`:

```sh
bunx --no-install expo run:ios --configuration Release \
  --device 47FA146E-AA59-4A4B-9B5E-F4B0DF599A11 --no-bundler \
  --output /private/tmp/canvas-starter-ios-build

ANDROID_SERIAL=emulator-5554 \
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
ANDROID_HOME=/Users/bnannier/Library/Android/sdk \
bunx --no-install expo run:android --variant release \
  --device canvas_audit --no-bundler
```

Both ran `com.nannier.canvas.starter`. iOS interaction was inspected through
Device Hub. Android used Maestro against `emulator-5554`, with one temporary flow
and JUnit output: 1 passed, 0 failures, 28.22 seconds. The flow exercised workspace
save, the Preferences deep link, Dark selection, the summary toggle, preference
save, Drawer/nested Workspace navigation, and reset. Temporary captures and the
Maestro debug directory were deleted, and both test devices were stopped.

## Agent pilots

The five prompts and evaluator criteria are frozen as suite
`canvas-consumer-phase1`, revision 1. The blank result template remains unexecuted;
actual observations are recorded separately in [the pilot record](pilots-2026-11-01.json).
Each client received the exact case prompt, with no evaluator correction messages.
No reviewer changed the generated applications.

All ten completed consumers independently passed typechecking and production web
export. The following are observed browser checks, not full task scores:

| Task | Codex pilot | Claude pilot |
| --- | --- | --- |
| Installation and counter | Pointer/keyboard counter checks passed | Pointer/keyboard counter checks passed |
| Settings form | Validation, toggle, save and draft separation checks passed; personal skill loaded | Same interaction checks passed |
| Responsive dashboard | Layout, five scrollable activity entries and Refresh checks passed; personal skill loaded | Same interaction checks passed |
| Accessible dialog | Focus restoration failed after Escape and Cancel at both widths | Focus, background blocking, cancellation, save and reopening checks passed |
| Missing optional QR peer | Real fallback mounted; clipboard and success feedback passed | Same fallback/action checks passed |

The Codex dialog failure is retained without a reviewer fix. Its generated screen
disables and hides the opener while the dialog is open. That is a useful diagnostic
lead, not a proven root cause: distinguish application integration from a package
focus-lifecycle defect before changing Canvas. Save/reopening checks in that
consumer were not reached after the focus assertion failed.

The clients were Codex CLI 0.166.0, requesting `gpt-6.1-sol` at medium effort,
and Claude Code 2.1.310, requesting `sonnet` at medium effort and reporting
`claude-sonnet-5-5`. These are diagnostic pilots, not a controlled comparison:

- The first Claude installation attempt could not reach npm under its sandbox
  policy. It produced no application. A separate fresh attempt allowed the npm
  registry and official Canvas/Expo domains; the original remains an infrastructure
  block, not a Canvas failure.
- Initial settings fixtures accidentally omitted dependency build directories.
  Those attempts were invalidated. Corrected copies were independently typechecked
  and exported before subsequent runs.
- The completed Codex settings and dashboard runs loaded a personal `solid-ui`
  skill despite directory-level disable settings. They are personalized pilots.
  Later runs disabled both skill directories and files; no skill reads were observed
  there, but full instruction isolation is still unproven.
- The installation tasks independently selected different Expo versions. The other
  tasks received independent copies of the same blank official SDK 57 scaffold,
  without Canvas or the licensed product starter. Tool/network policies still differed.

Consequently, no model ranking or success-rate comparison is justified. The record
separates observed checks from untested criteria and includes the prompt, lockfile
and source hashes. Runtime checks use Chromium at 1280 and 390 CSS pixels. Native
runtime of these generated applications was not attempted; the starter's separate
iOS and Android passes do not establish their native behavior. Dashboard browser
zoom at 200% and a full visual clipping review remain untested.

## Findings for the next phase

1. **Published installation works.** The starter now installs the canonical v4
   package and its existing interactions work on all three platforms. Every pilot
   used the same official Canvas tarball; no package substitution was needed.
2. **Retrieval can return an old documentation version.** Agent retrieval returned
   cached v3.12.1 homepage content. A direct public fetch on 2026-11-01 showed
   v4.0.0 (HTML SHA-256
   `6b3f16751b73fdd5ac8e68571596a1629a6499815e41a7b2538435129022624b`).
   This is evidence of stale retrieval, not evidence that the live deployment is old.
   Prioritize versioned Markdown, explicit package/version metadata and a small
   component index in phase 2. Measure whether they reduce stale API retrieval and
   the need to inspect compiled declarations.
3. **A clean comparison needs better isolation.** Keep these pilots as troubleshooting
   evidence. Before measuring a consumer skill's effect in phase 3, freeze client
   policies, verify instruction isolation and complete the missing runtime criteria.
4. **Types helped agents repair API guesses.** Recorded self-corrections include
   an invalid `Icon name` prop, `useTheme().colors` instead of `tokens`, and
   `Typography selectable`. These errors were repaired within the agent attempts;
   they are not final task failures. The phase-2 catalog should make supported
   props and return types easy to retrieve before code is written.

Installation and starter verification are complete. The pilot record establishes
initial usability evidence, with the coverage limits above. No release has been
dispatched by this work.
