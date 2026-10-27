// The web glass material: the v4 hand-off's lit glass, the one material a browser renders
// under `<ThemeProvider glass>`: the page behind a surface blurred and saturated
// (`--bf: blur(20px) saturate(1.6)`), the layer's tint over it (`--gl`, the card surface at
// 62% on the functional layer), and a 1px rim in the hand-off's strong hairline (`--ln2`).
// It also holds the blur the modal scrim lays over the page it dims (the hand-off's
// `blur(2px)` under `--scrim`, rendered by scrim-frost.tsx). This table is the only place
// their numbers live, the tunables the tuning harness judges against the `v4-glass`
// reference card (tools/native/liquid-motion.md; harness route /testing/materials). The
// gate in .tuning-harness.json refuses a push that changes a value here without an
// evidence row.
//
// iOS Liquid Glass and the native frosts do not read this file: Android's tints are the
// public `glassByScheme` (glass-tints.android.ts), iOS's its own table (ios-tints.ts).

import type { ColorScheme, GlassTokens } from "../tokens.js";
import type { GlassLayer } from "./glass-surface.shared.js";

export const WEB_FROST = {
  /** The backdrop blur in px: the hand-off's `blur(20px)`. */
  blur: 20,
  /** The backdrop saturation the blur carries: the hand-off's `saturate(1.6)`. */
  saturate: 1.6,
  /** The modal veil: blur the backdrop by two pixels, as the hand-off's overlay stages do. */
  veilBlur: 2,
  /**
   * A clear surface (a field on its pane, a pill) frosts nothing: the hand-off draws its
   * fields as a plain fill, so the backdrop reads through them unsoftened.
   */
  clearBlur: 0,
  /** The sheer content treatment: the layer's fill drawn at this opacity. */
  sheerFillOpacity: 0.75,
  /** The rim: one inset hairline, no specular highlight and no refraction. */
  rimWidth: 1,
  /** The hand-off's strong hairline (`--ln2`), the rim on every layer. */
  rim: { light: "rgba(17, 17, 24, 0.16)", dark: "rgba(255, 255, 255, 0.16)" } as Record<ColorScheme, string>,
  /**
   * The modal scrim's backdrop blur in px: the hand-off's `blur(2px)` under its dim (the
   * `scrim` token), on the web under glass only. 0 turns it off.
   */
  scrimBlur: 2,
} as const;

/**
 * The layer tints: the hand-off's `--gl` (its card surface at 62%) on the functional
 * layer; the content and dense panes the same surface denser, so text keeps its contrast
 * over any page (test/glass-tint.test.tsx holds the ordering and the floors); the control
 * puck the raised step (`secondary`) at control density. One set per scheme: the accent
 * palette never moves the glass.
 */
export const WEB_TINTS: Record<ColorScheme, GlassTokens> = {
  light: {
    "glass-tint": "rgba(255, 255, 255, 0.62)",
    "glass-tint-content": "rgba(255, 255, 255, 0.8)",
    "glass-tint-control": "rgba(241, 241, 246, 0.72)",
    "glass-tint-dense": "rgba(255, 255, 255, 0.92)",
  },
  dark: {
    "glass-tint": "rgba(18, 18, 26, 0.62)",
    "glass-tint-content": "rgba(18, 18, 26, 0.8)",
    "glass-tint-control": "rgba(30, 30, 41, 0.72)",
    "glass-tint-dense": "rgba(18, 18, 26, 0.92)",
  },
};

/** The backdrop filter for a blur radius: the radius with the material's saturation. */
export function webBackdrop(blur: number): string {
  return `blur(${blur}px) saturate(${WEB_FROST.saturate})`;
}

/** The rim colour for a layer: the hand-off's strong hairline on every layer. */
export function webRimColor(_layer: GlassLayer, scheme: ColorScheme, _border: string): string {
  return WEB_FROST.rim[scheme];
}
