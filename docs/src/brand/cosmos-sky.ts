import { Platform } from "react-native";
import { type ColorTokens } from "@nannier/canvas";

// Pure data for the Canvas Universe backdrop: a seeded star atlas, the component
// constellations, and the brand-derived palettes. No React here; cosmos-layers.tsx
// renders this data and cosmos.tsx animates it. Everything is generated ONCE at
// module scope from a fixed seed, so the sky is identical across renders, screens,
// and platforms (a shuffling sky would read as a bug, not a universe).

// Deterministic PRNG (mulberry32). The seed is arbitrary but FIXED: the atlas is
// part of the brand art, not a random effect.
const SEED = 20260710;
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Stars: tokens are the stars. Unit-square positions (multiplied by the live
// viewport at render), radius in px, a per-dot alpha factor, and a rare brand
// spectrum accent (the canvas-mark conic hues) roughly 1 dot in 9.
// ---------------------------------------------------------------------------

export interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  hue: number; // -1 = base tint, otherwise an index into SPECTRUM
}

// The conic C's hues (docs/src/brand/canvas-mark.tsx STOPS), used as rare star
// accents so the sky quietly carries the brand spectrum.
export const SPECTRUM = ["#27cdf2", "#46e082", "#ffb43d", "#ff2d6e", "#b24dff"];

function makeStars(count: number, rng: () => number, rMin: number, rMax: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: rng(),
    y: rng(),
    r: rMin + rng() * (rMax - rMin),
    a: 0.35 + rng() * 0.65,
    hue: rng() < 0.11 ? Math.floor(rng() * SPECTRUM.length) : -1,
  }));
}

// The static backdrop sheet behind the flight shells: ONE atlas, identical on every
// screen (the whole composition is unified so navigation is pixel-continuous).
// Android gets fewer dots purely as a perf tuning constant.
const rng = mulberry32(SEED);
const FAR_ATLAS = makeStars(120, rng, 0.6, 1.4);

const IS_ANDROID = Platform.OS === "android";
export const STARS_FAR = FAR_ATLAS.slice(0, IS_ANDROID ? 64 : 104);

// Flight shells: full-field dot distributions in a unit box, scaled outward past the
// camera by the master flight phase. A mild center bias (pow 1.4 on the radial
// placement) clusters stars toward the galactic core ahead, like the reference
// journey. Each shell is one static SVG; depth comes from staggered phases.
export interface ShellDot {
  x: number;
  y: number;
  r: number;
  a: number;
  hue: number; // -1 = base tint, otherwise an index into SPECTRUM
}
function makeShellField(count: number, rng2: () => number): ShellDot[] {
  return Array.from({ length: count }, () => {
    const angle = rng2() * Math.PI * 2;
    const radius = Math.pow(rng2(), 1.4) * 0.5; // 0..0.5 of the box, center-biased
    return {
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius,
      r: 0.7 + rng2() * 1.5,
      a: 0.35 + rng2() * 0.65,
      hue: rng2() < 0.1 ? Math.floor(rng2() * SPECTRUM.length) : -1,
    };
  });
}
const SHELL_COUNT = IS_ANDROID ? 26 : 42;
export const SHELL_FIELDS: ShellDot[][] = Array.from({ length: 6 }, () => makeShellField(SHELL_COUNT, rng));

// Streak shells: short segments pointing away from the box center (the radial travel
// direction), length growing with distance from center, drawn with round caps. As the
// shell scales outward the segments sweep along their own axis: motion blur.
export interface ShellStreak {
  x: number;
  y: number;
  dx: number; // unit direction away from center
  dy: number;
  len: number; // segment length in box-units at scale 1
  a: number;
}
function makeStreakField(count: number, rng2: () => number): ShellStreak[] {
  return Array.from({ length: count }, () => {
    const angle = rng2() * Math.PI * 2;
    const radius = 0.12 + Math.pow(rng2(), 1.2) * 0.38; // keep streaks off the exact center
    const x = 0.5 + Math.cos(angle) * radius;
    const y = 0.5 + Math.sin(angle) * radius;
    return {
      x,
      y,
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      len: 0.012 + radius * 0.05,
      a: 0.3 + rng2() * 0.5,
    };
  });
}
const STREAK_COUNT = IS_ANDROID ? 16 : 26;
export const STREAK_FIELDS: ShellStreak[][] = Array.from({ length: 2 }, () => makeStreakField(STREAK_COUNT, rng));

// ---------------------------------------------------------------------------
// Starbursts: the bright foreground glints of the journey, drawn as four-point
// diffraction sparkles (the astrophotography star-glint: two crossed tapering
// diamonds, the fancy ones with a smaller 45-degree secondary cross and a bright
// core). They FLY: positions live in shell-box units (like the flight shells) so
// the two groups ride staggered sawtooth phases outward past the camera, with a
// counter-phased twinkle multiplied on top. The inner radius keeps glints off the
// galaxy core and the central text column.
// ---------------------------------------------------------------------------

export interface Starburst {
  x: number;
  y: number;
  /** Ray length in px at shell scale 1. */
  r: number;
  /** Static rotation in degrees, so the crosses do not all sit axis-aligned. */
  rot: number;
  a: number;
  hue: number; // -1 = base tint, otherwise an index into SPECTRUM
  fancy: boolean;
}

function makeStarbursts(count: number, rng2: () => number): Starburst[] {
  return Array.from({ length: count }, () => {
    const angle = rng2() * Math.PI * 2;
    const radius = 0.12 + rng2() * 0.36; // off the vanishing point, inside the box
    return {
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius,
      r: 6 + rng2() * 12,
      rot: (rng2() - 0.5) * 24,
      a: 0.5 + rng2() * 0.5,
      hue: rng2() < 0.25 ? Math.floor(rng2() * SPECTRUM.length) : -1,
      fancy: rng2() < 0.4,
    };
  });
}
// Two shells of glints, one per staggered flight phase / twinkle counter-phase.
export const BURST_FIELDS: Starburst[][] = Array.from({ length: 2 }, () => makeStarbursts(IS_ANDROID ? 4 : 6, rng));

// ---------------------------------------------------------------------------
// Palettes.
// ---------------------------------------------------------------------------

// Off-white cool floor for the light scheme (the celestial chart's paper), moved
// from the retired docs/src/ui/glass.tsx.
export const LIGHT_FLOOR = "#fafaff";

// Star base tints per scheme. Dark reads as starlight (indigo-leaning white);
// light reads as chart ink (deep indigo) at low alpha.
export function starTint(dark: boolean): string {
  return dark ? "#c7d2fe" : "#4338ca";
}

// Per-layer star alpha caps (multiplied by each dot's own factor). Light stays
// fainter so the chart never competes with text.
export const STAR_ALPHA = {
  far: { dark: 0.5, light: 0.3 },
  near: { dark: 0.65, light: 0.38 },
};

// Starburst ink caps per scheme (multiplied by each glint's own alpha factor).
export const BURST_ALPHA = { dark: 0.75, light: 0.5 };

export interface NebulaBlob {
  c: string;
  cx: number; // unit position inside the nebula's own box
  cy: number;
  r: number; // fraction of the box size
  o: number; // core stop opacity
  end: number; // gradient fade-out offset
}

// The nebula palette, derived from the retired GlassAurora BLOBS hues (primary
// indigo, violet, magenta, cyan, teal), ONE tuning everywhere: alphas sit between
// the old ambient and vivid values so the full five-hue field rides every screen
// while text columns stay readable. `primary` is passed in so the nebulae follow a
// rebrand.
export function nebulaBlobs(primary: string, dark: boolean): { one: NebulaBlob[]; two: NebulaBlob[] } {
  return {
    one: [
      { c: primary, cx: 0.32, cy: 0.3, r: 0.52, o: dark ? 0.2 : 0.3, end: 0.62 },
      { c: "#8b5cf6", cx: 0.72, cy: 0.42, r: 0.46, o: dark ? 0.22 : 0.32, end: 0.62 },
      { c: "#ec4899", cx: 0.6, cy: 0.74, r: 0.4, o: dark ? 0.16 : 0.24, end: 0.6 },
    ],
    two: [
      { c: "#06b6d4", cx: 0.62, cy: 0.6, r: 0.5, o: dark ? 0.18 : 0.28, end: 0.62 },
      { c: "#14b8a6", cx: 0.3, cy: 0.36, r: 0.44, o: dark ? 0.2 : 0.3, end: 0.64 },
    ],
  };
}

export type { ColorTokens };
