import { useSyncExternalStore } from "react";

// Capability probe for an optional GPU drawing backend (@shopify/react-native-skia).
//
// The kit's baseline renderer is react-native-svg, a REQUIRED peer, so a Backdrop
// always draws. Skia is optional: when a consumer installs it and its backend is
// live, the engine can upgrade to a renderer that does things SVG structurally
// cannot (procedural noise, real blur, thousands of bodies in one draw call).
//
// Two rules this file exists to enforce.
//
// 1. The require is GUARDED, never a static import, AND it sits directly inside the
//    try block with nothing between the two. Both halves are load-bearing.
//
//    The static-import half: `scripts/verify-package.ts` fails the build on a static
//    import of an optional peer, because a consumer without the package installed
//    would otherwise get an unresolved module.
//
//    The placement half: Metro decides whether a dependency is optional in
//    `isOptionalDependency` (metro/src/ModuleGraph/worker/collectDependencies.js).
//    It walks up from the require call and, at the FIRST enclosing block statement,
//    returns whether that block belongs to a TryStatement. It does not keep
//    climbing. So wrapping the call in `if (typeof require === "function")`
//    interposes the IF's own block, the answer comes back false, and Metro registers
//    a REQUIRED edge: a consumer who skipped the optional peer then fails to bundle
//    with "Unable to resolve module". Verified against metro 0.84.4 by running the
//    collector on both shapes; the guarded form reports optional=undefined and the
//    hoisted form reports optional=true. Expo enables this via
//    `allowOptionalDependencies: true` in @expo/metro-config.
//
//    A `typeof` guard would buy nothing anyway: where `require` is undefined the
//    ReferenceError lands in the same catch.
//
//    Same shape as src/style/glass-surface/glass-surface.tsx.
//
// 2. The probe asks a CAPABILITY question, never a platform question. "Can this
//    runtime construct a Skia object right now?" is false on a web runtime before
//    CanvasKit has been fetched and true afterwards, and it is identical code on
//    every platform. Branching on Platform.OS to pick a renderer would be the
//    web-only escape hatch CLAUDE.md bans; progressive enhancement on a real
//    capability is not.
//
// Loading the backend is the APPLICATION's job, exactly as installing expo-blur
// is. On native the module links itself; on web the app fetches CanvasKit and then
// calls refreshBackdropRenderer(). Keeping that out of the kit keeps the
// Emscripten glue out of the kit's module graph entirely.

/** The sliver of the Skia module surface this probe needs. Deliberately minimal:
 *  the real types arrive with the renderer, not with the probe. */
interface SkiaModule {
  Skia?: { Paint?: () => unknown };
}

declare const require: (id: string) => unknown;

let skia: SkiaModule | undefined;
try {
  // Directly in the try block. See rule 1 above: an intervening `if` makes Metro
  // treat this as a required dependency and breaks every consumer without the peer.
  skia = require("@shopify/react-native-skia") as SkiaModule;
} catch {
  skia = undefined;
}

/** The resolved module, for the renderer to draw with. Undefined when the peer is
 *  absent, which is the normal case and never an error. */
export function skiaModule(): SkiaModule | undefined {
  return skia;
}

/** Is a drawing backend live in this runtime right now? Constructing a throwaway
 *  Paint is the cheapest honest answer: the module can be present while its
 *  backend is not yet loaded, and only an actual allocation distinguishes them. */
function probe(): boolean {
  if (!skia?.Skia?.Paint) return false;
  try {
    skia.Skia.Paint();
    return true;
  } catch {
    return false;
  }
}

let live = probe();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): boolean {
  return live;
}

/** Re-run the probe and notify mounted backdrops. An app calls this once its GPU
 *  backend has finished loading (on web, after CanvasKit resolves); every mounted
 *  surface then upgrades on its next commit. Safe to call any number of times. */
export function refreshBackdropRenderer(): void {
  const next = probe();
  if (next === live) return;
  live = next;
  listeners.forEach((l) => l());
}

/** Whether the GPU renderer is available to draw with. False means the SVG
 *  baseline renders, which is a complete picture rather than a degraded one. */
export function useGpuBackdrop(): boolean {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
