// The material capabilities a suite renders under, for the suites about the MECHANISM of an
// in-page surface's material (a pane's geometry and insets, its rim and tint, the frost's
// paint order, a mode switch that keeps state).
//
// Since 2026-10-28 the web resolves every surface in the page solid under glass, as the v4
// hand-off draws it (`resolveMaterial`'s "design" fallback): only a surface that floats over
// the page (a bar, a dialog, a sheet, a popover, a toast) takes the material there. Native
// builds keep the material on in-page surfaces too, so the mechanism still ships. A suite
// that holds that mechanism renders under a platform with its own frost, `platform: "other"`,
// whose resolution frosts an in-page surface; react-native-web then paints that material with
// the web host, the same paint every floating surface takes on the web. What a web in-page
// surface renders under glass (its complete solid skin) is held by test/web-glass-contract.test.tsx.
import { afterEach, beforeEach, spyOn } from "bun:test";
import * as runtime from "../../src/style/glass-surface/material-runtime.ts";
import type { MaterialCapabilities } from "../../src/style/glass-surface/material-resolution.ts";

/** A platform with its own frost, where an in-page surface still takes the material. */
export const IN_PAGE_FROST: MaterialCapabilities = { platform: "other", frost: true, liquid: false, requiresTarget: false };

// The probe is read through the original export, so a suite that turns the test DOM's
// backdrop-filter support off (the fallback to the solid skin) still reaches that fallback.
const { backdropFrostSupported } = runtime;

/**
 * Renders under `IN_PAGE_FROST` until the returned spy is restored. The frost follows the
 * test DOM's backdrop-filter probe, the one the web host paints its frost from.
 */
export function mockInPageFrost() {
  return spyOn(runtime, "useMaterialCapabilities").mockImplementation(() => ({ ...IN_PAGE_FROST, frost: backdropFrostSupported() }));
}

/**
 * Registers hooks that render every test of the enclosing `describe` (or the file, at the top
 * level) under `IN_PAGE_FROST`, restoring the runtime after each test.
 */
export function frostInPageSurfaces() {
  let spy: ReturnType<typeof mockInPageFrost> | undefined;
  beforeEach(() => { spy = mockInPageFrost(); });
  afterEach(() => { spy?.mockRestore(); spy = undefined; });
}
