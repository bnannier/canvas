import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, surfaceRipple } from "../../style/index.js";

// Co-located StackedList skins, one per platform. StackedList is a "Light"
// treatment: identical structure and semantic colors (those live in
// stacked-lists.shared.tsx); only the frame shape/shadow, row density/spacing,
// type tracking, divider inset, and press feedback shift per OS. The BRAND
// survives on every platform (the primary token and the type stay the same);
// only the native shape/sizing/feedback change.
//
//   Web: the established Canvas look, lifted verbatim. A rounded-lg (8) bordered
//     card with shadow-sm; rows px-5 py-3 (20/12); a full-width 1px hairline
//     between ruled rows; text-sm/font-medium name + text-xs muted detail; a
//     14/600 header title; the overflow menu rounded-md (6). Press = the accent
//     surface (no opacity dim, no ripple), matching the current web behavior.
//   iOS (SF / HIG inset-grouped list): a 10-radius bordered card with NO shadow
//     (inset-grouped lists are flat); slightly tighter rows (px-4 py-2.5, 16/10);
//     hairline separators INSET from the leading content (left margin past the
//     avatar, per iOS), plus an accent press surface AND a press-opacity dim
//     (~0.8); SF-style type with tightened tracking (name 15/600 -0.2, detail
//     13/-0.08); a 15/600 header title; overflow menu rounded-md (6).
//   Android (Material 3 list / card): a 12-radius bordered card, FLAT (no shadow,
//     M3 outlined card); taller rows for the M3 two-line list item (px-4 py-3,
//     16/12); a full-width hairline divider; M3 body type with M3 tracking
//     (name body-large 16/+0.15, detail body-medium 14/+0.25 on muted); a 16/500
//     header title; overflow menu rounded-full (M3 icon-button target). Press =
//     android_ripple (a neutral surface state layer); no opacity dim.

// The contract a platform skin fulfills. The shell renders the outer frame, the
// optional titled header, and the rows; the skin maps the active platform's
// frame shape/shadow, row density, type, divider, and feedback onto each piece.
export interface StackedListSkin {
  /** The card surface used by the `card` variant and as the optional frame when a
   *  title is supplied (radius, border, fill, shadow/elevation). */
  cardSurface: (t: ColorTokens) => ViewStyle;
  /** A single row's layout (flex row, alignment, gap, padding/density). */
  rowBase: ViewStyle;
  /** The hairline between ruled rows (color + optional leading inset). */
  rowDivider: (t: ColorTokens) => ViewStyle;
  /** The press surface for clickable rows and the overflow menu button. */
  pressedSurface: (t: ColorTokens) => ViewStyle;
  /** The primary (name) line type. */
  nameLabel: (t: ColorTokens) => TextStyle;
  /** The secondary (detail) line type, also the trailing meta + chevron. */
  mutedLabel: (t: ColorTokens) => TextStyle;
  /** The titled header container (row, justify, rule, padding). */
  header: (t: ColorTokens) => ViewStyle;
  /** The header title type. */
  headerTitle: (t: ColorTokens) => TextStyle;
  /** The overflow ("...") menu button base (size + shape). */
  menuButton: ViewStyle;
  /** iOS/web dim on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the component's own pressable rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- shared layout fragments (identical across platforms) -------------------

// w-full max-w-[560px]: full width, capped at 560px.
export const outer: ViewStyle = { width: "100%", maxWidth: 560 };

// flex-1: the primary + secondary text column.
export const column: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// flex-row items-center gap-1.5: the leading-plus + label row inside addAction.
export const addActionRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 6 };

// text-xs font-medium text-foreground: the addAction button label.
export function addActionLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground };
}

// h-1 w-1 rounded-full bg-foreground: one of the three overflow dots.
export function menuDot(tokens: ColorTokens): ViewStyle {
  return { height: 4, width: 4, borderRadius: 9999, backgroundColor: tokens.foreground };
}

// --- row / menu base fragments reused across skins --------------------------

const ROW: ViewStyle = { flexDirection: "row", alignItems: "center" };

const MENU: ViewStyle = {
  height: 28,
  width: 28,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  backgroundColor: "transparent",
};

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// rounded-lg (8) border bg-card shadow-sm; rows px-5 py-3 (20/12); a full-width
// 1px hairline; text-sm/font-medium name + text-xs muted detail; 14/600 header;
// overflow menu rounded-md (6). Press = the accent surface.
export const webSkin: StackedListSkin = {
  cardSurface: (t) => ({
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.card,
    overflow: "hidden",
    ...shadow("sm"),
  }),
  rowBase: { ...ROW, gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  rowDivider: (t) => ({ borderBottomWidth: 1, borderColor: t.border }),
  pressedSurface: (t) => ({ backgroundColor: t.accent }),
  nameLabel: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),
  mutedLabel: (t) => ({ fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  header: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
  }),
  headerTitle: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "600", color: t.foreground }),
  menuButton: { ...MENU, borderRadius: 6 },
  pressedOpacity: null,
  ripple: null,
};

// ---------- iOS 27 (SF / HIG inset-grouped list) ----------
// A 10-radius bordered card that is FLAT (inset-grouped lists carry no shadow);
// rows are a touch tighter (px-4 py-2.5, 16/10) for the iOS row rhythm; the
// hairline separators are INSET from the leading content (left margin past the
// avatar), per iOS list separators; SF-style type with tightened tracking. Press
// = the accent surface plus an opacity dim (~0.8), the iOS row highlight.
const IOS_RADIUS = 10;
// Separators inset past the leading avatar (avatar default ~40 + the 12 row gap +
// the 16 leading padding), so the rule starts at the text column, matching iOS.
const IOS_SEPARATOR_INSET = 68;
export const iosSkin: StackedListSkin = {
  cardSurface: (t) => ({
    borderRadius: IOS_RADIUS,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.card,
    overflow: "hidden",
  }),
  rowBase: { ...ROW, gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  rowDivider: (t) => ({ borderBottomWidth: 1, borderColor: t.border, marginStart: IOS_SEPARATOR_INSET }),
  pressedSurface: (t) => ({ backgroundColor: t.accent }),
  nameLabel: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "600", letterSpacing: -0.2, color: t.foreground }),
  mutedLabel: (t) => ({ fontSize: 13, lineHeight: 18, letterSpacing: -0.08, color: t["muted-foreground"] }),
  header: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  }),
  headerTitle: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "600", letterSpacing: -0.2, color: t.foreground }),
  menuButton: { ...MENU, borderRadius: 6 },
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 list / outlined card) ----------
// A 12-radius bordered card, FLAT (M3 outlined card: a 1px outline, no shadow);
// rows are taller for the M3 two-line list item (px-4 py-3, 16/12 ~ 72dp); a
// full-width 1px divider; M3 body type with M3 tracking (name body-large
// 16/+0.15, detail body-medium 14/+0.25); a 16/500 header title; the overflow
// menu is rounded-full (the M3 icon-button hit target). Press = android_ripple
// (a neutral surface state layer); no opacity dim.
const ANDROID_RADIUS = 12;
export const androidSkin: StackedListSkin = {
  cardSurface: (t) => ({
    borderRadius: ANDROID_RADIUS,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.card,
    overflow: "hidden",
  }),
  rowBase: { ...ROW, gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  rowDivider: (t) => ({ borderBottomWidth: 1, borderColor: t.border }),
  pressedSurface: () => ({}),
  nameLabel: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "400", letterSpacing: 0.15, color: t.foreground }),
  mutedLabel: (t) => ({ fontSize: 14, lineHeight: 20, letterSpacing: 0.25, color: t["muted-foreground"] }),
  header: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  }),
  headerTitle: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "500", letterSpacing: 0.15, color: t.foreground }),
  // overflow:hidden clips the bounded Material ripple to the rounded (circular) outline.
  menuButton: { ...MENU, borderRadius: 9999, overflow: "hidden" },
  pressedOpacity: null,
  ripple: (t) => surfaceRipple(t),
};
