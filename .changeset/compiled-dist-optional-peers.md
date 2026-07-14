---
"@nannier/canvas": major
---

Ship a compiled package instead of raw TypeScript, and make optional peers truly
optional.

**Packaging (breaking).** The package now publishes compiled ES modules +
`.d.ts` built from `tsconfig.build.json` (`dist/`), with platform forks
preserved as `.ios.js`/`.android.js`. `main`/`module`/`types` and the exports
map point at `dist`; `files` ships `dist` + `styles` + `CHANGELOG.md`. This
fixes the tarball being unresolvable for stock Metro/Expo consumers (the raw
source's NodeNext `.js` specifiers required a private resolver hack) and makes
consumer type-checking safe (`skipLibCheck` applies to `.d.ts`). Anything that
imported internal `src/...` paths must switch to the package root export.

**Optional peers (breaking for transitive reliance).** `expo-blur`,
`expo-glass-effect`, and now `react-native-qrcode-svg` are optional peer
dependencies loaded via guarded literal `require`: consumers who skip them
build cleanly and the features degrade gracefully (glass falls back to the
translucent fill; `<QRCode />` renders its labeled frame and warns once in
dev). `react-native-qrcode-svg` is no longer a hard dependency — install it if
you render QR codes.

**Safety nets.** `getComputedStyle`/`document` use in the web token helper is
now guarded (no crash on native/SSR import); `scripts/verify-package.ts` gates
CI and `prepublishOnly` (specifier-resolution integrity, platform-fork
preservation, no raw TS, no DOM types in the public `.d.ts` surface); the test
suite now smoke-renders components from the compiled `dist`.
