---
"@nannier/canvas": patch
---

The component audit can photograph the docs on the iOS simulator and the Android emulator: an in-app capture driver built only into a separate "Canvas Audit" app (its own bundle identifier, package and URL scheme, so it installs beside the docs development app the Preview links open), the host that drives it over loopback HTTP and cuts each Playground card from the screen in every look and surface (`bun run audit:native`), the build that makes and installs it (`bun run audit:native:build`), and a test that keeps the driver out of every ordinary bundle. Repository tooling and docs only; nothing in the package changes.
