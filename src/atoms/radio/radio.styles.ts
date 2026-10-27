import { StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { shape, type ColorTokens } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { selectedCard } from "../../style/selected-card.js";
import { type RadioSkin, type Size } from "./radio.shared.js";

// Co-located Radio skins, one per platform, drawn in the Canvas v4 hand-off's colours
// (`K.def('radio')` in tools/v4/handoff/cv-kit-controls.js, and the iOS and Android rows
// `K.PF.radio` in cv-kit-platform.js). The chosen option is always the accent (`primary`),
// never a platform default; only the native SHAPE, sizing and press feedback change per OS:
//   Web: a 16/18/22px ring per size. At rest a 1.5px edge in the `input` boundary (solved
//     to 3:1, where the hand-off's hairline is about 1.5:1); chosen, the edge thickens to
//     30% of the ring in the accent around a hollow center. A hovering pointer rings an
//     unchosen ring in the accent's soft wash (6px). The ring sits 12px from a 500 14px
//     title over a 12px description in the subtle ink, the same at every size; options
//     stack 12 apart. A card is a tile at the tile corner (12 by 14 inside a hairline on
//     the raised fill), Card's selected accent edge and tint when chosen, 8 apart.
//     Disabled at 0.4.
//   iOS (HIG): no radio button at all, so a single choice is a CHECKMARK LIST (the
//     inline picker in a grouped Form): the label leads, the chosen option carries a
//     trailing accent check at the label size plus 4, and inside a RadioGroup the options
//     are one inset-grouped section (44pt rows, 16pt insets, inset hairline separators,
//     the inset grouped corner inside a hairline); press = the row highlight (a plain row
//     dims ~0.8). A card is its own tile at the tile corner, 8 apart. Disabled at 0.5.
//   Android (Material 3): an 18/20/22dp ring (2dp border) in the secondary ink, the
//     accent ring around a 10/10/12dp accent dot when selected, 16dp from the text;
//     press = android_ripple over a 40dp state layer; options 10 apart. A card is a
//     tile at the tile corner padded 16 inside the field border, Card's selected accent edge and
//     tint when chosen. Disabled at 0.38.
// The iOS and Android title and description step with the size (12/16 over 11/15, 14/20
// over 12/16, 16/24 over 14/20), as the hand-off's platform rows set them.

// Ring diameter per size, per ring family.
const WEB_RING: Record<Size, number> = { small: 16, default: 18, large: 22 };
const ANDROID_RING: Record<Size, number> = { small: 18, default: 20, large: 22 };

// Android's inner dot. EVERY dot is even because every ring above is even: an odd dot
// cannot land on the pixel grid when centered in an even ring, so it renders a half-pixel
// down-right with soft edges (worse the higher the pixel density).
const ANDROID_DOT: Record<Size, number> = { small: 10, default: 10, large: 12 };

// The web's text, the same at every size (only the ring scales): the hand-off's 500 14px
// title at its 1.3 line and the 12px description at its 1.45 line, both rounded up to a
// whole pixel, as Checkbox sets them.
const WEB_LABEL: TextStyle = { fontSize: 14, lineHeight: 19 };
const WEB_DESCRIPTION: TextStyle = { fontSize: 12, lineHeight: 18 };

// The native rows' text per size.
const NATIVE_LABEL: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};
const NATIVE_DESCRIPTION: Record<Size, TextStyle> = {
  small: { fontSize: 11, lineHeight: 15 },
  default: { fontSize: 12, lineHeight: 16 },
  large: { fontSize: 14, lineHeight: 20 },
};

// The title beside the control: medium weight in the foreground ink (the row dims as a
// whole when disabled). `flexShrink` lets a long label-only radio wrap within the row.
function labelOf(type: (size: Size) => TextStyle) {
  return (tokens: ColorTokens, size: Size): TextStyle => ({ fontWeight: "500", flexShrink: 1, color: tokens.foreground, ...type(size) });
}
// The secondary line under the title, in the subtle ink.
function descriptionOf(type: (size: Size) => TextStyle) {
  return (tokens: ColorTokens, size: Size): TextStyle => ({ fontWeight: "400", color: tokens["subtle-foreground"] ?? tokens["muted-foreground"], ...type(size) });
}
const webLabel = labelOf(() => WEB_LABEL);
const webDescription = descriptionOf(() => WEB_DESCRIPTION);
const nativeLabel = labelOf((size) => NATIVE_LABEL[size]);
const nativeDescription = descriptionOf((size) => NATIVE_DESCRIPTION[size]);

// Ring base: a perfect circle, centered, nudged by `nudge` so it centers on the title's
// first line. Per-platform border weight is layered on by each skin.
function ringBase(box: number, nudge: number): ViewStyle {
  return {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    width: box,
    height: box,
    backgroundColor: "transparent",
    ...(nudge !== 0 ? { marginTop: nudge } : null),
  };
}

// The tile a `card` radio forms: its corner, its inset, its edge and fill at rest and
// chosen. The edge keeps its width when chosen, so selecting never shifts content.
function cardTile(rest: (t: ColorTokens) => ViewStyle, chosen: (t: ColorTokens) => ViewStyle, box: ViewStyle) {
  return (t: ColorTokens, checked: boolean): ViewStyle => ({ borderWidth: 1, ...box, ...(checked ? chosen(t) : rest(t)) });
}
// A chosen tile takes Card's own `selected` recolor (the accent edge over the accent's
// selected tint), the one recipe both read and the glass selection wash is capped by, so a
// card radio and a selected Card stay in lockstep in either mode.
const chosenTile = (t: ColorTokens): ViewStyle => selectedCard(t);

// ---------- Web: the ring that thickens around a hollow center ----------
export const webSkin: RadioSkin = {
  mark: {
    kind: "ring",
    ring: (t, size, checked, nudge) => ({
      // Center the ring on the 19px first line.
      ...ringBase(WEB_RING[size], nudge ? Math.max(0, (WEB_LABEL.lineHeight! - WEB_RING[size]) / 2) : 0),
      borderWidth: checked ? Math.round(WEB_RING[size] * 0.3) : 1.5,
      borderColor: checked ? t.primary : t.input,
    }),
    // The chosen ring is hollow: its thick edge is the mark.
    dot: null,
    hover: (t) => ({ boxShadow: `0px 0px 0px 6px ${t["primary-soft"] ?? t.accent}` }),
  },
  label: webLabel,
  description: webDescription,
  card: cardTile(
    (t) => ({ borderColor: t.border, backgroundColor: t.popover }),
    chosenTile,
    { borderRadius: shape.web.tile, paddingVertical: 12, paddingHorizontal: 14, alignItems: "center" },
  ),
  rowGap: 12,
  groupGap: { plain: 12, card: 8 },
  list: null,
  disabledOpacity: 0.4,
  pressedOpacity: 0.9,
  ripple: null,
};

// ---------- iOS (HIG): a checkmark list, no ring ----------
// The check is the kit's check glyph at the title's size plus 4, in the accent (iOS tints
// a picker's check with the app's accent), at the end of a column the title's size plus 8
// wide. The list section is the kit's iOS grouped list: the inset grouped corner,
// continuous, the `card` fill inside a hairline, clipped so a row's highlight cannot poke
// past the corners. Rows are 44pt cells with 16pt insets; separators are hairlines inset
// to the text column and run to the trailing edge, as iOS draws them.
const IOS_CELL_INSET = 16;
const IOS_CELL: ViewStyle = { paddingHorizontal: IOS_CELL_INSET, paddingVertical: 11, minHeight: 44 };
export const iosSkin: RadioSkin = {
  mark: {
    kind: "check",
    glyph: (t, size) => ({ color: t.primary, size: NATIVE_LABEL[size].fontSize! + 4, width: NATIVE_LABEL[size].fontSize! + 8 }),
  },
  label: nativeLabel,
  description: nativeDescription,
  card: cardTile(
    (t) => ({ borderColor: t.border, backgroundColor: t.card }),
    chosenTile,
    { borderRadius: shape.ios.tile, borderCurve: "continuous", ...IOS_CELL },
  ),
  rowGap: 12,
  groupGap: { plain: 12, card: 8 },
  list: {
    section: (t) => ({ borderRadius: platformShape.ios.groupedList, borderCurve: "continuous", backgroundColor: t.card, borderWidth: 1, borderColor: t.border, overflow: "hidden" }),
    separator: (t) => ({ height: StyleSheet.hairlineWidth, marginStart: IOS_CELL_INSET, backgroundColor: t.border }),
    cell: IOS_CELL,
    cellPressed: (t) => ({ backgroundColor: t.secondary }),
  },
  disabledOpacity: 0.5,
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3): 20dp ring, 2dp border, ~10dp dot, ripple ----------
export const androidSkin: RadioSkin = {
  mark: {
    kind: "ring",
    ring: (t, size, checked, nudge) => ({
      // Center the ring on the title's first line (a ring taller than the line rides up).
      ...ringBase(ANDROID_RING[size], nudge ? (NATIVE_LABEL[size].lineHeight! - ANDROID_RING[size]) / 2 : 0),
      borderWidth: 2,
      borderColor: checked ? t.primary : t["muted-foreground"],
    }),
    dot: (t, size) => ({ borderRadius: 9999, width: ANDROID_DOT[size], height: ANDROID_DOT[size], backgroundColor: t.primary }),
  },
  label: nativeLabel,
  description: nativeDescription,
  card: cardTile(
    (t) => ({ borderColor: t["field-border"] ?? t.input, backgroundColor: "transparent" }),
    chosenTile,
    { borderRadius: shape.android.tile, padding: 16 },
  ),
  rowGap: 16,
  // The hand-off's 10dp between rows, each row padded 4dp above and below.
  groupGap: { plain: 18, card: 8 },
  list: null,
  disabledOpacity: 0.38, // M3 disabled opacity
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: t.primary, borderless: true, radius: 20 }), // 40dp state layer
};
