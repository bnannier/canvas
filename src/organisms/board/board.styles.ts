import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, surfaceRipple, shadow } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";

// The Board skin, drawn to the Canvas v4 hand-off (`K.def('board')` in
// tools/v4/handoff/cv-kit-data.js and its code-driven form, cv-kit-code3.js `O('board')`).
// The structure (the horizontal lanes ScrollView, the DropZone columns, the Draggable cards
// and their anatomy) and every piece of logic live in board.shared.tsx; this is the look.
//
// Neither iOS nor Android ships a board control (PLATFORM-REFERENCES.md), so the native
// skins share the web skin's parts, in the platform's own face; only the press feedback
// is the platform's (the iOS dim, the Android ripple).
//
//   Lanes: 12 apart. A column is the sunken well (`surface-sunken`, the hand-off's bg2) at
//     the web row's lane corner on a `border` hairline, 10 in, its header and cards 8
//     apart (6 compact).
//   Header: 2 by 4 in, the label 600 12 in the muted ink, the count the 11 px mono caption
//     in the subtle ink.
//   Card: the `card` fill at the lane-card corner on a `border` hairline under the
//     small shade, 12 in (8 compact), its rows 8 apart; the title 500 13 / 1.4 (12.5
//     compact), the description 400 12 in the subtle ink.
//   Empty column: a 1.5 px dashed `field-border` slot at the lane-card corner, 18 by 10
//     in, its message 400 12 in the subtle ink, centered.
//
// Lanes and cards use static content frost in glass mode; the skin keeps their complete
// opaque treatment for solid and unavailable material.

export interface BoardSkin {
  /** The horizontal row of columns (the ScrollView content): direction, alignment, gap. */
  lanes: (compact: boolean) => ViewStyle;
  /** A column's lane surface (fill, edge, radius, padding, header-to-list gap). */
  column: (t: ColorTokens, compact: boolean) => ViewStyle;
  /** The column header row (label + count). */
  columnHeader: ViewStyle;
  /** The column header label type. */
  columnLabel: (t: ColorTokens) => TextStyle;
  /** The column's item count (or its explicit badge text) type. */
  columnCount: (t: ColorTokens) => TextStyle;
  /** The card stack inside a column (gap; a minHeight keeps an empty column droppable). */
  cardList: (compact: boolean) => ViewStyle;
  /** A card's surface (fill, edge, corner, shade, padding). */
  card: (t: ColorTokens, compact: boolean) => ViewStyle;
  /** The row inside a card: the (pressable) body column + the trailing cluster. */
  cardRow: ViewStyle;
  /** The card's text column (title, description, chips slot). */
  bodyColumn: (compact: boolean) => ViewStyle;
  /** The card title type. */
  cardTitle: (t: ColorTokens, compact: boolean) => TextStyle;
  /** The subtle, 2-line-clamped description type. */
  cardDescription: (t: ColorTokens) => TextStyle;
  /** The consumer `chips` slot row (wraps; spacing only, content is the consumer's). */
  chipsRow: ViewStyle;
  /** The trailing column: grip + kebab cluster on top, badge under it. */
  trailingColumn: ViewStyle;
  /** The grip + kebab row within the trailing column. */
  trailingCluster: ViewStyle;
  /** The dashed slot an empty column shows. */
  emptySlot: (t: ColorTokens) => ViewStyle;
  /** The empty-column message type. */
  emptyLabel: (t: ColorTokens) => TextStyle;
  /** The pressable card body's own shape (radius; Android clips its ripple to it). */
  pressableBody: ViewStyle;
  /** The fill applied to the pressed card body (web/iOS tint; Android ripples instead). */
  pressedSurface: (t: ColorTokens) => ViewStyle;
  /** iOS dims the pressed body on top of the tint; null elsewhere. */
  pressedOpacity: number | null;
  /** Android ripple over the pressable card body; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// The hand-off's measures, shared by every skin.
const LANE_GAP = 12;
const HEADER: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingVertical: 2, paddingHorizontal: 4 };
const CARD_ROW: ViewStyle = { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 };
const TRAILING: ViewStyle = { flexDirection: "column", alignItems: "flex-end", gap: 8 };
const CLUSTER: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 2 };
const CHIPS: ViewStyle = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 };
// The press layer under a card's body: the card's own corner.
const PRESSABLE_BODY: ViewStyle = { borderRadius: platformShape.web.laneCard };

const column = (t: ColorTokens, compact: boolean): ViewStyle => ({
  backgroundColor: t["surface-sunken"],
  borderWidth: 1,
  borderColor: t.border,
  borderRadius: platformShape.web.lane,
  padding: 10,
  gap: compact ? 6 : 8,
});
const card = (t: ColorTokens, compact: boolean): ViewStyle => ({
  backgroundColor: t.card,
  borderWidth: 1,
  borderColor: t.border,
  borderRadius: platformShape.web.laneCard,
  padding: compact ? 8 : 12,
  ...shadow("sm", t),
});
const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];

/** Web: the hand-off's board. */
export const webSkin: BoardSkin = {
  lanes: () => ({ flexDirection: "row", alignItems: "flex-start", gap: LANE_GAP }),
  column,
  columnHeader: HEADER,
  columnLabel: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "600", color: t["muted-foreground"] }),
  columnCount: (t) => ({ fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "500", color: subtle(t) }),
  cardList: (compact) => ({ gap: compact ? 6 : 8, minHeight: 48 }),
  card,
  cardRow: CARD_ROW,
  bodyColumn: () => ({ gap: 8 }),
  cardTitle: (t, compact) => (compact ? { fontSize: 12.5, lineHeight: 17.5, fontWeight: "500", color: t["card-foreground"] } : { fontSize: 13, lineHeight: 18.2, fontWeight: "500", color: t["card-foreground"] }),
  cardDescription: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", color: subtle(t) }),
  chipsRow: CHIPS,
  trailingColumn: TRAILING,
  trailingCluster: CLUSTER,
  emptySlot: (t) => ({ borderWidth: 1.5, borderStyle: "dashed", borderColor: t["field-border"], borderRadius: platformShape.web.laneCard, paddingVertical: 18, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" }),
  emptyLabel: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", textAlign: "center", color: subtle(t) }),
  pressableBody: PRESSABLE_BODY,
  pressedSurface: (t) => ({ backgroundColor: t.accent }),
  pressedOpacity: null,
  ripple: null,
};

/** iOS: no board control; the web skin's parts in SF Pro, the pressed body dimmed. */
export const iosSkin: BoardSkin = { ...webSkin, pressedOpacity: 0.8 };

/** Android: no Material 3 board; the web skin's parts in Roboto, the card body ripples. */
export const androidSkin: BoardSkin = {
  ...webSkin,
  // The bounded Material ripple is clipped to these corners by the shell's RippleClip
  // parent (a node can never clip its own ripple on Android; see src/style/ripple-clip.tsx).
  pressedSurface: () => ({}),
  ripple: (t) => surfaceRipple(t),
};

// The plain work board (the original Argus lanes): no lane well, custom domain cards. The
// hand-off draws it with the board's own header and dashed empty slot (cv-kit-code3.js
// `O('board')` with `plain`), so only the lanes' geometry is its own.
// A horizontal ScrollView has an unbounded content axis. Give its flex lanes a
// definite row width so a long custom card cannot set every lane's intrinsic width.
// Below the 168px lane floor, only this row overflows the scrollport.
export const plainLane = (bleed: number, viewportWidth: number, columns: number): ViewStyle => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: LANE_GAP,
  paddingBottom: 6,
  paddingHorizontal: bleed,
  width: Math.max(viewportWidth, columns * 168 + Math.max(0, columns - 1) * LANE_GAP + bleed * 2),
});
export const plainColumn: ViewStyle = { flexDirection: "column", gap: 8, flex: 1, minWidth: 168 };
