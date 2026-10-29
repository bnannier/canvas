import type { ThemeFonts } from "@nannier/canvas";
import WEB_FONTS from "./web-fonts.json";

// The docs' typefaces on the web (decision D20). The document owns the faces here:
// docs/src/app/+html.tsx declares the hand-off's three variable families, self-hosted as the
// woff2 files scripts/subset-fonts.mjs cuts into public/fonts (one @font-face per family
// with its `font-weight` range, from the manifest ./web-fonts.json the subsetter writes) and
// preloads them, so they are fetching before the bundle has arrived, and the server always
// renders the tree. The kit is handed one family string per role, so `fontWeight` stays on
// every style and the browser draws it from the variable file (a 300 display weight as 300,
// a 700 as 700, no synthetic bold), with the hand-off's fallback stack behind the family.
// The faces do not go through expo-font: its web @font-face carries only the family, the
// source and font-display, never a `font-weight` range, so a variable file registered through
// `useFonts` would be clamped to 400 and synthetic-bolded at every other weight. iOS and
// Android register static cuts through expo-font instead (./fonts.native.ts, the module
// Metro resolves there); both modules export the same names, so the root layout, the docs
// theme and the chrome need no fork.

/** The web gate is open outright: the document declares the faces and the server renders the tree. */
export function useDocsFonts(): [boolean, Error | null] {
  return [true, null];
}

export type SansWeight = "400" | "500" | "600" | "700";
export type MonoWeight = "400" | "500" | "600";

/** A family and the hand-off's fallback stack behind it, as one CSS font-family value. */
const stack = (family: string, ...fallbacks: string[]) => [`"${family}"`, ...fallbacks].join(", ");

const SANS = stack(WEB_FONTS.sans.family, "system-ui", "sans-serif");
const DISPLAY = stack(WEB_FONTS.display.family, "system-ui", "sans-serif");
const MONO = stack(WEB_FONTS.mono.family, "ui-monospace", "Menlo", "monospace");

/**
 * The faces the kit paints with (ThemeProvider `fonts`): one family per role carrying every
 * weight, so the kit's Text primitive keeps a style's fontWeight and the browser picks it
 * from the variable file. A module constant, so the theme value is not rebuilt on every
 * render.
 */
export const CANVAS_FONTS: ThemeFonts = { sans: SANS, display: DISPLAY, mono: MONO };

/**
 * The interface face for the docs' own chrome (the kit gets it through `fonts`): the sans
 * stack, which carries every weight, so a caller sets the weight on its own style. The
 * argument is the weight the native module picks a per-weight face by; here one family
 * serves them all, so it is unused.
 */
export const sans = (_weight: SansWeight = "400"): string => SANS;
