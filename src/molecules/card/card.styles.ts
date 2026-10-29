import { platformShape } from "../../style/platform-shape.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, customShadow, shape } from "../../style/index.js";
import { HOVER } from "../../style/motion.js";
import { DISPLAY_FONT } from "../../style/mono.js";
import { type HoverMotion } from "../../style/hover.js";

// Per-OS Card skins. Card takes the Canvas v4 hand-off's panel (`K.def('card')` in
// tools/v4/handoff/cv-kit-data.js, with its docs overrides in cv-kit-code.js): one
// structure and one set of (semantic) colors live in card.shared.tsx, and the skins set
// the main surface's corner, fill and border per elevation, its shadow, its own content
// density and its title face. Press feedback is the shell's: Android gets android_ripple,
// iOS and the web a pressed opacity dim.
//
// The composition subcomponents (CardHeader/CardContent/CardFooter/CardSeparator) are
// STATIC shared members, so their insets and type are shared (one value across
// platforms); the main surface and the title face are skin-parameterized.
//
// - Web is the hand-off's: the web card corner (or the tile, callout, panel, stage,
//   showcase-card or hero-stage corner, the Corners axis), the `card` fill under a 1 px
//   `border` hairline, the small shadow at rest (`--sh-sm`), the large one raised
//   (`--sh-lg`), the medium one on the section hero's stage (`--sh-md`, canvas-hero.js
//   `.st`) and none flat, where the fill steps up to `popover` (the hand-off's sf2), or
//   outlined, where the fill stays (the component page's cards). A 20 px inset
//   with an 8 px rhythm between flat children (14 / 8 compact, 28 / 8 comfortable, and
//   24 / 20 roomy: the hand-off's section page card, `padding:24px` with `gap:20px`). The
//   title is 500 21 px in the display face. Selected adds a 4 px ring of the accent's
//   soft wash outside the primary border. A pressable card takes the hover lift
//   (`hover`): 2 px up, its resting shade deepening to the raised one.
// - iOS has no card control (PLATFORM-REFERENCES.md), so its card is the web look at the
//   hand-off's iOS card corner (with Apple's continuous curve), in the platform face.
// - Android matches Material 3 cards, the platform's own card control, drawn in the
//   hand-off's colors: outline and elevation are mutually exclusive, so the default card
//   is the M3 ELEVATED card (level-1 elevation, NO visible outline), `flat` is the M3
//   OUTLINED card (1dp outline, elevation 0), `raised` lifts the elevated card to M3
//   level 3 (6dp). Plus the 12dp medium shape and M3's density steps.

export type Elevation = "raised" | "flat" | "sunken" | "outlined" | "hero" | "tile" | "row" | "empty" | "default";
export type Density = "compact" | "comfortable" | "dense" | "snug" | "cozy" | "relaxed" | "roomy" | "spacious" | "insetContent" | "rail" | "summary" | "metric" | "request" | "menu" | "panel" | "guide" | "linkTile" | "pager" | "default";
/**
 * The corner steps a card can take (the Corners axis): the card corner by default, the
 * tile corner (`smallCorners`), the three the v4 hand-off's component page draws
 * (`calloutCorners`, `largeCorners`, `stageCorners`) and the two its section pages draw
 * (`showcaseCorners`, the showcase card at 20; `heroCorners`, the hero stage at 24). The
 * web skin draws each from its row; the native skins keep their own card corner on every
 * step but the tile (the hand-off's page corners are the web page's, and the Material 3
 * card is the platform's own control).
 */
export type Corner = "small" | "callout" | "large" | "stage" | "showcase" | "hero" | "default";

export interface CardSkin {
  /** Corner radius of the card surface. */
  radius: number;
  /** The corner each step of the Corners axis draws; `default` is `radius`. */
  corners: Record<Corner, number>;
  /** Corner curve; iOS sets "continuous" (Apple superellipse), a no-op elsewhere. */
  curve?: ViewStyle["borderCurve"];
  /** Surface colors (fill + border color), per elevation variant. */
  surface: (tokens: ColorTokens, e: Elevation) => ViewStyle;
  /**
   * The fill a `flat` card steps up to, over `surface`'s. Separate from `surface` because
   * Radio's `card` mode reads `surface(tokens, "flat")` for its outlined tile, which keeps
   * the card fill. Omitted: the flat card keeps `surface`'s fill.
   */
  flatFill?: (tokens: ColorTokens) => string;
  /**
   * Elevation -> shadow mapping (resting/raised/flat differ per OS). `selected` lets a
   * skin add the selected card's outer ring to the same shadow list.
   */
  elevation: (e: Elevation, t: ColorTokens, selected?: boolean) => ViewStyle;
  /** The title's face: the display face on the web skin, the platform face natively. */
  titleFont?: string;
  /** The card's own content padding + flat-child gap, per density. The `default`
   *  row is the standard padded surface every plain card takes (what the `padded`
   *  prop makes explicit), so the surface owns the rhythm between flat children;
   *  `flush` opts out of the whole row. */
  density: Record<Density, ViewStyle>;
  /** The standard inset WITHOUT the flat-child gap. The Card shell no longer
   *  reads this (the default density row superseded it); it remains the gap-free
   *  inset that derived chrome spreads into its own row (Radio's `card` mode,
   *  which owns its internal ring-to-label gap). */
  padded: ViewStyle;
  /**
   * Hover feedback on a pressable card (one with `onPress`): the rise and its timing,
   * and the elevation the hovered card takes for each resting one. Omitted: the card
   * does not respond to hover (the iOS and Android skins, whose platforms deliver no
   * pointer hover by default; the Android card is Material 3's).
   */
  hover?: { motion: HoverMotion; elevation: (e: Elevation) => Elevation };
}

// The shared Light-treatment surface colors (web + iOS, and Android's outlined
// `flat`): the hairline tokens.border outline on the tokens.card fill; a `sunken` card
// sinks the fill to the well beneath the page (the hand-off's `--bg2` tiles and stages:
// `background:var(--bg2);border:1px solid var(--ln)` with no shadow).
const sunkenFill = (tokens: ColorTokens): string => tokens["surface-sunken"] ?? tokens.background;
const lightSurface = (tokens: ColorTokens, e?: Elevation): ViewStyle => ({ borderColor: tokens.border, backgroundColor: e === "sunken" ? sunkenFill(tokens) : tokens.card });

// --- web (the hand-off's panel: the card corner, a hairline, the sh ladder) --

const REFERENCE_DENSITY = {
  dense: { padding: 12 }, snug: { padding: 18 }, cozy: { padding: 20 },
  relaxed: { paddingVertical: 22, paddingHorizontal: 24 }, spacious: { padding: 28 },
  insetContent: { padding: 14 }, rail: { paddingVertical: 12, paddingHorizontal: 14 },
  summary: { paddingVertical: 14, paddingHorizontal: 16 },
  metric: { paddingVertical: 14, paddingHorizontal: 18 },
  request: { paddingTop: 18, paddingRight: 22, paddingBottom: 18, paddingLeft: 20 },
  menu: { paddingVertical: 12 },
};

// The v4 hand-off component page's card insets (Component.dc.html), the same on every
// platform since no platform's card control sets a docs panel's inset: the section panel
// (`padding:18px;...;gap:12px`, lines 221, 256 and 262: the accessibility cards and the
// anatomy legend), the guidance card (`padding:18px 20px;...;gap:10px`, lines 269 and 285:
// the usage guidance and "From the docs" cards), the link tile (`padding:14px 16px;...;
// gap:6px`, line 297: the related-component tiles) and the pager card (`padding:16px
// 18px;...;gap:4px`, line 303: the previous and next cards).
const HANDOFF_DENSITY = {
  panel: { padding: 18, gap: 12 },
  guide: { paddingVertical: 18, paddingHorizontal: 20, gap: 10 },
  linkTile: { paddingVertical: 14, paddingHorizontal: 16, gap: 6 },
  pager: { paddingVertical: 16, paddingHorizontal: 18, gap: 4 },
};
const WEB_DENSITY: Record<Density, ViewStyle> = {
  ...REFERENCE_DENSITY,
  ...HANDOFF_DENSITY,
  compact: { padding: 14, gap: 8 },
  comfortable: { padding: 28, gap: 8 },
  // The hand-off's section page card (`Canvas v4.0.0 <Section>.dc.html`, every `c-*`
  // card: `padding:24px;display:flex;flex-direction:column;gap:20px`).
  roomy: { padding: 24, gap: 20 },
  // The default density IS the standard padded surface: the hand-off's 20px inset
  // plus its 8px rhythm between flat children (`padded` is the explicit
  // form of this default; `flush` opts out of the whole row).
  default: { padding: 20, gap: 8 },
};

// The selected card's outer ring: the accent's soft wash, 4 px outside the border.
const SELECTED_RING = 4;
const selectedRing = (t: ColorTokens) => `0px 0px 0px ${SELECTED_RING}px ${t["primary-soft"] ?? t.ring}`;

// The hand-off's shadow per elevation: none flat, sunken or outlined, the large step raised, the
// medium one on the section hero's stage (canvas-hero.js `.st{...box-shadow:var(--sh-md)}`),
// the small one at rest (and on the legacy tile, row and empty steps, which the ladder
// rests at sm).
const webElevation = (e: Elevation, t: ColorTokens): ViewStyle =>
  e === "raised" ? shadow("lg", t) : e === "flat" || e === "sunken" || e === "outlined" ? shadow("none") : e === "hero" ? shadow("md", t) : shadow(e === "tile" ? "sm" : e === "row" || e === "empty" ? e : "DEFAULT", t);

// The web corner steps: the card corner, the tile corner (`smallCorners`), the v4
// hand-off component page's three (its callout at 14, Component.dc.html line 244, which
// its related tiles share, line 297; its section panel at 18 and its stage at 20) and its
// section pages' two (the showcase card at 20 and the hero stage at 24).
const WEB_CORNERS: Record<Corner, number> = {
  default: shape.web.card,
  small: shape.web.tile,
  callout: platformShape.web.callout,
  large: platformShape.web.panel,
  stage: platformShape.web.stage,
  showcase: platformShape.web.showcaseCard,
  hero: platformShape.web.heroStage,
};

// The selected ring joins the elevation's shadow list (one boxShadow per node on the web).
function withRing(style: ViewStyle, t: ColorTokens): ViewStyle {
  const drop = typeof style.boxShadow === "string" && style.boxShadow !== "none" ? `${style.boxShadow}, ` : "";
  return { ...style, boxShadow: `${drop}${selectedRing(t)}` };
}

export const webSkin: CardSkin = {
  radius: shape.web.card,
  corners: WEB_CORNERS,
  surface: lightSurface,
  flatFill: (t) => t.popover,
  elevation: (e, t, selected) => (selected ? withRing(webElevation(e, t), t) : webElevation(e, t)),
  titleFont: DISPLAY_FONT,
  density: WEB_DENSITY,
  // The gap-free inset Radio's `card` mode spreads into its tile; it keeps its own 24px,
  // since the Radio card is restyled with Radio.
  padded: { padding: 24 },
  // The hand-off's hover: a pressable card rises 2 px and its resting shade deepens to
  // the raised one (sh-lg) in step; a raised or flat card rises with its shade unchanged.
  hover: { motion: HOVER.card, elevation: (e) => (e === "default" ? "raised" : e) },
};

// --- iOS (no card control: the web look at the iOS card corner) -------------

export const iosSkin: CardSkin = {
  radius: shape.ios.card,
  // The native card keeps its own corner on every step but the tile: the hand-off's
  // page corners (the component page's three and the section pages' two) are the web
  // page's.
  corners: { default: shape.ios.card, small: shape.ios.tile, callout: shape.ios.card, large: shape.ios.card, stage: shape.ios.card, showcase: shape.ios.card, hero: shape.ios.card },
  // Apple's superellipse corner curve (an iOS-only RN style prop; device-only
  // visual, a no-op on other platforms and in the web docs preview).
  curve: "continuous",
  surface: lightSurface,
  flatFill: (t) => t.popover,
  // The web's ladder in the platform's shadow props. The selected ring is a web
  // boxShadow; natively the primary border alone marks the selection.
  elevation: (e, t) => webElevation(e, t),
  density: WEB_DENSITY,
  padded: { padding: 24 },
};

// --- Android (Material 3 cards: 12dp medium shape, tighter M3 density) --------

const M3_DENSITY: Record<Density, ViewStyle> = {
  ...REFERENCE_DENSITY,
  ...HANDOFF_DENSITY,
  compact: { padding: 12, gap: 8 },
  comfortable: { padding: 24, gap: 20 },
  // The hand-off's section page card is the web look on every platform (the docs' showcase
  // frame), so the step is the web's.
  roomy: { padding: 24, gap: 20 },
  // The default density IS the standard padded surface: M3's 16dp content
  // padding plus the tighter M3 rhythm between flat children.
  default: { padding: 16, gap: 12 },
};

export const androidSkin: CardSkin = {
  // M3 medium shape token (cards).
  radius: shape.android.card,
  // The Material 3 card keeps its medium shape on every step but the tile.
  corners: { default: shape.android.card, small: shape.android.tile, callout: shape.android.card, large: shape.android.card, stage: shape.android.card, showcase: shape.android.card, hero: shape.android.card },
  // M3 cards never combine an outline with nonzero elevation, so the default and
  // `raised` cards read as M3 ELEVATED (no visible outline), `flat` and `outlined`
  // both read as M3 OUTLINED (1dp outline, elevation 0), and `sunken` reads as M3 FILLED
  // (the sunken well's fill, no outline, elevation 0). The non-outlined variants keep
  // the shared 1px border WIDTH but paint it transparent: content metrics stay identical
  // across variants and platforms, and `selected` can still recolor the hairline
  // to primary without shifting content.
  surface: (tokens, e) => ({
    borderColor: e === "flat" || e === "outlined" ? tokens.border : "transparent",
    backgroundColor: e === "sunken" ? sunkenFill(tokens) : tokens.card,
  }),
  // M3 resting elevation = level 1 (1dp, our shadow-sm exactly); raised = level 3
  // (6dp: shadow("md")'s shade with the Android elevation corrected via
  // customShadow, since shadow("md") carries elevation 4, which matches no M3
  // level); the section hero's stage sits between them at level 2 (3dp); flat /
  // sunken / outlined drops elevation entirely.
  elevation: (e, t) =>
    e === "raised"
      ? customShadow({ offsetY: 4, radius: 6, opacity: 0.1, elevation: 6 })
      : e === "hero"
        ? customShadow({ offsetY: 2, radius: 4, opacity: 0.1, elevation: 3 })
        : e === "flat" || e === "sunken" || e === "outlined"
          ? shadow("none")
          : shadow("sm", t),
  density: M3_DENSITY,
  // M3 cards use 16dp content padding (gap-free; see the CardSkin.padded doc).
  padded: { padding: 16 },
};

// --- shared, color-bearing / layout styles (Light treatment: one set) --------
// These belong to the static composition subcomponents, so they are
// platform-neutral (one value across all three skins). The border WIDTH is shared
// too (the surface colors, including the border color, come from each skin's
// `surface`, so Android can paint the elevated card's border transparent while
// content metrics stay identical everywhere).

/** The card's hairline: the inset its full-bleed media's corner sits inside. */
export const CARD_BORDER = 1;

export const cardBase: ViewStyle = { borderWidth: CARD_BORDER };

// CardMedia's specimen well (children in place of an image): the hand-off component
// page's staging wells, Component.dc.html. Centered content over the sunken fill, at
// least the step's height, growing with its content and clipping what overflows it.
// Variants stage at 160 / 28 x 20, sizes and states at 130 / 24 x 16 (`compact`), the
// platform skins at 240 / 32 x 20 (`tall`), the anatomy figure at 320 / 80 x 40
// (`stage`, line 217: `min-height:320px;padding:80px 40px`) and the playground at
// 340 / 44 x 28 (`playground`, line 156: `min-height:340px;padding:44px 28px`). The
// hand-off's playground stage is a grid cell beside the knob panel, stretched to the
// panel's height and taking the width the panel leaves, so that well alone grows along
// its parent's main axis (and may shrink to the space it is given): the remaining width
// beside the panel, inert stacked over it. The fill is the shell's (an inner fill).
export type MediaWell = "default" | "compact" | "tall" | "stage" | "playground";
const WELL_BASE: ViewStyle = { alignItems: "center", justifyContent: "center", overflow: "hidden", minWidth: 0 };
export const mediaWell: Record<MediaWell, ViewStyle> = {
  default: { ...WELL_BASE, minHeight: 160, paddingVertical: 28, paddingHorizontal: 20 },
  compact: { ...WELL_BASE, minHeight: 130, paddingVertical: 24, paddingHorizontal: 16 },
  tall: { ...WELL_BASE, minHeight: 240, paddingVertical: 32, paddingHorizontal: 20 },
  // The hand-off's `min-height:320px` is the bordered figure's whole box (line 217, the
  // page's `box-sizing:border-box`), so the well inside the frame's two hairlines is 318.
  stage: { ...WELL_BASE, minHeight: 318, paddingVertical: 80, paddingHorizontal: 40 },
  playground: { ...WELL_BASE, minHeight: 340, paddingVertical: 44, paddingHorizontal: 28, flexGrow: 1, flexShrink: 1 },
};

/** The insets a density style spells, whichever padding shorthand it uses, and its rhythm. */
function insetsOf(density: ViewStyle): { top: number; right: number; bottom: number; left: number; gap: number } {
  const n = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);
  const all = n(density.padding) ?? 0;
  const vertical = n(density.paddingVertical) ?? all;
  const horizontal = n(density.paddingHorizontal) ?? all;
  return {
    top: n(density.paddingTop) ?? vertical,
    right: n(density.paddingRight) ?? horizontal,
    bottom: n(density.paddingBottom) ?? vertical,
    left: n(density.paddingLeft) ?? horizontal,
    gap: n(density.gap) ?? 0,
  };
}

/** The section insets a density gives a sectioned card (see `sectionInsets`). */
export interface SectionInsets {
  /** The eyebrow row: the inset above and beside. */
  eyebrow: ViewStyle;
  /** The title header when it leads the card: the inset above and beside. */
  header: ViewStyle;
  /** The title header below the eyebrow row: the rhythm above, the inset beside. */
  headerBelow: ViewStyle;
  /** The body when it leads the card: the inset all round, the rhythm between its children. */
  content: ViewStyle;
  /** The body below a header: the rhythm above, the inset beside and below. */
  contentBelow: ViewStyle;
  /** The footer under its hairline: the rhythm above, the inset beside and below. */
  footer: ViewStyle;
}

/**
 * A density on a SECTIONED card (one with an eyebrow, a title or a footer) moves its
 * inset onto the self-padding sections, since the surface never pads there: the first
 * section takes the inset above, every section the inset beside, the last the inset
 * below, and each section after the first sits the density's rhythm under the one
 * before it, so the hand-off's panel (an 18 px inset, its eyebrow 12 px over its list,
 * Component.dc.html line 256) is `<Card panel eyebrow="Keyboard">`.
 */
export function sectionInsets(density: ViewStyle): SectionInsets {
  const { top, right, bottom, left, gap } = insetsOf(density);
  const beside = { paddingLeft: left, paddingRight: right };
  return {
    eyebrow: { ...beside, paddingTop: top },
    header: { ...beside, paddingTop: top },
    headerBelow: { ...beside, paddingTop: gap },
    content: { ...beside, paddingTop: top, paddingBottom: bottom, gap },
    contentBelow: { ...beside, paddingTop: gap, paddingBottom: bottom, gap },
    footer: { ...beside, paddingTop: gap, paddingBottom: bottom },
  };
}

// The hand-off's CardHeader: the card inset above and beside, none below (the body
// below brings its own), the title and description 8px apart, the card's rhythm.
export const header: ViewStyle = { gap: 8, paddingHorizontal: 20, paddingBottom: 0, paddingTop: 20 };

// The card title: 500 21/25 (the h4 step at 1.2) with -0.02em tracking (the face is the skin's).
export const title = (tokens: ColorTokens, fontFamily?: string): TextStyle => ({ fontSize: 21, lineHeight: 25, fontWeight: "500", letterSpacing: -0.42, color: tokens["card-foreground"], ...(fontFamily ? { fontFamily } : null) });

export const description = (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 21, color: tokens["muted-foreground"] });

// The body section pads itself AND spaces its flat children (gap is inert with a single child).
export const content: ViewStyle = { paddingHorizontal: 20, paddingVertical: 20, gap: 10 };

// The body's tighter insets, the caption strips under the component page's specimen wells
// (Component.dc.html): `dense` the size and state label (10 x 14), `compact` the platform
// caption (12 x 16), `cozy` the variant's caption (14 x 16).
export const contentDensity = {
  dense: { paddingVertical: 10, paddingHorizontal: 14 },
  compact: { paddingVertical: 12, paddingHorizontal: 16 },
  cozy: { paddingVertical: 14, paddingHorizontal: 16 },
} as const satisfies Record<string, ViewStyle>;

export const footer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingHorizontal: 20,
  paddingBottom: 14,
  paddingTop: 14,
};

// The data-driven card's eyebrow (500 11 px mono, tracked caps, in the accent's text
// ink) and the row it shares with a badge.
export const eyebrowRow: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 20, paddingTop: 20 };
export const eyebrow = (tokens: ColorTokens): TextStyle => ({ fontSize: 11, lineHeight: 14, fontWeight: "500", letterSpacing: 1.1, textTransform: "uppercase", color: tokens["primary-text"] ?? tokens.primary });

export const separator = (tokens: ColorTokens): ViewStyle => ({ height: 1, width: "100%", backgroundColor: tokens.border });

export const bodyText = (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 21, color: tokens["card-foreground"] });

export const footerText = (tokens: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 18, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] });

/** Fixed insets from the original Argus content panels. */
export function insetPanel(mode: "note" | "version" | "gate", t: ColorTokens): ViewStyle {
  const base: ViewStyle = { borderWidth: 0, backgroundColor: t.secondary, boxShadow: "none", gap: 0 };
  if (mode === "note") return { ...base, paddingVertical: 8, paddingHorizontal: 10, marginTop: 4, borderRadius: shape.web.control };
  if (mode === "version") return { ...base, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9, paddingHorizontal: 12, borderRadius: platformShape.web.insetRow };
  return { ...base, paddingVertical: 14, paddingHorizontal: 16, gap: 5, borderRadius: shape.web.tile };
}
