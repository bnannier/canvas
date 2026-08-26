---
name: canvas-optional-peer
description: Add or consume an OPTIONAL peer dependency in the Canvas RN kit so the package stays installable and buildable for consumers who skip it. Covers the guarded literal-require pattern, graceful labeled fallback, single dev warning, and package.json wiring. Use whenever a component needs a heavy or native third-party module (a QR renderer, a blur/glass native module, a chart lib) that not every consumer will install, or when a static import of such a module breaks the build for anyone who skipped it.
---

# Add or consume an optional peer dependency

Canvas has three optional peers today: `react-native-qrcode-svg`, `expo-blur`,
`expo-glass-effect`. The contract: a consumer who never installs the peer must
still `npm install` and BUILD `@nannier-com/canvas` cleanly, and the feature that
needs it degrades to a labeled placeholder instead of crashing. A static
`import "expo-blur"` breaks module resolution for EVERY consumer who skipped it,
so an optional peer is NEVER statically imported. Use the guarded literal require
below.

## The guarded literal require (copy this)

From `src/style/glass-surface/glass-surface.tsx`:

```ts
import type * as ExpoBlurTypes from "expo-blur"; // type-only: erased, never emitted

declare const require: ((id: string) => unknown) | undefined;
let BlurView: typeof ExpoBlurTypes.BlurView | undefined;
try {
  if (typeof require === "function") {
    BlurView = (require("expo-blur") as { BlurView?: typeof ExpoBlurTypes.BlurView }).BlurView;
  }
} catch {
  BlurView = undefined;
}
```

Each line earns its place:
- `import type * as …`: a TYPE-ONLY import. It is erased at compile time, so it
  emits no runtime `require`/`import` and does not force the peer to resolve; it
  only gives you the real types to annotate the guarded binding.
- `declare const require: … | undefined;`: declares the symbol without pulling
  `@types/node`. The `| undefined` is what lets `typeof require === "function"`
  narrow safely.
- `typeof require === "function"`: keeps a PURE-ESM runtime (where `require`
  does not exist) alive. The binding just stays `undefined` and you fall back,
  instead of a `ReferenceError`.
- `require("expo-blur")` with a STRING-LITERAL id: a bundler that HAS the peer
  installed still statically sees the literal and includes it; a consumer without
  it hits the `try/catch` at runtime and degrades.
- `catch { … = undefined }`: a missing module throws at require time, so swallow
  it and leave the binding `undefined`.

Default-export peers (like `react-native-qrcode-svg`) need interop: take the
`.default` if present, else the module itself
(`src/atoms/qrcode/qrcode.shared.tsx`):

```ts
const mod = require("react-native-qrcode-svg") as { default?: typeof RNQRCodeType } | typeof RNQRCodeType;
RNQRCode = (mod as { default?: typeof RNQRCodeType }).default ?? (mod as typeof RNQRCodeType);
```

Do NOT:
- static-import the peer (`import { BlurView } from "expo-blur"`): resolution
  fails at build for everyone who skipped it.
- use a computed/variable id (`require(pkgName)`): bundlers cannot follow it, so
  consumers who DO have the peer never get it bundled.
- `await import("expo-blur")`: turns the surface async and still hard-requires
  resolution in most bundler configs.

Per-platform peers live in the matching fork so other platforms never pull them:
`expo-glass-effect` (iOS-only Liquid Glass) is required only in
`glass-surface.ios.tsx` and `liquid-glass.ios.ts`; the base
`glass-surface.tsx` / `liquid-glass.ts` never mention it.

## Graceful fallback + one dev warning

When the binding is `undefined`, render a LABELED placeholder that holds layout,
never a crash:
- `QRCode` keeps its accessible frame and returns an empty `View` sized like the
  code (`width/height = sizeOf(props)`), so the layout does not collapse
  (`qrcode.shared.tsx`).
- `GlassSurface` returns `PlainSurface` (the translucent `popover` fill), so the
  overlay still reads as a surface.

Warn AT MOST ONCE in dev, gated by a module-level flag plus the runtime-agnostic
`isDevMode()` (Metro defines `__DEV__`; web bundlers define
`process.env.NODE_ENV`; unknown runtimes default to dev). From
`qrcode.shared.tsx`:

```ts
let warnedMissing = false;
function isDevMode(): boolean {
  try { if (typeof __DEV__ !== "undefined") return __DEV__; } catch { /* not defined */ }
  try { return process.env.NODE_ENV !== "production"; } catch { return true; }
}
// …in the fallback branch:
if (isDevMode() && !warnedMissing) {
  warnedMissing = true;
  console.warn("[canvas] <QRCode /> requires the optional peer dependency react-native-qrcode-svg. Install it to render QR codes.");
}
```

The message names the EXACT package to install. Never bare `__DEV__` (it is
undefined in non-Metro bundlers); always route through `isDevMode()`.

## package.json wiring (both places, or npm treats it as required)

List the peer in TWO spots:
- `peerDependencies`: `"expo-blur": "*"` (use `*` when any version works, a real
  range like `">=6"` when it matters, e.g. `react-native-qrcode-svg`).
- `peerDependenciesMeta`: `"expo-blur": { "optional": true }`. This is what
  suppresses the missing-peer install warning/error for consumers who skip it.

Do NOT put an optional peer in `dependencies` (forces the install AND its bundle
weight on everyone). Do NOT add `"type": "module"` to package.json: dist mixes
the guarded `require` with ESM, and strict-ESM bundlers (webpack) drop a `require`
under `"type": "module"`. Canvas intentionally omits the `type` field.

New optional peer means a changeset (`.changeset/<slug>.md`): it changes the
public install contract.

## Verify

```bash
bun run build            # rm -rf dist && tsc -p tsconfig.build.json
bun run verify-package   # bun scripts/verify-package.ts (after build)
```

`scripts/verify-package.ts` only checks RELATIVE specifiers
(`/(\.\.?\/…)/`) resolve in dist, so a bare literal id like `"expo-blur"` is
correctly ignored and the guarded require passes. It also confirms platform forks
survive (`.ios.js`/`.android.js`), no raw `.ts` leaks, and no DOM types in the
public `.d.ts`. `verify-package` is wired into CI and `prepublishOnly`
(`bun run build && bun run verify-package`); never `npm publish` locally, CI
releases.

`test/dist-smoke.test.tsx` renders components FROM dist with NONE of the optional
peers installed, so it exercises the fallback path: if a static import slipped in,
the dist import throws here. Run the kit suite (`bun test`) after wiring a new
peer.
