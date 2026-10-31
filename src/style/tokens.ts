import { alpha, oklchHex } from "./color.js";
import { SOLVED_INKS } from "./solved-inks.js";

// Canvas design tokens, as plain JS values. RN-usable: no CSS variables, no
// document access. Light and dark color sets plus numeric scales for spacing,
// radius, type, and breakpoints. Components read these (via useTheme for the
// scheme-aware color set) and build their RN style objects from them.

export type ColorScheme = "light" | "dark";

/** Semantic color tokens. The named surface/intent colors components paint with. */
export interface ColorTokens {
  /** Authored brand artwork stops and the featured card's offset stack. */
  "featured-start"?: string;
  "featured-middle"?: string;
  "featured-end"?: string;
  "featured-stack"?: string;
  "promo-start"?: string;
  "promo-middle"?: string;
  "promo-end"?: string;

  /** Optional informational text ink supplied by a brand. */
  info?: string;
  background: string;
  /** The sunken well beneath the page: a field's fill, a code block, a preview stage. Omit to use `background`. */
  "surface-sunken"?: string;
  /** The raised step above `secondary`: a hovered secondary fill, an off switch track. Omit to use `secondary`. */
  "surface-raised"?: string;
  /** The tertiary ink: captions, placeholders, eyebrows, mono metadata. Omit to use `muted-foreground`. */
  "subtle-foreground"?: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  /** Brand text on neutral/tinted surfaces. Omit in legacy maps to use primary. */
  "primary-text"?: string;
  "primary-foreground": string;
  /**
   * The CALL-TO-ACTION fill: the primary Button and the split button's action. Kept
   * apart from `primary`, which paints what is selected, checked, current, linked or
   * focused (the v4 hand-off paints both in its accent). Omit in legacy maps to paint actions with `primary`; a `tokens` override
   * that sets only `primary` repaints the actions too.
   */
  action?: string;
  /** The label and icon ink on an `action` fill. Omit to use `primary-foreground`. */
  "action-foreground"?: string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  /** Error/action text on neutral surfaces. Omit in legacy maps to use destructive. */
  "destructive-text"?: string;
  "destructive-foreground": string;
  success: string;
  /** Success text on neutral surfaces and its own wash. Omit in legacy maps to use success. */
  "success-text"?: string;
  "success-foreground": string;
  warning: string;
  /** Warning text on neutral surfaces and its own wash. Omit in legacy maps to use warning. */
  "warning-text"?: string;
  "warning-foreground": string;
  border: string;
  input: string;
  /**
   * The RESTING border of a text field on the web and iOS skins (Input, Textarea,
   * Select, Autocomplete, InputOTP, Stepper, PhoneInput, the Command trigger), and
   * the hand-off's strong hairline (--ln2), also used by `input`. The roles remain
   * independently overridable. Focus and error paint `ring` and `destructive`.
   * Omit in legacy maps to rest on `input`.
   */
  "field-border"?: string;
  ring: string;
  /** The accent's glow: the halo under a raised primary, a slider fill, an active tab line. Translucent. Omit to glow with `ring`. */
  glow?: string;
  /** The inset top highlight a lit surface carries (`inset 0 1px 0`). Translucent. Omit for none. */
  highlight?: string;
  /**
   * The soft washes (the hand-off's `*Soft`): a status or selection color at low alpha,
   * the fill behind a toned badge, an alert band or a tonal selection. Translucent
   * (`rgba`) by contract: composite one on the surface it sits on before measuring it.
   * Omit in legacy maps; a skin then washes the role's own color itself.
   */
  "primary-soft"?: string;
  "action-soft"?: string;
  "info-soft"?: string;
  "success-soft"?: string;
  "warning-soft"?: string;
  "destructive-soft"?: string;
  /** A text field's own fill (the hand-off's translucent white well). Translucent. Omit to fill with `card`. */
  "field-fill"?: string;
  /**
   * The hover wash (the hand-off's `hover`): the brand violet at a low alpha beneath a
   * hovered row or quiet control. Translucent, so it reads on any surface and over glass;
   * `accent` is this wash composited on `card`. Omit to wash with `accent`.
   */
  hover?: string;
  /** The modal backdrop (the hand-off's tinted dim). Translucent. Omit to dim with black. */
  scrim?: string;
  /** The small elevation's drop colour (a card, a tile). Translucent. Omit to shade with the ink. */
  shade?: string;
  /** The raised elevation's drop colour (a menu, a popover, a hovered card). Translucent. Omit to use `shade`. */
  "shade-md"?: string;
  /** The overlay elevation's drop colour (a dialog, a sheet, the floating chrome). Translucent. Omit to use `shade-md`. */
  "shade-lg"?: string;
  /** The hairline ring the light scheme's elevations carry. Translucent. Omit for none. */
  "shade-ring"?: string;
  /**
   * The lit top edge the dark scheme's elevations carry (an inset 1px line in `highlight`).
   * Transparent in the light scheme. Omit for none.
   */
  "shade-inset"?: string;
  /**
   * The inverse surface (the hand-off's dark toast pill, which the Android snackbar paints in both
   * schemes) and the ink on it. Omit both in legacy maps to invert the scheme: `foreground`
   * as the pill and `background` as its ink. Override the three inverse roles together:
   * the palette's ink and action name the hand-off's matching colors; an `inverse` alone keeps
   * those colors.
   */
  inverse?: string;
  "inverse-foreground"?: string;
  /**
   * The brand on the inverse surface (Material 3's inverse-primary): the action a
   * snackbar carries on the `inverse` pill, the palette's own brand hue lightened until
   * it reads at 4.5:1 on the pill, solid and under glass. Omit in legacy maps to use the
   * brand text of the palette whose surfaces match the pill's lightness (the dark
   * palette's on a dark pill, the light palette's on a light one). A `tokens` override
   * that rebrands `primary` leaves it alone: name it too.
   */
  "inverse-primary"?: string;
  // Categorical data-viz series colors, assigned to series in fixed order
  // (series 1 is always chart-1, never re-ranked when a series is filtered
  // out). One validated palette serves both schemes: every value passes the
  // computable data-viz checks (OKLCH lightness band, chroma floor, adjacent-
  // pair colorblind separation, >=3:1 contrast) against the light AND dark
  // card surfaces, and none collides with a reserved status token
  // (destructive/success/warning).
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
  "chart-6": string;
  "chart-7": string;
  "chart-8": string;
}


// The semantic color values below are the v4 design hand-off's ("Light as material",
// vendored at tools/v4/handoff; audit/v4-redesign/PLAN.md). The neutrals, status colours
// and glass are its literal values; the accent ("ion") and the chart series are its
// `oklch(L C hue)` formulas, converted to sRGB by `oklchHex` (src/style/color.ts), which
// matches what Chrome paints for the hand-off to within one channel unit
// (tools/v4/accent-samples.json, test/v4-accent.test.ts). The CSS hand-off
// (styles/tokens/colors.css) keeps the literal oklch() forms over `--hue`, and
// scripts/validate-tokens.ts holds the two sides equal for every palette and scheme.
//
// D14 restores the hand-off literally, including its translucent boundaries, focus ring,
// and unadjusted text inks. Contrast is measured and reported; it does not recolor the
// reference. The text-role aliases remain separate so consumer rebrands can override them.

/**
 * The glass material's own tokens, per scheme, one tint per density layer.
 * These densities do not choose static versus liquid material or custom motion.
 * The role-based contract uses intentional static content panes and functional
 * liquid surfaces, with unpainted layout, foreground content and data ink.
 * Readability must be verified on actual composed backgrounds, not inferred from
 * a token or a passing contrast check against one backdrop.
 *
 *   glass-tint          the FUNCTIONAL layer: bars, sidebars, tab bars, sheets,
 *                       drawers, popovers, dialogs, the command palette. The
 *                       thinnest tint; the material does most of the read.
 *   glass-tint-content  CONTENT panes: cards, tables, lists, tiles, feeds, the
 *                       calendar, chart frames, the docs stages. Dense enough
 *                       that `foreground` text clears 4.5:1 over the page and
 *                       over every bed of the frosted frame (frameBeds; test/glass-tint.test.tsx).
 *   glass-tint-control  CONTROLS: fields, buttons, segmented controls, chips,
 *                       badges, pills. A brighter "puck" than the pane it sits
 *                       on, in both schemes.
 *   glass-tint-dense    the surfaces the user READS rows or a verdict from: option
 *                       lists (dropdown, select, autocomplete, row menus), alert
 *                       dialogs, toasts. The densest tint, so the page's own rows
 *                       and rules never read between the menu's.
 *
 * The material carries its OWN fill; glass mode swaps NO semantic color token
 * (`card` and `popover` stay opaque in the token set, and a surface that opts out of
 * the material keeps its opaque fill). Every surface takes its tint UNDER the real
 * material selected by the shared renderer for the role and available capability.
 * Native Liquid Glass, the native frost and the web's plain frost are distinct material paths.
 * A tint alone is neither proof of real blur nor a complete solid fallback.
 * Missing or unsafe material capability requires the original opaque fill,
 * foreground, boundary and elevation; layout and semantic state must survive.
 *
 * Keys are the CSS custom-property names verbatim (`glass-tint` is `--glass-tint` in
 * styles/tokens/colors.css). The CSS hand-off carries the WEB frost's tints, Dark
 * Factory's (src/style/glass-surface/web-frost.ts), and scripts/validate-tokens.ts
 * holds the two together. `glassByScheme` below is the NATIVE set: the Android blur reads
 * it, and iOS's Liquid Glass and frost read it but for a sheerer dark control puck
 * (src/style/glass-surface/ios-tints.ts).
 * Values are rgba so they compose over whatever sits behind the surface.
 */
export interface GlassTokens {
  /** The functional layer's under-fill (bars, sheets, popovers, dialogs). */
  "glass-tint": string;
  /** The content pane's under-fill (cards, tables, lists, tiles, stages). */
  "glass-tint-content": string;
  /** The control puck's under-fill (fields, buttons, chips, badges, pills). */
  "glass-tint-control": string;
  /** The densest under-fill (option lists, alert dialogs, toasts). */
  "glass-tint-dense": string;
}

/**
 * The light scheme's native glass under-fills, one per material layer (functional,
 * content, control, dense), as glassByScheme carries them.
 */
export const lightGlass: GlassTokens = {
  "glass-tint": "rgba(255, 255, 255, 0.62)",
  "glass-tint-content": "rgba(255, 255, 255, 0.8)",
  "glass-tint-control": "rgba(241, 241, 246, 0.72)",
  "glass-tint-dense": "rgba(255, 255, 255, 0.92)",
};

/**
 * The dark scheme's native glass under-fills, one per material layer (functional, content,
 * control, dense), as glassByScheme carries them.
 */
export const darkGlass: GlassTokens = {
  // The hand-off's `--gl` (its card surface at 62%) is the functional layer; the content and
  // dense panes deepen the same ink so text keeps its contrast, and the control puck is
  // the raised step (`secondary`) at the same density, so a field or button lifts off
  // its pane the way a lit glass control does.
  "glass-tint": "rgba(18, 18, 26, 0.62)",
  "glass-tint-content": "rgba(18, 18, 26, 0.8)",
  "glass-tint-control": "rgba(30, 30, 41, 0.72)",
  "glass-tint-dense": "rgba(18, 18, 26, 0.92)",
};

/**
 * The native glass tints per scheme: the Android blur's, and iOS's Liquid Glass and frost
 * but for its dark control puck, which is sheerer there (white 0.05). The web's are Dark
 * Factory's frost tints; read the active platform's through `useTheme().glass`.
 */
export const glassByScheme: Record<ColorScheme, GlassTokens> = {
  light: lightGlass,
  dark: darkGlass,
};

/**
 * The accent palettes the kit ships, each one hue for the whole accent: violet (285, the
 * default), cyan (205), mint (165), rose (20) and amber (75). A palette applies in both
 * schemes. `<ThemeProvider cyan>` selects one; the CSS hand-off reads `data-palette`.
 */
export type Palette = "violet" | "cyan" | "mint" | "rose" | "amber";

/** Every palette, the default first. */
export const PALETTES: readonly Palette[] = ["violet", "cyan", "mint", "rose", "amber"];

/** The oklch hue each palette paints its accent at. */
export const paletteHue: Record<Palette, number> = { violet: 285, cyan: 205, mint: 165, rose: 20, amber: 75 };

/**
 * The accent's oklch lightness and chroma per scheme, and its text and soft alphas.
 * Internal: tools/v4/derive-css.ts writes the CSS hand-off's oklch forms from it; the
 * package does not re-export it.
 */
export const ACCENT = {
  dark: { fill: [0.74, 0.17], text: [0.8, 0.14], ink: "#0a0a0f", soft: 0.16, glow: 0.5, ring: 0.35 },
  light: { fill: [0.5, 0.22], text: [0.47, 0.2], ink: "#ffffff", soft: 0.1, glow: 0.4, ring: 0.28 },
} as const;

/**
 * The hand-off's fixed series 2 to 8 (series 1 is the accent), per scheme, as oklch.
 * Internal, read by tools/v4/derive-css.ts like ACCENT.
 */
export const SERIES: Record<ColorScheme, readonly (readonly [number, number, number])[]> = {
  dark: [
    [0.82, 0.13, 205],
    [0.85, 0.15, 165],
    [0.82, 0.14, 75],
    [0.72, 0.17, 20],
    [0.72, 0.14, 255],
    [0.74, 0.16, 330],
    [0.78, 0.1, 125],
  ],
  light: [
    [0.62, 0.13, 205],
    [0.66, 0.15, 165],
    [0.64, 0.15, 70],
    [0.57, 0.19, 20],
    [0.54, 0.17, 255],
    [0.55, 0.2, 330],
    [0.58, 0.12, 125],
  ],
};

/**
 * The scheme's neutrals, status colours, glass and shades: everything the hue does not move.
 * Internal, read by tools/v4/derive-inks.ts, which mirrors the hand-off’s text aliases.
 */
export const NEUTRALS: Record<ColorScheme, Omit<ColorTokens, AccentRole | ChartRole | InkRole>> = {
  dark: {
    background: "#0a0a0f",
    "surface-sunken": "#0e0e15",
    foreground: "#f4f4f8",
    card: "#12121a",
    "card-foreground": "#f4f4f8",
    popover: "#171720",
    "popover-foreground": "#f4f4f8",
    secondary: "#1e1e29",
    "secondary-foreground": "#f4f4f8",
    muted: "#1e1e29",
    "muted-foreground": "#a4a4b6",
    "subtle-foreground": "#7f7f93",
    accent: "#1e1e29",
    "accent-foreground": "#f4f4f8",
    "surface-raised": "#282836",
    destructive: "#ff6b7a",
    "destructive-foreground": "#2b0009",
    "destructive-soft": "rgba(255, 107, 122, 0.14)",
    success: "#3ddc97",
    "success-foreground": "#04291a",
    "success-soft": "rgba(61, 220, 151, 0.14)",
    warning: "#f6b84c",
    "warning-foreground": "#2a1800",
    "warning-soft": "rgba(246, 184, 76, 0.14)",
    border: "rgba(255, 255, 255, 0.08)",
    "field-border": "rgba(255, 255, 255, 0.16)",
    input: "rgba(255, 255, 255, 0.16)",
    "field-fill": "#0e0e15",
    hover: "rgba(255, 255, 255, 0.05)",
    highlight: "rgba(255, 255, 255, 0.1)",
    scrim: "rgba(5, 5, 10, 0.55)",
    shade: "rgba(0, 0, 0, 0.5)",
    "shade-md": "rgba(0, 0, 0, 0.7)",
    "shade-lg": "rgba(0, 0, 0, 0.8)",
    "shade-ring": "rgba(0, 0, 0, 0)",
    "shade-inset": "rgba(255, 255, 255, 0.1)",
    inverse: "#f4f4f8",
    "inverse-foreground": "#0a0a0f",
  },
  light: {
    background: "#f2f2f7",
    "surface-sunken": "#fafafd",
    foreground: "#111118",
    card: "#ffffff",
    "card-foreground": "#111118",
    popover: "#ffffff",
    "popover-foreground": "#111118",
    secondary: "#f1f1f6",
    "secondary-foreground": "#111118",
    muted: "#f1f1f6",
    "muted-foreground": "#5a5a70",
    "subtle-foreground": "#6c6c82",
    accent: "#f1f1f6",
    "accent-foreground": "#111118",
    "surface-raised": "#e4e4ee",
    destructive: "#d62a4b",
    "destructive-foreground": "#ffffff",
    "destructive-soft": "rgba(214, 42, 75, 0.1)",
    success: "#0b7a53",
    "success-foreground": "#ffffff",
    "success-soft": "rgba(11, 122, 83, 0.1)",
    warning: "#a55d00",
    "warning-foreground": "#ffffff",
    "warning-soft": "rgba(165, 93, 0, 0.1)",
    border: "rgba(17, 17, 24, 0.08)",
    "field-border": "rgba(17, 17, 24, 0.16)",
    input: "rgba(17, 17, 24, 0.16)",
    "field-fill": "#fafafd",
    hover: "rgba(17, 17, 24, 0.06)",
    highlight: "rgba(255, 255, 255, 0.8)",
    scrim: "rgba(17, 17, 24, 0.3)",
    shade: "rgba(17, 17, 24, 0.05)",
    "shade-md": "rgba(17, 17, 24, 0.16)",
    "shade-lg": "rgba(17, 17, 24, 0.25)",
    "shade-ring": "rgba(17, 17, 24, 0.03)",
    "shade-inset": "rgba(255, 255, 255, 0)",
    inverse: "#111118",
    "inverse-foreground": "#ffffff",
  },
};

type AccentRole =
  | "primary"
  | "primary-text"
  | "primary-foreground"
  | "primary-soft"
  | "action"
  | "action-foreground"
  | "action-soft"
  | "info"
  | "info-soft"
  | "ring"
  | "glow"
  | "inverse-primary"
  | "featured-start"
  | "featured-middle"
  | "featured-end"
  | "featured-stack"
  | "promo-start"
  | "promo-middle"
  | "promo-end";
type ChartRole = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "chart-6" | "chart-7" | "chart-8";

export type InkRole = "destructive-text" | "success-text" | "warning-text";

const CACHE = new Map<string, ColorTokens>();

/**
 * The semantic color tokens a palette paints in a scheme: the scheme's neutrals with the
 * palette's accent. A frozen value per pair, computed once.
 */
export function colorsFor(palette: Palette, scheme: ColorScheme): ColorTokens {
  const key = `${palette}:${scheme}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const hue = paletteHue[palette] ?? paletteHue.violet;
  const a = ACCENT[scheme];
  const ion = oklchHex(a.fill[0], a.fill[1], hue);
  const soft = alpha(ion, a.soft);
  const inks = SOLVED_INKS[scheme];
  const ionText = inks["primary-text"][palette] ?? inks["primary-text"].violet;
  const series = SERIES[scheme].map(([l, c, h]) => oklchHex(l, c, h));
  const tokens: ColorTokens = Object.freeze({
    ...NEUTRALS[scheme],
    ...inks.status,
    primary: ion,
    "primary-text": ionText,
    "primary-foreground": a.ink,
    "primary-soft": soft,
    // The hand-off draws its calls to action in the accent: there is no second action hue.
    action: ion,
    "action-foreground": a.ink,
    "action-soft": soft,
    info: ionText,
    "info-soft": soft,
    // The hand-off’s focus band keeps its 28% / 35% accent opacity.
    ring: alpha(ion, a.ring),
    glow: alpha(ion, a.glow),
    // The inverse pill is the other scheme's page, so its brand is the other scheme's
    // accent text (the hand-off's snackbar action, oklch(.8 .14 hue) on a dark pill).
    "inverse-primary": inks["inverse-primary"][palette] ?? inks["inverse-primary"].violet,
    // The brand artwork: the hero's accent-to-cyan-to-mint sweep.
    "featured-start": ion,
    "featured-middle": series[0],
    "featured-end": series[1],
    "featured-stack": scheme === "dark" ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.5)",
    "promo-start": ion,
    "promo-middle": series[0],
    "promo-end": series[1],
    "chart-1": ion,
    "chart-2": series[0],
    "chart-3": series[1],
    "chart-4": series[2],
    "chart-5": series[3],
    "chart-6": series[4],
    "chart-7": series[5],
    "chart-8": series[6],
  });
  CACHE.set(key, tokens);
  return tokens;
}

/**
 * The light scheme's semantic color tokens in the default violet palette. A frozen
 * constant: read the live set from `useTheme().tokens`.
 */
export const lightColors: ColorTokens = colorsFor("violet", "light");

/**
 * The dark scheme's semantic color tokens in the default violet palette. A frozen
 * constant: read the live set from `useTheme().tokens`.
 */
export const darkColors: ColorTokens = colorsFor("violet", "dark");

/** The violet palette's semantic color tokens by scheme: lightColors and darkColors. */
export const colorsByScheme: Record<ColorScheme, ColorTokens> = {
  light: lightColors,
  dark: darkColors,
};

/**
 * The surfaces a glass pane can sit over in a scheme (the page, the sunken well and the
 * card), the beds a translucent fill carrying ink is solved against. The v4 page is flat,
 * so the beds are the scheme's own surfaces, whatever the palette.
 */
export function frameBedsFor(_palette: Palette, scheme: ColorScheme): readonly string[] {
  const n = NEUTRALS[scheme];
  return [n.background, n["surface-sunken"]!, n.card];
}


/** Fixed, scheme-independent base colors. */
export const baseColors: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

/**
 * Tailwind red-500, single-sourced for Button's attention glow. An atom that reads a
 * hue through `palette[...]` retains the whole record (~1.5KB gzip) in every bundle
 * that carries it; this named constant tree-shakes to the one value.
 */
export const PALETTE_RED_500 = "#ef4444";

/**
 * The standard Tailwind v3 color-hue palette, scheme-independent. Color-coded
 * components that need hues beyond the semantic tokens read from here. Keyed
 * "<hue>-<step>" (e.g. "red-500"), values are the canonical Tailwind v3 hexes,
 * lowercase.
 */
export const palette: Record<string, string> = {
  // slate
  "slate-50": "#f8fafc",
  "slate-100": "#f1f5f9",
  "slate-200": "#e2e8f0",
  "slate-300": "#cbd5e1",
  "slate-400": "#94a3b8",
  "slate-500": "#64748b",
  "slate-600": "#475569",
  "slate-700": "#334155",
  "slate-800": "#1e293b",
  "slate-900": "#0f172a",
  "slate-950": "#020617",
  // gray
  "gray-50": "#f9fafb",
  "gray-100": "#f3f4f6",
  "gray-200": "#e5e7eb",
  "gray-300": "#d1d5db",
  "gray-400": "#9ca3af",
  "gray-500": "#6b7280",
  "gray-600": "#4b5563",
  "gray-700": "#374151",
  "gray-800": "#1f2937",
  "gray-900": "#111827",
  "gray-950": "#030712",
  // zinc
  "zinc-50": "#fafafa",
  "zinc-100": "#f4f4f5",
  "zinc-200": "#e4e4e7",
  "zinc-300": "#d4d4d8",
  "zinc-400": "#a1a1aa",
  "zinc-500": "#71717a",
  "zinc-600": "#52525b",
  "zinc-700": "#3f3f46",
  "zinc-800": "#27272a",
  "zinc-900": "#18181b",
  "zinc-950": "#09090b",
  // neutral
  "neutral-50": "#fafafa",
  "neutral-100": "#f5f5f5",
  "neutral-200": "#e5e5e5",
  "neutral-300": "#d4d4d4",
  "neutral-400": "#a3a3a3",
  "neutral-500": "#737373",
  "neutral-600": "#525252",
  "neutral-700": "#404040",
  "neutral-800": "#262626",
  "neutral-900": "#171717",
  "neutral-950": "#0a0a0a",
  // stone
  "stone-50": "#fafaf9",
  "stone-100": "#f5f5f4",
  "stone-200": "#e7e5e4",
  "stone-300": "#d6d3d1",
  "stone-400": "#a8a29e",
  "stone-500": "#78716c",
  "stone-600": "#57534e",
  "stone-700": "#44403c",
  "stone-800": "#292524",
  "stone-900": "#1c1917",
  "stone-950": "#0c0a09",
  // red
  "red-50": "#fef2f2",
  "red-100": "#fee2e2",
  "red-200": "#fecaca",
  "red-300": "#fca5a5",
  "red-400": "#f87171",
  "red-500": PALETTE_RED_500,
  "red-600": "#dc2626",
  "red-700": "#b91c1c",
  "red-800": "#991b1b",
  "red-900": "#7f1d1d",
  "red-950": "#450a0a",
  // orange
  "orange-50": "#fff7ed",
  "orange-100": "#ffedd5",
  "orange-200": "#fed7aa",
  "orange-300": "#fdba74",
  "orange-400": "#fb923c",
  "orange-500": "#f97316",
  "orange-600": "#ea580c",
  "orange-700": "#c2410c",
  "orange-800": "#9a3412",
  "orange-900": "#7c2d12",
  "orange-950": "#431407",
  // amber
  "amber-50": "#fffbeb",
  "amber-100": "#fef3c7",
  "amber-200": "#fde68a",
  "amber-300": "#fcd34d",
  "amber-400": "#fbbf24",
  "amber-500": "#f59e0b",
  "amber-600": "#d97706",
  "amber-700": "#b45309",
  "amber-800": "#92400e",
  "amber-900": "#78350f",
  "amber-950": "#451a03",
  // yellow
  "yellow-50": "#fefce8",
  "yellow-100": "#fef9c3",
  "yellow-200": "#fef08a",
  "yellow-300": "#fde047",
  "yellow-400": "#facc15",
  "yellow-500": "#eab308",
  "yellow-600": "#ca8a04",
  "yellow-700": "#a16207",
  "yellow-800": "#854d0e",
  "yellow-900": "#713f12",
  "yellow-950": "#422006",
  // lime
  "lime-50": "#f7fee7",
  "lime-100": "#ecfccb",
  "lime-200": "#d9f99d",
  "lime-300": "#bef264",
  "lime-400": "#a3e635",
  "lime-500": "#84cc16",
  "lime-600": "#65a30d",
  "lime-700": "#4d7c0f",
  "lime-800": "#3f6212",
  "lime-900": "#365314",
  "lime-950": "#1a2e05",
  // green
  "green-50": "#f0fdf4",
  "green-100": "#dcfce7",
  "green-200": "#bbf7d0",
  "green-300": "#86efac",
  "green-400": "#4ade80",
  "green-500": "#22c55e",
  "green-600": "#16a34a",
  "green-700": "#15803d",
  "green-800": "#166534",
  "green-900": "#14532d",
  "green-950": "#052e16",
  // emerald
  "emerald-50": "#ecfdf5",
  "emerald-100": "#d1fae5",
  "emerald-200": "#a7f3d0",
  "emerald-300": "#6ee7b7",
  "emerald-400": "#34d399",
  "emerald-500": "#10b981",
  "emerald-600": "#059669",
  "emerald-700": "#047857",
  "emerald-800": "#065f46",
  "emerald-900": "#064e3b",
  "emerald-950": "#022c22",
  // teal
  "teal-50": "#f0fdfa",
  "teal-100": "#ccfbf1",
  "teal-200": "#99f6e4",
  "teal-300": "#5eead4",
  "teal-400": "#2dd4bf",
  "teal-500": "#14b8a6",
  "teal-600": "#0d9488",
  "teal-700": "#0f766e",
  "teal-800": "#115e59",
  "teal-900": "#134e4a",
  "teal-950": "#042f2e",
  // cyan
  "cyan-50": "#ecfeff",
  "cyan-100": "#cffafe",
  "cyan-200": "#a5f3fc",
  "cyan-300": "#67e8f9",
  "cyan-400": "#22d3ee",
  "cyan-500": "#06b6d4",
  "cyan-600": "#0891b2",
  "cyan-700": "#0e7490",
  "cyan-800": "#155e75",
  "cyan-900": "#164e63",
  "cyan-950": "#083344",
  // sky
  "sky-50": "#f0f9ff",
  "sky-100": "#e0f2fe",
  "sky-200": "#bae6fd",
  "sky-300": "#7dd3fc",
  "sky-400": "#38bdf8",
  "sky-500": "#0ea5e9",
  "sky-600": "#0284c7",
  "sky-700": "#0369a1",
  "sky-800": "#075985",
  "sky-900": "#0c4a6e",
  "sky-950": "#082f49",
  // blue
  "blue-50": "#eff6ff",
  "blue-100": "#dbeafe",
  "blue-200": "#bfdbfe",
  "blue-300": "#93c5fd",
  "blue-400": "#60a5fa",
  "blue-500": "#3b82f6",
  "blue-600": "#2563eb",
  "blue-700": "#1d4ed8",
  "blue-800": "#1e40af",
  "blue-900": "#1e3a8a",
  "blue-950": "#172554",
  // indigo
  "indigo-50": "#eef2ff",
  "indigo-100": "#e0e7ff",
  "indigo-200": "#c7d2fe",
  "indigo-300": "#a5b4fc",
  "indigo-400": "#818cf8",
  "indigo-500": "#6366f1",
  "indigo-600": "#4f46e5",
  "indigo-700": "#4338ca",
  "indigo-800": "#3730a3",
  "indigo-900": "#312e81",
  "indigo-950": "#1e1b4b",
  // violet
  "violet-50": "#f5f3ff",
  "violet-100": "#ede9fe",
  "violet-200": "#ddd6fe",
  "violet-300": "#c4b5fd",
  "violet-400": "#a78bfa",
  "violet-500": "#8b5cf6",
  "violet-600": "#7c3aed",
  "violet-700": "#6d28d9",
  "violet-800": "#5b21b6",
  "violet-900": "#4c1d95",
  "violet-950": "#2e1065",
  // purple
  "purple-50": "#faf5ff",
  "purple-100": "#f3e8ff",
  "purple-200": "#e9d5ff",
  "purple-300": "#d8b4fe",
  "purple-400": "#c084fc",
  "purple-500": "#a855f7",
  "purple-600": "#9333ea",
  "purple-700": "#7e22ce",
  "purple-800": "#6b21a8",
  "purple-900": "#581c87",
  "purple-950": "#3b0764",
  // fuchsia
  "fuchsia-50": "#fdf4ff",
  "fuchsia-100": "#fae8ff",
  "fuchsia-200": "#f5d0fe",
  "fuchsia-300": "#f0abfc",
  "fuchsia-400": "#e879f9",
  "fuchsia-500": "#d946ef",
  "fuchsia-600": "#c026d3",
  "fuchsia-700": "#a21caf",
  "fuchsia-800": "#86198f",
  "fuchsia-900": "#701a75",
  "fuchsia-950": "#4a044e",
  // pink
  "pink-50": "#fdf2f8",
  "pink-100": "#fce7f3",
  "pink-200": "#fbcfe8",
  "pink-300": "#f9a8d4",
  "pink-400": "#f472b6",
  "pink-500": "#ec4899",
  "pink-600": "#db2777",
  "pink-700": "#be185d",
  "pink-800": "#9d174d",
  "pink-900": "#831843",
  "pink-950": "#500724",
  // rose
  "rose-50": "#fff1f2",
  "rose-100": "#ffe4e6",
  "rose-200": "#fecdd3",
  "rose-300": "#fda4af",
  "rose-400": "#fb7185",
  "rose-500": "#f43f5e",
  "rose-600": "#e11d48",
  "rose-700": "#be123c",
  "rose-800": "#9f1239",
  "rose-900": "#881337",
  "rose-950": "#4c0519",
};

/** Spacing scale in px (Tailwind rem * 16). Keys are the Tailwind step names. */
export const spacing: Record<string, number> = {
  "0": 0,
  px: 1,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "11": 44,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
  "24": 96,
  "28": 112,
  "32": 128,
  "36": 144,
  "40": 160,
  "48": 192,
  "56": 224,
  "64": 256,
};

/** Border radius scale in px. */
export const radius: Record<string, number> = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  full: 9999,
};

/** The platforms a skin file is written for. */
export type PlatformKey = "web" | "ios" | "android";

/**
 * The corner radii a platform's skins share, by what the corner belongs to. Skins
 * read these instead of spelling a number, so a shape decision is made once per
 * platform: `control` is a rectangular control on the web (an icon button, a menu row, a
 * nav highlight; a capsule control reads `pill`) and every iOS and Android control;
 * `field` a text field, select, or autocomplete box; `card` a content surface;
 * `dialog` a dialog or alert dialog; `menu` a menu, popover, or select list;
 * `sheet` a sheet, drawer, or app shell; `checkbox` the box of a checkbox; `pill`
 * a chip, badge, or capsule; `tile` an icon tile, a swatch, or an alert banner.
 * The roles only one platform or only the kit draws (a Material 3 chip, the iOS action
 * sheet, a keycap) are the rest of each platform's row, the kit-internal `platformShape`
 * (src/style/platform-shape.ts). tools/tokens/shape-roles.ts lists the skins that draw
 * each role per platform and the roles each component plays, and
 * test/design-rules-shape.test.ts holds every corner in the kit to the row of the platform
 * its skin draws: a role its component plays, the pill (9999), square (0), or concentric
 * with its container. The web row is mirrored as `--radius-*` in styles/tokens/radius.css.
 */
export interface ShapeTokens {
  control: number;
  field: number;
  card: number;
  dialog: number;
  menu: number;
  sheet: number;
  checkbox: number;
  pill: number;
  /** A tile: an icon tile, a swatch, an alert banner; tighter than a content card. */
  tile: number;
}

/**
 * The corner radius each platform's skins give a role (a control, a field, a card, a
 * dialog, a menu, a sheet, a checkbox, a pill, a tile), mirrored as `--radius-*` in the
 * CSS hand-off.
 */
export const shape: Record<PlatformKey, ShapeTokens> = {
  // The v4 hand-off (its `K.PF` platform row and component renderers): 10 on rectangular
  // controls and fields, 16 on cards and menus, 20 on dialogs, 22 on sheets, a 5 checkbox,
  // 12 on tiles; every capsule (a chip, a badge, a pill button) reads `pill`.
  web: { control: 10, field: 10, card: 16, dialog: 20, menu: 16, sheet: 22, checkbox: 5, pill: 9999, tile: 12 },
  // HIG / iOS 26, the hand-off's native row unchanged (its `K.PF` ios row: capsule
  // controls, 8 fields, 12 cards): capsule buttons, 8 rounded-border fields (the iOS
  // input-field kit), 12 grouped surfaces with the continuous curve, 28 alerts, 26 menus,
  // the 38 sheet corner, and the edit-mode selection circle for a checkbox (a full round on
  // its square box at every size).
  ios: { control: 9999, field: 8, card: 12, dialog: 28, menu: 26, sheet: 38, checkbox: 9999, pill: 9999, tile: 12 },
  // Material 3: stadium buttons, the 4 filled-field top corner, the 12 medium shape
  // for cards, 28 extra-large dialogs and sheets, 4 extra-small menus, a 2 box.
  android: { control: 9999, field: 4, card: 12, dialog: 28, menu: 4, sheet: 28, checkbox: 2, pill: 9999, tile: 12 },
};

/**
 * Font size and matching line height, in px: a ladder from 12/16 (`xs`) up to 64/70
 * (`7xl`), mirrored in styles/tokens/typography.css `--text-*` / `--leading-*`. No kit
 * component reads it.
 */
export const fontSize: Record<string, { fontSize: number; lineHeight: number }> = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 30 },
  "2xl": { fontSize: 24, lineHeight: 32 },
  "3xl": { fontSize: 28, lineHeight: 36 },
  "4xl": { fontSize: 36, lineHeight: 44 },
  "5xl": { fontSize: 40, lineHeight: 48 },
  "6xl": { fontSize: 55, lineHeight: 64 },
  "7xl": { fontSize: 64, lineHeight: 70 },
};

/** Font weights (RN expects string values). */
export const fontWeight: Record<string, string> = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
};

/** Letter spacing (tracking) in px. */
export const letterSpacing: Record<string, number> = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
};

/** Line height (leading) in px. Relative leadings are approximated as absolute. */
export const lineHeight: Record<string, number> = {
  none: 16,
  tight: 18,
  snug: 20,
  normal: 24,
  relaxed: 28,
  loose: 32,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
};

/** The breakpoint keys, in ascending pixel order. */
export type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl";

/** Desktop-first breakpoints in px: a variant applies at this width and below. */
export const breakpoints: Record<BreakpointKey, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/** The width-scale steps, narrowest first. */
export type WidthKey = "xxxs" | "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl" | "wide" | "wider" | "widest" | "page";

/**
 * The one width scale every bounds-providing container draws from: Container's
 * measure axis, the Dialog and AlertDialog panels, the floating overlays, and any
 * call site that used to pin a `maxWidth` by hand. The values are Tailwind's
 * `max-w-xs` .. `max-w-7xl` steps copied verbatim (no dependency on Tailwind;
 * the numbers only), 64px apart from xs to xxl and then doubling strides, plus
 * two tile steps below xs (`max-w-48` and `max-w-64`, the small KPI card and the
 * chart tile), so the kit and the design mirror name widths instead of inventing
 * them. A component never carries one of these as a width of its own: it is FILL
 * or HUG (see `sizing.ts`), and the step is a cap, picked by the parent layout
 * container or named on the component through its measure axis (`MeasureProps`).
 * Declared narrowest first: `stepOf` reads this order as its precedence.
 */
export const widths: Record<WidthKey, number> = {
  xxxs: 192,
  xxs: 256,
  xs: 320,
  sm: 384,
  md: 448,
  lg: 512,
  xl: 576,
  xxl: 672,
  xxxl: 768,
  wide: 896,
  wider: 1024,
  widest: 1152,
  page: 1280,
};
