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
// - Web is the hand-off's: the web card corner, the `card` fill under a 1 px `border`
//   hairline, the small shadow at rest (`--sh-sm`), the large one raised (`--sh-lg`) and
//   none flat, where the fill steps up to `popover` (the hand-off's sf2). A 20 px inset
//   with an 8 px rhythm between flat children (14 / 8 compact, 28 / 8 comfortable). The
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

export type Elevation = "raised" | "flat" | "tile" | "row" | "empty" | "default";
export type Density = "compact" | "comfortable" | "dense" | "snug" | "cozy" | "relaxed" | "spacious" | "insetContent" | "rail" | "summary" | "metric" | "request" | "menu" | "default";

export interface CardSkin {
  /** Corner radius of the card surface. */
  radius: number;
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
// `flat`): the hairline tokens.border outline on the tokens.card fill.
const lightSurface = (tokens: ColorTokens): ViewStyle => ({ borderColor: tokens.border, backgroundColor: tokens.card });

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
const WEB_DENSITY: Record<Density, ViewStyle> = {
  ...REFERENCE_DENSITY,
  compact: { padding: 14, gap: 8 },
  comfortable: { padding: 28, gap: 8 },
  // The default density IS the standard padded surface: the hand-off's 20px inset
  // plus its 8px rhythm between flat children (`padded` is the explicit
  // form of this default; `flush` opts out of the whole row).
  default: { padding: 20, gap: 8 },
};

// The selected card's outer ring: the accent's soft wash, 4 px outside the border.
const SELECTED_RING = 4;
const selectedRing = (t: ColorTokens) => `0px 0px 0px ${SELECTED_RING}px ${t["primary-soft"] ?? t.ring}`;

// The hand-off's shadow per elevation: none flat, the large step raised, the small one
// at rest (and on the legacy tile, row and empty steps, which the ladder rests at sm).
const webElevation = (e: Elevation, t: ColorTokens): ViewStyle =>
  e === "raised" ? shadow("lg", t) : e === "flat" ? shadow("none") : shadow(e === "tile" ? "sm" : e === "row" || e === "empty" ? e : "DEFAULT", t);

// The selected ring joins the elevation's shadow list (one boxShadow per node on the web).
function withRing(style: ViewStyle, t: ColorTokens): ViewStyle {
  const drop = typeof style.boxShadow === "string" && style.boxShadow !== "none" ? `${style.boxShadow}, ` : "";
  return { ...style, boxShadow: `${drop}${selectedRing(t)}` };
}

export const webSkin: CardSkin = {
  radius: shape.web.card,
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
  compact: { padding: 12, gap: 8 },
  comfortable: { padding: 24, gap: 20 },
  // The default density IS the standard padded surface: M3's 16dp content
  // padding plus the tighter M3 rhythm between flat children.
  default: { padding: 16, gap: 12 },
};

export const androidSkin: CardSkin = {
  // M3 medium shape token (cards).
  radius: shape.android.card,
  // M3 cards never combine an outline with nonzero elevation, so the default and
  // `raised` cards read as M3 ELEVATED (no visible outline) and `flat` reads as M3
  // OUTLINED (1dp outline, elevation 0). The non-outlined variants keep the shared
  // 1px border WIDTH but paint it transparent: content metrics stay identical
  // across variants and platforms, and `selected` can still recolor the hairline
  // to primary without shifting content.
  surface: (tokens, e) => ({
    borderColor: e === "flat" ? tokens.border : "transparent",
    backgroundColor: tokens.card,
  }),
  // M3 resting elevation = level 1 (1dp, our shadow-sm exactly); raised = level 3
  // (6dp: shadow("md")'s shade with the Android elevation corrected via
  // customShadow, since shadow("md") carries elevation 4, which matches no M3
  // level); flat / outlined drops elevation entirely.
  elevation: (e, t) =>
    e === "raised"
      ? customShadow({ offsetY: 4, radius: 6, opacity: 0.1, elevation: 6 })
      : e === "flat"
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

// The hand-off's CardHeader: the card inset above and beside, none below (the body
// below brings its own), the title and description 8px apart, the card's rhythm.
export const header: ViewStyle = { gap: 8, paddingHorizontal: 20, paddingBottom: 0, paddingTop: 20 };

// The card title: 500 21/25 (the h4 step at 1.2) with -0.02em tracking (the face is the skin's).
export const title = (tokens: ColorTokens, fontFamily?: string): TextStyle => ({ fontSize: 21, lineHeight: 25, fontWeight: "500", letterSpacing: -0.42, color: tokens["card-foreground"], ...(fontFamily ? { fontFamily } : null) });

export const description = (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 21, color: tokens["muted-foreground"] });

// The body section pads itself AND spaces its flat children (gap is inert with a single child).
export const content: ViewStyle = { paddingHorizontal: 20, paddingVertical: 20, gap: 10 };

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
