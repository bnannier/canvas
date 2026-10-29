import { type ComponentType } from "react";
import { type ViewStyle, type TextStyle } from "react-native";
import { surfaceRipple, type ColorTokens, MONO_FONT } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { fieldBorder } from "../../style/field-colors.js";
import { type CheckboxIndicatorProps } from "../../atoms/checkbox/indicator/shared.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";

// Per-OS FilterPanel skins, drawn to the Canvas v4 hand-off (tools/v4/handoff/cv-kit-inputs.js
// `K.def('filter-panel')`, its code-driven groups in cv-kit-code2.js and its responsive
// collapse in cv-kit-code7.js). One structure lives in filter-panel.shared.tsx; the panel
// itself is the hand-off's on every platform, in the platform's face, and only the option
// rows change per OS: how a chosen filter is marked, their touch height and their press
// feedback. The atoms the rows compose (the Checkbox mark, the Clear and trigger Buttons)
// are not re-skinned here: each platform entry passes its own.
//
//   The panel: 280 wide, the floating rail's corner, a `field-border` hairline over the `card`
//     fill when `bordered` (a content pane under glass), a 16px inset (12 compact) and a
//     14px rhythm (10 compact). The header is "Filters" in 600 14px with the live count's
//     "Clear N" text action at its end, shown only while a filter is on. A group heading
//     is the 500 11px mono eyebrow, tracked 0.08em, uppercase, in the subtle ink, 8 above
//     its options (4 compact). A row is the mark and its label, then the count in 400
//     12px mono, subtle, 10 from the label.
//   Web: the rows are the content's own height, 8 apart (4 compact), the web Checkbox
//     mark leading each, and they take no press feedback.
//   iOS: iOS has no checkbox (one job, different control): a chosen filter is the list's
//     trailing check after its count, in the accent, and the row is the 44pt list row,
//     dimming to 0.8 on press.
//   Android: the Material 3 checkbox leads each row, the row is 48dp tall, and a press
//     draws the native ripple.

export type Density = "compact" | "base";

// The atoms FilterPanel composes are passed in per platform (see createFilterPanel).
export type CheckboxComponent = ComponentType<CheckboxIndicatorProps>;
export type ButtonComponent = ComponentType<ButtonProps>;

// What a platform skin owns: the panel shape, the density paddings/gaps, the header,
// group and row fragments and their type, and the press feedback on the OWN option rows.
export interface FilterPanelSkin {
  /** Fixed panel width + column layout, shared by both surfaces. */
  panelBase: ViewStyle;
  /** `bordered` card chrome: radius + border + card fill. */
  borderedSurface: (tokens: ColorTokens) => ViewStyle;
  /** Panel inset per density. */
  panelPad: Record<Density, ViewStyle>;
  /** Vertical rhythm between header and groups, and between groups, per density. */
  panelStack: Record<Density, ViewStyle>;
  /** Between a group's heading and its options, per density. */
  groupGap: Record<Density, ViewStyle>;
  /** Between a group's options, per density. */
  optionGap: Record<Density, ViewStyle>;
  /** Header row: the title left, Clear right. */
  headerRow: ViewStyle;
  /** "Filters" heading type. */
  titleText: (tokens: ColorTokens) => TextStyle;
  /** A group column (title above its option list). */
  groupColumn: ViewStyle;
  /** Group heading type. */
  groupTitle: (tokens: ColorTokens) => TextStyle;
  /** One option row: the mark and label left, the optional count right. */
  optionRow: ViewStyle;
  /** The option's count: plain mono text at the row's end. */
  countText: (tokens: ColorTokens) => TextStyle;
  /**
   * How an option row marks its selection: the platform's selection Checkbox beside
   * the label (the web and Android), or the label alone with a trailing check after
   * its count (iOS lists). An indicator row with a `label` sets the label in that type
   * beside the bare box (the web); without one the label is the Checkbox's own (Android).
   */
  optionMark: { kind: "indicator"; label?: (tokens: ColorTokens) => TextStyle } | { kind: "trailing"; label: (tokens: ColorTokens) => TextStyle; check: (tokens: ColorTokens) => TextStyle };
  /** iOS dims the row on press; the web takes none and Android uses a ripple instead (null). */
  rowPressedOpacity: number | null;
  /** Android ripple over the option row; null on iOS/web. */
  rowRipple: ((tokens: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- the hand-off's panel, shared by every platform ----------------------------

/** The hand-off's tx3: the eyebrow and the counts. */
function subtleInk(t: ColorTokens): string {
  return t["subtle-foreground"] ?? t["muted-foreground"];
}

// The 280 rail, capped so it shrinks inside a narrower parent instead of overflowing.
const PANEL_BASE: ViewStyle = { width: 280, maxWidth: "100%", flexDirection: "column" };

// The hand-off's floating rail corner (its filter panel's too), the ln2 hairline
// and the `card` fill.
function borderedSurface(tokens: ColorTokens): ViewStyle {
  return { borderRadius: platformShape.web.floatingRail, borderWidth: 1, borderColor: fieldBorder(tokens), backgroundColor: tokens.card };
}

const PANEL_PAD: Record<Density, ViewStyle> = { compact: { padding: 12 }, base: { padding: 16 } };
const PANEL_STACK: Record<Density, ViewStyle> = { compact: { gap: 10 }, base: { gap: 14 } };
const GROUP_GAP: Record<Density, ViewStyle> = { compact: { gap: 4 }, base: { gap: 8 } };
// A native row is the platform's touch height, which carries the rhythm on its own.
const NATIVE_OPTION_GAP: Record<Density, ViewStyle> = { compact: { gap: 0 }, base: { gap: 0 } };

const HEADER_ROW: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 };
const GROUP_COLUMN: ViewStyle = { flexDirection: "column" };
const OPTION_ROW: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10 };

function titleText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground };
}

// The mono eyebrow: 500 11px, tracked 0.08em (0.88px), uppercase, subtle.
function groupTitle(tokens: ColorTokens): TextStyle {
  return { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "500", letterSpacing: 0.88, textTransform: "uppercase", color: subtleInk(tokens) };
}

function countText(tokens: ColorTokens): TextStyle {
  return { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "400", color: subtleInk(tokens) };
}

const PANEL = {
  panelBase: PANEL_BASE,
  borderedSurface,
  panelPad: PANEL_PAD,
  panelStack: PANEL_STACK,
  groupGap: GROUP_GAP,
  headerRow: HEADER_ROW,
  titleText,
  groupColumn: GROUP_COLUMN,
  groupTitle,
  countText,
} as const;

// ---------- Web: the hand-off's rows ----------
export const webSkin: FilterPanelSkin = {
  ...PANEL,
  optionGap: GROUP_GAP,
  optionRow: OPTION_ROW,
  // The hand-off's option label (Inputs.dc.html `#c-filter-panel` and the FilterPanel
  // renderer agree): 400 14px in the foreground, 10 from the box, not the Checkbox's own
  // 500 label.
  optionMark: { kind: "indicator", label: (tokens) => ({ fontSize: 14, lineHeight: 18, fontWeight: "400", color: tokens.foreground }) },
  rowPressedOpacity: null,
  rowRipple: null,
};

// ---------- iOS: the list's trailing check, 44pt rows, dim on press ----------
export const iosSkin: FilterPanelSkin = {
  ...PANEL,
  optionGap: NATIVE_OPTION_GAP,
  optionRow: { ...OPTION_ROW, minHeight: 44 },
  // The label is the hand-off's 400 14px row label; the check is that size in semibold,
  // in the accent.
  optionMark: {
    kind: "trailing",
    label: (tokens) => ({ fontWeight: "400", fontSize: 14, lineHeight: 20, color: tokens.foreground }),
    check: (tokens) => ({ fontWeight: "600", fontSize: 14, lineHeight: 20, color: tokens.primary }),
  },
  rowPressedOpacity: 0.8,
  rowRipple: null,
};

// ---------- Android: the M3 checkbox, 48dp rows, the ripple ----------
export const androidSkin: FilterPanelSkin = {
  ...PANEL,
  optionGap: NATIVE_OPTION_GAP,
  optionRow: { ...OPTION_ROW, minHeight: 48 },
  optionMark: { kind: "indicator" },
  rowPressedOpacity: null,
  rowRipple: (tokens) => surfaceRipple(tokens),
};
