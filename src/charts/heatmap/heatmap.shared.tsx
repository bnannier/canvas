import { CHART_LOOK } from "../shared/charts.styles.js";
import { useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Platform, ScrollView } from "react-native";
import {
  View,
  Text,
  Pressable,
  useReducedMotion,
  supportsNativeDriver,
  alpha,
  devWarn,
  GlassPane,
  paneStyle,
  isGlass,
  innerFill,
  type ColorTokens,
  type LayoutStyle,
} from "../../style/index.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { surface, surfacePadDefault, webSkin } from "../shared/charts.styles.js";
import { CHART_ROOT } from "../shared/chart-frame.js";
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
import { AnatomyScope, useAnatomyPart, type AnatomyTarget } from "../../style/anatomy.js";

// Heatmap is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
//
// Density cells whose fill encodes each value (0–1), drawn as the v4 hand-off's heatmap
// (cv-kit-code4.js `O('heatmap')`): the chart frame (the card fill on a 1 px hairline at
// the chart corner under the small shadow, 16 inset, its rows 12 apart; `plain` strips
// it), an optional 500 13 title, 11 px cells on a 13 px pitch in seven-row columns that
// scroll sideways where they overflow, and a less-to-more legend. An empty cell is the
// secondary surface; a valued one washes chart-1 from .18 to .98. Two layouts share it:
//   • the default cell grid, and
//   • `calendar`, the same columns as days, with press/hover-to-inspect showing the
//     day's count and date.
// `detailed` is the docs' authored contribution calendar: unframed, with month and
// weekday labels and discrete levels.

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
  /** GitHub-style: the cells are days, each inspectable for its count and date. */
  calendar?: boolean;
  /** Unframed contribution calendar with the authored month, weekday and level styling. */
  detailed?: boolean;
  /** A summary line above the grid (e.g. "248 contributions in the last year"); shown in place of `label`. */
  caption?: string;
  /** Strip the card surface for nesting inside an existing card (mirrors Stats). */
  plain?: boolean;
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
// The hand-off's cell: 11 px squares 2 apart (a 13 px pitch) in seven-row columns.
const CAL_CELL = 11;
const CAL_GAP = 2;
const CAL_ROWS = 7;
// The continuous wash: chart-1 at .18 for the faintest value, climbing .8 to the full
// one, and the legend's five steps along it.
const HEAT_FLOOR = 0.18;
const HEAT_SPAN = 0.8;
const LEGEND_STEPS = [0.18, 0.4, 0.6, 0.8, 0.98];
// The frame's rows (title, cells, legend) stand 12 apart.
const FRAME_GAP = 12;
// The cells' box is the hand-off's SVG viewBox: a full 13 px pitch per column and row
// (the trailing gap included), at least 100 px wide.
const cellsBox = (cols: number) => ({ width: Math.max(100, cols * (CAL_CELL + CAL_GAP)), height: CAL_ROWS * (CAL_CELL + CAL_GAP) });

const clamp01 = (n: number) =>
  Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const normCell = (v: HeatmapValue): HeatmapCell =>
  typeof v === "number" ? { value: v } : v;

type MaterialTheme = ReturnType<typeof useMaterialTheme>;

/** A cell's fill: the secondary surface when empty, else the chart-1 wash for its value. */
function heatFill(theme: MaterialTheme, value: number): string {
  const t = clamp01(value);
  return t > 0 ? alpha(theme.tokens["chart-1"], HEAT_FLOOR + HEAT_SPAN * t) : innerFill(theme, "secondary");
}

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

// The chart frame around the cells: a CONTENT-layer pane under glass, nothing extra in
// solid mode, and no surface at all when `plain`.
function HeatmapFrame({
  theme,
  plain,
  testID,
  style,
  a11y,
  children,
}: {
  theme: MaterialTheme;
  plain?: boolean;
  testID?: string;
  style?: LayoutStyle;
  a11y?: object;
  children: ReactNode;
}) {
  const shape = surface(theme.tokens, webSkin.surfaceRadius);
  return (
    <View testID={testID} style={[plain ? null : paneStyle(theme, [shape, surfacePadDefault]), { gap: FRAME_GAP }, CHART_ROOT, style]} {...a11y}>
      {isGlass(theme) && !plain ? <GlassPane layer="content" shape={shape} /> : null}
      {children}
    </View>
  );
}

// The title line: 500 13 in the card ink.
function HeatmapTitle({ tokens, part, children }: { tokens: ColorTokens; part?: AnatomyTarget; children: string }) {
  return (
    <Text ref={part?.ref} onLayout={part?.onLayout} style={{ fontSize: 13, lineHeight: 16, fontWeight: "500", color: tokens["card-foreground"] }}>
      {children}
    </Text>
  );
}

// The less-to-more legend: Less, the five wash steps at the cell's size and corner, More,
// 4 apart at the trailing edge in the 400 11 subtle ink.
function HeatmapLegend({ tokens, part }: { tokens: ColorTokens; part?: AnatomyTarget }) {
  return (
    <View ref={part?.ref} onLayout={part?.onLayout} style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
      <Text style={legendText(tokens)}>Less</Text>
      {LEGEND_STEPS.map((step) => (
        <View key={step} style={{ width: CAL_CELL, height: CAL_CELL, borderRadius: platformShape.web.heatCell, backgroundColor: alpha(tokens["chart-1"], step) }} />
      ))}
      <Text style={legendText(tokens)}>More</Text>
    </View>
  );
}

// The default cell grid: one washed square per value in seven-row columns, which scroll
// sideways (the calendar's scrollport, a keyboard stop only while they overflow).
function GridHeatmap({
  cells,
  label,
  caption,
  hideLegend,
  plain,
  testID,
  style,
}: HeatmapProps & { cells: HeatmapCell[] }) {
  // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
  // hand-off's order: Grid, Cell (the first), Title, Legend.
  const gridPart = useAnatomyPart("Grid");
  const cellPart = useAnatomyPart("Cell");
  const titlePart = useAnatomyPart("Title");
  const legendPart = useAnatomyPart("Legend");
  const theme = useMaterialTheme({ static: true });
  const { tokens } = theme;
  const scrollport = useHorizontalScrollFocus();
  const focusRing = useFocusRingStyle();
  const title = caption ?? label;
  const cols = Math.ceil(cells.length / CAL_ROWS);
  // Name the grid with its size so assistive tech hears the scope of the data.
  const name = `${label ?? "Heatmap"}, ${cells.length} cells`;
  // Same img-placement rule as StackedBar: while a title or the legend renders, the
  // image role sits on the cells only so that text stays reachable.
  const img = {
    accessibilityRole: "image",
    accessibilityLabel: name,
    "aria-label": name,
  } as const;
  const imgOnRoot = hideLegend && !title;
  return (
    <AnatomyScope>
    <HeatmapFrame theme={theme} plain={plain} testID={testID} style={style} a11y={imgOnRoot ? img : undefined}>
      {title ? <HeatmapTitle tokens={tokens} part={titlePart}>{title}</HeatmapTitle> : null}
      <ScrollView {...scrollport} horizontal showsHorizontalScrollIndicator={false} style={focusRing}>
        <View
          ref={gridPart?.ref}
          onLayout={gridPart?.onLayout}
          {...(imgOnRoot ? {} : img)}
          style={{ flexDirection: "row", gap: CAL_GAP, ...cellsBox(cols) }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <View key={c} style={{ gap: CAL_GAP }}>
              {cells.slice(c * CAL_ROWS, c * CAL_ROWS + CAL_ROWS).map((cell, r) => (
                <View
                  key={r}
                  ref={c + r === 0 ? cellPart?.ref : undefined}
                  onLayout={c + r === 0 ? cellPart?.onLayout : undefined}
                  style={{ width: CAL_CELL, height: CAL_CELL, borderRadius: platformShape.web.heatCell, backgroundColor: heatFill(theme, cell.value) }}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {hideLegend ? null : <HeatmapLegend tokens={tokens} part={legendPart} />}
    </HeatmapFrame>
    </AnatomyScope>
  );
}

// The detailed calendar is the docs' authored art, laid in its own showcase card, so it
// takes no frame of its own; every other calendar takes the chart frame.
function CalendarFrame({ detailed, ...frame }: { detailed: boolean } & Parameters<typeof HeatmapFrame>[0]) {
  return detailed ? <View testID={frame.testID} style={frame.style}>{frame.children}</View> : <HeatmapFrame {...frame} />;
}

// The detailed calendar's discrete less-to-more legend: the empty box plus the four
// climbing levels, matching the cells' bucketing.
function HeatmapLevelLegend({
  tokens,
  calendar = false,
  part,
}: {
  tokens: ColorTokens;
  calendar?: boolean;
  part?: AnatomyTarget;
}) {
  return (
    <View
      ref={part?.ref}
      onLayout={part?.onLayout}
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
// The detailed calendar's axis labels (the month row, the weekday gutter) and the
// inspection flag's second line.
const CAL_MONTH_TYPE = { fontFamily: MONO_FONT, fontSize: CHART_LOOK.authoredAxisSize, lineHeight: 12 };
const CAL_WEEKDAY_TYPE = { fontFamily: MONO_FONT, fontSize: CHART_LOOK.authoredAxisSize, lineHeight: 12 };
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
  plain,
  testID,
  style,
}: HeatmapProps & { cells: HeatmapCell[] }) {
  // The calendar's anatomy parts, as the grid's.
  const gridPart = useAnatomyPart("Grid");
  const cellPart = useAnatomyPart("Cell");
  const titlePart = useAnatomyPart("Title");
  const legendPart = useAnatomyPart("Legend");
  const theme = useMaterialTheme({ static: true });
  const { tokens } = theme;
  const [pinned, setPinned] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? pinned;
  const scrollport = useHorizontalScrollFocus();
  const focusRing = useFocusRingStyle();

  const cols = Math.ceil(cells.length / CAL_ROWS);
  // The detailed calendar's authored 12 px cells 3 apart beside a weekday gutter; the
  // hand-off's 11 px cells 2 apart with no axes otherwise.
  const gutter = detailed ? 22.25 : 0;
  const size = detailed ? 12 : CAL_CELL;
  const gap = detailed ? 3 : CAL_GAP;
  const pitch = size + gap;
  const gridW = cols * pitch - gap;
  const hasDates = cells.some((c) => c.date);
  // The frame's title: the caption, else the label (the detailed calendar shows only a caption).
  const title = detailed ? caption : caption ?? label;

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
    <AnatomyScope>
    <CalendarFrame detailed={detailed} theme={theme} plain={plain} testID={testID} style={style}>
      {title && detailed ? (
        <Text
          ref={titlePart?.ref}
          onLayout={titlePart?.onLayout}
          style={{
            marginBottom: 10,
            fontSize: 13,
            lineHeight: 18,
            fontWeight: "500",
            color: tokens["card-foreground"],
          }}
        >
          {title}
        </Text>
      ) : title ? (
        <HeatmapTitle tokens={tokens} part={titlePart}>{title}</HeatmapTitle>
      ) : null}
      <ScrollView
        {...scrollport}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[focusRing, detailed ? { paddingBottom: 4 } : null]}
      >
        <View {...img}>
          {detailed && hasDates ? (
            // Month labels are absolutely placed at their column so each abbreviation
            // renders in full, overflowing its narrow slot to the right (GitHub style),
            // rather than being clipped to one cell's width.
            <View
              style={{
                height: 17,
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
            {/* The detailed weekday gutter: Mon / Wed / Fri, aligned to the cell rows. */}
            {detailed ? <View style={{ width: gutter, gap: gap, paddingRight: 6 }}>
              {HEATMAP_WEEKDAYS.map((wd, r) => (
                <View
                  key={r}
                  style={{ height: size, justifyContent: "center" }}
                >
                  {wd ? (
                    <Text
                      numberOfLines={1}
                      style={{
                        ...CAL_WEEKDAY_TYPE,
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
            </View> : null}
            <View>
              <View ref={gridPart?.ref} onLayout={gridPart?.onLayout} style={{ flexDirection: "row", gap: gap, ...(detailed ? null : cellsBox(cols)) }}>
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
                        cell.count != null
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
                          part={idx === 0 ? cellPart : undefined}
                          size={size}
                          fill={detailed ? levelFill(tokens, lvl, hasDates) : heatFill(theme, cell.value)}
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
      {hideLegend ? null : detailed ? (
        <HeatmapLevelLegend tokens={tokens} calendar={hasDates} part={legendPart} />
      ) : (
        <HeatmapLegend tokens={tokens} part={legendPart} />
      )}
    </CalendarFrame>
    </AnatomyScope>
  );
}

function HeatCell({
  part,
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
  /** The first day's anatomy handlers (the Cell part). */
  part?: AnatomyTarget;
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
  if (!detailed) return <Pressable ref={part?.ref} onLayout={part?.onLayout} accessible={false} {...Platform.select({ web: { focusable: false, tabIndex: -1 }, default: { focusable: true, tabIndex: 0 } })} onPress={onPress} onHoverIn={onHoverIn} onHoverOut={onHoverOut} style={{ width: size, height: size, borderRadius: platformShape.web.heatCell, backgroundColor: fill, borderWidth: 1, borderColor: active ? edge : "transparent" }} />;
  return (
    <Pressable
      ref={part?.ref}
      onLayout={part?.onLayout}
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
