import { primaryText } from "../../style/primary-text.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha, shadow, shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { MONO_FONT } from "../../style/mono.js";

const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];

// Co-located Calendar skins, one per platform, drawn in the Canvas v4 hand-off's colours
// (`K.def('calendar')` in tools/v4/handoff/cv-kit-data.js and its code-driven form,
// cv-kit-code3.js `O('calendar')`). The shell resolves the density metrics, the
// leading-blank padding and the per-day selected/today/range state; the skin supplies the
// shape, sizing, type, fills and press feedback. The selected day fills with the
// `primary` token on every platform. The calendar frame uses static content frost in glass
// mode, its opaque `card` fill the solid fallback.
//
//   Web: the hand-off's date card: the card corner, a hairline, 14 in; the 600 15 month
//     label at the start and two 15px chevrons in the muted ink at the end, 10 above the
//     11px mono weekday row in the subtle ink; 38px days at the control corner, 13px, the
//     selected one the accent fill in 600, today the accent's text ink in a ring-alpha
//     hairline; a 4px accent event dot; the range the accent's soft wash. The timelines
//     take 34px hours under 10px mono labels and events at the event corner in the soft
//     wash on a ring-alpha hairline.
//   iOS and Android keep their date pickers' shapes (PLATFORM-REFERENCES.md: the iOS 27
//     date picker, the Material 3 date picker) in the hand-off's colours: round day cells,
//     the label at the start with its chevrons at the end, the iOS chevrons in the accent
//     and today in the accent's ink, the Material 3 today in a 1dp accent ring and a ripple
//     for press.

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

// Per-density sizes for the week/day timeline views. The containers are FILL and
// the day columns flex, so the same layout scales to any parent without a
// separate breakpoint.
export interface TimelineMetrics {
  /** One hour row, in px; event-block geometry multiplies against this. */
  hourHeight: number;
  /** The left hour-axis rail width. */
  axisWidth: number;
  /** The day-peek overlay card width. */
  peekWidth: number;
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
  /** The opaque surface fill and border, retained as the static content material's solid fallback. */
  containerSurface: (t: ColorTokens) => ViewStyle;

  // --- header (month label + prev/next chevrons) ---
  header: ViewStyle;
  /** The pair of chevrons, together at the header's end. */
  chevrons: ViewStyle;
  /** A ghost chevron button box. */
  chevron: ViewStyle;
  /** The chevron glyph's size in px. */
  chevronIcon: number;
  /** The chevron glyph's ink (its `color`). */
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

  // --- event mark (month grid + week strip) ---
  /** The event dot box: size + absolute seat near the cell's bottom edge. */
  eventDot: ViewStyle;
  /** The dot fill per day state (inverts to `primary-foreground` on the selected fill). */
  eventDotColor: (t: ColorTokens, state: DayState) => ViewStyle;

  // --- week/day timeline ---
  /** Per-density timeline sizes. */
  timeline: Record<Density, TimelineMetrics>;
  /** An hour label on the left axis rail. */
  hourLabel: (t: ColorTokens) => TextStyle;
  /** The hairline drawn across the top of each hour slot. */
  slotLine: (t: ColorTokens) => ViewStyle;
  /** The vertical hairline between week-view day columns. */
  colDivider: (t: ColorTokens) => ViewStyle;
  /** A timed event block: radius, padding, and the leading accent bar (layout-only). */
  eventBlock: ViewStyle;
  /** The event-block fill + accent color, tinted from `primary`. */
  eventBlockSurface: (t: ColorTokens) => ViewStyle;
  /** The event title line inside a block. */
  eventTitle: (t: ColorTokens) => TextStyle;
  /** The event time line inside a block. */
  eventTime: (t: ColorTokens) => TextStyle;

  // --- day-peek + hover overlays (anchored floating cards) ---
  /** The floating peek/hover card: shape, border, shadow, padding (an overlay
   *  surface, so it paints the `popover` token and frosts under glass via GlassSurface). */
  peekCard: (t: ColorTokens) => ViewStyle;
  /** The peek's day title / the hover card's event title line. */
  peekTitle: (t: ColorTokens) => TextStyle;
  /** The hover card's description body. */
  peekBody: (t: ColorTokens) => TextStyle;

  // --- range selection (month view) ---
  /** The tinted band behind range endpoints and the days between (the shell sets
   *  the left/right half per position; this carries the fill + vertical insets). */
  rangeBand: (t: ColorTokens) => ViewStyle;
}

// --- shared weekday strings ------------------------------------------------

const WEEKDAYS_THREE = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_ONE = ["S", "M", "T", "W", "T", "F", "S"];
// iOS reference uses UPPERCASE short weekday symbols (SUN/MON shortened to two
// letters here to stay distinct from Android's single-letter row); mixed-case
// "Su/Mo" is a web (shadcn) idiom, not the iOS date-picker reference.
const WEEKDAYS_TWO_UPPER = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// Every Pressable here (a day cell, a chevron, an event block) keeps the kit's themed
// keyboard focus ring: none paints a focus state of its own, and a keyboard user on
// the web (the docs preview of the iOS skin included) must see which one holds focus.
// Natively the ring draws nothing.

// =============================================================================
// Web: the date card. The selected day gets a round `primary` fill and today
// (unselected) a soft primary tint.
// =============================================================================

export const webSkin: CalendarSkin = {
  metrics: {
    compact: {
      cell: { width: 32, height: 32 },
      gridWidth: 224,
      head: { width: 32, height: 18 },
      label: { fontSize: 12, lineHeight: 16 },
    },
    default: {
      cell: { width: 38, height: 38 },
      gridWidth: 266,
      head: { width: 38, height: 18 },
      label: { fontSize: 13, lineHeight: 18 },
    },
  },

  pressedOpacity: 0.9,
  ripple: null,

  // The date card: the card corner, a hairline, a 14px inset.
  containerBase: {
    alignSelf: "flex-start",
    borderRadius: shape.web.card,
    borderWidth: 1,
    padding: 14,
  },
  containerSurface: (t) => ({ borderColor: t.border, backgroundColor: t.card }),

  // The month label at the start, the two chevrons together at the end, 10 above the grid.
  header: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chevrons: { flexDirection: "row", alignItems: "center", gap: 6 },
  // A bare 15px chevron on a 24px press tile at the control corner.
  chevron: {
    height: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: shape.web.control,
    backgroundColor: "transparent",
  },
  chevronIcon: 15,
  chevronText: (t) => ({ color: t["muted-foreground"] }),
  monthLabel: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "600", color: t.foreground }),

  grid: { flexDirection: "row", flexWrap: "wrap" },
  headCell: { alignItems: "center", justifyContent: "center" },
  weekdayLabel: (t) => ({ fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "400", color: subtle(t) }),
  weekdays: WEEKDAYS_THREE,

  // A rounded square at the control corner.
  dayCellBase: { alignItems: "center", justifyContent: "center", borderRadius: shape.web.control },
  // ONLY the selected day fills with the accent; today (unselected) takes a hairline ring
  // in the accent's ring alpha around its accent ink, so it never reads as a second selection.
  dayCellState: (t, st) => {
    if (st.selected) return { backgroundColor: t.primary };
    // A transparent fill: today's bed is the range band or the card under it.
    if (st.today) return { backgroundColor: "rgba(0, 0, 0, 0)", borderWidth: 1, borderColor: alpha(t.primary, 0.35) };
    return {};
  },
  // Selected -> 600 in `primary-foreground`; today (unselected) -> the accent's text ink.
  dayLabel: (t, st) => {
    if (st.selected) return { fontWeight: "600", color: t["primary-foreground"] };
    if (st.today) return { fontWeight: "400", color: primaryText(t) };
    return { fontWeight: "400", color: t.foreground };
  },

  // A 4px dot seated just above the cell's bottom edge marks a day with events.
  eventDot: { position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: 9999 },
  // On the selected fill the dot inverts to stay visible on `primary`.
  eventDotColor: (t, st) => (st.selected ? { backgroundColor: t["primary-foreground"] } : { backgroundColor: t.primary }),

  timeline: {
    compact: { hourHeight: 30, axisWidth: 40, peekWidth: 272 },
    default: { hourHeight: 34, axisWidth: 44, peekWidth: 300 },
  },
  hourLabel: (t) => ({ fontFamily: MONO_FONT, fontSize: 10, lineHeight: 14, color: subtle(t) }),
  slotLine: (t) => ({ borderTopWidth: 1, borderTopColor: t.border }),
  colDivider: (t) => ({ borderLeftWidth: 1, borderLeftColor: t.border }),
  // A timed event: the accent's soft wash at the event corner on a ring-alpha hairline.
  eventBlock: {
    borderRadius: platformShape.web.event,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    overflow: "hidden",
  },
  eventBlockSurface: (t) => ({ backgroundColor: t["primary-soft"], borderColor: alpha(t.primary, 0.35) }),
  eventTitle: (t) => ({ fontSize: 11, lineHeight: 14.3, fontWeight: "500", color: primaryText(t) }),
  eventTime: (t) => ({ fontFamily: MONO_FONT, fontSize: 10, lineHeight: 13, color: primaryText(t) }),

  // Mirrors the web Popover card (the menu corner, hairline border, md shadow)
  // with the tighter padding a timeline slice wants.
  peekCard: (t) => ({
    borderRadius: shape.web.menu,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.popover,
    padding: 12,
    ...shadow("md", t),
  }),
  peekTitle: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", color: t["popover-foreground"] }),
  peekBody: (t) => ({ fontSize: 12, lineHeight: 16, color: t["popover-foreground"] }),

  // The accent's soft wash across the range, the full height of the cells.
  rangeBand: (t) => ({ position: "absolute", top: 0, bottom: 0, backgroundColor: t["primary-soft"] }),
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
    borderRadius: shape.ios.card,
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
  chevrons: { flexDirection: "row", alignItems: "center", gap: 12 },
  chevron: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: shape.ios.control,
    backgroundColor: "transparent",
  },
  // HIG: the chevrons carry the brand `primary` (system-accent style).
  chevronIcon: 20,
  chevronText: (t) => ({ color: t.primary }),
  // HIG: a bold ~17pt month/year title.
  monthLabel: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "600", color: t.foreground }),

  grid: { flexDirection: "row", flexWrap: "wrap" },
  headCell: { alignItems: "center", justifyContent: "center" },
  // ~13pt muted SF-style weekday header.
  weekdayLabel: (t) => ({ fontSize: 13, lineHeight: 16, fontWeight: "600", color: subtle(t) }),
  // iOS reference: uppercase two-letter weekday symbols.
  weekdays: WEEKDAYS_TWO_UPPER,

  dayCellBase: { alignItems: "center", justifyContent: "center", borderRadius: 9999 },
  // Selected wins: filled `primary` circle. Today (when not selected): no fill
  // (the day label carries the brand `primary-text` instead).
  dayCellState: (t, st) => (st.selected ? { backgroundColor: t.primary } : {}),
  // Selected -> `primary-foreground`; today (unselected) -> `primary` colored
  // text, semibold; otherwise plain foreground.
  dayLabel: (t, st) => {
    if (st.selected) return { fontWeight: "600", color: t["primary-foreground"] };
    if (st.today) return { fontWeight: "600", color: primaryText(t) };
    return { color: t.foreground };
  },

  // HIG month grids mark event days with a small dot under the number (~5pt).
  eventDot: { position: "absolute", bottom: 3, width: 5, height: 5, borderRadius: 9999 },
  // Inverts on the selected `primary` fill; rides the brand `primary` otherwise
  // (including on today's unfilled cell, whose label is already `primary`).
  eventDotColor: (t, st) =>
    st.selected ? { backgroundColor: t["primary-foreground"] } : { backgroundColor: t.primary },

  // Slightly taller hour rows in the iOS calendar's airier spirit.
  timeline: {
    compact: { hourHeight: 44, axisWidth: 44, peekWidth: 288 },
    default: { hourHeight: 50, axisWidth: 48, peekWidth: 320 },
  },
  hourLabel: (t) => ({ fontSize: 11, lineHeight: 13, fontWeight: "500", color: subtle(t) }),
  slotLine: (t) => ({ borderTopWidth: 1, borderTopColor: t.border }),
  colDivider: (t) => ({ borderLeftWidth: 1, borderLeftColor: t.border }),
  // iOS event blocks: tinted rounded rectangle with a leading accent bar.
  eventBlock: {
    borderRadius: platformShape.ios.event,
    borderLeftWidth: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    overflow: "hidden",
  },
  eventBlockSurface: (t) => ({ backgroundColor: alpha(t.primary, 0.12), borderLeftColor: t.primary }),
  eventTitle: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "600", color: primaryText(t) }),
  eventTime: (t) => ({ fontSize: 11, lineHeight: 14, color: t["muted-foreground"] }),

  // The iOS Popover card (borderless, at the iOS menu corner, lg shadow), tightened
  // for a timeline slice.
  peekCard: (t) => ({
    borderRadius: shape.ios.menu,
    backgroundColor: t.popover,
    padding: 12,
    ...shadow("lg", t),
  }),
  peekTitle: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "600", color: t["popover-foreground"] }),
  peekBody: (t) => ({ fontSize: 13, lineHeight: 18, color: t["popover-foreground"] }),

  // A soft primary wash between the range endpoints (HIG range selection).
  rangeBand: (t) => ({ position: "absolute", top: 4, bottom: 4, backgroundColor: alpha(t.primary, 0.15) }),
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
    borderRadius: shape.android.card, // M3's 12 medium shape
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
  chevrons: { flexDirection: "row", alignItems: "center", gap: 0 },
  chevron: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: shape.android.control,
    backgroundColor: "transparent",
  },
  chevronIcon: 24,
  chevronText: (t) => ({ color: t["muted-foreground"] }),
  // M3 labelLarge-ish month label.
  monthLabel: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),

  grid: { flexDirection: "row", flexWrap: "wrap" },
  headCell: { alignItems: "center", justifyContent: "center" },
  // M3 single-letter weekday headers, muted.
  weekdayLabel: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: subtle(t) }),
  weekdays: WEEKDAYS_ONE,

  // overflow:"hidden" clips the Material ripple to the rounded outline (the bounded
  // android_ripple otherwise bleeds past the circle as a rectangle).
  dayCellBase: { alignItems: "center", justifyContent: "center", borderRadius: 9999, overflow: "hidden" },
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
    if (st.today) return { fontWeight: "500", color: primaryText(t) };
    return { color: t.foreground };
  },

  // M3 date pickers mark event days with a 4dp dot under the number.
  eventDot: { position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: 9999 },
  // Inverts on the selected `primary` fill; `primary` otherwise (incl. inside today's ring).
  eventDotColor: (t, st) =>
    st.selected ? { backgroundColor: t["primary-foreground"] } : { backgroundColor: t.primary },

  // M3 schedule rows lean taller for the 48dp-ish touch rhythm.
  timeline: {
    compact: { hourHeight: 44, axisWidth: 44, peekWidth: 272 },
    default: { hourHeight: 52, axisWidth: 48, peekWidth: 304 },
  },
  hourLabel: (t) => ({ fontSize: 11, lineHeight: 16, fontWeight: "500", color: subtle(t) }),
  slotLine: (t) => ({ borderTopWidth: 1, borderTopColor: t.border }),
  colDivider: (t) => ({ borderLeftWidth: 1, borderLeftColor: t.border }),
  // M3 event chips: larger radius, tonal `primary` container with an accent bar.
  eventBlock: {
    borderRadius: platformShape.android.event,
    borderLeftWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
  },
  eventBlockSurface: (t) => ({ backgroundColor: alpha(t.primary, 0.12), borderLeftColor: t.primary }),
  eventTitle: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: primaryText(t) }),
  eventTime: (t) => ({ fontSize: 11, lineHeight: 16, color: t["muted-foreground"] }),

  // The M3 menu-surface treatment (medium radius + md shadow), tightened for a
  // timeline slice.
  peekCard: (t) => ({
    borderRadius: shape.android.card,
    backgroundColor: t.popover,
    padding: 12,
    ...shadow("md", t),
  }),
  peekTitle: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t["popover-foreground"] }),
  peekBody: (t) => ({ fontSize: 12, lineHeight: 16, color: t["popover-foreground"] }),

  // M3 range selection: the tonal container band spans the full cell height.
  rangeBand: (t) => ({ position: "absolute", top: 0, bottom: 0, backgroundColor: alpha(t.primary, 0.15) }),
};
