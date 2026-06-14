import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow, alpha } from "../../style/index.js";

// Co-located Dropdown skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and read as glass when
// tokens.popover is swapped translucent at the theming level). The BRAND
// survives on every platform (the indigo `primary` press tint on Android, the
// `destructive` red for destructive rows); only the native SHAPE, sizing, fill,
// separators, and press feedback change per OS:
//   iOS (iOS 26 / Liquid Glass pull-down menu): a VERY rounded popover panel
//     (~26 radius, `popover` fill, NO border, soft shadow), rows ~44pt tall with
//     ~17pt labels, hairline `border` separators between groups, a destructive
//     row in `destructive` red, an optional trailing SF-style icon; a pressed row
//     tints with a subtle `secondary` highlight (no ripple) at pressedOpacity 0.8.
//   Android (Material 3 menu): an ELEVATED surface (4 radius, `popover`, shadow
//     md, paddingVertical 8), rows ~48dp tall with 14sp labels and a leading
//     icon gutter, an android_ripple (alpha(primary, 0.12) state layer) on rows,
//     and NO separators.
//   Web: the established Canvas look (the current dropdown, lifted verbatim) — a
//     bordered popover card (6 radius, `border`, `popover` fill, shadow-lg,
//     padding 4), rows with rounded-sm px-2 py-1.5 layout, hairline `border`
//     separators, an `accent` pressed/active fill, and `red-600/red-400`
//     destructive rows.

// The contract a platform skin fulfills. The shell renders the wrapper, the
// trigger, the optional backdrop, the menu card, the optional section label, the
// per-group separators, and the item rows; the skin maps the active platform's
// shape/fill/sizing/feedback onto each piece.
export interface DropdownSkin {
  /** The floating menu card: shape, fill, border (or lack of), shadow, padding.
   *  The shell supplies the measured minWidth inline. */
  menuCard: (t: ColorTokens) => ViewStyle;
  /** Muted section heading rendered above the rows. */
  menuLabel: (t: ColorTokens) => TextStyle;
  /** A hairline separator above a row that starts a new group. iOS/web draw one;
   *  Android (M3) returns null (no dividers). */
  separator: ((t: ColorTokens) => ViewStyle) | null;
  /** An item row layout (the flex-row + gap + radius + padding box). */
  itemRow: ViewStyle;
  /** The fill applied to a pressed row (iOS/web tint here; Android uses a
   *  ripple, so this is null). */
  itemPressed: ((t: ColorTokens) => ViewStyle) | null;
  /** Item icon + label type scale. */
  itemTextType: TextStyle;
  /** Item icon + label color; branches on `destructive`. */
  itemTextColor: (t: ColorTokens, dark: boolean, destructive: boolean) => TextStyle;
  /** Trailing keyboard shortcut, right-aligned and muted. */
  shortcut: (t: ColorTokens) => TextStyle;
  /** Opacity applied to a disabled row. */
  disabledOpacity: number;
  /** iOS/web dim a row on press via this; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- wrapper + trigger (identical across platforms) -------------------------

// self-start keeps the trigger from stretching; relative anchors the menu.
export const wrapper: ViewStyle = { position: "relative", alignSelf: "flex-start" };

// The custom-trigger Pressable: keeps the chip from stretching.
export const customTrigger: ViewStyle = { alignSelf: "flex-start" };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current dropdown: a popover card (rounded-md border bg-popover p-1
// shadow-lg) positioned absolutely below the trigger; rows with the
// flex-row items-center gap-2 rounded-sm px-2 py-1.5 layout, hairline
// my-1 h-px bg-border separators, an active:bg-accent pressed fill, and
// text-red-600 dark:text-red-400 destructive rows.
export const webSkin: DropdownSkin = {
  menuCard: (t) => ({
    borderRadius: 6,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.popover,
    padding: 4,
    ...shadow("lg"),
  }),
  menuLabel: (t) => ({
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: t["muted-foreground"],
  }),
  separator: (t) => ({ marginTop: 4, marginBottom: 4, height: 1, backgroundColor: t.border }),
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  itemPressed: (t) => ({ backgroundColor: t.accent }),
  itemTextType: { fontSize: 14, lineHeight: 20 },
  itemTextColor: (t, dark, destructive) => {
    if (destructive) return { color: dark ? palette["red-400"] : palette["red-600"] };
    return { color: t["popover-foreground"] };
  },
  shortcut: (t) => ({
    marginLeft: "auto",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.6,
    color: t["muted-foreground"],
  }),
  disabledOpacity: 0.5,
  pressedOpacity: null, // web tints the row fill on press, no opacity dim
  ripple: null,
};

// ---------- iOS 26 (Liquid Glass pull-down menu): VERY rounded popover, no border, hairline groups ----------
// Apple's iOS 26 pull-down/context menu: a very rounded popover panel (~26pt
// continuous radius, matching the Liquid Glass kit render in
// docs/public/refs/ios/dropdown/menu-iphone-light.png) over the `popover` fill
// with NO visible border and a soft shadow; rows ~44pt tall with ~17pt labels,
// full-bleed hairline `border` separators between groups, a destructive row in
// the `destructive` red (icon + label), section titles in `muted-foreground`,
// and an optional trailing SF-style icon (e.g. a submenu chevron). A pressed row
// tints with a subtle `secondary` highlight (no ripple) at pressedOpacity 0.8.
// iOS 26 menus are markedly rounder than legacy (~13pt) menus; the larger radius
// is the headline shape change.
const IOS_RADIUS = 26;
export const iosSkin: DropdownSkin = {
  menuCard: (t) => ({
    borderRadius: IOS_RADIUS,
    backgroundColor: t.popover,
    paddingVertical: 6,
    // Clip the pressed-row highlight and full-bleed separators to the heavily
    // rounded panel so they don't poke past the ~26pt corners. iOS still draws
    // the soft shadow outside these bounds.
    overflow: "hidden",
    ...shadow("lg"),
  }),
  menuLabel: (t) => ({
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: t["muted-foreground"],
  }),
  // Hairline group separators run full-bleed across the panel (iOS 26 groups
  // rows with a thin divider).
  separator: (t) => ({ marginTop: 6, marginBottom: 6, height: 1, backgroundColor: t.border }),
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 44,
  },
  // Subtle highlight under a pressed row (no ripple on iOS).
  itemPressed: (t) => ({ backgroundColor: t.secondary }),
  itemTextType: { fontSize: 17, lineHeight: 22 },
  itemTextColor: (t, _dark, destructive) => {
    if (destructive) return { color: t.destructive };
    return { color: t["popover-foreground"] };
  },
  shortcut: (t) => ({
    marginLeft: "auto",
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: t["muted-foreground"],
  }),
  disabledOpacity: 0.5,
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 menu): elevated surface, ripple rows, no dividers ----------
// M3 dropdown menu: an ELEVATED surface (4dp radius, `popover` fill, soft shadow,
// 8dp vertical padding); rows ~48dp tall with 14sp labels and a leading icon
// gutter, an android_ripple (alpha(primary, 0.12) state layer) on each row, and
// NO separators (M3 menus group with spacing, not dividers).
const ANDROID_RADIUS = 4;
export const androidSkin: DropdownSkin = {
  menuCard: (t) => ({
    borderRadius: ANDROID_RADIUS,
    backgroundColor: t.popover,
    paddingVertical: 8,
    ...shadow("md"),
  }),
  menuLabel: (t) => ({
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: t["muted-foreground"],
  }),
  // M3 menus use no dividers between items.
  separator: null,
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 0,
    minHeight: 48,
  },
  // Android uses the ripple, so no static pressed fill.
  itemPressed: null,
  itemTextType: { fontSize: 14, lineHeight: 20 },
  itemTextColor: (t, _dark, destructive) => {
    if (destructive) return { color: t.destructive };
    return { color: t["popover-foreground"] };
  },
  shortcut: (t) => ({
    marginLeft: "auto",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: t["muted-foreground"],
  }),
  disabledOpacity: 0.38, // M3 disabled opacity
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
