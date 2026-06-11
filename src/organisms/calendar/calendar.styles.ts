import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha } from "../../style/index.js";

// Co-located Calendar skins, one per platform. The shell resolves the density
// metrics (compact vs default cell sizing), the leading-blank padding, and the
// per-day selected/today/highlight state; the skin supplies only the native
// SHAPE, sizing, weekday-label style, day-cell fill, today treatment, and press
// feedback. The BRAND survives on every platform (the selected day fills with the
// indigo `primary` token, never a platform default), so each follows light/dark
// and reads as glass when the ThemeProvider's surface is "glass" (tokens.card is
// swapped translucent).
//
//   iOS (HIG date picker): the SELECTED day is a filled `primary` circle
//     (radius 9999) with `primary-foreground` text; TODAY is `primary`-colored
//     text with no fill; weekday headers are ~13pt muted SF-style two-letter
//     labels; the month label sits between two ghost chevrons. Press = opacity
//     dim (~0.8).
//   Android (M3 date picker): the SELECTED day is a filled `primary` circle;
//     TODAY is an OUTLINED ring (1px `primary`) on a transparent fill; weekday
//     headers are single-letter; day cells get a circular `android_ripple`
//     (alpha(primary, 0.12)); slightly larger touch targets.
//   Web: the established Canvas look (rounded-full primary fill for any
//     highlighted day, Su/Mo two-letter weekday labels), lifted verbatim from the
//     original file.

export type Density = "compact" | "default";

// Per-density box sizes, in px. The grid width is exactly seven cell widths so the
// flex-wrap row breaks after the seventh cell.
export interface CellMetrics {
  /** A day cell (square). */
  cell: ViewStyle;
  /** The grid width = seven cell widths. */
  gridWidth: number;
  /** A weekday head cell. */
  head: ViewStyle;
  /** The day-label type scale. */
  label: TextStyle;
}

// The per-day visual state the shell resolves and hands the skin.
export interface DayState {
  /** The day equals `selected` (the primary highlight). */
  selected: boolean;
  /** The day equals `today` (the secondary highlight). */
  today: boolean;
}

// The platform-varying surface. Everything color/shape-bearing the calendar needs
// lives here, built from the active tokens (so each follows light/dark/glass) and
// the active density metrics.
export interface CalendarSkin {
  /** Per-density cell/grid/head/label metrics. */
  metrics: Record<Density, CellMetrics>;

  /** iOS/web dim the day cell on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over a pressed day cell; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean; radius?: number }) | null;

  // --- container ---
  /** The outer surface: border, radius, padding (layout-only). */
  containerBase: ViewStyle;
  /** The surface fill + border (tokens.card goes translucent under glass). */
  containerSurface: (t: ColorTokens) => ViewStyle;

  // --- header (month label + prev/next chevrons) ---
  header: ViewStyle;
  /** A ghost chevron button box. */
  chevron: ViewStyle;
  /** The chevron glyph. */
  chevronText: (t: ColorTokens) => TextStyle;
  /** The month/year label. */
  monthLabel: (t: ColorTokens) => TextStyle;

  // --- weekday header row ---
  /** The weekday + day grid row (fixed width supplied per density). */
  grid: ViewStyle;
  /** A weekday head cell interior. */
  headCell: ViewStyle;
  /** The weekday label. */
  weekdayLabel: (t: ColorTokens) => TextStyle;
  /** The weekday header strings (single-letter on Android, two-letter elsewhere). */
  weekdays: string[];

  // --- day cell ---
  /** A day cell interior (size from metrics; selected/today fill applied on top). */
  dayCellBase: ViewStyle;
  /** The day-cell fill/outline per state (selected circle, today ring, etc.). */
  dayCellState: (t: ColorTokens, state: DayState) => ViewStyle;
  /** The day-label color/weight per state. */
  dayLabel: (t: ColorTokens, state: DayState) => TextStyle;
}

// --- shared weekday strings ------------------------------------------------

const WEEKDAYS_TWO = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_ONE = ["S", "M", "T", "W", "T", "F", "S"];

// =============================================================================
// Web: the established Canvas look (lifted verbatim from the original file).
// Any highlighted day (selected OR today) gets a `primary` rounded-full fill.
// =============================================================================

export const webSkin: CalendarSkin = {
  metrics: {
    compact: {
      cell: { width: 32, height: 32 },
      gridWidth: 224,
      head: { width: 32, height: 28 },
      label: { fontSize: 12, lineHeight: 16 },
    },
    default: {
      cell: { width: 36, height: 36 },
      gridWidth: 252,
      head: { width: 36, height: 32 },
      label: { fontSize: 14, lineHeight: 20 },
    },
  },

  pressedOpacity: 0.9,
  ripple: null,

  // `self-start rounded-lg border p-3`.
  containerBase: {
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  containerSurface: (t) => ({ borderColor: t.border, backgroundColor: t.card }),

  // `mb-2 flex-row items-center justify-between`.
  header: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // `h-7 w-7 items-center justify-center rounded-md bg-transparent`.
  chevron: {
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  chevronText: (t) => ({ fontSize: 14, lineHeight: 20, color: t.foreground }),
  monthLabel: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),

  grid: { flexDirection: "row", flexWrap: "wrap" },
  headCell: { alignItems: "center", justifyContent: "center" },
  weekdayLabel: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: t["muted-foreground"] }),
  weekdays: WEEKDAYS_TWO,

  // `items-center justify-center rounded-full`.
  dayCellBase: { alignItems: "center", justifyContent: "center", borderRadius: 9999 },
  // Any highlighted (today/selected) day fills `bg-primary`.
  dayCellState: (t, st) => (st.selected || st.today ? { backgroundColor: t.primary } : {}),
  // Highlighted -> `font-medium text-primary-foreground`, otherwise `text-foreground`.
  dayLabel: (t, st) =>
    st.selected || st.today
      ? { fontWeight: "500", color: t["primary-foreground"] }
      : { color: t.foreground },
};

// =============================================================================
// iOS (HIG date picker): the SELECTED day is a filled `primary` circle with
// `primary-foreground` text; TODAY is `primary`-colored text with no fill;
// weekday headers ~13pt muted; the month label sits between two ghost chevrons.
// Press = opacity dim.
// =============================================================================

export const iosSkin: CalendarSkin = {
  // Slightly larger, airier cells in the HIG date-picker spirit.
  metrics: {
    compact: {
      cell: { width: 34, height: 34 },
      gridWidth: 238,
      head: { width: 34, height: 28 },
      label: { fontSize: 15, lineHeight: 20 },
    },
    default: {
      cell: { width: 38, height: 38 },
      gridWidth: 266,
      head: { width: 38, height: 30 },
      label: { fontSize: 17, lineHeight: 22 },
    },
  },

  pressedOpacity: 0.8, // HIG: dim on press
  ripple: null,

  containerBase: {
    alignSelf: "flex-start",
    borderRadius: 12, // HIG larger corner radius
    borderWidth: 1,
    padding: 12,
  },
  containerSurface: (t) => ({ borderColor: t.border, backgroundColor: t.card }),

  header: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chevron: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: "transparent",
  },
  // HIG: the chevrons carry the brand indigo (system-accent style), heavier glyph.
  chevronText: (t) => ({ fontSize: 22, lineHeight: 24, fontWeight: "500", color: t.primary }),
  // HIG: a bold ~17pt month/year title.
  monthLabel: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "600", color: t.foreground }),

  grid: { flexDirection: "row", flexWrap: "wrap" },
  headCell: { alignItems: "center", justifyContent: "center" },
  // ~13pt muted SF-style weekday header.
  weekdayLabel: (t) => ({ fontSize: 13, lineHeight: 16, fontWeight: "600", color: t["muted-foreground"] }),
  weekdays: WEEKDAYS_TWO,

  dayCellBase: { alignItems: "center", justifyContent: "center", borderRadius: 9999 },
  // Selected wins: filled `primary` circle. Today (when not selected): no fill
  // (the day label carries the brand indigo instead).
  dayCellState: (t, st) => (st.selected ? { backgroundColor: t.primary } : {}),
  // Selected -> `primary-foreground`; today (unselected) -> `primary` colored
  // text, semibold; otherwise plain foreground.
  dayLabel: (t, st) => {
    if (st.selected) return { fontWeight: "600", color: t["primary-foreground"] };
    if (st.today) return { fontWeight: "600", color: t.primary };
    return { color: t.foreground };
  },
};

// =============================================================================
// Android (M3 date picker): the SELECTED day is a filled `primary` circle;
// TODAY is an OUTLINED ring (1px `primary`) on transparent; weekday headers are
// single-letter; day cells get a circular `android_ripple`; larger touch targets.
// =============================================================================

export const androidSkin: CalendarSkin = {
  // M3 calendar cells are ~40dp/48dp targets; bump the grid accordingly.
  metrics: {
    compact: {
      cell: { width: 36, height: 36 },
      gridWidth: 252,
      head: { width: 36, height: 28 },
      label: { fontSize: 12, lineHeight: 16 },
    },
    default: {
      cell: { width: 40, height: 40 },
      gridWidth: 280,
      head: { width: 40, height: 32 },
      label: { fontSize: 14, lineHeight: 20 },
    },
  },

  pressedOpacity: null, // Android uses a ripple instead
  // Circular ripple roughly matching the cell radius (default 40/2 = 20dp).
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false, radius: 20 }),

  containerBase: {
    alignSelf: "flex-start",
    borderRadius: 12, // M3 large corner
    borderWidth: 1,
    padding: 12,
  },
  containerSurface: (t) => ({ borderColor: t.border, backgroundColor: t.card }),

  header: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chevron: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: "transparent",
  },
  chevronText: (t) => ({ fontSize: 22, lineHeight: 24, color: t["muted-foreground"] }),
  // M3 labelLarge-ish month label.
  monthLabel: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),

  grid: { flexDirection: "row", flexWrap: "wrap" },
  headCell: { alignItems: "center", justifyContent: "center" },
  // M3 single-letter weekday headers, muted.
  weekdayLabel: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: t["muted-foreground"] }),
  weekdays: WEEKDAYS_ONE,

  dayCellBase: { alignItems: "center", justifyContent: "center", borderRadius: 9999 },
  // Selected -> filled `primary` circle. Today (unselected) -> a 1px `primary`
  // ring on a transparent fill.
  dayCellState: (t, st) => {
    if (st.selected) return { backgroundColor: t.primary };
    if (st.today) return { borderWidth: 1, borderColor: t.primary, backgroundColor: "transparent" };
    return {};
  },
  // Selected -> `primary-foreground`; today (unselected) -> `primary` text;
  // otherwise plain foreground.
  dayLabel: (t, st) => {
    if (st.selected) return { fontWeight: "500", color: t["primary-foreground"] };
    if (st.today) return { fontWeight: "500", color: t.primary };
    return { color: t.foreground };
  },
};
