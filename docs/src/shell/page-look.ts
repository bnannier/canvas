// Dark Factory's page look for the docs: the one table of its tunables and the pure
// geometry the page backdrop and the shell frame draw from. Docs-only scaffolding
// (design-language item 7 in CLAUDE.md): nothing here enters the kit. The values are the
// `df-argus-shell` reference card's (tools/native/liquid-motion.md, `## References`),
// recorded from Dark Factory's /roster; every run that changes one is logged there.
//
// Plain TypeScript with no React Native import, so the geometry is tested on its own
// (test/docs-page-look.test.ts) and the e2e paint check reads the palettes from here.

export type PageLookName = "blush" | "mint" | "dark";
export type ShellTier = "phone" | "tablet" | "desktop";

export interface PageLookPalette {
  /** The page gradient's colours at 0, 50 and 100 percent of its line. */
  stops: readonly [string, string, string];
  /** The two orbs' colours, in the order of `PAGE_LOOK.orbs`. */
  orbs: readonly [string, string];
  /** The shell's frosted fill: Dark Factory's, which the web frost's functional tint equals. */
  shell: string;
  /** The shell's drop shadow colour, the palette's shadow. */
  shadow: string;
  /** The wedges' `accent2` colour. */
  accent2: string;
}

/** An orb: a solid ellipse under a Gaussian blur, sized and placed in fractions of the page. */
export interface PageLookOrb {
  width: number;
  height: number;
  /** Horizontal placement: the box's left edge, or its right edge from the page's right. */
  left?: number;
  right?: number;
  /** Vertical placement: the box's top edge, or its bottom edge from the page's bottom. */
  top?: number;
  bottom?: number;
  opacity: number;
  /** The blur's standard deviation in px. */
  blur: number;
}

type WedgeColor = "orb1" | "orb2" | "accent2" | `#${string}`;

/** One of the faint gradient triangles in the shell's corners (Dark Factory's WEDGES). */
export interface PageLookWedge {
  corner: "tr" | "br" | "bl";
  /** The box: px, or a fraction of the shell's width or height when given as a string percentage. */
  width: number | `${number}%`;
  height: number | `${number}%`;
  color: WedgeColor;
  direction: "to bottom" | "to top left" | "to bottom left" | "to top right";
  /** Where the colour has faded to transparent, or (fadeIn) from where it is solid. */
  fade: number;
  fadeIn?: boolean;
  opacity: number;
  /** The visible triangle, as three of the box's corners. */
  shape: "tl-tr-br" | "bl-br-tr" | "tr-br-bl" | "tl-bl-br";
}

export const PAGE_LOOK = {
  /** The CSS angle of the page gradient. */
  angle: 165,
  palettes: {
    blush: { stops: ["#fde3ee", "#ebe3fc", "#d9d6fc"], orbs: ["#f7a6c8", "#a89cf7"], shell: "rgba(255, 255, 255, 0.52)", shadow: "rgba(121, 100, 214, 0.22)", accent2: "#7b6cf0" },
    mint: { stops: ["#def4ec", "#dcebfb", "#cfdffb"], orbs: ["#9fd9c3", "#a9c6f7"], shell: "rgba(255, 255, 255, 0.58)", shadow: "rgba(60, 110, 190, 0.2)", accent2: "#3f7fe0" },
    dark: { stops: ["#171a2f", "#1d1b3b", "#231d46"], orbs: ["#6a4b9c", "#3d4aa0"], shell: "rgba(255, 255, 255, 0.045)", shadow: "rgba(0, 0, 0, 0.5)", accent2: "#a496ff" },
  } satisfies Record<PageLookName, PageLookPalette>,
  orbs: [
    { width: 0.48, height: 0.6, left: -0.08, top: -0.1, opacity: 0.35, blur: 90 },
    { width: 0.46, height: 0.7, right: -0.1, bottom: -0.2, opacity: 0.4, blur: 100 },
  ] satisfies PageLookOrb[],
  /**
   * How an orb's blur is drawn as a radial gradient (react-native-svg's Android
   * FeGaussianBlur caps its radius at 25 device pixels): the gradient's ellipse is
   * scaled from the radii where each axis falls to `level` of the peak, out to where
   * both have decayed `reach` blurs further, with `samples` stops read off the exact
   * blurred ellipse.
   */
  orbProfile: { level: 0.4, reach: 3.5, samples: 48 },
  shell: {
    radius: 22,
    /** The desktop shell's widest, centred. */
    maxWidth: 1340,
    /** The page's padding around the shell per tier (Dark Factory's AppShell). */
    insets: { phone: { side: 12, top: 16 }, tablet: { side: 20, top: 28 }, desktop: { side: 28, top: 56 } } satisfies Record<ShellTier, { side: number; top: number }>,
    shadow: { offsetY: 60, blur: 100, spread: -40 },
    /**
     * The height the wedges are laid out against: Dark Factory lays them over its shell,
     * which runs the roster's full height, so at rest only the top-right ones show. The
     * docs' frame is fixed to the viewport, so it keeps the roster's heights per tier.
     */
    wedgeCanvasHeight: { phone: 4713, tablet: 3823, desktop: 2580 } satisfies Record<ShellTier, number>,
  },
  wedges: [
    { corner: "tr", width: "12%", height: "100%", color: "orb2", direction: "to bottom", fade: 0.15, fadeIn: true, opacity: 0.16, shape: "tr-br-bl" },
    { corner: "br", width: "84%", height: 440, color: "orb2", direction: "to top left", fade: 0.72, opacity: 0.3, shape: "bl-br-tr" },
    { corner: "br", width: "54%", height: 260, color: "orb2", direction: "to top left", fade: 0.7, opacity: 0.24, shape: "bl-br-tr" },
    { corner: "tr", width: "18%", height: 400, color: "orb1", direction: "to bottom left", fade: 0.72, opacity: 0.34, shape: "tl-tr-br" },
    { corner: "tr", width: "24%", height: 520, color: "#ffffff", direction: "to bottom left", fade: 0.75, opacity: 0.34, shape: "tl-tr-br" },
    { corner: "bl", width: 204, height: 150, color: "orb2", direction: "to top right", fade: 0.72, opacity: 0.32, shape: "tl-bl-br" },
    { corner: "bl", width: 360, height: 80, color: "#ffffff", direction: "to top right", fade: 0.75, opacity: 0.24, shape: "tl-bl-br" },
    { corner: "tr", width: "14%", height: 760, color: "#9db6ff", direction: "to bottom left", fade: 0.7, opacity: 0.3, shape: "tl-tr-br" },
    { corner: "br", width: "30%", height: 640, color: "orb1", direction: "to top left", fade: 0.7, opacity: 0.28, shape: "tr-br-bl" },
    { corner: "br", width: "40%", height: 380, color: "accent2", direction: "to top left", fade: 0.75, opacity: 0.14, shape: "tr-br-bl" },
    { corner: "br", width: "66%", height: 200, color: "#ffffff", direction: "to top left", fade: 0.8, opacity: 0.28, shape: "tr-br-bl" },
    { corner: "tr", width: "36%", height: 220, color: "#ffc7a8", direction: "to bottom left", fade: 0.75, opacity: 0.3, shape: "tl-tr-br" },
    { corner: "bl", width: 420, height: 220, color: "orb1", direction: "to top right", fade: 0.7, opacity: 0.3, shape: "tl-bl-br" },
    { corner: "bl", width: 300, height: 340, color: "#9db6ff", direction: "to top right", fade: 0.8, opacity: 0.26, shape: "tl-bl-br" },
  ] satisfies PageLookWedge[],
  /**
   * The page size drawn before the backdrop has measured itself: the desktop frame a
   * pre-rendered page always carries (a server cannot measure a window), stretched to
   * the window until the measured size lands.
   */
  seed: { width: 1440, height: 900 },
} as const;

/** The look the docs paint: Dark Factory has one dark palette, so dark wins over the light palette. */
export function lookFor(scheme: "light" | "dark", palette: "blush" | "mint"): PageLookName {
  return scheme === "dark" ? "dark" : palette;
}

export interface GradientLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Where a CSS `linear-gradient(<angle>, ...)` runs inside a box of this size, in px.
 * CSS measures the angle clockwise from up and sizes the line so the first and last stops
 * touch the box's corners (its length is |w sin a| + |h cos a|), so the angle reads the
 * same at any aspect ratio.
 */
export function gradientLine(angleDeg: number, width: number, height: number): GradientLine {
  const w = width > 0 ? width : 1;
  const h = height > 0 ? height : 1;
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  return { x1: w / 2 - dx * half, y1: h / 2 - dy * half, x2: w / 2 + dx * half, y2: h / 2 + dy * half };
}

/** An orb's ellipse in a page of this size: its centre and its semi-axes, in px. */
export function orbEllipse(orb: PageLookOrb, width: number, height: number): { cx: number; cy: number; a: number; b: number } {
  const w = orb.width * width;
  const h = orb.height * height;
  const x = orb.left !== undefined ? orb.left * width : width - (orb.right ?? 0) * width - w;
  const y = orb.top !== undefined ? orb.top * height : height - (orb.bottom ?? 0) * height - h;
  return { cx: x + w / 2, cy: y + h / 2, a: w / 2, b: h / 2 };
}

// The error function, Abramowitz and Stegun 7.1.26 (absolute error under 1.5e-7).
function erf(x: number): number {
  const sign = Math.sign(x);
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  return sign * (1 - poly * Math.exp(-z * z));
}
const normalCdf = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));

/**
 * The coverage (0 to 1) at (x, y), from the centre, of a solid ellipse with semi-axes a
 * and b under a Gaussian blur of standard deviation `sigma`: the exact convolution, the
 * vertical integral in closed form and the horizontal one by the midpoint rule.
 */
export function blurredEllipse(x: number, y: number, a: number, b: number, sigma: number, steps = 160): number {
  const du = (2 * a) / steps;
  const norm = 1 / (sigma * Math.sqrt(2 * Math.PI));
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const u = -a + (i + 0.5) * du;
    const h = b * Math.sqrt(Math.max(0, 1 - (u * u) / (a * a)));
    const g = norm * Math.exp(-((x - u) * (x - u)) / (2 * sigma * sigma));
    sum += g * (normalCdf((y + h) / sigma) - normalCdf((y - h) / sigma)) * du;
  }
  return sum;
}

export interface OrbGradient {
  /** The gradient ellipse's semi-axes, in px, centred on the orb. */
  rx: number;
  ry: number;
  /** [offset along the ellipse's radius, coverage], from the centre out to 0 at the rim. */
  stops: [number, number][];
}

const orbGradients = new Map<string, OrbGradient>();

/**
 * A blurred ellipse as one elliptical radial gradient, which every platform draws the
 * same: the gradient's semi-axes are where each axis falls to `level` of the peak, scaled
 * until both have decayed `reach` blurs further, and its stops average the two axes'
 * exact profiles. Its iso-lines keep one aspect ratio where the blur's grow rounder far
 * out, which is the whole of its error (test/docs-page-look.test.ts holds the bound).
 */
export function orbGradient(a: number, b: number, sigma: number, profile: { level: number; reach: number; samples: number } = PAGE_LOOK.orbProfile): OrbGradient {
  const key = `${a.toFixed(1)}:${b.toFixed(1)}:${sigma}:${profile.level}:${profile.reach}:${profile.samples}`;
  const known = orbGradients.get(key);
  if (known) return known;
  const peak = blurredEllipse(0, 0, a, b, sigma);
  const crossing = (alongX: boolean) => {
    let lo = 0;
    let hi = (alongX ? a : b) + 8 * sigma;
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      const v = alongX ? blurredEllipse(mid, 0, a, b, sigma) : blurredEllipse(0, mid, a, b, sigma);
      if (v > peak * profile.level) lo = mid;
      else hi = mid;
    }
    return lo;
  };
  const lx = crossing(true);
  const ly = crossing(false);
  const scale = Math.max((lx + profile.reach * sigma) / lx, (ly + profile.reach * sigma) / ly);
  const rx = lx * scale;
  const ry = ly * scale;
  const stops: [number, number][] = [];
  for (let k = 0; k <= profile.samples; k++) {
    const t = k / profile.samples;
    const coverage = k === profile.samples ? 0 : (blurredEllipse(t * rx, 0, a, b, sigma) + blurredEllipse(0, t * ry, a, b, sigma)) / 2;
    stops.push([t, coverage]);
  }
  const gradient = { rx, ry, stops };
  if (orbGradients.size > 64) orbGradients.clear();
  orbGradients.set(key, gradient);
  return gradient;
}

/** The coverage an orb gradient paints at (x, y) from its centre, as an SVG renderer interpolates its stops. */
export function orbGradientAt(gradient: OrbGradient, x: number, y: number): number {
  const t = Math.hypot(x / gradient.rx, y / gradient.ry);
  if (t >= 1) return 0;
  const { stops } = gradient;
  const at = t * (stops.length - 1);
  const i = Math.floor(at);
  const f = at - i;
  return stops[i]![1] * (1 - f) + stops[Math.min(i + 1, stops.length - 1)]![1] * f;
}

/** The shell's tier for a window this wide: Dark Factory's breakpoints, which are Canvas's form factors. */
export function shellTier(width: number): ShellTier {
  return width <= 640 ? "phone" : width <= 1024 ? "tablet" : "desktop";
}

/** The shell's box in a window of this width: its left edge, top edge and width, in px. */
export function shellBox(tier: ShellTier, windowWidth: number): { left: number; top: number; width: number } {
  const { side, top } = PAGE_LOOK.shell.insets[tier];
  const width = Math.max(0, Math.min(PAGE_LOOK.shell.maxWidth, windowWidth - side * 2));
  return { left: (windowWidth - width) / 2, top, width };
}

function px(value: number | `${number}%`, total: number): number {
  return typeof value === "number" ? value : (parseFloat(value) / 100) * total;
}

/** The CSS angle a `to <corner>` gradient resolves to in a box of this size. */
function cornerAngle(direction: PageLookWedge["direction"], w: number, h: number): number {
  const a = (Math.atan2(h, w) * 180) / Math.PI;
  if (direction === "to top right") return a;
  if (direction === "to top left") return 360 - a;
  if (direction === "to bottom left") return 180 + a;
  return 180;
}

/** A wedge's triangle and gradient line in a shell of this size, in px. */
export function wedgeGeometry(wedge: PageLookWedge, width: number, height: number): { points: string; line: GradientLine } {
  const w = px(wedge.width, width);
  const h = px(wedge.height, height);
  const x = wedge.corner === "bl" ? 0 : width - w;
  const y = wedge.corner === "tr" ? 0 : height - h;
  const corners = { tl: [x, y], tr: [x + w, y], br: [x + w, y + h], bl: [x, y + h] } as const;
  const points = wedge.shape.split("-").map((c) => corners[c as keyof typeof corners].join(",")).join(" ");
  const line = gradientLine(cornerAngle(wedge.direction, w, h), w, h);
  return { points, line: { x1: x + line.x1, y1: y + line.y1, x2: x + line.x2, y2: y + line.y2 } };
}

/** A wedge's colour in a palette. */
export function wedgeColor(color: WedgeColor, palette: PageLookPalette): string {
  if (color === "orb1") return palette.orbs[0];
  if (color === "orb2") return palette.orbs[1];
  if (color === "accent2") return palette.accent2;
  return color;
}
