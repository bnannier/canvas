import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow, alpha } from "../../style/index.js";

// Co-located RowMenu skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and the glass surface, since
// tokens.popover is swapped translucent at the theming level). The BRAND survives
// on every platform (the destructive red is a fixed Tailwind hue, the trigger and
// rows take the brand foreground/popover tokens, never a platform default); only
// the native SHAPE, sizing, structure, and interaction feedback change per OS:
//   iOS (HIG context menu): the floating card is a rounded popover (~13 radius)
//     over `popover` with a soft shadow, NO border; rows are ~44pt tall with a
//     LEADING icon, groups split by hairline `separator` lines; destructive rows
//     are red; pressed = a `secondary` highlight (no ripple). The ⋯ trigger dims
//     to ~0.8 opacity on press.
//   Android (Material 3 menu): the card is an elevated surface (4 radius,
//     `popover`, soft shadow), NO border and NO separators between rows; rows are
//     ~48dp tall with a LEADING icon; press = an android_ripple (alpha(primary,
//     0.12) state layer). Destructive rows are red. The ⋯ trigger uses the same
//     ripple.
//   Web: the established Canvas look (the current row menu, lifted verbatim) — a
//     bordered popover card (6 radius, `border`, shadow-lg, min-w 180), rounded-sm
//     rows (px-2 py-1.5), hairline `border` separators, destructive red, and an
//     `accent` fill on press for both the trigger and the rows.

export interface RowMenuItem {
  label: string;
  /** Optional leading glyph rendered before the label (a single character). */
  icon?: string;
  /** Red-tinted row for destructive actions (e.g. Delete). */
  destructive?: boolean;
  /** Draw a hairline separator above this row to start a new group. */
  separatorBefore?: boolean;
}

// The contract a platform skin fulfills. The shell owns the structure (anchor +
// ⋯ trigger + floating card of section label and item rows) and the open/close
// state; the skin maps tokens and the active row state to RN style objects, and
// declares its press-feedback mode (iOS/web dim or tint inline, Android ripples).
export interface RowMenuSkin {
  /** The relative anchor: keeps the trigger from stretching, positions the card. */
  anchor: ViewStyle;
  /** The ⋯ icon-button surface (square, centered, platform radius). */
  trigger: ViewStyle;
  /** The ⋯ glyph text. */
  triggerGlyph: (t: ColorTokens) => TextStyle;
  /** The fill applied to the trigger on press (web/iOS tint via this; Android ripples). */
  triggerPressed: (t: ColorTokens) => ViewStyle;
  /** The floating menu card surface (shape, fill, border, shadow, radius). The
   *  shell adds the measured minWidth and positions the card via AnchoredOverlay. */
  menuCard: (t: ColorTokens) => ViewStyle;
  /** The menu's min-width floor; the card never renders narrower than this. */
  menuMinWidth: number;
  /** The muted section heading above the rows. */
  menuLabel: (t: ColorTokens) => TextStyle;
  /** A single action/link row layout. */
  itemRow: ViewStyle;
  /** The fill applied to a row on press (web/iOS tint via this; Android ripples). */
  itemPressed: (t: ColorTokens) => ViewStyle;
  /** Whether this platform draws hairline separators between groups (iOS/web yes, Android no). */
  showSeparators: boolean;
  /** The hairline separator above a row that sets `separatorBefore`. */
  separator: (t: ColorTokens) => ViewStyle;
  /** The shared icon/label text size, so they line up in a row. */
  rowTextSize: TextStyle;
  /** The per-row text color (destructive red, link foreground, action popover fg). */
  rowTextColor: (item: RowMenuItem, links: boolean, t: ColorTokens, dark: boolean) => TextStyle;
  /** iOS/web dim the trigger on press; Android ripples instead (null). */
  triggerPressedOpacity: number | null;
  /** Android ripple over the trigger and rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// When the menu is open, the anchor is lifted into its own stacking context above
// sibling content. react-native-web gives every positioned View an implicit
// stacking context, so the card's own `zIndex` is scoped INSIDE the `relative`
// anchor and cannot rise above a later sibling. Raising the anchor's zIndex while
// open lifts the whole control — trigger and card together — above everything
// painted after it. Shared across platforms (the anchor shape is identical).
export const anchorLifted: ViewStyle = { zIndex: 50 };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// A bordered popover card (min-w 180, 6 radius, 1px `border`, `popover` fill,
// p-1, shadow-lg) placed inline below the trigger; rounded-sm rows (px-2 py-1.5)
// with a 2-radius corner; hairline `border` separators split groups; destructive
// rows are red-600/red-400; the trigger and rows tint with `accent` on press.
export const webSkin: RowMenuSkin = {
  anchor: { position: "relative", alignSelf: "flex-start" },
  trigger: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  triggerGlyph: (t) => ({ fontSize: 16, lineHeight: 24, color: t.foreground }),
  triggerPressed: (t) => ({ backgroundColor: t.accent }),
  menuCard: (t) => ({
    borderRadius: 6,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.popover,
    padding: 4,
    ...shadow("lg"),
  }),
  menuMinWidth: 180,
  menuLabel: (t) => ({
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: t["muted-foreground"],
  }),
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  itemPressed: (t) => ({ backgroundColor: t.accent }),
  showSeparators: true,
  separator: (t) => ({ marginVertical: 4, height: 1, backgroundColor: t.border }),
  rowTextSize: { fontSize: 14, lineHeight: 20 },
  rowTextColor: (item, links, t, dark) => {
    if (item.destructive) return { color: dark ? palette["red-400"] : palette["red-600"] };
    return { color: links ? t.foreground : t["popover-foreground"] };
  },
  triggerPressedOpacity: null,
  ripple: null,
};

// ---------- iOS 27 (Liquid Glass context menu): big-radius popover, leading icons, hairlines ----------
// Apple's iOS 26+/iOS 27 context menu: a floating, deeply rounded card (~28pt
// continuous corner, up from the old ~13pt) over `popover` with a soft shadow and
// NO border; rows are ~44pt tall with comfortable horizontal padding and a LEADING
// glyph; groups are split by full-bleed hairline separators; a destructive row is
// red; the pressed row tints with the `secondary` system fill (not a ripple). The
// ⋯ trigger dims to ~0.8 opacity on press. The larger radius is what reads as the
// modern Liquid Glass menu; the rest of the structure (leading icons, hairlines,
// destructive red, section titles) is unchanged from the HIG layout.
const IOS_RADIUS = 28;
export const iosSkin: RowMenuSkin = {
  anchor: { position: "relative", alignSelf: "flex-start" },
  trigger: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  triggerGlyph: (t) => ({ fontSize: 17, lineHeight: 22, color: t.foreground }),
  // iOS dims the whole trigger on press (pressedOpacity); no fill tint.
  triggerPressed: () => ({}),
  menuCard: (t) => ({
    borderRadius: IOS_RADIUS,
    backgroundColor: t.popover,
    // The deep corner clips the first/last row fills cleanly; vertical inset keeps
    // the top/bottom rows clear of the rounded corners.
    paddingVertical: 6,
    overflow: "hidden",
    ...shadow("lg"),
  }),
  menuMinWidth: 250,
  menuLabel: (t) => ({
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: t["muted-foreground"],
  }),
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 44,
  },
  // The selected/pressed row uses the iOS system highlight (the `secondary` fill).
  itemPressed: (t) => ({ backgroundColor: t.secondary }),
  showSeparators: true,
  // A full-bleed hairline divider (no horizontal inset) splitting menu groups.
  separator: (t) => ({ height: 1, backgroundColor: t.border, marginVertical: 4 }),
  rowTextSize: { fontSize: 17, lineHeight: 22 },
  rowTextColor: (item, links, t, dark) => {
    if (item.destructive) return { color: dark ? palette["red-400"] : palette["red-600"] };
    return { color: links ? t.foreground : t["popover-foreground"] };
  },
  triggerPressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 menu): elevated surface, ripple rows, no dividers ----------
// M3 dropdown/context menu: an elevated surface (4dp radius, `popover` fill, soft
// shadow) with NO border; rows are ~48dp tall with a LEADING icon and a brand
// ripple on press (alpha(primary, 0.12) state layer); M3 menus do NOT draw
// dividers between every group, so separators are suppressed. Destructive rows
// are red. The ⋯ trigger shares the ripple.
const ANDROID_RADIUS = 4;
export const androidSkin: RowMenuSkin = {
  anchor: { position: "relative", alignSelf: "flex-start" },
  trigger: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    // Clip the Material ripple to the circular outline (without this, the bounded
    // RippleDrawable paints a rectangle past the rounded corners on Android).
    overflow: "hidden",
  },
  triggerGlyph: (t) => ({ fontSize: 20, lineHeight: 24, color: t.foreground }),
  // Android tints the trigger via the ripple, not a fill.
  triggerPressed: () => ({}),
  menuCard: (t) => ({
    borderRadius: ANDROID_RADIUS,
    backgroundColor: t.popover,
    paddingVertical: 8,
    ...shadow("md"),
  }),
  menuMinWidth: 200,
  menuLabel: (t) => ({
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: t["muted-foreground"],
  }),
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  // The M3 pressed state layer: the brand primary at ~12% alpha (the ripple tint).
  itemPressed: (t) => ({ backgroundColor: alpha(t.primary, 0.12) }),
  showSeparators: false,
  separator: (t) => ({ height: 1, backgroundColor: t.border, marginVertical: 4 }),
  rowTextSize: { fontSize: 16, lineHeight: 24 },
  rowTextColor: (item, links, t, dark) => {
    if (item.destructive) return { color: dark ? palette["red-400"] : palette["red-600"] };
    return { color: links ? t.foreground : t["popover-foreground"] };
  },
  triggerPressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
