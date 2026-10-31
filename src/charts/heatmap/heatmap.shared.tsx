import { CHART_LOOK } from "../shared/charts.styles.js";
import { useRef, useState } from "react";
import { Animated, Easing, Platform, ScrollView } from "react-native";
import {
  View,
  Text,
  Pressable,
  useTheme,
  useReducedMotion,
  supportsNativeDriver,
  alpha,
  devWarn,
  type ColorTokens,
  type LayoutStyle,
} from "../../style/index.js";
import {
  announceSelection,
  ChartInspectionSurface,
  flagInk,
} from "../shared/chart-inspect.js";
import { estimateTextWidth } from "../shared/chart-math.js";
import { useHorizontalScrollFocus } from "../../style/use-scroll-focus.js";
import { useFocusRingStyle } from "../../style/pressable.js";
import { platformShape } from "../../style/platform-shape.js";
import { oklchHex, oklchOf } from "../../style/color.js";
import { MONO_FONT } from "../../style/mono.js";

// Heatmap is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
//
// Density cells whose fill encodes each value (0–1). Two layouts share the same
// data and legend:
//   • the default wrapping grid (a wash of the primary hue per cell), and
//   • `calendar` — a GitHub-contribution-graph: week columns of seven day cells,
//     weekday + month labels, discrete less-to-more levels, and press/hover-to-
//     inspect showing the day's count and date.

/** One heatmap cell. A bare number is shorthand for `{ value }`. */
export interface HeatmapCell {
  /** Intensity 0–1; drives the cell's fill (bucketed into levels in calendar mode). */
  value: number;
  /** The exact tally shown in the inspect tooltip (e.g. GitHub's contribution count). */
  count?: number;
  /** ISO date (`YYYY-MM-DD`); shown in the tooltip and drives the calendar's month labels. */
  date?: string;
  /** Overrides the tooltip's derived "N contributions" heading. */
  label?: string;
}

export type HeatmapValue = number | HeatmapCell;

export interface HeatmapProps {
  /** The cells: intensities 0–1, or `{ value, count?, date?, label? }` for inspectable data. */
  values: HeatmapValue[];
  /** What the grid measures (e.g. "Contribution activity"); leads the accessible name. */
  label?: string;
  /** GitHub-style: lay the cells into seven-row week columns with weekday + month labels. */
  calendar?: boolean;
  /** Fixed-size contribution calendar with the authored month, weekday and level styling. */
  detailed?: boolean;
  /** A summary line above the grid (e.g. "248 contributions in the last year"). */
  caption?: string;
  /** Hide the less-to-more legend row. */
  hideLegend?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: LayoutStyle;
}

const HEATMAP_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
// GitHub labels alternating rows so the seven-day column reads without crowding.
const HEATMAP_WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", ""];
// Level 0 is the empty (no-activity) box; 1–4 climb the primary hue.
// The v4 hand-off's ramp (`K.def('heatmap')`): chart-1 washed from .1 (no activity) to
// .95, the steps its less-to-more legend draws.
const HEATMAP_LEVEL_ALPHA = [0.1, 0.3, 0.55, 0.8, 0.95];
// The grid's continuous wash: .08 at zero, climbing .85 to the full value.
const GRID_FLOOR = 0.08;
const GRID_SPAN = 0.85;

const clamp01 = (n: number) =>
  Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const normCell = (v: HeatmapValue): HeatmapCell =>
  typeof v === "number" ? { value: v } : v;

/** Bucket a 0–1 intensity into the five discrete GitHub-style levels. */
function heatLevel(value: number): number {
  const t = clamp01(value);
  if (t <= 0) return 0;
  if (t < 0.25) return 1;
  if (t < 0.5) return 2;
  if (t < 0.75) return 3;
  return 4;
}

/** The fill for a level: a chart-1 wash, faint for empty (0), climbing to .95. */
function levelFill(tokens: ColorTokens, lvl: number, calendar = false): string {
  if (!calendar)
    return alpha(
      tokens["chart-1"],
      HEATMAP_LEVEL_ALPHA[Math.max(0, Math.min(4, lvl))]
    );
  const base = tokens.muted;
  const ratios = [0, 0.28, 0.5, 0.75, 1];
  const t = ratios[Math.max(0, Math.min(4, lvl))];
  const a = oklchOf(base),
    b = oklchOf(tokens.primary);
  if (!a || !b) return lvl === 0 ? base : tokens.primary;
  const hue = ((b[2] - a[2] + 540) % 360) - 180;
  return oklchHex(
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + hue * t
  );
}

// The legend's Less / More: 11 px in the subtle ink.
function legendText(tokens: ColorTokens) {
  return {
    fontSize: CHART_LOOK.legendCaptionSize,
    lineHeight: 14,
    color: tokens["subtle-foreground"] ?? tokens["muted-foreground"],
  };
}

interface ParsedDate {
  y: number;
  mo: number;
  day: number;
}
function parseISO(d?: string): ParsedDate | null {
  if (!d) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  return m ? { y: +m[1], mo: +m[2] - 1, day: +m[3] } : null;
}
const fmtDate = (d: ParsedDate) => `${HEATMAP_MONTHS[d.mo]} ${d.day}, ${d.y}`;

/** The tooltip heading for a cell: an explicit label, a count, or a percent. */
function cellHeading(cell: HeatmapCell): string {
  if (cell.label != null) return cell.label;
  if (cell.count != null)
    return `${cell.count} ${
      cell.count === 1 ? "contribution" : "contributions"
    }`;
  return `${Math.round(clamp01(cell.value) * 100)}%`;
}

/** Cells whose fill encodes each value, or a calendar of daily contributions. */
export function Heatmap(props: HeatmapProps) {
  // No values means no cells: warn so an empty grid is not mistaken for one that
  // failed to style. Both layouts share this guard.
  devWarn(
    props.values.length === 0,
    "[canvas] <Heatmap />: `values` is empty; the grid renders with no cells."
  );
  const cells = props.values.map(normCell);
  return props.calendar ? (
    <CalendarHeatmap {...props} cells={cells} />
  ) : (
    <GridHeatmap {...props} cells={cells} />
  );
}

// The default wrapping grid: one alpha-washed square per value, with the shared
// less-to-more legend. Unchanged behavior from the original Heatmap.
function GridHeatmap({
  cells,
  label,
  hideLegend,
  testID,
  style,
}: HeatmapProps & { cells: HeatmapCell[] }) {
  const { tokens } = useTheme();
  const cell = (intensity: number, box: number, key: number) => (
    <View
      key={key}
      style={{
        borderRadius: platformShape.web.heatCell,
        height: box,
        width: box,
        backgroundColor: alpha(
          tokens["chart-1"],
          GRID_FLOOR + GRID_SPAN * clamp01(intensity)
        ),
      }}
    />
  );
  // Name the grid with its size so assistive tech hears the scope of the data.
  const name = `${label ?? "Heatmap"}, ${cells.length} cells`;
  // Same img-placement rule as StackedBar: while the less-to-more legend renders,
  // the image role sits on the cell grid only so the legend text stays reachable.
  const img = {
    accessibilityRole: "image",
    accessibilityLabel: name,
    "aria-label": name,
  } as const;
  return (
    <View testID={testID} style={style} {...(hideLegend ? img : {})}>
      <View
        {...(hideLegend ? {} : img)}
        style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}
      >
        {cells.map((c, i) => cell(c.value, 18, i))}
      </View>
      {hideLegend ? null : (
        <View
          style={{
            marginTop: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 4,
          }}
        >
          <Text style={legendText(tokens)}>Less</Text>
          {[0.02, 0.26, 0.55, 0.85, 1].map((v, i) =>
            cell(v, CAL_CELL, 100 + i)
          )}
          <Text style={legendText(tokens)}>More</Text>
        </View>
      )}
    </View>
  );
}

// The discrete less-to-more legend for calendar mode: the empty box plus the
// four climbing levels, matching the cells' bucketing.
function HeatmapLevelLegend({
  tokens,
  calendar = false,
}: {
  tokens: ColorTokens;
  calendar?: boolean;
}) {
  return (
    <View
      style={{
        marginTop: calendar ? 14 : 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
      }}
    >
      <Text
        style={
          calendar
            ? { ...legendText(tokens), fontFamily: MONO_FONT, fontSize: CHART_LOOK.axisSize, lineHeight: 13 }
            : legendText(tokens)
        }
      >
        {calendar ? "less" : "Less"}
      </Text>
      {[0, 1, 2, 3, 4].map((lvl) => (
        <View
          key={lvl}
          style={{
            width: calendar ? 12 : CAL_CELL,
            height: calendar ? 12 : CAL_CELL,
            borderRadius: platformShape.web.heatCell,
            backgroundColor: levelFill(tokens, lvl, calendar),
            marginLeft: calendar && lvl === 0 ? 4 : 0,
            marginRight: calendar && lvl === 4 ? 4 : 0,
          }}
        />
      ))}
      <Text
        style={
          calendar
            ? { ...legendText(tokens), fontFamily: MONO_FONT, fontSize: CHART_LOOK.axisSize, lineHeight: 13 }
            : legendText(tokens)
        }
      >
        {calendar ? "more" : "More"}
      </Text>
    </View>
  );
}

// The GitHub contribution graph: week columns of seven day cells, weekday + month
// labels, and press/hover-to-inspect. The grid scrolls horizontally so a full
// year stays legible on a phone; on Android the scroller takes a drag only while
// the grid overflows it (a fitting one would claim a sideways drag it cannot
// scroll, dropping a cell's press and the page's scroll), and always elsewhere,
// where a disabled scroller sets `touch-action: none` on the web. Cells are
// pointer-only (accessible={false}, and tabIndex={-1} because react-native-web's
// Pressable stays a tab stop whatever `focusable` says); the grid's image role +
// summarizing name carry the data for assistive tech, so a year of days is not 365
// tab stops. The keyboard's one stop is the scroller itself, while the grid overflows
// it: Tab lands on it, the arrow keys pan it, and Chromium names it from the one
// image inside, so it announces the same summary (e2e/behavior/scroll-focus.e2e.ts
// reads that name). It takes no role or name of its own, which would only repeat the
// image's (and a region would add a landmark).
const CAL_CELL = 11;
const CAL_GAP = 2;
const CAL_ROWS = 7;
const CAL_GUTTER = 32; // weekday-label column, wide enough for "Wed" at 10px
const CAL_MONTH_H = 15; // month-label row
// The calendar's axis labels (the month row, the weekday gutter) and the inspection
// flag's second line.
const CAL_MONTH_TYPE = { fontFamily: MONO_FONT, fontSize: CHART_LOOK.axisSize, lineHeight: CAL_MONTH_H };
const CAL_WEEKDAY_TYPE = { fontFamily: MONO_FONT, fontSize: CHART_LOOK.axisSize, lineHeight: 11 };
const FLAG_DETAIL_TYPE = { fontSize: CHART_LOOK.legendCaptionSize, lineHeight: 15 };
// The detail line on the inverse pill reads a step back, as the hand-off's pinned readouts set
// their secondary line (the candlestick card's volume at .6).
const FLAG_DETAIL_OPACITY = 0.7;

function CalendarHeatmap({
  cells,
  label,
  caption,
  detailed = false,
  hideLegend,
  testID,
  style,
}: HeatmapProps & { cells: HeatmapCell[] }) {
  const { tokens } = useTheme();
  const [pinned, setPinned] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? pinned;
  const scrollport = useHorizontalScrollFocus();
  const focusRing = useFocusRingStyle();

  const cols = Math.ceil(cells.length / CAL_ROWS);
  const [frameW, setFrameW] = useState(0);
  const gutter = detailed ? 22.25 : CAL_GUTTER;
  const baseSize = detailed ? 12 : CAL_CELL;
  const baseGap = detailed ? 3 : CAL_GAP;
  const natural = cols * (baseSize + baseGap) - baseGap;
  const k = !detailed && frameW > gutter + natural ? (frameW - gutter) / natural : 1;
  const size = baseSize * k;
  const gap = baseGap * k;
  const pitch = size + gap;
  const gridW = cols * pitch - gap;
  const hasDates = cells.some((c) => c.date);

  // Place a month abbreviation at each column where the (topmost dated) month changes.
  const monthLabels: (string | null)[] = [];
  let prevMonth = -1;
  for (let c = 0; c < cols; c++) {
    let mo = -1;
    for (let r = 0; r < CAL_ROWS; r++) {
      const p = parseISO(cells[c * CAL_ROWS + r]?.date);
      if (p) {
        mo = p.mo;
        break;
      }
    }
    if (
      mo >= 0 &&
      (detailed ? cells[c * CAL_ROWS]?.date && (parseISO(cells[c * CAL_ROWS].date)?.day ?? 32) <= 7 : mo !== prevMonth)
    ) {
      monthLabels.push(HEATMAP_MONTHS[mo]);
      prevMonth = mo;
    } else monthLabels.push(null);
  }

  // The inspect flag for the active cell, pinned above (or below, near the top).
  const activeCell = active != null ? cells[active] : null;
  const activeDate = activeCell ? parseISO(activeCell.date) : null;
  const flagTitle = activeCell ? cellHeading(activeCell) : "";
  const flagSub = activeDate ? fmtDate(activeDate) : undefined;
  const flagW =
    Math.ceil(
      Math.max(
        estimateTextWidth(flagTitle, 12),
        flagSub ? estimateTextWidth(flagSub, 11) : 0
      )
    ) + 20;
  const flagH = flagSub ? 44 : 26;
  const aCol = active != null ? Math.floor(active / CAL_ROWS) : 0;
  const aRow = active != null ? active % CAL_ROWS : 0;
  const cellX = aCol * pitch;
  const cellY = aRow * pitch;
  const flagAbove = aRow >= 3;
  const flagTop = flagAbove ? cellY - flagH - 4 : cellY + size + 4;
  const flagLeft = Math.max(
    0,
    Math.min(gridW - flagW, cellX + size / 2 - flagW / 2)
  );

  // The image role + name summarize the whole grid (a screen reader hears the
  // scope, not 365 individual cells).
  const total = cells.reduce((n, c) => n + (c.count ?? 0), 0);
  const name = `${label ?? "Activity heatmap"}, ${cells.length} days${
    total > 0 ? `, ${total} total` : ""
  }`;
  const img = {
    accessibilityRole: "image",
    accessibilityLabel: name,
    "aria-label": name,
  } as const;

  const inspect = (i: number, toggle: boolean) => {
    if (toggle) setPinned((previous) => previous === i ? null : i);
    else setHovered(i);
    const c = cells[i];
    const p = parseISO(c.date);
    announceSelection(`${cellHeading(c)}${p ? ` on ${fmtDate(p)}` : ""}`);
  };

  return (
    <View testID={testID} style={style} onLayout={(e) => setFrameW(e.nativeEvent.layout.width)}>
      {caption ? (
        <Text
          style={{
            marginBottom: 10,
            fontSize: 13,
            lineHeight: 18,
            fontWeight: "500",
            color: tokens["card-foreground"],
          }}
        >
          {caption}
        </Text>
      ) : null}
      <ScrollView
        {...scrollport}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[focusRing, detailed ? { paddingBottom: 4 } : null]}
      >
        <View {...img}>
          {hasDates ? (
            // Month labels are absolutely placed at their column so each abbreviation
            // renders in full, overflowing its narrow slot to the right (GitHub style),
            // rather than being clipped to one cell's width.
            <View
              style={{
                height: detailed ? 17 : CAL_MONTH_H,
                marginLeft: gutter,
                width: gridW,
              }}
            >
              {monthLabels.map((m, c) =>
                m ? (
                  <Text
                    key={c}
                    numberOfLines={1}
                    style={{
                      position: "absolute",
                      left: c * pitch,
                      top: 0,
                      ...CAL_MONTH_TYPE,
                      ...(detailed ? { fontSize: CHART_LOOK.authoredAxisSize, lineHeight: 12 } : {}),
                      color:
                        tokens["subtle-foreground"] ??
                        tokens["muted-foreground"],
                    }}
                  >
                    {m}
                  </Text>
                ) : null
              )}
            </View>
          ) : null}
          <View style={{ flexDirection: "row" }}>
            {/* Weekday gutter: Mon / Wed / Fri, aligned to the cell rows. */}
            <View style={{ width: gutter, gap: gap, paddingRight: detailed ? 6 : 4 }}>
              {(detailed ? HEATMAP_WEEKDAYS : ["", "Mon", "", "Wed", "", "Fri", ""]).map((wd, r) => (
                <View
                  key={r}
                  style={{ height: size, justifyContent: "center" }}
                >
                  {wd ? (
                    <Text
                      numberOfLines={1}
                      style={{
                        ...CAL_WEEKDAY_TYPE,
                        ...(detailed ? { fontSize: CHART_LOOK.authoredAxisSize, lineHeight: 12 } : {}),
                        textAlign: "right",
                        color:
                          tokens["subtle-foreground"] ??
                          tokens["muted-foreground"],
                      }}
                    >
                      {wd}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
            <View>
              <View style={{ flexDirection: "row", gap: gap }}>
                {Array.from({ length: cols }).map((_, c) => (
                  <View key={c} style={{ gap: gap }}>
                    {Array.from({ length: CAL_ROWS }).map((_, r) => {
                      const idx = c * CAL_ROWS + r;
                      const cell = cells[idx];
                      if (!cell)
                        return (
                          <View key={r} style={{ width: size, height: size }} />
                        );
                      const lvl =
                        detailed && cell.count != null
                          ? cell.count === 0
                            ? 0
                            : cell.count < 3
                            ? 1
                            : cell.count < 6
                            ? 2
                            : cell.count < 9
                            ? 3
                            : 4
                          : heatLevel(cell.value);
                      const isActive = active === idx;
                      return (
                        <HeatCell
                          key={r}
                          size={size}
                          fill={levelFill(tokens, lvl, detailed && hasDates)}
                          detailed={detailed}
                          edge={tokens.foreground}
                          active={isActive}
                          ring={`0 0 0 2px ${tokens.card}, 0 0 0 3.5px ${tokens.primary}`}
                          label={`${cellHeading(cell)}${
                            cell.date ? ` · ${cell.date}` : ""
                          }`}
                          onPress={() => inspect(idx, true)}
                          onHoverIn={() => inspect(idx, false)}
                          onHoverOut={() => setHovered((previous) => previous === idx ? null : previous)}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
              {activeCell ? (
                <ChartInspectionSurface
                  style={{
                    position: "absolute",
                    top: flagTop,
                    left: flagLeft,
                    width: flagW,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    gap: 1,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      lineHeight: 16,
                      fontWeight: "600",
                      color: flagInk(tokens),
                    }}
                  >
                    {flagTitle}
                  </Text>
                  {flagSub ? (
                    <Text
                      numberOfLines={1}
                      style={{
                        ...FLAG_DETAIL_TYPE,
                        color: flagInk(tokens),
                        opacity: FLAG_DETAIL_OPACITY,
                      }}
                    >
                      {flagSub}
                    </Text>
                  ) : null}
                </ChartInspectionSurface>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
      {hideLegend ? null : (
        <HeatmapLevelLegend tokens={tokens} calendar={detailed && hasDates} />
      )}
    </View>
  );
}

function HeatCell({
  size,
  fill,
  active,
  detailed,
  edge,
  ring,
  label,
  onPress,
  onHoverIn,
  onHoverOut,
}: {
  size: number;
  fill: string;
  active: boolean;
  detailed: boolean;
  edge: string;
  ring: string;
  label: string;
  onPress: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const animate = (value: number) => {
    scale.stopAnimation();
    if (reduced || !detailed) {
      scale.setValue(1);
      return;
    }
    Animated.timing(scale, {
      toValue: value,
      duration: 300,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      useNativeDriver: supportsNativeDriver,
    }).start();
  };
  if (!detailed) return <Pressable accessible={false} {...Platform.select({ web: { focusable: false, tabIndex: -1 }, default: { focusable: true, tabIndex: 0 } })} onPress={onPress} onHoverIn={onHoverIn} onHoverOut={onHoverOut} style={{ width: size, height: size, borderRadius: platformShape.web.heatCell, backgroundColor: fill, borderWidth: 1, borderColor: active ? edge : "transparent" }} />;
  return (
    <Pressable
      accessible={false}
      {...Platform.select({ web: { focusable: false, tabIndex: -1 }, default: { focusable: true, tabIndex: 0 } })}
      onPress={onPress}
      onHoverIn={() => {
        animate(1.35);
        onHoverIn();
      }}
      onHoverOut={() => {
        animate(1);
        onHoverOut();
      }}
      style={{ width: size, height: size, zIndex: active ? 1 : 0 }}
      {...({ title: label } as object)}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: detailed ? platformShape.web.activityCell : platformShape.web.heatCell,
          backgroundColor: fill,
          borderWidth: detailed ? 0 : 1,
          borderColor: "transparent",
          ...(detailed && active ? { boxShadow: ring } : {}),
          transform: [{ scale }],
        }}
      />
    </Pressable>
  );
}
