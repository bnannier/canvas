// The docs' page look: the v4 hand-off's page, which is flat, the scheme's `background`
// behind everything (tools/v4/handoff; audit/v4-redesign/PLAN.md, D8). Docs-only
// scaffolding: nothing here enters the kit. It replaced Dark Factory's page (the 165 deg
// gradient, the blurred orbs, the frosted shell and its wedges, the `df-argus-shell` card)
// on 2026-10-27, and is judged against the `v4-glass` card's page and the `v4-page` card
// (the evidence log, tools/native/liquid-motion.md): the grain over the page, the scrollbars
// and the shell's geometry are the tables below, each held to the hand-off's own CSS by
// test/docs-page-look.test.ts.
//
// Plain TypeScript with no import at all, not even a kit type, so the unit tests and the
// e2e paint check read it without a kit build (test/docs-page-look.test.ts).

export type ShellTier = "phone" | "tablet" | "desktop";

/** The page colour behind the docs in a theme: the scheme's own `background`, whatever the palette. */
export function pageColor(tokens: { background: string }): string {
  return tokens.background;
}

/** The shell's tier for a window this wide: Canvas's form factors. */
export function shellTier(width: number): ShellTier {
  return width <= 640 ? "phone" : width <= 1024 ? "tablet" : "desktop";
}

/**
 * The hand-off's grain (`--grain`, `--grain-o` and the fixed layer that draws it): a 180 px
 * tile of fractal noise, desaturated, laid over the whole window above everything at a low
 * opacity, untouchable. react-native-svg renders no `FeTurbulence`, so the tile is baked
 * from {@link grainSvg} into docs/assets/images/grain.png, @2x and @3x by
 * tools/v4/bake-grain.ts (decision S6); change a value here and re-bake.
 */
export const GRAIN = {
  /** Observed SVG output after the hand-off runtime rewrites its turbulence attributes. */
  renderedColor: "rgba(187,187,187,0.5019607843137255)",
  /** The tile's edge in CSS px (points natively): the hand-off's `background-size`. */
  tile: 180,
  /** The layer's opacity per scheme (`--grain-o`). */
  opacity: { dark: 0.07, light: 0.05 },
  /** The fixed layer's stacking order, over the page and its chrome. */
  zIndex: 100,
  /** The `feTurbulence` primitive. */
  noise: { type: "fractalNoise", baseFrequency: 0.85, numOctaves: 2, stitchTiles: "stitch" },
  /** The `feColorMatrix type="saturate"` value after it: 0 is grey noise. */
  saturate: 0,
  /** The device pixel ratios the tile is baked at: grain.png, grain@2x.png, grain@3x.png. */
  scales: [1, 2, 3],
} as const;

/** The grain tile's SVG, the hand-off's `--grain` document with the values from {@link GRAIN}. */
export function grainSvg(): string {
  const { tile, noise, saturate } = GRAIN;
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>` +
    `<filter id='n'><feTurbulence type='${noise.type}' baseFrequency='${noise.baseFrequency}' numOctaves='${noise.numOctaves}' stitchTiles='${noise.stitchTiles}'/>` +
    `<feColorMatrix type='saturate' values='${saturate}'/></filter>` +
    `<rect width='100%' height='100%' filter='url(#n)'/></svg>`
  );
}

/** The grain layer's opacity in a scheme. */
export function grainOpacity(scheme: "light" | "dark"): number {
  return GRAIN.opacity[scheme];
}

/**
 * The hand-off's scrollbars (`--sb`, `--sb-h` and its `::-webkit-scrollbar` rules): thin, a
 * 10 px WebKit bar whose thumb is a 10 px-radius pill inset by a 2 px transparent border
 * (`background-clip: padding-box`), an ink or white wash that strengthens on hover, over a
 * transparent track and corner. The web is the only platform with a persistent bar
 * (docs/src/ui/web-scrollbar.tsx).
 */
export const SCROLLBAR = {
  /** The WebKit bar's width and height, px. */
  size: 10,
  /** The thumb's corner radius, px. */
  radius: 10,
  /** The thumb's transparent inset, px. */
  inset: 2,
  /** The thumb at rest and under the pointer, per scheme. */
  thumb: { dark: "rgba(255,255,255,.18)", light: "rgba(17,17,24,.2)" },
  thumbHover: { dark: "rgba(255,255,255,.32)", light: "rgba(17,17,24,.36)" },
} as const;

/**
 * The hand-off's shell geometry, px: the pill's offsets from the window's top and sides,
 * where the content and the rail start, the rail's width and its gap to the content, the
 * frame's side gutter and cap, and the window width below which the rail hides (S9).
 */
export const SHELL = {
  navTop: 14,
  navSide: 16,
  contentTop: 96,
  railWidth: 200,
  railGap: 28,
  railTop: 96,
  gutter: 24,
  frameMax: 1440,
  railMinWidth: 760,
} as const;

/**
 * The hand-off's footer (its <footer>, `max-width:1440px;padding:96px 48px 64px`, and the
 * hairline's `padding-top:32px` above its columns), px.
 */
export const FOOTER = {
  top: 96,
  side: 48,
  bottom: 64,
  ruleGap: 32,
} as const;
