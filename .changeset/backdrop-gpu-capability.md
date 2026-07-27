---
"@nannier/canvas": patch
---

Backdrop: add the optional GPU-backend capability layer, inert for now.

Declares `@shopify/react-native-skia` as an OPTIONAL peer dependency and adds a
guarded capability probe behind it, so a later release can upgrade `Backdrop` to
a GPU renderer for the effects `react-native-svg` structurally cannot express
(procedural noise, real blur, thousands of bodies in one draw call).

Deliberately a patch rather than a minor: this adds no user-visible capability.
The GPU renderer does not exist yet, so every backdrop renders exactly the same
SVG baseline as before, on every platform, with or without the peer installed.
What ships is the plumbing and its guarantees.

The probe asks a capability question ("can this runtime allocate a Skia object
right now?"), never a platform question, so the eventual upgrade is progressive
enhancement rather than a platform fork. It resolves the peer through a guarded
`require`, which `verify-package` now enforces for this specifier alongside the
existing optional peers: a consumer without the package installed must never hit
an unresolved module.

Two new exports for apps that load a backend themselves, notably on web where
CanvasKit is fetched at runtime: `refreshBackdropRenderer()` re-runs the probe
and notifies mounted backdrops, and `useGpuBackdrop()` reports whether one is
live. Loading the backend stays the application's job, exactly as installing
`expo-blur` is, which keeps the WebAssembly glue out of the kit's module graph.
