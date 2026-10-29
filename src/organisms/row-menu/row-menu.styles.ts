import { type ViewStyle, type TextStyle } from "react-native";
import { destructiveText } from "../../style/destructive-text.js";
import { shadow, alpha, TOUCH_TARGET, MONO_FONT, type ColorTokens, type TouchTargetSkin, shape } from "../../style/index.js";
import { MENU_ICON, MENU_ROW_GAP, menuIconColor, menuPanel, menuRow, menuRowHover, menuRowLabel, menuRowPressed, menuSection, menuSeparator } from "../../style/menu-look.js";
import { platformShape } from "../../style/platform-shape.js";
import { type IconName } from "../../atoms/icon/icon.js";

// Co-located RowMenu skins, one per platform, all driven by the theme tokens (passed
// in from useTheme so they follow the palette and the scheme). Under glass the shell
// asks AnchoredOverlay for the DENSE layer, so the menu reads as the densest material
// over the row it acts on; in solid mode each skin paints its own card. Menus exist on
// both platforms, so iOS and Android keep their own shapes in the theme's colours, and
// the web takes the v4 hand-off's (its `row-menu` renderer in cv-kit-inputs.js):
//   iOS (HIG context menu): a deeply rounded card (the iOS menu corner, 26) over
//     `popover` with a soft shadow and no border; rows about 44pt tall with a leading
//     icon, groups split by hairline separators, destructive rows in
//     `destructive-text`, a `secondary` highlight on press. The ⋯ trigger dims to 0.8
//     on press; a disabled row dims to 0.4.
//   Android (Material 3 menu): an elevated surface (the Material 3 menu corner,
//     `popover`, soft shadow) with no border; rows about 48dp tall with a leading icon and an
//     alpha(primary, 0.12) ripple; an item that sets `separatorBefore` gets the 1dp M3
//     divider. The ⋯ trigger shares the ripple; a disabled row dims to 0.38.
//   Web: a 32px square trigger at the menu-row corner on the 1px `field-border` edge
//     (the hand-off's ln2), its 16px ⋯ glyph in `foreground`, washed `secondary` while the
//     menu is open and under the pointer; the menu a `card` panel at the menu corner on
//     the `border` hairline with the md shadow, inset 4, 8 below the trigger, at least 220
//     wide; rows 34 tall at the menu-row corner, inset 10, a 15px leading glyph in
//     `subtle-foreground` 8 from a 400 14px label, destructive rows in `destructive-text`;
//     the panel, rows, eyebrow, rule and washes are the web menu recipe it shares with
//     Dropdown (src/style/menu-look.ts). A row's trailing hints (the Navigation card's): a
//     400 11 px mono `shortcut` and a 14 px `submenu` chevron in the third ink, the
//     shortcut at .7 in a destructive row's ink. `inline links` is the card's grouped link
//     list: the list-frame corner on the `border` hairline, rows 48 tall inset 14 and split by the
//     same hairline, a 17 px glyph in the second ink 12 from a 500 14 label, a trailing
//     soft accent `badge` or 400 12 mono `meta`, and a 15 px chevron in the third ink.

export interface RowMenuItem {
  label: string;
  /** Optional leading Canvas glyph, named from the kit icon set (e.g. `"pencil"`,
   *  `"copy"`, `"trash"`). Rendered through the `Icon` atom, tinted to match the
   *  row (destructive rows go red). */
  icon?: IconName;
  /** Red-tinted row for destructive actions (e.g. Delete). */
  destructive?: boolean;
  /** Draw a hairline separator above this row to start a new group. */
  separatorBefore?: boolean;
  /** A keyboard shortcut hint at the row's end, in the mono face (e.g. "⌘E"). */
  shortcut?: string;
  /** The row opens a submenu: a trailing chevron. */
  submenu?: boolean;
  /** A short soft-accent tag at the row's end (e.g. "3 new"). */
  badge?: string;
  /** Quiet trailing metadata in the mono face (e.g. a count). */
  meta?: string;
  /** Make the row inert: it does not fire `onSelect`, does not close the menu, is announced as
   *  disabled, and shows the platform's disabled look (the web's muted ink, a dim on iOS and
   *  Android), for an action that is unavailable in the current context, e.g. "Clear column"
   *  on an already-empty column. */
  disabled?: boolean;
}

// The contract a platform skin fulfills. The shell owns the structure (anchor +
// ⋯ trigger + floating card of section label and item rows) and the open/close
// state; the skin maps tokens and the active row state to RN style objects, and
// declares its press-feedback mode (iOS/web dim or tint inline, Android ripples).
export interface RowMenuSkin extends TouchTargetSkin {
  /** The relative anchor that positions the card (the shell adds the hug sizing). It
   *  starts its children, so the trigger keeps its own size even where a parent that is
   *  not a kit layout container stretches the anchor (a table cell, a plain View). */
  anchor: ViewStyle;
  /** The ⋯ icon-button surface (square, centered, platform radius). */
  trigger: ViewStyle;
  /** The ⋯ (moreHorizontal) Canvas trigger glyph size (px), per platform. */
  triggerIconSize: number;
  /** The ⋯ glyph's ink. */
  triggerIconColor: (t: ColorTokens) => string;
  /** The instant look of the trigger under the pointer (the web's wash); null where there is none. */
  triggerHover: ((t: ColorTokens) => ViewStyle) | null;
  /** The fill applied to the trigger on press (web/iOS tint via this; Android ripples). */
  triggerPressed: (t: ColorTokens) => ViewStyle;
  /** The trigger's resting edge colour, for a trigger with a border; none when left out. */
  triggerEdge?: (t: ColorTokens) => ViewStyle;
  /** The trigger's look while its menu is open; null where it keeps its resting look. */
  triggerOpen?: ((t: ColorTokens) => ViewStyle) | null;
  /** A resting row's leading glyph ink; the row's own ink (foreground) when left out. */
  iconColor?: (t: ColorTokens) => string;
  /** The floating menu card surface (shape, fill, border, shadow, radius). The
   *  shell adds the measured minWidth and positions the card via AnchoredOverlay. */
  menuCard: (t: ColorTokens) => ViewStyle;
  /** The menu's min-width floor; the card never renders narrower than this. */
  menuMinWidth: number;
  /** Standoff between the trigger and the menu card, in px. */
  menuGap: number;
  /** The muted section heading above the rows. */
  menuLabel: (t: ColorTokens) => TextStyle;
  /** A single action/link row layout. */
  itemRow: ViewStyle;
  /** The fill applied to a row on press (web/iOS tint via this; Android ripples). */
  itemPressed: (t: ColorTokens) => ViewStyle;
  /** The instant look of a resting row under the pointer (the web's wash); null where there is none. */
  itemHover: ((t: ColorTokens) => ViewStyle) | null;
  /** The space between rows. */
  rowGap: number;
  /** A disabled row: the dim it takes, and whether its label and icon go to the muted ink instead. */
  disabledRow: { opacity: number; muted: boolean };
  /** The hairline separator above a row that sets `separatorBefore`. Always rendered
   *  when an item requests it, on every platform (both HIG and M3 menus use group dividers). */
  separator: (t: ColorTokens) => ViewStyle;
  /** The row label text size. */
  rowTextSize: TextStyle;
  /** The leading Canvas icon size (px), sized to sit with the label per platform. */
  iconSize: number;
  /** The per-row text color (destructive red, link foreground, action popover fg). */
  rowTextColor: (item: RowMenuItem, links: boolean, t: ColorTokens, dark: boolean) => TextStyle;
  /** A row's trailing `shortcut` hint (a destructive row's takes its ink, dimmed). */
  shortcut: (t: ColorTokens, destructive: boolean) => TextStyle;
  /** A row's trailing `meta`. */
  meta: (t: ColorTokens) => TextStyle;
  /** The trailing chevron (a `submenu` row's, every `inline links` row's): its size in a menu row and in a link row, and its ink. */
  submenuSize: number;
  linkChevronSize: number;
  chevronColor: (t: ColorTokens) => string;
  /** The `inline links` grouped list: its frame, a row, the rule above every row after the first, the glyph, the label. */
  linkList: (t: ColorTokens) => ViewStyle;
  linkRow: ViewStyle;
  linkDivider: (t: ColorTokens) => ViewStyle;
  linkIconSize: number;
  linkIconColor: (t: ColorTokens) => string;
  linkLabel: (t: ColorTokens) => TextStyle;
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

// The third ink every trailing hint takes.
const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];

// The web row's shortcut hint: 400 11 px mono (the Navigation card's `font:400 11px var(--fm)`).
const ITEM_SHORTCUT: TextStyle = { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "400" };

// ---------- Web: the v4 hand-off's row menu ----------
export const webSkin: RowMenuSkin = {
  minTarget: null,
  anchor: { position: "relative", alignItems: "flex-start" },
  // A 32px square at the hand-off's 8 corner (the web menu row's) on the field hairline.
  trigger: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: platformShape.web.menuRow,
    borderWidth: 1,
  },
  triggerIconSize: 16,
  triggerIconColor: (t) => t.foreground,
  triggerHover: (t) => ({ backgroundColor: t.secondary }),
  triggerPressed: menuRowPressed,
  triggerEdge: (t) => ({ borderColor: t["field-border"] ?? t.input }),
  triggerOpen: (t) => ({ backgroundColor: t.secondary }),
  menuCard: (t) => menuPanel(t),
  menuMinWidth: 220,
  menuGap: 8,
  menuLabel: menuSection,
  // The recipe's row, 34 tall with an 8 glyph gap (the hand-off's `menu` helper).
  itemRow: { ...menuRow, gap: 8, minHeight: 34, paddingVertical: 8 },
  itemPressed: menuRowPressed,
  itemHover: menuRowHover,
  rowGap: MENU_ROW_GAP,
  disabledRow: { opacity: 1, muted: true },
  separator: menuSeparator,
  rowTextSize: menuRowLabel,
  iconSize: MENU_ICON,
  iconColor: menuIconColor,
  rowTextColor: (item, links, t) => {
    if (item.destructive) return { color: destructiveText(t) };
    return { color: links ? t.foreground : t["popover-foreground"] };
  },
  shortcut: (t, destructive) => ({ ...ITEM_SHORTCUT, color: destructive ? destructiveText(t) : subtle(t), opacity: destructive ? 0.7 : 1 }),
  meta: (t) => ({ fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "400", color: subtle(t) }),
  submenuSize: 14,
  linkChevronSize: 15,
  chevronColor: subtle,
  linkList: (t) => ({ borderWidth: 1, borderColor: t.border, borderRadius: platformShape.web.listFrame, overflow: "hidden" }),
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 14 },
  linkDivider: (t) => ({ borderTopWidth: 1, borderColor: t.border }),
  linkIconSize: 17,
  linkIconColor: (t) => t["muted-foreground"],
  linkLabel: (t) => ({ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 14, lineHeight: 18, fontWeight: "500", color: t.foreground }),
  triggerPressedOpacity: null,
  ripple: null,
};

// ---------- iOS 27 (Liquid Glass context menu): big-radius popover, leading icons, hairlines ----------
// Apple's iOS 26+/iOS 27 context menu: a floating, deeply rounded card (the kit's iOS
// menu corner, continuous, up from the old ~13pt) over `popover` with a soft shadow and
// NO border; rows are ~44pt tall with comfortable horizontal padding and a LEADING
// glyph; groups are split by full-bleed hairline separators; a destructive row is
// red; the pressed row tints with the `secondary` system fill (not a ripple). The
// ⋯ trigger dims to ~0.8 opacity on press. The larger radius is what reads as the
// modern Liquid Glass menu; the rest of the structure (leading icons, hairlines,
// destructive red, section titles) is unchanged from the HIG layout.
const IOS_RADIUS = shape.ios.menu;
export const iosSkin: RowMenuSkin = {
  minTarget: TOUCH_TARGET.ios,
  anchor: { position: "relative", alignItems: "flex-start" },
  // The iOS control corner, a circle on the 32pt trigger (it paints no fill; the press dims it).
  trigger: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: shape.ios.control,
  },
  triggerIconSize: 17,
  triggerIconColor: (t) => t.foreground,
  triggerHover: null,
  // iOS dims the whole trigger on press (pressedOpacity); no fill tint.
  triggerPressed: () => ({}),
  menuCard: (t) => ({
    borderRadius: IOS_RADIUS,
    backgroundColor: t.popover,
    // The deep corner clips the first/last row fills cleanly; vertical inset keeps
    // the top/bottom rows clear of the rounded corners.
    paddingVertical: 6,
    overflow: "hidden",
    ...shadow("lg", t),
  }),
  menuMinWidth: 250,
  menuGap: 4,
  itemHover: null,
  rowGap: 0,
  disabledRow: { opacity: 0.4, muted: false },
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
  // A full-bleed hairline divider (no horizontal inset) splitting menu groups.
  separator: (t) => ({ height: 1, backgroundColor: t.border, marginVertical: 4 }),
  rowTextSize: { fontSize: 17, lineHeight: 22 },
  iconSize: 20,
  rowTextColor: (item, links, t) => {
    if (item.destructive) return { color: destructiveText(t) };
    return { color: links ? t.foreground : t["popover-foreground"] };
  },
  shortcut: (t, destructive) => ({ fontSize: 15, lineHeight: 20, fontWeight: "400", color: destructive ? destructiveText(t) : subtle(t), opacity: destructive ? 0.7 : 1 }),
  meta: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "400", color: subtle(t) }),
  submenuSize: 14,
  linkChevronSize: 14,
  chevronColor: subtle,
  // The inset grouped list (the HIG's settings list): the grouped corner on the card fill, hairline-split rows.
  linkList: (t) => ({ borderRadius: platformShape.ios.groupedList, borderCurve: "continuous", backgroundColor: t.card, overflow: "hidden" }),
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44, paddingHorizontal: 16 },
  linkDivider: (t) => ({ borderTopWidth: 1, borderColor: t.border }),
  linkIconSize: 20,
  linkIconColor: (t) => t["muted-foreground"],
  linkLabel: (t) => ({ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 17, lineHeight: 22, fontWeight: "400", color: t.foreground }),
  triggerPressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 menu): elevated surface, ripple rows, no dividers ----------
// M3 dropdown/context menu: an elevated surface (4dp radius, `popover` fill, soft
// shadow) with NO border; rows are ~48dp tall with a LEADING icon and a brand
// ripple on press (alpha(primary, 0.12) state layer); M3 menus do NOT draw
// dividers between every group, so separators are suppressed. Destructive rows
// are red. The ⋯ trigger shares the ripple.
const ANDROID_RADIUS = shape.android.menu;
export const androidSkin: RowMenuSkin = {
  minTarget: TOUCH_TARGET.android,
  anchor: { position: "relative", alignItems: "flex-start" },
  trigger: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    // An M3 icon button: the control role, a circle on its square box.
    borderRadius: shape.android.control,
    // Clip the Material ripple to the circular outline (without this, the bounded
    // RippleDrawable paints a rectangle past the rounded corners on Android).
    overflow: "hidden",
  },
  triggerIconSize: 20,
  triggerIconColor: (t) => t.foreground,
  triggerHover: null,
  // Android tints the trigger via the ripple, not a fill.
  triggerPressed: () => ({}),
  menuCard: (t) => ({
    borderRadius: ANDROID_RADIUS,
    backgroundColor: t.popover,
    paddingVertical: 8,
    ...shadow("md", t),
  }),
  menuMinWidth: 200,
  menuGap: 4,
  itemHover: null,
  rowGap: 0,
  disabledRow: { opacity: 0.38, muted: false },
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
  // M3 does not auto-draw a divider between every group, but an item that explicitly
  // requests `separatorBefore` gets the M3 menu divider (a 1dp full-width hairline).
  separator: (t) => ({ height: 1, backgroundColor: t.border, marginVertical: 4 }),
  rowTextSize: { fontSize: 16, lineHeight: 24 },
  iconSize: 20,
  rowTextColor: (item, links, t) => {
    if (item.destructive) return { color: destructiveText(t) };
    return { color: links ? t.foreground : t["popover-foreground"] };
  },
  shortcut: (t, destructive) => ({ fontSize: 14, lineHeight: 20, fontWeight: "400", color: destructive ? destructiveText(t) : subtle(t), opacity: destructive ? 0.7 : 1 }),
  meta: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "400", color: subtle(t) }),
  submenuSize: 18,
  linkChevronSize: 18,
  chevronColor: subtle,
  // A Material 3 list on the card surface at the medium corner, divider-split rows.
  linkList: (t) => ({ borderRadius: shape.android.card, backgroundColor: t.card, overflow: "hidden" }),
  linkRow: { flexDirection: "row", alignItems: "center", gap: 16, minHeight: 56, paddingHorizontal: 16 },
  linkDivider: (t) => ({ borderTopWidth: 1, borderColor: t.border }),
  linkIconSize: 24,
  linkIconColor: (t) => t["muted-foreground"],
  linkLabel: (t) => ({ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 16, lineHeight: 24, fontWeight: "400", color: t.foreground }),
  triggerPressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
