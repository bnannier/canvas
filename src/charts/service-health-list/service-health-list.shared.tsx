import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { View, Text, Pressable, surfaceRipple, pressDim, devWarn, tabularNums, statusColors, type ColorTokens, type LayoutStyle, GlassPane, paneStyle, isGlass } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";
import * as s from "../shared/charts.styles.js";
import { type ChartSkin } from "../shared/types.js";
import { CHART_ROOT } from "../shared/chart-frame.js";
import { periodStatus, statusColor, statusSummary, type UptimePeriod, type PeriodStatus } from "../shared/status-strip.js";

// Shared ServiceHealthList shell. The status-overview card (the v4 hand-off's
// `K.def('service-health-list')`): one row per service, divided by hairlines, of a
// status dot, the service name (14 px), and, when the item carries `periods`, a mini
// uptime strip of its latest 14 periods (4 x 16 px bars 1 px apart at .85), then an
// optional right-aligned detail ("99.98%", 500 12 px mono, muted when operational and
// in the status ink otherwise). It shares the status colours with UptimeBar, so the
// two never drift.
//
// ServiceHealthList is a "Shared" platform treatment (data visualization is
// platform-neutral): the skin carries the same values on every OS.
//
// Boolean-prop API, first-match precedence within an axis:
// - Per-item status: `down` > `degraded` (first match wins; an unmarked
//   service is operational).
// - Density: `compact` tightens the rows (7 px insets instead of 10).
// - Surface: `plain` strips the card surface for nesting (mirrors Stats).

export type { UptimePeriod } from "../shared/status-strip.js";

export interface ServiceHealthItem {
  /** Stable identity, used as the React key when present. */
  id?: string | number;
  /** The service name. Truncates to one line. */
  label: string;
  /** Right-aligned detail (e.g. "99.98% uptime"). */
  detail?: string;
  /** Per-period history; the latest 14 periods render as a mini uptime strip in the row. */
  periods?: UptimePeriod[];
  // Current status (pick one; omit both for operational). Precedence:
  // down > degraded (first match wins).
  down?: boolean;
  degraded?: boolean;
}

export interface ServiceHealthListProps {
  /** The services to render, in order. */
  items: ServiceHealthItem[];
  /** Optional heading shown above the rows. */
  title?: string;
  // Density (omit for the default row insets).
  compact?: boolean;
  /** Strip the card surface for nesting inside an existing card (mirrors Stats). */
  plain?: boolean;
  /** Rows become tappable drill-in targets (open the service) when set. */
  onPressItem?: (index: number) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

const ROW_PAD = { default: 10, compact: 7 } as const;
const STRIP_PERIODS = 14;
const STRIP_BAR = { width: 4, height: 16, gap: 1, opacity: 0.85 } as const;
const DETAIL_WIDTH = 60;

// The detail's ink: the muted ink while operational, else the status's text ink.
function detailInk(tokens: ColorTokens, status: PeriodStatus): string {
  if (status === "down") return statusColors(tokens, "error").ink;
  if (status === "degraded") return statusColors(tokens, "warning").ink;
  return tokens["muted-foreground"];
}

// Item status precedence, first match wins.
export function itemStatus(item: ServiceHealthItem): PeriodStatus {
  if (item.down) return "down";
  if (item.degraded) return "degraded";
  return "operational";
}


export function createServiceHealthList(skin: ChartSkin) {
  return function ServiceHealthList(props: ServiceHealthListProps) {
    const { items, title, testID, style } = props;
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    const surfaceShape = s.surface(tokens, skin.surfaceRadius);
    const glass = isGlass(theme);
    const compact = !!props.compact;

    devWarn(items.length === 0, "[canvas] <ServiceHealthList />: `items` is empty; the list renders with no rows.");

    return (
      <View
        {...(title != null && title !== "" ? { role: "group" as const, accessibilityLabel: `${title} chart`, "aria-label": `${title} chart` } : {})}
        testID={testID}
        style={[
          props.plain ? null : paneStyle(theme, [surfaceShape, compact ? s.surfacePadCompact : s.surfacePadDefault]),
          CHART_ROOT,
          style,
        ]}
      >
        {/* The chart frame is a CONTENT-layer pane under glass (nothing in solid mode). */}
        {glass && !props.plain ? <GlassPane layer="content" shape={surfaceShape} /> : null}
        {title != null && title !== "" ? (
          <Text style={[s.title(tokens), compact ? s.titleCompact : s.titleDefault]}>{title}</Text>
        ) : null}
        <View>
          {items.map((item, i) => {
            const status = itemStatus(item);
            const name = `${item.label}: ${status}${item.detail != null && item.detail !== "" ? `, ${item.detail}` : ""}`;
            const periods = item.periods != null && item.periods.length > 0 ? item.periods : null;
            const summary = periods ? statusSummary(periods, item.label) : null;
            const recent = periods ? periods.slice(-STRIP_PERIODS) : [];
            const rowBox = {
              flexDirection: "row" as const,
              alignItems: "center" as const,
              gap: 10,
              paddingVertical: compact ? ROW_PAD.compact : ROW_PAD.default,
              ...(i > 0 ? { borderTopWidth: 1, borderColor: tokens.border } : null),
            };
            const dot = <View style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: statusColor(tokens, status) }} />;
            const labelText = (
              <Text numberOfLines={1} style={{ flexGrow: 1, flexShrink: 1, fontSize: 14, lineHeight: 20, color: tokens["card-foreground"] }}>
                {item.label}
              </Text>
            );
            // The strip runs oldest to newest along a time axis, so it keeps LTR.
            const strip = periods ? (
              <View style={{ flexDirection: "row", gap: STRIP_BAR.gap, direction: "ltr" }}>
                {recent.map((p, k) => (
                  <View
                    key={p.id ?? k}
                    style={{
                      width: STRIP_BAR.width,
                      height: STRIP_BAR.height,
                      borderRadius: platformShape.web.stripBar,
                      backgroundColor: statusColor(tokens, periodStatus(p)),
                      opacity: STRIP_BAR.opacity,
                    }}
                  />
                ))}
              </View>
            ) : null;
            const detail =
              item.detail != null && item.detail !== "" ? (
                <Text
                  style={{ minWidth: DETAIL_WIDTH, textAlign: "right", fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500", color: detailInk(tokens, status), ...tabularNums() }}
                >
                  {item.detail}
                </Text>
              ) : null;
            if (props.onPressItem) {
              // The whole row is the drill-in target; its name carries the strip's tally.
              const pressName = summary ? `${name}; ${summary}` : name;
              return (
                <Pressable
                  key={item.id ?? i}
                  accessibilityRole="button"
                  accessibilityLabel={pressName}
                  aria-label={pressName}
                  onPress={() => props.onPressItem?.(i)}
                  android_ripple={surfaceRipple(tokens)}
                  style={({ pressed }) => [rowBox, pressDim(pressed, 0.85)]}
                >
                  {dot}
                  {labelText}
                  {strip}
                  {detail}
                </Pressable>
              );
            }
            return (
              <View key={item.id ?? i} style={rowBox}>
                {/* The service's composed name; the strip carries its own tally. */}
                <View accessible accessibilityRole="image" role="img" accessibilityLabel={name} aria-label={name} style={{ flexDirection: "row", alignItems: "center", gap: 10, flexGrow: 1, flexShrink: 1 }}>
                  {dot}
                  {labelText}
                </View>
                {strip && summary ? (
                  <View accessible accessibilityRole="image" role="img" accessibilityLabel={summary} aria-label={summary}>
                    {strip}
                  </View>
                ) : null}
                {detail ? (
                  <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    {detail}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    );
  };
}
