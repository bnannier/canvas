import { Platform } from "react-native";
import { type ColorTokens } from "@olympusoss/canvas";

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

// One shared atlas at the maximum (hero) count; consumers slice to their layer
// count so ambient skies are a strict subset of hero skies (no reshuffle between
// moods). Android gets fewer dots purely as a perf tuning constant.
const rng = mulberry32(SEED);
const FAR_ATLAS = makeStars(120, rng, 0.6, 1.4);
const NEAR_ATLAS = makeStars(60, rng, 1.2, 2.2);

const IS_ANDROID = Platform.OS === "android";
export const STARS_FAR_AMBIENT = FAR_ATLAS.slice(0, IS_ANDROID ? 56 : 90);
export const STARS_FAR_HERO = FAR_ATLAS.slice(0, IS_ANDROID ? 72 : 117);
export const STARS_NEAR_AMBIENT = NEAR_ATLAS.slice(0, IS_ANDROID ? 28 : 44);
export const STARS_NEAR_HERO = NEAR_ATLAS.slice(0, IS_ANDROID ? 36 : 57);

// Warp shell dots: a sparse jittered ring in a unit box (rendered centered on the
// viewport and scaled outward for the forward-travel drift).
export interface ShellDot {
  x: number;
  y: number;
  r: number;
  a: number;
}
function makeShell(count: number, rng2: () => number): ShellDot[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + rng2() * 0.5;
    const radius = 0.34 + rng2() * 0.14; // 0.34..0.48 of the box
    return {
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius,
      r: 0.8 + rng2() * 1.2,
      a: 0.3 + rng2() * 0.5,
    };
  });
}
export const WARP_SHELLS: ShellDot[][] = [makeShell(22, rng), makeShell(20, rng), makeShell(24, rng)];

// ---------------------------------------------------------------------------
// Constellations: components are the constellations. Each figure is drawn as a
// star chart in a local 100x60 box: dashed hairline strokes (the brand's dashed
// orbit language) joining vertex stars. Anchors are viewport fractions, biased
// toward edges and corners so the central text column stays clean.
// ---------------------------------------------------------------------------

export interface Constellation {
  id: string;
  /** Dashed outline paths in the 100x60 local box. */
  strokes: string[];
  /** Vertex stars in the same box. */
  stars: [number, number][];
  /** Sky anchor: viewport fractions + a local scale. */
  anchor: { x: number; y: number; scale: number };
}

// Chart A rides every page (ambient); chart B joins on hero screens.
export const CHART_A: Constellation[] = [
  {
    id: "button",
    strokes: ["M22 20 H78 Q90 20 90 30 Q90 40 78 40 H22 Q10 40 10 30 Q10 20 22 20 Z"],
    stars: [
      [22, 20], [78, 20], [22, 40], [78, 40], [50, 30],
    ],
    anchor: { x: 0.84, y: 0.16, scale: 1.05 },
  },
  {
    id: "switch",
    strokes: ["M30 22 H70 Q80 22 80 30 Q80 38 70 38 H30 Q20 38 20 30 Q20 22 30 22 Z", "M70 30 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0"],
    stars: [
      [30, 22], [70, 30], [30, 38], [20, 30],
    ],
    anchor: { x: 0.12, y: 0.62, scale: 0.9 },
  },
];

export const CHART_B: Constellation[] = [
  {
    id: "card",
    strokes: ["M15 8 H85 V52 H15 Z", "M22 18 H56"],
    stars: [
      [15, 8], [85, 8], [15, 52], [85, 52], [22, 18], [56, 18],
    ],
    anchor: { x: 0.16, y: 0.2, scale: 1.0 },
  },
  {
    id: "slider",
    strokes: ["M12 30 H88", "M58 30 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"],
    stars: [
      [12, 30], [88, 30], [58, 30],
    ],
    anchor: { x: 0.86, y: 0.6, scale: 0.95 },
  },
  {
    id: "checkbox",
    strokes: ["M35 15 H65 V45 H35 Z", "M42 30 L48 37 L58 22"],
    stars: [
      [35, 15], [65, 15], [35, 45], [65, 45], [48, 37],
    ],
    anchor: { x: 0.3, y: 0.88, scale: 0.8 },
  },
];

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

// Constellation ink: dashed stroke + vertex dots.
export const CHART_ALPHA = { stroke: { dark: 0.3, light: 0.4 }, dot: { dark: 0.55, light: 0.5 } };

export interface NebulaBlob {
  c: string;
  cx: number; // unit position inside the nebula's own box
  cy: number;
  r: number; // fraction of the box size
  o: number; // core stop opacity
  end: number; // gradient fade-out offset
}

// Nebula palettes derived from the retired GlassAurora BLOBS hues: primary indigo,
// violet, cyan for the ambient pair; hero raises alphas to the vivid values and
// adds magenta + teal. `primary` is passed in so the nebulae follow a rebrand.
export function nebulaBlobs(primary: string, dark: boolean, hero: boolean): { one: NebulaBlob[]; two: NebulaBlob[] } {
  if (hero) {
    return {
      one: [
        { c: primary, cx: 0.32, cy: 0.3, r: 0.52, o: dark ? 0.3 : 0.42, end: 0.62 },
        { c: "#8b5cf6", cx: 0.72, cy: 0.42, r: 0.46, o: dark ? 0.34 : 0.48, end: 0.62 },
        { c: "#ec4899", cx: 0.6, cy: 0.74, r: 0.4, o: dark ? 0.24 : 0.38, end: 0.6 },
      ],
      two: [
        { c: "#06b6d4", cx: 0.62, cy: 0.6, r: 0.5, o: dark ? 0.28 : 0.42, end: 0.62 },
        { c: "#14b8a6", cx: 0.3, cy: 0.36, r: 0.44, o: dark ? 0.3 : 0.44, end: 0.64 },
      ],
    };
  }
  return {
    one: [
      { c: primary, cx: 0.34, cy: 0.32, r: 0.5, o: dark ? 0.12 : 0.22, end: 0.6 },
      { c: "#8b5cf6", cx: 0.7, cy: 0.46, r: 0.44, o: dark ? 0.14 : 0.24, end: 0.62 },
    ],
    two: [{ c: "#06b6d4", cx: 0.6, cy: 0.56, r: 0.5, o: dark ? 0.1 : 0.18, end: 0.62 }],
  };
}

export type { ColorTokens };
