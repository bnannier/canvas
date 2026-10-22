# Android capture module

Canvas's native Android capture and frost renderer, the `CanvasBlur` Expo module. It ships
inside `@nannier/canvas`: Expo autolinks it from the package root's
`expo-module.config.json`, so an Expo SDK 57 app gets it by installing Canvas and
rebuilding its native app. Expo Go cannot load it, and an app leaves it out with
`"expo": { "autolinking": { "exclude": ["@nannier/canvas"] } }`. Its JavaScript binding is
`src/style/glass-surface/capture-module.tsx`, loaded by `capture-runtime.ts`.

The native renderer uses Android 12 (API 31) RenderNode and RenderEffect. Earlier
Android versions report `supported: false`; Canvas chooses another supported
material or its complete solid appearance. There is no iOS native module.

`PaintHost` preserves React Native's original background, border, corners and
overflow. Its content `CaptureHost` records an eligible backdrop only while
`captureEnabled` is true and a live frost consumer retains it. The visible
content recording stays separate from the sampled recording, which adds only
the paint owner's native background drawable. This keeps translucent fills
single-painted and excludes sibling overlay content from the sampled backdrop.
A direct decorative `CaptureHost` records its own paint without a parent underlay.

`FrostView` references that host through `targetRef` and accepts `intensity` and
`tint`. Sampling uses native matrices for ancestor transforms, scrolling and
separate-window offsets. Ancestor capture targets are rejected: a host that contains
the frost would record the frost that samples it. The frost then draws no blur and
calls its optional `onTargetRejected` once for that target, with
`{ targetId, reason: "ancestor" }`, so Canvas shows its complete solid appearance
instead. A host that is merely detached reports through `onAvailabilityChange` instead.
Idle and detached hosts release their capture recordings, while their foreground children
remain mounted. `getCaptureStats()` supplies lifecycle diagnostics for native
verification.

Canvas requires the complete `PaintHost`, `CaptureHost` and `FrostView` integration
before activating this renderer. A missing or partial integration selects the
complete solid appearance for surfaces that require this native capture path.
Canvas owns role selection and capture coordination; these primitives are internal.

The instrumentation tests in `src/androidTest` run against the sealed release tarball's
installed copy of this module (`scripts/native-smoke.mjs instrument`, see
`tools/native/README.md`); they are not part of the published package.
