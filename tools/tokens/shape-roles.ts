/**
 * The skins that draw each role of the shape table, per platform.
 *
 * `shape` in src/style/tokens.ts is the one source for a corner that plays a role (a
 * control, a field, a card, a dialog, a menu, a sheet, a checkbox box, a pill, a tile):
 * a skin whose corner plays one reads its platform's row instead of spelling a number.
 * Nothing kept the native rows honest while they only recorded what the skins spelled,
 * and it showed: the iOS checkbox became the edit-mode selection circle while the table
 * still said 5, a value no surface ever drew.
 *
 * This table is what test/design-rules-shape.test.ts compares. A member names a hand-off
 * token of tools/tokens/skin-families.ts, whose reader invokes the skin the way the
 * hand-off test does, and the platforms on which that skin draws the role; a platform it
 * leaves out draws a corner of its own for that component, and `why` says which. Every
 * role has a member on every platform, so a row nothing draws cannot sit in the table.
 *
 * HANDOFF_SHAPE_TOKENS holds the hand-off custom properties that are named for a role
 * rather than read from one skin.
 */

import type { PlatformKey } from "./css-tokens.ts";
import type { ShapeTokens } from "../../src/style/tokens.ts";

export type ShapeRole = keyof ShapeTokens;

export interface ShapeMember {
  /** A hand-off token of SKIN_FAMILIES; every family that checks it is read. */
  token: string;
  /** The platforms whose skin draws this role's corner. */
  on: PlatformKey[];
  /** What the platforms left out of `on` draw instead. */
  why?: string;
}

const ALL: PlatformKey[] = ["web", "ios", "android"];

export const SHAPE_ROLES: Record<ShapeRole, ShapeMember[]> = {
  control: [
    { token: "p-nav-link-radius", on: ALL },
    { token: "p-side-row-radius", on: ALL },
    { token: "p-cal-chevron-radius", on: ALL },
    { token: "p-btn-radius", on: ["ios", "android"], why: "the web Button is Dark Factory's pill, a `pill` member" },
    { token: "p-menu-row-radius", on: ["web"], why: "iOS and Android menu rows run full bleed inside the menu card" },
    { token: "p-side-toggle-radius", on: ["web", "android"], why: "the iOS collapse toggle paints no fill" },
    { token: "p-tab-v-radius", on: ["web", "android"], why: "iOS draws its grouped-rail row at 8, not a capsule" },
  ],
  field: [
    { token: "p-field-radius", on: ALL },
    { token: "p-select-radius", on: ALL },
    { token: "p-ac-radius", on: ALL },
    { token: "p-otp-radius", on: ["web", "ios"], why: "Android draws separated M3 outlined cells at 12" },
  ],
  card: [
    { token: "p-card-radius", on: ALL },
    { token: "p-stat-radius", on: ALL },
    { token: "p-empty-radius", on: ALL },
    { token: "p-feed-radius", on: ALL },
    { token: "p-cal-radius", on: ALL },
    { token: "p-acc-card-radius", on: ALL },
    { token: "p-list-radius", on: ["web", "android"], why: "iOS draws the 26 inset grouped list" },
    { token: "p-dl-radius", on: ["web", "android"], why: "iOS draws the 26 inset grouped list" },
    { token: "p-media-radius", on: ["web", "android"], why: "iOS draws the 10 inset group" },
    { token: "p-carousel-slide-radius", on: ["web", "ios"], why: "Android draws the M3 carousel item at 28" },
  ],
  dialog: [
    { token: "p-dialog-radius", on: ALL },
    { token: "p-ad-radius", on: ALL },
    { token: "p-sheet-card-radius-top", on: ["web"], why: "iOS draws its 34 action sheet and Android the M3 bottom sheet, a `sheet` member" },
  ],
  menu: [
    { token: "p-menu-radius", on: ALL },
    { token: "p-select-panel-radius", on: ALL },
    { token: "p-ac-menu-radius", on: ALL },
    { token: "p-popover-radius", on: ["web", "ios"], why: "Android draws Dark Factory's 12 panel (M3 has no popover)" },
  ],
  sheet: [
    { token: "p-drawer-sheet-radius", on: ALL },
    { token: "p-drawer-side-radius", on: ["web", "ios"], why: "Android draws the M3 navigation drawer at 16" },
    { token: "p-sheet-card-radius-top", on: ["android"], why: "the web card is a `dialog` member and iOS draws its 34 action sheet" },
  ],
  checkbox: [{ token: "p-check-radius", on: ALL }],
  pill: [
    { token: "p-badge-radius", on: ALL },
    { token: "p-page-radius", on: ALL },
    { token: "p-seg-track-radius", on: ALL },
    { token: "p-tab-pill-track-radius", on: ALL },
    { token: "p-tab-pill-radius", on: ALL },
    { token: "p-btn-radius", on: ["web"], why: "iOS and Android Buttons are capsules by the `control` row" },
    { token: "p-chip-radius", on: ["web", "ios"], why: "Android draws the M3 chip at 8" },
    { token: "p-toast-radius", on: ["web", "ios"], why: "Android draws the M3 snackbar at 4" },
  ],
  tile: [
    { token: "p-alert-radius", on: ALL },
    { token: "p-emblem-radius-default", on: ALL },
    { token: "p-swatch-radius-default", on: ALL },
  ],
};

/** Hand-off custom properties named for a shape role rather than read from one skin. */
export const HANDOFF_SHAPE_TOKENS: Record<string, ShapeRole> = {
  "p-overlay-radius": "dialog",
  "p-sheet-radius": "sheet",
};

/**
 * A part a native skin shares with the web skin (the same part, drawn from the same place)
 * although its component's reference row cites a real control for the component's job
 * (every docs component has a row, test/platform-references.test.ts). Where the row says
 * none, the native skin is Dark Factory's look and shares any part without a declaration
 * (tools/tokens/corner-rules.ts); where it cites a control, every part keeps that
 * platform's row unless it is declared here, with the reason that control gives the part
 * no shape of its own. test/design-rules-shape.test.ts fails an entry that no corner
 * needs, and one whose row already says none.
 */
export interface SharedPart {
  /** Where the native skin draws the part: its repo-relative file and the path corner-sites reports. */
  site: string;
  /** Why the platform's own control gives the part no shape of its own. */
  why: string;
}

export const SHARED_PARTS: SharedPart[] = [
  {
    site: "src/organisms/data-table/data-table.styles.ts iosSkin.actionButton",
    why: "SwiftUI Table, the control DataTable's iOS row cites, draws no icon button in a row: a row action's button is the kit's own, at Dark Factory's control corner",
  },
];

/** A skin's corner: a hand-off token of SKIN_FAMILIES, or a module's own reader. */
export type CornerSource =
  | { token: string }
  | {
      /** Module path under src/, without the `.styles.ts` suffix. */
      module: string;
      /** The corner on a skin, or null where the skin draws none. */
      read: (skin: Record<string, unknown>, tokens: Record<string, string>) => number | null;
    };

/**
 * A corner inset inside another, its edge along the container's: a menu's row, a track's
 * pill, a lane's card. Its corner is never rounder than its container's (the rubric's
 * nested-corner rule, part of Dark Factory fidelity on the web), or the inner shape's
 * curve cuts across the container's. A pair is checked on the web skin, and on the
 * native skins only where the kit draws the construction itself rather than a platform
 * control (the contained dialog preview), since an iOS or Material 3 control keeps its
 * platform's own geometry.
 */
export interface NestedCorner {
  /** The pair, for the test title. */
  name: string;
  outer: CornerSource;
  inner: CornerSource;
  /** The platforms the pair is checked on; the web when left out. */
  on?: PlatformKey[];
}

type Skin = Record<string, unknown>;
type Tokens = Record<string, string>;

/** A skin field's style, called with the colour tokens and these arguments when it is a function. */
function styleAt(skin: Skin, key: string, tokens: Tokens, ...args: unknown[]): Record<string, unknown> | null {
  const field = skin[key];
  const style = typeof field === "function" ? (field as (...a: unknown[]) => unknown)(tokens, ...args) : field;
  return typeof style === "object" && style !== null ? (style as Record<string, unknown>) : null;
}

/** A style's corner: its `borderRadius`, or the corner it rounds on its start and top edges. */
function cornerOf(style: Record<string, unknown> | null): number | null {
  if (!style) return null;
  const value = style.borderRadius ?? style.borderTopStartRadius ?? style.borderBottomStartRadius;
  return typeof value === "number" ? value : null;
}

export const NESTED_CORNERS: NestedCorner[] = [
  { name: "Dropdown row in its menu", outer: { token: "p-menu-radius" }, inner: { token: "p-menu-row-radius" } },
  { name: "Select option in its panel", outer: { token: "p-select-panel-radius" }, inner: { token: "p-select-row-radius" } },
  { name: "Autocomplete row in its menu", outer: { token: "p-ac-menu-radius" }, inner: { token: "p-ac-row-radius" } },
  {
    name: "RowMenu row in its menu",
    outer: { module: "organisms/row-menu/row-menu", read: (s, t) => cornerOf(styleAt(s, "menuCard", t)) },
    inner: { module: "organisms/row-menu/row-menu", read: (s, t) => cornerOf(styleAt(s, "itemRow", t)) ?? 0 },
  },
  {
    name: "Listbox row in its bordered box",
    outer: { module: "atoms/listbox/listbox", read: (s, t) => cornerOf(styleAt(s, "containerBordered", t)) },
    inner: { module: "atoms/listbox/listbox", read: (s, t) => cornerOf(styleAt(s, "rowBase", t)) ?? 0 },
  },
  {
    name: "SplitButton row in its menu",
    outer: { module: "atoms/button-group/button-group", read: (s, t) => cornerOf(styleAt(s, "splitMenu", t)) },
    inner: { module: "atoms/button-group/button-group", read: (s, t) => cornerOf(styleAt(s, "splitMenuItemPressed", t)) ?? 0 },
  },
  { name: "ButtonGroup segment in its track", outer: { token: "p-seg-track-radius" }, inner: { token: "p-seg-radius" } },
  { name: "ButtonGroup inner segment in its track", outer: { token: "p-seg-track-radius" }, inner: { token: "p-seg-inner-radius" } },
  { name: "Tabs pill in its track", outer: { token: "p-tab-pill-track-radius" }, inner: { token: "p-tab-pill-radius" } },
  { name: "Tabs segment in its track", outer: { token: "p-tab-track-radius" }, inner: { token: "p-tab-item-radius" } },
  { name: "TabBar item in its bar", outer: { token: "p-tabbar-radius" }, inner: { token: "p-tabbar-item-radius" } },
  { name: "InputOTP cell in its run", outer: { token: "p-otp-radius" }, inner: { token: "p-otp-inner-radius" } },
  { name: "ActionSheet row in its sheet", outer: { token: "p-sheet-card-radius" }, inner: { token: "p-sheet-row-radius" } },
  { name: "Board card in its lane", outer: { token: "p-board-col-radius" }, inner: { token: "p-board-card-radius" } },
  {
    name: "Sidebar row in its bordered column",
    outer: { module: "organisms/sidebar/sidebar", read: (s, t) => cornerOf(styleAt(s, "column", t, "bordered", false, false)) },
    inner: { token: "p-side-row-radius" },
  },
  {
    name: "CodeBlock header bar in its card",
    outer: { module: "molecules/code-block/code-block", read: (s, t) => cornerOf(styleAt(s, "surface", t)) },
    inner: { module: "molecules/code-block/code-block", read: (s, t) => cornerOf(styleAt(s, "headerBar", t)) },
  },
  {
    name: "CodeBlock expander in its card",
    outer: { module: "molecules/code-block/code-block", read: (s, t) => cornerOf(styleAt(s, "surface", t)) },
    inner: { module: "molecules/code-block/code-block", read: (s, t) => cornerOf(styleAt(s, "expanderClip", t)) },
  },
  {
    name: "Dialog card in its contained backdrop",
    outer: { module: "organisms/dialog/dialog", read: (s, t) => cornerOf(styleAt(s, "backdrop", t)) },
    inner: { module: "organisms/dialog/dialog", read: (s, t) => cornerOf(styleAt(s, "card", t)) },
    on: ALL,
  },
  {
    name: "AlertDialog card in its contained backdrop",
    outer: { module: "molecules/alert-dialog/alert-dialog", read: (s, t) => cornerOf(styleAt(s, "backdrop", t)) },
    inner: { module: "molecules/alert-dialog/alert-dialog", read: (s, t) => cornerOf(styleAt(s, "card", t)) },
    on: ALL,
  },
];

/**
 * A corner computed from its container's: the one form of corner the shape table cannot
 * name, since it follows another corner rather than a role. The form alone (a table corner
 * less a number, half a height plus a number) proves no container, so each one is declared
 * here with the construction it belongs to, and test/design-rules-shape.test.ts computes the
 * corner from the container's own skin and compares it with what the source writes.
 */
export interface ConcentricCorner {
  /** The construction, for the test title. */
  name: string;
  /** Where the corner is written: its repo-relative file and the path corner-sites reports. */
  site: string;
  /** Module path under src/, without the `.styles.ts` suffix: the skins that draw the container. */
  module: string;
  /**
   * The corner each construction on a platform gives, computed from the container's own
   * parts in that platform's skin (and the module's other exports): every value the site
   * writes is one of these, and every one of these is a value the site writes.
   */
  corners: (styles: Record<string, unknown>, platform: PlatformKey, tokens: Tokens) => number[];
  on: PlatformKey[];
}

const num = (style: Record<string, unknown> | null, key: string): number => {
  const value = style?.[key];
  if (typeof value !== "number") throw new Error(`no numeric ${key} on ${JSON.stringify(style)}`);
  return value;
};

/** A wrapped track's corner around its pills: a pill's half-height (its padding twice and its label line) plus the track's inset. */
function aroundPills(skin: Skin, tokens: Tokens, part: "underline" | "pills"): number {
  const pill = styleAt(skin, `${part}Trigger`, tokens, false, false);
  const label = styleAt(skin, `${part}Label`, tokens, false);
  const track = styleAt(skin, `${part}Row`, tokens, true);
  return (num(pill, "paddingVertical") * 2 + num(label, "lineHeight")) / 2 + num(track, "padding");
}

export const CONCENTRIC_CORNERS: ConcentricCorner[] = [
  {
    name: "CardMedia's top corners inside the card's border",
    site: "src/molecules/card/card.shared.tsx createCardMedia.radius",
    module: "molecules/card/card",
    corners: (styles, platform) => [num(styles[`${platform}Skin`] as Skin, "radius") - num(styles.cardBase as Skin, "borderWidth")],
    on: ALL,
  },
  {
    name: "CodeBlock's expander inside the code card's border",
    site: "src/molecules/code-block/code-block.styles.ts expanderClip",
    module: "molecules/code-block/code-block",
    corners: (styles, platform, tokens) => {
      const surface = styleAt(styles[`${platform}Skin`] as Skin, "surface", tokens);
      return [num(surface, "borderRadius") - num(surface, "borderWidth")];
    },
    on: ALL,
  },
  {
    name: "Tabs' wrapped capsule track around its pills",
    site: "src/organisms/tabs/tabs.styles.ts CAPSULE_WRAP_RADIUS",
    module: "organisms/tabs/tabs",
    corners: (styles, platform, tokens) => {
      const skin = styles[`${platform}Skin`] as Skin;
      return [aroundPills(skin, tokens, "underline"), aroundPills(skin, tokens, "pills")];
    },
    on: ["web", "ios"],
  },
  {
    name: "Tabs' wrapped Material 3 pills track around its pills",
    site: "src/organisms/tabs/tabs.styles.ts M3_PILL_WRAP_RADIUS",
    module: "organisms/tabs/tabs",
    corners: (styles, _platform, tokens) => [aroundPills(styles.androidSkin as Skin, tokens, "pills")],
    on: ["android"],
  },
];

/**
 * The roles each component's corners play, by its directory under src/: a component may read
 * only these roles from its platform's row (the shape table's and its platform's own,
 * src/style/platform-shape.ts), and it reads every one it lists. So a corner names its role
 * where it is written, and a role a component does not play is a change to this table, made
 * in the open: a menu drawn at the card corner fails until ButtonGroup is declared to draw a
 * card, which it does not. Shared code under `style` and `charts/shared` plays roles for the
 * components that use it.
 */
export const COMPONENT_ROLES: Record<string, readonly string[]> = {
  "atoms/autocomplete": ["control", "field", "menu"],
  "atoms/avatar": ["control"],
  "atoms/badge": ["pill"],
  "atoms/button": ["control", "pill"],
  "atoms/button-group": ["control", "menu", "pill"],
  "atoms/checkbox": ["checkbox"],
  "atoms/chip": ["pill", "chip"],
  "atoms/dropdown": ["menu"],
  "atoms/emblem": ["tile"],
  "atoms/input": ["field"],
  "atoms/input-otp": ["field", "codeCell"],
  "atoms/kbd": ["key"],
  "atoms/listbox": ["control", "menu"],
  "atoms/pagination": ["pill"],
  "atoms/popover": ["menu"],
  "atoms/qrcode": ["tile"],
  "atoms/radio": ["groupedList"],
  "atoms/select": ["control", "field", "menu"],
  "atoms/skeleton": ["card", "pill", "key"],
  "atoms/slider": ["sliderTrack", "sliderTrackInner"],
  "atoms/stepper": ["field"],
  "atoms/swatch": ["tile"],
  "atoms/textarea": ["field"],
  "atoms/tooltip": ["control", "key", "tooltip"],
  "atoms/typography": ["key"],
  "charts/bullet-chart": ["cell"],
  "charts/candlestick-chart": ["candle"],
  "charts/heatmap": ["cell", "key"],
  "charts/shared": ["card", "menu", "bar", "cell"],
  "charts/sparkline": ["mark"],
  "charts/stacked-bar": ["mark"],
  "charts/treemap": ["mark"],
  "charts/waterfall-chart": ["mark"],
  "molecules/accordion": ["card"],
  "molecules/alert": ["control", "tile"],
  "molecules/alert-dialog": ["control", "dialog"],
  "molecules/card": ["card"],
  "molecules/code-block": ["control", "key"],
  "molecules/collapsible": ["card"],
  "molecules/description-lists": ["card", "groupedList"],
  "molecules/empty-state": ["card"],
  "molecules/feeds": ["card"],
  "molecules/grid-lists": ["control", "tile"],
  "molecules/media-objects": ["control", "card", "compactIconBox", "iconBox", "key"],
  "molecules/stacked-lists": ["control", "card", "groupedList"],
  "molecules/stats": ["card"],
  "organisms/action-sheet": ["dialog", "sheet", "actionSheet"],
  "organisms/board": ["control", "card", "groupedList", "lane"],
  "organisms/calendar": ["control", "card", "menu", "event"],
  "organisms/carousel": ["card", "carouselItem"],
  "organisms/command": ["field", "menu"],
  "organisms/dashboard-grid": ["tile"],
  "organisms/data-table": ["control", "field", "card", "tableHeader"],
  "organisms/dialog": ["control", "dialog"],
  "organisms/drag-drop": ["control", "card", "dragGhost"],
  "organisms/drawer": ["sheet", "navigationDrawer"],
  "organisms/filter-panel": ["card", "sideSheet"],
  "organisms/navbars": ["control", "card"],
  "organisms/row-menu": ["control", "menu"],
  "organisms/sidebar": ["control", "card", "navigationDrawer"],
  "organisms/tabs": ["control", "pill", "tabIndicator"],
  "organisms/toast": ["control", "sheet", "pill", "snackbar"],
  "style": ["control", "menu"],
};
