# Canvas starter

A small Expo application using the published `@nannier-com/canvas` package. It runs on web, iOS, and Android with one component tree and Expo's default Metro resolution. It has its own dependency manifest and lockfile and does not import the Canvas checkout or docs app.

## Run

With access to the source repository:

```sh
git clone https://github.com/nannier-com/canvas.git
cd canvas/examples/starter
bun install --frozen-lockfile
bun run web
```

The terminal prints the development URL. For native builds, install the relevant platform toolchain first, then run one of:

```sh
bun run ios
bun run android
```

`bun run start` starts Metro without choosing a platform. The native commands create the ignored `ios/` or `android/` project and build the application on a connected device or simulator/emulator. iOS requires macOS, compatible Xcode and CocoaPods; Android requires the Android SDK and a supported JDK. No EAS project or cloud account is configured.

The locked Expo Modules JSI57.0.8 dependency carries a small compiler compatibility patch in `patches/`. Apple clang17 (Xcode26) rejects Swift's retained-return annotation on these constructors; the patch omits that annotation only for affected compilers and keeps it on clang18 and newer. Bun applies the checked-in patch during installation, so no manual edit to node_modules or platform version pin is needed.

```sh
bun run typecheck
bun run build:web
```

The web export is written to `dist/`. Deploy it with an SPA fallback to `index.html` so `/preferences` works on a direct visit.

## What works

- Workspace editing with required name/city/workstream validation, controlled Autocomplete selection and multi-selection.
- A saved summary that updates only when the workspace is saved.
- Appearance selection, including the device's current light/dark preference, and a switch that controls the workspace summary.
- Immediate preference previews, explicit save and cancel actions, and a Drawer containing a working nested navigation menu.
- Session reset from the Drawer, restoring the sample data and default preferences.

All state lives in React memory. Saving means **saved for this session**. Reloading or terminating the application restores sample values. There is no backend, account, network submission, notification service or persistent storage.

## Structure

| File | Purpose |
| --- | --- |
| `src/app/_layout.tsx` | Expo Router stack, SafeAreaProvider, ThemeProvider, overlay host, Canvas Navbar and Drawer |
| `src/app/index.tsx` | Workspace form and saved summary |
| `src/app/preferences.tsx` | Theme and layout preferences |
| `src/state/session.tsx` | Immutable draft/saved values, validation, save, cancel and reset |
| `src/app-frame/screen.tsx` | Scroll viewport, readable page width and page overlay host |

Controls, typography and layouts are Canvas components using semantic props. The small app frame owns the screen's safe area, scrolling and navigation viewport. Canvas's default component typography uses the platform/system font stack. This app loads no Geist or other custom font assets and does not replace global Text behavior; `expo-font` remains an Expo framework dependency.

## Published dependency and candidate checks

`package.json` pins the registry package to `@nannier-com/canvas@2.62.1` and pins the SDK57 React19.2.3 / React Native0.86.2 pair. Run installation inside this directory. There are no source aliases, custom Canvas Metro resolvers, package links or development overlays. To use Canvas in an existing app, install the package and its required peers there instead of copying this starter's SDK dependency versions into an unrelated project.

Maintainer candidate checks use a temporary copy of this app and install the sealed package tarball in that copy. They do not replace the dependency committed here. Test routes are enabled only with `EXPO_PUBLIC_CANVAS_SMOKE=1`; the ordinary app uses `com.nannier.canvas.starter` and the `canvas-starter` URL scheme, while that opt-in build uses the separate `com.nannier.canvas.starter.smoke` ID and `canvas-smoke` scheme. Build identity is supplied by the verification tooling, not fabricated by the app.

## Terms

The source repository, including this starter, remains all rights reserved. This example does not add a license grant. The compiled Canvas package distributed through npm has its own MIT license and notice; its grant does not extend to this repository's source.
