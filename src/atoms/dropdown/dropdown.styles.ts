import { destructiveText } from "../../style/destructive-text.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha, shape } from "../../style/index.js";
import { primaryText } from "../../style/primary-text.js";
import { MENU_ICON, MENU_ROW_GAP, menuDetail, menuIconColor, menuPanel, menuRow, menuRowHover, menuRowLabel, menuRowPressed, menuSection, menuSeparator } from "../../style/menu-look.js";

// Co-located Dropdown skins, one per platform, all driven by the theme tokens (passed
// in from useTheme so they follow the palette and the scheme). Under glass the shell
// asks AnchoredOverlay for the DENSE layer, so the menu reads as the densest material
// and its rows stay legible; in solid mode each skin paints its own card. Menus exist
// on both platforms, so iOS and Android keep their own shapes in the theme's colours
// (the design language's item 3), and the web takes the v4 hand-off's:
//   iOS (iOS 26 / Liquid Glass pull-down menu): a very rounded panel (the iOS menu
//     corner, `popover` fill, no border, soft shadow), rows about 44pt tall with 17pt labels,
//     hairline `border` separators between groups, destructive rows in
//     `destructive-text`; a pressed row tints with a `secondary` highlight (no ripple)
//     at pressedOpacity 0.8; a disabled row dims to 0.4.
//   Android (Material 3 menu): an elevated surface (the Material 3 menu corner,
//     `popover`, shadow md, paddingVertical 8), rows about 48dp tall with 14sp labels
//     and a leading icon gutter, an android_ripple (alpha(primary, 0.12) state layer) on rows, no
//     separators; a disabled row dims to 0.38.
//   Web: the v4 hand-off's menu (its Dropdown renderer, through the web menu recipe it
//     shares with RowMenu): the `card` panel at the menu corner with the `border` hairline
//     and the md shadow, a 4px inset, 36px rows (30 compact) at the menu-row corner with
//     14 / 400 labels and 15px icons in the subtle ink, the `secondary` wash under a
//     hovered row, the mono eyebrow section heading, the mono shortcut, and a disabled
//     row in the muted ink rather than a dim; 6 below the trigger.

// The contract a platform skin fulfills. The shell renders the wrapper, the
// trigger, the optional backdrop, the menu card, the optional section label, the
// per-group separators, and the item rows; the skin maps the active platform's
// shape/fill/sizing/feedback onto each piece.
export interface DropdownSkin {
  /** Exact compact application menu typography and frame. */
  reference?: {
    card: (t: ColorTokens) => ViewStyle;
    label: TextStyle;
    description: (t: ColorTokens) => TextStyle;
    detail: (t: ColorTokens) => TextStyle;
    section: (t: ColorTokens) => TextStyle;
    note: (t: ColorTokens) => ViewStyle;
    noteText: (t: ColorTokens) => TextStyle;
    /** The compact row's own box, over `itemRow`. */
    row?: ViewStyle;
  };
  /** The floating menu card: shape, fill, border (or lack of), shadow, padding.
   *  The shell supplies the measured minWidth inline. */
  menuCard: (t: ColorTokens) => ViewStyle;
  /** Muted section heading rendered above the rows. */
  menuLabel: (t: ColorTokens) => TextStyle;
  /** The identity header block (title over description) rendered ABOVE both the
   *  section label and the rows, when `title`/`description` are passed. Its
   *  gutter matches `menuLabel`'s, so the header, the label, and the row labels
   *  share one start column. iOS and Android set it at 14/20 over 12/16; the web
   *  in Dark Factory's row label over its caption. */
  menuHeader: ViewStyle;
  /** The header's title line, in the popover foreground. */
  menuHeaderTitle: (t: ColorTokens) => TextStyle;
  /** The header's muted second line under the title. */
  menuHeaderDescription: (t: ColorTokens) => TextStyle;
  /** A hairline separator above a row that starts a new group. iOS/web draw one;
   *  Android (M3) returns null (no dividers). */
  separator: ((t: ColorTokens) => ViewStyle) | null;
  /** An item row layout (the flex-row + gap + radius + padding box). */
  itemRow: ViewStyle;
  /** The fill applied to a pressed row (iOS/web tint here; Android uses a
   *  ripple, so this is null). */
  itemPressed: ((t: ColorTokens) => ViewStyle) | null;
  /** The instant look of a resting row under the pointer (the web's wash); null where there is none. */
  itemHover: ((t: ColorTokens) => ViewStyle) | null;
  /** The space between rows. */
  rowGap: number;
  /** Item label type scale. */
  itemTextType: TextStyle;
  /** Leading Canvas icon size (px), sized to sit with the label per platform. */
  iconSize: number;
  /** The ink of a resting row's leading icon; the label's ink when omitted. */
  iconColor?: (t: ColorTokens) => string;
  /** Item label color; branches on `destructive`. Icons retain their graphic role. */
  itemTextColor: (t: ColorTokens, dark: boolean, destructive: boolean) => TextStyle;
  /** Trailing keyboard shortcut, right-aligned and muted. */
  shortcut: (t: ColorTokens) => TextStyle;
  /** The trailing chevron of a `submenu` row: its size; its ink is the shortcut's. */
  submenuSize: number;
  /**
   * How a selected choice reads where the platform marks it with a leading check (the
   * web): its row's wash, the check's size and ink, and the label's ink. A menu holding a
   * selected choice indents its glyphless rows by the check's width so the labels align.
   * Omitted, the selected label takes the accent ink alone.
   */
  selectedMark?: { wash: (t: ColorTokens) => ViewStyle; size: number; color: (t: ColorTokens) => string };
  /** The trigger's look, as Button booleans. */
  trigger: { outline?: boolean; secondary?: boolean; chevron: boolean };
  /** Standoff between the trigger and the menu card, in px. Skin-owned rather than
   *  caller-owned: it is a platform number (the hand-off's 6 on the web, 4 on the native
   *  menus, which the account pill's menu raises to 6 for its taller trigger), and a
   *  spacing prop on a public component would be the re-spacing escape hatch. */
  menuGap: number;
  /** The dim on a disabled custom trigger (the caller's own node, so a dim is all the shell can do). */
  disabledOpacity: number;
  /** A disabled row: the dim it takes, and whether its label and icon go to the muted ink instead. */
  disabledRow: { opacity: number; muted: boolean };
  /** iOS/web dim a row on press via this; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- wrapper + trigger (identical across platforms) -------------------------

// relative anchors the menu; the shell appends `useHugStyle()` (src/style/sizing.ts)
// so the trigger keeps its content width inside a stretching Column without a
// static alignSelf pinning it to the top of a centered Row.
export const wrapper: ViewStyle = { position: "relative" };

// When the menu is open, the wrapper is lifted into its own stacking context
// above sibling content. react-native-web gives every positioned View an
// implicit stacking context, so the menu's own `zIndex` is scoped INSIDE the
// `relative` wrapper and cannot rise above a later sibling. Raising the wrapper's
// zIndex while open lifts the whole control — trigger and menu together — above
// everything painted after it.
export const wrapperLifted: ViewStyle = { zIndex: 50 };

// The custom-trigger Pressable: keeps the chip from stretching.
export const customTrigger: ViewStyle = { alignSelf: "flex-start" };

// ---------- Web: the v4 hand-off's menu ----------
// Its Dropdown renderer over K.panel, through the web menu recipe (src/style/menu-look.ts,
// which the web RowMenu shares): the panel, rows 36 high (30 compact) with a 10 glyph gap,
// the eyebrow section label, the mono shortcut and the inset group rule. The menu sits 6
// below the trigger.
const WEB_MENU_GAP = 6;
const webRow: ViewStyle = { ...menuRow, gap: 10, minHeight: 36 };

export const webSkin: DropdownSkin = {
  reference: {
    card: (t) => menuPanel(t),
    label: menuRowLabel,
    description: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", color: t["muted-foreground"], marginTop: 1 }),
    detail: menuDetail,
    section: menuSection,
    note: (t) => ({ borderTopWidth: 1, borderTopColor: t.border, marginTop: 4, paddingTop: 8, paddingHorizontal: 10, paddingBottom: 6 }),
    noteText: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", color: t["muted-foreground"] }),
    row: { minHeight: 30 },
  },
  menuCard: (t) => menuPanel(t),
  menuLabel: menuSection,
  // The header shares the row gutter (10), so the identity block, the eyebrow and the row
  // labels start on one column.
  menuHeader: { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 6, gap: 2 },
  menuHeaderTitle: (t) => ({ fontSize: 14, lineHeight: 18, fontWeight: "500", color: t["popover-foreground"] }),
  menuHeaderDescription: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", color: t["muted-foreground"] }),
  separator: menuSeparator,
  itemRow: webRow,
  itemPressed: menuRowPressed,
  itemHover: menuRowHover,
  rowGap: MENU_ROW_GAP,
  itemTextType: menuRowLabel,
  iconSize: MENU_ICON,
  iconColor: menuIconColor,
  itemTextColor: (t, _dark, destructive) => {
    if (destructive) return { color: destructiveText(t) };
    return { color: t.foreground };
  },
  shortcut: menuDetail,
  // The renderer's 13 px chevron, the section page's leading check on the accent's soft
  // wash, and the renderer's `secondary small` trigger with its trailing chevron.
  submenuSize: 13,
  selectedMark: { wash: (t) => ({ backgroundColor: t["primary-soft"] ?? t.accent }), size: 14, color: (t) => primaryText(t) },
  trigger: { secondary: true, chevron: true },
  menuGap: WEB_MENU_GAP,
  disabledOpacity: 0.5, // the hand-off's --p-disabled on web
  disabledRow: { opacity: 1, muted: true },
  pressedOpacity: null, // web tints the row fill on press, no opacity dim
  ripple: null,
};

// ---------- iOS 26 (Liquid Glass pull-down menu): VERY rounded popover, no border, hairline groups ----------
// Apple's iOS 26 pull-down/context menu: a very rounded popover panel (~26pt
// continuous radius, matching Apple's Liquid Glass pull-down kit render) over the `popover` fill
// with NO visible border and a soft shadow; rows ~44pt tall with ~17pt labels,
// full-bleed hairline `border` separators between groups, a destructive row in
// `destructive-text` labels and destructive icons, section titles in `muted-foreground`,
// and an optional trailing SF-style icon (e.g. a submenu chevron). A pressed row
// tints with a subtle `secondary` highlight (no ripple) at pressedOpacity 0.8.
// iOS 26 menus are markedly rounder than legacy (~13pt) menus; the larger radius
// is the headline shape change.
const IOS_RADIUS = shape.ios.menu;
export const iosSkin: DropdownSkin = {
  menuCard: (t) => ({
    borderRadius: IOS_RADIUS,
    backgroundColor: t.popover,
    paddingVertical: 6,
    // Clip the pressed-row highlight and full-bleed separators to the heavily
    // rounded panel so they don't poke past its corners. iOS still draws the soft
    // shadow outside these bounds.
    overflow: "hidden",
    ...shadow("lg", t),
  }),
  menuLabel: (t) => ({
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: t["muted-foreground"],
  }),
  // Header gutter = the iOS menu-label gutter (16 x 6): the identity block sits
  // on the same 16pt start column as every row label.
  menuHeader: { paddingHorizontal: 16, paddingVertical: 6, gap: 2 },
  menuHeaderTitle: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t["popover-foreground"] }),
  menuHeaderDescription: (t) => ({ fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
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
  iconSize: 20,
  itemTextColor: (t, _dark, destructive) => {
    if (destructive) return { color: destructiveText(t) };
    return { color: t["popover-foreground"] };
  },
  shortcut: (t) => ({
    marginStart: "auto",
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: t["muted-foreground"],
  }),
  // The hand-off dims a disabled iOS control to 0.4 (--p-disabled under
  // [data-platform="ios"]), not the 0.5 web and the legacy UIKit convention use.
  menuGap: 4,
  itemHover: null,
  rowGap: 0,
  disabledOpacity: 0.4,
  disabledRow: { opacity: 0.4, muted: false },
  pressedOpacity: 0.8,
  submenuSize: 14,
  trigger: { outline: true, chevron: false },
  ripple: null,
};

// ---------- Android (Material 3 menu): elevated surface, ripple rows, no dividers ----------
// M3 dropdown menu: an ELEVATED surface (4dp radius, `popover` fill, soft shadow,
// 8dp vertical padding); rows ~48dp tall with 14sp labels and a leading icon
// gutter, an android_ripple (alpha(primary, 0.12) state layer) on each row, and
// NO separators (M3 menus group with spacing, not dividers).
const ANDROID_RADIUS = shape.android.menu;
export const androidSkin: DropdownSkin = {
  menuCard: (t) => ({
    borderRadius: ANDROID_RADIUS,
    backgroundColor: t.popover,
    paddingVertical: 8,
    ...shadow("md", t),
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
  // Header gutter = the M3 menu-label gutter (16 x 8).
  menuHeader: { paddingHorizontal: 16, paddingVertical: 8, gap: 2 },
  menuHeaderTitle: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t["popover-foreground"] }),
  menuHeaderDescription: (t) => ({ fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  // M3 menus use no dividers between items, so the identity header is separated
  // by its own padding rather than a rule (the hand-off collapses the M3
  // separator to 0 height for the same reason).
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
  iconSize: 20,
  itemTextColor: (t, _dark, destructive) => {
    if (destructive) return { color: destructiveText(t) };
    return { color: t["popover-foreground"] };
  },
  shortcut: (t) => ({
    marginStart: "auto",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: t["muted-foreground"],
  }),
  menuGap: 4,
  itemHover: null,
  rowGap: 0,
  disabledOpacity: 0.38, // M3 disabled opacity, the hand-off's --p-disabled on Android
  disabledRow: { opacity: 0.38, muted: false },
  pressedOpacity: null, // Android uses a ripple instead
  submenuSize: 18,
  trigger: { outline: true, chevron: false },
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
