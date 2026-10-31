// The Library hero's brand illustrations, as one table of tunables and the math that turns
// it into drawing instructions: the gradient headline word (P5-G1), the radial aurora
// glows (P5-G2) and the tilted six-panel collage (P5-T1). Every value is the v4 hand-off's
// (`tools/v4/handoff/Canvas v4.0.0 Library.dc.html`, its hero section), judged against the
// `v4-library-hero` reference card in tools/native/liquid-motion.md; the harness is
// `/testing/library-hero`. The v4 motion accompanies the drawing: aurora drift,
// pointer-follow perspective, the eyebrow pulse and the column's entrance.
//
// Plain data and math with no React import, so the unit tests read it without a kit build.
// Registered as a tunable in .tuning-harness.json: a change here needs an evidence row.

/**
 * The hero section, px: the hand-off's full-window section (`padding: 120px 48px 96px`,
 * its content capped at 1440 px and centred, a hairline along its foot). It leads the page
 * above the page's frame (docs/src/ui/page.tsx `lead`), so its glow spans the window.
 */
export const HERO_FRAME = {
  /** The room above the hero's content, from the page's top under the floating pill. */
  top: 120,
  /** The room under the hero's content, above its hairline. */
  bottom: 96,
  /** The section's side padding around its content. */
  side: 48,
  /** The cap on the content's width. */
  max: 1440,
} as const;

/** The hand-off's two-column hero grid: `minmax(min(100%, 460px), 1fr)`. */
export const HERO_GRID = { minTileWidth: 460 } as const;

/** Timings and curves from the Library hand-off, including its reversed cyan drift. */
export const HERO_MOTION = {
  rise: 900,
  tilt: 500,
  pulse: 2400,
  entrance: [0.2, 0.8, 0.2, 1] as const,
  drifts: [
    { duration: 22000, delay: 0, reversed: false },
    { duration: 28000, delay: 0, reversed: true },
    { duration: 26000, delay: 3000, reversed: false },
  ],
} as const;

/** A colour role of the theme's tokens: the brand artwork's accent-to-cyan-to-mint sweep. */
export type SweepRole = "featured-start" | "featured-middle" | "featured-end";

/** G1: the headline word's fill, `linear-gradient(90deg, ion, cyan 60%, mint)` across the word's box. */
export const GRADIENT_TEXT = {
  stops: [
    { offset: 0, role: "featured-start" },
    { offset: 0.6, role: "featured-middle" },
    { offset: 1, role: "featured-end" },
  ] as const satisfies readonly { offset: number; role: SweepRole }[],
  /**
   * The display face's vertical metrics (Bricolage Grotesque: hhea ascent 930, descent
   * 270 on a 1000 unit em), which place the SVG baseline where the text's own line box
   * puts it: half the leading, then the ascent.
   */
  ascent: 0.93,
  descent: 0.27,
} as const;

/**
 * The kit's `hero` headline role (src/style/type-scale.ts `fluidRoles.hero`, which the docs
 * cannot import: test/docs-library.test.ts holds the two equal), for the SVG text that has
 * to draw the same glyphs at the same place: the hand-off's `clamp(56px, 7.2vw, 112px)` at a
 * .94 line and -.045em tracking.
 */
export const HERO_TYPE = { min: 56, vw: 0.072, max: 112, ratio: 0.94, trackingEm: -0.045, fontWeight: "500" } as const;

/** The hero headline's type at a window `width`, as the kit's Typography `hero` resolves it. */
export function heroType(width: number): { fontSize: number; lineHeight: number; fontWeight: "500"; letterSpacing: number } {
  const fontSize = Math.round(Math.min(HERO_TYPE.max, Math.max(HERO_TYPE.min, HERO_TYPE.vw * width)) * 100) / 100;
  return {
    fontSize,
    lineHeight: Math.round(fontSize * HERO_TYPE.ratio * 100) / 100,
    fontWeight: HERO_TYPE.fontWeight,
    letterSpacing: Math.round(HERO_TYPE.trackingEm * fontSize * 100) / 100,
  };
}

/** The SVG baseline of a single line of text, from the line box's top, px. */
export function baselineOffset(fontSize: number, lineHeight: number): number {
  const content = (GRADIENT_TEXT.ascent + GRADIENT_TEXT.descent) * fontSize;
  return (lineHeight - content) / 2 + GRADIENT_TEXT.ascent * fontSize;
}

export interface Orb {
  role: SweepRole;
  /** The disc's size as a share of the window width (the hand-off's `vw`). */
  size: number;
  /** Placement within the glow layer, as shares of the layer's width or height. */
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  /** The Gaussian blur's standard deviation, px (CSS `filter: blur()`). */
  blur: number;
}

/** G2: the aurora. */
export const AURORA = {
  /** The layer's opacity (`--aur`). */
  opacity: { dark: 0.55, light: 0.4 },
  /** The layer's `inset: -20%` around the section. */
  inset: 0.2,
  /** Where the disc's alpha ramp reaches zero: 60 percent of the farthest-corner ray. */
  rampEnd: 0.6,
  /** How many stops approximate the blurred profile. */
  stops: 14,
  orbs: [
    { role: "featured-start", size: 0.46, left: 0, top: 0.05, blur: 70 },
    { role: "featured-middle", size: 0.4, right: -0.05, top: 0.15, blur: 80 },
    { role: "featured-end", size: 0.36, left: 0.4, bottom: -0.05, blur: 80 },
  ] as const satisfies readonly Orb[],
} as const;

export interface GlowDisc {
  role: SweepRole;
  cx: number;
  cy: number;
  /** The outer radius the blurred profile is drawn to, px. */
  r: number;
  /** The radial stops, offsets 0 to 1 of `r`, opacity before the layer's own. */
  stops: readonly { offset: number; opacity: number }[];
}

/**
 * A disc whose alpha falls linearly from 1 at its centre to 0 at `ramp` px, convolved with
 * a Gaussian of standard deviation `sigma`: the alpha at each of `count` radii from 0 to
 * `ramp + 3 sigma`. Integrated over a polar grid of the disc, so it holds for any ratio of
 * blur to size.
 */
export function blurredDisc(ramp: number, sigma: number, count: number): { radius: number; stops: { offset: number; opacity: number }[] } {
  const radius = ramp + 3 * sigma;
  const RINGS = 40;
  const SPOKES = 64;
  const norm = 1 / (2 * Math.PI * sigma * sigma);
  const stops: { offset: number; opacity: number }[] = [];
  for (let i = 0; i < count; i++) {
    const r = (i / (count - 1)) * radius;
    let sum = 0;
    for (let j = 0; j < RINGS; j++) {
      const rho = ((j + 0.5) / RINGS) * ramp;
      const alpha = 1 - rho / ramp;
      const area = rho * (ramp / RINGS) * ((2 * Math.PI) / SPOKES);
      for (let k = 0; k < SPOKES; k++) {
        const theta = ((k + 0.5) / SPOKES) * 2 * Math.PI;
        const dx = rho * Math.cos(theta) - r;
        const dy = rho * Math.sin(theta);
        sum += alpha * area * norm * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      }
    }
    stops.push({ offset: i / (count - 1), opacity: Math.min(1, sum) });
  }
  return { radius, stops };
}

/**
 * The three discs in the glow layer's box (`width` x `height`: the hero section, from the
 * page's top to the hero's hairline, window edge to window edge), the window width standing
 * in for the hand-off's `vw`.
 */
export function auroraDiscs(width: number, height: number, viewportWidth: number = width): GlowDisc[] {
  const x0 = -AURORA.inset * width;
  const y0 = -AURORA.inset * height;
  const lw = width * (1 + 2 * AURORA.inset);
  const lh = height * (1 + 2 * AURORA.inset);
  return AURORA.orbs.map((orb: Orb) => {
    const size = orb.size * viewportWidth;
    const left = orb.left != null ? x0 + orb.left * lw : x0 + lw * (1 - (orb.right ?? 0)) - size;
    const top = orb.top != null ? y0 + orb.top * lh : y0 + lh * (1 - (orb.bottom ?? 0)) - size;
    // A circle radial gradient in a square box runs to the farthest corner, size / sqrt 2.
    const ramp = AURORA.rampEnd * (size / Math.SQRT2);
    const { radius, stops } = blurredDisc(ramp, orb.blur, AURORA.stops);
    return { role: orb.role, cx: left + size / 2, cy: top + size / 2, r: radius, stops };
  });
}

export type CollagePanelId = "revenue" | "segmented" | "online" | "glass" | "toast" | "ship";

export interface CollagePanel {
  id: CollagePanelId;
  /** The panel's offset in the stack, px. */
  x: number;
  y: number;
  /** Its `translateZ` off the stack, px. */
  z: number;
  /** Its width where the hand-off sets one, px; otherwise it hugs its content. */
  width?: number;
}

/** T1: the collage. */
export const COLLAGE = {
  height: 580,
  perspective: 1600,
  /** `perspective-origin: 55% 45%` of the collage box. */
  origin: [0.55, 0.45] as const,
  /** The stack's `rotateX(14deg) rotateY(-22deg) rotateZ(3deg)` about its centre. */
  rotate: [14, -22, 3] as const,
  /** The panels, in the hand-off's order; drawn back to front by `z`. */
  panels: [
    { id: "revenue", x: 60, y: 130, z: 0, width: 380 },
    { id: "segmented", x: 300, y: 60, z: 80, width: 240 },
    { id: "online", x: 30, y: 36, z: 50 },
    { id: "glass", x: -10, y: 410, z: 120 },
    { id: "toast", x: 250, y: 470, z: 160, width: 300 },
    { id: "ship", x: 420, y: 390, z: 220 },
  ] as const satisfies readonly CollagePanel[],
} as const;

type Vec3 = [number, number, number];
const RAD = Math.PI / 180;

/** The stack's rotation applied to a vector: CSS `rotateX(a) rotateY(b) rotateZ(c)`, the last first. */
export function rotateStack(v: Vec3, [a, b, c]: readonly [number, number, number] = COLLAGE.rotate): Vec3 {
  "worklet";
  const [x0, y0, z0] = v;
  const cz = Math.cos(c * RAD), sz = Math.sin(c * RAD);
  const x1 = cz * x0 - sz * y0, y1 = sz * x0 + cz * y0, z1 = z0;
  const cy = Math.cos(b * RAD), sy = Math.sin(b * RAD);
  const x2 = cy * x1 + sy * z1, y2 = y1, z2 = -sy * x1 + cy * z1;
  const cx = Math.cos(a * RAD), sx = Math.sin(a * RAD);
  return [x2, cx * y2 - sx * z2, sx * y2 + cx * z2];
}

/** One React Native transform operation (the subset the collage uses). */
export type TransformOp =
  | { translateX: number }
  | { translateY: number }
  | { scale: number }
  | { perspective: number }
  | { rotateX: string }
  | { rotateY: string }
  | { rotateZ: string };

/**
 * A panel's React Native transform, with its `transformOrigin` at its own top-left: the
 * hand-off's perspective box, its rotated `preserve-3d` stack and the panel's `translateZ`
 * folded into operations every platform has. React Native has no `translateZ`, so the
 * panel's depth becomes what it does under the perspective: the stack's rotation carries
 * the offset `v = R (0, 0, z)`, its in-plane part is a translation, and its depth part
 * `v.z` is a scale of `d / (d - v.z)` about the perspective origin with the perspective
 * shortened to `d - v.z` (the same projection, exactly).
 */
export function panelTransform(panel: Pick<CollagePanel, "x" | "y" | "z">, width: number, rotation: readonly [number, number, number] = COLLAGE.rotate): TransformOp[] {
  "worklet";
  const d = COLLAGE.perspective;
  const po = [COLLAGE.origin[0] * width, COLLAGE.origin[1] * COLLAGE.height];
  const sc = [width / 2, COLLAGE.height / 2];
  const [vx, vy, vz] = rotateStack([0, 0, panel.z], rotation);
  const [rx, ry, rz] = rotation;
  return [
    { translateX: po[0]! - panel.x },
    { translateY: po[1]! - panel.y },
    { scale: d / (d - vz) },
    { perspective: d - vz },
    { translateX: vx - po[0]! + sc[0]! },
    { translateY: vy - po[1]! + sc[1]! },
    { rotateX: `${rx}deg` },
    { rotateY: `${ry}deg` },
    { rotateZ: `${rz}deg` },
    { translateX: panel.x - sc[0]! },
    { translateY: panel.y - sc[1]! },
  ];
}

/**
 * Where a point of a panel lands on screen, in the collage box: the hand-off's own
 * composition (perspective box, rotated stack, `translateZ`), for the tests to hold
 * `panelTransform` to and to project the panels against the reference's measured boxes.
 */
export function projectCss(panel: Pick<CollagePanel, "x" | "y" | "z">, width: number, point: [number, number], rotation: readonly [number, number, number] = COLLAGE.rotate): [number, number] {
  const d = COLLAGE.perspective;
  const po = [COLLAGE.origin[0] * width, COLLAGE.origin[1] * COLLAGE.height];
  const sc = [width / 2, COLLAGE.height / 2];
  const local: Vec3 = [panel.x + point[0] - sc[0]!, panel.y + point[1] - sc[1]!, panel.z];
  const [x, y, z] = rotateStack(local, rotation);
  const px = x + sc[0]! - po[0]!;
  const py = y + sc[1]! - po[1]!;
  const w = 1 - z / d;
  return [po[0]! + px / w, po[1]! + py / w];
}

/** Bounding rect of the rotated stack, as getBoundingClientRect observes it in the hand-off. */
export function stackBounds(width: number, rotation: readonly [number, number, number]) {
  const points = [[0, 0], [width, 0], [width, COLLAGE.height], [0, COLLAGE.height]].map(
    point => projectCss({ x: 0, y: 0, z: 0 }, width, point as [number, number], rotation),
  );
  const left = Math.min(...points.map(p => p[0]));
  const top = Math.min(...points.map(p => p[1]));
  return { left, top, width: Math.max(...points.map(p => p[0])) - left, height: Math.max(...points.map(p => p[1])) - top };
}
