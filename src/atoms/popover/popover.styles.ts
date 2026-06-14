import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Popover skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and read as glass when the
// ThemeProvider's surface is "glass", since tokens.popover is swapped translucent
// at the theming level). The BRAND survives on every platform (the heading type
// and the primary action button stay the indigo brand, never a platform default);
// only the native SHAPE, fill, border treatment, elevation, and padding change
// per OS:
//   iOS 27 (iOS 26+, Liquid Glass) popover: a largely rounded card (~26 radius)
//     over the `popover` material, NO visible border, a soft lg shadow, ~16pt
//     padding, with a small soft ARROW pointing toward the anchor (up when the
//     card is below the trigger, down when above). The selection accent / action
//     button stay the brand indigo.
//   Android (no native popover): a flat-cornered ELEVATED surface (~12 radius)
//     over `popover`, M3 elevation (md shadow), NO border and NO arrow — an
//     elevated menu/dialog-style surface, mirroring the select Android menu.
//   Web: the established Canvas look (the current popover, lifted verbatim) — a
//     fixed 260px card, 8 radius, a full 1px `border`, `popover` fill, 16 padding,
//     shadow-lg; no arrow.

export type Placement = "top" | "bottom";

// The contract a platform skin fulfills. The shell resolves the placement axis
// and the inline/floating state and passes them in; the skin maps them to RN
// style objects. `arrow` returns the small pointer's ViewStyle (positioned by the
// shell toward the anchor) or null when the platform draws no arrow.
export interface PopoverSkin {
  /** The floating card frame: width, radius, border, fill, padding, shadow. */
  card: (t: ColorTokens) => ViewStyle;
  /** The popover heading. */
  title: (t: ColorTokens) => TextStyle;
  /** The supporting line beneath the title. */
  description: (t: ColorTokens) => TextStyle;
  /** The arrow pointing toward the anchor, or null when the platform has none. */
  arrow: ((t: ColorTokens, placement: Placement) => ViewStyle) | null;
}

// --- shared layout fragments (identical across platforms) -------------------

// The outer wrapper when a trigger is present: it anchors the absolutely
// positioned card (`relative`) and hugs its content (`self-start`).
export const wrapper: ViewStyle = { position: "relative", alignSelf: "flex-start" };

// The trigger button is wrapped so it hugs its content rather than stretching.
export const triggerWrap: ViewStyle = { alignSelf: "flex-start" };

// With a trigger, the card floats below it (the wrapper is `relative`): pinned
// to the wrapper's bottom-left, lifted above siblings, with a small gap.
export const cardFloating: ViewStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  zIndex: 50,
  marginTop: 8,
};

// The action row: a right-aligned button, spaced from the body above it.
export const actionRow: ViewStyle = { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" };

// The card heading + description share this brand type scale across platforms
// (small, the brand face, not a platform-specific font).
const TITLE_TYPE: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "600" };
const DESC_TYPE: TextStyle = { marginTop: 4, fontSize: 14, lineHeight: 20 };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// A fixed 260px card, the menu radius (8), a full 1px `border`, the `popover`
// fill (translucent under glass), 16 padding, shadow-lg; no arrow.
export const webSkin: PopoverSkin = {
  card: (t) => ({
    width: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.popover,
    padding: 16,
    ...shadow("lg"),
  }),
  title: (t) => ({ ...TITLE_TYPE, color: t["popover-foreground"] }),
  description: (t) => ({ ...DESC_TYPE, color: t["muted-foreground"] }),
  arrow: null,
};

// ---------- iOS 27 (Liquid Glass popover): rounded material card, no border, arrow ----------
// Apple's iOS 26+/Liquid Glass popover: a largely rounded rect (~26pt) over the
// `popover` material with NO visible border, a soft lg drop shadow, ~16pt
// padding, and a small soft arrow pointing toward the anchor view. Brand
// type/accents survive.
const IOS_ARROW = 9; // half-side of the rotated square that forms the soft pointer
export const iosSkin: PopoverSkin = {
  card: (t) => ({
    width: 260,
    borderRadius: 26,
    backgroundColor: t.popover,
    padding: 16,
    ...shadow("lg"),
  }),
  title: (t) => ({ ...TITLE_TYPE, color: t["popover-foreground"] }),
  description: (t) => ({ ...DESC_TYPE, color: t["muted-foreground"] }),
  // A square rotated 45° reads as a diamond; clipped by the card edge it shows as
  // a pointer. Its corners are softly rounded so the exposed tip reads as the
  // Liquid Glass nub (a soft bump) rather than a hard triangle. Positioned by the
  // shell flush to the card's anchor-facing edge, offset in from the left so it
  // sits under the trigger.
  arrow: (t, placement) => ({
    position: "absolute",
    left: 22,
    width: IOS_ARROW * 2,
    height: IOS_ARROW * 2,
    backgroundColor: t.popover,
    borderRadius: 5,
    transform: [{ rotate: "45deg" }],
    // Card is below the trigger (`bottom`): pointer rides the TOP edge pointing
    // up. For `top` (card above) it rides the BOTTOM edge pointing down.
    ...(placement === "top" ? { bottom: -IOS_ARROW } : { top: -IOS_ARROW }),
  }),
};

// ---------- Android (no native popover): flat-cornered elevated surface ----------
// Material 3 has no popover; the convention is an elevated menu/dialog-style
// surface. A flat-cornered card (~12dp radius) over `popover` with M3 elevation
// (md shadow), NO border and NO arrow — mirrors the select Android menu surface.
export const androidSkin: PopoverSkin = {
  card: (t) => ({
    width: 260,
    borderRadius: 12,
    backgroundColor: t.popover,
    padding: 16,
    ...shadow("md"),
  }),
  title: (t) => ({ ...TITLE_TYPE, color: t["popover-foreground"] }),
  description: (t) => ({ ...DESC_TYPE, color: t["muted-foreground"] }),
  arrow: null,
};
