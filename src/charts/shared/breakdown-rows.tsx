import {
  View,
  Text,
  Pressable,
  useTheme,
  surfaceRipple,
  pressDim,
  tabularNums,
  type ColorTokens,
} from "../../style/index.js";
import * as s from "./charts.styles.js";
import { type Tone } from "./charts.styles.js";
import { deltaTone } from "../../molecules/stats/stats.styles.js";
import { platformShape } from "../../style/platform-shape.js";
import { MONO_FONT } from "../../style/mono.js";
import { alpha } from "../../style/color.js";

// The proportional row engine shared by BarList and MetricBreakdown, in the v4 hand-off's
// two looks. The meter (MetricBreakdown's `K.def('metric-breakdown')` rows): a 12 px label
// and a mono value over a 6 px pill track holding the row's share, 4 px apart, rows 8
// apart. The bar list (`bars`, BarList's `K.def('bar-list')`): a 32 px row (26 compact),
// 10 px inset, its label (13 px) and mono value over a wash of the row's colour at .22
// whose width is the row's share, at the list-bar corner, rows 6 apart (4 compact). Both
// take an optional Stats-style delta after the value.
// Kit-internal: consumed by the two card charts, never exported from the
// package barrel (only the BreakdownRow data type ships, via the consumers).

export interface BreakdownRow {
  /** Stable identity, used as the React key when the rows can reorder. */
  id?: string | number;
  /** The category name. Truncates to one line. */
  label: string;
  /** The category's magnitude. Sizes the row's bar. */
  value: number;
  /** Preformatted change indicator (e.g. "+4.2%"). Omit to hide. */
  delta?: string;
  /** Color the delta red (a decline) instead of the default green (a rise). */
  down?: boolean;
  /** Render the delta muted, for a qualifier that is not a change claim
   *  ("last 30 days"). Takes precedence over `down`, matching Stats. */
  steady?: boolean;
  // Color slot from the categorical ramp (pick one; first match wins). Omit
  // for the ramp-by-index default, which matches the multi-series charts.
  chart1?: boolean;
  chart2?: boolean;
  chart3?: boolean;
  chart4?: boolean;
  chart5?: boolean;
  chart6?: boolean;
  chart7?: boolean;
  chart8?: boolean;
}

// Slot precedence, first match wins (the StatItem accent scan).
export function slotOf(row: BreakdownRow): string | null {
  if (row.chart1) return "chart-1";
  if (row.chart2) return "chart-2";
  if (row.chart3) return "chart-3";
  if (row.chart4) return "chart-4";
  if (row.chart5) return "chart-5";
  if (row.chart6) return "chart-6";
  if (row.chart7) return "chart-7";
  if (row.chart8) return "chart-8";
  return null;
}

/** True when any per-row color slot is set (the consumers' tone-conflict warn). */
export function hasSlot(row: BreakdownRow): boolean {
  return slotOf(row) != null;
}

/**
 * A row's fill: its own chart slot first, then the component-level tone, then
 * the categorical ramp by index (identity follows the row, never its rank).
 */
export function rowFill(
  tokens: ColorTokens,
  row: BreakdownRow,
  i: number,
  tone: Tone | null
): string {
  const slot = slotOf(row);
  if (slot) return tokens[slot as keyof ColorTokens] as string;
  if (tone) return s.barFill(tokens, tone);
  return s.seriesFill(tokens, i);
}

/**
 * The accessible name for one row: label, formatted value, the share percent
 * when the bar encodes one (the bar is the share's only visual carrier), and
 * the delta with its direction spelled out ("up"/"down"; a steady delta is a
 * qualifier, not a change claim, so it reads verbatim). Pure, exported for
 * tests.
 */
export function rowAccessibleLabel(
  row: BreakdownRow,
  sharePct: number | null,
  fmt: (v: number) => string
): string {
  let out = `${row.label}: ${fmt(Number.isFinite(row.value) ? row.value : 0)}`;
  if (sharePct != null) out += `, ${sharePct}% of total`;
  if (row.delta != null && row.delta !== "") {
    out += row.steady
      ? `, ${row.delta}`
      : `, ${row.down ? "down" : "up"} ${row.delta}`;
  }
  return out;
}

export interface BreakdownRowsProps {
  rows: BreakdownRow[];
  /** Size bars against the sum of rows (composition) instead of the largest row (ranking). */
  share: boolean;
  /** Append a muted percent readout after each value (BarList's share mode). */
  percent?: boolean;
  /** Component-level tone; null paints the ramp by index. A row's slot beats both. */
  tone: Tone | null;
  compact?: boolean;
  formatValue: (v: number) => string;
  /** Rows become buttons (drill into the category) when set. */
  onPressRow?: (index: number) => void;
  /** The bar-list look: the share as a wash behind the row instead of a meter under it. */
  bars?: boolean;
  /** Divided metric rows, with finer meters and a quieter label. */
  detailed?: boolean;
}

const METER_HEIGHT = 6;
const LIST_ROW = { default: 32, compact: 26 } as const;
const LIST_WASH = 0.22;

/** The shared renderer. Each row is one accessible item; the bar is decorative. */
// A row's share and its delta beside the value: value annotations.
const SHARE_TYPE = { fontSize: s.CHART_LOOK.legendCaptionSize, lineHeight: 16 };
// The delta: the section's bar list sets it in the mono face, 500 11 px on the face's 14 px
// normal line, right-aligned in a 38 px slot (wider only for a longer delta).
const DELTA_TYPE = {
  fontFamily: MONO_FONT,
  fontSize: s.CHART_LOOK.legendCaptionSize,
  lineHeight: 14,
  fontWeight: "500" as const,
};
const DELTA_SLOT = 38;
const MONO_ADVANCE = 0.6;

export function BreakdownRows({
  rows,
  share,
  percent,
  tone,
  compact,
  formatValue,
  onPressRow,
  bars,
  detailed,
}: BreakdownRowsProps) {
  const { tokens, dark } = useTheme();
  // Negative and non-finite values cannot carry a proportional bar; they are
  // treated as 0 (the consumers devWarn).
  const values = rows.map((r) =>
    Number.isFinite(r.value) && r.value > 0 ? r.value : 0
  );
  const sum = values.reduce((a, b) => a + b, 0);
  const basis = share ? sum : Math.max(0, ...values);
  // The delta column is sized to the longest delta via the estimator so the
  // column aligns by layout; tabular figures are inconsistent across Android
  // fonts and stay a progressive enhancement.
  const deltas = rows.filter((r) => r.delta != null && r.delta !== "");
  const deltaWidth =
    deltas.length > 0
      ? Math.max(
          DELTA_SLOT,
          Math.ceil(
            Math.max(
              ...deltas.map(
                (r) => [...(r.delta as string)].length * 11 * MONO_ADVANCE
              )
            )
          ) + 2
        )
      : 0;

  return (
    <View style={{ gap: bars ? (compact || deltas.length ? 4 : 6) : detailed ? 10 : 8, ...(detailed ? { borderTopWidth: 1, borderColor: tokens.border, paddingTop: 12 } : {}) }}>
      {rows.map((row, i) => {
        const v = values[i];
        const widthPct =
          basis > 0 ? Math.max(0, Math.min(100, (v / basis) * 100)) : 0;
        const sharePct = sum > 0 ? Math.round((v / sum) * 100) : 0;
        const fill = rowFill(tokens, row, i, tone);
        const name = rowAccessibleLabel(
          row,
          share ? sharePct : null,
          formatValue
        );
        const valueText =
          bars && percent
            ? `${sharePct}%`
            : formatValue(Number.isFinite(row.value) ? row.value : 0);
        const valueType = {
          fontFamily: MONO_FONT,
          fontSize: detailed ? s.CHART_LOOK.legendCaptionSize : 12,
          lineHeight: detailed ? 15 : 16,
          fontWeight: "500" as const,
          color: tokens["card-foreground"],
          ...tabularNums(),
        };
        const delta =
          row.delta != null && row.delta !== "" ? (
            <Text
              style={[
                { ...DELTA_TYPE, minWidth: deltaWidth, textAlign: "right" },
                row.steady
                  ? { color: tokens["muted-foreground"] }
                  : deltaTone(tokens, !!row.down),
              ]}
            >
              {row.delta}
            </Text>
          ) : null;
        const inner = bars ? (
          <>
            {/* The share as a wash behind the row. Decorative; the share reaches AT
                through the row's name. */}
            <View
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${widthPct}%`,
                borderRadius: platformShape.web.listBar,
                backgroundColor: alpha(
                  fill,
                  deltas.length ? (dark ? 0.16 : 0.1) : LIST_WASH
                ),
              }}
            />
            <Text
              numberOfLines={1}
              style={{
                flexGrow: 1,
                flexShrink: 1,
                fontFamily: deltas.length ? MONO_FONT : undefined,
                fontSize: deltas.length ? 12 : 13,
                lineHeight: 18,
                color: tokens["card-foreground"],
              }}
            >
              {row.label}
            </Text>
            <Text style={valueType}>{valueText}</Text>
            {delta}
          </>
        ) : (
          <>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                numberOfLines={1}
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  fontSize: 12,
                  lineHeight: detailed ? 15 : 16,
                  color: detailed ? tokens["muted-foreground"] : tokens["card-foreground"],
                }}
              >
                {row.label}
              </Text>
              <Text style={valueType}>
                {formatValue(Number.isFinite(row.value) ? row.value : 0)}
              </Text>
              {percent ? (
                <Text
                  style={{
                    ...SHARE_TYPE,
                    color: tokens["muted-foreground"],
                    ...tabularNums(),
                  }}
                >
                  {sharePct}%
                </Text>
              ) : null}
              {delta}
            </View>
            {/* The proportional meter: a muted pill track, the row-colored share.
                Decorative; the share reaches AT through the row's name. */}
            <View
              style={{
                height: detailed ? 5 : METER_HEIGHT,
                borderRadius: 9999,
                backgroundColor: detailed ? tokens["surface-raised"] : tokens.muted,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: detailed ? 5 : METER_HEIGHT,
                  borderRadius: 9999,
                  backgroundColor: fill,
                  width: `${widthPct}%`,
                }}
              />
            </View>
          </>
        );
        const rowBox = bars
          ? {
              height: compact ? LIST_ROW.compact : LIST_ROW.default,
              flexDirection: "row" as const,
              alignItems: "center" as const,
              gap: 8,
              paddingHorizontal: 10,
            }
          : { gap: detailed ? 5 : 4 };
        if (onPressRow) {
          return (
            <Pressable
              key={row.id ?? i}
              accessibilityRole="button"
              accessibilityLabel={name}
              aria-label={name}
              onPress={() => onPressRow(i)}
              android_ripple={surfaceRipple(tokens)}
              style={({ pressed }) => [rowBox, pressDim(pressed, 0.85)]}
            >
              {inner}
            </Pressable>
          );
        }
        return (
          <View
            key={row.id ?? i}
            accessible
            accessibilityRole="image"
            role="img"
            accessibilityLabel={name}
            aria-label={name}
            style={rowBox}
          >
            {inner}
          </View>
        );
      })}
    </View>
  );
}
